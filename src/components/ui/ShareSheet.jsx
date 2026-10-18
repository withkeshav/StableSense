import { useEffect, useRef, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { BrandWordmark } from '../BrandMark.jsx';
import { SHARE_FORMATS, shareSignalCard, shareTextIssues } from '../../utils/shareChart.js';

const FORMAT_LIST = Object.entries(SHARE_FORMATS).map(([id, f]) => ({
  id,
  title: f.label,
  ratio: f.ratio,
}));

export default function ShareSheet({
  open,
  onClose,
  chartInstance,
  title,
  rangeLabel,
  rangeDetail,
  interpretation,
  definition,
  sourceLabel,
  highlight = '',
  sourceUrl = 'stablesense.withkeshav.com',
  asOf = null,
}) {
  const [format, setFormat] = useState('square');
  const [previewOpen, setPreviewOpen] = useState(false);
  const sheetRef = useRef(null);
  const closeRef = useRef(null);
  const scrollerRef = useRef(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [cardTheme, setCardTheme] = useState(() => {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const readTheme = () => {
      setCardTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    };
    readTheme();
    const observer = new MutationObserver(readTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open || !chartInstance?.canvas) {
      setPreviewSrc(null);
      return undefined;
    }
    try {
      setPreviewSrc(chartInstance.canvas.toDataURL('image/png'));
    } catch {
      setPreviewSrc(null);
    }
    return undefined;
  }, [open, chartInstance, format, cardTheme]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !sheetRef.current) return;
      const focusable = sheetRef.current.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('sheet-open');
    setPreviewOpen(false);
    queueMicrotask(() => {
      closeRef.current?.focus?.();
      if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
      if (sheetRef.current) sheetRef.current.scrollTop = 0;
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      document.body.classList.remove('sheet-open');
    };
  }, [open, onClose]);

  if (!open) return null;

  const current = FORMAT_LIST.find((item) => item.id === format) || FORMAT_LIST[1];
  // Prefer the chart's data timestamp ("as of" the data). A missing clock is
  // stated as unavailable; the browser time is not an observation. Always
  // render in UTC so exports match formatUtc provenance elsewhere.
  const asOfDate = asOf == null ? null : new Date(asOf);
  const stamp = !asOfDate || Number.isNaN(asOfDate.getTime()) ? 'as of unavailable' : asOfDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });
  // A card with a generic title or an empty read states a claim the chart does
  // not support. Refuse to export it and name the missing fields.
  const issues = shareTextIssues({ title, rangeLabel, rangeDetail, interpretation, definition, sourceLabel });
  const read = interpretation;

  const download = () => {
    if (!chartInstance || issues.length) return;
    shareSignalCard(chartInstance, {
      title,
      rangeLabel,
      rangeDetail,
      interpretation,
      definition,
      sourceLabel,
      highlight,
      timestamp: stamp,
      sourceUrl,
    }, format, cardTheme);
  };

  // Portal to body: the chart lives inside a glass panel whose backdrop-filter
  // makes it a containing block for position:fixed, which trapped this overlay
  // to the panel width and squeezed the preview card.
  return createPortal(
    <div
      class="share-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Share as Signal Card"
      onMouseDown={onClose}
    >
      <section class="share-sheet" ref={sheetRef} onMouseDown={(e) => e.stopPropagation()}>
        <header>
          <div>
            <p class="panel-kicker">SHARE AS SIGNAL CARD</p>
            <h2>Make the chart make sense.</h2>
            <p>A ready-to-share chart with the context a reader needs.</p>
          </div>
          <button
            type="button"
            class="close-share"
            ref={closeRef}
            onClick={onClose}
            aria-label="Close share sheet"
          >
            <span aria-hidden="true">×</span>
            <span class="close-share-label">Close</span>
          </button>
        </header>
        <div class="share-content" ref={scrollerRef}>
          {issues.length ? (
            <div class="share-text-error" role="alert">
              <p class="panel-kicker">CARD TEXT INCOMPLETE</p>
              <p>
                This chart is missing: {issues.join(', ')}. It will not be exported until the
                title, range, interpretation and definition are real.
              </p>
            </div>
          ) : (
          <div class={`share-preview ${previewOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              class="share-preview-toggle"
              aria-expanded={previewOpen ? 'true' : 'false'}
              onClick={() => setPreviewOpen((v) => !v)}
            >
              {previewOpen ? 'Hide card preview' : 'Preview card'}
            </button>
            <div class={`signal-card ${format} signal-card-social ${cardTheme === 'dark' ? 'is-dark' : ''}`} style={{ aspectRatio: current.ratio.replace(' / ', '/') }}>
              <div class="signal-card-top">
                <BrandWordmark size={22} />
                <span>{String(rangeLabel).toUpperCase()}</span>
              </div>
              <div class="signal-card-copy">
                <p>{String(title).toUpperCase()}</p>
                <h3>{read}</h3>
                {highlight ? <strong>{highlight}</strong> : null}
              </div>
              <div class="signal-card-chart">
                {previewSrc ? (
                  <img class="signal-card-chart-preview" src={previewSrc} alt={`${title} chart preview`} />
                ) : (
                  <p class="signal-card-chart-note">The chart preview appears after the chart renders.</p>
                )}
              </div>
              <div class="signal-card-meta">
                <span>
                  <b>What this measures</b>
                  {definition}
                </span>
                <span>
                  <b>As of</b>
                  {stamp}
                </span>
              </div>
              <div class="signal-card-meta signal-card-meta-2">
                <span>
                  <b>Range</b>
                  {rangeDetail}
                </span>
                <span>
                  <b>Source</b>
                  {sourceLabel}
                </span>
              </div>
              <footer>
                <span>{sourceUrl}</span>
                <span>Research, not advice</span>
              </footer>
            </div>
          </div>
          )}
          <aside class="share-controls">
            <div>
              <p class="panel-kicker">FORMAT</p>
              <div class="format-list" role="group" aria-label="Signal Card format">
                {FORMAT_LIST.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    class={format === item.id ? 'active' : ''}
                    onClick={() => setFormat(item.id)}
                  >
                    <span class={`format-icon ${item.id}`} />
                    <span>
                      <b>{item.title}</b>
                      <small>Optimized for sharing</small>
                    </span>
                  </button>
                ))}
              </div>
              <p class="share-theme-note">Card theme: <b>{cardTheme === 'dark' ? 'Dark' : 'Light'}</b> (matches the dashboard)</p>
            </div>
            <div class="share-read">
              <p class="panel-kicker">SIGNAL READ</p>
              <p>{issues.length ? 'Unavailable until the chart supplies real share text.' : read}</p>
            </div>
          </aside>
        </div>
        <div class="share-sheet-actions">
          <button type="button" class="primary-btn download-btn" onClick={download} disabled={!chartInstance || issues.length > 0}>
            Download Signal Card
          </button>
          <p class="share-note">Includes date, source context, and StableSense branding.</p>
        </div>
      </section>
    </div>,
    document.body
  );
}
