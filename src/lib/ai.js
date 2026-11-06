import { aiApiBase } from '../config.js';

/** Read coin-labeled Helix commentary through the same-origin backend. No model calls. */
export async function fetchIntelligence({ signal } = {}) {
  try {
    const res = await fetch(`${aiApiBase}/api/ai`, { signal });
    if (!res.ok) return null;
    const payload = await res.json();
    if (payload?.intelligence) return payload.intelligence;
    return null;
  } catch {
    return null;
  }
}
