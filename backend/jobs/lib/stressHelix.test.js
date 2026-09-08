import { describe, expect, it } from 'vitest';
import {
  filterTrackedEvents,
  isMappableEvent,
  mapHelixEventToLabel,
  mapHelixEventToRow,
  mapStressRow,
  normalizeEventsPayload,
  parseMagnitude,
  pricesFromPoints,
  selectStressPath,
  statsFromSeries,
} from './stressHelix.js';

const T0 = Date.parse('2026-08-01T00:00:00.000Z');
const MIN10 = 600000;

function trendPoint(i, price, depeg = 0.5) {
  return {
    timestamp: T0 + i * MIN10,
    total_supply: 1000 + i,
    price,
    depeg_index: depeg,
    signal_score: 0,
    signal_band: 'neutral',
    concentration_score: 0,
    data_confidence: 'high',
  };
}

function helixEvent(over = {}) {
  return {
    id: 'evt-1',
    asset_symbol: 'USDT',
    chain_key: 'ethereum',
    event_type: 'depeg',
    severity: 'warn',
    title: 'USDT slipped',
    summary: 'USDT moved off peg',
    old_value: '1.0',
    new_value: '0.998',
    delta: '-0.002',
    threshold: '0.001',
    timestamp: new Date(T0 + 50 * MIN10).toISOString(),
    ...over,
  };
}

describe('mapStressRow depeg_index mapping', () => {
  it('uses the newest point timestamp and depeg_index', () => {
    const points = [trendPoint(0, 1.0, 0.2), trendPoint(1, 1.001, 0.9), trendPoint(2, 0.999, 1.7)];
    const row = mapStressRow('USDT', points, T0);
    expect(row.symbol).toBe('USDT');
    expect(row.ts).toBe(T0 + 2 * MIN10);
    expect(row.stress).toBe(1.7);
  });

  it('falls back to 0 when depeg_index is missing', () => {
    const points = [{ timestamp: T0, total_supply: 5, price: 1.0 }];
    const row = mapStressRow('USDC', points, T0);
    expect(row.stress).toBe(0);
  });

  it('returns null for empty points', () => {
    expect(mapStressRow('USDT', [], T0)).toBe(null);
  });
});

describe('z-score path reuses extracted stats', () => {
  it('matches statsFromSeries over the price series', () => {
    const prices = [1.0, 1.001, 0.999, 1.0, 1.002, 0.998, 1.0, 1.001, 0.9995, 1.0005];
    const points = prices.map((p, i) => trendPoint(i, p, 0.3));
    const row = mapStressRow('DAI', points, T0);
    const expected = statsFromSeries(pricesFromPoints(points));
    expect(row.z).toBe(expected.z);
    expect(row.delta).toBe(expected.delta);
    expect(row.normalized).toBe(expected.normalized);
  });

  it('returns zeros for series shorter than 8 points', () => {
    const points = [1.0, 1.001, 0.999].map((p, i) => trendPoint(i, p, 0.1));
    const row = mapStressRow('PYUSD', points, T0);
    expect({ z: row.z, delta: row.delta, normalized: row.normalized }).toEqual({
      z: 0,
      delta: 0,
      normalized: 0,
    });
  });

  it('caps z at 10 for extreme jumps', () => {
    const prices = [1, 1, 1, 1, 1, 1, 1, 1, 50];
    expect(statsFromSeries(prices).z).toBeLessThanOrEqual(10);
  });
});

describe('event row mapping', () => {
  it('prefixes id, converts timestamp to ms, parses magnitude', () => {
    const now = T0 + 60 * MIN10;
    const row = mapHelixEventToRow(helixEvent(), now);
    expect(row.event_id).toBe('helix-evt-1');
    expect(row.rule).toBe('depeg');
    expect(row.classification).toBe('canonical');
    expect(row.symbol).toBe('USDT');
    expect(row.severity).toBe('warn');
    expect(row.headline).toBe('USDT slipped');
    expect(row.explanation).toBe('USDT moved off peg');
    expect(row.magnitude).toBeCloseTo(0.002, 6);
    expect(row.observed_at).toBe(T0 + 50 * MIN10);
    expect(row.detected_at).toBe(T0 + 50 * MIN10);
    expect(row.state).toBe('open');
    expect(row.published_at).toBe(now);
    expect(row.updated_at).toBe(now);
    expect(JSON.parse(row.involved_chains)).toEqual(['ethereum']);
  });

  it('maps numeric delta and null-magnitude cases', () => {
    expect(parseMagnitude('-0.5')).toBe(0.5);
    expect(parseMagnitude(3)).toBe(3);
    expect(mapHelixEventToRow(helixEvent({ id: 'a', delta: 'n/a' }), T0).magnitude).toBe(null);
    expect(mapHelixEventToRow(helixEvent({ id: 'b', delta: null }), T0).magnitude).toBe(null);
    expect(mapHelixEventToRow(helixEvent({ id: 'c' }), T0).magnitude).toBeCloseTo(0.002, 6);
  });

  it('rejects events missing id, symbol, or timestamp', () => {
    expect(isMappableEvent(helixEvent({ id: null }))).toBe(false);
    expect(isMappableEvent(helixEvent({ asset_symbol: '' }))).toBe(false);
    expect(isMappableEvent(helixEvent({ timestamp: 'bad' }))).toBe(false);
    expect(mapHelixEventToRow(helixEvent({ id: null }), T0)).toBe(null);
    expect(mapHelixEventToLabel(helixEvent({ asset_symbol: '' }))).toBe(null);
  });

  it('maps labels with summary and magnitude', () => {
    const label = mapHelixEventToLabel(helixEvent());
    expect(label).toMatchObject({
      symbol: 'USDT',
      type: 'depeg',
      severity: 'warn',
      explanation: 'USDT moved off peg',
    });
    expect(label.ts).toBe(T0 + 50 * MIN10);
    expect(label.magnitude).toBeCloseTo(0.002, 6);
  });
});

describe('events payload shapes and tracked filter', () => {
  it('normalizes both {data:[...]} and bare arrays', () => {
    const ev = helixEvent();
    expect(normalizeEventsPayload({ data: [ev] })).toEqual([ev]);
    expect(normalizeEventsPayload([ev])).toEqual([ev]);
    expect(normalizeEventsPayload({})).toEqual([]);
  });

  it('keeps tracked assets newest first', () => {
    const oldEv = helixEvent({ id: 'old', asset_symbol: 'USDT', timestamp: new Date(T0).toISOString() });
    const newEv = helixEvent({ id: 'new', asset_symbol: 'USDT', timestamp: new Date(T0 + 99 * MIN10).toISOString() });
    const other = helixEvent({ id: 'x', asset_symbol: 'UNKNOWN', timestamp: new Date(T0 + 50 * MIN10).toISOString() });
    const out = filterTrackedEvents([oldEv, other, newEv], ['USDT']);
    expect(out.map((e) => e.id)).toEqual(['new', 'old']);
  });
});

describe('selectStressPath', () => {
  it('selects legacy only when LEGACY_UPSTREAMS=1', () => {
    expect(selectStressPath({ LEGACY_UPSTREAMS: '1' })).toBe('legacy');
    expect(selectStressPath({})).toBe('helix');
    expect(selectStressPath({ LEGACY_UPSTREAMS: '0' })).toBe('helix');
    expect(selectStressPath({ LEGACY_UPSTREAMS: '' })).toBe('helix');
  });
});
