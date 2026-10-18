// Pure chart-shaping helpers for the Home tab flow and dominance panels.
// Framework-free and side-effect-free: the components own rendering, the
// data shape lives here so it can be unit-tested without a DOM or Chart.js.

/**
 * Normalize a supply/flow point timestamp to milliseconds. Accepts `ts` or
 * `date` and rescales seconds to milliseconds, mirroring derive.js's tokenTsMs
 * so history from the backend (`ts`, already ms) and the detail shim (`date`)
 * agree.
 * @param {{ts?:number,date?:number}} point
 * @returns {number|null} Millisecond timestamp, or null when unusable.
 */
function toMs(point) {
  const raw = point?.ts ?? point?.date;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n < 1e12 ? n * 1000 : n;
}

/**
 * Return a translucent copy of a hex color for area fills. Non-hex inputs are
 * passed through unchanged so nothing is silently dropped.
 * @param {string} color
 * @returns {string}
 */
function withAlpha(color) {
  return typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color) ? `${color}33` : color;
}

/**
 * Shape chain flows into horizontal-bar data for one coin (or all coins
 * combined). A flow with no finite value for the selected coin is dropped from
 * the bars and flips `complete` to false, so a partially measured window is
 * never presented as a full one.
 * @param {Array<{chain:string,totalDelta:number,deltas:Object<string,number>}>} chainFlows
 *   Output of annotateChainFlows(rankChainFlows(...)).
 * @param {string} [coin='all'] 'all' uses totalDelta; a symbol uses deltas[symbol].
 * @param {number} [limit=8] Max bars to return.
 * @returns {{labels:string[],values:number[],totalAbs:number,complete:boolean,coin:string}}
 */
export function buildChainFlowBars(chainFlows, coin = 'all', limit = 8) {
  const flows = Array.isArray(chainFlows) ? chainFlows : [];
  const selected = coin == null ? 'all' : coin;
  const pick = (flow) => (selected === 'all' ? flow?.totalDelta : flow?.deltas?.[selected]);

  // Complete only when every source flow carries a real reading for this
  // selection. The all view also carries a per-flow missing flag from
  // rankChainFlows; a partial total is not a complete one.
  const complete = flows.every((flow) => (
    selected === 'all' ? !flow?.missing && Number.isFinite(pick(flow)) : Number.isFinite(pick(flow))
  ));

  const measured = flows
    .map((flow) => ({ chain: flow?.chain, value: pick(flow) }))
    .filter((row) => row.chain != null && Number.isFinite(row.value));

  const cap = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.floor(Number(limit)) : 8;
  // Sort by magnitude so the biggest move reads first regardless of sign.
  const ranked = measured.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, cap);
  const values = ranked.map((row) => row.value);
  const totalAbs = values.reduce((sum, v) => sum + Math.abs(v), 0);

  return { labels: ranked.map((row) => row.chain), values, totalAbs, complete, coin: selected };
}

/**
 * Build a stacked area dataset of each tracked coin's share of the combined
 * tracked supply. Only dates where EVERY supplied coin has a finite value are
 * kept, so a gap in one feed is a hole in the window, never a silent zero that
 * would inflate the other coins' shares.
 * @param {Object<string, Array<{ts?:number,date?:number,value:number}>>} supplyByCoin
 *   Per-coin supply series keyed by symbol.
 * @param {Array<{symbol:string,color:string}>} coins Coins to include, in legend order.
 * @returns {null|{labels:string[],dates:number[],datasets:Array<object>,latest:Array<{symbol:string,share:number}>}}
 *   null when fewer than 2 coins or fewer than 2 aligned dates survive.
 */
export function buildDominanceSeries(supplyByCoin, coins) {
  const list = Array.isArray(coins) ? coins.filter((c) => c && c.symbol) : [];
  if (list.length < 2) return null;

  const byDate = new Map();
  for (const coin of list) {
    const series = supplyByCoin?.[coin.symbol];
    if (!Array.isArray(series)) continue;
    for (const point of series) {
      const ms = toMs(point);
      if (ms == null) continue;
      // Number(null) is 0, so a null/blank value must be rejected before the
      // numeric coercion or a gap would be read as a real zero supply.
      const raw = point?.value;
      if (raw === null || raw === undefined || (typeof raw === 'string' && raw.trim() === '')) continue;
      const value = Number(raw);
      if (!Number.isFinite(value)) continue;
      let row = byDate.get(ms);
      if (!row) {
        row = {};
        byDate.set(ms, row);
      }
      row[coin.symbol] = value;
    }
  }

  // Keep only dates where every coin has a real reading, ascending in time.
  const aligned = [...byDate.entries()]
    .filter(([, row]) => list.every((coin) => Number.isFinite(row[coin.symbol])))
    .map(([ms, row]) => ({ ms, row }))
    .sort((a, b) => a.ms - b.ms);
  if (aligned.length < 2) return null;

  const labels = aligned.map(({ ms }) => new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }));
  const dates = aligned.map(({ ms }) => ms);
  const totals = aligned.map(({ row }) => list.reduce((sum, coin) => sum + row[coin.symbol], 0));

  const datasets = list.map((coin) => ({
    label: coin.symbol,
    // Shares are exact fractions of the same per-date total, so they sum to 100
    // for every date; the footer rounds only for display.
    data: aligned.map(({ row }, i) => (totals[i] ? (row[coin.symbol] / totals[i]) * 100 : 0)),
    borderColor: coin.color,
    backgroundColor: withAlpha(coin.color),
    fill: true,
    tension: 0.2,
    pointRadius: 0,
  }));

  const lastIdx = aligned.length - 1;
  const lastTotal = totals[lastIdx];
  const latest = list.map((coin) => ({
    symbol: coin.symbol,
    share: lastTotal ? (aligned[lastIdx].row[coin.symbol] / lastTotal) * 100 : 0,
  }));

  return { labels, dates, datasets, latest };
}
