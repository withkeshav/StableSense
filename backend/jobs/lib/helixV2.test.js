import { describe, expect, it } from 'vitest';
import { mapBulkMarketPayload } from './helixV2.js';

const T0 = Date.parse('2026-10-18T12:00:00.000Z');

function bulkFixture(over = {}) {
  return {
    as_of: '2026-10-18T12:00:00Z',
    window: 'latest',
    assets: [
      {
        asset: 'USDT',
        latest: { timestamp: '2026-10-18T12:00:00Z', total_supply: 1000, price: 1.001 },
        prev_24h: { timestamp: '2026-10-17T12:00:00Z', total_supply: 990, price: 0.999 },
        chains: [
          {
            chain_key: 'ethereum',
            chain_name: 'Ethereum',
            latest: { timestamp: '2026-10-18T12:00:00Z', supply: 400 },
            prev_24h: { timestamp: '2026-10-17T12:00:00Z', supply: 390 },
          },
          {
            chain_key: 'tron',
            chain_name: 'Tron',
            latest: { timestamp: '2026-10-18T12:00:00Z', supply: 600 },
            prev_24h: null,
          },
        ],
        error: null,
      },
      {
        asset: 'USDC',
        latest: { timestamp: '2026-10-18T12:00:00Z', total_supply: 500, price: null },
        prev_24h: null,
        chains: [
          {
            chain_key: 'ethereum',
            chain_name: 'Ethereum',
            latest: { timestamp: '2026-10-18T12:00:00Z', supply: 500 },
            prev_24h: null,
          },
        ],
        error: null,
      },
      {
        asset: 'NOPE',
        latest: null,
        prev_24h: null,
        chains: null,
        error: { code: 'asset_not_enabled', detail: "Asset 'NOPE' is not enabled" },
      },
    ],
    market: {
      asset_count: 3,
      assets_included: 2,
      assets_failed: 1,
      supply_coverage_assets: 2,
      total_supply: 1500,
      total_supply_prev_24h: 1490,
      delta_coverage_assets: 1,
      delta_24h_supply: 10,
      delta_24h_pct: 0.671,
    },
    ...over,
  };
}

describe('mapBulkMarketPayload', () => {
  it('maps one price row per included asset with a percent change', () => {
    const { priceRows } = mapBulkMarketPayload(bulkFixture());
    expect(priceRows).toHaveLength(2);
    const usdt = priceRows.find((r) => r.coin === 'USDT');
    expect(usdt).toMatchObject({ ts: T0, price: 1.001, volume: null });
    expect(usdt.change).toBeCloseTo(0.2002, 3);
    const usdc = priceRows.find((r) => r.coin === 'USDC');
    expect(usdc.change).toBe(null);
    expect(usdc.price).toBe(null);
  });

  it('converts chain supply to USD and keeps a missing prior sample null', () => {
    const { snapshotRows } = mapBulkMarketPayload(bulkFixture());
    // USDC has no price, so its chain row is skipped rather than written as zero.
    expect(snapshotRows).toHaveLength(2);
    const eth = snapshotRows.find((r) => r.chain === 'ethereum');
    expect(eth.coin).toBe('USDT');
    expect(eth.circulating).toBeCloseTo(400 * 1.001, 6);
    expect(eth.delta).toBeCloseTo((400 - 390) * 1.001, 6);
    const tron = snapshotRows.find((r) => r.chain === 'tron');
    expect(tron.delta).toBe(null);
  });

  it('carries the market totals and coverage', () => {
    const { marketRow, coverage } = mapBulkMarketPayload(bulkFixture());
    expect(marketRow).toEqual({ ts: T0, total: 1500, delta: 10 });
    expect(coverage).toEqual({ requested: 3, included: 2, failed: 1 });
  });

  it('reports failed asset slots without dropping the good ones', () => {
    const { failed, priceRows } = mapBulkMarketPayload(bulkFixture());
    expect(failed).toEqual([
      { asset: 'NOPE', code: 'asset_not_enabled', detail: "Asset 'NOPE' is not enabled" },
    ]);
    expect(priceRows.map((r) => r.coin)).toEqual(['USDT', 'USDC']);
  });

  it('returns no market row when the total is missing, never zero', () => {
    const fixture = bulkFixture();
    fixture.market.total_supply = null;
    expect(mapBulkMarketPayload(fixture).marketRow).toBe(null);
  });

  it('marks an asset with no latest point as failed', () => {
    const fixture = bulkFixture();
    fixture.assets[0].latest = null;
    const out = mapBulkMarketPayload(fixture);
    expect(out.failed.some((f) => f.asset === 'USDT' && f.code === 'no_latest')).toBe(true);
  });

  it('tolerates an empty payload', () => {
    expect(mapBulkMarketPayload({})).toEqual({
      priceRows: [],
      snapshotRows: [],
      marketRow: null,
      failed: [],
      coverage: null,
    });
  });
});
