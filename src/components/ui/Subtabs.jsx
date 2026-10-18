export default function Subtabs({ items = [], value = null, onChange = () => {}, ariaLabel = 'Views' }) {
  const move = (e, dir) => {
    const tabs = Array.from(e.currentTarget.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;
    const active = document.activeElement;
    let index = tabs.indexOf(active);
    if (index < 0) {
      index = tabs.findIndex((el) => el.dataset.id === String(value));
      if (index < 0) index = dir > 0 ? -1 : 0;
    }
    const next = (index + dir + tabs.length) % tabs.length;
    const el = tabs[next];
    if (el) {
      el.focus();
      onChange(el.dataset.id);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      move(e, 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      move(e, -1);
    }
  };

  return (
    <div class="segmented subtabs" role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            data-id={item.id}
            id={`subtab-${item.id}`}
            aria-selected={selected ? 'true' : 'false'}
            aria-controls={`subtab-panel-${item.id}`}
            tabIndex={selected ? 0 : -1}
            class={selected ? 'selected' : ''}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
