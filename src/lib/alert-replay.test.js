import { describe, it, expect } from 'vitest';
import { replayPrices } from '../../scripts/lib/alert-replay.mjs';
const H = 3600000, T = Date.UTC(2023,2,10);
const window = {start:T,end:T+4*H};
const label = { id:'synthetic-event',source:'Synthetic test label, not a historical claim',...window };
const fixture = (prices=[1,0.99,0.99,1]) => ({ id:'synthetic',symbol:'USDC',quote:'USD',source:'Synthetic test observations',expectedStepMs:H,window,incidents:[label],observations:prices.map((price,i)=>({price,observedAt:T+i*H})) });
describe('historical replay scoring on synthetic fixtures',()=>{
 it('runs the real alert rules at source times and counts episodes rather than refresh IDs',()=>{
  const r=replayPrices(fixture());expect(r.warningSamples).toBe(2);expect(r.warningEpisodes).toBe(1);
  expect(r.incidents[0].status).toBe('detected');expect(r.incidents[0].firstWarningObservedAt).toBe(T+H);
  expect(r.falseAlarmRate).toBeNull();expect(r.labelledNegativeSamples).toBe(0);
 });
 it('reports a miss only for a sufficiently covered sampled feed',()=>{
  expect(replayPrices(fixture([1,1,1,1])).incidents[0].status).toBe('missed_in_sampled_feed');
  const sparse=fixture([1,1,1,1]);sparse.observations.splice(1,2);
  expect(replayPrices(sparse).incidents[0].status).toBe('unmeasurable');
 });
 it('does not relabel unknown hours as false alarms',()=>{
  const d=fixture();d.incidents=[];
  const r=replayPrices(d);expect(r.unmatchedWarningSamples).toBe(2);expect(r.falseAlarmRate).toBeNull();
 });
 it('computes false positives only within explicitly labelled observable negatives',()=>{
  const d=fixture();d.incidents=[];d.negativeWindows=[label];
  const r=replayPrices(d);expect(r.falseAlarmSamples).toBe(2);expect(r.falseAlarmRate).toBe(.5);
 });
 it('keeps source timestamps during a constructed delivery delay and abstains on stale inputs',()=>{
  const r=replayPrices(fixture(),{assumedDelayMs:3*H});
  expect(r.warningSamples).toBe(0);expect(r.staleSamples).toBe(4);expect(r.incidents[0].status).toBe('unmeasurable');
  expect(r.observations[1].observedAt).toBe(T+H);
 });
 it('distinguishes original delivery time from observation order',()=>{
  const d=fixture([0.99,0.99,1,1]);d.observations[0].availableAt=T+1.5*H;d.observations[1].availableAt=T+H;
  const r=replayPrices(d);expect(r.incidents[0].firstWarningObservedAt).toBe(T);
  expect(r.incidents[0].firstWarningEvaluatedAt).toBe(T+H);
 });
 it('does not treat unsupported assets as misses',()=>{
  const r=replayPrices({...fixture(),symbol:'UST'});expect(r.status).toBe('unsupported');expect(r.incidents).toEqual([]);
 });
 it('rejects quote-relative pairs and contradictory labels',()=>{
  expect(()=>replayPrices({...fixture(),quote:'USDT'})).toThrow();
  expect(()=>replayPrices({...fixture(),negativeWindows:[label]})).toThrow();
 });
 it('deduplicates repeats and excludes conflicting observations without guessing a winner',()=>{
  const d=fixture();d.observations.push({...d.observations[0]},{...d.observations[1],price:1});
  const r=replayPrices(d);expect(r.exclusions.duplicate).toBe(1);expect(r.exclusions.conflicting).toBe(2);expect(r.warningSamples).toBe(1);
 });
 it('rejects invalid prices, future-before-arrival data and dates outside the requested interval',()=>{
  const d=fixture();d.observations=[{price:null,observedAt:T},{price:0,observedAt:T},{price:.9,observedAt:T,availableAt:T-1},{price:.9,observedAt:T-1}];
  const r=replayPrices(d);expect(r.status).toBe('unmeasurable');expect(r.availability).toBe('unknown');
  expect(r.exclusions.invalid).toBe(3);expect(r.exclusions.outsideWindow).toBe(1);
 });
 it('breaks episodes across missing intervals',()=>{
  const d=fixture([.99,.99,.99,.99]);d.observations.splice(1,2);
  expect(replayPrices(d).warningEpisodes).toBe(2);
 });
 it('preserves positive versus negative depegs and exact threshold precision',()=>{
  const r=replayPrices(fixture([1.005,0.995,0.99904,1]));expect(r.severitySamples.CRITICAL).toBe(2);expect(r.warningSamples).toBe(2);
 });
});
