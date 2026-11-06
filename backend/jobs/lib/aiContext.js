import { buildFreshness } from '../../../src/lib/freshness.js';
import { transformMarketPayload } from '../../../src/lib/marketBackend.js';
import { computePegStress, rankChainFlows } from '../../../src/lib/derive.js';

import { generateCurrentAlerts } from '../../../src/lib/alert-policy.js';

export const CONTEXT_VERSION = 2;
const money = (n) => typeof n === 'number' && Number.isFinite(n) ? `$${n.toFixed(2)}` : 'unavailable';
const stamp = (n) => typeof n === 'number' && Number.isFinite(n) && n > 0 ? new Date(n).toISOString() : 'unavailable';

/** Pure input assembly. Never substitute legacy aggregates, labels or Helix scores. */
export function buildNarrativeInput(market, nowMs = Date.now()) {
  const freshness = buildFreshness({ ...market, complete: market.coverage?.complete }, nowMs);
  const ready = market.coverage?.complete === true && freshness.overallState === 'Current';
  const meta = { contextVersion: CONTEXT_VERSION, spotObservedAt: market.spotObservedAt,
    supplyObservedAt: market.supplyObservedAt, marketObservedAt: market.observedAt };
  if (!ready) return { ready: false, text: 'Current market coverage is incomplete or stale; no narrative generated.', meta };

  const data = transformMarketPayload(market);
  const alerts = generateCurrentAlerts(data, nowMs);
  const details = Object.fromEntries(market.coins.map((coin) => [coin.symbol, data[`${coin.symbol.toLowerCase()}Detail`]]));
  const flows = rankChainFlows(details);
  const stress = computePegStress({ pricesByCoin: Object.fromEntries(market.coins.map((coin) => [coin.symbol, coin.price])),
    alerts, topChainFlow: flows[0]?.totalDelta || 0 });
  const lines = [
    `Scope: exactly ${market.coins.length} tracked USD-pegged coins (${market.coins.map((coin) => coin.symbol).join(', ')}), not the global stablecoin market.`,
    `Price observations: ${stamp(market.spotObservedAt)}. Supply observations: ${stamp(market.supplyObservedAt)}. These are source times, not generation time.`,
    `Combined circulating value across all tracked coins and their covered chains: ${money(market.market.totalCirculatingUsd)}. Net 24h supply-value change: ${money(market.market.delta24hUsd)}.`,
    'Supply changes are not payment volume or proof of transfers between chains. Unknown comparisons remain unavailable.',
  ];
  for (const coin of market.coins) {
    lines.push(`${coin.symbol}: all ${coin.chains.length} covered chains total ${money(coin.supply)}; net 24h change ${money(coin.supplyDelta24h)}; price $${coin.price.toFixed(6)} as of ${stamp(coin.ts)}; supply as of ${stamp(coin.supplyObservedAt)}.`);
    lines.push(`Largest three chains for ${coin.symbol} (subset, not the coin total): ${coin.chains.slice(0, 3).map((chain) => `${chain.chain} ${money(chain.supply)}; 24h change ${money(chain.delta24h)}`).join('; ')}.`);
  }
  lines.push(`StableSense dashboard Peg Stress Index: ${stress.score}/100 (${stress.level}); this is not Helix's Depeg Index or a probability of default.`);
  lines.push('Dashboard formula: largest absolute peg drift in basis points times 0.7, plus 25 per critical alert, 10 per high alert, 4 per warning, plus a chain-change contribution capped at 35; final score rounded and capped at 100. No z-score is supplied: the current two-point chain readings do not establish a historical baseline.');
  lines.push(`Current deterministic dashboard alerts: ${alerts.filter((a) => a.severity !== 'INFO').length} warnings; ${alerts.filter((a) => a.severity === 'INFO').length} routine activity observations. Historical Helix event labels are excluded; absence of a current rule match is not proof of safety.`);
  for (const alert of alerts) lines.push(`- ${alert.coin} ${alert.rule} (${alert.severity}): ${alert.headline}; source observation ${stamp(alert.observedAt)}.`);
  return { ready, text: lines.join('\n'), meta };
}

/** Reject old-context or expired narratives before serving them to the browser. */
export function narrativeIsCurrent(row, nowMs = Date.now(), cadenceMs = 7200000) {
  if (!row || !Number.isFinite(row.ts) || row.ts > nowMs || nowMs - row.ts >= cadenceMs) return false;
  let meta;
  try { meta = JSON.parse(row.meta); } catch { return false; }
  if (meta?.contextVersion !== CONTEXT_VERSION) return false;
  return buildFreshness({ ...meta, complete: true }, nowMs).overallState === 'Current'
    && Number.isFinite(meta.spotObservedAt) && meta.spotObservedAt > 0 && meta.spotObservedAt <= nowMs
    && Number.isFinite(meta.supplyObservedAt) && meta.supplyObservedAt > 0 && meta.supplyObservedAt <= nowMs;
}

/** Malformed model output must never be stored as a market explanation. */
export function parseNarrative(content) {
  const text = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const value = JSON.parse(text);
  const limits = { headline: 120, narrative: 400, implications: 300 };
  const result = {};
  for (const [key, limit] of Object.entries(limits)) {
    if (typeof value?.[key] !== 'string' || !value[key].trim()) throw new Error(`Model output missing ${key}`);
    result[key] = value[key].trim().replace(/\u2014/g, '-').slice(0, limit);
  }
  return result;
}
