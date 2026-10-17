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
          shareTitle={`${symbol} supply`}
          shareRange="History"
          shareInterpretation={`${symbol} circulating supply from backend history, deduplicated per day for tracked coins on this dashboard.`}
          shareDefinition={`Circulating ${symbol} supply over time for tracked coins on this dashboard, not global market supply.`}
          shareAsOf={data?.observedAt ?? data?.marketObservedAt ?? null}
        />
      </div>
    </article>
  );
}
