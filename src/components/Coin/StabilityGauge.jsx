/**
 * Compact stability gauge. Kept separate from the old hero component so the
 * coin page can use it without bringing the retired hero back.
 */
export function StabilityGauge({ value = null }) {
  const measured = typeof value === 'number' && Number.isFinite(value);
  const score = measured ? Math.max(0, Math.min(100, value)) : null;
  const offset = measured ? 358 - (358 * score / 100) : 358;
  return (
    <div class="gauge-wrap">
      <svg viewBox="0 0 150 150" class="gauge" aria-label={measured ? `Peg Stability Index: ${score} out of 100` : 'Peg Stability Index: UNKNOWN'}>
        <circle cx="75" cy="75" r="57" class="gauge-track" />
        <circle cx="75" cy="75" r="57" class="gauge-value" stroke-dasharray="358" stroke-dashoffset={offset} />
        <circle cx="75" cy="75" r="43" class="gauge-inner" />
      </svg>
      <div class="gauge-copy">
        <strong>{measured ? score : '-'}</strong>
        <span>{measured ? 'of 100' : 'UNKNOWN'}</span>
      </div>
    </div>
  );
}
