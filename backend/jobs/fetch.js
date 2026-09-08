import { getActiveCoins } from '../../src/utils/coin-config.js';
import { loadEnv } from '../lib/env.js';
import db from '../lib/db.js';
import { finishJob, startJob } from '../lib/job-run.js';
import {
  buildMarketSnapshot,
  mapChainRows,
  mapPriceRow,
  selectNewestPoint,
  toMs,
} from './lib/helixMap.js';

loadEnv();

const LLAMA_BASE = 'https://stablecoins.llama.fi';
const CG_BASE = 'https://api.coingecko.com/api/v3';

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

async function helixGetJson(url) {
  const helixKey = process.env.HELIX_API_KEY || '';
  const headers = { 'User-Agent': 'stablesense-cron/1.0' };
  if (helixKey) headers.Authorization = `Bearer ${helixKey}`;
  let lastErr = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(url, { headers, signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt === 1) throw err;
    }
  }
  throw lastErr;
}

const job = startJob('fetch');
try {
if (process.env.LEGACY_UPSTREAMS === '1') {
const coins = getActiveCoins();
const now = Date.now();

const insertSnapshot = db.prepare(`
  INSERT OR IGNORE INTO snapshots (coin, chain, ts, circulating_usd, delta_24h_usd)
  VALUES (@coin, @chain, @ts, @circulating, @delta)
`);
const insertSnapshots = db.transaction((rows) => {
  for (const row of rows) insertSnapshot.run(row);
});

// 1) Per-coin chain history. DefiLlama returns full daily token history, so the
// first run backfills the dataset and later runs only append the newest day.
for (const coin of coins) {
  const detail = await getJson(`${LLAMA_BASE}/stablecoin/${coin.llamaStablecoinId}?includeTotals=true`);
  const rows = [];
  for (const [chain, chainData] of Object.entries(detail.chainBalances || {})) {
    const tokens = (chainData.tokens || []).filter(
      (t) => typeof t?.date === 'number' && typeof t?.circulating?.peggedUSD === 'number'
    );
    for (let i = 0; i < tokens.length; i += 1) {
      const prev = tokens[i - 1]?.circulating?.peggedUSD;
      rows.push({
        coin: coin.symbol,
        chain,
        ts: tokens[i].date * 1000,
        circulating: tokens[i].circulating.peggedUSD,
        delta: typeof prev === 'number' ? tokens[i].circulating.peggedUSD - prev : null,
      });
    }
  }
  insertSnapshots(rows);
  console.log(`[fetch] ${coin.symbol}: ${rows.length} snapshot rows`);
}

// 2) Spot prices with 24h change + volume.
const ids = coins.map((c) => c.coingeckoId).join(',');
const cg = await getJson(
  `${CG_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
);
const insertPrice = db.prepare(
  'INSERT INTO prices (coin, ts, price, change_24h, volume_24h_usd) VALUES (@coin, @ts, @price, @change, @volume)'
);
const insertPrices = db.transaction((rows) => {
  for (const row of rows) insertPrice.run(row);
});
insertPrices(
  coins.map((c) => ({
    coin: c.symbol,
    ts: now,
    price: cg[c.coingeckoId]?.usd ?? null,
    change: cg[c.coingeckoId]?.usd_24h_change ?? null,
    volume: cg[c.coingeckoId]?.usd_24h_vol ?? null,
  }))
);
console.log(`[fetch] prices: ${coins.length} rows`);

// 3) Aggregate market snapshot (all stablecoins, not just the tracked five).
const market = await getJson(`${LLAMA_BASE}/stablecoins`);
const total = (market?.peggedAssets || []).reduce((sum, a) => sum + (a?.circulating?.peggedUSD || 0), 0);
const prevDay = (market?.peggedAssets || []).reduce((sum, a) => sum + (a?.circulatingPrevDay?.peggedUSD || 0), 0);
if (typeof total === 'number' && total > 0) {
  db.prepare('INSERT INTO market_snapshots (ts, total_circulating_usd, delta_24h_usd) VALUES (?, ?, ?)').run(
    now,
    total,
    prevDay > 0 ? total - prevDay : null
  );
  console.log(`[fetch] market total: $${(total / 1e9).toFixed(2)}B`);
}

console.log('[fetch] done');
  const snap = db.prepare('SELECT MAX(ts) AS ts FROM snapshots').get();
  finishJob(job, { ok: true, sourceTs: snap?.ts ?? now });
} else {
const helixBase = process.env.HELIX_API_BASE || 'https://helix.withkeshav.com';
const coins = getActiveCoins();

const insertSnapshot = db.prepare(`
  INSERT OR IGNORE INTO snapshots (coin, chain, ts, circulating_usd, delta_24h_usd)
  VALUES (@coin, @chain, @ts, @circulating, @delta)
`);
const insertSnapshots = db.transaction((rows) => {
  for (const row of rows) insertSnapshot.run(row);
});
const insertPrice = db.prepare(
  'INSERT INTO prices (coin, ts, price, change_24h, volume_24h_usd) VALUES (@coin, @ts, @price, @change, @volume)'
);
const insertPrices = db.transaction((rows) => {
  for (const row of rows) insertPrice.run(row);
});

const trendsBySymbol = {};
let newestSourceTs = 0;
const priceRows = [];

for (const coin of coins) {
  const trends = await helixGetJson(`${helixBase}/api/trends?asset=${coin.symbol}`);
  const points = Array.isArray(trends?.points) ? trends.points : [];
  const newest = selectNewestPoint(points);
  const newestMs = newest ? toMs(newest.timestamp) : null;
  if (!newest || newestMs == null) {
    // Skip coins with no usable points: prices.ts / snapshots are NOT NULL,
    // one dead symbol must not crash the job or void the market sum.
    console.log(`[fetch] ${coin.symbol}: no Helix points, skipped`);
    continue;
  }
  trendsBySymbol[coin.symbol] = points;
  if (newestMs > newestSourceTs) newestSourceTs = newestMs;
  priceRows.push(mapPriceRow(coin.symbol, newest, points));

  let chainRows = null;
  // Optional gate: /api/trends/chains is ~3MB per asset (7d x ~10min points).
  // Set HELIX_FETCH_CHAINS=0 to skip chain snapshots until Helix-side caching
  // or a lighter window exists. Default keeps chains on.
  if (process.env.HELIX_FETCH_CHAINS !== '0') {
    let chainsPayload = null;
    try {
      chainsPayload = await helixGetJson(`${helixBase}/api/trends/chains?asset=${coin.symbol}`);
    } catch {
      chainsPayload = null;
    }
    chainRows = chainsPayload ? mapChainRows(coin.symbol, chainsPayload, newest.price) : null;
    if (chainRows == null) {
      console.log(`[fetch] chains: unmapped for ${coin.symbol}`);
    } else {
      if (chainRows.length) insertSnapshots(chainRows);
      console.log(`[fetch] ${coin.symbol}: ${chainRows.length} snapshot rows`);
    }
  }
}
insertPrices(priceRows);
console.log(`[fetch] prices: ${priceRows.length} rows`);

const market = buildMarketSnapshot(trendsBySymbol);
if (market && typeof market.total === 'number' && market.total > 0) {
  db.prepare('INSERT INTO market_snapshots (ts, total_circulating_usd, delta_24h_usd) VALUES (?, ?, ?)').run(
    market.ts,
    market.total,
    market.delta
  );
  console.log(`[fetch] market total: $${(market.total / 1e9).toFixed(2)}B (tracked coins only, previously all of DefiLlama)`);
}

console.log('[fetch] done');
  finishJob(job, { ok: true, sourceTs: newestSourceTs || Date.now() });
}
} catch (err) {
  finishJob(job, { ok: false, error: err });
  console.error(`[fetch] failed: ${err.message || err}`);
  process.exit(1);
}
