import { transformMarketPayload } from '../../src/lib/marketBackend.js';
import { generateCurrentAlerts } from '../../src/lib/alert-policy.js';
import { ACTIVE_STABLECOINS } from '../../src/utils/coin-config.js';

/** Evaluate at receipt time, retaining source clocks and incomplete coverage. */
export function evaluateCapture(payload, receivedAt) {
  if (!Number.isFinite(receivedAt) || receivedAt <= 0) throw new Error('Invalid receipt time');
  if (!payload || !Array.isArray(payload.coins)) throw new Error('Expected a market payload with coins');
  const seen = new Set();
  for (const coin of payload.coins) {
    if (!coin || typeof coin.symbol !== 'string') throw new Error('Invalid coin record');
    const symbol = coin.symbol.toUpperCase();
    if (seen.has(symbol)) throw new Error('Duplicate coin record');
    seen.add(symbol);
  }
  const prices = ACTIVE_STABLECOINS.map((symbol) => {
    const coin = payload.coins.find((c) => c.symbol.toUpperCase() === symbol);
    const valid = typeof coin?.price === 'number' && Number.isFinite(coin.price) && coin.price > 0
      && typeof coin?.ts === 'number' && Number.isFinite(coin.ts) && coin.ts > 0 && coin.ts <= receivedAt;
    return { symbol, observedAt: coin?.ts ?? null, availableAt: receivedAt,
      price: coin?.price ?? null, status: !valid ? 'unavailable' : receivedAt - coin.ts >= 7200000 ? 'stale' : 'fresh' };
  });
  const data = transformMarketPayload(payload);
  data.fetchedAt = receivedAt;
  return { prices, alerts: generateCurrentAlerts(data, receivedAt),
    coverage: payload.coverage ?? { complete: false }, adjudication: 'unlabelled' };
}
