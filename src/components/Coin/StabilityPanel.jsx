import { StabilityGauge } from '../Sections/SignalHero.jsx';

/**
 * Stability index panel: gauge plus the warn/critical band explanation.
 */
export default function StabilityPanel({ score, pegBps, warnBps, critBps }) {
  return (
    <article class="asset-score glass">
      <p class="panel-kicker">STABILITY INDEX</p>
      <StabilityGauge value={score} />
      <h2>{pegBps == null ? 'Waiting for data' : Math.abs(pegBps) < warnBps ? 'Normal conditions' : 'Watch conditions'}</h2>
      <p>
        Score from current distance to $1.00 versus this asset&apos;s warn ({warnBps} bps) and critical ({critBps} bps) bands.
        It is not a solvency or reserve audit.
      </p>
    </article>
  );
}
