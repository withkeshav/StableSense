/**
 * Pure mapping logic for the Helix-Signal upstream.
 *
 * No fetch/database code here. All functions operate on plain JSON shaped
 * like the verified Helix responses:
 * - trends: { asset, window, generated_at, points: [{ timestamp,
 *   total_supply, price, ... }], summary }
 * - trends/chains: only mapped when per-chain supply is present, otherwise
 *   callers write zero rows and log unmapped.
 */

export const H24_MS = 24 * 3600 * 1000;

/**
 * Convert a Helix timestamp to epoch ms.
 * Accepts epoch ms, epoch seconds, numeric strings, or ISO date strings.
 * @param {number|string} ts
 * @returns {number|null} Epoch ms, or null when unparseable.
 */
export function toMs(ts) {
  if (typeof ts === 'number' && Number.isFinite(ts)) {
    if (ts >= 1e12) return Math.floor(ts);
    if (ts >= 1e9) return Math.floor(ts * 1000);
    return Math.floor(ts);
  }
  if (typeof ts === 'string' && ts.trim() !== '') {
    const trimmed = ts.trim();
    const asNum = Number(trimmed);
    if (Number.isFinite(asNum) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
      return toMs(asNum);
    }
    const parsed = Date.parse(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/**
 * Pick the newest point from a trends points array (oldest first, newest last).
 * Robust to unsorted input: uses max timestamp when parseable, else last element.
 * @param {Array<object>} points
 * @returns {object|null}
 */
export function selectNewestPoint(points) {
  if (!Array.isArray(points) || points.length === 0) return null;
  let best = null;
  let bestMs = -Infinity;
  let hasValidTs = false;
  for (const p of points) {
    const ms = p ? toMs(p.timestamp) : null;
    if (ms == null) continue;
    hasValidTs = true;
    if (ms >= bestMs) {
      bestMs = ms;
      best = p;
    }
  }
  return hasValidTs ? best : points[points.length - 1];
}

/**
 * Find the point at or before 24h prior to newestMs, closest to that target.
 * Returns null when no point exists at or before the target (window too short).
 * @param {Array<object>} points
 * @param {number} newestMs
 * @returns {object|null}
 */
export function findPointClosestTo24hAgo(points, newestMs) {
  if (!Array.isArray(points) || points.length === 0) return null;
  if (!Number.isFinite(newestMs)) return null;
  const target = newestMs - H24_MS;
  let best = null;
  let bestMs = -Infinity;
  for (const p of points) {
    const ms = p ? toMs(p.timestamp) : null;
    if (ms == null || ms > target) continue;
    if (ms > bestMs) {
      bestMs = ms;
      best = p;
    }
  }
  return best;
}

function getSupply(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const candidates = [
    obj.supply,
    obj.total_supply,
    obj.totalSupply,
    obj.circulating,
    obj.circulating_usd,
    obj.supply_usd,
    obj.value,
  ];
  for (const v of candidates) {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  // Nested circulating.peggedUSD (DefiLlama-style, tolerated just in case).
  const nested = obj.circulating?.peggedUSD;
  if (typeof nested === 'number' && Number.isFinite(nested)) return nested;
  return null;
}

function getChainKey(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const v = obj.chain_key ?? obj.chain ?? obj.chainKey ?? obj.network ?? obj.chain_name;
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function getPointTsMs(obj) {
  if (!obj || typeof obj !== 'object') return null;
  return toMs(obj.timestamp ?? obj.ts ?? obj.time ?? obj.date);
}

/**
 * Extract per-chain series from an unknown trends/chains payload.
 * Returns null when the payload carries no per-chain supply.
 * @param {any} payload
 * @returns {Array<{chain: string, points: Array<{tsMs: number, supply: number}>}>|null}
 */
export function extractChainSeries(payload) {
  if (!payload || typeof payload !== 'object') return null;

  // Case A: root series/chains array; entries carry nested points or are flat rows.
  // Production shape (verified 2026-09-08): { asset, window, series:
  //   [{ chain_key, chain_name, points: [{ timestamp, supply, ... }] }] }
  const chainEntries = Array.isArray(payload.series) ? payload.series : Array.isArray(payload.chains) ? payload.chains : null;
  if (chainEntries) {
    const byChain = new Map();
    let foundSupply = false;
    for (const entry of chainEntries) {
      if (!entry || typeof entry !== 'object') continue;
      const chain = getChainKey(entry);
      const nestedPoints = entry.points ?? entry.series ?? entry.history ?? null;
      if (Array.isArray(nestedPoints)) {
        if (!chain) continue;
        if (!byChain.has(chain)) byChain.set(chain, []);
        for (const p of nestedPoints) {
          const tsMs = getPointTsMs(p);
          const supply = getSupply(p);
          if (tsMs == null || supply == null) continue;
          foundSupply = true;
          byChain.get(chain).push({ tsMs, supply });
        }
      } else {
        // Flat row: { chain_key, timestamp, supply/total_supply/... }
        const tsMs = getPointTsMs(entry);
        const supply = getSupply(entry);
        if (!chain || tsMs == null || supply == null) continue;
        foundSupply = true;
        if (!byChain.has(chain)) byChain.set(chain, []);
        byChain.get(chain).push({ tsMs, supply });
      }
    }
    if (!foundSupply || byChain.size === 0) return null;
    return [...byChain.entries()].map(([chain, points]) => ({ chain, points }));
  }

  // Case B: root array or { data: [...] } of flat chain rows.
  const items = Array.isArray(payload) ? payload : payload.data;
  if (Array.isArray(items)) {
    const byChain = new Map();
    let foundSupply = false;
    for (const entry of items) {
      if (!entry || typeof entry !== 'object') continue;
      const chain = getChainKey(entry);
      const tsMs = getPointTsMs(entry);
      const supply = getSupply(entry);
      if (!chain || tsMs == null || supply == null) continue;
      foundSupply = true;
      if (!byChain.has(chain)) byChain.set(chain, []);
      byChain.get(chain).push({ tsMs, supply });
    }
    if (!foundSupply || byChain.size === 0) return null;
    return [...byChain.entries()].map(([chain, points]) => ({ chain, points }));
  }

  // Case C: { points: [{ timestamp, chains: { eth: supply } or [{chain,supply}] }] }
  if (Array.isArray(payload.points)) {
    const byChain = new Map();
    let foundSupply = false;
    for (const p of payload.points) {
      if (!p || typeof p !== 'object') continue;
      const tsMs = getPointTsMs(p);
      if (tsMs == null) continue;
      const perChain = p.chains ?? p.per_chain ?? p.chain_breakdown ?? p.breakdown ?? null;
      if (Array.isArray(perChain)) {
        for (const row of perChain) {
          const chain = getChainKey(row);
          const supply = getSupply(row);
          if (!chain || supply == null) continue;
          foundSupply = true;
          if (!byChain.has(chain)) byChain.set(chain, []);
          byChain.get(chain).push({ tsMs, supply });
        }
      } else if (perChain && typeof perChain === 'object') {
        for (const [chain, rawSupply] of Object.entries(perChain)) {
          const supply =
            typeof rawSupply === 'number'
              ? rawSupply
              : getSupply(rawSupply);
          if (supply == null) continue;
          foundSupply = true;
          if (!byChain.has(chain)) byChain.set(chain, []);
          byChain.get(chain).push({ tsMs, supply });
        }
      }
    }
    if (!foundSupply || byChain.size === 0) return null;
    return [...byChain.entries()].map(([chain, points]) => ({ chain, points }));
  }

  return null;
}

/**
 * Map one tracked coin's newest trends point to a prices row.
 * Keys match the fetch.js prepared statement params (@coin,@ts,@price,@change,@volume).
 * @param {string} symbol
 * @param {object} point Newest trends point.
 * @param {Array<object>} [points] Full points array (enables the 24h change calc).
 * @returns {{coin: string, ts: number|null, price: number|null, change: number|null, volume: null}}
 */
export function mapPriceRow(symbol, point, points) {
  const newestMs = point ? toMs(point.timestamp) : null;
  // 24h change: newest price minus the point closest to 24h ago, when both exist.
  let change = null;
  if (point && newestMs != null) {
    const prev = findPointClosestTo24hAgo(points || [point], newestMs);
    if (prev && typeof prev.price === 'number' && Number.isFinite(prev.price)) {
      change = point.price - prev.price;
    }
  }
  return {
    coin: symbol,
    ts: newestMs,
    price: point && typeof point.price === 'number' && Number.isFinite(point.price) ? point.price : null,
    change,
    volume: null,
  };
}

/**
 * Map a trends/chains payload to snapshot rows.
 * circulating = chain supply x point price. delta vs that chain's point
 * closest to (nearest at or before) 24h ago, else null.
 * Returns null when the payload carries no per-chain supply (unmapped).
 * Keys match the fetch.js prepared statement params (@coin,@chain,@ts,@circulating,@delta).
 * @param {string} symbol
 * @param {any} chainsPayload Raw JSON from /api/trends/chains?asset=SYMBOL.
 * @param {number|null} price Newest trends point price.
 * @returns {Array<{coin: string, chain: string, ts: number, circulating: number, delta: number|null}>|null}
 */
export function mapChainRows(symbol, chainsPayload, price) {
  const series = extractChainSeries(chainsPayload);
  if (!series) return null;
  if (typeof price !== 'number' || !Number.isFinite(price)) return [];
  const rows = [];
  for (const { chain, points } of series) {
    if (!points.length) continue;
    let newest = points[0];
    for (const p of points) {
      if (p.tsMs >= newest.tsMs) newest = p;
    }
    const target = newest.tsMs - H24_MS;
    let prev = null;
    for (const p of points) {
      if (p.tsMs > target) continue;
      if (!prev || p.tsMs > prev.tsMs) prev = p;
    }
    rows.push({
      coin: symbol,
      chain,
      ts: newest.tsMs,
      circulating: newest.supply * price,
      delta: prev ? (newest.supply - prev.supply) * price : null,
    });
  }
  return rows;
}

function getTotalSupply(point) {
  if (!point || typeof point !== 'object') return null;
  const v = point.total_supply ?? point.totalSupply ?? point.supply ?? null;
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * Build the aggregate market snapshot from per-coin trends points.
 * total = sum of newest total_supply across tracked coins.
 * delta = sum of (newest minus point closest to 24h ago) per coin,
 *   null if any coin lacks a 24h-ago point.
 * @param {Record<string, Array<object>>} trendsBySymbol Map symbol -> points array.
 * @returns {{ts: number, total: number, delta: number|null}|null}
 */
export function buildMarketSnapshot(trendsBySymbol) {
  if (!trendsBySymbol || typeof trendsBySymbol !== 'object') return null;
  const symbols = Object.keys(trendsBySymbol);
  if (symbols.length === 0) return null;
  let total = 0;
  let deltaSum = 0;
  let newestTs = -Infinity;
  let hasDelta = true;
  let validCoins = 0;
  for (const symbol of symbols) {
    const points = trendsBySymbol[symbol];
    const newest = selectNewestPoint(points);
    if (!newest) return null;
    const supply = getTotalSupply(newest);
    const tsMs = toMs(newest.timestamp);
    if (supply == null || tsMs == null) return null;
    validCoins += 1;
    total += supply;
    if (tsMs > newestTs) newestTs = tsMs;
    const prev = findPointClosestTo24hAgo(points, tsMs);
    const prevSupply = prev ? getTotalSupply(prev) : null;
    if (!prev || prevSupply == null) {
      hasDelta = false;
    } else {
      deltaSum += supply - prevSupply;
    }
  }
  if (validCoins === 0) return null;
  return { ts: newestTs, total, delta: hasDelta ? deltaSum : null };
}
