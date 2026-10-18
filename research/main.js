// Progressive-enhancement layer for the State of Stablecoins hub.
// All content renders as real HTML without this script. This adds:
// the live hero counter, IntersectionObserver scroll reveals, Chart.js
// instances, chip-filter behavior, the remittance calculator, and the
// accordion expand/collapse. No new dependencies beyond Chart.js (already
// a project dep). Respects prefers-reduced-motion throughout.
import * as data from './data.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- theme bridge: respect the dashboard's saved theme if present ----------
try {
  const saved = localStorage.getItem('stablesense:theme');
  const legacy = localStorage.getItem('stablepulse:theme');
  const mode = saved || legacy || 'light';
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effective = mode === 'system' ? (dark ? 'dark' : 'light') : mode;
  document.documentElement.setAttribute('data-theme', effective);
} catch { /* private mode */ }

// hub theme toggle
const hubToggle = document.getElementById('hub-theme-toggle');
if (hubToggle) {
  hubToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('stablesense:theme', next); } catch { /* private mode */ }
    // resize all charts to pick up new grid/tick colors
    loadChartJs().then((Chart) => {
      setTimeout(() => Object.values(Chart.instances || {}).forEach((inst) => inst.resize()), 50);
    });
  });
}

// --- category color helper -------------------------------------------------
const catColor = (id) => {
  const map = {
    'fiat-usd': '--hub-cat-fiat-usd',
    'fiat-non-usd': '--hub-cat-fiat-non-usd',
    commodity: '--hub-cat-commodity',
    'crypto-synth': '--hub-cat-crypto-synth',
    algorithmic: '--hub-cat-algorithmic',
    rwa: '--hub-cat-rwa',
  };
  return getComputedStyle(document.documentElement).getPropertyValue(map[id] || '--hub-cat-fiat-usd').trim();
};

const catLabel = (id) => {
  const t = data.taxonomy.find((x) => x.id === id);
  return t ? t.label : id;
};

// --- escaping helpers -----------------------------------------------------
// The hub assembles HTML by string interpolation from data.js. Every value
// that reaches innerHTML passes through one of these, so a poisoned data row
// cannot close a tag or an attribute and inject markup.
function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  // The DOM escapes & < >. Encode both quote styles as well so the same helper
  // is safe for the label text rendered next to an escaping href value.
  return d.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Attribute-context escape for href/src values. Quotes are always encoded, so a
// value can never terminate the attribute and open an event handler. Pair it
// with safeHref below for any URL that comes out of data.js.
function escAttr(s) {
  return escHtml(s);
}

// URL policy for data.js-derived hrefs. Allowed: http, https, mailto, and
// scheme-less same-origin relative paths (one is already in use in data.js,
// so dropping it would break a live link). Refused: any other explicit scheme
// (javascript:, data:, vbscript: ...), any protocol-relative '//host' value,
// any control character (browsers strip them, so a newline inside a scheme is
// a real bypass), and any value carrying a quote or angle bracket (an attempt
// to break out of the attribute). Refused values fall back to '#'. A bare
// "www." host gets an https scheme.
function safeHref(url) {
  if (url == null) return '#';
  const raw = String(url).trim();
  if (!raw) return '#';
  if (/[\u0000-\u001f\u007f"'<>]/.test(raw)) return '#';
  const scheme = raw.match(/^([a-z][a-z0-9+.\-]*):/i);
  if (scheme) {
    const s = scheme[1].toLowerCase();
    return (s === 'http' || s === 'https' || s === 'mailto') ? escAttr(raw) : '#';
  }
  if (raw.startsWith('//')) return '#';
  if (/^www\./i.test(raw)) return escAttr('https://' + raw);
  return escAttr(raw);
}

// --- shared template builders ---------------------------------------------
// The sections below repeat the same handful of fragments. Each one is built in
// exactly one place here, so a class or attribute change lands once and every
// call site says what it renders instead of restating the markup. These return
// HTML strings; anything a caller wants escaped is escaped at the call site, so
// the builders never change what a value renders as.

// Outbound source link. Every data-derived URL in this file reaches an href
// through safeHref here, never by direct interpolation.
function sourceLink(url, labelHtml) {
  return `<a href="${safeHref(url)}" target="_blank" rel="noopener noreferrer">${labelHtml}</a>`;
}

// "Label: value" lead-in, the part shared by the two paragraph forms below.
// valueHtml is the already-rendered value; escaping stays at the call site.
function strongLead(label, valueHtml) {
  return `<strong>${label}:</strong> ${valueHtml}`;
}

// "Source: <link>" aside. Five sections end with the same sentence shape: an
// optional lead-in, the source link, then a trailing qualifier that is specific
// to the section and must stay specific.
function sourceAside(prefixHtml, url, labelHtml, tailHtml) {
  return `<p class="as-of">${prefixHtml}Source: ${sourceLink(url, labelHtml)}${tailHtml}</p>`;
}

// Labelled paragraph: <p><strong>Label:</strong> value</p>.
function labelledPara(label, valueHtml) {
  return `<p>${strongLead(label, valueHtml)}</p>`;
}

// Same shape, muted aside styling: dates, caveats, unresolved status.
function labelledAside(label, valueHtml) {
  return `<p class="as-of">${strongLead(label, valueHtml)}</p>`;
}

// One stat callout: label, headline figure, single note line.
function statCallout(labelHtml, statHtml, noteHtml) {
  return `
    <div class="callout">
      <div class="callout-label">${labelHtml}</div>
      <p class="stat md">${statHtml}</p>
      <p>${noteHtml}</p>
    </div>
  `;
}

// Scrollable table shell. tableId is always a hard-coded string at the call
// site (never data), and the header cells carry their own <th> classes, so the
// only per-section difference is the header row and the body rows.
function hubTableHtml(tableId, headerCellsHtml, rowsHtml) {
  return `
    <div class="hub-table-wrap">
      <table class="hub-table" id="${escAttr(tableId)}">
        <thead>
          <tr>${headerCellsHtml}</tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}

// Chip group: one active chip at a time. Clicking a chip in containerSelector
// moves .active to it and calls onSelect with its data attribute value. Used by
// the token, forecast, and regulation filters, which had the same wiring three
// times.
function wireChips(containerSelector, dataKey, onSelect) {
  document.querySelectorAll(`${containerSelector} .hub-chip`).forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll(`${containerSelector} .hub-chip`).forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      onSelect(chip.dataset[dataKey]);
    });
  });
}

// --- hero counter ----------------------------------------------------------
async function heroCounter() {
  const el = document.getElementById('hero-counter');
  const label = document.getElementById('hero-counter-label');
  if (!el) return;
  // Show loading state immediately, never $0
  el.textContent = 'Loading...';
  const trackedSyms = ['USDT', 'USDC', 'DAI', 'USDE', 'PYUSD'];
  let total = 0;
  let fetched = false;
  let missing = [];
  try {
    const { fetchDashboardData } = await import('../src/lib/api.js');
    const d = await fetchDashboardData({});
    const supplies = {};
    for (const a of d?.allStables?.peggedAssets || []) {
      const v = a?.circulating?.peggedUSD;
      if (typeof v === 'number' && Number.isFinite(v)) supplies[(a.symbol || '').toUpperCase()] = v;
    }
    for (const sym of trackedSyms) {
      if (typeof supplies[sym] === 'number' && supplies[sym] > 0) {
        total += supplies[sym];
      } else {
        missing.push(sym);
      }
    }
    total = total / 1e9; // peggedUSD is raw dollars; fmt() below expects billions
    if (total > 0) fetched = true;
  } catch { /* keep static fallback */ }

  if (!fetched) {
    // No live data: show the single hyphen placeholder, never a number.
    // The previous fallback printed a midpoint of a research-file range and
    // labelled it "total global stablecoin market cap", which is a different
    // measure from the tracked-coin sum and a fabricated point estimate
    // dressed as an observation. UNKNOWN is the honest state.
    el.textContent = '-';
    if (label) label.textContent = 'Combined market cap of the 5 stablecoins tracked here: unavailable (live fetch failed). No estimate is substituted; the dated measurement used elsewhere in this report is stated there with its own source.';
    return;
  }

  if (missing.length > 0) {
    label.textContent = `Combined market cap of the 5 stablecoins tracked here, updated live - partial, waiting on ${missing.length} coin${missing.length > 1 ? 's' : ''} (${missing.join(', ')})`;
  } else {
    label.textContent = 'Combined market cap of the 5 stablecoins tracked here, updated live';
  }

  const target = total;
  const duration = prefersReducedMotion ? 0 : 1400;
  const start = performance.now();
  const fmt = (v) => '$' + Math.round(v).toLocaleString('en-US') + 'B';
  if (duration === 0) { el.textContent = fmt(target); return; }
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = fmt(target * eased);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = fmt(target);
  };
  requestAnimationFrame(step);
}

// --- scroll reveal ---------------------------------------------------------
function reveals() {
  const els = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    els.forEach((e) => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  els.forEach((e) => io.observe(e));
}

// --- accordion builder -----------------------------------------------------
function buildAccordion(containerId, items, renderItem) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.className = 'hub-accordion';
  container.innerHTML = items.map((item, i) => {
    const body = renderItem(item);
    return `<div class="hub-accordion-item${i === 0 ? ' open' : ''}">
      <button class="hub-accordion-trigger" aria-expanded="${i === 0 ? 'true' : 'false'}">${item.label || item.title || item.name}<span class="hub-accordion-mark">&rsaquo;</span></button>
      <div class="hub-accordion-panel">${body}</div>
    </div>`;
  }).join('');
  container.querySelectorAll('.hub-accordion-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
}

// --- taxonomy accordion + token table + chips -----------------------------
function buildTaxonomy() {
  buildAccordion('taxonomy-accordion', data.taxonomy, (t) => {
    return `${labelledPara('Scale', `<span class="num">${t.scale}</span> <span class="as-of">(${t.asOf})</span>`)}
      ${labelledPara('Examples', t.examples)}
      <p>${t.mechanism}</p>
      <p class="why">${t.why}</p>`;
  });

  const tbody = document.querySelector('#token-table tbody');
  if (!tbody) return;
  // Parse market-cap midpoint so ranges sort correctly. "2.3-6" parses as
  // 4.15, not 2.36. Non-numeric like "early growth" sorts as 0.
  const mcapMid = (s) => {
    const nums = String(s || '').match(/[\d.]+/g);
    if (!nums || !nums.length) return 0;
    const vals = nums.map(Number).filter(Number.isFinite);
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };
  const renderRows = (filter) => {
    const rows = data.tokens
      .filter((t) => filter === 'all' || t.category === filter)
      .sort((a, b) => mcapMid(b.mcap) - mcapMid(a.mcap));
    tbody.innerHTML = rows.map((t) => {
      const color = catColor(t.category);
      return `<tr>
        <td><strong>${t.token}</strong></td>
        <td class="cat-cell"><span class="cat-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:0.4rem;vertical-align:middle"></span>${catLabel(t.category)}</td>
        <td>${t.peg}</td>
        <td>${t.issuer}</td>
        <td class="num">${t.mcap}</td>
        <td>${t.chain}</td>
        <td class="as-of">${t.asOf}</td>
      </tr>`;
    }).join('');
  };
  renderRows('all');

  wireChips('#token-chips', 'cat', renderRows);
}

// --- Chart.js (lazy) ------------------------------------------------------
let chartJsPromise;
async function loadChartJs() {
  if (!chartJsPromise) {
    chartJsPromise = import('chart.js').then((m) => {
      const Chart = m.Chart;
      // Tree-shakeable build: every controller/element/scale/plugin used below
      // must be registered explicitly, or Chart.js throws "X is not a
      // registered scale/controller" at render time. bar + line charts,
      // fill:true areas (Filler), and Section 9's log-scale comparison
      // (LogarithmicScale) are all used across this hub's charts.
      Chart.register(
        m.LineController, m.BarController,
        m.LineElement, m.PointElement, m.BarElement,
        m.CategoryScale, m.LinearScale, m.LogarithmicScale,
        m.Filler, m.Tooltip, m.Legend
      );
      return Chart;
    });
  }
  return chartJsPromise;
}

const chartDefaults = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--hub-ink2').trim() } } },
  color: getComputedStyle(document.documentElement).getPropertyValue('--hub-ink2').trim(),
  font: { family: getComputedStyle(document.documentElement).getPropertyValue('--hub-mono').trim() },
});

function gridColor() { return getComputedStyle(document.documentElement).getPropertyValue('--hub-line').trim(); }
function inkColor() { return getComputedStyle(document.documentElement).getPropertyValue('--hub-ink').trim(); }

// --- Section 1: taxonomy stacked bar -------------------------------------
async function taxonomyChart() {
  const canvas = document.getElementById('taxonomy-chart');
  if (!canvas) return;
  const Chart = await loadChartJs();
  const labels = data.taxonomy.map((t) => t.label);
  const colors = data.taxonomy.map((t) => catColor(t.id));
  // represent each as a single stacked bar (one segment per category)
  // Use the midpoint of ranges so the chart matches the caption math, not the high end only.
  const vals = data.taxonomy.map((t) => {
    const m = String(t.scale || '').match(/\$?([\d.]+)\s*(?:-\s*\$?([\d.]+))?/);
    if (!m) return 0;
    const lo = parseFloat(m[1]);
    const hi = m[2] != null ? parseFloat(m[2]) : lo;
    if (!Number.isFinite(lo)) return 0;
    if (!Number.isFinite(hi)) return lo;
    return (lo + hi) / 2;
  });
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Total stablecoin market'],
      datasets: data.taxonomy.map((t, i) => ({
        label: `${t.label} (${t.scale})`,
        data: [vals[i]],
        backgroundColor: colors[i],
        borderWidth: 0,
        barThickness: 60,
      })),
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: inkColor(), font: { size: 11 }, boxWidth: 12 } },
        tooltip: { callbacks: { label: (ctx) => `${data.taxonomy[ctx.datasetIndex].label}: ${data.taxonomy[ctx.datasetIndex].scale}` } },
      },
      scales: { x: { stacked: true, grid: { color: gridColor() }, ticks: { color: inkColor() } }, y: { stacked: true, display: false } },
      animation: prefersReducedMotion ? false : { duration: 1200 },
    },
  });
}

// --- Section 2: scale line + forecast ------------------------------------
async function scaleChart() {
  const canvas = document.getElementById('scale-chart');
  if (!canvas) return;
  const Chart = await loadChartJs();
  const ink = inkColor();
  const grid = gridColor();
  new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.marketCapHistory.map((d) => d.year),
      datasets: [{
        label: 'Total stablecoin market cap ($B)',
        data: data.marketCapHistory.map((d) => d.cap),
        borderColor: catColor('fiat-usd'),
        backgroundColor: catColor('fiat-usd') + '22',
        borderWidth: 2,
        fill: true,
        tension: 0.25,
        pointRadius: 3,
        pointBackgroundColor: catColor('fiat-usd'),
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `$${ctx.parsed.y}B` } } },
      scales: {
        x: { grid: { color: grid }, ticks: { color: ink } },
        y: { grid: { color: grid }, ticks: { color: ink, callback: (v) => '$' + v + 'B' } },
      },
      animation: prefersReducedMotion ? false : { duration: 1400 },
    },
  });
}

async function forecastChart() {
  const canvas = document.getElementById('forecast-chart');
  if (!canvas) return;
  const Chart = await loadChartJs();
  const ink = inkColor();
  const grid = gridColor();
  const gold = getComputedStyle(document.documentElement).getPropertyValue('--hub-gold').trim();
  const currentAnchor = 316; // mid-2026 snapshot

  // Build a floating-bar dataset: each bar spans [low, high] on a shared axis.
  // Chart.js floating bars use [min, max] data points with type:'bar'.
  const allNames = data.projections.map((p) => p.name);
  let activeFilter = 'all';

  const buildData = (filter) => {
    const items = data.projections.filter((p) => filter === 'all' || p.name === filter);
    // For floating bars, minBarLength does NOT reliably enforce minimum thickness.
    // Compute visual padding: for single-point forecasters (low === high), expand
    // to +/-10% visual extent; for narrow bands, add minimum padding so the bar
    // is visible. The tooltip still shows the real range.
    const visualData = items.map((p) => {
      if (p.low === p.high) {
        // single-point: render as a thick bar with +/-10% visual extent
        const pad = p.low * 0.10;
        return [Math.max(0, p.low - pad), p.high + pad];
      }
      // range: if the range is very narrow, add visual padding
      const range = p.high - p.low;
      const minVisualRange = 100; // $100B minimum visual range
      if (range < minVisualRange) {
        const pad = (minVisualRange - range) / 2;
        return [Math.max(0, p.low - pad), p.high + pad];
      }
      return [p.low, p.high];
    });
    return {
      labels: items.map((p) => p.name),
      datasets: [{
        label: 'Projected range by 2030 ($B)',
        data: visualData,
        backgroundColor: items.map((p) => {
          return p.name === 'IMF' ? gold + 'cc' : catColor('fiat-usd') + '99';
        }),
        borderColor: items.map(() => gold),
        borderWidth: 1,
        barThickness: 'flex',
        maxBarThickness: 40,
        minBarLength: 12, // belt: keep as fallback, but the visual padding above is the real fix
      }, {
        label: 'Current (mid-2026)',
        data: items.map(() => [currentAnchor, currentAnchor]),
        backgroundColor: items.map(() => gold),
        barThickness: 2,
        barPercentage: 1,
        categoryPercentage: 1,
      }],
    };
  };

  const chart = new Chart(canvas, {
    type: 'bar',
    data: buildData('all'),
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => {
          if (ctx.datasetIndex === 1) return `Current: ~$${currentAnchor}B (mid-2026)`;
          const p = data.projections.find((x) => x.name === ctx.label);
          return p ? `${p.name}: ${p.range} by ${p.by} - ${p.note}` : '';
        } } },
      },
      scales: {
        x: { grid: { color: grid }, ticks: { color: ink, callback: (v) => '$' + (v >= 1000 ? (v/1000).toFixed(1) + 'T' : v + 'B') } },
        y: { grid: { display: false }, ticks: { color: ink } },
      },
      animation: prefersReducedMotion ? false : { duration: 1200 },
    },
  });

  wireChips('#forecast-chips', 'forecaster', (value) => {
    activeFilter = value;
    chart.data = buildData(activeFilter);
    chart.update();
  });
}

// --- Section 3: treasury bars --------------------------------------------
async function treasuryChart() {
  const canvas = document.getElementById('treasury-chart');
  if (!canvas) return;
  const Chart = await loadChartJs();
  const ink = inkColor();
  const grid = gridColor();
  const gold = getComputedStyle(document.documentElement).getPropertyValue('--hub-gold').trim();
  const sorted = [...data.treasuryHolders].sort((a, b) => b.value - a.value);
  const bars = sorted.filter((h) => !h.benchmark);
  const bench = sorted.find((h) => h.benchmark);
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: bars.map((h) => h.name),
      datasets: [
        {
          label: 'US Treasury holdings ($B)',
          data: bars.map((h) => h.value),
          backgroundColor: bars.map((h) => (h.type === 'issuer' ? gold : catColor('fiat-usd'))),
          borderWidth: 0,
        },
        {
          label: 'Combined issuers (4): benchmark, not a holder',
          data: bars.map((h) => (bench ? bench.value : null)),
          type: 'line',
          borderColor: gold,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
          borderWidth: 1.5,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => (ctx.datasetIndex === 0 ? `$${ctx.parsed.x}B${bars[ctx.dataIndex].note ? ' (' + bars[ctx.dataIndex].note + ')' : ''}` : `Combined issuers: $${bench.value}B (aggregate of Tether+Circle+First Digital+Paxos; shown for scale only)`) } },
      },
      scales: { x: { grid: { color: grid }, ticks: { color: ink, callback: (v) => '$' + v + 'B' } }, y: { grid: { display: false }, ticks: { color: ink } } },
      animation: prefersReducedMotion ? false : { duration: 1400 },
    },
  });
}

// --- Section 6: dollarization --------------------------------------------
async function dollarizationChart() {
  const canvas = document.getElementById('dollarization-chart');
  if (!canvas) return;
  const Chart = await loadChartJs();
  const ink = inkColor();
  const grid = gridColor();
  const gold = getComputedStyle(document.documentElement).getPropertyValue('--hub-gold').trim();
  // Qualitative intensity rank (author-assigned from documented evidence),
  // NOT a % of GDP: only Turkey has a measured % (4.3%, Chainalysis). Ties
  // allowed. The tooltip shows each country's evidence detail.
  const intensity = { Turkey: 4, Argentina: 4, Nigeria: 3, Lebanon: 2, Venezuela: 2 };
  const rows = data.dollarizationCountries
    .map((c) => ({ ...c, rankVal: intensity[c.country] ?? 1 }))
    .sort((a, b) => b.rankVal - a.rankVal);
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: rows.map((c) => c.country),
      datasets: [{
        label: 'Documented adoption intensity (qualitative rank, 4 = most documented; not % of GDP)',
        data: rows.map((c) => c.rankVal),
        backgroundColor: rows.map((c) => (c.gdpPct !== null ? gold : catColor('fiat-usd') + 'aa')),
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => rows[ctx.dataIndex].detail + (rows[ctx.dataIndex].gdpPct !== null ? ` (measured: ~${rows[ctx.dataIndex].gdpPct}% of GDP)` : '') } },
      },
      scales: { x: { grid: { display: false }, ticks: { color: ink } }, y: { grid: { color: grid }, ticks: { color: ink, stepSize: 1, callback: (v) => v } } },
      animation: prefersReducedMotion ? false : { duration: 1200 },
    },
  });
  buildAccordion('dollarization-accordion', data.dollarizationCountries.map((c) => ({ label: c.country, ...c })), (c) => {
    return `<p>${c.detail}</p>${c.gdpPct !== null ? `<p class="as-of">Stablecoin purchases ~${c.gdpPct}% of GDP (Chainalysis).</p>` : ''}`;
  });
}

// --- Section 7: learner-first depeg mechanism flow -----------------------
function buildDepegs() {
  const container = document.getElementById('depeg-study');
  if (!container) return;

  const cases = (data.depegs || []).map((d) => ({ ...d, ...(d.learner || {}) }));
  const takeaways = data.depegTakeaways || [];
  let selected = 0;

  const render = () => {
    const c = cases[selected];
    if (!c) return;
    container.innerHTML = `
      <div class="hub-case-selector" role="tablist" aria-label="Choose a depeg case study">
        ${cases.map((item, index) => `
          <button type="button" class="hub-case-tab ${index === selected ? `active ${item.color || ''}` : ''}"
            role="tab" aria-selected="${index === selected}" data-idx="${index}">
            <span class="hub-case-num">0${index + 1}</span>
            <span><b>${item.short || item.name}</b><small>${item.kind || ''} failure</small></span>
          </button>
        `).join('')}
      </div>
      <div class="hub-case-study" role="tabpanel">
        <div class="hub-case-story">
          <div class="hub-case-pill ${c.color || ''}">${c.label || c.failureMode || ''}</div>
          <p class="hub-case-date">${c.date || ''}</p>
          <h3>${c.title || c.name}</h3>
          <p class="hub-case-question">"${c.question || ''}"</p>
          <div class="hub-case-details">
            <div><span>Lowest quoted price</span><strong>${c.low || '-'}</strong></div>
            <div><span>What happened after</span><strong>${c.recovery || '-'}</strong></div>
          </div>
          <p class="mech">${c.mech || ''}</p>
        </div>
        <div class="hub-failure-mechanism">
          <header>
            <div class="kicker">The failure mechanism</div>
            <h3>Follow the feedback loop</h3>
            <p>${c.trigger || ''}</p>
          </header>
          <div class="hub-mechanism-flow">
            ${(c.mechanism || []).map((step, index) => `
              <div class="hub-flow-step"><span>${index + 1}</span><strong>${step}</strong></div>
            `).join('')}
          </div>
          <div class="hub-lesson-box"><span>The lesson</span><p>${c.conclusion || c.failureMode || ''}</p></div>
        </div>
      </div>
      <div class="hub-matrix-wrap">
        <h3>Failure pattern matrix</h3>
        <p class="as-of">A mechanism map, not a price-performance chart.</p>
        <div class="hub-failure-matrix" role="table">
          <div class="hub-matrix-head" role="row">
            <span>Case</span><span>What held the peg</span><span>What broke first</span><span>Could it recover?</span>
          </div>
          ${cases.map((row) => `
            <div class="hub-matrix-row" role="row">
              <span class="hub-case-id ${row.color || ''}"><b>${(row.short || row.name || '').split(' · ')[0]}</b><small>${row.kind || ''}</small></span>
              <span>${row.heldPeg || '-'}</span>
              <span>${row.brokeFirst || '-'}</span>
              <span>${row.recoverText || '-'}</span>
            </div>
          `).join('')}
        </div>
        <p class="section-thesis" style="margin-top:1rem">A stablecoin price alone cannot tell you which risk you are seeing. StableSense shows the mechanism beside the move.</p>
      </div>
      <div class="hub-takeaway-grid">
        ${takeaways.map((t) => `
          <article class="hub-takeaway-card"><span>${t.n}</span><h3>${t.title}</h3><p>${t.body}</p></article>
        `).join('')}
      </div>
    `;
    container.querySelectorAll('.hub-case-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        selected = Number(btn.dataset.idx);
        render();
      });
    });
  };

  render();
}

// --- Section 8: regulation table + chips ---------------------------------
function buildRegulation() {
  const tbody = document.querySelector('#reg-table tbody');
  if (!tbody) return;
  const render = (filter) => {
    const rows = data.regulation.filter((r) => filter === 'all' || r.jurisdiction === filter);
    tbody.innerHTML = rows.map((r) => `<tr>
      <td><strong>${r.jurisdiction}</strong></td>
      <td>${r.framework}</td>
      <td>${r.status}</td>
      <td>${r.pegs}</td>
      <td>${r.algorithmic}</td>
      <td>${r.rules}</td>
    </tr>`).join('');
  };
  render('all');

  const sourceById = new Map((data.sources || []).map((s) => [s.id, s]));
  const recoveryBody = document.querySelector('#recovery-table tbody');
  if (recoveryBody && Array.isArray(data.recoveryMatrix)) {
    recoveryBody.innerHTML = data.recoveryMatrix.map((r) => {
      const links = (r.sourceIds || [])
        .map((id) => sourceById.get(id))
        .filter(Boolean)
        .map((s) => sourceLink(s.url, escHtml(s.label)))
        .join('; ');
      return `<tr>
        <td><strong>${escHtml(r.jurisdiction)}</strong>${links ? `<br><span class="as-of">Sources: ${links}</span>` : ''}</td>
        <td>${escHtml(r.instrument)}<br><span class="as-of">${escHtml(r.status)}</span></td>
        <td>${escHtml(r.reserve)}</td>
        <td>${escHtml(r.holderPath)}</td>
        <td>${escHtml(r.shortfall)}</td>
      </tr>`;
    }).join('');
  }
  const recoveryNote = document.getElementById('recovery-unresolved');
  if (recoveryNote && Array.isArray(data.recoveryMatrix)) {
    recoveryNote.textContent = 'Unresolved: ' + data.recoveryMatrix
      .map((r) => `${r.jurisdiction}: ${r.unresolved}`)
      .join(' ');
  }

  const newsWrap = document.getElementById('reg-news');
  if (newsWrap && Array.isArray(data.regulationNews)) {
    newsWrap.innerHTML = (data.regulationNews || []).map((n) => `<div class="reg-news-item" style="margin:0.6rem 0;padding:0.6rem 0.9rem;border-left:3px solid var(--hub-gold, #d4a017)">
      <strong>${escHtml(n.label)}</strong> <span class="as-of">(${escHtml(n.date)})</span>
      <p style="margin:0.3rem 0 0">${escHtml(n.detail)} ${sourceLink(n.source, 'Source')}</p>
    </div>`).join('');
  }
  wireChips('#reg-chips', 'jurisdiction', render);
}

// --- Section 9: reality check log-scale ----------------------------------
async function realityChart() {
  const canvas = document.getElementById('reality-chart');
  if (!canvas) return;
  const Chart = await loadChartJs();
  const ink = inkColor();
  const grid = gridColor();
  const gold = getComputedStyle(document.documentElement).getPropertyValue('--hub-gold').trim();
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.realityCheck.map((r) => r.label),
      datasets: [{
        label: 'Market size ($B, log scale)',
        data: data.realityCheck.map((r) => r.value),
        backgroundColor: data.realityCheck.map((r, i) => (r.label.includes('stablecoins') ? gold : catColor('fiat-usd') + 'cc')),
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => `$${ctx.parsed.y}B - ${data.realityCheck[ctx.dataIndex].note}` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: ink } },
        y: { type: 'logarithmic', grid: { color: grid }, ticks: { color: ink, callback: (v) => '$' + v + 'B' } },
      },
      animation: prefersReducedMotion ? false : { duration: 1200 },
    },
  });
}

// --- Section 5: remittance calculator + race bars ------------------------
// Author's teaching model, not a qualified research estimate. Stacked rows for
// every lever (wire fee, FX markup, float, on-ramp, gas, off-ramp) so no single
// black-box dollar figure can miseducate. The scenario table underneath is the
// defensible product; the calculator lets the reader replay it.
function remittanceCalc() {
  const amountEl = document.getElementById('calc-amount');
  const scheduleEl = document.getElementById('calc-schedule');
  const daysEl = document.getElementById('calc-days');
  const rateEl = document.getElementById('calc-rate');
  const onrampEl = document.getElementById('calc-onramp');
  const offrampEl = document.getElementById('calc-offramp');
  const presetFullEl = document.getElementById('calc-preset-full');
  const presetHoldEl = document.getElementById('calc-preset-hold');
  const tradOutEl = document.getElementById('calc-trad-out');
  const stableOutEl = document.getElementById('calc-stable-out');
  const warnEl = document.getElementById('calc-warn');
  if (!amountEl || !tradOutEl || !stableOutEl) return;

  const cfg = data.remittanceCost;
  const fmtUsd = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: n >= 1000 ? 0 : 2 });
  const fmtPctRow = (n, amt) => `${(n / amt * 100).toFixed(2)}% of ${fmtUsd(amt)}`;

  const compute = () => {
    const amt = parseFloat(amountEl.value) || 0;
    const schedule = cfg.traditionalSchedules.find((s) => s.id === (scheduleEl ? scheduleEl.value : cfg.defaultTraditional)) || cfg.traditionalSchedules[0];
    const days = parseFloat(daysEl ? daysEl.value : cfg.defaultDaysInTransit) || 0;
    const rate = parseFloat(rateEl ? rateEl.value : cfg.defaultOpportunityRate) || 0;
    const includeOnramp = onrampEl ? onrampEl.checked : true;
    const includeOfframp = offrampEl ? offrampEl.checked : true;
    const stable = cfg.stablecoin;

    // Traditional: stated fee + FX markup + float, never one hero number.
    const tradFee = schedule.fixedUsd;
    const tradFx = amt * (schedule.feePct / 100);
    const tradFloat = amt * (rate / 100) * days / 365;
    const tradAllIn = tradFee + tradFx + tradFloat;

    // Stablecoin: on-ramp + gas + off-ramp + float, each hop its own row.
    const onrampCost = includeOnramp ? amt * (stable.onrampPct / 100) : 0;
    const gas = stable.networkFeeUsd;
    const offrampCost = includeOfframp ? amt * (stable.offrampPct / 100) : 0;
    const stableFloat = amt * (rate / 100) * (includeOnramp || includeOfframp ? 1 : 0) / 365; // ~0 on-chain, ~1d if a ramp settles to a bank
    const stableAllIn = onrampCost + gas + offrampCost + stableFloat;

    const hopOrSkip = (included, cost) => included ? fmtUsd(cost) : 'not in this path';

    // Each lever is its own row; the total is the last row, not a hero number.
    const costRow = (label, value) => `<div class="calc-row"><span>${label}</span><span class="calc-val">${value}</span></div>`;
    const totalRow = (value) => `<div class="calc-row calc-total"><span>All-in</span><span class="calc-val">${value}</span></div>`;
    const costStack = (rowsHtml) => `<div class="calc-stack">${rowsHtml}</div>`;

    tradOutEl.innerHTML = costStack(
      costRow('Stated wire / MTO fee', fmtUsd(tradFee)) +
      costRow(`FX markup (${schedule.feePct}%)`, fmtUsd(tradFx)) +
      costRow(`Float / interest (${rate}%, ${days}d)`, fmtUsd(tradFloat)) +
      totalRow(`${fmtUsd(tradAllIn)} (${fmtPctRow(tradAllIn, amt)})`)
    );

    stableOutEl.innerHTML = costStack(
      costRow('On-ramp', hopOrSkip(includeOnramp, onrampCost)) +
      costRow('Network fee', fmtUsd(gas)) +
      costRow('Off-ramp', hopOrSkip(includeOfframp, offrampCost)) +
      costRow('Float / interest', fmtUsd(stableFloat)) +
      totalRow(`${fmtUsd(stableAllIn)} (${fmtPctRow(stableAllIn, amt)})`)
    );

    // Warn when the RPW-like percentage is extrapolated beyond its survey size.
    if (warnEl) {
      if (schedule.warnAbove != null && amt > schedule.warnAbove) {
        warnEl.textContent = schedule.warn || '';
        warnEl.style.display = 'block';
      } else {
        warnEl.textContent = '';
        warnEl.style.display = 'none';
      }
    }
  };

  amountEl.addEventListener('input', compute);
  if (scheduleEl) scheduleEl.addEventListener('change', compute);
  if (daysEl) daysEl.addEventListener('input', compute);
  if (rateEl) rateEl.addEventListener('input', compute);
  if (onrampEl) onrampEl.addEventListener('change', compute);
  if (offrampEl) offrampEl.addEventListener('change', compute);
  if (presetFullEl) presetFullEl.addEventListener('click', () => {
    if (onrampEl) onrampEl.checked = true;
    if (offrampEl) offrampEl.checked = true;
    compute();
  });
  if (presetHoldEl) presetHoldEl.addEventListener('click', () => {
    if (onrampEl) onrampEl.checked = false;
    if (offrampEl) offrampEl.checked = false;
    compute();
  });
  compute();
}

function raceBars() {
  const bars = document.querySelectorAll('.race-bar');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    bars.forEach((b) => { b.style.width = b.dataset.fill + '%'; });
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const b = e.target;
        setTimeout(() => { b.style.width = b.dataset.fill + '%'; }, 200);
        io.unobserve(b);
      }
    });
  }, { threshold: 0.4 });
  bars.forEach((b) => io.observe(b));
}

// --- corridor accordion ---------------------------------------------------
function buildCorridors() {
  buildAccordion('corridor-accordion', data.corridors.map((c) => ({ label: c.region, ...c })), (c) => {
    return `<p>${c.detail}</p><p class="as-of">Countries: ${c.country}</p>`;
  });
}

// --- footer: freshness badge + verified claims + sources list -------------
// The badge states the research review date and the build marker. It does NOT
// state a dataset-wide measurement date, because there is no such date: every
// measure in data.js carries its own as-of. Presenting one date for the whole
// dataset would imply the figures were all observed then.
function buildFreshnessBadge() {
  const badge = document.getElementById('hub-freshness-badge');
  if (badge) badge.textContent = `Research reviewed ${data.RESEARCH_REVIEWED} · Hub build ${data.HUB_BUILD} · source observation dates vary`;
}

function buildFooterLists() {
  const vc = document.getElementById('verified-claims-list');
  if (vc) {
    vc.innerHTML = '<ol>' + data.verifiedClaims.map((c) => `<li><strong>${escHtml(c.claim)}.</strong> ${escHtml(c.resolution)}<br><span class="as-of">Sources: ${c.sources.map((s) => sourceLink(s.url, escHtml(s.label))).join('; ')}.</span></li>`).join('') + '</ol>';
  }
  const sl = document.getElementById('sources-list');
  if (sl) {
    sl.innerHTML = data.sources.map((s) => `<li>${sourceLink(s.url, escHtml(s.label))}</li>`).join('');
  }
}

// --- sticky TOC + reading progress ----------------------------------------
function stickyToc() {
  const sections = document.querySelectorAll('.section[id]');
  const progress = document.getElementById('toc-progress');
  const tocLinks = document.querySelectorAll('.hub-nav a[href^="#"]');
  if (!sections.length || !tocLinks.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const id = e.target.id;
        tocLinks.forEach((l) => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach((s) => io.observe(s));

  // reading progress bar
  if (progress) {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}

// --- CSV export helper ----------------------------------------------------
function exportTableCsv(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = table.querySelectorAll('tr');
  const csv = [];
  rows.forEach((row) => {
    const cells = row.querySelectorAll('th, td');
    csv.push(Array.from(cells).map((c) => '"' + c.textContent.trim().replace(/"/g, '""') + '"').join(','));
  });
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// --- remittance scenario table -------------------------------------------
function buildRemittanceScenarios() {
  const wrap = document.getElementById('remittance-scenarios');
  if (!wrap) return;
  const rows = data.remittanceScenarios || [];
  wrap.innerHTML = rows.map((s) => {
    const allowedTag = s.allowed.startsWith('Author') ? `<span class="scen-tag author">Author model</span>` : `<span class="scen-tag sourced">Sourced</span>`;
    return `<div class="scen-row">
      <div class="scen-head"><span class="scen-id">${s.id}</span> <span class="scen-title">${s.scenario}</span> ${allowedTag}</div>
      <div class="scen-grid">
        <div><div class="scen-label">Traditional</div><div class="scen-val">${s.traditional}</div></div>
        <div><div class="scen-label">Stablecoin</div><div class="scen-val">${s.stablecoin}</div></div>
      </div>
      <div class="scen-why">${s.why}</div>
      <div class="scen-source">${s.source}</div>
    </div>`;
  }).join('');
}

// --- Pass 3 editorial builders ------------------------------------------

// Yield-bearing stablecoin debate callouts (extends Section 4).
function buildYieldDebate() {
  const wrap = document.getElementById('yield-callouts');
  if (!wrap) return;
  wrap.innerHTML = (data.yieldDebate || []).map((c) => statCallout(c.label, c.stat, c.detail)).join('');
}

// T-bill maturity-band visual (extends Section 3).
function buildMaturityBands() {
  const wrap = document.getElementById('maturity-bands-wrap');
  if (!wrap) return;
  wrap.innerHTML = (data.tBillMaturities || []).map((issuer) => {
    const bars = issuer.buckets.map((b) => `
      <div class="mb-row">
        <div class="mb-label">${b.label}</div>
        <div class="mb-track"><div class="mb-fill" style="width:${b.pct}%"></div></div>
        <div class="mb-val">${b.pct}%</div>
      </div>
    `).join('');
    return `<div class="mb-issuer"><div class="mb-issuer-name">${issuer.issuer}</div>${bars}</div>`;
  }).join('');
}

// BPI full-journey callout (next to the remittance calculator).
function buildBpiCallout() {
  const f = data.bpiFinding;
  if (!f) return;
  const findingEl = document.getElementById('bpi-finding');
  const sourceEl = document.getElementById('bpi-source');
  const detailEl = document.getElementById('bpi-detail');
  if (findingEl) findingEl.textContent = f.finding;
  if (sourceEl) sourceEl.textContent = f.label;
  if (detailEl) detailEl.textContent = f.detail;
}

// GENIUS Act rulemaking status (dated paragraph, not a live tracker).
// Commencement is UNRESOLVED, so this never renders a "locked" or "in force"
// date. The reserve list is rendered separately because "1:1 reserves" is
// routinely read as "1:1 Treasury bills", which the statute does not say.
function buildGeniusStatus() {
  const block = document.getElementById('genius-status-block');
  const sourceEl = document.getElementById('genius-source');
  const g = data.geniusStatus;
  if (!g || !block) return;
  block.innerHTML = `
    <p>Enacted <strong>${escHtml(g.enacted)}</strong>. Historical tracker snapshot (${escHtml(g.asOf)}): <strong>${escHtml(g.totalRulemakings)}</strong> total rulemakings across <strong>${escHtml(g.agencies)}</strong> agencies; <strong>${escHtml(g.nprmsIssued)}</strong> Notices of Proposed Rulemaking issued. Final rules completed: <strong>${escHtml(g.finalRules == null ? 'UNKNOWN' : g.finalRules)}</strong>.</p>
    ${labelledPara('Commencement mechanics', escHtml(g.commencementMechanics))}
    ${labelledPara('Commencement status', escHtml(g.commencementStatus))}
    ${labelledPara('Reserves', escHtml(g.reserveClasses))}
    <p>${escHtml(g.note)}</p>
  `;
  if (sourceEl) sourceEl.innerHTML = `Source: ${sourceLink(g.url, escHtml(g.source))}. This is a dated snapshot, not a live tracker, and no statement above asserts that any GENIUS duty is currently operative.`;
}

// Section 3: the statutory reserve list, stated as a list. Reading "1:1
// reserves" as "1:1 Treasury bills" is the specific error this corrects.
function buildGeniusReserves() {
  const wrap = document.getElementById('genius-reserves-wrap');
  const r = data.geniusReserves;
  if (!wrap || !r) return;
  wrap.innerHTML = `
    <div class="callout">
      <div class="callout-label">${escHtml(r.citation)}</div>
      <p class="stat md">${escHtml(r.headline)}</p>
      <ol class="hub-class-list">${r.classes.map((c) => `<li>${escHtml(c)}</li>`).join('')}</ol>
      ${labelledPara('Disclosure duty', escHtml(r.disclosure))}
      ${labelledPara('Encumbrance', escHtml(r.pledgeBan))}
      ${labelledPara('Accounting treatment', escHtml(r.accounting))}
      ${sourceAside(escHtml(r.scope) + ' ', r.url, 'GENIUS Act enrolled text', '.')}
    </div>
  `;
}

// Section 3: gross holdings versus net new Treasury demand, with the
// Kansas City Fed source discrepancy exposed rather than resolved. No
// corrected coefficient is published here.
function buildTreasuryDemand() {
  const wrap = document.getElementById('treasury-demand-wrap');
  const t = data.treasuryDemandMechanism;
  if (!wrap || !t) return;
  wrap.innerHTML = `
    <div class="callout">
      <div class="callout-label">${escHtml(t.title)}</div>
      ${labelledPara('The measurement', escHtml(t.lead))}
      ${labelledPara('The conditional example', escHtml(t.kcFed))}
      ${labelledPara('Why no number is published', escHtml(t.discrepancy))}
      ${labelledAside('Status', escHtml(t.status))}
      ${labelledPara('What survives both versions', escHtml(t.hedge))}
      <p>${escHtml(t.implication)}</p>
      ${sourceAside('', t.url, 'Kansas City Fed Economic Bulletin', " and the Fed's December 2025 FEDS Note. Both are cited with their own dates and their own limitations.")}
    </div>
  `;
}

// Section 2: the total market-cap measurement with its scope and the reason
// no cross-source range is quoted.
function buildMarketCapMeasure() {
  const wrap = document.getElementById('market-cap-measure-wrap');
  const m = data.marketCapMeasure;
  if (!wrap || !m) return;
  wrap.innerHTML = `
    <div class="callout">
      <div class="callout-label">Total stablecoin market cap, one dated measurement</div>
      <p class="stat md">${escHtml(m.headline)}</p>
      <p class="as-of">As of ${escHtml(m.asOf)}</p>
      ${labelledPara('What it measures', escHtml(m.measures))}
      ${labelledPara('Movement', `${escHtml(m.changeYoy)}, ${escHtml(m.dollarShare)}, and ${escHtml(m.distanceFromPeak)}.`)}
      ${labelledPara('Why no range', escHtml(m.crossSourceRange))}
      ${sourceAside('', m.url, escHtml(m.source), '. This is a different measure from the hero counter above, which sums only the 5 coins tracked by the live dashboard.')}
    </div>
  `;
}

// Section 9: who earns the float. One table row per disclosed measure, each
// carrying its own as-of date, because the two issuers' figures are not the
// same measure and must not be read as a like-for-like comparison.
function buildFloatEconomics() {
  const wrap = document.getElementById('float-economics-wrap');
  if (!wrap) return;
  const rows = (data.floatEconomics || []).map((r) => `
    <tr>
      <td>${r.issuer}</td>
      <td>${r.measure}</td>
      <td class="num">${r.value}</td>
      <td class="as-of">${r.asOf}</td>
      <td class="as-of">${r.note}</td>
    </tr>
  `).join('');
  wrap.innerHTML = hubTableHtml('float-table', `
            <th>Issuer</th>
            <th>Measure (as the issuer names it)</th>
            <th class="num">Value</th>
            <th class="as-of">As of</th>
            <th class="as-of">What it measures, and what it does not</th>
          `, rows);
}

// Section 9: the yield ban, quoted from the statute rather than paraphrased.
function buildYieldBan() {
  const y = data.yieldBan;
  if (!y) return;
  const q = document.getElementById('yield-ban-quote');
  const s = document.getElementById('yield-ban-scope');
  const si = document.getElementById('yield-ban-silence');
  const r = document.getElementById('yield-ban-reserve');
  if (q) q.innerHTML = strongLead(y.citation, `<em>${y.quote}</em>`);
  if (s) s.innerHTML = strongLead('Who it binds', y.payor);
  if (si) si.innerHTML = strongLead('What it does not say', y.silence);
  if (r) r.innerHTML = strongLead('The reserve side', y.reserveIncome);
}

// Section 10: rail vs authorization status, kept deliberately separate.
function buildAgenticRails() {
  const wrap = document.getElementById('agentic-rails-wrap');
  if (!wrap) return;
  const rows = (data.agenticRails || []).map((r) => `
    <tr>
      <td><strong>${r.name}</strong><div class="as-of">${r.operator}</div></td>
      <td>${r.layer}</td>
      <td class="cat-cell">${r.status}</td>
      <td class="as-of">${r.detail}</td>
    </tr>
  `).join('');
  wrap.innerHTML = hubTableHtml('agentic-rails-table', `
            <th>Protocol</th>
            <th>What layer it actually is</th>
            <th>Status</th>
            <th class="as-of">Detail</th>
          `, rows);
}

// Section 10: every published volume figure side by side, with its publisher
// and its label, so the spread is visible rather than averaged away.
function buildAgenticVolume() {
  const wrap = document.getElementById('agentic-volume-wrap');
  if (!wrap) return;
  const rows = (data.agenticVolume || []).map((r) => `
    <tr>
      <td class="num">${r.figure}</td>
      <td class="as-of">${r.window}</td>
      <td>${r.publisher}</td>
      <td class="as-of">${r.label}</td>
    </tr>
  `).join('');
  wrap.innerHTML = hubTableHtml('agentic-volume-table', `
            <th class="num">Published figure</th>
            <th class="as-of">Window</th>
            <th>Publisher</th>
            <th class="as-of">Sourcing status</th>
          `, rows);
}

// Section 10: per-transaction size, the measure that survives the headline
// totals. Kept as callouts because the units are not comparable across rows.
function buildAgenticTicket() {
  const wrap = document.getElementById('agentic-ticket-wrap');
  if (!wrap) return;
  wrap.innerHTML = (data.agenticTicketSize || []).map((t) => statCallout(t.measure, t.value, `${t.publisher}. ${t.note}`)).join('');
  wrap.classList.add('callout-row');
}

// Section 12: honest growth. The counterweight to the forecast chart, computed
// from one aggregator series rather than recalled.
function buildGrowthHonest() {
  const wrap = document.getElementById('growth-honest-wrap');
  if (!wrap) return;
  const g = data.growthHonest;
  if (!g) return;
  wrap.innerHTML = (g.points || []).map((p) => statCallout(p.label, p.value, p.source)).join('');
  wrap.classList.add('callout-row');
  const note = document.getElementById('growth-honest-note');
  if (note) note.textContent = g.note;
}

// Section 12: Arc and OpenUSD status cards, plus the RWA fund table.
function buildBigPlayers() {
  const arc = data.arcStatus;
  const arcEl = document.getElementById('arc-status');
  if (arcEl && arc) {
    arcEl.innerHTML = `
      <div class="callout">
        <div class="callout-label">${arc.name} - ${arc.operator}</div>
        <p class="stat md">${arc.status}</p>
        <p>${strongLead('Launched', `${arc.launched}. Mainnet chain ID ${arc.chainId}; testnet chain ID ${arc.testnetChainId}. Gas paid in ${arc.gas.charAt(0).toLowerCase()}${arc.gas.slice(1)}.`)}</p>
        <p>${arc.verification}</p>
        <p>${arc.caveat}</p>
      </div>
    `;
  }
  const ousd = data.openUsdStatus;
  const ousdEl = document.getElementById('ousd-status');
  if (ousdEl && ousd) {
    // Status is issuer-reported live, not announced-only. The guard-rail
    // paragraphs are required fields: if any is missing, render the claim
    // rather than silently dropping the constraint.
    ousdEl.innerHTML = `
      <div class="callout">
        <div class="callout-label">${ousd.name} - issuer and consortium</div>
        <p class="stat md">${ousd.status}</p>
        <p>${ousd.issuer}</p>
        ${labelledPara('Originally announced', ousd.announced + '.')}
        ${labelledPara('Launch chains', ousd.chains)}
        ${labelledPara('Reserve and supply snapshot', ousd.supplySnapshot)}
        <p class="as-of">${ousd.supplyScope}</p>
        ${labelledPara('Partner economics, not holder yield', ousd.reserveEarnings)}
        ${labelledPara('What a holder actually has', ousd.holderRights)}
        ${labelledPara('Charter status', ousd.charter)}
        <p class="as-of">${ousd.preGuardClaim}</p>
        ${labelledAside('Market reaction', ousd.marketReaction)}
        ${labelledAside('Members confirmed from its own list', ousd.members)}
      </div>
    `;
  }
  const wrap = document.getElementById('rwa-funds-wrap');
  if (!wrap) return;
  const rows = (data.rwaFunds || []).map((r) => `
    <tr>
      <td><strong>${r.product}</strong><div class="as-of">${r.issuer}</div></td>
      <td class="num">${r.size}</td>
      <td class="as-of">${r.asOf}</td>
      <td class="as-of">${r.backing}</td>
      <td class="as-of">${r.note}</td>
    </tr>
  `).join('');
  wrap.innerHTML = hubTableHtml('rwa-funds-table', `
            <th>Product</th>
            <th class="num">Size</th>
            <th class="as-of">As of</th>
            <th class="as-of">What backs it</th>
            <th class="as-of">Note</th>
          `, rows);
}

// Section 12: BUIDL dated secondary reports kept separate, tokenized-value
// depth with distinct denominators, and reserve-income distribution.
function buildRwaDepth() {
  const buidl = document.getElementById('buidl-reports-wrap');
  const b = data.buidlSecondaryReports;
  if (buidl && b) {
    const rows = b.reports.map((r) => `
      <tr>
        <td class="num">${r.figure}</td>
        <td class="as-of">${r.asOf}</td>
        <td class="as-of">${r.source}</td>
      </tr>
    `).join('');
    buidl.innerHTML = `
      <p class="as-of">${b.status}</p>
      <div class="hub-table-wrap">
        <table class="hub-table" id="buidl-reports-table">
          <thead><tr><th class="num">Reported size</th><th class="as-of">Report date</th><th class="as-of">What it is</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="as-of">${b.attributionCorrection}</p>
      <p class="as-of">${b.issuerSide}</p>
      ${labelledPara('What would close it', b.whatWouldCloseIt)}
    `;
  }
  const wrap = document.getElementById('rwa-depth-wrap');
  const d = data.rwaDepth;
  if (wrap && d) {
    wrap.innerHTML = `
      <div class="callout">
        <div class="callout-label">${escHtml(d.headline)}</div>
        ${labelledPara('Reported value', escHtml(d.reportedValue))}
        ${labelledPara('Weekly transfer activity', escHtml(d.transferActivity))}
        ${labelledAside('Why the two percentages differ', escHtml(d.denominatorNote))}
        ${labelledAside('Data dates', escHtml(d.dataDate))}
        ${labelledPara('What this does and does not show', escHtml(d.interpretation))}
        ${labelledPara('DeFi deployment share', escHtml(d.defiShare))}
        ${sourceAside(escHtml(d.notEstablished) + ' ', d.url, 'BeInCrypto (2026-07-02)', ", with the publisher's report landing page dated 2026-05-31.")}
      </div>
    `;
  }
}

function buildDistributionEconomics() {
  const wrap = document.getElementById('distribution-economics-wrap');
  const d = data.distributionEconomics;
  if (!wrap || !d) return;
  wrap.innerHTML = `
    <div class="callout">
      <div class="callout-label">${escHtml(d.headline)}</div>
      ${labelledPara('The incumbent already does this', escHtml(d.incumbent))}
      ${labelledPara('What is actually disclosed', escHtml(d.namedTerms))}
      <p class="as-of">${escHtml(d.caveat)}</p>
      ${labelledPara('The challenger', escHtml(d.challenger))}
      ${labelledPara('Conclusion', escHtml(d.conclusion))}
      ${labelledAside('Still UNRESOLVED', escHtml(d.unresolved))}
      ${sourceAside('', d.circleUrl, "Circle's Form 10-Q for the quarter ended 2026-06-30", ", and Open Standard's stated company structure.")}
    </div>
  `;
}

// Section 13: the open questions this edition could not close. The edition's
// own revision history lives on /research/changelog/, deliberately not here:
// a reader arriving at this page should meet current research, not a diff
// against a previous edition.
function buildOpenQuestions() {
  const open = document.getElementById('open-questions-list');
  if (open) {
    buildAccordion('open-questions-list', data.latestResearchOpen || [], (o) => `
      <p><strong>${o.label} - UNRESOLVED.</strong> ${o.need}</p>
    `);
  }
}

// --- init -----------------------------------------------------------------
async function init() {
  reveals();
  heroCounter();
  stickyToc();
  buildTaxonomy();
  buildCorridors();
  buildDepegs();
  buildRegulation();
  buildRemittanceScenarios();
  buildYieldDebate();
  buildMaturityBands();
  buildBpiCallout();
  buildGeniusStatus();
  buildGeniusReserves();
  buildTreasuryDemand();
  buildMarketCapMeasure();
  buildFloatEconomics();
  buildYieldBan();
  buildAgenticRails();
  buildAgenticVolume();
  buildAgenticTicket();
  buildBigPlayers();
  buildGrowthHonest();
  buildRwaDepth();
  buildDistributionEconomics();
  buildOpenQuestions();
  remittanceCalc();
  raceBars();
  buildFreshnessBadge();
  buildFooterLists();
  // CSV export buttons
  const csvBtn = document.getElementById('export-tokens-csv');
  if (csvBtn) csvBtn.addEventListener('click', () => exportTableCsv('token-table', 'stablesense-tokens.csv'));
  try {
    await Promise.all([taxonomyChart(), scaleChart(), forecastChart(), treasuryChart(), dollarizationChart(), realityChart()]);
    // Constructing 6 charts back-to-back via Promise.all appears to race
    // Chart.js's own ResizeObserver-driven initial sizing: each canvas's
    // width can get stuck at its pre-layout 0px reading and never receive
    // the automatic correction pass. Forcing one resize() per instance once
    // everything is settled reliably fixes it. Deliberately not wrapped in
    // requestAnimationFrame: rAF is throttled or fully suspended on
    // backgrounded/non-composited tabs in most browsers, which would make
    // this fix silently no-op in exactly the situations it needs to run.
    // setTimeout is not subject to the same throttling.
    const Chart = await loadChartJs();
    setTimeout(() => {
      Object.values(Chart.instances || {}).forEach((inst) => inst.resize());
    }, 0);
  } catch (e) { console.error('chart init error', e); }
}

let resizeDebounce;
window.addEventListener('resize', () => {
  clearTimeout(resizeDebounce);
  resizeDebounce = setTimeout(() => {
    loadChartJs().then((Chart) => {
      Object.values(Chart.instances || {}).forEach((inst) => inst.resize());
    });
  }, 150);
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();