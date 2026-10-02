import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawnSync, execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

test('rejects internal agent instructions from a publication tree', async () => {
  const { unexpectedPaths } = await import('./verify-public-tree.mjs')
  assert.deepEqual(unexpectedPaths(['AGENTS.md']), ['AGENTS.md'])
})

test('publishes website paths and explicitly reviewed docs only', async () => {
  const { unexpectedPaths } = await import('./verify-public-tree.mjs')
  const allowed = ['README.md', 'LICENSE', 'src/App.jsx', 'backend/server.js',
    'research/index.html', 'public/favicon.svg', '.github/workflows/ci.yml',
    'scripts/verify-hub-depth.mjs', 'docs/research-methodology.md',
    'docs/research/public/claim-template.md', 'backend/.env.example']
  const blocked = ['.hermes/plans/run.md', 'docs/legal-readiness/readiness.md',
    'docs/research/run/claims.json', 'docs/research/public/transcript.md',
    'docs/internal-notes.md', '.progress/run.md', 'backend/.env',
    'src/AGENTS.md', 'agent.md', 'archives/raw.tar.gz']
  assert.deepEqual(unexpectedPaths([...allowed, ...blocked]), blocked)
})

test('cannot measure an invalid Git revision and exits 2', () => {
  const run = spawnSync(process.execPath,
    ['scripts/verify-public-tree.mjs', 'missing-public-tree-fixture'], { encoding: 'utf8' })
  assert.equal(run.status, 2)
  assert.ok(run.stdout.includes('UNKNOWN'))
})

test('CLI passes a measured allowed tree and rejects an internal addition', () => {
  const directory = mkdtempSync(join(tmpdir(), 'public-tree-fixture-'))
  const script = fileURLToPath(new URL('./verify-public-tree.mjs', import.meta.url))
  try {
    execFileSync('git', ['init', '-q', directory])
    writeFileSync(join(directory, 'README.md'), 'Synthetic publication fixture\n')
    execFileSync('git', ['add', 'README.md'], { cwd: directory })
    const pass = spawnSync(process.execPath, [script, '--index'], { cwd: directory, encoding: 'utf8' })
    assert.equal(pass.status, 0)
    assert.ok(pass.stdout.includes('PASS'))
    writeFileSync(join(directory, 'AGENTS.md'), 'Synthetic internal fixture\n')
    execFileSync('git', ['add', 'AGENTS.md'], { cwd: directory })
    const fail = spawnSync(process.execPath, [script, '--index'], { cwd: directory, encoding: 'utf8' })
    assert.equal(fail.status, 1)
    assert.ok(fail.stdout.includes('AGENTS.md'))
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
