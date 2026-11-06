import { useEffect, useMemo, useState } from 'preact/hooks';
import { loadCoinChart } from '../../lib/api.js';
import { buildDominanceSeries } from '../../lib/graphs.js';
import { fmtB, fmtPct, fmtPrice, pctChange, bps } from '../../utils/formatters.js';
import { STABLECOIN_REGISTRY, getActiveCoins } from '../../utils/coin-config.js';
import { getAssetMeta } from '../../utils/asset-meta.js';
import { annotateWhaleRows, buildSupplySeries, buildWhaleWatchRows, coinStabilityScore, dedupeTickers, pegChartOptions, pegRefLine, toPercentFromFirst } from '../../lib/derive.js';
import AssetHero from '../Coin/AssetHero.jsx';
import AssetMetrics from '../Coin/AssetMetrics.jsx';
import PegPricePanel from '../Coin/PegPricePanel.jsx';
import StabilityPanel from '../Coin/StabilityPanel.jsx';
import SupplyPanel from '../Coin/SupplyPanel.jsx';
import ChainDistributionPanel from '../Coin/ChainDistributionPanel.jsx';
import AssetLearnBand from '../Coin/AssetLearnBand.jsx';
import DominanceChart from '../Coin/DominanceChart.jsx';
import PegDeviationChart from '../Coin/PegDeviationChart.jsx';
import ExchangeVolumeChart from '../Coin/ExchangeVolumeChart.jsx';
import ChainSupplyTable from '../Coin/ChainSupplyTable.jsx';
import WhaleAnomaliesCard from '../Coin/WhaleAnomaliesCard.jsx';

export default function CoinTab({ coin, data, setActiveTab, alerts = [] }) {
  const symbol = (coin || '').toUpperCase();
  const [, redraw] = useState(0);
  useEffect(() => {
    let alive = true;
    loadCoinChart(symbol, data).then(() => { if (alive) redraw((value) => value + 1); });
    return () => { alive = false; };
  }, [symbol, data?.fetchedAt]);
  const cfg = STABLECOIN_REGISTRY[symbol];
  const meta = getAssetMeta(symbol);
  const cgKey = cfg?.coingeckoId;
  const detail = data?.[`${symbol.toLowerCase()}Detail`];
  const chartData = data?.[`cg${symbol}Chart`];
  const cgTickers = data?.[`cg${symbol}`];
  const asset = data?.allStables?.peggedAssets?.find((x) => x.symbol.toLowerCase() === symbol.toLowerCase());
  // Null-safe: missing market data must render as hyphen, never as $1 or $0.
  const price = data?.cgSimple?.[cgKey]?.usd ?? data?.prices?.[symbol]?.price ?? null;
  // Unknown 24h change stays null so the tile shows '-' instead of +0.00%.
  const chg = data?.cgSimple?.[cgKey]?.usd_24h_change ?? null;
  const supply = asset?.circulating?.peggedUSD ?? null;
  // A missing prior-day value is unknown, not zero. Keeping it null lets the
  // tile render a hyphen instead of a false "$0.00 24h supply delta".
  const prev = asset?.circulatingPrevDay?.peggedUSD ?? null;
  const color = cfg?.color || '#468bf0';
  const warnBps = cfg?.thresholds?.pegWarnBps ?? 10;
  const critBps = cfg?.thresholds?.pegCriticalBps ?? 50;
  const score = coinStabilityScore(price, warnBps, critBps);
  const pegBps = bps(price);

  // Every positive chain drives the distribution denominator. The visible
  // table is capped at 10, but the caption claims a share of tracked supply,
  // so the denominator must not shrink to the visible rows.
  const allChainRows = useMemo(
    () =>
      Object.entries(detail?.chainBalances || {})
        .map(([chain, chainData]) => {
          const tokens = chainData?.tokens || [];
          const cur = tokens[tokens.length - 1]?.circulating?.peggedUSD || 0;
          // Same rule as the supply tile: a missing previous point is unknown,
          // not a zero change.
          const pd = tokens[tokens.length - 2]?.circulating?.peggedUSD ?? null;
          return { chain, cur, pd, d1: pctChange(cur, pd) };
        })
        .filter((r) => r.cur > 0)
        .sort((a, b) => b.cur - a.cur),
    [detail]
  );
  const rows = useMemo(() => allChainRows.slice(0, 10), [allChainRows]);

  const chainShares = useMemo(() => {
    const total = allChainRows.reduce((s, r) => s + r.cur, 0) || 1;
    return rows.slice(0, 4).map((r) => ({
      ...r,
      pct: Math.round((r.cur / total) * 100),
    }));
  }, [allChainRows, rows]);

  const supplySeries = useMemo(() => {
    // Backend's deduped daily series is the source of truth; the shim
    // rebuild is only a fallback for missing data.
    const backend = data?.supplyHistory?.[symbol];
    if (Array.isArray(backend) && backend.length) return backend;
    return buildSupplySeries(detail);
  }, [data, symbol, detail]);
  const [supplyLog, setSupplyLog] = useState(false);
  const [supplyPct, setSupplyPct] = useState(false);
  const tickersAsOf = data?.[`cg${symbol}TickersAt`] ?? null;

  const priceLineData = useMemo(() => {
    const series = (chartData?.prices || []).slice(-90);
    const labels = series.map((p) => new Date(p[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }));
    const refColor = typeof document !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--ink-faint').trim()
        || getComputedStyle(document.documentElement).getPropertyValue('--text2').trim()
        || '#8b98a5'
      : '#8b98a5';
    return {
      dates: series.map((p) => p[0]),
      labels,
      datasets: [
        { label: `${symbol} Price`, data: series.map((p) => p[1]), borderColor: color, tension: 0.2, fill: false },
        pegRefLine(labels, refColor),
      ],
    };
  }, [chartData, symbol, color]);

  const supplyLineData = useMemo(
    () => {
      const labels = supplySeries.map((p) => new Date(p.ts ?? p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }));
      const values = supplyPct ? toPercentFromFirst(supplySeries).map((p) => p.value) : supplySeries.map((p) => p.value);
      return {
        dates: supplySeries.map((p) => p.ts ?? p.date),
        labels,
        datasets: [{ label: supplyPct ? `${symbol} %` : `${symbol} Supply`, data: values, borderColor: color, tension: 0.2 }],
      };
    },
    [supplySeries, symbol, color, supplyPct]
  );

  const supplyLineOptions = useMemo(() => {
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
        x: { ticks: { autoSkip: true, maxTicksLimit: 8, maxRotation: 0 } },
      },
    };
  }, [supplyLog, supplyPct]);

  const exchBars = useMemo(
    () => {
      const barRows = dedupeTickers(cgTickers?.tickers || [], 8);
      return {
        labels: barRows.map((r) => r.name),
        datasets: [{ label: '24h Volume', data: barRows.map((r) => r.volume), backgroundColor: color + 'AA' }],
      };
    },
    [cgTickers, color]
  );

  const whaleRows = useMemo(() => {
    const allRows = annotateWhaleRows(buildWhaleWatchRows({ [symbol]: detail }), alerts);
    return allRows.filter((r) => r.coin === symbol).slice(0, 5);
  }, [symbol, detail, alerts]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { autoSkip: true, maxTicksLimit: 6, maxRotation: 0 } },
      y: { ticks: { callback: (v) => fmtB(v) } },
    },
  }), []);
  const priceChartOpts = useMemo(() => {
    const prices = (priceLineData.datasets || [])
      .filter((d) => d.label !== '$1 peg')
      .flatMap((d) => d.data)
      .filter((v) => typeof v === 'number' && v > 0);
    const base = pegChartOptions(prices);
    return {
      responsive: true,
      maintainAspectRatio: false,
      ...base,
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
  }, [priceLineData]);

  const dominanceData = useMemo(() => {
    const coins = getActiveCoins();
    const supplyByCoin = {};
    for (const c of coins) {
      const d = data?.[`${c.symbol.toLowerCase()}Detail`];
      supplyByCoin[c.symbol] = data?.supplyHistory?.[c.symbol] || buildSupplySeries(d);
    }
    const aligned = buildDominanceSeries(supplyByCoin, coins);
    if (!aligned) return null;
    return { labels: aligned.labels, dates: aligned.dates,
      datasets: [aligned.datasets.find((d) => d.label === symbol)] };

  }, [data, symbol, color]);

  const dominanceOpts = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { ticks: { callback: (v) => Number(v).toFixed(1) + '%' } },
      x: { ticks: { autoSkip: true, maxTicksLimit: 8, maxRotation: 0 } },
    },
    plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(1)}%` } } },
  }), []);

  const bpsData = useMemo(() => {
    const series = (chartData?.prices || []).slice(-90);
    if (!series.length) return null;
    const labels = series.map((p) => new Date(p[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }));
    const refColor = typeof document !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--ink-faint').trim() || '#8b98a5'
      : '#8b98a5';
    return {
      dates: series.map((p) => p[0]),
      labels,
      datasets: [
        { label: `${symbol} deviation (bps)`, data: series.map((p) => bps(p[1])), borderColor: color, tension: 0.2 },
        { label: '0 bps', data: labels.map(() => 0), borderColor: refColor, borderDash: [4, 4], borderWidth: 1, pointRadius: 0, tension: 0 },
      ],
    };
  }, [chartData, symbol, color]);

  const bpsOpts = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { suggestedMin: -50, suggestedMax: 50, ticks: { callback: (v) => (v > 0 ? '+' : '') + v + ' bps' } },
      x: { ticks: { autoSkip: true, maxTicksLimit: 8, maxRotation: 0 } },
    },
    plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y} bps` } } },
  }), []);

  const watchNote = (() => {
    if (chainShares[1] && chainShares[1].d1 > 1) {
      return `Supply is expanding on ${chainShares[1].chain}.`;
    }
    if (pegBps == null) {
      return 'Price data unavailable - waiting for next market sync.';
    }
    if (Math.abs(pegBps) >= warnBps) {
      return `Peg is ${Math.abs(pegBps)} bps from $1.00 - observe, do not treat as advice.`;
    }
    return meta.watchDefault;
  })();

  const goLearn = () => {
    if (!setActiveTab) return;
    setActiveTab('learn');
    if (meta.learnId) {
      setTimeout(() => {
        document.getElementById(meta.learnId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  return (
    <div class="tab-content active asset-page">
      <AssetHero symbol={symbol} meta={meta} color={color} watchNote={watchNote} />

      <AssetMetrics
        price={price}
        pegBps={pegBps}
        score={score}
        warnBps={warnBps}
        supply={supply}
        prev={prev}
        chg={chg}
        meta={meta}
      />

      <section class="asset-grid">
        <PegPricePanel
          symbol={symbol}
          price={price}
          pegBps={pegBps}
          priceLineData={priceLineData}
          priceChartOpts={priceChartOpts}
          goLearn={goLearn}
        />

        <StabilityPanel score={score} pegBps={pegBps} warnBps={warnBps} critBps={critBps} />
      </section>

      <section class="asset-grid lower-asset">
        <SupplyPanel
          symbol={symbol}
          supplyLineData={supplyLineData}
          supplyLineOptions={supplyLineOptions}
          supplyPct={supplyPct}
          supplyLog={supplyLog}
          setSupplyPct={setSupplyPct}
          setSupplyLog={setSupplyLog}
        />

        <ChainDistributionPanel symbol={symbol} chainShares={chainShares} setActiveTab={setActiveTab} />
      </section>

      <AssetLearnBand meta={meta} goLearn={goLearn} />

      {dominanceData && bpsData ? (
        <div class="grid-2 mb-4">
          <DominanceChart symbol={symbol} dominanceData={dominanceData} dominanceOpts={dominanceOpts} />
          <PegDeviationChart symbol={symbol} bpsData={bpsData} bpsOpts={bpsOpts} />
        </div>
      ) : (
        <>
          {dominanceData ? (
            <DominanceChart symbol={symbol} dominanceData={dominanceData} dominanceOpts={dominanceOpts} />
          ) : null}
          {bpsData ? (
            <PegDeviationChart symbol={symbol} bpsData={bpsData} bpsOpts={bpsOpts} />
          ) : null}
        </>
      )}

      <div class="grid-2 mb-4">
        <ExchangeVolumeChart symbol={symbol} exchBars={exchBars} chartOptions={chartOptions} asOf={tickersAsOf} />
        <ChainSupplyTable symbol={symbol} rows={rows} />
      </div>

      {whaleRows.length > 0 ? (
        <WhaleAnomaliesCard symbol={symbol} whaleRows={whaleRows} />
      ) : null}
    </div>
  );
}
