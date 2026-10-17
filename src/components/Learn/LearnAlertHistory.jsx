/**
 * Persisted alert-history card: the stored event log, or the honest empty state.
 */
export default function LearnAlertHistory({ alertSource, alertHistory }) {
  return (
    <section class="card mb-4">
      <div class="card-header">
        <div class="card-title">Persisted alert history</div>
      </div>
      <div class="card-body">
        {alertSource !== 'canonical' || !alertHistory.length ? (
          <p class="mb-0 text-muted small">
            No stored alert events yet. The event table starts empty on a new backend and is not backfilled with invented history. Current Alerts may still show live derivation until the first stress job writes rows.
          </p>
        ) : (
          <div class="learn-alert-history">
            {alertHistory.slice(0, 12).map((event) => (
              <article key={event.id} class="learn-history-row">
                <strong>{event.rule}</strong>
                <span>{event.coin} · {event.state || 'open'} · {event.id}</span>
                <p>{event.headline || event.rationale}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
