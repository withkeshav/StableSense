import ChartWrapper from '../ui/ChartWrapper.jsx';

/**
 * Deduped top-venue 24h volume, labelled as a venue sample rather than full market volume.
 */
export default function ExchangeVolumeChart({ symbol, exchBars, chartOptions, asOf = null }) {
  return (
    <div class="card">
      <div class="card-header"><div class="card-title">{symbol} Exchange Volume</div></div>
      <div class="card-body chart-card-body">
        <ChartWrapper type="bar" data={exchBars} height={160} options={chartOptions} shareSpec={{ kind: 'volume', scope: symbol, asOf }}
              />
      </div>
    </div>
  );
}
