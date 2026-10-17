// Apache-2.0. Publication path policy, not a content or secret scanner.
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const publicFiles = new Set([
  '.env.example', '.gitattributes', '.gitignore', 'CHANGELOG.md', 'LICENSE',
  'NOTICE', 'README.md', 'RESEARCH-LICENSE', 'SECURITY.md', 'index.html',
  'package.json', 'package-lock.json', 'vite.config.js',
  'vite.config.research.mjs', 'vitest.config.js',
  'docs/api-protocol.md', 'docs/architecture.md', 'docs/data-sources.md',
  'docs/scaling.md', 'docs/research-methodology.md', 'docs/research/README.md',
  'docs/research/public/claim-template.md',
  'docs/research/public/publication-checklist.md',
])
const websiteDirectories = new Set(['src', 'backend', 'public', 'research', 'scripts', '.github'])

// Internal path families, not exact filenames. Names are represented bare so a
// stem check can match every extension of the same family. The dotted marker
// entries are matched against the full path part because they carry no stem.
const internalNames = new Set(['.hermes', '.progress', '.claude', '.cursor', '.opencode',
  'agent-transcripts', 'agents', 'agent', 'claude', 'hermes', 'cursor', 'opencode',
  'progress', 'handbook', 'internal-notes', 'notes'])

// Junk suffix chains that an internal file can accumulate while its stem stays
// the same: AGENTS.md.md, AGENTS.md.tmp, agents.md.bak, notes.md.tmp, claude.md.bak.
const junkSuffixes = ['.md', '.tmp', '.bak', '.orig', '.old', '~']

// Document-ish segments. A part carrying one of these is a documentation or
// marker file, so its stem (not just the full name) is eligible for matching.
// Code and asset extensions (js, jsx, mjs, css, svg, png, html, json, ...) are
// deliberately absent, which is what keeps agents.js, agentflow.js and
// verify-hub-depth.mjs out of the internal family.
const docSegments = new Set(['md', 'tmp', 'bak', 'orig', 'old', '~'])

// Confusable lookalikes. NFKD plus combining-mark stripping does NOT fold
// Cyrillic U+0410 (or its Greek neighbours) onto Latin: NFKD leaves U+0410
// unchanged because it has no decomposition, so an explicit fold is required
// after casefolding. Applied to lowercased text, hence lowercase keys only.
const confusables = new Map([
  ['\u0430', 'a'], ['\u0432', 'b'], ['\u0435', 'e'], ['\u043a', 'k'],
  ['\u043c', 'm'], ['\u043d', 'h'], ['\u043e', 'o'], ['\u0440', 'p'],
  ['\u0441', 'c'], ['\u0442', 't'], ['\u0443', 'y'], ['\u0445', 'x'],
  ['\u0456', 'i'], ['\u0458', 'j'], ['\u0455', 's'], ['\u0501', 'd'],
  ['\u03b1', 'a'], ['\u03b2', 'b'], ['\u03b5', 'e'], ['\u03b9', 'i'],
  ['\u03ba', 'k'], ['\u03bd', 'v'], ['\u03bf', 'o'], ['\u03c1', 'p'],
  ['\u03c4', 't'], ['\u03c5', 'u'], ['\u03c7', 'x'],
])

// Normalize one path part to a comparable ASCII form: NFKD, strip combining
// marks, casefold, then fold confusable lookalikes.
function foldPart(part) {
  const folded = part.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  let result = ''
  for (const character of folded) result += confusables.get(character) || character
  return result
}

// Remove trailing junk suffix chains repeatedly: agents.md.md -> agents.
function stripJunk(value) {
  let current = value
  for (let changed = true; changed;) {
    changed = false
    for (const suffix of junkSuffixes) {
      if (current.length > suffix.length && current.endsWith(suffix)) {
        current = current.slice(0, -suffix.length)
        changed = true
      }
    }
  }
  return current
}

// True when the part names a documentation or marker file: no extension at all,
// or a dot segment that is a known junk extension.
function looksDocumentary(value) {
  if (!value.includes('.')) return true
  return value.split('.').some(segment => docSegments.has(segment))
}

// Anchored family check for one path part. Matching is anchored at the start of
// the part or its stem, never a substring anywhere in the path, so
// user-agency.md and lib-agent-utils/ stay public. The stem prefix test is what
// catches agentsgit.md (agents + git) and agent.instructions.md.
function isInternalPart(rawPart) {
  const part = foldPart(rawPart)
  if (internalNames.has(part)) return true
  const stem = stripJunk(part)
  if (internalNames.has(stem)) return true
  if (!looksDocumentary(part)) return false
  const leading = stem.split('.')[0]
  if (internalNames.has(leading)) return true
  if (internalNames.has(stem.replace(/[-_]/g, '.'))) return true
  for (const name of internalNames) {
    if (stem.startsWith(name) || leading.startsWith(name)) return true
  }
  return false
}

export function unexpectedPaths(paths) {
  return paths.filter(path => {
    const parts = path.split('/')
    if (parts.some(part => isInternalPart(part) ||
      (part.startsWith('.env') && part !== '.env.example'))) return true
    return !publicFiles.has(path) && !websiteDirectories.has(parts[0])
  })
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const revision = process.argv[2] || 'HEAD'
  try {
    if (revision.startsWith('-') && revision !== '--index') throw new Error('Invalid tree argument')
    const args = revision === '--index'
      ? ['ls-files', '-z'] : ['ls-tree', '-r', '--name-only', '-z', revision]
    const paths = execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      .split('\0').filter(Boolean)
    if (!paths.length) throw new Error('No publication paths measured')
    const blocked = unexpectedPaths(paths)
    console.log(`PUBLIC TREE ${blocked.length ? 'FAIL' : 'PASS'}: ${paths.length} paths checked; path policy only, contents not inspected`)
    if (blocked.length) console.log(blocked.join('\n'))
    process.exitCode = blocked.length ? 1 : 0
  } catch (error) {
    console.log(`PUBLIC TREE UNKNOWN: ${error.message}`)
    process.exitCode = 2
  }
}
