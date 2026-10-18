import { useEffect, useMemo, useState } from 'preact/hooks';
import { fmtB } from '../../utils/formatters.js';
import { coinTabId, getActiveCoins } from '../../utils/coin-config.js';
import { annotateChainFlows, annotateWhaleRows, buildSupplySeries, buildWhaleWatchRows, computePegStress, pegChartOptions, pegRefLine, rankChainFlows, toPercentFromFirst } from '../../lib/derive.js';
import PegBandHero from '../Sections/PegBandHero.jsx';
import MarketPulse from '../Sections/MarketPulse.jsx';
import CoinStrip from '../Sections/CoinStrip.jsx';
import ChainFlowChart from '../Sections/ChainFlowChart.jsx';
import DominanceAreaChart from '../Sections/DominanceAreaChart.jsx';
import SignalSummary from '../Sections/SignalSummary.jsx';
import WhaleWatch from '../Sections/WhaleWatch.jsx';

/** Mobile detection for the narrow chart layout (fewer ticks, top-2 coins). */
function useNarrowViewport() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(max-width:768px)');
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return narrow;
}

function buildPriceByCoin(coins, cg, data) {
  const m = {};
  coins.forEach((c) => {
    // Null-safe: missing market data stays null and renders as hyphen.
    // Never fall back to 1, which would hide an outage as on-peg.
    m[c.symbol] = cg?.[c.coingeckoId]?.usd ?? data?.prices?.[c.symbol]?.price ?? null;
  });
  return m;
}

function buildDetailsByCoin(coins, data) {
  const m = {};
  coins.forEach((c) => {
    m[c.symbol] = data?.[`${c.symbol.toLowerCase()}Detail`];
  });
  return m;
}

function buildSupplySeriesByCoin(coins, detailsByCoin, data) {
  const m = {};
  coins.forEach((c) => {
    // Prefer the backend's deduped daily series; fall back to the shim
    // rebuild only if it is missing (should not happen post-phase-2).
    const backend = data?.supplyHistory?.[c.symbol];
    m[c.symbol] = Array.isArray(backend) && backend.length
      ? backend
      : buildSupplySeries(detailsByCoin[c.symbol]);
  });
  return m;
}

function buildSupplyLabels(coins, supplySeriesByCoin) {
  const any = coins.map((c) => supplySeriesByCoin[c.symbol]).find((s) => s.length);
  return (any || []).map((p) => new Date(p.ts ?? p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }));
}

function buildPegLabels(coins, data) {
  const any = coins.map((c) => data?.[`cg${c.symbol}Chart`]?.prices).find((p) => p?.length);
  return (any || []).slice(-90).map((p) => new Date(p[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
}

function buildSupplyChartData({ coins, supplySeriesByCoin, supplyLabels, supplyPct, narrow, compareAll }) {
  const transform = (series) => (supplyPct ? toPercentFromFirst(series).map((p) => p.value) : series.map((p) => p.value));
  const ranked = [...coins].sort((a, b) => {
    const av = (supplySeriesByCoin[a.symbol] || []).slice(-1)[0]?.value || 0;
    const bv = (supplySeriesByCoin[b.symbol] || []).slice(-1)[0]?.value || 0;
    return bv - av;
  });
  const visible = narrow && !compareAll ? ranked.slice(0, 2) : ranked;
  return {
    labels: supplyLabels,
    datasets: visible.map((c) => ({
      label: supplyPct ? `${c.symbol} %` : c.symbol,
      data: transform(supplySeriesByCoin[c.symbol]),
      borderColor: c.color,
      tension: 0.25,
    })),
  };
}

function buildSupplyChartOptions(supplyLog, supplyPct, narrow) {
  const yScale = supplyLog && !supplyPct
    ? { type: 'logarithmic', ticks: { callback: (v) => fmtB(v) } }
    : supplyPct
      ? { ticks: { callback: (v) => (v >= 0 ? '+' : '') + Number(v).toFixed(1) + '%' } }
      : { ticks: { callback: (v) => fmtB(v) } };
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: yScale,
      x: { ticks: { autoSkip: true, maxTicksLimit: narrow ? 5 : 10 } },
    },
  };
}

function buildPegChartData(coins, pegLabels, data) {
  const refColor = typeof document !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue('--text2').trim() || '#9CA3AF'
    : '#9CA3AF';
  const coinLines = coins.map((c) => ({
    label: c.symbol,
    data: (data?.[`cg${c.symbol}Chart`]?.prices || []).slice(-90).map((p) => p[1]),
    borderColor: c.color,
    tension: 0.25,
  }));
  return { labels: pegLabels, datasets: [...coinLines, pegRefLine(pegLabels, refColor)] };
}

function buildPegChartOptions(pegChartData) {
  const allPrices = pegChartData.datasets
    .filter((d) => d.label !== '$1 peg')
    .flatMap((d) => d.data)
    .filter((v) => typeof v === 'number' && v > 0);
  const base = pegChartOptions(allPrices);
  return {
    ...base,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      ...(base.scales || {}),
      x: {
        ...(base.scales?.x || {}),
        ticks: {
          autoSkip: true,
          maxTicksLimit: 8,
          maxRotation: 0,
          ...(base.scales?.x?.ticks || {}),
        },
      },
    },
  };
}

export default function HomeTab({ data, alerts, setActiveTab, freshness = null }) {
  const cg = data?.cgSimple;
  const coins = getActiveCoins();

  const priceByCoin = useMemo(() => buildPriceByCoin(coins, cg, data), [coins, cg, data]);
  const detailsByCoin = useMemo(() => buildDetailsByCoin(coins, data), [coins, data]);
  const supplySeriesByCoin = useMemo(
    () => buildSupplySeriesByCoin(coins, detailsByCoin, data),
    [coins, detailsByCoin, data]
  );

  const [supplyLog, setSupplyLog] = useState(false);
  const [supplyPct, setSupplyPct] = useState(false);
  const [compareAll, setCompareAll] = useState(false);
  const narrow = useNarrowViewport();

  const chainFlows = useMemo(
    () => annotateChainFlows(rankChainFlows(detailsByCoin), alerts),
    [detailsByCoin, alerts]
  );
  const stress = useMemo(
    () => computePegStress({ pricesByCoin: priceByCoin, alerts, topChainFlow: chainFlows[0]?.totalDelta || 0 }),
    [priceByCoin, alerts, chainFlows]
  );
  const whaleRows = useMemo(
    () => annotateWhaleRows(buildWhaleWatchRows(detailsByCoin), alerts),
    [detailsByCoin, alerts]
  );

  const supplyLabels = useMemo(() => buildSupplyLabels(coins, supplySeriesByCoin), [coins, supplySeriesByCoin]);
  const pegLabels = useMemo(() => buildPegLabels(coins, data), [coins, data]);
  const supplyChartData = useMemo(
    () => buildSupplyChartData({ coins, supplySeriesByCoin, supplyLabels, supplyPct, narrow, compareAll }),
    [coins, supplyLabels, supplySeriesByCoin, supplyPct, narrow, compareAll]
  );
  const supplyChartOptions = useMemo(
    () => buildSupplyChartOptions(supplyLog, supplyPct, narrow),
    [supplyLog, supplyPct, narrow]
  );
  const pegChartData = useMemo(() => buildPegChartData(coins, pegLabels, data), [coins, pegLabels, data]);
  const pegChartOpts = useMemo(() => buildPegChartOptions(pegChartData), [pegChartData]);
  // The peg chart is CoinGecko 90-day price history, so its as-of is the newest
  // price point, not the Helix market clock used for supply.
  const pegAsOf = useMemo(() => {
    const stamps = coins
      .map((c) => data?.[`cg${c.symbol}Chart`]?.prices?.slice(-1)[0]?.[0])
      .filter((v) => typeof v === 'number' && Number.isFinite(v));
    return stamps.length ? Math.max(...stamps) : null;
  }, [coins, data]);

  const totalMC = data?.allStables?.totalMarketCap?.peggedUSD ?? null;
  const totalPrev = data?.allStables?.totalMarketCap?.prevDay?.peggedUSD
    ?? data?.marketTotals?.prevDay?.peggedUSD
    ?? null;
  const netDelta = totalMC != null && totalPrev != null ? totalMC - totalPrev : null;

  return (
    <div class="tab-content active">
      <PegBandHero
        coins={coins}
        priceByCoin={priceByCoin}
        stress={stress}
        alerts={alerts}
        freshness={freshness}
        chainFlows={chainFlows}
      />

      <section class="od-metrics" aria-label="Key market metrics">
        <div class="od-metric">
          <span class="od-metric-label">Tracked market cap</span>
          <div class="od-metric-value">{fmtB(totalMC)}</div>
          <span class="od-metric-note">{coins.length} coins, not all issuers</span>
        </div>
        <div class="od-metric">
          <span class="od-metric-label">{netDelta == null ? 'Net flow 24h' : netDelta < 0 ? 'Net burn 24h' : 'Net mint 24h'}</span>
          <div class="od-metric-value">
            <span class={`od-metric-dot ${netDelta != null && netDelta >= 0 ? 'mint' : ''}`} />
            {netDelta == null ? '-' : fmtB(Math.abs(netDelta))}
          </div>
          <span class="od-metric-note">Across tracked coins</span>
        </div>
        <div class="od-metric">
          <span class="od-metric-label">Open alerts</span>
          <div class="od-metric-value">
            <span class="od-metric-dot alert" />
            {data ? String((alerts || []).length).padStart(2, '0') : '-'}
          </div>
          <span class="od-metric-note">across tracked coins</span>
        </div>
      </section>

      <CoinStrip
        coins={coins}
        priceByCoin={priceByCoin}
        cg={cg}
        data={data}
        onSelectCoin={(symbol) => setActiveTab(coinTabId(symbol))}
      />

      <MarketPulse
        supplyChartData={supplyChartData}
        supplyChartOptions={supplyChartOptions}
        pegChartData={pegChartData}
        pegChartOptions={pegChartOpts}
        onToggleLog={() => setSupplyLog((v) => !v)}
        onTogglePct={() => { setSupplyPct((v) => !v); if (!supplyPct) setSupplyLog(false); }}
        supplyLog={supplyLog}
        supplyPct={supplyPct}
        compareAll={compareAll}
        onToggleCompare={() => setCompareAll((v) => !v)}
        narrow={narrow}
        onLearn={() => setActiveTab('learn')}
        observedAt={data?.observedAt ?? null}
        pegObservedAt={pegAsOf}
      />
      <section class="content-grid flow-grid" aria-label="Flow and dominance">
        <ChainFlowChart chainFlows={chainFlows} coins={coins} observedAt={data?.observedAt ?? null} />
        <DominanceAreaChart data={data} observedAt={data?.observedAt ?? null} />
      </section>
      <SignalSummary
        data={data}
        alerts={alerts}
        freshness={freshness}
        onViewAll={() => setActiveTab('alerts')}
        onLearn={() => setActiveTab('learn')}
      />
      <WhaleWatch rows={whaleRows} />
    </div>
  );
}
