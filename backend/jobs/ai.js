// Compatibility entry point for existing cron installs: sync stored Helix prose only.
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadEnv } from '../lib/env.js';
import db from '../lib/db.js';
import { startJob, finishJob } from '../lib/job-run.js';
import { syncHelixInsights } from '../lib/helix-insights.js';
loadEnv();
const isEntryPoint = (() => {
  try { return process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url); }
  catch { return false; }
})();
if (isEntryPoint) {
  const job = startJob('ai');
  try {
    const result = await syncHelixInsights({ db });
    finishJob(job, { ok: true, sourceTs: result.fetchedAt });
    console.log(`[insights] synced ${result.available} available coin insights from Helix; no AI generation`);
  } catch (error) {
    finishJob(job, { ok: false, error });
    console.error(`[insights] ${error.message}`);
    process.exitCode = 1;
  }
}
