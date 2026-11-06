import { describe, expect, it } from 'vitest';
import { buildMarketView } from './marketView.js';
const now = 1_786_000_000_000;
const hour = 3600000;
const row = (over = {}) => ({ chain: 'ethereum', ts: now, prevTs: now - 24 * hour, circulating: 100, delta: 0, ...over });
const view = (rows = [row()], over = {}) => buildMarketView({
  symbol: 'USDT', nowMs: now, priceRows: [{ coin: 'USDT', ts: now - 1000, price: 1 }],
  chainBatches: [{ coin: 'USDT', complete: true, rows }], ...over,
});
describe('current market membership', () => {
  it('uses only the explicit chain batch, never old history or a global fallback', () => {
    const result = view([row()], { snapshotRows: [{ coin: 'USDT', chain: 'removed', circulatingUsd: 999 }], marketRow: { total: 999 } });
    expect(result.market.totalCirculatingUsd).toBe(100);
    expect(result.coins[0].name).toBe('Tether USD');
    expect(result.market.delta24hUsd).toBe(0);
    expect(result.coins[0].chains).toHaveLength(1);
  });
  it('keeps measurement clocks separate and uses the older clock overall', () => {
    const result = view();
    expect(result.spotObservedAt).toBe(now - 1000);
    expect(result.supplyObservedAt).toBe(now);
    expect(result.observedAt).toBe(now - 1000);
  });
  it('retains a 72h comparison without calling it a 24h change', () => {
    const result = view([row({ prevTs: now - 72 * hour, delta: 10 })]);
    expect(result.coins[0].chains[0]).toMatchObject({ delta: 10, delta24h: null, intervalHours: 72 });
    expect(result.market.delta24hUsd).toBeNull();
  });
  it.each([
    [row({ ts: now - 49 * hour })],
    [row(), row({ chain: 'Ethereum' })],
    [row({ circulating: -1 })],
    [row({ ts: now + hour })],
  ])('withholds totals for invalid, stale, or duplicate membership: %j', (...rows) => {
    expect(view(rows).market.totalCirculatingUsd).toBeNull();
  });
  it('withholds combined totals if any tracked coin is missing', () => {
    const result = view([row()], { symbol: null });
    expect(result.coins).toHaveLength(5);
    expect(result.market.totalCirculatingUsd).toBeNull();
    expect(result.coverage.complete).toBe(false);
  });
  it('shows unknown until a batch is fetched, without recycling historical rows', () => {
    const result = view([], { chainBatches: [] });
    expect(result.coins[0].supply).toBeNull();
    expect(result.observedAt).toBeNull();
  });
  it('does not replace overflow with unrelated market totals', () => {
    expect(view([row({ circulating: 1e308 }), row({ chain: 'tron', circulating: 1e308 })]).market.totalCirculatingUsd).toBeNull();
  });
});
