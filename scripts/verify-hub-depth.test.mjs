// Apache-2.0. Tests for scripts/verify-hub-depth.mjs.
//
// Every case runs the real checker as a child process against a throwaway copy
// of the hub under a temp directory, so the repository's own research files are
// never modified by a test and a test can always prove the checker exits the
// way the contract says on tampered input.
//
// Run with: node --test scripts/verify-hub-depth.test.mjs
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const script = fileURLToPath(new URL('./verify-hub-depth.mjs', import.meta.url))
const hubFiles = ['research/data.js', 'research/index.html', 'research/changelog/index.html']

// Copies the three files the checker reads into a fresh temp tree.
function makeCopy() {
  const root = mkdtempSync(join(tmpdir(), 'hub-depth-fixture-'))
  mkdirSync(join(root, 'research', 'changelog'), { recursive: true })
  for (const file of hubFiles) copyFileSync(join(repoRoot, file), join(root, file))
  return root
}

function edit(root, file, from, to) {
  const path = join(root, file)
  const text = readFileSync(path, 'utf8')
  assert.ok(text.includes(from), `fixture edit anchor missing in ${file}: ${from}`)
  writeFileSync(path, text.replace(from, to))
}

function run(root) {
  return spawnSync(process.execPath, [script, root], { encoding: 'utf8' })
}

const failLines = (stdout) => stdout.split('\n').filter((line) => line.startsWith('FAIL '))

test('the real working tree measures clean and exits 0', () => {
  const run_ = spawnSync(process.execPath, [script], { cwd: repoRoot, encoding: 'utf8' })
  assert.equal(run_.status, 0, run_.stdout + run_.stderr)
  assert.ok(run_.stdout.includes('ALL CHECKS PASSED'))
  assert.equal(run_.stdout.includes('CANNOT MEASURE'), false)
})

test('an unmodified copy measures clean and exits 0', () => {
  const root = makeCopy()
  try {
    const copy = run(root)
    assert.equal(copy.status, 0, copy.stdout + copy.stderr)
    assert.ok(copy.stdout.includes('ALL CHECKS PASSED'))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('a deleted export is reported as CANNOT MEASURE and exits 2, not 1', () => {
  const root = makeCopy()
  try {
    edit(root, 'research/data.js', 'export const rwaDepth =', 'const rwaDepth =')
    const copy = run(root)
    assert.equal(copy.status, 2, copy.stdout + copy.stderr)
    assert.ok(copy.stdout.includes('CANNOT MEASURE'))
    assert.ok(copy.stdout.includes('rwaDepth'), 'the missing export must be named')
    assert.equal(copy.stdout.includes('ALL CHECKS PASSED'), false)
    assert.equal(failLines(copy.stdout).length, 0, 'an unmeasurable run must not emit named FAIL lines')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('a missing hub file is reported as CANNOT MEASURE and exits 2', () => {
  const root = makeCopy()
  try {
    rmSync(join(root, 'research', 'changelog', 'index.html'))
    const copy = run(root)
    assert.equal(copy.status, 2, copy.stdout + copy.stderr)
    assert.ok(copy.stdout.includes('CANNOT MEASURE'))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('no stack trace reaches stdout when the checker cannot measure', () => {
  const root = makeCopy()
  try {
    edit(root, 'research/data.js', 'export const yieldBan =', 'export const yieldBanRenamed =')
    const copy = run(root)
    assert.equal(copy.status, 2, copy.stdout + copy.stderr)
    assert.equal(/\n\s+at\s/.test(copy.stdout), false, 'stdout must not carry a stack trace')
    assert.equal(/TypeError|ReferenceError/.test(copy.stdout), false, 'stdout must not carry a raw JS error class')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('an incorrect Tether buffer fails the arithmetic check and exits 1', () => {
  const root = makeCopy()
  try {
    edit(root, 'research/data.js', '"value": "$7.955B"', '"value": "$7.956B"')
    const copy = run(root)
    assert.equal(copy.status, 1, copy.stdout + copy.stderr)
    assert.ok(failLines(copy.stdout).some((line) => line.includes('Tether reserve buffer reconciles assets less liabilities')))
    assert.equal(copy.stdout.includes('ALL CHECKS PASSED'), false)
    assert.equal(copy.stdout.includes('CANNOT MEASURE'), false, 'this is a measured failure, not an unmeasurable one')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

// D1: the old guard only matched U+2013 and U+2014 inside two hand-built JSON
// blobs, so U+FFFD passed, and a dash anywhere else in the hub was never read.
// Each codepoint is planted in a different real field to prove the scan reaches
// data.js values, a hub page, and an escaped codepoint that exists only after
// parsing.
const tamperCases = [
  { name: 'U+2014 em dash, inside a data.js value', file: 'research/data.js',
    from: 'Supply, adjusted transfers and classified payments answer different questions.',
    to: 'Supply\u2014adjusted transfers and classified payments answer different questions.' },
  { name: 'U+2013 en dash, inside a data.js comment', file: 'research/data.js',
    from: "export const floatEconomics =", to: "// tamper \u2013 note\nexport const floatEconomics =" },
  { name: 'U+FFFD replacement char, inside a data.js value', file: 'research/data.js',
    from: '"value": "+$1.50B"', to: '"value": "+$1.50B\uFFFD"' },
  { name: 'U+2014 em dash, inside research/index.html', file: 'research/index.html',
    from: 'Reviewed 2026-11-05', to: 'Reviewed 2026-11-05\u2014' },
  { name: 'U+FFFD replacement char, inside the changelog page', file: 'research/changelog/index.html',
    from: 'Research changelog', to: 'Research changelog\uFFFD' },
  { name: 'U+2014 written as an escape sequence (only visible after parsing)', file: 'research/data.js',
    from: 'export const AS_OF', to: "export const __tamper = 'x\\u2014y';\nexport const AS_OF" },
]

for (const tamper of tamperCases) {
  test(`${tamper.name} fails the broader check and exits 1`, () => {
    const root = makeCopy()
    try {
      edit(root, tamper.file, tamper.from, tamper.to)
      const copy = run(root)
      assert.equal(copy.status, 1, copy.stdout + copy.stderr)
      assert.ok(failLines(copy.stdout).some((line) => line.includes('no dash or replacement chars in hub content')),
        'the broader hub-content check must be the one that fails')
      assert.ok(/\bU\+(2013|2014|FFFD)\b/.test(copy.stdout), 'the report must name the codepoint')
      assert.equal(copy.stdout.includes('ALL CHECKS PASSED'), false)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
}

test('the checker never prints a flagged codepoint as itself, only as its codepoint', () => {
  const root = makeCopy()
  try {
    edit(root, 'research/data.js', 'Supply, adjusted transfers and classified payments answer different questions.',
      'Supply\u2014adjusted transfers and classified payments answer different questions.')
    const copy = run(root)
    assert.equal(copy.status, 1, copy.stdout + copy.stderr)
    assert.equal(copy.stdout.includes('\u2014'), false)
    assert.equal(copy.stdout.includes('\u2013'), false)
    assert.equal(copy.stdout.includes('\uFFFD'), false)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('a bad root argument exits 2 rather than throwing', () => {
  const copy = spawnSync(process.execPath, [script, join(tmpdir(), 'hub-depth-fixture-does-not-exist')], { encoding: 'utf8' })
  assert.equal(copy.status, 2, copy.stdout + copy.stderr)
  assert.ok(copy.stdout.includes('CANNOT MEASURE'))
  assert.equal(/\n\s+at\s/.test(copy.stdout), false)
})

// Plant independently meaningful regressions in a throwaway module, rather
// than asserting only that the current prose repeats itself.
const evidenceRegressions = [
  ['OUSD component mismatch', 'openUsdStatus.supplySnapshot = openUsdStatus.supplySnapshot.replace("$1,752,317", "$1,752,318");', 'OUSD reserve components and gap reconcile'],
  ['Circle cost denominator', 'floatEconomics.find(r => /Reserve income/.test(r.measure)).value = "$865M";', 'Circle cost ratio recomputes'],
  ['GENIUS invented zero count', 'geniusStatus.finalRules = 0;', 'unmeasured final-rule count'],
  ['current source date erased', 'marketCapMeasure.asOf = RESEARCH_REVIEWED.slice(0, 4);', 'marketCapMeasure carries its own'],
  ['missing projection source', 'projections[0].source = "";', 'forecast scenarios carry'],
  ['adjusted transfers recast as payments', 'growthHonest.points[2].value = "$4.2T payments";', 'historical BCG values retain'],
  ['unresolved reserve inference removed', 'openUsdStatus.supplySnapshot = openUsdStatus.supplySnapshot.replace("UNRESOLVED", "fully reconciled");', 'OUSD mismatch remains unresolved'],
];
for (const [name, mutation, expectedCheck] of evidenceRegressions) {
  test(`${name} is rejected as measured failure`, () => {
    const root = makeCopy();
    try {
      const path = join(root, 'research/data.js');
      writeFileSync(path, readFileSync(path, 'utf8') + '\n' + mutation + '\n');
      const copy = run(root);
      assert.equal(copy.status, 1, copy.stdout + copy.stderr);
      assert.ok(failLines(copy.stdout).some(line => line.includes(expectedCheck)), copy.stdout);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
}
