import { describe, expect, it } from 'vitest';
import { buildSupplyHistory } from './marketView.js';

const DAY = 86_400_000;
const SEP8 = Date.parse('2026-09-08T00:00:00Z');
const SEP7 = Date.parse('2026-09-07T00:00:00Z');
const SEP6 = Date.parse('2026-09-06T00:00:00Z');

function rows() {
  return [
    // Sep 8 daily-layer era rows (ts exactly midnight UTC)
    { coin: 'USDT', chain: 'ethereum', ts: SEP8, circulatingUsd: 100e9 },
    { coin: 'USDT', chain: 'tron', ts: SEP8, circulatingUsd: 83e9 },
    // Same day, later 10-min-layer rows: casing split ('Tron' vs 'tron')
    { coin: 'USDT', chain: 'ethereum', ts: SEP8 + 63_000_000, circulatingUsd: 91.6e9 },
    { coin: 'USDT', chain: 'Tron', ts: SEP8 + 62_000_000, circulatingUsd: 91.7e9 },
    // Sep 7: 10-min-era rows only, with casing duplicate
    { coin: 'USDT', chain: 'ethereum', ts: SEP7 + 50_400_000, circulatingUsd: 50e9 },
    { coin: 'USDT', chain: 'Tron', ts: SEP7 + 50_400_000, circulatingUsd: 33e9 },
    { coin: 'USDT', chain: 'tron', ts: SEP7 + 46_800_000, circulatingUsd: 33.4e9 },
    // Sep 6: a chain whose only row has no value -> day must be omitted
    { coin: 'USDT', chain: 'ethereum', ts: SEP6 + 3_600_000, circulatingUsd: null },
  ];
}

describe('buildSupplyHistory', () => {
  it('keeps era rows only when a day mixes daily and intraday layers', () => {
    const out = buildSupplyHistory(rows(), 30);
    const sep8 = out.USDT.find((p) => p.ts === SEP8);
    expect(sep8.value).toBe(183e9);
  });

  it('normalizes chain casing and keeps the newest row per chain-day', () => {
    const out = buildSupplyHistory(rows(), 30);
    const sep7 = out.USDT.find((p) => p.ts === SEP7);
    // 'Tron' 33e9 has the NEWEST ts for the tron-day key, so casing dedupe
    // keeps 33e9 (not the older 33.4e9); total = 50e9 + 33e9.
    expect(sep7.value).toBeCloseTo(83e9, 3);
  });

  it('emits one point per UTC day, sorted ascending', () => {
    const out = buildSupplyHistory(rows(), 30);
    const days = out.USDT.map((p) => p.ts);
    expect(days).toEqual([...days].sort((a, b) => a - b));
    expect(new Set(days).size).toBe(days.length);
  });

  it('drops days with no numeric values and honors the day window', () => {
    const out = buildSupplyHistory(rows(), 30);
    expect(out.USDT.find((p) => p.ts === SEP6)).toBeUndefined();
    const old = [{ coin: 'USDT', chain: 'ethereum', ts: SEP8 - 40 * DAY, circulatingUsd: 1e9 }];
    expect(buildSupplyHistory(old, 30).USDT).toBeUndefined();
    expect(buildSupplyHistory(old, 45).USDT).toHaveLength(1);
  });
});
