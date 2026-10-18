import { describe, expect, it } from 'vitest';
import { buildChainFlowBars, buildDominanceSeries } from './graphs.js';

const M = 1e6;

describe('buildChainFlowBars', () => {
  const flows = [
    { chain: 'Ethereum', totalDelta: 500 * M, deltas: { USDT: 300 * M, USDC: 200 * M } },
    { chain: 'Tron', totalDelta: -900 * M, deltas: { USDT: -900 * M, USDC: 0 } },
    { chain: 'Solana', totalDelta: 100 * M, deltas: { USDT: 100 * M, USDC: 0 } },
    { chain: 'Base', totalDelta: -50 * M, deltas: { USDT: -50 * M, USDC: 0 } },
  ];

  it('uses totalDelta for the all filter and sorts by magnitude descending', () => {
    const bars = buildChainFlowBars(flows, 'all');
    expect(bars.labels).toEqual(['Tron', 'Ethereum', 'Solana', 'Base']);
    expect(bars.values).toEqual([-900 * M, 500 * M, 100 * M, -50 * M]);
    expect(bars.totalAbs).toBe(1550 * M);
    expect(bars.complete).toBe(true);
    expect(bars.coin).toBe('all');
  });

  it('uses deltas[symbol] for a single coin', () => {
    const bars = buildChainFlowBars(flows, 'USDC');
    expect(bars.labels[0]).toBe('Ethereum');
    expect(bars.values[0]).toBe(200 * M);
    expect(bars.coin).toBe('USDC');
  });

  it('drops null, undefined and non-finite values and marks the result incomplete', () => {
    const partial = [
      { chain: 'A', totalDelta: 10, deltas: { USDT: 10 } },
      { chain: 'B', totalDelta: null, deltas: {} },
      { chain: 'C', totalDelta: NaN, deltas: { USDT: NaN } },
    ];
    const bars = buildChainFlowBars(partial, 'USDT');
    expect(bars.labels).toEqual(['A']);
    expect(bars.values).toEqual([10]);
    expect(bars.totalAbs).toBe(10);
    expect(bars.complete).toBe(false);
  });

  it('marks the all view incomplete when a flow reports a missing reading', () => {
    const partial = [
      { chain: 'A', totalDelta: 10, deltas: { USDT: 10 }, missing: true },
      { chain: 'B', totalDelta: 5, deltas: { USDT: 5 } },
    ];
    const bars = buildChainFlowBars(partial, 'all');
    expect(bars.labels).toEqual(['A', 'B']);
    expect(bars.complete).toBe(false);
  });

  it('caps the bar count at the requested limit', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      chain: `C${i}`,
      totalDelta: (i + 1) * M,
      deltas: { USDT: (i + 1) * M },
    }));
    const bars = buildChainFlowBars(many, 'all', 3);
    expect(bars.labels).toEqual(['C9', 'C8', 'C7']);
    expect(bars.values).toEqual([10 * M, 9 * M, 8 * M]);
  });

  it('returns an empty, zeroed shape when nothing is measured', () => {
    expect(buildChainFlowBars([], 'all')).toEqual({
      labels: [],
      values: [],
      totalAbs: 0,
      complete: true,
      coin: 'all',
    });
    const none = buildChainFlowBars([{ chain: 'A', totalDelta: null, deltas: {} }], 'all');
    expect(none.labels).toEqual([]);
    expect(none.values).toEqual([]);
    expect(none.totalAbs).toBe(0);
    expect(none.complete).toBe(false);
  });
});

describe('buildDominanceSeries', () => {
  const coins = [
    { symbol: 'USDT', color: '#22c55e' },
    { symbol: 'USDC', color: '#3b82f6' },
  ];
  const D1 = Date.UTC(2026, 6, 1);
  const D2 = Date.UTC(2026, 6, 2);

  it('returns null for fewer than two coins or fewer than two dates', () => {
    expect(buildDominanceSeries({}, [coins[0]])).toBeNull();
    expect(buildDominanceSeries({}, coins)).toBeNull();
    expect(buildDominanceSeries(null, coins)).toBeNull();
  });

  it('keeps only dates where every coin has a finite value', () => {
    const supplyByCoin = {
      USDT: [{ ts: D1, value: 60 }, { ts: D2, value: 70 }],
      USDC: [{ ts: D1, value: 40 }],
    };
    // D2 has no USDC reading, so only D1 survives and one date is not enough.
    expect(buildDominanceSeries(supplyByCoin, coins)).toBeNull();
  });

  it('does not treat a missing value as zero', () => {
    const supplyByCoin = {
      USDT: [{ ts: D1, value: 60 }, { ts: D2, value: 70 }],
      USDC: [{ ts: D1, value: 40 }, { ts: D2, value: null }],
    };
    expect(buildDominanceSeries(supplyByCoin, coins)).toBeNull();
  });

  it('builds aligned, ascending share datasets that sum to 100', () => {
    const supplyByCoin = {
      USDC: [{ ts: D2, value: 30 }, { ts: D1, value: 40 }],
      USDT: [{ ts: D1, value: 60 }, { ts: D2, value: 70 }],
    };
    const dom = buildDominanceSeries(supplyByCoin, coins);
    expect(dom).not.toBeNull();
    expect(dom.labels).toEqual(['Jul 1', 'Jul 2']);
    expect(dom.dates).toEqual([D1, D2]);
    expect(dom.datasets).toHaveLength(2);
    expect(dom.datasets[0].data).toEqual([60, 70]);
    expect(dom.datasets[1].data).toEqual([40, 30]);
    expect(dom.datasets[0]).toMatchObject({ fill: true, tension: 0.2, pointRadius: 0 });
    expect(typeof dom.datasets[0].backgroundColor).toBe('string');
    expect(dom.latest).toEqual([
      { symbol: 'USDT', share: 70 },
      { symbol: 'USDC', share: 30 },
    ]);
    const sum = dom.latest.reduce((acc, s) => acc + s.share, 0);
    expect(sum).toBeCloseTo(100, 6);
  });

  it('normalizes second-resolution timestamps to milliseconds', () => {
    const supplyByCoin = {
      USDT: [{ date: D1 / 1000, value: 60 }, { date: D2 / 1000, value: 70 }],
      USDC: [{ date: D1 / 1000, value: 40 }, { date: D2 / 1000, value: 30 }],
    };
    const dom = buildDominanceSeries(supplyByCoin, coins);
    expect(dom.dates).toEqual([D1, D2]);
  });
});
