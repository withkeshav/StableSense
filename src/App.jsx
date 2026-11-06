import { useCallback, useEffect, useState } from 'preact/hooks';
import { alertSummary } from './lib/alert-policy.js';
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
import useTheme from './hooks/useTheme.js';
import useDashboardData from './hooks/useDashboardData.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { APP_VERSION } from './config.js';
import { coinFromTabId } from './utils/coin-config.js';

export default function App() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(() => /^(#lesson-|#term-)/.test(window.location.hash) ? 'learn' : 'home');
  const [railOpen, setRailOpen] = useState(false);

  const {
    data,
    loading,
    refreshing,
    apiStatus,
    alerts,
    alertHistory,
    lastUpdated,
    freshness,
    refresh,
    refreshIntervalSec,
    priceByCoin,
  } = useDashboardData();

  useEffect(() => {
    const followLearnLink = () => {
      if (/^(#lesson-|#term-)/.test(window.location.hash)) setActiveTab('learn');
    };
    window.addEventListener('hashchange', followLearnLink);
    return () => window.removeEventListener('hashchange', followLearnLink);
  }, []);

  const badge = alertSummary(alerts);
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
        alertCount={badge.count}
        alertTone={badge.tone}
        alerts={alerts}
        priceByCoin={priceByCoin}
        data={data}
        lastUpdated={lastUpdated}
        open={railOpen}
        onClose={() => setRailOpen(false)}
        onOpenMethodology={() => setTab('about')}
      />
      <div class="site-main">
        <Header
          loading={loading}
          refreshing={refreshing}
          apiStatus={apiStatus}
          onRefresh={() => refresh({ background: true })}
          buildVersion={APP_VERSION}
          theme={theme}
          setTheme={setTheme}
          alertCount={badge.count}
        alertTone={badge.tone}
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
                      alertHistory={alertHistory}
                      freshness={freshness}
                    />
                  )}
                {activeTab === 'learn' && <LearnTab data={data} alerts={alerts} />}
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
        alertCount={badge.count}
        alertTone={badge.tone}
        onOpenRail={() => setRailOpen(true)}
      />
    </div>
  );
}
