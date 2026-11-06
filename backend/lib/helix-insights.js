import { getActiveCoins } from '../../src/utils/coin-config.js';

export const INSIGHT_MAX_AGE_MS = 2 * 3600000;
export const insightCoins = () => getActiveCoins().map(c => c.symbol);

export function validateInsights(payload, coins, now = Date.now()) {
  if (payload?.source !== 'helix' || payload.generation_policy !== 'stored_only' || !Array.isArray(payload.insights)) {
    throw new Error('Invalid Helix insight response');
  }
  const seen = new Set();
  const rows = payload.insights.map(item => {
    if (!item || !coins.includes(item.asset) || seen.has(item.asset) || typeof item.available !== 'boolean') throw new Error('Invalid insight asset coverage');
    seen.add(item.asset);
    if (!item.available) return { coin: item.asset, narrative: null, model: null, generatedAt: null, validUntil: null, helixId: null };
    const generatedAt = Date.parse(item.generated_at), validUntil = Date.parse(item.valid_until);
    if (item.source !== 'helix' || item.feature !== 'market_narrative' || !Number.isSafeInteger(item.id) || item.id < 1 ||
        typeof item.narrative !== 'string' || !item.narrative.trim() || item.narrative.length > 20000 ||
        typeof item.model !== 'string' || !Number.isFinite(generatedAt) || !Number.isFinite(validUntil) ||
        generatedAt > now || validUntil <= generatedAt || validUntil > generatedAt + INSIGHT_MAX_AGE_MS) {
      throw new Error('Invalid Helix insight content or generation time');
    }
    if (validUntil <= now) return { coin: item.asset, narrative: null, model: null, generatedAt: null, validUntil: null, helixId: null };
    return { coin: item.asset, narrative: item.narrative, model: item.model, generatedAt, validUntil, helixId: item.id };
  });
  if (seen.size !== coins.length) throw new Error('Incomplete Helix insight response');
  return rows;
}

export async function syncHelixInsights({ db, env = process.env, fetchImpl = fetch, now = Date.now }) {
  if (!env.HELIX_API_KEY) throw new Error('HELIX_API_KEY with narratives:read is required');
  const base = new URL(env.HELIX_API_BASE || 'https://helix.withkeshav.com');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
  if (base.username || base.password || base.search || base.hash || (base.protocol !== 'https:' && !(local && base.protocol === 'http:'))) {
    throw new Error('Helix URL must use HTTPS without embedded credentials');
  }
  const coins = insightCoins();
  const url = new URL(`${base.href.replace(/\/$/, '')}/api/v2/narratives`);
  url.searchParams.set('assets', coins.join(','));
  const response = await fetchImpl(url.href, { signal: AbortSignal.timeout(15000), redirect: 'error',
    headers: { authorization: `Bearer ${env.HELIX_API_KEY}`, accept: 'application/json' } });
  if (!response.ok) throw new Error(`Helix insights returned HTTP ${response.status}`);
  const rows = validateInsights(await response.json(), coins, now());
  const fetchedAt = now();
  const put = db.prepare(`INSERT INTO helix_insights (coin,narrative,model,generated_at,valid_until,helix_id,fetched_at)
    VALUES (?,?,?,?,?,?,?) ON CONFLICT(coin) DO UPDATE SET narrative=excluded.narrative,model=excluded.model,
    generated_at=excluded.generated_at,valid_until=excluded.valid_until,helix_id=excluded.helix_id,fetched_at=excluded.fetched_at`);
  db.transaction(() => { for (const r of rows) put.run(r.coin,r.narrative,r.model,r.generatedAt,r.validUntil,r.helixId,fetchedAt); })();
  return { available: rows.filter(r => r.narrative !== null).length, fetchedAt };
}

export function readHelixInsights(db, now = Date.now()) {
  const allowed = new Set(insightCoins());
  const rows = db.prepare('SELECT * FROM helix_insights ORDER BY coin').all();
  return { source: 'helix', insights: rows.filter(r => allowed.has(r.coin) && r.narrative && r.generated_at <= now &&
    r.valid_until > now && now - r.generated_at < INSIGHT_MAX_AGE_MS).map(r => ({
      asset: r.coin, narrative: r.narrative, model: r.model, ts: r.generated_at,
      validUntil: r.valid_until, source: 'helix', helixId: r.helix_id,
    })) };
}
