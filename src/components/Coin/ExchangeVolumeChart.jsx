import ChartWrapper from '../ui/ChartWrapper.jsx';

/**
 * Deduped top-venue 24h volume, labelled as a venue sample rather than full market volume.
 */
export default function ExchangeVolumeChart({ symbol, data, exchBars, chartOptions, asOf = null }) {
  return (
    <div class="card">
      <div class="card-header"><div class="card-title">{symbol} Exchange Volume</div></div>
      <div class="card-body chart-card-body">
        <ChartWrapper type="bar" data={exchBars} height={180} aspectRatio={16 / 10} options={chartOptions} shareTitle={`${symbol} exchange volume by venue`} shareRange="Top venues" shareRangeDetail={asOf ? `Snapshot ${new Date(asOf).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}` : 'Top venue snapshot'} shareInterpretation={`${symbol} 24h volume at the top CoinGecko venues, deduplicated by exchange. A venue sample, not full market volume.`} shareDefinition={`Top venue ${symbol} volumes from CoinGecko tickers fetched in this browser, deduplicated. Not full market volume and not on-chain transfer volume.`} shareSource="CoinGecko tickers" shareAsOf={asOf} />
      </div>
    </div>
  );
}
