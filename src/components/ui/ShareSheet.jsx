import { useEffect, useRef, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { SHARE_FORMATS, renderSignalCard, downloadSignalCard, shareAttribution } from '../../utils/shareChart.js';

const FORMAT_LIST = Object.entries(SHARE_FORMATS).map(([id, f]) => ({
  id,
  title: f.label,
  ratio: f.ratio,
}));

export default function ShareSheet({ snapshot, onClose }) {
  const { canvas, meta, theme: cardTheme } = snapshot;
  const { title, interpretation: read } = meta;
  const open = true;
  const [format, setFormat] = useState('square');
  const [previewOpen, setPreviewOpen] = useState(false);
  const sheetRef = useRef(null);
  const closeRef = useRef(null);
  const scrollerRef = useRef(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const exportRef = useRef(null);
  const [previewError, setPreviewError] = useState(false);
  useEffect(() => {
    try {
      const card = renderSignalCard({ canvas }, meta, format, cardTheme);
      exportRef.current = card;
      setPreviewSrc(card.toDataURL('image/png'));
      setPreviewError(false);
    } catch {
      exportRef.current = null;
      setPreviewSrc(null);
      setPreviewError(true);
    }
  }, [canvas, meta, format, cardTheme]);

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

  const download = () => {
    if (exportRef.current) downloadSignalCard(exportRef.current, meta, format, cardTheme);
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
            <h2>Share this observation.</h2>
            <p>Your chart, its measured context, and a clear source credit.</p>
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
          <div class={`share-preview ${previewOpen ? 'is-open' : ''}`}>
            <button type="button" class="share-preview-toggle" aria-expanded={previewOpen ? 'true' : 'false'} onClick={() => setPreviewOpen((v) => !v)}>
              {previewOpen ? 'Hide card preview' : 'Preview card'}
            </button>
            {previewError ? <p role="alert">This observation does not fit this format. Choose another size to keep all its context.</p> : null}
            {previewSrc ? <img class="signal-card-export-preview" src={previewSrc} alt={`${title}. ${read}`} /> : null}
          </div>
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
              <p class="share-theme-note">{shareAttribution(meta)}</p>
              <p class="share-theme-note">Card theme: <b>{cardTheme === 'dark' ? 'Dark' : 'Light'}</b> (matches the dashboard)</p>
            </div>
            <div class="share-read">
              <p class="panel-kicker">SIGNAL READ</p>
              <p>{read}</p>
            </div>
          </aside>
        </div>
        <div class="share-sheet-actions">
          <button type="button" class="primary-btn download-btn" onClick={download} disabled={!previewSrc}>
            Download Signal Card
          </button>
          <p class="share-note">Built from this chart, without AI. This card is a snapshot; reopen Share after refreshing for new data.</p>
        </div>
      </section>
    </div>,
    document.body
  );
}
