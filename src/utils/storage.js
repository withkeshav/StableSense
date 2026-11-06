export const THEME_KEY = 'stablesense:theme';
export const CACHE_PREFIX = 'stablesense:v2:';

const LEGACY = {
  theme: 'stablepulse:theme',
  refresh: 'stablepulse:refresh',
  compact: 'stablepulse:compact',
  cache: 'stablepulse:v2:',
};

export function migrateLegacyKeys() {
  try {
    const theme = localStorage.getItem(LEGACY.theme);
    if (theme !== null) {
      if (localStorage.getItem(THEME_KEY) === null) localStorage.setItem(THEME_KEY, theme);
      localStorage.removeItem(LEGACY.theme);
    }
    // Retired preferences must not silently change the managed layout or cadence.
    for (const key of [LEGACY.refresh, LEGACY.compact, 'stablesense:refresh', 'stablesense:compact']) {
      localStorage.removeItem(key);
    }
    pruneLegacyCache();
  } catch {
    // storage unavailable (private mode); migration is best-effort
  }
}

function pruneLegacyCache() {
  const doomed = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LEGACY.cache)) doomed.push(key);
  }
  doomed.forEach((key) => localStorage.removeItem(key));
}
