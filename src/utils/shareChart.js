// Client-only chart share-as-Signal-Card utility.
// Composites a Chart.js canvas onto an offscreen canvas with branded context.
// No server, no storage, no analytics.

export const SHARE_FORMATS = {
  story: { w: 1080, h: 1920, label: 'Story 9:16', ratio: '9 / 16' },
  square: { w: 1080, h: 1080, label: 'Square 1:1', ratio: '1 / 1' },
  landscape: { w: 1920, h: 1080, label: 'Landscape 16:9', ratio: '16 / 9' },
};

/**
 * Required share text. A card with a generic title, an empty interpretation or
 * a filler definition is worse than no card: it states a claim the chart does
 * not support. Callers must supply all four fields explicitly.
 * @param {object} meta
 * @returns {string[]} Missing or blank field names, empty when complete.
 */
export function shareTextIssues(meta = {}) {
  const fields = {
    title: 'title',
    rangeLabel: 'range',
    rangeDetail: 'range detail',
    interpretation: 'interpretation',
    definition: 'definition',
    sourceLabel: 'source',
  };
  const issues = [];
  for (const [key, label] of Object.entries(fields)) {
    const value = meta?.[key];
    if (typeof value !== 'string' || !value.trim()) issues.push(label);
  }
  return issues;
}

function requireShareText(meta) {
  const issues = shareTextIssues(meta);
  if (issues.length) {
    throw new Error(`Signal card text incomplete: missing ${issues.join(', ')}`);
  }
}

// The card follows the dashboard theme. The chart canvas is already rendered
// in that theme, so the card surface, type and plot panel must match it.
const CARD_THEMES = {
  light: {
    bg0: '#F7F5F2',
    ink: '#172535',
    soft: '#5E6C79',
    line: '#d5e3ef',
    accent: '#468BF0',
    plotBg: '#ffffff',
    markOuter: '#5B9CFF',
    markInner: '#286FCF',
    markDot: '#5B9CFF',
  },
  dark: {
    bg0: '#141e28',
    ink: '#edf4fb',
    soft: '#b7c5d4',
    line: '#263645',
    accent: '#72afff',
    plotBg: '#141e28',
    markOuter: '#72afff',
    markInner: '#9bc6ff',
    markDot: '#72afff',
  },
};

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawBrandMark(ctx, x, y, size, palette) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 64;
  ctx.scale(s, s);
  ctx.strokeStyle = palette.markOuter;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(32, 34, 22, 14, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.65;
  ctx.strokeStyle = palette.markInner;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(32, 30, 16, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = palette.markOuter;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(10, 34);
  ctx.bezierCurveTo(18, 30, 24, 28, 32, 28);
  ctx.bezierCurveTo(40, 28, 46, 30, 54, 34);
  ctx.stroke();
  ctx.fillStyle = palette.markDot;
  ctx.beginPath();
  ctx.arc(32, 34, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * @param {object} chartInstance Chart.js instance
 * @param {object} meta
 * @param {string} meta.title
 * @param {string} meta.rangeLabel Short range token, for example "~90D".
 * @param {string} meta.rangeDetail Exact start and end, for example "20 Jul to 18 Oct 2026".
 * @param {string} meta.interpretation
 * @param {string} meta.definition What it measures, scope and exclusions.
 * @param {string} meta.sourceLabel Data source, for example "Helix daily supply history".
 * @param {string} [meta.timestamp] As-of date and time.
 * @param {string} [meta.sourceUrl]
 * @param {string} formatKey story|square|landscape
 * @param {string} [theme='light'] light|dark, matching the dashboard theme.
 */
export function renderSignalCard(chartInstance, meta, formatKey, theme = 'light') {
  requireShareText(meta);
  const fmt = SHARE_FORMATS[formatKey] || SHARE_FORMATS.landscape;
  const palette = CARD_THEMES[theme] || CARD_THEMES.light;
  const wide = formatKey === 'landscape';
  const tall = formatKey === 'story';
  const pad = 60;
  const width = fmt.w - 2 * pad;
  const off = document.createElement('canvas');
  off.width = fmt.w;
  off.height = fmt.h;
  const ctx = off.getContext('2d');
  ctx.fillStyle = palette.bg0;
  ctx.fillRect(0, 0, fmt.w, fmt.h);
  ctx.fillStyle = palette.accent;
  ctx.fillRect(pad, 0, 88, 6);

  const text = (value, x, y, w, size, color = palette.ink, weight = 600, maxLines = 8) => {
    let fontSize = size;
    ctx.textAlign = 'left';
    ctx.fillStyle = color;
    ctx.font = `${weight} ${fontSize}px Manrope, Arial, sans-serif`;
    while (fontSize > 16 && textLineCount(ctx, value, w) > maxLines) {
      fontSize -= 1;
      ctx.font = `${weight} ${fontSize}px Manrope, Arial, sans-serif`;
    }
    // Do not silently cut source credits, dates, or factual caveats.
    const count = textLineCount(ctx, value, w);
    if (count > maxLines) throw new Error('Signal card text exceeds available space');
    return wrapText(ctx, value, x, y, w, fontSize * 1.4, maxLines) * fontSize * 1.4;
  };
  drawBrandMark(ctx, pad - 8, 48, 48, palette);
  ctx.font = '800 32px Manrope, Arial, sans-serif';
  ctx.fillStyle = palette.ink;
  ctx.fillText('stable', pad + 46, 84);
  const brandWidth = ctx.measureText('stable').width;
  ctx.fillStyle = palette.accent;
  ctx.fillText('sense', pad + 46 + brandWidth, 84);
  ctx.fillStyle = palette.line;
  ctx.fillRect(pad, 116, width, 1);

  const copyW = wide ? 540 : width;
  let y = 170;
  y += text(meta.title, pad, y, copyW, wide ? 38 : 32, palette.accent, 700, 2) + 18;
  y += text(meta.interpretation, pad, y, copyW, wide ? 42 : tall ? 52 : 38, palette.ink, 800, wide ? 8 : tall ? 6 : 4);
  if (meta.highlight) {
    y += 16;
    y += text(meta.highlight, pad, y, copyW, 22, palette.soft, 500, 2);
  }

  const plotX = wide ? 680 : pad;
  const plotY = wide ? 156 : y + 24;
  const plotW = wide ? fmt.w - plotX - pad : width;
  const plotBottom = tall ? 1260 : wide ? 740 : 720;
  const plotH = plotBottom - plotY;
  if (plotH < 160) throw new Error('Signal card has insufficient chart space');
  ctx.fillStyle = palette.plotBg;
  drawRoundedRect(ctx, plotX, plotY, plotW, plotH, 12);
  ctx.fill();
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  const canvas = chartInstance?.canvas;
  if (canvas?.width && canvas?.height) {
    const ratio = Math.min((plotW - 32) / canvas.width, (plotH - 32) / canvas.height);
    const w = canvas.width * ratio, h = canvas.height * ratio;
    ctx.drawImage(canvas, plotX + (plotW - w) / 2, plotY + (plotH - h) / 2, w, h);
  }

  const detailY = tall ? 1320 : 774;
  const detailW = wide ? width * 0.48 : width;
  text(meta.definition, pad, detailY, detailW, 22, palette.soft, 500, 3);
  const datesX = wide ? 1040 : pad;
  const datesY = wide ? detailY : tall ? 1470 : 868;
  const datesW = wide ? fmt.w - datesX - pad : width;
  text(meta.rangeDetail, datesX, datesY, datesW, 20, palette.soft, 500, 2);
  text(`Observed: ${meta.timestamp || 'unavailable'}`, datesX, datesY + 58, datesW, 20, palette.soft, 500, 1);

  const footerY = fmt.h - 124;
  ctx.fillStyle = palette.line;
  ctx.fillRect(pad, footerY, width, 1);
  text(shareAttribution(meta), pad, footerY + 38, width, 24, palette.ink, 700, 1);
  text(meta.sourceLabel, pad, footerY + 68, width, 18, palette.soft, 500, 1);
  const bottomY = fmt.h - 24;
  text(meta.sourceUrl || 'stablesense.withkeshav.com', pad, bottomY, width * 0.65, 18, palette.soft, 500, 1);
  ctx.textAlign = 'right';
  ctx.font = '500 18px Manrope, Arial, sans-serif';
  ctx.fillStyle = palette.soft;
  ctx.fillText('Research, not advice', fmt.w - pad, bottomY);

  return off;
}

/** Platform credit stays separate from the original chart data source. */
export function shareAttribution(meta = {}) {
  return meta.sourceLabel?.startsWith('CoinGecko ')
    ? 'Powered by Helix · Powered by CoinGecko'
    : 'Powered by Helix';
}

export function downloadSignalCard(canvas, meta, formatKey, theme) {
  const safeTitle = String(meta.title).replace(/[^\w.-]+/g, '-').slice(0, 48);
  download(canvas, `StableSense-${safeTitle}-${formatKey}-${theme}.png`);
}

/**
 * Trim a single line to fit a width, adding an ellipsis. Used for the as-of and
 * source lines, which must stay on one line.
 */
function fitText(ctx, text, maxWidth) {
  let value = String(text || '');
  if (ctx.measureText(value).width <= maxWidth) return value;
  while (value.length > 1 && ctx.measureText(`${value}…`).width > maxWidth) {
    value = value.slice(0, -1);
  }
  return `${value.replace(/[.,;:!?\s]+$/, '')}…`;
}

/**
 * Wrap text and return the number of lines drawn, so the caller can place the
 * next block without guessing. A truncated line drops its trailing punctuation
 * before the ellipsis, so a sentence ending in "." does not render as "..…".
 * @returns {number} Lines drawn, at least 1.
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const lines = [];
  let line = '';
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines) visible[maxLines - 1] = fitText(ctx, lines.slice(maxLines - 1).join(' '), maxWidth);
  visible.forEach((value, i) => ctx.fillText(value, x, y + i * lineHeight));
  return Math.max(1, visible.length);
}

function download(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}


function textLineCount(ctx, text, width) {
  let line = '', count = 1;
  for (const word of String(text).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) { count += 1; line = word; }
    else line = next;
  }
  return count;
}
