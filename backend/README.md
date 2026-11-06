# StableSense Backend

Fastify and SQLite serve stored market readings, history, alerts and Helix commentary.

- `jobs/fetch.js` reads Helix market and chain history every ten minutes.
- `jobs/stress.js` derives stored stress and alert events after market ingestion.
- `jobs/ai.js` reads stored per-coin Helix commentary every thirty minutes. The
  filename is retained for existing cron installations. It never calls a model.
- `/api/ai` returns `{ intelligence: { source: "helix", insights: [...] } }`.
  Each insight has `asset`, `narrative`, `model`, original `ts`, `validUntil`,
  `source` and `helixId`. Missing or expired insights are omitted.
- `/api/healthz` distinguishes `lastInsightSync` from `lastAiRun` (the original
  Helix generation time). Job failures remain visible in job status.

Use Node.js 20 or newer. Copy `.env.example` to `.env`, then set `HELIX_API_BASE`
and `HELIX_API_KEY` with `trends:read`, `events:read` and `narratives:read` permissions
for the tracked coins. Keys stay server-side. `PORT` defaults to 8787 and
`DATA_DIR` defaults to `backend/data`. No AI provider key is required here.

Run `npm install`, `npm run fetch`, `npm run stress`, `npm run ai`, then `npm start`.
The insight sync validates the complete response before an atomic database update.
A failed sync keeps previously saved insights until their original expiry, at most
two hours after generation. It never renews timestamps or creates replacement prose.
Historical narrative and usage tables are retained; current reads use `helix_insights`.

## Deploy

Copy `deploy/` files to the VPS:

```bash
sudo mkdir -p /opt/stablesense
sudo chown www-data:www-data /opt/stablesense
# place this repo (frontend + backend) at /opt/stablesense
sudo mkdir -p /var/log/stablesense /opt/stablesense/backups

# backend service
sudo cp backend/deploy/stablesense-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now stablesense-backend

# nginx: edit server_name, then
sudo cp backend/deploy/nginx.conf /etc/nginx/sites-available/stablesense
sudo ln -s /etc/nginx/sites-available/stablesense /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain   # TLS

# cron jobs (as the service user)
crontab -e      # paste the lines from deploy/crontab.txt
```

`nginx.conf` serves `dist/` and reverse-proxies `/api` to Fastify on the same
origin, so there is zero CORS. Slashless `/research` 301s to `/research/` before
the SPA fallback. The frontend reads `/api/healthz`, `/api/ai`, and `/api/alerts`
on the same origin.

## After pulling a new release (deployer)

These origin steps are not done by a git push. After building and copying
`dist/` (including `dist/research/`) to `/opt/stablesense/dist`:

1. Install the repo nginx site: `sudo cp backend/deploy/nginx.conf /etc/nginx/sites-available/stablesense` then `sudo nginx -t && sudo systemctl reload nginx`. Confirm `curl -sI https://stablesense.withkeshav.com/research` returns **301** to `/research/`.
2. Confirm crontab matches `backend/deploy/crontab.txt` (fetch every 10 min, stress 60s later, ai every 30 min). Missing fetch is why `lastMarketSync` goes stale while the browser still looks current.
3. Restart the API: `sudo systemctl restart stablesense-backend`.
4. Run one cycle: `cd /opt/stablesense/backend && node jobs/fetch.js && node jobs/stress.js`.
5. Check `GET /api/healthz`: `jobs.fetch.ok` and `jobs.stress.ok` should be true, `lastMarketSync` recent, `alertEventCount` > 0 when rules fire. `jobs.*.error` names a failed run.
6. Purge CDN/browser caches for `/research` if an old dashboard HTML is still served on the slashless URL.

## Notes

- WAL mode is on; the daily backup uses `sqlite3 .backup` which is
  WAL-safe (no plain `cp` of the db file).
- The frontend never talks to a model. The Helix service key exists only in `backend/.env`.
- Visitor reads also include market snapshots, history and stress data.

### AI usage records

The historical `ai_attempts` and `intelligence` tables are retained for audit.
New syncs do not add model usage records because StableSense no longer calls a
model. Original token counts remain as recorded, with unknown usage left NULL.
Helix owns provider selection, fallback and new AI usage accounting.
