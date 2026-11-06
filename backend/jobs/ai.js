import { aiConfiguration, recordedCompletion } from '../lib/ai-attempt.js';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readMarketView } from '../lib/market-read.js';
import { buildNarrativeInput, narrativeIsCurrent, parseNarrative } from './lib/aiContext.js';
import { loadEnv } from '../lib/env.js';
import db from '../lib/db.js';
import { finishJob, startJob } from '../lib/job-run.js';

loadEnv();

const AI_CADENCE_MIN = Math.max(1, Number(process.env.AI_CADENCE_MIN || 120));
const MODEL = process.env.OPENAI_MODEL || '';
const FALLBACK_MODEL = process.env.OPENAI_FALLBACK_MODEL || '';

const SYSTEM_PROMPT = [
  'You are an educational AI explaining stablecoin market movements to a student.',
  'Rules: preserve the tracked-coin scope and source dates; only use the provided numbers; never invent figures or chains; mention concrete coins and chains; no markdown; no emojis; no financial advice; objective, educational tone.',
  'Your brief must answer two questions for a learner:',
  '  1. "Why is this interesting?" - the educational point of the current market state.',
  '  2. "How was this computed?" - explain the supplied dashboard stress score in simple terms. Do not invent a z-score or confuse it with Helix scores.',
  'Return valid JSON only with exactly these keys:',
  '  "headline": string, at most 120 characters, one educational hook',
  '  "narrative": string, at most 400 characters, the "why is this interesting" answer',
  '  "implications": string, at most 300 characters, the "how was this computed" answer with plain-language metric definitions',
].join('\n');

function skipIfWithinCadence() {
  const row = db.prepare('SELECT ts, meta FROM intelligence ORDER BY ts DESC LIMIT 1').get();
  if (narrativeIsCurrent(row, Date.now(), AI_CADENCE_MIN * 60_000)) {
    console.log(`[ai] last run ${Math.round((Date.now() - row.ts) / 60000)}m ago, within ${AI_CADENCE_MIN}m cadence; skipping`);
    process.exit(0);
  }
}

/** Same current-membership snapshot as GET /api/market. */
export function buildContext(dataSource = db, nowMs = Date.now()) {
  return buildNarrativeInput(readMarketView(dataSource, { nowMs }), nowMs);
}

async function callModel(model, context) {
  return recordedCompletion({ db, config: aiConfiguration(), model, context, system: SYSTEM_PROMPT });
}

// Importing the job must not run its scheduled generation.
const isEntryPoint = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  const selfPath = fileURLToPath(import.meta.url);
  if (entry === selfPath) return true;
  try {
    return realpathSync(entry) === realpathSync(selfPath);
  } catch {
    return false;
  }
})();

if (isEntryPoint) {
  skipIfWithinCadence();

  if (!process.env.OPENAI_API_KEY) {
    console.error('[ai] OPENAI_API_KEY is not set; skipping narrative generation');
    process.exit(1);
  }

  const job = startJob('ai');
  try {
  aiConfiguration(); // Fail before any request if provider/model settings are incomplete.
  const context = buildContext();
  if (!context.ready) throw new Error(context.text);
  let content;
  let modelUsed = MODEL;
  try {
    content = await callModel(MODEL, context);
  } catch (err) {
    console.error(`[ai] primary model failed: ${err.message}`);
    if (!FALLBACK_MODEL || FALLBACK_MODEL === MODEL) {
      throw err;
    }
    modelUsed = FALLBACK_MODEL;
    content = await callModel(FALLBACK_MODEL, context);
  }

  const parsed = parseNarrative(content);
  const savedAt = Date.now();
  db.prepare(
    'INSERT INTO intelligence (ts, headline, narrative, implications, model, meta) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(savedAt, parsed.headline, parsed.narrative, parsed.implications, modelUsed, JSON.stringify({ source: 'cron', ...context.meta }));

  console.log(`[ai] saved narrative (${modelUsed}): ${parsed.headline}`);
    finishJob(job, { ok: true, sourceTs: context.meta.marketObservedAt });
  } catch (err) {
    finishJob(job, { ok: false, error: err });
    console.error(`[ai] failed: ${err.message || err}`);
    process.exit(1);
  }
}
