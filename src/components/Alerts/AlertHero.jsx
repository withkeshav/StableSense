import { useEffect, useState } from 'preact/hooks';
import { getActiveCoins } from '../../utils/coin-config.js';
import AiTicker from '../ui/AiTicker.jsx';

export default function AlertHero({ intelligence, alertCount, activityCount = 0 }) {
  const coins = getActiveCoins();
  const [asset, setAsset] = useState(coins[0]?.symbol || 'USDT');
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const insights = Array.isArray(intelligence?.insights) ? intelligence.insights : [];
  const selected = insights.find(item => item.asset === asset && item.validUntil > now);
  return (
    <div class="alert-hero card mb-4">
      <div class="card-body">
        <div class="alert-hero-kicker">Helix AI commentary <span class="alpha-chip">Alpha</span></div>
        <label>Coin{' '}
          <select class="settings-select filter-select" value={asset} onChange={e => setAsset(e.currentTarget.value)}>
            {coins.map(coin => <option key={coin.symbol} value={coin.symbol}>{coin.symbol}</option>)}
          </select>
        </label>
        <h2 class="alert-hero-title">{asset} insight from Helix</h2>
        <p class="alert-hero-copy" style={{ whiteSpace: 'pre-line' }}>{selected?.narrative || `No recent Helix insight is available for ${asset}.`}</p>
        <p class="alert-hero-copy muted">Commentary about {asset} only, not a five-coin market summary or a live alert. AI interpretation may be wrong.</p>
        <AiTicker intelligence={selected} />
        <div class="alert-hero-meta">Current warnings across tracked coins: {alertCount} · Activity observations: {activityCount} · Alerts use rules independently of AI commentary</div>
      </div>
    </div>
  );
}
