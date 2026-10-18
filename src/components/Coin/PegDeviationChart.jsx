import ChartWrapper from '../ui/ChartWrapper.jsx';
import { rangeWithYear } from '../../utils/formatters.js';

/**
 * Distance from the $1 peg in basis points, on fixed -50/+50 bounds.
 */
export default function PegDeviationChart({ symbol, data, bpsData, bpsOpts, asOf = null }) {
  return (
    <div class="card mb-4">
      <div class="card-header"><div class="card-title">{symbol} Peg Deviation (bps)</div></div>
      <div class="card-body chart-card-body">
        <ChartWrapper type="line" data={bpsData} options={bpsOpts} height={200} aspectRatio={16 / 10} shareTitle={`${symbol} peg deviation`} shareRange="~90D" shareRangeDetail={rangeWithYear(bpsData?.labels?.length ? `${bpsData.labels[0]} to ${bpsData.labels[bpsData.labels.length - 1]}` : '90 days', asOf)} shareInterpretation={`${symbol} distance from the $1.00 peg in basis points over the last 90 days.`} shareDefinition={`${symbol} secondary-market distance from the $1.00 peg in basis points. Chart axis is fixed at -50 to +50 bps; 0 bps is exactly on peg.`} shareSource="CoinGecko price history" shareAsOf={asOf} />
        <p class="text-muted small" style="margin-top:6px">Distance from the $1 peg in basis points. Fixed -50/+50 bounds so daily noise does not look like a depeg. 0 bps = exactly on peg.</p>
      </div>
    </div>
  );
}
