import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { getActiveCoins } from '../../src/utils/coin-config.js';
import { readMarketView } from '../lib/market-read.js';
import { buildNarrativeInput, narrativeIsCurrent, CONTEXT_VERSION } from './lib/aiContext.js';
import { aiConfiguration, recordedCompletion } from '../lib/ai-attempt.js';

const NOW = Date.UTC(2026, 10, 5, 12);
const HOUR = 3600000;
let db, buildContext, tempDir, previousDir;
beforeAll(async () => {
  previousDir = process.env.DATA_DIR;
  tempDir = mkdtempSync(path.join(tmpdir(), 'stablesense-ai-'));
  process.env.DATA_DIR = tempDir;
  ({ buildContext } = await import('./ai.js'));
  db = (await import('../lib/db.js')).default;
});
beforeEach(() => {
  for (const table of ['ai_attempts', 'chain_batches', 'prices', 'snapshots', 'market_snapshots', 'labels', 'alert_events', 'stress_series']) db.prepare(`DELETE FROM ${table}`).run();
});
afterAll(() => {
  db.close();
  if (previousDir === undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR = previousDir;
  rmSync(tempDir, { recursive: true, force: true });
});
function seed() {
  for (const coin of getActiveCoins()) {
    const rows = [{ chain: 'ethereum', ts: NOW - HOUR, prevTs: NOW - 25 * HOUR, circulating: 100, delta: 0 }];
    db.prepare('INSERT INTO chain_batches VALUES (?, ?, ?, ?, ?)').run(coin.symbol, 'helix-v2', NOW, 1, JSON.stringify(rows));
    db.prepare('INSERT INTO prices (coin, ts, price) VALUES (?, ?, ?)').run(coin.symbol, NOW, 1);
  }
}
function replaceRows(rows) { db.prepare('UPDATE chain_batches SET rows_json = ? WHERE coin = ?').run(JSON.stringify(rows), 'USDT'); }

describe('AI request accounting', () => {
  const settings = { OPENAI_BASE_URL: 'https://provider.example/v1', OPENAI_MODEL: 'approved-model', OPENAI_API_KEY: 'test-only' };
  const context = { text: 'fixture facts', meta: { contextVersion: CONTEXT_VERSION } };
  function attempt(fetchImpl, extra = {}) {
    return recordedCompletion({ db, config: aiConfiguration({ ...settings, ...extra }),
      model: settings.OPENAI_MODEL, context, system: 'fixture instructions', fetchImpl, now: () => NOW });
  }
  it('requires explicit provider/model and rejects unsafe configuration', () => {
    expect(() => aiConfiguration({})).toThrow('Explicit');
    expect(() => aiConfiguration({ ...settings, OPENAI_BASE_URL: 'http://remote.example' })).toThrow('HTTPS');
    expect(() => aiConfiguration({ ...settings, AI_DAILY_REQUEST_LIMIT: 'invalid' })).toThrow('nonnegative');
    expect(aiConfiguration(settings).dailyLimit).toBeNull();
  });
  it('stores only provider-reported tokens and a fingerprint of inputs', async () => {
    await attempt(async () => ({ ok: true, status: 200, json: async () => ({
      usage: { prompt_tokens: 12, completion_tokens: 4, total_tokens: 16 },
      choices: [{ message: { content: 'fixture response' } }],
    }) }));
    const row = db.prepare('SELECT * FROM ai_attempts').get();
    expect(row).toMatchObject({ outcome: 'response_received', prompt_tokens: 12, completion_tokens: 4,
      total_tokens: 16, task: 'educational_narrative', provider: 'https://provider.example' });
    expect(row.input_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(row)).not.toContain('test-only');
    expect(JSON.stringify(row)).not.toContain('fixture facts');
  });
  it('counts failed attempts toward the cap without inventing token usage', async () => {
    await expect(attempt(async () => { throw new Error('timeout'); }, { AI_DAILY_REQUEST_LIMIT: '1' })).rejects.toThrow('timeout');
    let called = false;
    await expect(attempt(async () => { called = true; }, { AI_DAILY_REQUEST_LIMIT: '1' })).rejects.toThrow('limit reached');
    expect(called).toBe(false);
    expect(db.prepare('SELECT * FROM ai_attempts').get()).toMatchObject({ outcome: 'failed', total_tokens: null });
  });
  it('keeps unknown usage unknown on a successful response', async () => {
    await attempt(async () => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content: 'answer' } }] }) }));
    expect(db.prepare('SELECT total_tokens FROM ai_attempts').get().total_tokens).toBeNull();
  });
  it('records usage even when the provider returns empty content', async () => {
    await expect(attempt(async () => ({ ok: true, status: 200, json: async () => ({ usage: { total_tokens: 7 }, choices: [] }) }))).rejects.toThrow('empty');
    expect(db.prepare('SELECT outcome, total_tokens FROM ai_attempts').get()).toEqual({ outcome: 'failed', total_tokens: 7 });
  });
});

describe('AI input shares the dashboard market read', () => {
  it('imports without generating or saving a narrative', () => {
    expect(db.prepare('SELECT count(*) n FROM intelligence').get().n).toBe(0);
    expect(db.prepare('SELECT count(*) n FROM job_runs').get().n).toBe(0);
  });
  it('states tracked scope and separate source clocks, including measured zero change', () => {
    seed();
    const result = buildContext(db, NOW);
    expect(result.ready).toBe(true);
    expect(result.text).toContain('exactly 5 tracked USD-pegged coins');
    expect(result.text).toContain('not the global stablecoin market');
    expect(result.text).toContain('covered chains: $500.00. Net 24h supply-value change: $0.00');
    expect(result.meta.spotObservedAt).toBe(NOW);
    expect(result.meta.supplyObservedAt).toBe(NOW - HOUR);
    expect(result).toEqual(buildNarrativeInput(readMarketView(db, { nowMs: NOW }), NOW));
  });
  it('sums every covered chain, while explicitly labeling the largest three as a subset', () => {
    seed();
    replaceRows(Array.from({ length: 6 }, (_, i) => ({ chain: `chain${i}`, ts: NOW, prevTs: NOW - 24 * HOUR, circulating: (i + 1) * 100, delta: 0 })));
    const { text } = buildContext(db, NOW);
    expect(text).toContain('USDT: all 6 covered chains total $2100.00');
    expect(text).toContain('covered chains: $2500.00');
    expect(text).toContain('Largest three chains for USDT (subset, not the coin total)');
  });
  it('ignores obsolete aggregate rows, chain history, stress scores and old event labels', () => {
    seed();
    db.prepare('INSERT INTO market_snapshots VALUES (?, ?, ?)').run(NOW, 999999, 888888);
    db.prepare('INSERT INTO snapshots VALUES (?, ?, ?, ?, ?)').run('USDT', 'retired', NOW, 777777, 1);
    db.prepare('INSERT INTO labels VALUES (?, ?, ?, ?, ?, ?)').run(NOW, 'USDT', 'depeg', 'critical', 'Historical crisis', 666666);
    db.prepare('INSERT INTO stress_series VALUES (?, ?, ?, ?, ?, ?)').run(NOW, 'USDT', 99, 9, 1, 1);
    const { text } = buildContext(db, NOW);
    expect(text).toContain('Peg Stress Index: 0/100');
    expect(text).toContain('Current deterministic dashboard alerts: 0');
    expect(text).not.toMatch(/999999|888888|777777|666666|Historical crisis|99\/100/);
    expect(text).toContain('No z-score is supplied');
  });
  it('derives current price alerts instead of reading stored incident state', () => {
    seed();
    db.prepare('UPDATE prices SET price = 0.98 WHERE coin = ?').run('USDT');
    const { text } = buildContext(db, NOW);
    expect(text).toContain('PEG_BREAK');
    expect(text).toContain('CRITICAL');
  });
  it('does not label a sparse comparison as 24h', () => {
    seed(); replaceRows([{ chain: 'ethereum', ts: NOW, prevTs: NOW - 72 * HOUR, circulating: 100, delta: 5 }]);
    expect(buildContext(db, NOW).text).toContain('Net 24h supply-value change: unavailable');
  });
  it.each(['missing-price', 'partial', 'stale-price', 'stale-supply', 'corrupt-batch'])('refuses generation with %s', (kind) => {
    seed();
    if (kind === 'missing-price') db.prepare('DELETE FROM prices WHERE coin = ?').run('USDT');
    if (kind === 'partial') db.prepare('UPDATE chain_batches SET complete = 0 WHERE coin = ?').run('USDT');
    if (kind === 'stale-price') db.prepare('UPDATE prices SET ts = ?').run(NOW - 3 * HOUR);
    if (kind === 'stale-supply') replaceRows([{ chain: 'ethereum', ts: NOW - 30 * HOUR, circulating: 100 }]);
    if (kind === 'corrupt-batch') db.prepare('UPDATE chain_batches SET rows_json = ?').run('broken json');
    expect(buildContext(db, NOW).ready).toBe(false);
  });
  it('does not manufacture a market when storage is empty', () => {
    expect(buildContext(db, NOW).ready).toBe(false);
  });
});

describe('narrative serving freshness', () => {
  const row = (meta = {}) => ({ ts: NOW, meta: JSON.stringify({ contextVersion: CONTEXT_VERSION, spotObservedAt: NOW, supplyObservedAt: NOW - HOUR, ...meta }) });
  it('accepts a recent narrative grounded in current source readings', () => expect(narrativeIsCurrent(row(), NOW)).toBe(true));
  it('rejects old-context and unparseable metadata', () => {
    expect(narrativeIsCurrent(row({ contextVersion: 1 }), NOW)).toBe(false);
    expect(narrativeIsCurrent({ ts: NOW, meta: 'broken' }, NOW)).toBe(false);
  });
  it('rejects expired generation, old source readings and future source times', () => {
    expect(narrativeIsCurrent({ ...row(), ts: NOW - 2 * HOUR }, NOW)).toBe(false);
    expect(narrativeIsCurrent(row({ spotObservedAt: NOW - 3 * HOUR }), NOW)).toBe(false);
    expect(narrativeIsCurrent(row({ supplyObservedAt: NOW - 30 * HOUR }), NOW)).toBe(false);
    expect(narrativeIsCurrent(row({ spotObservedAt: NOW + HOUR }), NOW)).toBe(false);
  });
});

describe('model response validation', () => {
  it('rejects prose and incomplete JSON instead of saving it as a headline', async () => {
    const { parseNarrative } = await import('./lib/aiContext.js');
    expect(() => parseNarrative('The market is fine')).toThrow();
    expect(() => parseNarrative('{"headline":"Fine"}')).toThrow();
    expect(parseNarrative('```json\n{"headline":"Tracked coins", "narrative":"Dated readings", "implications":"Limited scope"}\n```')).toEqual({ headline: 'Tracked coins', narrative: 'Dated readings', implications: 'Limited scope' });
  });
});
