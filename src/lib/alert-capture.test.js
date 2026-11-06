import { describe, it, expect } from 'vitest';
import { evaluateCapture } from '../../scripts/lib/alert-capture.mjs';

const now = 1800000000000;
const payload = (ts = now - 60000) => ({ coins: [{ symbol: 'USDC', price: 0.98, ts }] });
describe('prospective alert capture', () => {
  it('preserves observation and arrival times and evaluates real price rules', () => {
    const result = evaluateCapture(payload(), now);
    expect(result.prices.find((p) => p.symbol === 'USDC')).toMatchObject({ observedAt: now - 60000, availableAt: now, status: 'fresh' });
    expect(result.alerts.some((a) => a.rule === 'PEG_BREAK' && a.severity === 'CRITICAL')).toBe(true);
    expect(result.adjudication).toBe('unlabelled');
  });
  it('does not convert stale prices into fresh warnings', () => {
    const result = evaluateCapture(payload(now - 7200000), now);
    expect(result.prices.find((p) => p.symbol === 'USDC').status).toBe('stale');
    expect(result.alerts).toEqual([]);
  });
  it('marks missing assets unavailable, not healthy negatives', () => {
    const result = evaluateCapture({ coins: [] }, now);
    expect(result.prices.every((p) => p.status === 'unavailable')).toBe(true);
    expect(result.coverage.complete).toBe(false);
  });
  it('rejects malformed and duplicate payloads', () => {
    expect(() => evaluateCapture({}, now)).toThrow();
    expect(() => evaluateCapture({ coins: [payload().coins[0], payload().coins[0]] }, now)).toThrow('Duplicate');
  });
  it('marks future source times unavailable', () => {
    const result = evaluateCapture(payload(now + 60000), now);
    expect(result.prices.find((p) => p.symbol === 'USDC').status).toBe('unavailable');
    expect(result.alerts).toEqual([]);
  });
});
