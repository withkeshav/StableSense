import { describe, expect, it } from 'vitest';
import { generateCurrentAlerts, alertSummary, isRecentAlert } from './alert-policy.js';
import { generateAlerts, rankChainFlows } from './derive.js';
const NOW = Date.UTC(2026, 10, 5, 12);
const HOUR = 3600000;
const token = (ts, value) => ({ date: ts / 1000, circulating: { peggedUSD: value } });
const spot = (price, ts = NOW) => ({ cgSimple: { tether: { usd: price, last_updated_at: ts / 1000 } } });
const chain = (current, previous, ts = NOW, prevTs = NOW - 24 * HOUR) => ({ tokens: [token(prevTs, previous), token(ts, current)] });
describe('current alert policy', () => {
  it.each([[0.99904, null], [0.99897, 'WARNING'], [0.998, 'HIGH'], [0.99504, 'HIGH'], [0.995, 'CRITICAL'], [1.005, 'CRITICAL']])('uses full price precision for %s', (price, severity) => {
    const alerts = generateCurrentAlerts(spot(price), NOW);
    expect(alerts[0]?.severity ?? null).toBe(severity);
  });
  it('rejects old, missing and future price observations even at a severe deviation', () => {
    for (const ts of [NOW - 3 * HOUR, 0, NOW + HOUR]) expect(generateCurrentAlerts(spot(0.9, ts), NOW)).toEqual([]);
  });
  it('retains a fresh critical price warning even if supply coverage is incomplete', () => {
    expect(generateCurrentAlerts({ ...spot(0.99), coverage: { complete: false } }, NOW)[0].severity).toBe('CRITICAL');
  });
  it('does not keep old source events current merely because the browser checked again', () => {
    const data = spot(0.99);
    const first = generateCurrentAlerts(data, NOW);
    expect(generateCurrentAlerts(data, NOW + HOUR)[0].id).toBe(first[0].id);
    expect(generateCurrentAlerts(data, NOW + 2 * HOUR)).toEqual([]);
  });
  it('withholds supply warnings for stale, sparse, incomplete and mismatched windows', () => {
    const samples = [
      { usdtDetail: { chainBalances: { eth: chain(5e9, 1e9, NOW - 30 * HOUR, NOW - 54 * HOUR) } } },
      { usdtDetail: { chainBalances: { eth: chain(5e9, 1e9, NOW, NOW - 72 * HOUR) } } },
      { coverage: { complete: false }, usdtDetail: { chainBalances: { eth: chain(5e9, 1e9) } } },
    ];
    for (const data of samples) expect(generateCurrentAlerts(data, NOW)).toEqual([]);
    const data = { daiDetail: { chainBalances: { eth: chain(2e9, 1e9), poly: chain(1e9, 2e9, NOW - 3 * HOUR, NOW - 27 * HOUR) } } };
    expect(generateCurrentAlerts(data, NOW).some((a) => a.rule === 'MIGRATION')).toBe(false);
  });
  it('does not infer a coin-wide mint from only part of its chains', () => {
    const data = { usdtDetail: { chainBalances: { eth: chain(5e9, 1e9), tron: { tokens: [token(NOW, 2e9)] } } } };
    expect(generateAlerts(data).some((a) => a.rule === 'NET_MINT')).toBe(false);
  });
  it('keeps matching flows as neutral activity and never calls them a verified transfer', () => {
    const data = { daiDetail: { chainBalances: { eth: chain(2e9, 1e9), poly: chain(1e9, 2e9) } } };
    const alerts = generateCurrentAlerts(data, NOW);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({ rule: 'MIGRATION', severity: 'INFO' });
    expect(alerts[0].headline).not.toContain('liquidity moved');
    expect(alertSummary(alerts)).toEqual({ count: 0, tone: 'neutral' });
  });
  it('does not color a large supply change red without critical price evidence', () => {
    const data = { usdtDetail: { chainBalances: { eth: chain(7e9, 1e9) } } };
    expect(alertSummary(generateCurrentAlerts(data, NOW)).tone).toBe('warning');
  });
  it('reserves red for critical warnings and excludes activity from badge counts', () => {
    expect(alertSummary([{ severity: 'WARNING' }, { severity: 'INFO' }])).toEqual({ count: 1, tone: 'warning' });
    expect(alertSummary([{ severity: 'CRITICAL' }])).toEqual({ count: 1, tone: 'critical' });
  });
  it('does not let a 72h change enter a 24h chart or stress contribution', () => {
    const flows = rankChainFlows({ USDT: { chainBalances: { eth: chain(9e9, 1e9, NOW, NOW - 72 * HOUR) } } });
    expect(flows[0].totalDelta).toBeNull();
  });
});

describe('24-hour alert visibility', () => {
  it('expires at 24 hours using evidence time, not a newer fetch or resolution', () => {
    expect(isRecentAlert({ observedAt: NOW - 24 * HOUR + 1 }, NOW)).toBe(true);
    expect(isRecentAlert({ observedAt: NOW - 24 * HOUR, timestamp: NOW, updatedAt: NOW }, NOW)).toBe(false);
    expect(isRecentAlert({ timestamp: NOW - HOUR }, NOW)).toBe(true);
    for (const observedAt of [0, NaN, NOW + 1]) expect(isRecentAlert({ observedAt }, NOW)).toBe(false);
  });
  it('expires supply warnings unless fresh evidence supports them', () => {
    const data = { usdtDetail: { chainBalances: { eth: chain(7e9, 1e9) } } };
    expect(generateCurrentAlerts(data, NOW + 23 * HOUR).length).toBeGreaterThan(0);
    expect(generateCurrentAlerts(data, NOW + 24 * HOUR)).toEqual([]);
    const refreshed = { usdtDetail: { chainBalances: { eth: chain(7e9, 1e9, NOW + 24 * HOUR, NOW) } } };
    expect(generateCurrentAlerts(refreshed, NOW + 24 * HOUR).length).toBeGreaterThan(0);
  });
});
