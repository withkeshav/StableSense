import { fmtPrice } from '../../utils/formatters.js';
import ChartWrapper from '../ui/ChartWrapper.jsx';

/**
 * Price-discipline panel: secondary-market price against the $1.00 reference line.
 */
export default function PegPricePanel({ symbol, price, pegBps, priceLineData, priceChartOpts, goLearn }) {
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
          shareTitle={`${symbol} peg`}
          shareRange="~90D"
          shareInterpretation={`${symbol} market price relative to the $1.00 reference. This is a price picture, not a reserve-quality assessment.`}
          shareDefinition={`Secondary-market ${symbol} price versus a $1.00 peg line for tracked coins on this dashboard.`}
          shareHighlight={pegBps == null ? `${fmtPrice(price)} now · price unavailable` : `${fmtPrice(price)} now · ${pegBps > 0 ? '+' : ''}${pegBps} bp from peg`}
        />
      </div>
      <footer class="chart-footer">
        <span><i class="legend-dot cobalt-dot" />{pegBps == null ? `${fmtPrice(price)} now · price unavailable` : `${fmtPrice(price)} now · ${pegBps > 0 ? '+' : ''}${pegBps} bp from peg`}</span>
        <button type="button" onClick={goLearn}>What moves the peg?</button>
      </footer>
    </article>
  );
}
