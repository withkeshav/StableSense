// Shared, deterministic chart descriptions. No model, network, or invented causes.
import { fmtB } from '../utils/formatters.js';

export const CHART_STORIES = {
  supply: { title: 'Circulating supply', source: 'Helix supply history', definition: 'USD circulating value of displayed tracked coins. Not reserves or the global market.' },
  supplyPct: { title: 'Supply change from first reading', source: 'Helix supply history', definition: 'Percent change from each displayed coin\'s first measured supply. Not market share.' },
  price: { title: 'Price against $1', source: 'CoinGecko price history', definition: 'Observed market price of displayed coins. Not reserves or a guarantee of redemption.' },
  deviation: { title: 'Distance from $1', source: 'CoinGecko price history', definition: 'Market price minus $1 in basis points; one basis point is 0.01%.' },
  dominance: { title: 'Share of tracked supply', source: 'Helix supply history', definition: 'Share of combined supply of all tracked coins at aligned observations. Not global market share.' },
  flow: { title: 'Supply change by chain', source: 'Helix chain snapshots', definition: 'Measured daily supply-value changes for displayed chains and selected coins. Not transfers or payment volume.' },
  volume: { title: 'Volume by exchange', source: 'CoinGecko ticker sample', definition: 'Sampled 24h USD trading volume, one highest-volume ticker per venue. Not full exchange or market volume.' },
};
const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const utc = (ms) => new Date(ms).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';
const signed = (n, suffix) => `${n > 0 ? '+' : ''}${n.toFixed(2)}${suffix}`;

/** Read only the same arrays sent to Chart.js, including filters and percent mode. */
export function buildChartStory(data, spec = {}) {
  const template = CHART_STORIES[spec.kind];
  if (!template) return null;
  const series = (data?.datasets || []).filter((d) => !d.reference && !d.hidden && !['$1 peg', '0 bps'].includes(d.label))
    .map((d) => ({ label: d.label, points: (d.data || []).map((v, i) => ({ value: v, date: data.dates?.[i], label: data.labels?.[i] })).filter((p) => finite(p.value)) }))
    .filter((d) => d.points.length);
  if (!series.length) return null;
  const dates = series.flatMap((d) => d.points.map((p) => p.date)).filter((d) => finite(d) && d > 0);
  if (!['flow', 'volume'].includes(spec.kind) && series.some((d) => d.points.some((p) => !finite(p.date) || p.date <= 0))) return null;
  const asOf = dates.length ? Math.max(...dates) : spec.asOf;
  if (!finite(asOf) || asOf <= 0) return null;
  const scope = series.map((d) => d.label).join(', ');
  let interpretation;
  if (spec.kind === 'flow' || spec.kind === 'volume') {
    const points = series.flatMap((d) => d.points);
    const top = [...points].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0];
    interpretation = top.value === 0 ? (spec.kind === 'volume' ? 'All displayed venues have zero sampled volume.' : 'All displayed bars measure zero change.')
      : `${top.label}: ${fmtB(top.value)}, the largest ${spec.kind === 'flow' ? 'absolute supply change' : 'sampled volume'} among ${points.length} displayed ${spec.kind === 'flow' ? 'chains' : 'venues'}.`;
    if (spec.kind === 'flow') interpretation += ` ${spec.scope || 'Tracked coins'}. ${spec.complete === false ? 'Coverage is partial.' : 'No transfer between chains is established.'}`;
  } else if (spec.kind === 'price' || spec.kind === 'deviation') {
    const all = series.flatMap((d) => d.points.map((p) => ({ ...p, coin: d.label, drift: spec.kind === 'price' ? (p.value - 1) * 10000 : p.value })));
    const peak = all.reduce((a, b) => Math.abs(a.drift) >= Math.abs(b.drift) ? a : b);
    interpretation = `Largest observed deviation: ${peak.coin}, ${signed(peak.drift, ' bps')} on ${utc(peak.date)}. Between-sample moves are not measured.`;
  } else {
    const ranked = [...series].sort((a, b) => Math.abs(b.points.at(-1).value - b.points[0].value) - Math.abs(a.points.at(-1).value - a.points[0].value));
    const lead = ranked[0], first = lead.points[0], last = lead.points.at(-1), delta = last.value - first.value;
    const value = (v) => spec.kind === 'supply' ? fmtB(v) : `${v.toFixed(2)}%`;
    const allFlat = series.every((s) => s.points.length > 1 && s.points.every((p) => p.value === s.points[0].value));
    interpretation = allFlat ? 'Every displayed series is unchanged across its measured observations. This does not establish conditions between observations.' : lead.points.length < 2 ? `${lead.label}: ${value(last.value)} at the only measured point. No trend can be calculated.`
      : `${lead.label}: ${value(first.value)} to ${value(last.value)}; ${spec.kind === 'supply' ? fmtB(delta) : signed(delta, ' percentage points')} over its plotted window.${series.length > 1 ? ' Largest absolute change among displayed series.' : ''}`;
  }
  const gaps = series.some((d) => d.points.length < (data.labels || []).length);
  return { title: `${template.title}${spec.scope ? `: ${spec.scope}` : ''}`, rangeLabel: spec.kind === 'flow' ? 'Daily comparison' : spec.kind === 'volume' ? '24h ticker sample' : 'Plotted observations',
    rangeDetail: dates.length ? `${utc(Math.min(...dates))} to ${utc(Math.max(...dates))}` : `Snapshot ${utc(asOf)}; underlying windows may differ`,
    interpretation, definition: `${template.definition}${gaps ? ' Missing readings are gaps.' : ''}`,
    sourceLabel: template.source, asOf, timestamp: utc(asOf), highlight: spec.kind === 'volume' || spec.kind === 'flow' ? '' : `Displayed: ${scope}` };
}
