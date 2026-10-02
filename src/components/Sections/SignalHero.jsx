import { fmtPrice, bps } from '../../utils/formatters.js';
import AiTicker from '../ui/AiTicker.jsx';

function StabilityGauge({ value = null }) {
  const measured = typeof value === 'number' && Number.isFinite(value);
  const score = measured ? Math.max(0, Math.min(100, value)) : null;
  const offset = measured ? 358 - (358 * score / 100) : 358;
  return (
    <div class="gauge-wrap">
      <svg viewBox="0 0 150 150" class="gauge" aria-label={measured ? `Peg Stability Index: ${score} out of 100` : 'Peg Stability Index: UNKNOWN'}>
        <circle cx="75" cy="75" r="57" class="gauge-track" />
        <circle cx="75" cy="75" r="57" class="gauge-value" stroke-dasharray="358" stroke-dashoffset={offset} />
        <circle cx="75" cy="75" r="43" class="gauge-inner" />
      </svg>
      <div class="gauge-copy">
        <strong>{measured ? score : '-'}</strong>
        <span>{measured ? 'of 100' : 'UNKNOWN'}</span>
      </div>
    </div>
  );
}

function levelNote(level) {
  if (level === 'UNKNOWN') return 'Insufficient market observations';
  const l = String(level || '').toLowerCase();
  if (l.includes('crit') || l.includes('high') || l.includes('stress')) return 'Elevated stress conditions';
  if (l.includes('warn') || l.includes('watch')) return 'Watch conditions - observe, do not panic';
  return 'Normal market conditions';
}

export default function SignalHero({ coins, priceByCoin, stress, intelligence, onLearn, dataQuality, refreshIntervalSec, freshness }) {
  const state = freshness?.overallState || 'Current';
  const cadence = freshness
    ? `${String(state).toUpperCase()} MARKET CLOCK`
    : (refreshIntervalSec ? `${Math.round(refreshIntervalSec / 60)} MINUTE CHECK CADENCE` : 'MARKET CHECK');
  const measured = typeof stress?.score === 'number' && Number.isFinite(stress.score);
  const live = measured && (state === 'Current' || state === 'Delayed');
  const stressScore = measured ? stress.score : null;
  const stability = measured ? Math.max(0, Math.min(100, 100 - stressScore)) : null;
  const steadyWord = stressScore >= 70 ? 'stressed' : stressScore >= 40 ? 'watchful' : 'steady';
  const headline = !measured ? 'Peg stress and stability cannot be measured from missing or partial price observations.' : intelligence?.headline
    || (stress?.level
      ? `Peg stress is ${String(stress.level).toLowerCase()} (${stressScore}/100 stress · ${stability}/100 stability).`
      : 'Reading live peg and supply signals.');

  return (
    <section class="market-hero glass signal-lens mb-4">
      <img class="hero-art" src="/stablesense-signal-lens.jpg" alt="" loading="lazy" width="1400" height="787" />
      <div class="hero-copy">
        <div class="eyebrow">
          <span class={`live-dot ${live ? '' : 'is-stale'}`} aria-hidden="true" />
          MARKET PULSE
          <span class="eyebrow-divider" />
          {cadence}
        </div>
        <h1>
          {measured ? <>The stablecoin market is <em>{steadyWord}.</em></> : <>Market conditions are <em>unknown.</em></>}
        </h1>
        <p>
          {headline} {measured ? 'Driven by peg drift, active alerts, and cross-chain flow pressure. This is an observation score, not advice.' : 'Missing inputs are not evidence of a steady market.'}
        </p>
        <AiTicker intelligence={measured ? intelligence : null} />
        {dataQuality && dataQuality.length ? (
          <p class="signal-subtitle warn-note">
            Note: {dataQuality.map((d) => d.coin).join(', ')} supply data temporarily unavailable.
          </p>
        ) : null}
        {onLearn ? (
          <div class="hero-actions">
            <button type="button" class="primary-btn" onClick={onLearn}>
              How is this scored?
            </button>
          </div>
        ) : null}
      </div>
      <div class="hero-gauge">
        <StabilityGauge value={stability} />
        <div class="hero-gauge-copy">
          <p class="gauge-label">Peg stability index</p>
          <p class="gauge-note">{measured ? `${levelNote(stress.level)} (100 minus stress score)` : 'UNKNOWN: insufficient market observations'}</p>
        </div>
      </div>
      <div class="signal-prices inline-prices" aria-label="Tracked coin peg prices">
        {(coins || []).map((c) => {
          const drift = bps(priceByCoin[c.symbol]);
          return (
            <span key={c.symbol}>
              {c.symbol} <strong>{fmtPrice(priceByCoin[c.symbol])}</strong>
              <small>({drift == null ? '-' : `${drift} bps`})</small>
            </span>
          );
        })}
      </div>
    </section>
  );
}

export { StabilityGauge };
