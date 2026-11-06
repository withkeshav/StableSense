#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { replayPrices } from './lib/alert-replay.mjs';
const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('Usage: node scripts/replay-alerts.mjs <input.json> <output.json>');
  process.exit(2);
}
try {
  const raw = readFileSync(input);
  const fixture = JSON.parse(raw);
  if (fixture.version !== 1 || !Array.isArray(fixture.datasets) || !fixture.datasets.length) throw new Error('Expected version 1 with nonempty datasets');
  const result = { version: 1, inputSha256: createHash('sha256').update(raw).digest('hex'),
    rulesSha256: Object.fromEntries(['src/lib/derive.js','src/lib/alert-policy.js','src/utils/coin-config.js'].map((file) => [file,createHash('sha256').update(readFileSync(new URL('../'+file,import.meta.url))).digest('hex')])),
    scope: 'Retrospective sampled price detection, not live delivery, predictive reliability or supply-rule validation',
    datasets: fixture.datasets.map((dataset) => replayPrices(dataset)),
    delayedInputSensitivity: fixture.datasets.map((dataset) => replayPrices(dataset,{assumedDelayMs:3*3600000})) };
  writeFileSync(output,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result.datasets.map(({id,coverage,warningSamples,warningEpisodes,unmatchedWarningSamples,falseAlarmRate,incidents})=>({id,coverage,warningSamples,warningEpisodes,unmatchedWarningSamples,falseAlarmRate,incidents})),null,2));
} catch (error) { console.error(error.message); process.exit(2); }
