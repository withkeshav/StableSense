import { ASSET_META } from '../../../src/utils/asset-meta.js';
import { getActiveCoins } from '../../../src/utils/coin-config.js';
import { intervalHours, isNominal24h } from '../../../src/lib/freshness.js';

export const TRACKED_COINS = getActiveCoins().map((coin) => coin.symbol);
export const COIN_NAMES = Object.fromEntries(getActiveCoins().map((coin) => [coin.symbol, ASSET_META[coin.symbol]?.name ?? coin.symbol]));
const finite = (n) => typeof n === 'number' && Number.isFinite(n);
const oldest = (values) => values.length && values.every((v) => finite(v) && v > 0) ? Math.min(...values) : null;
const sum = (values) => values.length && values.every(finite) && finite(values.reduce((a, b) => a + b, 0)) ? values.reduce((a, b) => a + b, 0) : null;
const MAX_CHAIN_AGE_MS = 48 * 3600_000;

/** Current totals use only explicit ingestion membership, never latest-ever history rows. */
export function buildMarketView({ priceRows = [], chainBatches = [], nowMs = Date.now(), symbol = null, historyRows = [], supplySeriesDays = 30 } = {}) {
  const wanted = symbol ? String(symbol).toUpperCase() : null;
  const tracked = wanted ? TRACKED_COINS.filter((c) => c === wanted) : TRACKED_COINS;
  const dataQuality = [];
  const coins = tracked.map((coin) => {
    const price = priceRows.filter((r) => r.coin === coin).sort((a, b) => b.ts - a.ts)[0];
    const priceValid = finite(price?.price) && price.price > 0 && finite(price.ts) && price.ts > 0 && price.ts <= nowMs;
    const batch = chainBatches.find((b) => b.coin === coin);
    const rows = Array.isArray(batch?.rows) ? batch.rows : [];
    const seen = new Set();
    const chains = rows.map((row) => {
      const key = String(row.chain || '').trim().toLowerCase();
      const usable = key && !seen.has(key) && finite(row.circulating) && row.circulating >= 0 && finite(row.ts) && row.ts > 0 && row.ts <= nowMs && nowMs - row.ts <= MAX_CHAIN_AGE_MS;
      seen.add(key);
      if (!usable) return null;
      const hours = intervalHours(row.prevTs, row.ts);
      return { chain: key, supply: row.circulating, ts: row.ts,
        previousTs: row.prevTs ?? null, intervalHours: hours,
        // A sparse source comparison is retained as a comparison, never relabeled 24h.
        delta: finite(row.delta) && hours != null ? row.delta : null,
        delta24h: finite(row.delta) && isNominal24h(hours) ? row.delta : null };
    }).filter(Boolean).sort((a, b) => b.supply - a.supply);
    const complete = Boolean(batch?.complete) && chains.length > 0 && chains.length === rows.length;
    if (!priceValid) dataQuality.push({ coin, reason: 'price unavailable' });
    if (!complete) dataQuality.push({ coin, reason: batch ? 'chain coverage incomplete or stale' : 'chain membership unavailable; waiting for a fetch' });
    const supply = complete ? sum(chains.map((c) => c.supply)) : null;
    const supplyDelta24h = complete ? sum(chains.map((c) => c.delta24h)) : null;
    if (supplyDelta24h == null) dataQuality.push({ coin, reason: '24h supply comparison unavailable' });
    return { symbol: coin, name: COIN_NAMES[coin] || coin,
      price: priceValid ? price.price : null, change24h: price?.change24h ?? null,
      ts: priceValid ? price.ts : null, supply, supplyDelta24h,
      supplyObservedAt: complete ? oldest(chains.map((c) => c.ts)) : null,
      depegIndex: null, chains: complete ? chains : [], coverage: { complete, reported: rows.length, usable: chains.length, source: batch?.source ?? null, fetchedAt: batch?.fetchedAt ?? null } };
  });
  const spotObservedAt = oldest(coins.map((c) => c.ts));
  const supplyObservedAt = oldest(coins.map((c) => c.supplyObservedAt));
  const observedAt = oldest([spotObservedAt, supplyObservedAt]);
  return { generatedAt: nowMs, source: 'helix-via-cron', observedAt, spotObservedAt, supplyObservedAt,
    market: { totalCirculatingUsd: sum(coins.map((c) => c.supply)), delta24hUsd: sum(coins.map((c) => c.supplyDelta24h)), ts: supplyObservedAt },
    coverage: { requested: tracked.length, included: coins.filter((c) => c.supply != null).length, complete: coins.length > 0 && coins.every((c) => c.supply != null && c.price != null) },
    coins, dataQuality, supplyHistory: buildSupplyHistory(historyRows, supplySeriesDays, nowMs) };
}

/**
 * Coin-level daily supply series for the dashboard chart, from the raw
 * snapshots table (NOT from the chains map, whose per-chain latest ts varies
 * by chain and caused sawtooth/duplicate-day rendering).
 * Dedupe: one row per coin+UTC-day+casing-normalized chain (largest ts wins).
 * Era rule: if a day contains a row from the daily-layer era (ts at
 * 00:00:00 UTC), keep only era rows so old chains never mix into a new-era
 * total; days with only 10-min-era rows sum normally.
 * @param {Array<{coin:string, chain:string, ts:number, circulatingUsd:number|null}>} historyRows
 * @param {number} days
 * @param {number} [nowMs] Reference clock for the day window (defaults to Date.now, injectable for tests).
 */
export function buildSupplyHistory(historyRows, days = 30, nowMs = Date.now()) {
  const cutoff = nowMs - days * 86_400_000;
  const byKey = new Map();
  for (const r of historyRows || []) {
    if (!r || typeof r.coin !== 'string' || typeof r.chain !== 'string') continue;
    const ts = Number(r.ts);
    if (!Number.isFinite(ts) || ts < cutoff) continue;
    const d = new Date(ts);
    const day = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    const chainKey = `${r.coin}||${day}||${String(r.chain).trim().toLowerCase()}`;
    const prev = byKey.get(chainKey);
    // Within one chain-day: a midnight (daily-layer era) row beats an
    // intraday row even when the intraday ts is newer, so era data survives
    // the dedupe on days written by both layers.
    const rank = (x) => (x.ts % 86_400_000 === 0 ? 1 : 0);
    if (!prev || rank({ ts }) > rank(prev) || (rank({ ts }) === rank(prev) && ts > prev.ts)) {
      byKey.set(chainKey, { coin: r.coin, day, ts, value: r.circulatingUsd ?? null });
    }
  }
  const perCoinDay = new Map();
  for (const { coin, day, ts, value } of byKey.values()) {
    const key = `${coin}||${day}`;
    const b = perCoinDay.get(key) || { coin, day, rows: [] };
    b.rows.push({ ts, value });
    perCoinDay.set(key, b);
  }
  const out = {};
  for (const b of perCoinDay.values()) {
    // Era rule across chains: daily-layer era rows all sit exactly at
    // midnight UTC. If any chain reported a midnight row for this day, the
    // day is an era day and ONLY midnight rows count, so intraday-era chains
    // (which would otherwise be added on top) cannot inflate the total.
    const eraRows = b.rows.filter((r) => r.ts % 86_400_000 === 0);
    const counted = eraRows.length ? eraRows : b.rows;
    if (!counted.some((r) => typeof r.value === 'number' && Number.isFinite(r.value))) continue;
    const sum = counted.reduce((acc, r) => acc + (Number.isFinite(r.value) ? r.value : 0), 0);
    (out[b.coin] = out[b.coin] || []).push({ ts: Date.parse(`${b.day}T00:00:00Z`), value: sum });
  }
  for (const coin of Object.keys(out)) out[coin].sort((a, b) => a.ts - b.ts);
  return out;
}
