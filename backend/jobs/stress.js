import { getActiveCoins } from '../../src/utils/coin-config.js';
import { loadEnv } from '../lib/env.js';
import db from '../lib/db.js';
import { computePegStress, generateAlerts } from '../../src/lib/derive.js';
import { finishJob, startJob } from '../lib/job-run.js';
import {
  filterTrackedEvents,
  mapHelixEventToLabel,
  mapHelixEventToRow,
  mapStressRow,
  normalizeEventsPayload,
  statsFromSeries,
} from './lib/stressHelix.js';

loadEnv();

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

const job = startJob('stress');
try {
if (process.env.LEGACY_UPSTREAMS === '1') {

// Materialize the latest snapshot rows into the {coin}Detail shape that
// derive.js expects (chainBalances -> tokens[] -> circulating.peggedUSD).
function buildDetailsByCoin(coins) {
  const detailsByCoin = {};
  for (const coin of coins) {
    const rows = db
      .prepare(
        `SELECT chain, ts, circulating_usd, delta_24h_usd
         FROM snapshots WHERE coin = ?
         ORDER BY ts ASC`
      )
      .all(coin.symbol);
    const chainBalances = {};
    for (const r of rows) {
      if (!chainBalances[r.chain]) chainBalances[r.chain] = { tokens: [] };
      chainBalances[r.chain].tokens.push({
        date: Math.floor(r.ts / 1000),
        circulating: { peggedUSD: r.circulating_usd },
      });
    }
    detailsByCoin[coin.symbol] = { chainBalances };
  }
  return detailsByCoin;
}

function buildPricesByCoin(coins) {
  const out = {};
  for (const coin of coins) {
    const row = db
      .prepare('SELECT price, ts FROM prices WHERE coin = ? ORDER BY ts DESC LIMIT 1')
      .get(coin.symbol);
    out[coin.symbol] = { price: row?.price ?? 1, ts: row?.ts ?? null };
  }
  return out;
}

function buildData(coins, detailsByCoin, pricesByCoin) {
  const data = { cgSimple: {} };
  for (const coin of coins) {
    const row = pricesByCoin[coin.symbol];
    data.cgSimple[coin.coingeckoId] = {
      usd: row?.price ?? 1,
      last_updated_at: row?.ts ? Math.floor(row.ts / 1000) : undefined,
    };
    data[`${coin.symbol.toLowerCase()}Detail`] = detailsByCoin[coin.symbol];
  }
  return data;
}

const coins = getActiveCoins();
const now = Date.now();

const detailsByCoin = buildDetailsByCoin(coins);
const pricesByCoin = buildPricesByCoin(coins);
const data = buildData(coins, detailsByCoin, pricesByCoin);

const alerts = generateAlerts(data, { detectedAt: now });

// Chain-flow top delta (same input computePegStress expects).
let topChainFlow = 0;
for (const coin of coins) {
  const detail = detailsByCoin[coin.symbol];
  for (const chainData of Object.values(detail?.chainBalances || {})) {
    const tokens = chainData?.tokens || [];
    if (tokens.length < 2) continue;
    const cur = tokens[tokens.length - 1]?.circulating?.peggedUSD || 0;
    const prev = tokens[tokens.length - 2]?.circulating?.peggedUSD || cur;
    const delta = Math.abs(cur - prev);
    if (delta > topChainFlow) topChainFlow = delta;
  }
}

const pricesFlat = Object.fromEntries(coins.map((c) => [c.symbol, pricesByCoin[c.symbol]?.price ?? 1]));
const stress = computePegStress({
  pricesByCoin: pricesFlat,
  alerts,
  topChainFlow,
});

// z-score per coin: reuse the same 30-point baseline logic as the frontend
// buildWhaleWatchRows, but aggregate across chains for a coin-level score.
// Stats math lives in lib/stressHelix.js so the Helix path shares it.
function coinZScore(detail) {
  const series = [];
  for (const chainData of Object.values(detail?.chainBalances || {})) {
    const tokens = (chainData?.tokens || []).slice(-30);
    for (const t of tokens) series.push(t?.circulating?.peggedUSD || 0);
  }
  return statsFromSeries(series);
}

const insertStress = db.prepare(
  `INSERT OR REPLACE INTO stress_series (ts, symbol, peg_stress_index, z_score, raw_delta, normalized_delta)
   VALUES (@ts, @symbol, @stress, @z, @delta, @normalized)`
);

const insertLabel = db.prepare(
  `INSERT OR REPLACE INTO labels (ts, symbol, alert_type, severity, explanation, magnitude)
   VALUES (@ts, @symbol, @type, @severity, @explanation, @magnitude)`
);

const insertStressBatch = db.transaction((rows) => {
  for (const r of rows) insertStress.run(r);
});

const insertLabelBatch = db.transaction((rows) => {
  for (const r of rows) insertLabel.run(r);
});

const insertEvent = db.prepare(
  `INSERT OR REPLACE INTO alert_events (
     event_id, rule, classification, symbol, severity, state, headline, explanation,
     magnitude, gross_flow, net_supply_delta, source_ts_current, source_ts_previous,
     interval_hours, interval_label, observed_at, detected_at, published_at,
     involved_chains, provenance, confidence, cadence_valid, updated_at
   ) VALUES (
     @event_id, @rule, @classification, @symbol, @severity, @state, @headline, @explanation,
     @magnitude, @gross_flow, @net_supply_delta, @source_ts_current, @source_ts_previous,
     @interval_hours, @interval_label, @observed_at, @detected_at, @published_at,
     @involved_chains, @provenance, @confidence, @cadence_valid, @updated_at
   )`
);

const insertEventBatch = db.transaction((rows) => {
  for (const r of rows) insertEvent.run(r);
});

const stressRows = [];
for (const coin of coins) {
  const detail = detailsByCoin[coin.symbol];
  const { z, delta, normalized } = coinZScore(detail);
  // Per-coin peg stress: same formula but scoped to this coin's price drift.
  const coinAlerts = alerts.filter((a) => a.coin === coin.symbol);
  const coinTopFlow = (() => {
    let mx = 0;
    for (const chainData of Object.values(detail?.chainBalances || {})) {
      const tokens = chainData?.tokens || [];
      if (tokens.length < 2) continue;
      const cur = tokens[tokens.length - 1]?.circulating?.peggedUSD || 0;
      const prev = tokens[tokens.length - 2]?.circulating?.peggedUSD || cur;
      mx = Math.max(mx, Math.abs(cur - prev));
    }
    return mx;
  })();
  const coinStress = computePegStress({
    pricesByCoin: { [coin.symbol]: pricesByCoin[coin.symbol]?.price ?? 1 },
    alerts: coinAlerts,
    topChainFlow: coinTopFlow,
  });
  stressRows.push({
    ts: now,
    symbol: coin.symbol,
    stress: coinStress.score,
    z,
    delta,
    normalized,
  });
}
insertStressBatch(stressRows);
console.log(`[stress] stress_series: ${stressRows.length} rows`);

const labelRows = [];
for (const alert of alerts) {
  labelRows.push({
    ts: alert.observedAt || now,
    symbol: alert.coin,
    type: alert.rule,
    severity: alert.severity,
    explanation: alert.headline || alert.rationale,
    magnitude: alert.magnitude ?? null,
  });
}
if (labelRows.length) {
  insertLabelBatch(labelRows);
  console.log(`[labels] labels: ${labelRows.length} rows`);
} else {
  console.log('[labels] no active alerts this cycle');
}

const eventRows = alerts.map((alert) => ({
  event_id: alert.id,
  rule: alert.rule,
  classification: alert.classification || alert.rule,
  symbol: alert.coin,
  severity: alert.severity,
  state: 'open',
  headline: alert.headline || alert.rationale,
  explanation: alert.explanation || alert.headline || alert.rationale,
  magnitude: alert.magnitude ?? null,
  gross_flow: alert.grossFlow ?? null,
  net_supply_delta: alert.netSupplyDelta ?? null,
  source_ts_current: alert.sourceTsCurrent ?? null,
  source_ts_previous: alert.sourceTsPrevious ?? null,
  interval_hours: alert.intervalHours ?? null,
  interval_label: alert.intervalLabel ?? null,
  observed_at: alert.observedAt ?? null,
  detected_at: now,
  published_at: now,
  involved_chains: JSON.stringify(alert.chains || (alert.chain ? [alert.chain] : [])),
  provenance: JSON.stringify(alert.provenance || { source: 'stress-job' }),
  confidence: alert.confidence || 'medium',
  cadence_valid: alert.cadenceValid ? 1 : 0,
  updated_at: now,
}));
if (eventRows.length) insertEventBatch(eventRows);

const openIds = new Set(eventRows.map((r) => r.event_id));
const staleOpen = db.prepare(`SELECT event_id FROM alert_events WHERE state = 'open'`).all();
const resolveStmt = db.prepare(`UPDATE alert_events SET state = 'resolved', updated_at = ? WHERE event_id = ?`);
let resolved = 0;
for (const row of staleOpen) {
  if (!openIds.has(row.event_id)) {
    resolveStmt.run(now, row.event_id);
    resolved += 1;
  }
}
console.log(`[alert_events] open=${eventRows.length} resolved=${resolved}`);

console.log('[stress] done');
  const sourceTs = alerts.reduce((max, a) => Math.max(max, a.observedAt || 0), 0) || now;
  finishJob(job, { ok: true, sourceTs });
} else {
const helixBase = process.env.HELIX_API_BASE || 'https://helix.withkeshav.com';
const coins = getActiveCoins();
const now = Date.now();
const symbols = coins.map((c) => c.symbol);

const insertStress = db.prepare(
  `INSERT OR REPLACE INTO stress_series (ts, symbol, peg_stress_index, z_score, raw_delta, normalized_delta)
   VALUES (@ts, @symbol, @stress, @z, @delta, @normalized)`
);

const insertLabel = db.prepare(
  `INSERT OR REPLACE INTO labels (ts, symbol, alert_type, severity, explanation, magnitude)
   VALUES (@ts, @symbol, @type, @severity, @explanation, @magnitude)`
);

const insertStressBatch = db.transaction((rows) => {
  for (const r of rows) insertStress.run(r);
});

const insertLabelBatch = db.transaction((rows) => {
  for (const r of rows) insertLabel.run(r);
});

const insertEvent = db.prepare(
  `INSERT OR REPLACE INTO alert_events (
     event_id, rule, classification, symbol, severity, state, headline, explanation,
     magnitude, gross_flow, net_supply_delta, source_ts_current, source_ts_previous,
     interval_hours, interval_label, observed_at, detected_at, published_at,
     involved_chains, provenance, confidence, cadence_valid, updated_at
   ) VALUES (
     @event_id, @rule, @classification, @symbol, @severity, @state, @headline, @explanation,
     @magnitude, @gross_flow, @net_supply_delta, @source_ts_current, @source_ts_previous,
     @interval_hours, @interval_label, @observed_at, @detected_at, @published_at,
     @involved_chains, @provenance, @confidence, @cadence_valid, @updated_at
   )`
);

const insertEventBatch = db.transaction((rows) => {
  for (const r of rows) insertEvent.run(r);
});

// 1) Stress rows from Helix trends: peg_stress_index is the newest
// depeg_index, z/raw/normalized reuse the shared stats core over prices.
const stressRows = [];
let newestSourceTs = 0;
for (const coin of coins) {
  const trends = await helixGetJson(`${helixBase}/api/trends?asset=${coin.symbol}`);
  const points = Array.isArray(trends?.points) ? trends.points : [];
  const row = mapStressRow(coin.symbol, points, now);
  if (!row) {
    console.log(`[stress] ${coin.symbol}: no Helix points`);
    continue;
  }
  stressRows.push(row);
  if (row.ts > newestSourceTs) newestSourceTs = row.ts;
}
if (stressRows.length) insertStressBatch(stressRows);
console.log(`[stress] stress_series: ${stressRows.length} rows`);

// 2) Canonical alerts from Helix events (newest first per tracked asset).
let eventsPayload = null;
try {
  eventsPayload = await helixGetJson(`${helixBase}/api/events?limit=100`);
} catch {
  eventsPayload = null;
}
const tracked = eventsPayload ? filterTrackedEvents(normalizeEventsPayload(eventsPayload), symbols) : [];
console.log(`[stress] helix events: ${tracked.length} rows`);

const labelRows = [];
const eventRows = [];
for (const ev of tracked) {
  const label = mapHelixEventToLabel(ev);
  if (label) labelRows.push(label);
  const row = mapHelixEventToRow(ev, now);
  if (row) eventRows.push(row);
}
if (labelRows.length) {
  insertLabelBatch(labelRows);
  console.log(`[labels] labels: ${labelRows.length} rows`);
} else {
  console.log('[labels] no active alerts this cycle');
}
if (eventRows.length) insertEventBatch(eventRows);

const openIds = new Set(eventRows.map((r) => r.event_id));
const staleOpen = db.prepare(`SELECT event_id FROM alert_events WHERE state = 'open'`).all();
const resolveStmt = db.prepare(`UPDATE alert_events SET state = 'resolved', updated_at = ? WHERE event_id = ?`);
let resolved = 0;
for (const row of staleOpen) {
  if (!openIds.has(row.event_id)) {
    resolveStmt.run(now, row.event_id);
    resolved += 1;
  }
}
console.log(`[alert_events] open=${eventRows.length} resolved=${resolved}`);

console.log('[stress] done');
  finishJob(job, { ok: true, sourceTs: newestSourceTs || now });
}
} catch (err) {
  finishJob(job, { ok: false, error: err });
  console.error(`[stress] failed: ${err.message || err}`);
  process.exit(1);
}
