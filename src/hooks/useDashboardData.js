import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { REFRESH_KEY } from '../utils/storage.js';
import { getActiveCoins } from '../utils/coin-config.js';
import { fetchDashboardData, fetchCanonicalAlerts, fetchHealthz, loadCoinChart } from '../lib/api.js';
import { fetchIntelligence } from '../lib/ai.js';
import { generateAlerts } from '../lib/derive.js';
import { buildFreshness } from '../lib/freshness.js';
import { aiApiBase } from '../config.js';

const REFRESH_OPTIONS = [60, 180, 300, 600, 900];
const DEFAULT_REFRESH_SEC = 900;
const FAILURE_MESSAGE = 'Failed to load market data. Retry shortly; the last snapshot is shown if a cache exists.';

function readStoredRefresh() {
  try {
    const raw = localStorage.getItem(REFRESH_KEY);
    if (raw === null) return null;
    const value = Number(raw);
    return REFRESH_OPTIONS.includes(value) ? value : null;
  } catch { return null; }
}

/**
 * Dashboard data lifecycle for App.jsx: the market snapshot, backend health,
 * canonical alerts and the optional AI narrative, the refresh timer that
 * re-runs the fetch, and the failure message shown when every source is
 * unavailable. App.jsx keeps layout and view state; this hook owns the data
 * and the clocks that report its age.
 */
export default function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiStatus, setApiStatus] = useState({ message: '' });
  const [alerts, setAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [alertSource, setAlertSource] = useState('local');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [freshness, setFreshness] = useState(null);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(() => readStoredRefresh() ?? DEFAULT_REFRESH_SEC);

  const intelligenceRef = useRef(null);

  const aliveRef = useRef(true);
  const abortRef = useRef(null);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const refresh = useCallback(async (opts = {}) => {
    const { background = false } = opts;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setApiStatus({ message: '' });
    }

    try {
      const [dashRes, healthRes, canonicalRes] = await Promise.allSettled([
        fetchDashboardData({ signal: ctrl.signal }),
        fetchHealthz({ signal: ctrl.signal }),
        fetchCanonicalAlerts({ signal: ctrl.signal }),
      ]);
      if (!aliveRef.current) return;
      if (dashRes.status !== 'fulfilled') throw dashRes.reason;
      const result = dashRes.value;
      const health = healthRes.status === 'fulfilled' ? healthRes.value : null;
      const canonical = canonicalRes.status === 'fulfilled' ? canonicalRes.value : null;
      const nextData = { ...result, intelligence: intelligenceRef.current || null };
      const localAlerts = generateAlerts(nextData);
      const persistedCount = canonical?.meta?.persistedCount || 0;
      const rows = canonical?.data || [];
      const open = rows.filter((a) => a.state === 'open');
      let nextAlerts = localAlerts;
      let source = 'local';
      if (canonical && persistedCount > 0) {
        nextAlerts = open;
        source = 'canonical';
      } else if (canonical && canonical.meta?.empty) {
        source = 'provisional';
      }
      setData(nextData);
      setAlerts(nextAlerts);
      setAlertHistory(rows);
      setAlertSource(source);
      setLastUpdated(result.fetchedAt);
      setFreshness(buildFreshness({
        checkedAt: result.fetchedAt,
        spotObservedAt: result.spotObservedAt,
        supplyObservedAt: result.supplyObservedAt,
        marketObservedAt: result.marketObservedAt,
        snapshotAt: health?.lastMarketSync ?? null,
      }));
      setApiStatus({ message: '' });
    } catch (err) {
      if (!aliveRef.current || err?.name === 'AbortError') return;
      console.error(err);
      setApiStatus({ message: FAILURE_MESSAGE });
    } finally {
      if (aliveRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!refreshIntervalSec || refreshIntervalSec <= 0) return undefined;
    const t = setInterval(() => refresh({ background: true }), refreshIntervalSec * 1000);
    return () => clearInterval(t);
  }, [refreshIntervalSec, refresh]);

  useEffect(() => {
    if (!aiApiBase) return undefined;
    fetchIntelligence().then((ai) => {
      if (!aliveRef.current || !ai) return;
      intelligenceRef.current = ai;
      setData((prev) => (prev ? { ...prev, intelligence: ai } : prev));
    });
    return undefined;
  }, [refresh]);

  useEffect(() => {
    try {
      localStorage.setItem(REFRESH_KEY, String(refreshIntervalSec));
    } catch {
      // ignore storage errors (private mode)
    }
  }, [refreshIntervalSec]);

  // Warm every tracked coin's 90d chart and tickers into `data`. Not gated on
  // the open tab: the snapshot is shared, so one pass per fetchedAt serves all
  // coin tabs. The state bump hands the mutated payload to the renderers.
  useEffect(() => {
    if (!data) return undefined;
    let alive = true;
    Promise.all(getActiveCoins().map((coin) => loadCoinChart(coin.symbol, data))).then(() => {
      if (alive) setData((prev) => ({ ...prev }));
    });
    return () => { alive = false; };
  }, [data?.fetchedAt]);

  const priceByCoin = useMemo(() => {
    const coins = getActiveCoins();
    const cg = data?.cgSimple;
    const m = {};
    coins.forEach((c) => {
      const live = cg?.[c.coingeckoId]?.usd ?? data?.prices?.[c.symbol]?.price;
      m[c.symbol] = typeof live === 'number' ? live : null;
    });
    return m;
  }, [data]);

  return {
    data,
    loading,
    refreshing,
    apiStatus,
    alerts,
    alertHistory,
    alertSource,
    lastUpdated,
    freshness,
    refresh,
    refreshIntervalSec,
    setRefreshIntervalSec,
    priceByCoin,
  };
}
