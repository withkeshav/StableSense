import { generateCurrentAlerts } from '../../src/lib/alert-policy.js';
import { STABLECOIN_REGISTRY, ACTIVE_STABLECOINS } from '../../src/utils/coin-config.js';

const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const inWindow = (ts, window) => ts >= window.start && ts < window.end;
const rank = { WARNING: 1, HIGH: 2, CRITICAL: 3 };
function validateWindow(w) {
  if (!finite(w?.start) || !finite(w?.end) || w.start <= 0 || w.end <= w.start) throw new Error('Invalid evaluation window');
}

/** Offline replay. Prices are observed at their source time, never at request time. */
export function replayPrices(dataset, { assumedDelayMs = 0 } = {}) {
  validateWindow(dataset.window);
  if (!finite(dataset.expectedStepMs) || dataset.expectedStepMs <= 0) throw new Error('Expected sample interval required');
  if (!finite(assumedDelayMs) || assumedDelayMs < 0) throw new Error('Invalid assumed delay');
  if (!dataset.source || dataset.quote !== 'USD') throw new Error('Price replay requires a named USD source; normalize quote pairs separately');
  const incidents = dataset.incidents || [], negatives = dataset.negativeWindows || [];
  for (const w of [...incidents, ...negatives]) {
    validateWindow(w);
    if (!w.source) throw new Error('Evaluation labels require independent evidence');
    if (w.start < dataset.window.start || w.end > dataset.window.end) throw new Error('Label outside evaluation window');
  }
  for (const p of incidents) for (const n of negatives) if (p.start < n.end && n.start < p.end) throw new Error('Positive/negative labels overlap');
  if (!ACTIVE_STABLECOINS.includes(dataset.symbol)) return { id: dataset.id, symbol: dataset.symbol, status: 'unsupported', incidents: [], falseAlarmRate: null };
  const cfg = STABLECOIN_REGISTRY[dataset.symbol];
  const exclusions = { invalid: 0, outsideWindow: 0, duplicate: 0, conflicting: 0 };
  const byTime = new Map(), conflicts = new Set();
  for (const p of dataset.observations || []) {
    if (!finite(p.observedAt) || p.observedAt <= 0 || !finite(p.price) || p.price <= 0 ||
        (p.availableAt != null && (!finite(p.availableAt) || p.availableAt < p.observedAt))) { exclusions.invalid++; continue; }
    if (!inWindow(p.observedAt, dataset.window)) { exclusions.outsideWindow++; continue; }
    if (conflicts.has(p.observedAt)) { exclusions.conflicting++; continue; }
    if (byTime.has(p.observedAt)) {
      const previous = byTime.get(p.observedAt);
      if (previous.price !== p.price || previous.availableAt !== p.availableAt) {
        byTime.delete(p.observedAt); conflicts.add(p.observedAt); exclusions.conflicting += 2;
      } else exclusions.duplicate++;
      continue;
    }
    byTime.set(p.observedAt, p);
  }
  const rows = [...byTime.values()].sort((a,b) => a.observedAt - b.observedAt).map((p) => {
    const evaluatedAt = (p.availableAt ?? p.observedAt) + assumedDelayMs;
    const alert = generateCurrentAlerts({ cgSimple: { [cfg.coingeckoId]: { usd: p.price, last_updated_at: p.observedAt / 1000 } } }, evaluatedAt).find((a) => a.rule === 'PEG_BREAK' && a.coin === dataset.symbol);
    return { ...p, evaluatedAt, severity: alert?.severity ?? null, stale: evaluatedAt - p.observedAt >= 7200000 };
  });
  const coverage = (window) => {
    const subset = rows.filter((p) => inWindow(p.observedAt, window));
    const times = subset.map((p) => p.observedAt);
    const gaps = times.slice(1).map((t,i) => t-times[i]);
    const maxGapMs = gaps.length ? Math.max(...gaps) : null;
    const edgeTolerance = dataset.expectedStepMs * 1.5;
    const complete = times.length >= 2 && times[0] - window.start <= edgeTolerance && window.end - times.at(-1) <= edgeTolerance && maxGapMs <= dataset.expectedStepMs * 1.5;
    return { samples: subset.length, first: times[0] ?? null, last: times.at(-1) ?? null, maxGapMs, completeAtDeclaredCadence: complete };
  };
  const outcomes = incidents.map((incident) => {
    const candidates = rows.filter((p) => inWindow(p.observedAt,incident));
    const hits = candidates.filter((p) => p.severity && inWindow(p.evaluatedAt,incident));
    const measured = coverage(incident);
    const observable = measured.completeAtDeclaredCadence && candidates.every((p) => !p.stale && inWindow(p.evaluatedAt,incident));
    return { id: incident.id, source: incident.source, ...measured,
      status: hits.length ? 'detected' : observable ? 'missed_in_sampled_feed' : 'unmeasurable',
      warningSamples: hits.length, criticalSamples: hits.filter((p) => p.severity === 'CRITICAL').length,
      firstWarningObservedAt: hits[0]?.observedAt ?? null, firstWarningEvaluatedAt: hits.length ? Math.min(...hits.map((p) => p.evaluatedAt)) : null,
      worstSeverity: hits.reduce((a,p) => rank[p.severity] > (rank[a] || 0) ? p.severity : a, null),
      minPrice: candidates.length ? Math.min(...candidates.map((p) => p.price)) : null,
      maxPrice: candidates.length ? Math.max(...candidates.map((p) => p.price)) : null };
  });
  const counts = { WARNING: 0, HIGH: 0, CRITICAL: 0 }, episodes = [];
  let active = null, previous = null;
  for (const row of rows) {
    if (row.severity) counts[row.severity]++;
    if (!row.severity || previous && row.observedAt - previous.observedAt > dataset.expectedStepMs * 1.5) active = null;
    if (row.severity) {
      if (!active) { active = { first: row.observedAt, last: row.observedAt, samples: 0, worstSeverity: row.severity }; episodes.push(active); }
      active.last = row.observedAt; active.samples++;
      if (rank[row.severity] > rank[active.worstSeverity]) active.worstSeverity = row.severity;
    }
    previous = row;
  }
  const negativeSamples = rows.filter((p) => !p.stale && negatives.some((w) => inWindow(p.observedAt,w) && inWindow(p.evaluatedAt,w)));
  const falseAlarms = negativeSamples.filter((p) => p.severity).length;
  return { id: dataset.id, symbol: dataset.symbol, status: rows.length ? 'measured' : 'unmeasurable', source: dataset.source, quote: dataset.quote,
    availability: !rows.length ? 'unknown' : rows.every((p) => p.availableAt != null) ? 'recorded' : 'assumed_at_observation', assumedDelayMs,
    inputRows: dataset.observations?.length || 0, exclusions, coverage: coverage(dataset.window),
    staleSamples: rows.filter((p) => p.stale).length, severitySamples: counts, warningSamples: rows.filter((p) => p.severity).length,
    warningEpisodes: episodes.length, episodes, incidents: outcomes,
    unmatchedWarningSamples: rows.filter((p) => p.severity && !incidents.some((w) => inWindow(p.observedAt,w))).length,
    labelledNegativeSamples: negativeSamples.length, falseAlarmSamples: negativeSamples.length ? falseAlarms : null,
    falseAlarmRate: negativeSamples.length ? falseAlarms / negativeSamples.length : null,
    observations: rows };
}
