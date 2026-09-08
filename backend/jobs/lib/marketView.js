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
export function buildMarketView({ priceRows = [], snapshotRows = [], marketRow = null, nowMs = Date.now(), symbol = null } = {}) {
  const wanted = symbol ? String(symbol).toUpperCase() : null;
  const tracked = wanted && TRACKED_COINS.includes(wanted) ? [wanted] : TRACKED_COINS;

  const priceByCoin = {};
  for (const r of priceRows || []) {
    if (!r || typeof r.coin !== 'string') continue;
    const prev = priceByCoin[r.coin];
    if (!prev || (r.ts ?? -Infinity) > (prev.ts ?? -Infinity)) priceByCoin[r.coin] = r;
  }

  const chainsByCoin = {};
  for (const r of snapshotRows || []) {
    if (!r || typeof r.coin !== 'string' || typeof r.chain !== 'string') continue;
    const key = `${r.coin}||${r.chain}`;
    const bucket = chainsByCoin[key] || null;
    if (!bucket || (r.ts ?? -Infinity) > (bucket.ts ?? -Infinity)) {
      chainsByCoin[key] = {
        chain: r.chain,
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
  };
}
