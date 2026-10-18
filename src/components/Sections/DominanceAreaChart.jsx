import { useMemo } from 'preact/hooks';
import ChartWrapper from '../ui/ChartWrapper.jsx';
import { buildDominanceSeries } from '../../lib/graphs.js';
import { buildSupplySeries } from '../../lib/derive.js';
import { getActiveCoins } from '../../utils/coin-config.js';
import { rangeWithYear } from '../../utils/formatters.js';

export default function DominanceAreaChart({ data, observedAt = null }) {
  const coins = useMemo(() => getActiveCoins(), []);

  const supplyByCoin = useMemo(() => {
    const out = {};
    coins.forEach((c) => {
      // Prefer the backend's deduped daily series; fall back to the detail
      // shim rebuild only when it is missing.
      const backend = data?.supplyHistory?.[c.symbol];
      out[c.symbol] = Array.isArray(backend) && backend.length
        ? backend
        : buildSupplySeries(data?.[`${c.symbol.toLowerCase()}Detail`]);
    });
    return out;
  }, [coins, data]);

  const dom = useMemo(() => buildDominanceSeries(supplyByCoin, coins), [supplyByCoin, coins]);

  const latestSorted = useMemo(
    () => (dom ? [...dom.latest].sort((a, b) => b.share - a.share) : []),
    [dom]
  );

  const chartData = useMemo(
    () => (dom ? { labels: dom.labels, datasets: dom.datasets } : null),
    [dom]
  );

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        min: 0,
        max: 100,
        ticks: { stepSize: 25, callback: (v) => `${Number(v)}%` },
      },
    },
    plugins: { legend: { position: 'bottom' } },
  }), []);

  const lead = latestSorted[0] || null;
  const leadDataset = lead && dom ? dom.datasets.find((d) => d.label === lead.symbol) : null;
  const firstShare = leadDataset ? leadDataset.data[0] : null;
  const changePts = lead && Number.isFinite(firstShare) ? lead.share - firstShare : null;

  const shareInterpretation = lead && changePts != null
    ? Math.abs(changePts) < 0.05
      ? `${lead.symbol} leads with ${lead.share.toFixed(1)}% of tracked supply, broadly flat over the window.`
      : `${lead.symbol} leads with ${lead.share.toFixed(1)}% of tracked supply, ${changePts > 0 ? 'up' : 'down'} ${Math.abs(changePts).toFixed(1)} pts over the window.`
    : 'Share of combined tracked stablecoin supply over the window.';

  const rangeDetail = dom
    ? rangeWithYear(`${dom.labels[0]} to ${dom.labels[dom.labels.length - 1]}`, observedAt)
    : '';

  return (
    <article class="card mb-4">
      <div class="card-header">
        <div>
          <div class="card-title">Tracked supply share</div>
          <p class="panel-sub">Share of combined tracked supply over time</p>
        </div>
      </div>
      <div class="card-body">
        {dom ? (
          <div class="panel-chart">
            <ChartWrapper
              type="line"
              data={chartData}
              options={options}
              height={260}
              ariaLabel="Tracked stablecoin supply share over time"
              shareTitle="Tracked supply share"
              shareRange="Tracked supply"
              shareRangeDetail={rangeDetail}
              shareInterpretation={shareInterpretation}
              shareDefinition={`Share of combined circulating supply of the ${coins.length} tracked stablecoins. Not global market share.`}
              shareSource="Helix supply history"
              shareAsOf={observedAt}
            />
          </div>
        ) : (
          <div class="info-empty">Not enough aligned supply history to measure share.</div>
        )}
      </div>
      <footer class="chart-footer">
        <span>
          {latestSorted.slice(0, 2).map((s) => `${s.symbol} ${s.share.toFixed(1)}%`).join(', ')}
        </span>
        <span>{coins.length} tracked coins, not global market share.</span>
      </footer>
    </article>
  );
}
