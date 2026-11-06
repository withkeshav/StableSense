#!/usr/bin/env bash
# Invoke only for an approved exact commit on the StableSense production host.
set -euo pipefail
umask 077
release_sha=${1:?Pass the approved full commit SHA}
[[ "$release_sha" =~ ^[0-9a-f]{40}$ ]] || { echo 'Full commit SHA required'; exit 1; }
cd /opt/stablesense
[[ -z $(git status --porcelain --untracked-files=no) ]] || { echo 'Tracked server edits require review'; exit 1; }
git cat-file -e "$release_sha^{commit}"
previous_sha=$(git rev-parse HEAD)
backup_dir="/var/backups/stablesense/releases/$(date -u +%Y%m%dT%H%M%SZ)-${release_sha:0:12}"
mkdir -p "$backup_dir"
printf '%s\n' "$previous_sha" > "$backup_dir/previous-commit"
cp -p backend/.env "$backup_dir/environment"
export RELEASE_BACKUP_DIR="$backup_dir"
# SQLite's backup API includes committed WAL data while the app is running.
node --input-type=module <<'JS'
import Database from './backend/node_modules/better-sqlite3/lib/index.js';
import { loadEnv } from './backend/lib/env.js';
import path from 'node:path';
loadEnv();
const source = path.resolve(process.env.DATA_DIR || './backend/data', 'stablesense.db');
const db = new Database(source, { readonly: true, fileMustExist: true });
await db.backup(path.join(process.env.RELEASE_BACKUP_DIR, 'stablesense.db'));
db.close();
const copy = new Database(path.join(process.env.RELEASE_BACKUP_DIR, 'stablesense.db'), { readonly: true });
if (copy.pragma('quick_check', { simple: true }) !== 'ok') throw new Error('Backup integrity check failed');
copy.close();
JS
sha256sum "$backup_dir/stablesense.db" > "$backup_dir/database.sha256"
# Build outside the serving directory, keeping current assets available on failure.
umask 022
release_dir=$(mktemp -d /opt/stablesense-release.XXXXXX)
git archive "$release_sha" | tar -x -C "$release_dir"
(
  cd "$release_dir"
  npm ci
  npm ci --prefix backend
  npm test
  npm run build:all
)
git checkout --detach "$release_sha"
if [[ -d backend/node_modules ]]; then mv backend/node_modules "$backup_dir/backend-node_modules"; fi
mv "$release_dir/backend/node_modules" backend/node_modules
mv dist "$backup_dir/dist"
mv "$release_dir/dist" dist
# Static files must be readable by nginx despite the restrictive backup umask.
chmod -R a+rX dist backend/node_modules
systemctl restart stablesense-backend.service
for attempt in $(seq 1 30); do
  if curl --fail --silent http://127.0.0.1:8787/api/healthz > "$backup_dir/health-after.json"; then
    echo "StableSense deployed at $release_sha; backup: $backup_dir"
    exit 0
  fi
  sleep 2
done
echo 'Verification failed. Stop and review; no automatic rollback or data deletion.' >&2
exit 1
