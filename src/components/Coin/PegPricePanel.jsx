import { fmtPrice } from '../../utils/formatters.js';
import ChartWrapper from '../ui/ChartWrapper.jsx';

/**
 * Price-discipline panel: secondary-market price against the $1.00 reference line.
 */
export default function PegPricePanel({ symbol, price, pegBps, priceLineData, priceChartOpts, goLearn, asOf = null }) {
  return (
    <article class="panel glass asset-price-panel signal-lens">
      <header class="panel-head">
        <div>
          <p class="panel-kicker">PRICE DISCIPLINE</p>
          <h2>{symbol} around the peg</h2>
          <p class="panel-sub">Market price versus the $1.00 reference</p>
        </div>
      </header>
      <div class="panel-chart">
        <ChartWrapper
          type="line"
          data={priceLineData}
          height={280}
          aspectRatio={16 / 10}
          options={priceChartOpts}
          ariaLabel={`${symbol} price versus one dollar peg`}
          shareTitle={`${symbol} price vs $1.00`}
          shareRange="~90D"
          shareInterpretation={`${symbol} secondary-market price against the $1.00 reference. A price picture, not a reserve-quality assessment.`}
          shareDefinition={`${symbol} market price versus a $1.00 reference line over the last 90 days, for the tracked asset on this dashboard.`}
          shareHighlight={pegBps == null ? `${fmtPrice(price)} now · price unavailable` : `${fmtPrice(price)} now · ${pegBps > 0 ? '+' : ''}${pegBps} bp from peg`}
          shareAsOf={asOf}
        />
      </div>
      <footer class="chart-footer">
        <span><i class="legend-dot cobalt-dot" />{pegBps == null ? `${fmtPrice(price)} now · price unavailable` : `${fmtPrice(price)} now · ${pegBps > 0 ? '+' : ''}${pegBps} bp from peg`}</span>
        <button type="button" onClick={goLearn}>What moves the peg?</button>
      </footer>
    </article>
  );
}
