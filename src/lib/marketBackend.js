import { STABLECOIN_REGISTRY } from '../utils/coin-config.js';

/**
 * Transform a GET /api/market payload into the existing internal dashboard
 * data shape (cgSimple, per-coin *Detail shims, marketTotals, allStables
 * shim, clocks, dataQuality) so App.jsx, derive.js, and UI components keep
 * working unchanged. Pure function: no fetch, no DOM, no storage.
 *
 * Backend chain supplies are circulating USD (snapshots.circulating_usd), so
 * the Detail shim carries them through as peggedUSD directly.
 *
 * The *Detail shims hold the latest point only, so derive.js chainObservation
 * (which needs two points) yields no flow observations; PEG_BREAK price
 * alerts still work and canonical backend alerts arrive via /api/alerts.
 *
 * @param {object} payload /api/market JSON.
 * @returns {object} Internal dashboard data object.
 */
export function transformMarketPayload(payload) {
  const data = {};
  const coins = Array.isArray(payload?.coins) ? payload.coins : [];

  data.cgSimple = {};
  for (const c of coins) {
    const symbol = String(c?.symbol || '').toUpperCase();
    const cfg = STABLECOIN_REGISTRY[symbol];
    if (!cfg) continue;
    data.cgSimple[cfg.coingeckoId] = {
      usd: c.price ?? null,
      usd_24h_change: c.change24h ?? null,
      usd_24h_vol: null,
      last_updated_at: c.ts != null ? Math.floor(c.ts / 1000) : null,
    };
    const chains = Array.isArray(c.chains) ? c.chains : [];
    const chainBalances = {};
    for (const ch of chains) {
      if (!ch || typeof ch.chain !== 'string') continue;
      // Two points when a 24h delta exists: derive.js chainObservation needs a
      // previous point to compute flow direction, otherwise it stays null.
      const tokens = [
        {
          date: ch.ts != null ? Math.floor(ch.ts / 1000) : null,
          circulating: { peggedUSD: ch.supply ?? null },
        },
      ];
      if (ch.delta24h != null && ch.supply != null) {
        tokens.push({
          date: ch.ts != null ? Math.floor(ch.ts / 1000) - 86400 : null,
          circulating: { peggedUSD: ch.supply - ch.delta24h },
        });
      }
      chainBalances[ch.chain] = { tokens };
    }
    data[`${symbol.toLowerCase()}Detail`] = { chainBalances };
  }

  const market = payload?.market || {};
  const total = market.totalCirculatingUsd ?? null;
  const delta = market.delta24hUsd ?? null;
  data.marketTotals = {
    peggedUSD: total,
    prevDay: { peggedUSD: total != null && delta != null ? total - delta : null },
  };

  const peggedAssets = coins.map((c) => {
    const symbol = String(c?.symbol || '').toUpperCase();
    const cfg = STABLECOIN_REGISTRY[symbol];
    const chains = Array.isArray(c?.chains) ? c.chains : [];
    const chainCirculating = {};
    for (const ch of chains) {
      if (!ch || typeof ch.chain !== 'string') continue;
      chainCirculating[ch.chain] = {
        current: { peggedUSD: ch.supply ?? null },
        circulatingPrevDay: {
          peggedUSD: ch.delta24h != null && ch.supply != null ? ch.supply - ch.delta24h : (ch.supply ?? null),
        },
      };
    }
    return {
      id: cfg?.llamaStablecoinId ?? null,
      symbol,
      name: c?.name ?? symbol,
      circulating: { peggedUSD: c?.supply ?? null },
      circulatingPrevDay: {
        peggedUSD: c?.supplyDelta24h != null && c?.supply != null ? c.supply - c.supplyDelta24h : (c?.supply ?? null),
      },
      chainCirculating,
    };
  });
  data.allStables = {
    totalMarketCap: {
      peggedUSD: total,
      prevDay: { peggedUSD: total != null && delta != null ? total - delta : null },
    },
    peggedAssets,
    chains: [],
  };

  const chainTotals = new Map();
  for (const c of coins) {
    for (const ch of Array.isArray(c?.chains) ? c.chains : []) {
      if (!ch || typeof ch.chain !== 'string' || typeof ch.supply !== 'number' || !Number.isFinite(ch.supply)) continue;
      chainTotals.set(ch.chain, (chainTotals.get(ch.chain) || 0) + ch.supply);
    }
  }
  data.chainData = [...chainTotals.entries()]
    .map(([name, value]) => ({ name, totalCirculatingUSD: { peggedUSD: value } }))
    .sort((a, b) => b.totalCirculatingUSD.peggedUSD - a.totalCirculatingUSD.peggedUSD);

  data.fetchedAt = Date.now();
  const observed = payload?.observedAt ?? null;
  data.spotObservedAt = observed;
  data.supplyObservedAt = observed;
  data.marketObservedAt = observed;

  // Backend-computed daily supply history (deduped, casing-normalized, era-
  // consistent). Charts consume this directly instead of rebuilding series
  // from per-chain shims, whose per-chain latest timestamps caused duplicate
  // days and sawtooth artifacts.
  data.supplyHistory = payload?.supplyHistory ?? {};

  data.dataQuality = Array.isArray(payload?.dataQuality) ? payload.dataQuality : [];
  return data;
}
