import { bps } from '../../utils/formatters.js';

function bpsText(value) {
  if (value == null) return '-';
  const abs = Math.abs(value);
  return `${value > 0 ? '+' : ''}${value} ${abs === 1 ? 'bp' : 'bps'}`;
}

function titleCase(value) {
  const text = String(value || '');
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

const COUNT_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

function countWord(value) {
  return COUNT_WORDS[value] || String(value);
}

/**
 * OpenDesign homepage hero: the market read on the left, the peg band on the
 * right. The band is the signature element; every mark is a tracked coin's
 * measured drift from $1.00, not a decorative sample.
 */
export default function PegBandHero({ coins = [], priceByCoin = {}, stress, alerts = [], freshness, chainFlows = [] }) {
  const state = freshness?.overallState || 'Current';
  const measured = typeof stress?.score === 'number' && Number.isFinite(stress.score);
  const stressScore = measured ? stress.score : null;
  const stability = measured ? Math.max(0, Math.min(100, 100 - stressScore)) : null;
  const steadyWord = stressScore == null ? null : stressScore >= 70 ? 'stressed' : stressScore >= 40 ? 'watchful' : 'steady';

  const drifts = coins
    .map((coin) => ({ ...coin, drift: bps(priceByCoin[coin.symbol]) }))
    .filter((coin) => coin.drift != null)
    .sort((a, b) => a.drift - b.drift);

  // Two coins can sit on the same drift. Give each duplicate a small vertical
  // lane so both marks remain visible instead of hiding one under the other.
  const laneByDrift = new Map();
  const marks = drifts.map((coin) => {
    const lane = laneByDrift.get(coin.drift) ?? 0;
    laneByDrift.set(coin.drift, lane + 1);
    return { ...coin, lane };
  });
  const inside = drifts.filter((coin) => Math.abs(coin.drift) <= 10).length;
  const allInside = drifts.length === coins.length && coins.length > 0 && inside === coins.length;
  const gain = [...chainFlows].filter((flow) => flow.totalDelta > 0).sort((a, b) => b.totalDelta - a.totalDelta)[0];
  const loss = [...chainFlows].filter((flow) => flow.totalDelta < 0).sort((a, b) => a.totalDelta - b.totalDelta)[0];

  const flowLine = gain && loss
    ? `Supply is leaving ${titleCase(loss.chain)} and settling on ${titleCase(gain.chain)} today.`
    : 'Peg drift, supply and cross-chain flow, in one calm view.';
  const alertCount = (alerts || []).length;
  const coinCount = countWord(coins.length);
  const heroCount = coinCount.charAt(0).toUpperCase() + coinCount.slice(1);
  const observedAt = freshness?.marketObservedAt ?? null;
  const observedText = observedAt
    ? `Market observed ${new Date(observedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC`
    : 'Market observation time unavailable';
  const ariaLabel = drifts.length
    ? `Tracked coins plotted against a 10 basis point band around one dollar. ${drifts.map((coin) => `${coin.symbol} ${bpsText(coin.drift)}`).join(', ')}.`
    : 'No measured peg prices are available.';

  return (
    <section class="od-hero" aria-labelledby="od-hero-title">
      <div class="od-hero-copy">
        <p class="od-eyebrow">Market pulse</p>
        <h1 id="od-hero-title">
          {steadyWord ? <>The stablecoin market is <em>{steadyWord}.</em></> : <>Market conditions are <em>unknown.</em></>}
        </h1>
        <p class="od-hero-sub">{heroCount} tracked coins, one peg band. {flowLine}</p>
        <div class="od-pills">
          <span class="od-pill">
            <span>Peg stability</span>
            <b>{stability == null ? '-' : `${stability} / 100`}</b>
            <span class="od-meter" aria-hidden="true"><i style={{ width: `${stability ?? 0}%` }} /></span>
          </span>
          <span class="od-pill"><span class="od-pdot" aria-hidden="true" /><span><b>{alertCount}</b> open alerts</span></span>
          <span class={`od-pill od-state ${state === 'Current' || state === 'Delayed' ? 'is-live' : 'is-stale'}`}>{state}</span>
        </div>
        <p class="od-freshness">{observedText}</p>
      </div>

      <div class="od-peg-card">
        <div class="od-peg-head">
          <div>
            <h2>Peg band</h2>
            <p>Deviation from $1.00 inside the 10 bps band.</p>
          </div>
          <span class="od-band-chip"><i aria-hidden="true" />10 bps band</span>
        </div>

        <div class="od-peg-plot" role="img" aria-label={ariaLabel}>
          <div class="od-peg-band" aria-hidden="true">
            <span class="od-band-rule top" />
            <span class="od-band-rule bottom" />
          </div>
          <div class="od-peg-center" aria-hidden="true" />
          <span class="od-peg-parity" aria-hidden="true">1.0000</span>
          {marks.map((coin, index) => {
            const x = Math.max(8, Math.min(92, 50 + coin.drift * 8.8));
            const above = index % 2 === 0;
            return (
              <div
                key={coin.symbol}
                class={`od-peg-mark ${above ? 'above' : 'below'}`}
                style={{ '--x': `${x}%`, '--c': coin.color, '--d': `${0.48 + index * 0.08}s`, '--lane': coin.lane }}
              >
                <span class="od-peg-dot" />
                <span class="od-peg-stem" />
                <span class="od-peg-tag"><b>{coin.symbol}</b><em>{bpsText(coin.drift)}</em></span>
              </div>
            );
          })}
        </div>

        <div class="od-peg-legend" aria-hidden="true">
          {coins.map((coin) => {
            const drift = bps(priceByCoin[coin.symbol]);
            return (
              <span class="od-peg-legend-item" key={coin.symbol} style={{ '--c': coin.color }}>
                <span class="od-dot" /><b>{coin.symbol}</b><span>{bpsText(drift)}</span>
              </span>
            );
          })}
        </div>
        <div class="od-peg-foot">
          <span class="od-dot" aria-hidden="true" />
          {allInside
            ? `All ${coinCount} coins sit inside the 10 bps band.`
            : `${inside} of ${coinCount} coins sit inside the 10 bps band.`}
        </div>
      </div>
    </section>
  );
}
