import { STABLECOIN_REGISTRY } from '../utils/coin-config.js';
import { CACHE_PREFIX } from '../utils/storage.js';
import { aiApiBase } from '../config.js';
import { transformMarketPayload } from './marketBackend.js';

const CG_BASE = 'https://api.coingecko.com/api/v3';

const TTL = {
  fast: 60_000,
  chart: 300_000,
};

/**
 * How old a cached /api/market payload may be and still be rendered straight
 * away. The backend fetch cron runs every 10 minutes, so a payload older than
 * this is not a live view. Refetching first is what keeps one clock from
 * claiming today while the other claims nine days ago.
 */
const MAX_MARKET_STALE_MS = 2 * 3600_000;
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

function dropLocal(key) {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // private mode: nothing persisted to purge
  }
}

/**
 * Run an optional payload validator without letting it break the request. A
 * validator that throws is treated as a rejection, because a cache entry we
 * cannot prove well shaped is not one we may render as real numbers.
 * @param {unknown} value
 * @param {((payload: unknown) => boolean) | undefined} validate
 * @returns {boolean}
 */
function passesValidate(value, validate) {
  if (typeof validate !== 'function') return true;
  try {
    return Boolean(validate(value));
  } catch {
    return false;
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

async function fetchAndStore(key, url, signal, validate) {
  if (inflight.has(key)) return inflight.get(key);
  const promise = (async () => {
    try {
      const data = await doFetch(url, signal);
      writeMemory(key, data);
      writeLocal(key, { ts: Date.now(), data });
      return data;
    } catch (err) {
      // Offline fallback: serve the last known copy, but only one that passes
      // the same shape check the fast paths use. A corrupt entry throws the
      // network error instead of feeding garbage to the transform.
      const stale = readLocal(key);
      if (stale && stale.data != null && passesValidate(stale.data, validate)) return stale.data;
      throw err;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, promise);
  return promise;
}

/**
 * Shape check for a cached /api/market payload. The cache is served before
 * anything else looks at it, so a corrupted or tampered entry would otherwise
 * be transformed and rendered as real numbers with no warning. Requires a
 * plain object carrying an Array `coins` field and an object `market` field,
 * which is exactly what transformMarketPayload reads.
 * @param {unknown} payload
 * @returns {boolean}
 */
export function looksLikeMarketPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  if (!Array.isArray(payload.coins)) return false;
  const market = payload.market;
  return Boolean(market) && typeof market === 'object' && !Array.isArray(market);
}

/**
 * Cache-aware fetch with two policies:
 * - `ttl`: how fresh the cached copy must be to avoid the network.
 * - `swr`: when true, a stale-but-present cached copy is returned immediately
 *   while a background refresh refreshes the cache (stale-while-revalidate).
 * On a network error, the last known cached copy is returned instead of
 * throwing, so the dashboard never blanks after it has loaded once.
 *
 * `validate` (optional) shape-checks a CACHED payload only, memory or local.
 * A candidate that fails is treated as absent, so the request falls through to
 * a normal fetch: a bad memory entry is deleted from the in-memory map and a
 * bad local entry has its key removed, so it cannot be re-read on the next
 * miss. A validator that throws counts as a rejection. Network responses are
 * never validated: a valid fetch is stored and returned as-is, and a network
 * error still falls back to a cached copy, but only to one that validates.
 */
export async function cachedRequest(key, url, { ttl = TTL.fast, swr = true, signal, maxStale = null, validate } = {}) {
  let mem = readMemory(key);
  if (mem && Date.now() - mem.ts < ttl && !mem.revalidating) {
    if (passesValidate(mem.data, validate)) return mem.data;
    // Poisoned memory copy: purge it so it is not served again this session.
    memoryCache.delete(key);
    mem = null;
  }

  // Validate every candidate cache read, fresh or stale: the off-ttl path is
  // exactly the one that renders a stale copy while revalidating. A failing
  // local entry is dropped so it cannot be re-read on the next miss.
  let local = readLocal(key);
  if (local && !passesValidate(local.data, validate)) {
    dropLocal(key);
    local = null;
  }
  if (local && Date.now() - local.ts < ttl) {
    if (!mem) writeMemory(key, local.data);
    return local.data;
  }
  // A cached copy past `maxStale` is not a live view. Refetch instead of
  // serving it, so the freshness clocks never pair a week-old payload with a
  // seconds-old health check.
  const tooStale = maxStale != null && local && Date.now() - local.ts > maxStale;
  if (local && swr && local.data != null && !tooStale) {
    void revalidate(key, url);
    return local.data;
  }
  return fetchAndStore(key, url, signal, validate);
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
 * The cache is shape-checked with looksLikeMarketPayload: a corrupted or
 * tampered stored payload counts as a miss and is refetched rather than
 * transformed into confident-looking wrong numbers.
 */
export async function fetchMarketFromBackend({ signal, symbol } = {}) {
  const upper = symbol ? String(symbol).toUpperCase() : null;
  const key = upper ? `backendMarket:${upper}` : 'backendMarket';
  const path = upper ? `/api/market?symbol=${encodeURIComponent(upper)}` : '/api/market';
  const payload = await cachedRequest(key, backendUrl(path), {
    ttl: TTL.fast,
    swr: true,
    maxStale: MAX_MARKET_STALE_MS,
    signal,
    validate: looksLikeMarketPayload,
  });
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
    // The ticker sample has its own clock, separate from the Helix market
    // clock. Share cards use this instead of pretending the market as-of is
    // the ticker as-of.
    data[`cg${symbol}TickersAt`] = Date.now();
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
