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
    interpretation: 'interpretation',
    definition: 'definition',
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

// Fixed light social palette. The card is a screenshot meant to read the same
// in every feed, so it must not inherit the viewer's theme.
const BG0 = '#fbfcfd';
const BG1 = '#ecf4fb';
const INK = '#1b2d41';
const SOFT = '#5d7289';
const FAINT = '#7590aa';
const LINE = '#d5e3ef';
const ACCENT = '#2e79dd';
const PLOT_BG = '#ffffff';
const PLOT_LINE = '#dbe7f2';

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

function drawBrandMark(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 64;
  ctx.scale(s, s);
  ctx.strokeStyle = '#5B9CFF';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(32, 34, 22, 14, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.65;
  ctx.strokeStyle = '#286FCF';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(32, 30, 16, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#5B9CFF';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(10, 34);
  ctx.bezierCurveTo(18, 30, 24, 28, 32, 28);
  ctx.bezierCurveTo(40, 28, 46, 30, 54, 34);
  ctx.stroke();
  ctx.fillStyle = '#5B9CFF';
  ctx.beginPath();
  ctx.arc(32, 34, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * @param {object} chartInstance Chart.js instance
 * @param {object} meta
 * @param {string} meta.title
 * @param {string} meta.rangeLabel
 * @param {string} meta.interpretation
 * @param {string} meta.definition
 * @param {string} [meta.timestamp]
 * @param {string} [meta.sourceUrl]
 * @param {string} formatKey story|square|landscape
 */
export function shareSignalCard(chartInstance, meta, formatKey) {
  requireShareText(meta);
  const fmt = SHARE_FORMATS[formatKey] || SHARE_FORMATS.landscape;
  const pad = Math.round(fmt.w * 0.055);
  const bg0 = BG0;
  const bg1 = BG1;
  const ink = INK;
  const soft = SOFT;
  const faint = FAINT;
  const line = LINE;
  const accent = ACCENT;

  const off = document.createElement('canvas');
  off.width = fmt.w;
  off.height = fmt.h;
  const ctx = off.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, fmt.w, fmt.h);
  grad.addColorStop(0, bg0);
  grad.addColorStop(1, bg1);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, fmt.w, fmt.h);

  const wash = ctx.createRadialGradient(fmt.w * 0.94, 0, 0, fmt.w * 0.94, 0, fmt.w * 0.45);
  wash.addColorStop(0, 'rgba(116,178,255,0.32)');
  wash.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, fmt.w, fmt.h);

  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 18, 18, fmt.w - 36, fmt.h - 36, 28);
  ctx.stroke();

  const markSize = Math.round(fmt.w * 0.042);
  drawBrandMark(ctx, pad, pad * 0.85, markSize);
  ctx.fillStyle = ink;
  ctx.font = `800 ${Math.round(fmt.w * 0.028)}px Manrope, Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('stable', pad + markSize + 12, pad + markSize * 0.62);
  const senseW = ctx.measureText('stable').width;
  ctx.fillStyle = accent;
  ctx.fillText('sense', pad + markSize + 12 + senseW, pad + markSize * 0.62);

  ctx.fillStyle = faint;
  ctx.font = `800 ${Math.round(fmt.w * 0.014)}px Manrope, Arial, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(String(meta.rangeLabel).toUpperCase(), fmt.w - pad, pad + markSize * 0.55);

  let y = pad + markSize + Math.round(fmt.h * 0.04);
  ctx.textAlign = 'left';
  ctx.fillStyle = faint;
  ctx.font = `800 ${Math.round(fmt.w * 0.012)}px Manrope, Arial, sans-serif`;
  ctx.fillText(String(meta.title).toUpperCase(), pad, y);

  y += Math.round(fmt.h * 0.035);
  const titleSize = Math.round(fmt.w * (formatKey === 'story' ? 0.052 : 0.038));
  ctx.fillStyle = ink;
  ctx.font = `800 ${titleSize}px Manrope, Arial, sans-serif`;
  wrapText(ctx, meta.interpretation, pad, y, fmt.w - pad * 2, Math.round(titleSize * 1.15), 3);

  y += Math.round(titleSize * 1.15 * 3) + 8;
  if (meta.highlight) {
    ctx.fillStyle = soft;
    ctx.font = `700 ${Math.round(fmt.w * 0.016)}px Manrope, Arial, sans-serif`;
    ctx.fillText(meta.highlight, pad, y);
    y += Math.round(fmt.h * 0.025);
  }

  const chartCanvas = chartInstance?.canvas;
  const footerH = Math.round(fmt.h * 0.12);
  const metaH = Math.round(fmt.h * 0.08);
  const chartTop = y + 8;
  const chartBottom = fmt.h - footerH - metaH - pad;
  const chartBoxH = Math.max(120, chartBottom - chartTop);
  const chartBoxW = fmt.w - pad * 2;

  // A fixed white plot panel keeps the chart legible on a light card even when
  // the viewer's dashboard is in dark mode.
  ctx.fillStyle = PLOT_BG;
  drawRoundedRect(ctx, pad, chartTop, chartBoxW, chartBoxH, 14);
  ctx.fill();
  ctx.strokeStyle = PLOT_LINE;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (chartCanvas) {
    const plotInset = 8;
    const innerW = chartBoxW - plotInset * 2;
    const innerH = chartBoxH - plotInset * 2;
    const ratio = Math.min(innerW / chartCanvas.width, innerH / chartCanvas.height);
    const dw = chartCanvas.width * ratio;
    const dh = chartCanvas.height * ratio;
    const dx = pad + plotInset + (innerW - dw) / 2;
    const dy = chartTop + plotInset + (innerH - dh) / 2;
    ctx.drawImage(chartCanvas, dx, dy, dw, dh);
  }

  const metaY = fmt.h - footerH - metaH + 10;
  ctx.fillStyle = faint;
  ctx.font = `800 ${Math.round(fmt.w * 0.011)}px Manrope, Arial, sans-serif`;
  ctx.fillText('WHAT THIS MEASURES', pad, metaY);
  ctx.textAlign = 'right';
  ctx.fillText('AS OF', fmt.w - pad, metaY);
  ctx.textAlign = 'left';
  ctx.font = `600 ${Math.round(fmt.w * 0.013)}px Manrope, Arial, sans-serif`;
  ctx.fillStyle = soft;
  wrapText(ctx, meta.definition, pad, metaY + Math.round(fmt.h * 0.022), fmt.w * 0.48, Math.round(fmt.h * 0.018), 2);
  ctx.textAlign = 'right';
  ctx.fillText(meta.timestamp || new Date().toISOString(), fmt.w - pad, metaY + Math.round(fmt.h * 0.022));

  ctx.strokeStyle = line;
  ctx.beginPath();
  ctx.moveTo(pad, fmt.h - footerH);
  ctx.lineTo(fmt.w - pad, fmt.h - footerH);
  ctx.stroke();

  ctx.fillStyle = faint;
  ctx.font = `600 ${Math.round(fmt.w * 0.014)}px Manrope, Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(meta.sourceUrl || 'stablesense.withkeshav.com', pad, fmt.h - pad * 0.75);
  ctx.textAlign = 'right';
  ctx.fillText('StableSense · Research, not advice', fmt.w - pad, fmt.h - pad * 0.75);

  const safeTitle = String(meta.title).replace(/[^\w.-]+/g, '-').slice(0, 48);
  download(off, `StableSense-${safeTitle}-${formatKey}.png`);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text).split(/\s+/);
  let line = '';
  let lines = 0;
  for (let i = 0; i < words.length; i += 1) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight);
      lines += 1;
      line = words[i];
      if (lines >= maxLines - 1) {
        let rest = words.slice(i).join(' ');
        while (ctx.measureText(`${rest}…`).width > maxWidth && rest.length > 1) {
          rest = rest.slice(0, -1);
        }
        ctx.fillText(`${rest}${rest.endsWith('…') ? '' : '…'}`, x, y + lines * lineHeight);
        return;
      }
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y + lines * lineHeight);
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

