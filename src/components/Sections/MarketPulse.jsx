import { useState } from 'preact/hooks';
import ChartWrapper from '../ui/ChartWrapper.jsx';
import Subtabs from '../ui/Subtabs.jsx';

const VIEWS = [
  { id: 'supply', label: 'Supply' },
  { id: 'peg', label: 'Peg' },
];

function hasSeries(series) {
  return Array.isArray(series?.labels)
    && series.labels.length > 0
    && (series.datasets || []).some((dataset) => (
      Array.isArray(dataset.data)
      && dataset.data.some((value) => typeof value === 'number' && Number.isFinite(value))
    ));
}

export default function MarketPulse({
  supplyChartData,
  supplyChartOptions = {},
  pegChartData,
  pegChartOptions = {},
  onToggleLog,
  onTogglePct,
  supplyLog,
  supplyPct,
  compareAll = false,
  onToggleCompare,
  narrow = false,
  onLearn,
}) {
  const [view, setView] = useState('supply');
  const supply = view === 'supply';
  const supplyReady = hasSeries(supplyChartData);
  const pegReady = hasSeries(pegChartData);


  return (
    <section class="market-detail-block mb-4">
      <article class="panel glass signal-lens market-detail-panel">
        <header class="panel-head market-detail-head">
          <div class="market-detail-title">
            <p class="panel-kicker">MARKET DETAIL</p>
            <h2>{supply ? 'Stablecoin supply' : 'Peg monitor'}</h2>
            <p class="panel-sub">
              {supply
                ? 'Circulating value of tracked coins on this dashboard'
                : 'Market price versus the $1.00 reference'}
            </p>
          </div>
          <div class="market-detail-actions">
            <Subtabs items={VIEWS} value={view} onChange={setView} ariaLabel="Market detail view" />
            {supply ? (
              <div class="segmented chart-toggles" role="group" aria-label="Supply chart scale">
                {narrow && onToggleCompare ? (
                  <button type="button" class={compareAll ? 'selected' : ''} onClick={onToggleCompare} aria-pressed={compareAll} title="Show every tracked coin on this chart">
                    {compareAll ? 'Top 2' : 'Compare all'}
                  </button>
                ) : null}
                <button type="button" class={supplyPct ? 'selected' : ''} onClick={onTogglePct} aria-pressed={supplyPct} title="Show percent change from first point">%</button>
                <button type="button" class={supplyLog ? 'selected' : ''} onClick={onToggleLog} aria-pressed={supplyLog} title="Toggle logarithmic scale so small coins are visible">Log</button>
              </div>
            ) : null}
          </div>
        </header>
        <div class="panel-chart market-detail-chart">
          <div id="subtab-panel-supply" role="tabpanel" aria-labelledby="subtab-supply" hidden={!supply}>
            {supply ? (supplyReady ? (
              <ChartWrapper
                type="line"
                data={supplyChartData}
                options={supplyChartOptions}
                height={300}
                ariaLabel="Supply trend for tracked stablecoins"
                shareSpec={{ kind: supplyPct ? 'supplyPct' : 'supply' }}
              />
            ) : (
              <div class="info-empty">No measured supply history yet. The chart waits for the next backend snapshot.</div>
            )) : null}
          </div>
          <div id="subtab-panel-peg" role="tabpanel" aria-labelledby="subtab-peg" hidden={supply}>
            {!supply ? (pegReady ? (
              <ChartWrapper
                type="line"
                data={pegChartData}
                options={pegChartOptions}
                height={300}
                ariaLabel="Peg monitor with one dollar reference line"
                shareSpec={{ kind: 'price' }}
              />
            ) : (
              <div class="info-empty">No measured peg history yet. The chart waits for the next CoinGecko response.</div>
            )) : null}
          </div>
        </div>
        <footer class="chart-footer">
          {supply ? (
            <>
              <span><i class="legend-dot blue-dot" />Use Log or % so smaller coins stay visible</span>
              {onLearn ? (
                <button type="button" onClick={onLearn}>Understand supply</button>
              ) : null}
            </>
          ) : (
            <span><i class="legend-dot cobalt-dot" />Dashed line marks the $1.00 peg</span>
          )}
        </footer>
      </article>
    </section>
  );
}
