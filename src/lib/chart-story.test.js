import { describe, it, expect } from 'vitest';
import { buildChartStory, CHART_STORIES } from './chart-story.js';
const dates = [Date.UTC(2025,11,31), Date.UTC(2026,0,1)];
const chart = (values, label='USDT') => ({ dates, labels:['Dec 31','Jan 1'], datasets:[{label,data:values}] });
describe('shared chart stories', () => {
  it('reads actual values and both years, rather than a nominal 90-day window', () => {
    const story=buildChartStory(chart([1e9,2e9]),{kind:'supply'});
    expect(story.interpretation).toContain('$1.00B to $2.00B');
    expect(story.rangeDetail).toContain('2025');expect(story.rangeDetail).toContain('2026');
    expect(story.asOf).toBe(dates[1]);
  });
  it('changes the story with percent mode, including percentage-point units', () => {
    const story=buildChartStory(chart([0,10]),{kind:'supplyPct'});
    expect(story.interpretation).toContain('0.00% to 10.00%');
    expect(story.interpretation).toContain('+10.00 percentage points');
    expect(story.definition).toContain('Not market share');
  });
  it('names a fall and a flat series accurately', () => {
    expect(buildChartStory(chart([2e9,1e9]),{kind:'supply'}).interpretation).toContain('-$1.00B');
    expect(buildChartStory(chart([10,10]),{kind:'dominance'}).interpretation).toContain('unchanged');
  });
  it('never turns missing prices into depegs or uses the reference line as a coin', () => {
    const data=chart([null,0.99]);data.datasets.push({label:'$1 peg',data:[1,1]});
    const story=buildChartStory(data,{kind:'price'});
    expect(story.interpretation).toContain('-100.00 bps');expect(story.highlight).toContain('Historical window peak: USDT');
    expect(story.definition).toContain('Missing readings');
  });
  it('leads with the latest plotted reading and separates the historical peak', () => {
    const data=chart([0.98,1.001]);
    const story = buildChartStory(data,{kind:'price'});
    expect(story.interpretation).toContain('$1.0010 (+10.00 bps)');
    expect(story.interpretation).toContain('01 Jan 2026');
    expect(story.interpretation).not.toContain('31 Dec 2025');
    expect(story.highlight).toContain('-200.00 bps');
    expect(story.highlight).toContain('31 Dec 2025');
  });
  it('excludes hidden lines', () => {
    const data=chart([1,1]);data.datasets.push({label:'Hidden coin',hidden:true,data:[0.9,1]});
    expect(buildChartStory(data,{kind:'price'}).interpretation).not.toContain('Hidden coin');
  });
  it('refuses missing dates, missing data and unsupported types', () => {
    expect(buildChartStory({...chart([1,2]),dates:[]},{kind:'price'})).toBeNull();
    expect(buildChartStory(chart([null,null]),{kind:'supply'})).toBeNull();
    expect(buildChartStory(chart([1,2]),{kind:'made-up'})).toBeNull();
  });
  it('does not invent a trend from one point', () => {
    expect(buildChartStory(chart([null,1e9]),{kind:'supply'}).interpretation).toContain('No trend');
  });
  it('handles all-positive, all-negative, zero and partial flow bars without false missing-data claims', () => {
    const data=chart([100,200],'Net change');data.labels=['Ethereum','Solana'];delete data.dates;
    const spec={kind:'flow',scope:'USDC',asOf:dates[1],complete:true};
    expect(buildChartStory(data,spec).interpretation).toContain('Solana');
    expect(buildChartStory(data,spec).interpretation).not.toContain('partial');
    data.datasets[0].data=[-300,-200];expect(buildChartStory(data,spec).interpretation).toContain('Ethereum');
    expect(buildChartStory(data,{...spec,complete:false}).interpretation).toContain('Coverage is partial');
    data.datasets[0].data=[0,0];expect(buildChartStory(data,spec).interpretation).toContain('zero change');
  });
  it('qualifies exchange volume as one ticker per venue, not full exchange volume', () => {
    const story=buildChartStory(chart([10,20]),{kind:'volume'});
    expect(story.definition).toContain('one highest-volume ticker per venue');
  });
  it('does not describe zero trading volume as a change', () => {
    const story = buildChartStory(chart([0, 0]), { kind: 'volume' });
    expect(story.interpretation).toBe('All displayed venues have zero sampled volume.');
  });
  it('all supported chart kinds have one central template', () => expect(Object.keys(CHART_STORIES)).toHaveLength(7));
});

it('recomputes every card kind from changed chart values', () => {
  const cases = [
    ['supply', [1e9, 2e9], [1e9, 3e9], '$3.00B'],
    ['supplyPct', [0, 10], [0, 20], '+20.00 percentage points'],
    ['dominance', [10, 11], [10, 13], '+3.00 percentage points'],
    ['price', [1, 0.99], [1, 0.98], '-200.00 bps'],
    ['deviation', [0, -100], [0, -200], '-200.00 bps'],
    ['flow', [100, 200], [100, 300], '$300'],
    ['volume', [100, 200], [100, 300], '$300'],
  ];
  for (const [kind, before, after, expected] of cases) {
    const original = buildChartStory(chart(before), { kind });
    const updated = buildChartStory(chart(after), { kind });
    expect(updated.interpretation).not.toBe(original.interpretation);
    expect(updated.interpretation).toContain(expected);
    expect(updated.asOf).toBe(dates[1]);
  }
});

it('selects the latest available time before comparing price deviations', () => {
  const data = chart([0.98, null], 'Older coin');
  data.datasets.push({ label: 'Fresh coin', data: [1, 1.001] });
  for (const kind of ['price', 'deviation']) {
    const story = buildChartStory(data, { kind });
    expect(story.interpretation).toContain('Latest plotted reading: Fresh coin');
    expect(story.interpretation).toContain('01 Jan 2026');
    expect(story.interpretation).not.toContain('Older coin');
    expect(story.asOf).toBe(dates[1]);
    expect(story.definition).toContain('Missing readings are gaps.');
  }
});

it('uses the last actual reading when the end of a chart is missing', () => {
  const story = buildChartStory(chart([0.99, null]), { kind: 'price' });
  expect(story.asOf).toBe(dates[0]);
  expect(story.interpretation).toContain('31 Dec 2025');
  expect(story.interpretation).not.toContain('01 Jan 2026');
  expect(story.timestamp).toContain('31 Dec 2025');
});

it('requires the source observation clock for undated flow and volume snapshots', () => {
  const data = chart([10, 20]);
  delete data.dates;
  for (const kind of ['flow', 'volume']) {
    expect(buildChartStory(data, { kind })).toBeNull();
    const story = buildChartStory(data, { kind, asOf: dates[0] });
    expect(story.asOf).toBe(dates[0]);
    expect(story.timestamp).toContain('31 Dec 2025');
    expect(story.rangeDetail).toContain('underlying windows may differ');
  }
});
