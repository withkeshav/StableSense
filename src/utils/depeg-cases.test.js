import { describe, expect, it } from 'vitest';
import { AS_OF, REVIEW_AS_OF, DEPEG_CASES } from './depeg-cases.js';
import { RESEARCH_REVIEWED, geniusStatus } from '../../research/data.js';

describe('research publication date discipline', () => {
  it('does not re-date the historical cases when publishing a new review', () => {
    expect(AS_OF).toBe('2026-09-26');
    expect(REVIEW_AS_OF).toBe(RESEARCH_REVIEWED);
    expect(REVIEW_AS_OF).toBe('2026-10-02');
    expect(REVIEW_AS_OF).not.toBe(AS_OF);
  });

  it('retains the original case event dates', () => {
    expect(DEPEG_CASES.ust.date).toBe('May 2022');
    expect(DEPEG_CASES.usdc.date).toBe('March 2023');
    expect(DEPEG_CASES.usde.date).toBe('October 2025');
  });

  it('does not turn unverified final-rule issuance into a zero count', () => {
    expect(geniusStatus.finalRules).toBeNull();
    expect(geniusStatus.commencementStatus).toContain('UNRESOLVED');
  });
});
