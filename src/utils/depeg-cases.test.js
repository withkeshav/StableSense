import { describe, expect, it } from 'vitest';
import { AS_OF, REVIEW_AS_OF, DEPEG_CASES } from './depeg-cases.js';
import { RESEARCH_REVIEWED, geniusStatus } from '../../research/data.js';

describe('research publication date discipline', () => {
  it('does not re-date the historical cases when publishing a new review', () => {
    expect(AS_OF).toBe('2026-09-26');
    expect(REVIEW_AS_OF).toBe(RESEARCH_REVIEWED);
    expect(REVIEW_AS_OF).toBe('2026-11-05');
    expect(REVIEW_AS_OF).not.toBe(AS_OF);
  });

  it('retains the original case event dates', () => {
    expect(DEPEG_CASES.ust.date).toBe('May 2022');
    expect(DEPEG_CASES.usdc.date).toBe('March 2023');
    expect(DEPEG_CASES.usde.date).toBe('October 2025');
  });

  it('separates a verified OCC rule from an unknown all-agency count', () => {
    expect(geniusStatus.finalRules).toBeNull();
    expect(geniusStatus.commencementStatus).toContain('January 18, 2027');
    expect(geniusStatus.url).toContain('bulletin-2026-50');
    expect(geniusStatus.totalRulemakings).toBeNull();
    expect(geniusStatus.note).toContain('No current-effect claim');
  });
});
