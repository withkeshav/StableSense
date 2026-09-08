/**
 * Pure mapping logic for the Helix path of jobs/stress.js.
 *
 * No fetch/database code here. Statistics core below is extracted verbatim
 * from the legacy coinZScore() in jobs/stress.js so both paths share one
 * implementation. Helix series input is point prices over the returned
 * (7d) window; legacy input is aggregated circulating values.
 */

import { toMs } from './helixMap.js';

/**
 * Path selector. Mirrors fetch.js convention: LEGACY_UPSTREAMS=1 keeps
 * today's behavior, default is Helix. Accepts an env object for tests.
 * @param {object} [env]
 * @returns {'legacy'|'helix'}
 */
export function selectStressPath(env) {
  const e = env ?? process.env;
  return e?.LEGACY_UPSTREAMS === '1' ? 'legacy' : 'helix';
}

/**
 * Stats core extracted verbatim from legacy coinZScore(). Do not rewrite.
 * @param {Array<number>} series
 * @returns {{z: number, delta: number, normalized: number}}
 */
export function statsFromSeries(series) {
  if (!Array.isArray(series) || series.length < 8) return { z: 0, delta: 0, normalized: 0 };
  const deltas = [];
  for (let i = 1; i < series.length; i += 1) deltas.push(series[i] - series[i - 1]);
  const currentDelta = deltas[deltas.length - 1] || 0;
  const baseline = deltas.slice(0, -1);
  const avg = baseline.reduce((a, b) => a + b, 0) / (baseline.length || 1);
  const variance = baseline.reduce((acc, v) => acc + (v - avg) ** 2, 0) / (baseline.length || 1);
  const sd = Math.sqrt(variance);
  const z = sd > 0 ? (Math.abs(currentDelta) - avg) / sd : 0;
  const total = series.reduce((a, b) => a + b, 0) || 1;
  const normalized = (currentDelta / total) * 100;
  return { z: Math.min(z, 10), delta: currentDelta, normalized };
}

/**
 * Extract finite price numbers from Helix trends points, in order.
 * @param {Array<object>} points
 * @returns {Array<number>}
 */
export function pricesFromPoints(points) {
  if (!Array.isArray(points)) return [];
  const out = [];
  for (const p of points) {
    const v = p?.price;
    if (typeof v === 'number' && Number.isFinite(v)) out.push(v);
  }
  return out;
}

/**
 * Map one tracked coin's Helix trends points to a stress_series row.
 * peg_stress_index is the newest point's depeg_index (0 fallback when
 * missing, since the column is NOT NULL). z/raw/normalized come from the
 * shared stats core over the window's price series.
 * Keys match the stress.js prepared statement params.
 * @param {string} symbol
 * @param {Array<object>} points
 * @param {number} [fallbackTs]
 * @returns {{ts: number, symbol: string, stress: number, z: number, delta: number, normalized: number}|null}
 */
export function mapStressRow(symbol, points, fallbackTs) {
  if (!Array.isArray(points) || points.length === 0) return null;
  let newest = null;
  let newestMs = -Infinity;
  for (const p of points) {
    const ms = p ? toMs(p.timestamp) : null;
    if (ms == null) continue;
    if (ms >= newestMs) {
      newestMs = ms;
      newest = p;
    }
  }
  if (!newest) return null;
  const ts = newestMs ?? fallbackTs ?? Date.now();
  const rawStress = newest.depeg_index;
  const stress = typeof rawStress === 'number' && Number.isFinite(rawStress) ? rawStress : 0;
  const stats = statsFromSeries(pricesFromPoints(points));
  return { ts, symbol, stress, z: stats.z, delta: stats.delta, normalized: stats.normalized };
}

/**
 * Normalize an /api/events payload to an array. Accepts {"data": [...]}
 * or a bare array, as verified.
 * @param {any} payload
 * @returns {Array<object>}
 */
export function normalizeEventsPayload(payload) {
  if (Array.isArray(payload)) return payload.filter((e) => e && typeof e === 'object');
  if (payload && Array.isArray(payload.events)) {
    // Production shape (verified live 2026-09-08): {"generated_at", "events": [...]}
    return payload.events.filter((e) => e && typeof e === 'object');
  }
  if (payload && Array.isArray(payload.data)) {
    return payload.data.filter((e) => e && typeof e === 'object');
  }
  return [];
}

/**
 * Parse |delta| as float when numeric, else null.
 * @param {any} delta
 * @returns {number|null}
 */
export function parseMagnitude(delta) {
  if (typeof delta === 'number') {
    return Number.isFinite(delta) ? Math.abs(delta) : null;
  }
  if (typeof delta === 'string' && delta.trim() !== '') {
    const n = Number(delta.trim());
    return Number.isFinite(n) ? Math.abs(n) : null;
  }
  return null;
}

function eventObservedMs(ev) {
  return toMs(ev?.timestamp);
}

/**
 * Check whether a Helix event has the minimum fields to map.
 * @param {object} ev
 * @returns {boolean}
 */
export function isMappableEvent(ev) {
  if (!ev || typeof ev !== 'object') return false;
  if (ev.id == null || ev.id === '') return false;
  if (typeof ev.asset_symbol !== 'string' || ev.asset_symbol === '') return false;
  if (eventObservedMs(ev) == null) return false;
  return true;
}

/**
 * Keep events for tracked symbols only, newest first.
 * @param {Array<object>} events
 * @param {Array<string>} symbols
 * @returns {Array<object>}
 */
export function filterTrackedEvents(events, symbols) {
  const keep = new Set(symbols);
  return (Array.isArray(events) ? events : [])
    .filter((e) => e && typeof e === 'object' && keep.has(e.asset_symbol))
    .sort((a, b) => (eventObservedMs(b) ?? 0) - (eventObservedMs(a) ?? 0));
}

/**
 * Map one Helix event to an alert_events row. Returns null when the event
 * lacks id, asset_symbol, or a parseable timestamp. Unspecified nullable
 * columns (flows, source ts, intervals) stay null.
 * Keys match the stress.js prepared statement params.
 * @param {object} ev
 * @param {number} nowMs
 * @returns {object|null}
 */
export function mapHelixEventToRow(ev, nowMs) {
  if (!isMappableEvent(ev)) return null;
  const observedMs = eventObservedMs(ev);
  const headline = ev.title ?? ev.summary ?? ev.event_type ?? 'Helix event';
  const explanation = ev.summary ?? ev.title ?? String(headline);
  return {
    event_id: `helix-${String(ev.id)}`,
    rule: ev.event_type ?? 'unknown',
    classification: 'canonical',
    symbol: ev.asset_symbol,
    severity: ev.severity ?? 'info',
    state: 'open',
    headline: String(headline),
    explanation: String(explanation),
    magnitude: parseMagnitude(ev.delta),
    gross_flow: null,
    net_supply_delta: null,
    source_ts_current: null,
    source_ts_previous: null,
    interval_hours: null,
    interval_label: null,
    observed_at: observedMs,
    detected_at: observedMs,
    published_at: nowMs,
    involved_chains: JSON.stringify(ev.chain_key ? [ev.chain_key] : []),
    provenance: JSON.stringify({ source: 'helix-events' }),
    confidence: 'medium',
    cadence_valid: 0,
    updated_at: nowMs,
  };
}

/**
 * Map one Helix event to a labels row. Returns null when unmappable.
 * Keys match the stress.js prepared statement params.
 * @param {object} ev
 * @returns {{ts: number, symbol: string, type: string, severity: string, explanation: string, magnitude: number|null}|null}
 */
export function mapHelixEventToLabel(ev) {
  if (!isMappableEvent(ev)) return null;
  return {
    ts: eventObservedMs(ev),
    symbol: ev.asset_symbol,
    type: ev.event_type ?? 'unknown',
    severity: ev.severity ?? 'info',
    explanation: String(ev.summary ?? ev.title ?? ev.event_type ?? 'Helix event'),
    magnitude: parseMagnitude(ev.delta),
  };
}
