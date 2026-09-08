import { afterEach, describe, expect, it, vi } from 'vitest';
import { transformMarketPayload } from './marketBackend.js';

const T0 = 1_786_000_000_000;

function marketPayload(over = {}) {
  return {
    generatedAt: T0 + 1000,
    source: 'helix-via-cron',
    observedAt: T0,
    market: { totalCirculatingUsd: 130_000, delta24hUsd: 60, ts: T0 },
    coins: [
      {
        symbol: 'USDT',
        name: 'Tether USD',
        price: 1.0001,
        change24h: 0.01,
        ts: T0,
        supply: 100_000,
        supplyDelta24h: 50,
        depegIndex: null,
        chains: [
          { chain: 'ethereum', supply: 60_000, delta24h: 100, ts: T0 },
          { chain: 'tron', supply: 40_000, delta24h: -50, ts: T0 },
        ],
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        price: 0.9999,
        change24h: -0.01,
        ts: T0,
        supply: 30_000,
        supplyDelta24h: 10,
        depegIndex: null,
        chains: [{ chain: 'ethereum', supply: 30_000, delta24h: 10, ts: T0 }],
      },
    ],
    dataQuality: [{ coin: 'DAI', reason: 'no prices row' }],
    ...over,
  };
}

describe('transformMarketPayload cgSimple mapping', () => {
  it('maps price and timestamp per coingecko id', () => {
    const data = transformMarketPayload(marketPayload());
    expect(data.cgSimple.tether).toEqual({ usd: 1.0001, usd_24h_change: 0.01, usd_24h_vol: null, last_updated_at: Math.floor(T0 / 1000) });
    expect(data.cgSimple['usd-coin']).toEqual({ usd: 0.9999, usd_24h_change: -0.01, usd_24h_vol: null, last_updated_at: Math.floor(T0 / 1000) });
  });
});

describe('transformMarketPayload Detail shim', () => {
  it('builds two-token chainBalances from the chains array when delta exists', () => {
    const data = transformMarketPayload(marketPayload());
    const floor = Math.floor(T0 / 1000);
    expect(data.usdtDetail).toEqual({
      chainBalances: {
        ethereum: {
          tokens: [
            { date: floor, circulating: { peggedUSD: 60_000 } },
            { date: floor - 86400, circulating: { peggedUSD: 60_000 - 100 } },
          ],
        },
        tron: {
          tokens: [
            { date: floor, circulating: { peggedUSD: 40_000 } },
            { date: floor - 86400, circulating: { peggedUSD: 40_000 + 50 } },
          ],
        },
      },
    });
    // USDC's ethereum chain also carries a delta -> two tokens.
    expect(data.usdcDetail.chainBalances.ethereum.tokens).toEqual([
      { date: floor, circulating: { peggedUSD: 30_000 } },
      { date: floor - 86400, circulating: { peggedUSD: 30_000 - 10 } },
    ]);
  });
});

describe('transformMarketPayload marketTotals', () => {
  it('computes prevDay from total minus delta', () => {
    const data = transformMarketPayload(marketPayload());
    expect(data.marketTotals).toEqual({ peggedUSD: 130_000, prevDay: { peggedUSD: 129_940 } });
  });

  it('keeps null delta as null prevDay', () => {
    const payload = marketPayload({ market: { totalCirculatingUsd: 130_000, delta24hUsd: null, ts: T0 } });
    const data = transformMarketPayload(payload);
    expect(data.marketTotals).toEqual({ peggedUSD: 130_000, prevDay: { peggedUSD: null } });
  });
});

describe('transformMarketPayload clocks and quality', () => {
  it('wires observedAt into all three clocks and passes dataQuality through', () => {
    const data = transformMarketPayload(marketPayload());
    expect(data.spotObservedAt).toBe(T0);
    expect(data.supplyObservedAt).toBe(T0);
    expect(data.marketObservedAt).toBe(T0);
    expect(data.dataQuality).toEqual([{ coin: 'DAI', reason: 'no prices row' }]);
    expect(Number.isFinite(data.fetchedAt)).toBe(true);
  });
});

describe('transformMarketPayload single-symbol mode', () => {
  it('handles a one-coin payload', () => {
    const full = marketPayload();
    const data = transformMarketPayload({ ...full, coins: full.coins.slice(0, 1) });
    expect(Object.keys(data.cgSimple)).toEqual(['tether']);
    expect(data.usdtDetail.chainBalances.ethereum.tokens[0].circulating.peggedUSD).toBe(60_000);
    expect(data.usdcDetail).toBeUndefined();
  });
});

describe('transformMarketPayload empty-coins payload', () => {
  it('produces dataQuality-only data without crashing', () => {
    const payload = marketPayload({ coins: [], observedAt: null });
    const data = transformMarketPayload(payload);
    expect(data.cgSimple).toEqual({});
    expect(data.usdtDetail).toBeUndefined();
    expect(data.dataQuality).toEqual([{ coin: 'DAI', reason: 'no prices row' }]);
    expect(data.marketTotals.peggedUSD).toBe(130_000);
    expect(data.spotObservedAt).toBe(null);
  });
});

describe('transformMarketPayload allStables shim', () => {
  it('keeps Home, Chains, Coin, and insight readers working', () => {
    const data = transformMarketPayload(marketPayload());
    expect(data.allStables.totalMarketCap.peggedUSD).toBe(130_000);
    const usdt = data.allStables.peggedAssets.find((a) => a.symbol === 'USDT');
    expect(usdt.circulating).toEqual({ peggedUSD: 100_000 });
    expect(usdt.circulatingPrevDay).toEqual({ peggedUSD: 99_950 });
    expect(usdt.chainCirculating.ethereum.current).toEqual({ peggedUSD: 60_000 });
    const names = data.chainData.map((c) => c.name);
    expect(names).toContain('ethereum');
    expect(names).toContain('tron');
  });
});

describe('fetchDashboardData via mocked backend', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('fetches /api/market once and returns transformed data', async () => {
    const payload = marketPayload();
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => payload }));
    vi.stubGlobal('fetch', fetchMock);
    const { fetchDashboardData } = await import('./api.js');
    const data = await fetchDashboardData({});
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0]).endsWith('/api/market')).toBe(true);
    expect(data.cgSimple.tether.usd).toBe(1.0001);
    expect(data.usdtDetail.chainBalances.tron.tokens[0].circulating.peggedUSD).toBe(40_000);
    expect(data.marketTotals.peggedUSD).toBe(130_000);
  });

  it('throws the existing style error when the backend fails with no cache', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('boom'); }));
    const { fetchDashboardData } = await import('./api.js');
    await expect(fetchDashboardData({})).rejects.toThrow('All market data sources are unavailable.');
  });
});
