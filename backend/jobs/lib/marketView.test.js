import { describe, expect, it } from 'vitest';
import { buildMarketView } from './marketView.js';

const T0 = 1_786_000_000_000;

function price(coin, ts, value, change = null) {
  return { coin, ts, price: value, change24h: change };
}

function snap(coin, chain, ts, supply, delta = null) {
  return { coin, chain, ts, circulatingUsd: supply, delta24h: delta };
}

describe('buildMarketView', () => {
  it('assembles per-coin payload with sums and newest rows', () => {
    const out = buildMarketView({
      priceRows: [price('USDT', T0, 1.0001, 0.01), price('USDC', T0, 0.9999, -0.01)],
      snapshotRows: [
        snap('USDT', 'ethereum', T0, 60_000, 100),
        snap('USDT', 'tron', T0, 40_000, -50),
        snap('USDC', 'ethereum', T0, 30_000, 10),
      ],
      marketRow: { ts: T0, total: 130_000, delta: 60 },
      nowMs: T0 + 1000,
    });
    expect(out.generatedAt).toBe(T0 + 1000);
    expect(out.source).toBe('helix-via-cron');
    expect(out.observedAt).toBe(T0);
    expect(out.market).toEqual({ totalCirculatingUsd: 130_000, delta24hUsd: 60, ts: T0 });
    const usdt = out.coins.find((c) => c.symbol === 'USDT');
    expect(usdt.name).toBe('Tether USD');
    expect(usdt.price).toBe(1.0001);
    expect(usdt.change24h).toBe(0.01);
    expect(usdt.supply).toBe(100_000);
    expect(usdt.supplyDelta24h).toBe(50);
    expect(usdt.depegIndex).toBe(null);
    expect(usdt.chains).toHaveLength(2);
    expect(out.dataQuality).toContainEqual({ coin: 'DAI', reason: 'no prices row' });
    expect(out.dataQuality).toContainEqual({ coin: 'DAI', reason: 'no snapshot rows' });
  });

  it('picks the newest row per coin, chain, and price', () => {
    const out = buildMarketView({
      priceRows: [price('USDT', T0 - 600_000, 0.5), price('USDT', T0, 1.0)],
      snapshotRows: [
        snap('USDT', 'ethereum', T0 - 600_000, 1, 1),
        snap('USDT', 'ethereum', T0, 60_000, 100),
      ],
      marketRow: null,
      nowMs: T0,
    });
    const usdt = out.coins.find((c) => c.symbol === 'USDT');
    expect(usdt.price).toBe(1.0);
    expect(usdt.supply).toBe(60_000);
    expect(usdt.chains).toHaveLength(1);
  });

  it('supports ?symbol= single-coin mode', () => {
    const out = buildMarketView({
      priceRows: [price('USDT', T0, 1.0), price('USDC', T0, 1.0)],
      snapshotRows: [snap('USDT', 'ethereum', T0, 10, 1), snap('USDC', 'ethereum', T0, 20, 2)],
      marketRow: { ts: T0, total: 30, delta: 3 },
      nowMs: T0,
      symbol: 'usdt',
    });
    expect(out.coins.map((c) => c.symbol)).toEqual(['USDT']);
    expect(out.dataQuality).toEqual([]);
  });

  it('returns coins [] with reasons when tables are empty', () => {
    const out = buildMarketView({ priceRows: [], snapshotRows: [], marketRow: null, nowMs: T0 });
    expect(out.coins).toEqual([]);
    expect(out.dataQuality).toHaveLength(5);
    expect(out.observedAt).toBe(null);
    expect(out.market).toEqual({ totalCirculatingUsd: null, delta24hUsd: null, ts: null });
  });

  it('preserves nulls for missing price and delta fields', () => {
    const out = buildMarketView({
      priceRows: [price('USDT', T0, null)],
      snapshotRows: [snap('USDT', 'ethereum', T0, 60_000, null)],
      marketRow: { ts: T0, total: 60_000, delta: null },
      nowMs: T0,
      symbol: 'USDT',
    });
    const usdt = out.coins[0];
    expect(usdt.price).toBe(null);
    expect(usdt.supplyDelta24h).toBe(null);
    expect(usdt.chains[0].delta24h).toBe(null);
    expect(out.market.delta24hUsd).toBe(null);
  });
});
