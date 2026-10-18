import ChartWrapper from '../ui/ChartWrapper.jsx';

/**
 * Circulating supply panel, with the percent and log scale toggles.
 */
export default function SupplyPanel({
  symbol,
  data,
  supplyLineData,
  supplyLineOptions,
  supplyPct,
  supplyLog,
  setSupplyPct,
  setSupplyLog,
}) {
  return (
    <article class="panel glass">
      <header class="panel-head">
        <div>
          <p class="panel-kicker">MARKET DEPTH</p>
          <h2>Circulating supply</h2>
          <p class="panel-sub">{symbol} supply history</p>
        </div>
        <div class="segmented">
          <button type="button" class={supplyPct ? 'selected' : ''} onClick={() => setSupplyPct((v) => !v)} aria-pressed={supplyPct}>%</button>
          <button type="button" class={supplyLog ? 'selected' : ''} onClick={() => setSupplyLog((v) => !v)} aria-pressed={supplyLog}>Log</button>
        </div>
      </header>
      <div class="panel-chart">
        <ChartWrapper
          type="line"
          data={supplyLineData}
          options={supplyLineOptions}
          height={220}
          aspectRatio={16 / 10}
          ariaLabel={`${symbol} circulating supply`}
          shareTitle={`${symbol} circulating supply`}
          shareRange="Daily history"
          shareRangeDetail={supplyLineData?.labels?.length ? `${supplyLineData.labels[0]} to ${supplyLineData.labels[supplyLineData.labels.length - 1]}` : 'Daily history'}
          shareInterpretation={`${symbol} circulating supply from the backend's daily history, one point per day.`}
          shareDefinition={`Circulating ${symbol} supply over time on this dashboard. Not global ${symbol} supply and not a reserve figure.`}
          shareSource="Helix daily supply history"
          shareAsOf={data?.observedAt ?? data?.marketObservedAt ?? null}
        />
      </div>
    </article>
  );
}
