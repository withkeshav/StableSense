import { buildMarketView } from '../jobs/lib/marketView.js';

/** Shared SQLite read for the dashboard and narrative job; no upstream calls. */
export function readMarketView(db, { nowMs = Date.now(), symbol = null, supplyDays = 30, includeHistory = false } = {}) {
  const priceRows = db.prepare(
    'SELECT p.coin, p.ts, p.price, p.change_24h AS change24h FROM prices p WHERE p.ts = (SELECT MAX(ts) FROM prices WHERE coin = p.coin)'
  ).all();
  const chainBatches = db.prepare('SELECT * FROM chain_batches').all().map((batch) => {
    let rows = [];
    try { rows = JSON.parse(batch.rows_json); } catch { /* Invalid membership stays unavailable. */ }
    return { coin: batch.coin, source: batch.source, fetchedAt: batch.fetched_at, complete: Boolean(batch.complete), rows };
  });
  const historyRows = includeHistory ? db.prepare(
    'SELECT coin, chain, ts, circulating_usd AS circulatingUsd FROM snapshots WHERE ts >= ?'
  ).all(nowMs - supplyDays * 86400000) : [];
  return buildMarketView({ priceRows, chainBatches, nowMs, symbol, historyRows, supplySeriesDays: supplyDays });
}
