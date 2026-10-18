import { describe, expect, it } from 'vitest';
import { shareTextIssues } from './shareChart.js';

const complete = {
  title: 'USDT price vs $1.00',
  rangeLabel: '~90D',
  interpretation: 'USDT secondary-market price against the $1.00 reference.',
  definition: 'USDT market price versus a $1.00 reference line over the last 90 days.',
};

describe('shareTextIssues', () => {
  it('accepts a complete card', () => {
    expect(shareTextIssues(complete)).toEqual([]);
  });

  it('names every missing field instead of filling a generic default', () => {
    expect(shareTextIssues({})).toEqual(['title', 'range', 'interpretation', 'definition']);
  });

  it('treats a blank or whitespace field as missing', () => {
    expect(shareTextIssues({ ...complete, interpretation: '' })).toEqual(['interpretation']);
    expect(shareTextIssues({ ...complete, definition: '   ' })).toEqual(['definition']);
  });

  it('rejects a non-string field', () => {
    expect(shareTextIssues({ ...complete, title: null })).toEqual(['title']);
    expect(shareTextIssues({ ...complete, rangeLabel: 90 })).toEqual(['range']);
  });

  it('is safe with no argument', () => {
    expect(shareTextIssues()).toEqual(['title', 'range', 'interpretation', 'definition']);
  });
});
