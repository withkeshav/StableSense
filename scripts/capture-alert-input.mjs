#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { evaluateCapture } from './lib/alert-capture.mjs';

const [endpoint, directory] = process.argv.slice(2);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
try {
  if (!endpoint || !directory) throw new Error('Usage: node scripts/capture-alert-input.mjs <market-url> <private-output-directory>');
  const url = new URL(endpoint);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('Use an HTTP(S) market URL without credentials, query or fragment');
  }
  const output = resolve(directory);
  const repo = resolve(new URL('..', import.meta.url).pathname);
  if (output === repo || output.startsWith(repo + '/')) throw new Error('Store captures outside the public checkout');
  mkdirSync(output, { recursive: true, mode: 0o700 });
  const record = { version: 1, endpoint: url.href, startedAt: Date.now(),
    receiptMeaning: 'Arrival at this recorder, not upstream Helix ingestion or every user browser',
    rulesSha256: Object.fromEntries(['src/lib/derive.js', 'src/lib/alert-policy.js', 'src/lib/marketBackend.js', 'src/utils/coin-config.js']
      .map((file) => [file, hash(readFileSync(new URL('../' + file, import.meta.url)))])) };
  let raw;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'error', headers: { accept: 'application/json' } });
    record.httpStatus = response.status;
    raw = await response.text();
    record.receivedAt = Date.now();
    record.responseSha256 = hash(raw);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const payload = JSON.parse(raw);
    record.evaluation = evaluateCapture(payload, record.receivedAt);
    record.status = 'captured';
  } catch (error) {
    record.receivedAt ??= Date.now();
    record.status = 'unavailable';
    record.error = error.message;
  }
  const stem = join(output, record.startedAt + '-' + randomUUID());
  if (raw !== undefined) writeFileSync(stem + '.response.txt', raw, { flag: 'wx', mode: 0o600 });
  writeFileSync(stem + '.json', JSON.stringify(record, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ file: stem + '.json', status: record.status,
    prices: record.evaluation?.prices.map(({ symbol, status }) => ({ symbol, status })),
    alerts: record.evaluation?.alerts.length }));
  if (record.status !== 'captured') process.exitCode = 1;
} catch (error) { console.error(error.message); process.exitCode = 2; }
