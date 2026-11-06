import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { insightCoins, readHelixInsights, syncHelixInsights, validateInsights } from '../lib/helix-insights.js';

const NOW = Date.UTC(2026, 10, 6, 12);
const HOUR = 3600000;
let db, tempDir, previousDir;
beforeAll(async () => {
  previousDir = process.env.DATA_DIR;
  tempDir = mkdtempSync(path.join(tmpdir(), 'stablesense-insights-'));
  process.env.DATA_DIR = tempDir;
  await import('./ai.js');
  db = (await import('../lib/db.js')).default;
});
beforeEach(() => db.prepare('DELETE FROM helix_insights').run());
afterAll(() => {
  db.close();
  if (previousDir === undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR = previousDir;
  rmSync(tempDir, { recursive: true, force: true });
});
function payload() {
  return { source: 'helix', generation_policy: 'stored_only', insights: insightCoins().map((asset, i) => ({
    asset, available: true, id: i + 1, source: 'helix', feature: 'market_narrative',
    narrative: `Test commentary for ${asset}`, model: 'fixture-model',
    generated_at: new Date(NOW - HOUR).toISOString(), valid_until: new Date(NOW + HOUR).toISOString(),
  })) };
}
async function sync(body = payload(), fetchImpl) {
  return syncHelixInsights({ db, now: () => NOW, env: { HELIX_API_KEY: 'fixture-only', OPENAI_API_KEY: 'unused' },
    fetchImpl: fetchImpl || (async () => ({ ok: true, json: async () => body })) });
}
it('imports the job without generating or scheduling work', () => {
  expect(db.prepare('SELECT count(*) n FROM job_runs').get().n).toBe(0);
});
it('reads Helix once with server-side auth, preserves its original time and never calls a model', async () => {
  const calls = [];
  await sync(payload(), async (url, options) => {
    calls.push(url);
    expect(options.headers.authorization).toBe('Bearer fixture-only');
    expect(options.redirect).toBe('error');
    return { ok: true, json: async () => payload() };
  });
  expect(calls).toHaveLength(1);
  expect(calls[0]).toContain('https://helix.withkeshav.com/api/v2/narratives?assets=');
  const result = readHelixInsights(db, NOW);
  expect(result.insights).toHaveLength(insightCoins().length);
  expect(result.insights[0].ts).toBe(NOW - HOUR);
  expect(readHelixInsights(db, NOW + HOUR).insights).toEqual([]);
});
it('keeps last good stored insights on network or invalid response failure', async () => {
  await sync();
  const before = readHelixInsights(db, NOW);
  await expect(sync(null, async () => { throw new Error('offline'); })).rejects.toThrow('offline');
  const broken = payload(); broken.insights.pop();
  await expect(sync(broken)).rejects.toThrow('Incomplete');
  expect(readHelixInsights(db, NOW)).toEqual(before);
});
it('does not serve legacy or expired commentary as a fresh insight', async () => {
  const expired = payload();
  expired.insights.forEach(i => { i.generated_at = new Date(NOW - 3 * HOUR).toISOString(); i.valid_until = new Date(NOW - HOUR).toISOString(); });
  await sync(expired);
  expect(readHelixInsights(db, NOW).insights).toEqual([]);
});
it('clears commentary explicitly reported unavailable', async () => {
  await sync();
  await sync({ source: 'helix', generation_policy: 'stored_only', insights: insightCoins().map(asset => ({ asset, available: false })) });
  expect(readHelixInsights(db, NOW).insights).toEqual([]);
});
it.each(['duplicate', 'wrong-asset', 'future', 'extended-expiry', 'empty', 'missing-clock', 'null'])('rejects malformed %s payloads atomically', async kind => {
  await sync();
  const body = payload(); const i = body.insights[0];
  if (kind === 'duplicate') body.insights.push(i);
  if (kind === 'wrong-asset') i.asset = 'BTC';
  if (kind === 'future') i.generated_at = new Date(NOW + 1000).toISOString();
  if (kind === 'extended-expiry') i.valid_until = new Date(NOW + 5 * HOUR).toISOString();
  if (kind === 'empty') i.narrative = '';
  if (kind === 'missing-clock') delete i.generated_at;
  if (kind === 'null') body.insights[0] = null;
  expect(() => validateInsights(body, insightCoins(), NOW)).toThrow();
  await expect(sync(body)).rejects.toThrow();
  expect(readHelixInsights(db, NOW).insights).toHaveLength(insightCoins().length);
});
it('fails closed without a service key or with an unsafe URL', async () => {
  await expect(syncHelixInsights({ db, env: {} })).rejects.toThrow('HELIX_API_KEY');
  await expect(syncHelixInsights({ db, env: { HELIX_API_KEY: 'test', HELIX_API_BASE: 'http://remote.example' } })).rejects.toThrow('HTTPS');
});
