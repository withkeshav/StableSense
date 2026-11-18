# Scaling & operations

StableSense serves market snapshots, supply history, alerts and stored Helix commentary through its same-origin backend. CoinGecko price histories and exchange samples are fetched separately by the browser.

## Collection and serving

- Scheduled fetch jobs read Helix and store observations in SQLite. Browser refreshes read the backend; they do not each trigger a new Helix collection.
- `backend/jobs/ai.js` is a compatibility entry point for a read-only Helix insight sync. StableSense does not call an AI provider. Helix controls generation, fallback and budgets.
- Commentary keeps its original generation time and expires two hours after generation. A successful sync does not extend that expiry.
- The dashboard checks automatically every 15 minutes and offers manual refresh. Browser caches reduce repeated requests; separate tabs do not have a shared in-flight request coordinator.

## Capacity and monitoring

Measure database growth, response times and upstream usage before changing retention or adding infrastructure. Growth depends on asset count, chain coverage, sampling and retained history; there is no fixed storage estimate for every deployment.

`GET /api/healthz` reports readiness, asset coverage, market observation time, insight sync time and job failures. Check source observation age separately from job completion time. A completed fetch does not prove its upstream observations are new. An empty insight list may mean missing or expired commentary rather than a failed market feed.

CoinGecko rate limits still apply to browser-direct charts and ticker requests. Local throttling is not a guarantee that a provider quota cannot be exceeded.

## Backups and growth

Use SQLite's backup API or the SQLite backup command to include committed WAL data. Do not copy the live database file on its own. Verify backup integrity and retain a tested recovery procedure.

Add tracked assets through the shared coin registry only after checking upstream coverage and consumer permissions. Review storage and query performance before expanding history. Database migrations and deployment remain separate operations from frontend configuration changes.
