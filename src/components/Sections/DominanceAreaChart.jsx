import { useMemo } from 'preact/hooks';
import ChartWrapper from '../ui/ChartWrapper.jsx';
import { buildDominanceSeries } from '../../lib/graphs.js';
import { buildSupplySeries } from '../../lib/derive.js';
import { getActiveCoins } from '../../utils/coin-config.js';

export default function DominanceAreaChart({ data }) {
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
    () => (dom ? { labels: dom.labels, dates: dom.dates, datasets: dom.datasets } : null),
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
              shareSpec={{ kind: 'dominance' }}
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
