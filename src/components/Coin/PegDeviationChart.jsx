import ChartWrapper from '../ui/ChartWrapper.jsx';

/**
 * Distance from the $1 peg in basis points, with a minimum -50/+50 range.
 */
export default function PegDeviationChart({ symbol, bpsData, bpsOpts }) {
  return (
    <div class="card mb-4">
      <div class="card-header"><div class="card-title">{symbol} Peg Deviation (bps)</div></div>
      <div class="card-body chart-card-body">
        <ChartWrapper type="line" data={bpsData} options={bpsOpts} height={180} shareSpec={{ kind: 'deviation', scope: symbol }}
              />
        <p class="text-muted small" style="margin-top:6px">Distance from the $1 peg in basis points. The scale includes at least -50 to +50 bps and expands for larger moves. 0 bps = exactly on peg.</p>
      </div>
    </div>
  );
}
