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
const internalNames = new Set(['agents.md', 'agent.md', 'claude.md', '.hermes',
  '.progress', '.claude', '.cursor', '.opencode', 'agent-transcripts'])

export function unexpectedPaths(paths) {
  return paths.filter(path => {
    const parts = path.split('/')
    if (parts.some(part => internalNames.has(part.toLowerCase()) ||
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
