import { useMemo, useState } from 'preact/hooks';
import ChartWrapper from '../ui/ChartWrapper.jsx';
import { buildChainFlowBars } from '../../lib/graphs.js';
import { fmtB } from '../../utils/formatters.js';

/**
 * Resolve a design token to a concrete color. Chart.js paints onto a canvas,
 * which does not understand `var(--token)`, so the token is read from the
 * document and the fallback covers the server/no-DOM case.
 */
function readToken(name, fallback) {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** "24h window ending 18 Oct 2026", with an honest note when the clock is missing. */
function shareRangeDetail(observedAt) {
  const missing = '24h window, as-of unavailable';
  if (observedAt == null) return missing;
  const ms = observedAt instanceof Date ? observedAt.getTime() : Number(observedAt);
  if (!Number.isFinite(ms) || ms <= 0) return missing;
  const stamp = new Date(ms < 1e12 ? ms * 1000 : ms).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return `24h window ending ${stamp}`;
}

/** Largest gain and largest loss among the measured bars, or null when absent. */
function strongestMoves(bars) {
  let gain = null;
  let loss = null;
  bars.labels.forEach((chain, i) => {
    const value = bars.values[i];
    if (value > 0 && (!gain || value > gain.value)) gain = { chain, value };
    if (value < 0 && (!loss || value < loss.value)) loss = { chain, value };
  });
  return { gain, loss };
}

export default function ChainFlowChart({ chainFlows, coins = [], observedAt = null }) {
  const [selected, setSelected] = useState('all');
  const bars = useMemo(() => buildChainFlowBars(chainFlows, selected, 8), [chainFlows, selected]);
  const hasRows = bars.values.length > 0;

  const { gain, loss } = useMemo(() => strongestMoves(bars), [bars]);

  const chartData = useMemo(() => {
    const activeCoin = coins.find((c) => c.symbol === selected);
    // Positive bars use the selected coin color (or var(--blue) for "all"),
    // negative bars use var(--crit) so direction reads before the label.
    const positive = activeCoin?.color || readToken('--blue', '#468bf0');
    const negative = readToken('--crit', '#d76e67');
    return {
      labels: bars.labels,
      datasets: [
        {
          label: selected === 'all' ? 'Net 24h change, all tracked coins' : `Net 24h change, ${selected}`,
          data: bars.values,
          backgroundColor: bars.values.map((v) => (v < 0 ? negative : positive)),
          borderRadius: 4,
        },
      ],
    };
  }, [bars, coins, selected]);

  const options = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { bottom: 4 } },
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grace: '8%',
        ticks: {
          callback: (v) => fmtB(v),
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 5,
          font: { size: 9 },
        },
      },
      y: { grid: { display: false }, ticks: { font: { size: 10 } } },
    },
  }), []);

  const footer = useMemo(() => {
    if (!bars.complete) return 'Measured values only: some tracked chains have no reading for this filter.';
    if (gain && loss) return `Largest gain: ${gain.chain} ${fmtB(gain.value)}, largest loss: ${loss.chain} ${fmtB(loss.value)}.`;
    if (gain) return `Largest gain: ${gain.chain} ${fmtB(gain.value)}. No tracked chain lost supply in this window.`;
    if (loss) return `Largest loss: ${loss.chain} ${fmtB(loss.value)}. No tracked chain gained supply in this window.`;
    return 'No net change measured across the tracked chains in this window.';
  }, [bars.complete, gain, loss]);

  const shareInterpretation = bars.complete && gain && loss
    ? `${gain.chain} gained the most tracked supply (${fmtB(gain.value)}) while ${loss.chain} lost the most (${fmtB(loss.value)}) over the last 24h.`
    : 'Net 24h circulating-supply change by chain. Some tracked chains are unmeasured for this filter, so the bars show measured values only.';

  return (
    <article class="card mb-4">
      <div class="card-header">
        <div class="card-title-row chain-flow-head">
          <div>
            <div class="card-title">Where supply moved</div>
            <p class="panel-sub">Net 24h supply change by chain</p>
          </div>
          <div class="segmented chart-toggles chain-flow-filter" role="group" aria-label="Filter chain flow by coin">
            <button
              type="button"
              class={selected === 'all' ? 'selected' : ''}
              aria-pressed={selected === 'all'}
              onClick={() => setSelected('all')}
            >
              All
            </button>
            {coins.map((c) => (
              <button
                key={c.symbol}
                type="button"
                class={selected === c.symbol ? 'selected' : ''}
                aria-pressed={selected === c.symbol}
                onClick={() => setSelected(c.symbol)}
              >
                {c.symbol}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div class="card-body">
        {hasRows ? (
          <div class="panel-chart">
            <ChartWrapper
              type="bar"
              data={chartData}
              options={options}
              height={260}
              ariaLabel="Net 24h supply change by chain"
              shareTitle="Where supply moved, 24h"
              shareRange="24h"
              shareRangeDetail={shareRangeDetail(observedAt)}
              shareInterpretation={shareInterpretation}
              shareDefinition="Net change in circulating stablecoin supply on each chain over 24h. Chain-level snapshots, not directed transfers."
              shareSource="Helix chain snapshots"
              shareAsOf={observedAt}
            />
          </div>
        ) : (
          <div class="info-empty">No measured chain flow in the current window.</div>
        )}
      </div>
      <footer class="chart-footer">
        <span>{footer}</span>
      </footer>
    </article>
  );
}
