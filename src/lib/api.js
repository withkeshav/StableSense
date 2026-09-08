import { STABLECOIN_REGISTRY } from '../utils/coin-config.js';
import { CACHE_PREFIX } from '../utils/storage.js';
import { aiApiBase } from '../config.js';
import { transformMarketPayload } from './marketBackend.js';

const CG_BASE = 'https://api.coingecko.com/api/v3';

const TTL = {
  fast: 60_000,
  chart: 300_000,
};
const FETCH_TIMEOUT_MS = 20000;

const memoryCache = new Map();
const inflight = new Map();

function readMemory(key) {
  const hit = memoryCache.get(key);
  return hit ? { ts: hit.ts, data: hit.data, revalidating: hit.revalidating || false } : null;
}

function writeMemory(key, data) {
  memoryCache.set(key, { ts: Date.now(), data, revalidating: false });
}

function readLocal(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    // private mode or quota exceeded: fall back to the in-memory cache only
  }
}

async function fetchWithTimeout(url, signal) {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  let onSignal;
  if (signal) {
    onSignal = () => ctrl.abort();
    signal.addEventListener('abort', onSignal);
  }
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener('abort', onSignal);
  }
}

async function doFetch(url, signal) {
  const res = await fetchWithTimeout(url, signal);
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${url}`);
  return res.json();
}

async function revalidate(key, url) {
  const mem = readMemory(key);
  if (mem?.revalidating) return;
  memoryCache.set(key, { ts: mem?.ts || 0, data: mem?.data ?? null, revalidating: true });
  try {
    const data = await doFetch(url);
    writeMemory(key, data);
    writeLocal(key, { ts: Date.now(), data });
  } catch {
    // keep the stale cache intact
    memoryCache.set(key, { ts: mem?.ts || 0, data: mem?.data ?? null, revalidating: false });
  }
}

async function fetchAndStore(key, url, signal) {
  if (inflight.has(key)) return inflight.get(key);
  const promise = (async () => {
    try {
      const data = await doFetch(url, signal);
      writeMemory(key, data);
      writeLocal(key, { ts: Date.now(), data });
      return data;
    } catch (err) {
      const stale = readLocal(key);
      if (stale && stale.data != null) return stale.data;
      throw err;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, promise);
  return promise;
}

/**
 * Cache-aware fetch with two policies:
 * - `ttl`: how fresh the cached copy must be to avoid the network.
 * - `swr`: when true, a stale-but-present cached copy is returned immediately
 *   while a background refresh refreshes the cache (stale-while-revalidate).
 * On a network error, the last known cached copy is returned instead of
 * throwing, so the dashboard never blanks after it has loaded once.
 */
export async function cachedRequest(key, url, { ttl = TTL.fast, swr = true, signal } = {}) {
  const mem = readMemory(key);
  if (mem && Date.now() - mem.ts < ttl && !mem.revalidating) return mem.data;

  const local = readLocal(key);
  if (local && Date.now() - local.ts < ttl) {
    if (!mem) writeMemory(key, local.data);
    return local.data;
  }
  if (local && swr && local.data != null) {
    void revalidate(key, url);
    return local.data;
  }
  return fetchAndStore(key, url, signal);
}

function cgChartUrl(id) {
  return `${CG_BASE}/coins/${id}/market_chart?vs_currency=usd&days=90&interval=daily`;
}

function cgTickersUrl(id) {
  return `${CG_BASE}/coins/${id}/tickers?limit=8`;
}

/**
 * Dashboard market data from the local backend (/api/market, Helix via the
 * fetch cron). The ONLY source for the dashboard path; loadCoinChart below
 * still uses CoinGecko for the 90d coin-tab chart and tickers.
 * On network error with a warm cache, cachedRequest returns the stale copy
 * instead of throwing, so the dashboard never blanks after loading once.
 */
export async function fetchMarketFromBackend({ signal, symbol } = {}) {
  const upper = symbol ? String(symbol).toUpperCase() : null;
  const key = upper ? `backendMarket:${upper}` : 'backendMarket';
  const path = upper ? `/api/market?symbol=${encodeURIComponent(upper)}` : '/api/market';
  const payload = await cachedRequest(key, backendUrl(path), { ttl: TTL.fast, swr: true, signal });
  return transformMarketPayload(payload);
}

/**
 * Dashboard entry point used by App.jsx. Backend only; never falls back to
 * direct upstream calls. When /api/market fails with no cached copy, throw
 * so App.jsx shows its existing failure message.
 */
export async function fetchDashboardData({ signal } = {}) {
  try {
    return await fetchMarketFromBackend({ signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new Error('All market data sources are unavailable.');
  }
}

/**
 * Lazily add a coin's price history and top exchange tickers to `data`.
 * Called when a coin tab opens; results are cached for a short window.
 */
export async function loadCoinChart(symbol, data, { signal } = {}) {
  const cfg = STABLECOIN_REGISTRY[symbol];
  if (!cfg || !data) return;

  const chart = await cachedRequest(`cgChart:${symbol}`, cgChartUrl(cfg.coingeckoId), {
    ttl: TTL.chart,
    swr: true,
    signal,
  }).catch(() => null);
  if (chart && Array.isArray(chart?.prices)) data[`cg${symbol}Chart`] = chart;

  const tickers = await cachedRequest(`cgTickers:${symbol}`, cgTickersUrl(cfg.coingeckoId), {
    ttl: TTL.chart,
    swr: true,
    signal,
  }).catch(() => null);
  if (tickers && Array.isArray(tickers?.tickers)) {
    data[`cg${symbol}`] = { tickers: tickers.tickers.slice(0, 8) };
  }
}

function backendUrl(path) {
  const base = String(aiApiBase || '').replace(/\/+$/, '');
  return `${base}${path}`;
}

/**
 * Optional backend health: last persisted market snapshot and AI run.
 * Returns null when the lite backend is not served on this origin.
 */
export async function fetchHealthz({ signal } = {}) {
  try {
    const res = await fetch(backendUrl('/api/healthz'), { signal });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Canonical alert lifecycle from SQLite. Returns null when the backend is absent.
 */
export async function fetchCanonicalAlerts({ signal, days = 30, state = 'all' } = {}) {
  try {
    const res = await fetch(backendUrl(`/api/alerts?days=${days}&state=${encodeURIComponent(state)}`), { signal });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
