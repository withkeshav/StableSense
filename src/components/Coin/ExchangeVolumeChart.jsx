import ChartWrapper from '../ui/ChartWrapper.jsx';

/**
 * Deduped top-venue 24h volume, labelled as a venue sample rather than full market volume.
 */
export default function ExchangeVolumeChart({ symbol, data, exchBars, chartOptions }) {
  return (
    <div class="card">
      <div class="card-header"><div class="card-title">{symbol} Exchange Volume</div></div>
      <div class="card-body chart-card-body">
        <ChartWrapper type="bar" data={exchBars} height={180} aspectRatio={16 / 10} options={chartOptions} shareTitle={`${symbol} volume`} shareRange="Top venues" shareInterpretation={`${symbol} 24h volume across top CoinGecko venues, deduped by exchange. Venue sample, not full market volume.`} shareDefinition="Top venue volumes from CoinGecko tickers for tracked coins on this dashboard, deduplicated, not full market volume." shareAsOf={data?.observedAt ?? data?.marketObservedAt ?? null} />
      </div>
    </div>
  );
}
