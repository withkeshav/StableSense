/**
 * Asset identity block: token mark, classification eyebrow, name and thesis.
 */
export function AssetIdentity({ symbol, meta, color }) {
  return (
    <div class="asset-identity">
      <span class="asset-token" style={{ background: `linear-gradient(145deg, ${color}, ${color}cc)` }}>
        {symbol.slice(0, 1)}
      </span>
      <div>
        <p class="eyebrow">TRACKED ASSET · {meta.classification.toUpperCase()}</p>
        <h1>
          {meta.name} <em>{symbol}</em>
        </h1>
        <p>{meta.thesis}</p>
      </div>
    </div>
  );
}

/**
 * "What to watch" note beside the identity block.
 */
export function AssetWatchNote({ watchNote }) {
  return (
    <div class="asset-watch">
      <span>WHAT TO WATCH</span>
      <b>{watchNote}</b>
      <p>Observation only - not a recommendation.</p>
    </div>
  );
}

/**
 * Hero wrapper: identity on the left, the watch note on the right.
 */
export default function AssetHero({ symbol, meta, color, watchNote }) {
  return (
    <section class="asset-hero glass signal-lens">
      <AssetIdentity symbol={symbol} meta={meta} color={color} />
      <AssetWatchNote watchNote={watchNote} />
    </section>
  );
}
