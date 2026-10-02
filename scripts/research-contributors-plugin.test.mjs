import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { contributorsPlugin } from './research-contributors-plugin.mjs';

const directory = mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'stablesense-contributor-test-'));
const registry = join(directory, 'contributors.json');
const record = {
  id: 'fixture-validation', name: 'Test Contributor', contribution: 'Test contribution only.',
  publicationTitle: 'Test publication', publicationUrl: 'https://stablesense.withkeshav.com/research/#treasury',
  approvalUrl: 'https://github.com/withkeshav/StableSense/issues/1',
  approvedOn: '2026-10-02', incorporatedOn: '2026-10-02', approved: true, creditConsent: true,
};

test('injects real static HTML and emits its matching badge from the same snapshot', () => {
  writeFileSync(registry, JSON.stringify([record]));
  const plugin = contributorsPlugin(registry);
  plugin.buildStart.call({ addWatchFile() {} });
  const html = plugin.transformIndexHtml('<main><!-- contributor-records --></main>');
  assert.ok(html.includes('id="contribution-fixture-validation"'));
  assert.ok(!html.includes('<!-- contributor-records -->'));
  // A concurrent edit must not make the badge disagree with the rendered card.
  writeFileSync(registry, '[]');
  const emitted = [];
  plugin.generateBundle.call({ emitFile: asset => emitted.push(asset) });
  assert.equal(emitted.length, 1);
  assert.equal(emitted[0].fileName, 'badges/fixture-validation.svg');
  assert.ok(emitted[0].source.includes('Test contribution only.'));
});

test('fails the build for missing registry, malformed records or missing HTML marker', () => {
  assert.throws(() => contributorsPlugin(join(directory, 'missing.json')).buildStart.call({ addWatchFile() {} }));
  writeFileSync(registry, JSON.stringify([{ ...record, approved: false }]));
  assert.throws(() => contributorsPlugin(registry).buildStart.call({ addWatchFile() {} }));
  writeFileSync(registry, '[]');
  const plugin = contributorsPlugin(registry);
  plugin.buildStart.call({ addWatchFile() {} });
  assert.throws(() => plugin.transformIndexHtml('<main></main>'), /marker/);
});

test('preserves literal dollar replacement tokens in contribution text', () => {
  writeFileSync(registry, JSON.stringify([{ ...record, contribution: 'Checked $& and $` literally.' }]));
  const plugin = contributorsPlugin(registry);
  plugin.buildStart.call({ addWatchFile() {} });
  assert.ok(plugin.transformIndexHtml('<main><!-- contributor-records --></main>').includes('Checked $&amp; and $` literally.'));
});

test('serves dev badges and returns 404 for unknown and withdrawn badges', () => {
  writeFileSync(registry, JSON.stringify([record]));
  const plugin = contributorsPlugin(registry);
  let handler;
  plugin.configureServer({ watcher: { add() {}, on() {} }, ws: { send() {} },
    middlewares: { use(callback) { handler = callback; } } });
  const requestBadge = url => {
    const response = { setHeader() {}, end(body) { this.body = body; } };
    handler({ url }, response, error => { if (error) throw error; });
    return response;
  };
  assert.equal(requestBadge('/research/badges/fixture-validation.svg').statusCode, 200);
  assert.equal(requestBadge('/badges/fixture-validation.svg').statusCode, 200);
  assert.equal(requestBadge('/badges/missing.svg').statusCode, 404);
  assert.equal(requestBadge('/badges/toString').statusCode, 404);
  writeFileSync(registry, JSON.stringify([{ ...record, withdrawnOn: '2026-10-03', withdrawalReason: 'Test withdrawal.' }]));
  assert.equal(requestBadge('/badges/fixture-validation.svg').statusCode, 404);
});
