import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawnSync, execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
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

// One row per purple-round P1 bypass shape. Every row carries a real path part
// under a website directory, so the internal-name family check is what flags it,
// not the separate rule that unknown top-level directories are not published.
test('flags internal instruction families across junk suffixes and case', async () => {
  const { unexpectedPaths } = await import('./verify-public-tree.mjs')
  const shapes = ['src/AGENTS.md', 'src/Agents.MD', 'src/AGENTS.md.md',
    'src/AGENTS.md.tmp', 'src/agents.md.bak', 'src/agent-md',
    'src/agentsgit.md', 'src/agent.instructions.md', 'src/handbook.md',
    'src/internal-notes.md', 'src/notes.agent.md', 'src/claude.md.bak',
    'src/notes.md.tmp']
  assert.deepEqual(unexpectedPaths(shapes), shapes)
})

test('flags a homoglyph lookalike folded onto the internal family', async () => {
  const { unexpectedPaths } = await import('./verify-public-tree.mjs')
  // U+0410 CYRILLIC CAPITAL LETTER A as the first letter of AGENTS.md. NFKD
  // leaves it unchanged, so the explicit confusable fold is what catches it.
  const homoglyph = 'src/\u0410GENTS.md'
  assert.deepEqual(unexpectedPaths([homoglyph]), [homoglyph])
})

// Boundary call, stated so a reader sees it: 'agent.md.js' IS flagged. A '.md'
// segment inside the name is treated as a document-naming signal even when a
// code extension follows, so a file named after the internal docs is held back
// rather than published. Code-named assets without a doc segment, such as
// agents.js and agentflow.js, stay published (asserted below).
test('flags a doc segment inside a code-named file', async () => {
  const { unexpectedPaths } = await import('./verify-public-tree.mjs')
  assert.deepEqual(unexpectedPaths(['src/agent.md.js']), ['src/agent.md.js'])
})

test('publishes ordinary assets whose names merely resemble the family', async () => {
  const { unexpectedPaths } = await import('./verify-public-tree.mjs')
  const allowed = ['src/lib/api.js', 'research/index.html', 'index.html',
    'src/agents.js', 'src/agentflow.js', 'src/user-agency.md',
    'src/lib-agent-utils/index.js',
    'src/release-notes.md', '.github/workflows/ci.yml']
  assert.deepEqual(unexpectedPaths(allowed), [])
})

test('CLI exits 1 for family bypass shapes and 0 for a clean public tree', () => {
  const directory = mkdtempSync(join(tmpdir(), 'public-tree-family-'))
  const script = fileURLToPath(new URL('./verify-public-tree.mjs', import.meta.url))
  try {
    execFileSync('git', ['init', '-q', directory])
    writeFileSync(join(directory, 'index.html'), 'Synthetic publication fixture\n')
    execFileSync('git', ['add', 'index.html'], { cwd: directory })
    const clean = spawnSync(process.execPath, [script, '--index'], { cwd: directory, encoding: 'utf8' })
    assert.equal(clean.status, 0)
    assert.ok(clean.stdout.includes('PASS'))
    for (const planted of ['src/AGENTS.md.md', 'src/agent-md',
      'src/handbook.md', 'src/\u0410GENTS.md']) {
      const absolute = join(directory, planted)
      mkdirSync(dirname(absolute), { recursive: true })
      writeFileSync(absolute, 'Synthetic internal fixture\n')
      execFileSync('git', ['add', planted], { cwd: directory })
      const failed = spawnSync(process.execPath, [script, '--index'], { cwd: directory, encoding: 'utf8' })
      assert.equal(failed.status, 1, `expected exit 1 for ${planted}`)
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
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
