#!/usr/bin/env node
// Device-independent identity guard, companion to the tower-wide pre-push hook
// (~/.config/opencode/git-hooks/pre-push, operator rule in
// ~/.config/opencode/AGENTS.md, 2026-10-17).
//
// Fails the CI run when any commit reachable from HEAD is authored or committed
// under an email that GitHub would attribute to someone other than withkeshav.
// This covers pushes from anywhere: other devices, cloud agents, web pushes -
// the hook cannot run on those, this can.

import { execFileSync } from 'node:child_process';

const ALLOWED = new Set([
  // Pinned operator identity (global git config on the tower).
  '19249792+withkeshav@users.noreply.github.com',
  // Historical allowance: 2 commits carry this address; it attributes to no
  // GitHub account and displays the owner's own name. Removing it would
  // require a history rewrite that the operator declined.
  'keshav@withkeshav.com',
]);

function gitOut(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

const shas = gitOut(['rev-list', 'HEAD']).split('\n').filter(Boolean);
const foreign = [];
for (const sha of shas) {
  const ae = gitOut(['log', '-1', '--format=%ae', sha]);
  const ce = gitOut(['log', '-1', '--format=%ce', sha]);
  if (!ALLOWED.has(ae) || !ALLOWED.has(ce)) {
    foreign.push(`${sha.slice(0, 7)} author=${ae} committer=${ce}`);
  }
}
console.log(`commit identity: checked ${shas.length} commits, ${foreign.length} foreign`);

if (foreign.length > 0) {
  console.error('FOREIGN IDENTITY in history:');
  for (const line of foreign.slice(0, 10)) console.error(`  ${line}`);
  if (foreign.length > 10) console.error(`  +${foreign.length - 10} more`);
  process.exit(1);
}
console.log('COMMIT IDENTITY PASS');