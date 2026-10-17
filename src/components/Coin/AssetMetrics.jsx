import { fmtB, fmtPct, fmtPrice } from '../../utils/formatters.js';

/**
 * The four headline metric tiles: price, peg stability, supply, reserve design.
 * Every tile states what it measures, and renders a hyphen rather than a false number.
 */
export default function AssetMetrics({ price, pegBps, score, warnBps, supply, prev, chg, meta }) {
  return (
    <section class="asset-metrics">
      <article>
        <span>Current price</span>
        <strong>{fmtPrice(price)}</strong>
        <small>{pegBps == null ? 'Price unavailable' : pegBps === 0 ? 'On peg' : `${pegBps > 0 ? '+' : ''}${pegBps} bp from peg`}</small>
      </article>
      <article>
        <span>Peg stability</span>
        <strong>{score} <small>/100</small></strong>
        <small>{pegBps == null ? 'Waiting for price data' : Math.abs(pegBps) < warnBps ? 'Normal 24h conditions' : 'Elevated drift - observe'}</small>
      </article>
      <article>
        <span>Circulating supply</span>
        <strong>{fmtB(supply)}</strong>
        <small>{fmtPct(chg)} market · {supply == null || prev == null ? '-' : fmtB(supply - prev)} 24h supply Δ</small>
      </article>
      <article>
        <span>Reserve design</span>
        <strong>{meta.reserveDesign}</strong>
        <small>Classification fact, not a credit rating</small>
      </article>
    </section>
  );
}
