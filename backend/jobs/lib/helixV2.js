/**
 * Pure mapping for the Helix v2 bulk market response
 * (`GET /api/v2/market?assets=...&window=latest&include=chains`).
 *
 * This is the single adapter seam for the staged switch away from the v1
 * trends plus trends/chains calls. It writes the same SQLite rows the v1
 * mappers produce, so `marketView`, the frontend and the alerts path do not
 * change when the flag flips.
 *
 * Unit rule: Helix `latest.total_supply` and chain `supply` are token units.
 * A chain row is converted to circulating USD with the asset's latest price,
 * exactly as `mapChainRows` does. A chain with no price is skipped rather than
 * written as a fake zero.
 *
 * Honesty rule: every unknown value stays null. A missing 24h price gives a
 * null change, a missing prior chain sample gives a null delta, and a missing
 * market total gives no market row.
 */

import { toMs } from './helixMap.js';

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function priceChangePct(price, prevPrice) {
  if (price == null || prevPrice == null || prevPrice === 0) return null;
  return ((price - prevPrice) / prevPrice) * 100;
}

/**
 * Map one v2 bulk market payload to the rows `fetch.js` writes.
 * @param {object} payload Raw `/api/v2/market` JSON.
 * @returns {{
 *   priceRows: Array<{coin:string, ts:number|null, price:number|null, change:number|null, volume:null}>,
 *   snapshotRows: Array<{coin:string, chain:string, ts:number, circulating:number, delta:number|null}>,
 *   marketRow: {ts:number|null, total:number, delta:number|null}|null,
 *   failed: Array<{asset:string, code:string, detail:string}>,
 *   coverage: {requested:number|null, included:number|null, failed:number|null}|null
 * }}
 */
export function mapBulkMarketPayload(payload) {
  const entries = Array.isArray(payload?.assets) ? payload.assets : [];
  const priceRows = [];
  const snapshotRows = [];
  const failed = [];

  for (const entry of entries) {
    const symbol = String(entry?.asset || '').toUpperCase();
    if (!symbol) continue;

    if (entry?.error) {
      failed.push({
        asset: symbol,
        code: String(entry.error.code || 'asset_error'),
        detail: String(entry.error.detail || ''),
      });
      continue;
    }

    const latest = entry?.latest;
    const ts = toMs(latest?.timestamp);
    if (!latest || ts == null) {
      failed.push({ asset: symbol, code: 'no_latest', detail: 'No latest point' });
      continue;
    }

    const price = finiteNumber(latest.price);
    const prevPrice = finiteNumber(entry?.prev_24h?.price);
    priceRows.push({
      coin: symbol,
      ts,
      price,
      // Percent, matching the legacy CoinGecko path and every UI consumer.
      change: priceChangePct(price, prevPrice),
      volume: null,
    });

    // Chain supply is token units; without a price it cannot become USD.
    if (price == null) continue;

    const chains = Array.isArray(entry?.chains) ? entry.chains : [];
    for (const chain of chains) {
      const chainKey = chain?.chain_key;
      const latestSupply = finiteNumber(chain?.latest?.supply);
      if (!chainKey || latestSupply == null) continue;
      const chainTs = toMs(chain.latest.timestamp) ?? ts;
      const prevSupply = finiteNumber(chain?.prev_24h?.supply);
      snapshotRows.push({
        coin: symbol,
        chain: String(chainKey),
        ts: chainTs,
        circulating: latestSupply * price,
        delta: prevSupply == null ? null : (latestSupply - prevSupply) * price,
      });
    }
  }

  const market = payload?.market;
  const total = finiteNumber(market?.total_supply);
  const marketTs = toMs(payload?.as_of)
    ?? (priceRows.length ? Math.max(...priceRows.map((row) => row.ts || 0)) : null);
  const marketRow = total == null ? null : {
    ts: marketTs,
    total,
    delta: finiteNumber(market?.delta_24h_supply),
  };

  return {
    priceRows,
    snapshotRows,
    marketRow,
    failed,
    coverage: market ? {
      requested: finiteNumber(market.asset_count),
      included: finiteNumber(market.assets_included),
      failed: finiteNumber(market.assets_failed),
    } : null,
  };
}
