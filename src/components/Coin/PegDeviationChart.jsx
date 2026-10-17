import ChartWrapper from '../ui/ChartWrapper.jsx';

/**
 * Distance from the $1 peg in basis points, on fixed -50/+50 bounds.
 */
export default function PegDeviationChart({ symbol, data, bpsData, bpsOpts }) {
  return (
    <div class="card mb-4">
      <div class="card-header"><div class="card-title">{symbol} Peg Deviation (bps)</div></div>
      <div class="card-body chart-card-body">
        <ChartWrapper type="line" data={bpsData} options={bpsOpts} height={200} aspectRatio={16 / 10} shareTitle={`${symbol} deviation`} shareRange="~90D" shareInterpretation={`${symbol} distance from the $1 peg in basis points over time for tracked coins on this dashboard.`} shareDefinition="Secondary-market distance from the $1 peg in basis points for tracked coins on this dashboard." shareAsOf={data?.observedAt ?? data?.marketObservedAt ?? null} />
        <p class="text-muted small" style="margin-top:6px">Distance from the $1 peg in basis points. Fixed -50/+50 bounds so daily noise does not look like a depeg. 0 bps = exactly on peg.</p>
      </div>
    </div>
  );
}
