import { createHash } from 'node:crypto';

export function aiConfiguration(env = process.env) {
  if (!env.OPENAI_BASE_URL || !env.OPENAI_MODEL || !env.OPENAI_API_KEY) {
    throw new Error('Explicit OPENAI_BASE_URL, OPENAI_MODEL and OPENAI_API_KEY are required');
  }
  const url = new URL(env.OPENAI_BASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash || (url.protocol !== 'https:' && !(url.protocol === 'http:' && local))) {
    throw new Error('AI provider URL must use HTTPS without embedded credentials');
  }
  const raw = env.AI_DAILY_REQUEST_LIMIT;
  const dailyLimit = raw === undefined || raw === '' ? null : Number(raw);
  if (dailyLimit !== null && (!Number.isSafeInteger(dailyLimit) || dailyLimit < 0)) {
    throw new Error('AI_DAILY_REQUEST_LIMIT must be a nonnegative integer or unset');
  }
  return { baseUrl: url.href.replace(/\/+$/, ''), provider: url.origin,
    model: env.OPENAI_MODEL, key: env.OPENAI_API_KEY, dailyLimit };
}

const tokenCount = (value) => Number.isSafeInteger(value) && value >= 0 ? value : null;

/** Reserve before sending, including failures and requests with unknown usage. */
export async function recordedCompletion({ db, config, model, context, system, fetchImpl = fetch, now = Date.now }) {
  const startedAt = now();
  const dayStart = Math.floor(startedAt / 86400000) * 86400000;
  const inputHash = createHash('sha256').update(JSON.stringify({ system, context })).digest('hex');
  const reserve = db.transaction(() => {
    const count = db.prepare('SELECT count(*) n FROM ai_attempts WHERE started_at >= ?').get(dayStart).n;
    if (config.dailyLimit !== null && count >= config.dailyLimit) throw new Error('AI daily request limit reached');
    return db.prepare(`INSERT INTO ai_attempts
      (started_at, provider, model, task, input_hash, context_version, outcome)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')`).run(startedAt, config.provider, model,
      'educational_narrative', inputHash, context.meta?.contextVersion ?? null).lastInsertRowid;
  });
  const id = reserve.immediate();
  let usage, status = null, outcome = 'failed';
  try {
    const response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
      method: 'POST', signal: AbortSignal.timeout(45000),
      headers: { 'content-type': 'application/json', authorization: `Bearer ${config.key}` },
      body: JSON.stringify({ model, messages: [
        { role: 'system', content: system },
        { role: 'user', content: `StableSense snapshot data:\n${context.text}` },
      ], temperature: 0.4, max_tokens: 2048 }),
    });
    status = response.status;
    if (!response.ok) throw new Error(`AI provider returned HTTP ${status}`);
    const payload = await response.json();
    usage = payload?.usage;
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('AI provider returned empty content');
    outcome = 'response_received';
    return content;
  } finally {
    const finishedAt = now();
    db.prepare(`UPDATE ai_attempts SET finished_at=?, latency_ms=?, outcome=?, http_status=?,
      prompt_tokens=?, completion_tokens=?, total_tokens=? WHERE id=?`).run(
      finishedAt, Math.max(0, finishedAt - startedAt), outcome, status,
      tokenCount(usage?.prompt_tokens), tokenCount(usage?.completion_tokens), tokenCount(usage?.total_tokens), id);
  }
}
