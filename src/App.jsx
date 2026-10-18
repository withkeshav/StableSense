import { useCallback, useEffect, useState } from 'preact/hooks';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import MobileNav from './components/MobileNav.jsx';
import HomeTab from './components/Tabs/HomeTab.jsx';
import CoinTab from './components/Tabs/CoinTab.jsx';
import ChainsTab from './components/Tabs/ChainsTab.jsx';
import AlertsTab from './components/Tabs/AlertsTab.jsx';
import AboutTab from './components/Tabs/AboutTab.jsx';
import LearnTab from './components/Tabs/LearnTab.jsx';
import ResearchTab from './components/Tabs/ResearchTab.jsx';
import SkeletonLoader from './components/ui/SkeletonLoader.jsx';
import RefreshCountdown from './components/ui/RefreshCountdown.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import useTheme from './hooks/useTheme.js';
import useDashboardData from './hooks/useDashboardData.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { APP_VERSION } from './config.js';
import { COMPACT_KEY } from './utils/storage.js';
import { coinFromTabId } from './utils/coin-config.js';

function readStoredCompact() {
  try {
    const raw = localStorage.getItem(COMPACT_KEY);
    if (raw === null) return true;
    return raw === '1';
  } catch { return true; }
}

export default function App() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [railOpen, setRailOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [compactMode, setCompactMode] = useState(readStoredCompact);

  const {
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
  } = useDashboardData();

  useEffect(() => {
    document.body.classList.toggle('compact', compactMode);
  }, [compactMode]);

  useEffect(() => {
    try {
      localStorage.setItem(COMPACT_KEY, compactMode ? '1' : '0');
    } catch {
      // ignore storage errors (private mode)
    }
  }, [compactMode]);

  const coinTab = coinFromTabId(activeTab);

  const setTab = useCallback((id) => {
    setActiveTab(id);
    setRailOpen(false);
  }, []);

  return (
    <div id="app-layout" class="layout-wrapper app-shell" data-theme={effectiveTheme}>
      <a href="#main" class="skip-link">Skip to content</a>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setTab}
        alertCount={alerts.length}
        alerts={alerts}
        priceByCoin={priceByCoin}
        data={data}
        lastUpdated={lastUpdated}
        open={railOpen}
        onClose={() => setRailOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMethodology={() => setTab('about')}
      />
      <div class="site-main">
        <Header
          loading={loading}
          refreshing={refreshing}
          apiStatus={apiStatus}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRefresh={() => refresh({ background: true })}
          buildVersion={APP_VERSION}
          theme={theme}
          setTheme={setTheme}
          alertCount={alerts.length}
          onJumpToAlerts={() => setTab('alerts')}
          activeTab={activeTab}
          onOpenRail={() => setRailOpen(true)}
          dataState={freshness?.overallState}
        />
        <div id="body-row">
          <main id="main" class="main-scroll">
            <ErrorBoundary>
              {loading && !data ? (
                <SkeletonLoader />
              ) : (
                <>
                  {apiStatus.message ? (
                    <div class="card api-status-card">{apiStatus.message}</div>
                  ) : null}
                  {!loading && lastUpdated && !['home', 'learn', 'about', 'research'].includes(activeTab) ? (
                    <RefreshCountdown
                      lastUpdated={lastUpdated}
                      refreshIntervalSec={refreshIntervalSec}
                      refreshing={refreshing}
                      freshness={freshness}
                      dataState={freshness?.overallState}
                    />
                  ) : null}
                  {activeTab === 'home' && (
                    <HomeTab
                      data={data}
                      alerts={alerts}
                      setActiveTab={setTab}
                      refreshIntervalSec={refreshIntervalSec}
                      freshness={freshness}
                    />
                  )}
                  {coinTab ? (
                    <CoinTab
                      key={activeTab}
                      coin={activeTab}
                      data={data}
                      alerts={alerts}
                      setActiveTab={setTab}
                    />
                  ) : null}
                  {activeTab === 'chains' && <ChainsTab data={data} />}
                  {activeTab === 'alerts' && (
                    <AlertsTab
                      alerts={alerts}
                      intelligence={data?.intelligence}
                      data={data}
                      setActiveTab={setTab}
                      alertSource={alertSource}
                      alertHistory={alertHistory}
                    />
                  )}
                {activeTab === 'learn' && <LearnTab data={data} alerts={alerts} alertHistory={alertHistory} alertSource={alertSource} />}
                {activeTab === 'research' && <ResearchTab />}
                {activeTab === 'about' && <AboutTab />}
                </>
              )}
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setTab}
        alertCount={alerts.length}
        onOpenRail={() => setRailOpen(true)}
      />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        refreshIntervalSec={refreshIntervalSec}
        setRefreshIntervalSec={setRefreshIntervalSec}
        compactMode={compactMode}
        setCompactMode={setCompactMode}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  );
}
