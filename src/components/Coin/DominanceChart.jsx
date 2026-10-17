import ChartWrapper from '../ui/ChartWrapper.jsx';

/**
 * Share-of-tracked-supply chart. Rendered only when enough history exists.
 */
export default function DominanceChart({ symbol, data, dominanceData, dominanceOpts }) {
  return (
    <div class="card mb-4 mt-4">
      <div class="card-header"><div class="card-title">{symbol} Dominance</div></div>
      <div class="card-body chart-card-body">
        <ChartWrapper type="line" data={dominanceData} options={dominanceOpts} height={200} aspectRatio={16 / 10} shareTitle={`${symbol} dominance`} shareRange="Tracked supply" shareInterpretation={`${symbol} share of the combined 5 tracked stablecoins on this dashboard over time.`} shareDefinition={`${symbol}'s share of combined tracked stablecoin supply (USDT, USDC, DAI, USDE, PYUSD), not global market share.`} shareAsOf={data?.observedAt ?? data?.marketObservedAt ?? null} />
        <p class="text-muted small" style="margin-top:6px">{symbol}&apos;s share of the combined tracked stablecoin supply (USDT, USDC, DAI, USDE, PYUSD) over time.</p>
      </div>
    </div>
  );
}
