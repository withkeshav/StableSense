import { describe, expect, it } from 'vitest';
import {
  buildMarketSnapshot,
  extractChainSeries,
  findPointClosestTo24hAgo,
  mapChainRows,
  mapPriceRow,
  selectNewestPoint,
  toMs,
} from './helixMap.js';

const T0 = Date.parse('2026-08-01T00:00:00.000Z');

function trendPoint(offsetMs, supply, price = 1.0) {
  return {
    timestamp: T0 + offsetMs,
    total_supply: supply,
    price,
    depeg_index: 0,
    signal_score: 0,
    signal_band: 'neutral',
    concentration_score: 0,
    data_confidence: 'high',
  };
}

function trendsFixture() {
  return {
    asset: 'USDT',
    window: '7d',
    generated_at: new Date(T0 + 7 * 86400000).toISOString(),
    points: [
      trendPoint(0, 1000),
      trendPoint(12 * 3600000, 1100),
      trendPoint(30 * 3600000, 1300),
    ],
    summary: {},
  };
}

describe('toMs', () => {
  it('passes through epoch ms and converts epoch seconds', () => {
    expect(toMs(T0)).toBe(T0);
    expect(toMs(Math.floor(T0 / 1000))).toBe(T0);
    expect(toMs(new Date(T0).toISOString())).toBe(T0);
    expect(toMs('nope')).toBe(null);
  });
});

describe('selectNewestPoint', () => {
  it('picks the last (newest) point from an oldest-first array', () => {
    const trends = trendsFixture();
    const newest = selectNewestPoint(trends.points);
    expect(newest.total_supply).toBe(1300);
    expect(toMs(newest.timestamp)).toBe(T0 + 30 * 3600000);
  });

  it('picks max timestamp when input is unsorted', () => {
    const pts = [trendPoint(5000, 2), trendPoint(1000, 1), trendPoint(9000, 3)];
    expect(selectNewestPoint(pts).total_supply).toBe(3);
  });

  it('returns null for empty input', () => {
    expect(selectNewestPoint([])).toBe(null);
    expect(selectNewestPoint(null)).toBe(null);
  });
});

describe('mapPriceRow', () => {
  it('maps newest point to a prices row with null change/volume', () => {
    const trends = trendsFixture();
    const newest = selectNewestPoint(trends.points);
    const row = mapPriceRow('USDT', newest);
    expect(row).toEqual({
      coin: 'USDT',
      ts: T0 + 30 * 3600000,
      price: 1.0,
      change: null,
      volume: null,
    });
  });
});

describe('mapChainRows', () => {
  const PRICE = 1.0;
  function chainsFixture() {
    const mk = (offsets, supplies) => offsets.map((o, i) => ({ timestamp: T0 + o, supply: supplies[i] }));
    return {
      asset: 'USDT',
      chains: [
        { chain_key: 'ethereum', points: mk([0, 24 * 3600000, 48 * 3600000], [400, 500, 600]) },
        { chain_key: 'tron', points: mk([0, 48 * 3600000], [600, 700]) },
      ],
    };
  }

  it('maps per-chain supply to snapshot rows with 24h delta', () => {
    const rows = mapChainRows('USDT', chainsFixture(), PRICE);
    expect(rows).toHaveLength(2);
    const eth = rows.find((r) => r.chain === 'ethereum');
    const tron = rows.find((r) => r.chain === 'tron');
    expect(eth).toMatchObject({
      coin: 'USDT',
      ts: T0 + 48 * 3600000,
      circulating: 600 * PRICE,
      delta: (600 - 500) * PRICE,
    });
    // Tron newest is at 48h, target is 24h, oldest point at T0 is the
    // closest at or before target, so delta uses it.
    expect(tron.circulating).toBe(700 * PRICE);
    expect(tron.delta).toBe((700 - 600) * PRICE);
  });

  it('returns null delta when a chain lacks a 24h-ago point', () => {
    const payload = {
      asset: 'USDC',
      chains: [{ chain_key: 'ethereum', points: [{ timestamp: T0 + 30 * 3600000, supply: 600 }] }],
    };
    const rows = mapChainRows('USDC', payload, PRICE);
    expect(rows).toHaveLength(1);
    expect(rows[0].delta).toBe(null);
    expect(rows[0].circulating).toBe(600 * PRICE);
  });

  it('returns null when payload carries no per-chain supply', () => {
    expect(extractChainSeries({ asset: 'USDT', window: '7d', points: [] })).toBe(null);
    expect(mapChainRows('USDT', { asset: 'USDT', summary: {} }, PRICE)).toBe(null);
    expect(mapChainRows('USDT', { asset: 'USDT', chains: [{ chain_key: 'ethereum', points: [{ timestamp: T0 }] }] }, PRICE)).toBe(null);
  });
});

describe('findPointClosestTo24hAgo', () => {
  it('finds the point at or before 24h ago', () => {
    const pts = [trendPoint(0, 1000), trendPoint(6 * 3600000, 1100), trendPoint(30 * 3600000, 1300)];
    const newestMs = T0 + 30 * 3600000;
    const prev = findPointClosestTo24hAgo(pts, newestMs);
    expect(prev.total_supply).toBe(1100);
  });

  it('returns null when the window is shorter than 24h', () => {
    const pts = [trendPoint(29 * 3600000, 1200), trendPoint(30 * 3600000, 1300)];
    expect(findPointClosestTo24hAgo(pts, T0 + 30 * 3600000)).toBe(null);
  });
});

describe('buildMarketSnapshot', () => {
  it('sums newest supply and per-coin 24h deltas', () => {
    const bySymbol = {
      USDT: [trendPoint(0, 1000), trendPoint(24 * 3600000, 1100), trendPoint(48 * 3600000, 1300)],
      USDC: [trendPoint(0, 2000), trendPoint(24 * 3600000, 2100), trendPoint(48 * 3600000, 2200)],
    };
    const m = buildMarketSnapshot(bySymbol);
    expect(m.ts).toBe(T0 + 48 * 3600000);
    expect(m.total).toBe(1300 + 2200);
    expect(m.delta).toBe((1300 - 1100) + (2200 - 2100));
  });

  it('sets delta null when any coin lacks a 24h-ago point', () => {
    const bySymbol = {
      USDT: [trendPoint(0, 1000), trendPoint(30 * 3600000, 1300)],
      USDC: [trendPoint(29 * 3600000, 2100), trendPoint(30 * 3600000, 2200)],
    };
    const m = buildMarketSnapshot(bySymbol);
    expect(m.total).toBe(1300 + 2200);
    expect(m.delta).toBe(null);
  });
});

describe('production shapes (verified live 2026-09-08)', () => {
  function prodChainsFixture() {
    // Shape captured live from /api/trends/chains?asset=USDT: root key
    // `series`, entries carry chain_key + chain_name, points carry supply
    // plus extra fields (supply_share_pct, chain_signal_score, ...).
    const mk = (offsets, supplies) =>
      offsets.map((o, i) => ({
        timestamp: new Date(T0 + o).toISOString(),
        supply: supplies[i],
        supply_share_pct: 40.29,
        chain_tvl: null,
        chain_signal_score: 10,
        chain_signal_band: 'Normal',
        data_confidence_score: 100,
      }));
    return {
      asset: 'USDT',
      window: '7d',
      generated_at: new Date(T0 + 48 * 3600000).toISOString(),
      series: [
        { chain_key: 'aptos', chain_name: 'Aptos', points: mk([0, 24 * 3600000, 48 * 3600000], [700, 725, 750]) },
        { chain_key: 'ethereum', chain_name: 'Ethereum', points: mk([0, 48 * 3600000], [1000, 1100]) },
      ],
    };
  }

  it('extracts the root `series` shape with extra point fields', () => {
    const rows = mapChainRows('USDT', prodChainsFixture(), 1.0);
    expect(rows).toHaveLength(2);
    const aptos = rows.find((r) => r.chain === 'aptos');
    expect(aptos).toMatchObject({
      coin: 'USDT',
      ts: T0 + 48 * 3600000,
      circulating: 750,
      delta: 25,
    });
    const eth = rows.find((r) => r.chain === 'ethereum');
    expect(eth.circulating).toBe(1100);
    expect(eth.delta).toBe(100);
  });

  it('computes 24h price change from the trends window', () => {
    const points = [trendPoint(0, 1000, 0.999), trendPoint(30 * 3600000, 1300, 1.001)];
    const row = mapPriceRow('USDT', selectNewestPoint(points), points);
    expect(row.change).toBeCloseTo(0.002);
    expect(row.price).toBe(1.001);
  });

  it('keeps change null when the window is shorter than 24h', () => {
    const points = [trendPoint(0, 1000, 1.0), trendPoint(3600000, 1000, 1.0)];
    const row = mapPriceRow('USDT', selectNewestPoint(points), points);
    expect(row.change).toBe(null);
  });
});
