/**
 * Pure data assembly for GET /api/market (see backend/server.js).
 *
 * No database code here: rows in, payload out. server.js stays a thin
 * wrapper that runs three newest-row SELECTs and calls buildMarketView().
 *
 * Duplicated from src/utils/coin-config.js (ACTIVE_STABLECOINS) and
 * src/utils/asset-meta.js (ASSET_META names): backend/server.js has no src
 * imports, so the five tracked coins and their display names live here too.
 * Keep in sync when adding coins.
 */

export const TRACKED_COINS = ['USDT', 'USDC', 'DAI', 'USDE', 'PYUSD'];

export const COIN_NAMES = {
  USDT: 'Tether USD',
  USDC: 'USD Coin',
  DAI: 'Dai',
  USDE: 'Ethena USDe',
  PYUSD: 'PayPal USD',
};

function isFiniteNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

/**
 * Assemble the /api/market payload from local SQLite rows only.
 * @param {object} args
 * @param {Array<{coin:string,ts:number|null,price:number|null,change24h:number|null}>} [args.priceRows]
 * @param {Array<{coin:string,chain:string,ts:number|null,circulatingUsd:number|null,delta24h:number|null}>} [args.snapshotRows]
 * @param {{ts:number|null,total:number|null,delta:number|null}|null} [args.marketRow] Newest market_snapshots row.
 * @param {number} [args.nowMs] Response generatedAt clock.
 * @param {string|null} [args.symbol] Optional single-coin filter (e.g. "USDT").
 * @returns {{generatedAt:number,source:string,observedAt:number|null,market:{totalCirculatingUsd:number|null,delta24hUsd:number|null,ts:number|null},coins:Array<object>,dataQuality:Array<{coin:string,reason:string}>}}
 */
export function buildMarketView({ priceRows = [], snapshotRows = [], marketRow = null, nowMs = Date.now(), symbol = null, historyRows = [], supplySeriesDays = 30 } = {}) {
  const wanted = symbol ? String(symbol).toUpperCase() : null;
  const tracked = wanted && TRACKED_COINS.includes(wanted) ? [wanted] : TRACKED_COINS;

  const priceByCoin = {};
  for (const r of priceRows || []) {
    if (!r || typeof r.coin !== 'string') continue;
    const prev = priceByCoin[r.coin];
    if (!prev || (r.ts ?? -Infinity) > (prev.ts ?? -Infinity)) priceByCoin[r.coin] = r;
  }

  const chainsByCoin = {};
  const chainNorm = (name) => String(name || '').trim().toLowerCase();
  for (const r of snapshotRows || []) {
    if (!r || typeof r.coin !== 'string' || typeof r.chain !== 'string') continue;
    // Helix casing is inconsistent across its snapshot tables ("Tron" vs
    // "tron"); normalize so the same rail cannot double-count.
    const normKey = `${r.coin}||${chainNorm(r.chain)}`;
    const bucket = chainsByCoin[normKey] || null;
    if (!bucket || (r.ts ?? -Infinity) > (bucket.ts ?? -Infinity)) {
      chainsByCoin[normKey] = {
        chain: chainNorm(r.chain),
        supply: r.circulatingUsd ?? null,
        delta24h: r.delta24h ?? null,
        ts: r.ts ?? null,
      };
    }
  }
  const chainsFor = (coin) => Object.entries(chainsByCoin)
    .filter(([key]) => key.startsWith(`${coin}||`))
    .map(([, v]) => v)
    .sort((a, b) => (b.supply || 0) - (a.supply || 0));

  let observedAt = null;
  const consider = (ts) => {
    if (isFiniteNumber(ts) && (observedAt == null || ts > observedAt)) observedAt = ts;
  };
  for (const r of Object.values(priceByCoin)) consider(r.ts);
  for (const c of Object.values(chainsByCoin)) consider(c.ts);

  const hasAnyRows = Object.keys(priceByCoin).length > 0 || Object.keys(chainsByCoin).length > 0;
  const dataQuality = [];
  let coins = [];

  if (!hasAnyRows) {
    for (const coin of tracked) {
      dataQuality.push({ coin, reason: 'no cached market data' });
    }
  } else {
    for (const coin of tracked) {
      const price = priceByCoin[coin] || null;
      const chains = chainsFor(coin);
      if (!price) dataQuality.push({ coin, reason: 'no prices row' });
      if (!chains.length) dataQuality.push({ coin, reason: 'no snapshot rows' });
      const supplies = chains.map((c) => c.supply).filter(isFiniteNumber);
      const deltas = chains.map((c) => c.delta24h).filter(isFiniteNumber);
      coins.push({
        symbol: coin,
        name: COIN_NAMES[coin] || coin,
        price: price?.price ?? null,
        change24h: price?.change24h ?? null,
        ts: price?.ts ?? null,
        supply: supplies.length ? supplies.reduce((a, b) => a + b, 0) : null,
        supplyDelta24h: deltas.length ? deltas.reduce((a, b) => a + b, 0) : null,
        depegIndex: null,
        chains,
      });
    }
  }

  return {
    generatedAt: nowMs,
    source: 'helix-via-cron',
    observedAt,
    market: {
      totalCirculatingUsd: marketRow?.total ?? null,
      delta24hUsd: marketRow?.delta ?? null,
      ts: marketRow?.ts ?? null,
    },
    coins,
    dataQuality,
    supplyHistory: buildSupplyHistory(historyRows, supplySeriesDays),
  };
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
 */
export function buildSupplyHistory(historyRows, days = 30) {
  const cutoff = Date.now() - days * 86_400_000;
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
