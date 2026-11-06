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
    expect(story.interpretation).toContain('-100.00 bps');expect(story.highlight).toBe('Displayed: USDT');
    expect(story.definition).toContain('Missing readings');
  });
  it('uses the greatest measured deviation, not a different current spot price', () => {
    const data=chart([0.98,1.001]);
    expect(buildChartStory(data,{kind:'price'}).interpretation).toContain('-200.00 bps');
    expect(buildChartStory(data,{kind:'price'}).interpretation).toContain('31 Dec 2025');
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
  it('all supported chart kinds have one central template', () => expect(Object.keys(CHART_STORIES)).toHaveLength(7));
});
