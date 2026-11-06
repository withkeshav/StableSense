import { generateAlerts } from './derive.js';

const HOUR = 3600000;
export const ALERT_DISPLAY_WINDOW_MS = 24 * HOUR;

/** Use the supporting observation, never the time a record was fetched or resolved. */
export function isRecentAlert(alert, nowMs = Date.now()) {
  const observed = alert.observedAt ?? alert.timestamp;
  return Number.isFinite(observed) && observed > 0 && observed <= nowMs
    && nowMs - observed < ALERT_DISPLAY_WINDOW_MS;
}
/** Current feed only. Historical observations remain available separately. */
export function generateCurrentAlerts(data, nowMs = Date.now()) {
  if (!data) return [];
  return generateAlerts(data, { detectedAt: nowMs }).filter((alert) => {
    const observed = alert.observedAt;
    if (!Number.isFinite(observed) || observed <= 0 || observed > nowMs) return false;
    if (alert.rule === 'DATA_QUALITY') return false; // Coverage/freshness communicates feed failures.
    if (alert.rule === 'PEG_BREAK') return nowMs - observed < 2 * HOUR;
    return data.coverage?.complete !== false && alert.cadenceValid && isRecentAlert(alert, nowMs);
  });
}

/** Badge counts are current warnings, not unread messages or routine activity. */
export function alertSummary(alerts = []) {
  const actionable = alerts.filter((alert) => ['WARNING', 'HIGH', 'CRITICAL'].includes(alert.severity));
  return {
    count: actionable.length,
    tone: actionable.some((alert) => alert.severity === 'CRITICAL') ? 'critical'
      : actionable.length ? 'warning' : 'neutral',
  };
}
