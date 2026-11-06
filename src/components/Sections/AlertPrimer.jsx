import { getActiveCoins } from '../../utils/coin-config.js';
/**
 * Empty-state primer for zero active alerts.
 * Positive framing + four short rule cards with Learn links.
 */
export default function AlertPrimer({ compact = false, onLearn }) {
  const go = (lessonId) => {
    if (typeof onLearn === 'function') onLearn(lessonId);
  };

  return (
    <div class="alert-primer">
      <div class="alert-primer-title">No alerts are displayed.</div>
      <p class="alert-primer-body">
        An empty feed is not proof of normal market conditions. Missing or partial observations can prevent alert generation. Check data freshness before interpreting this view.
        {compact ? null : ' Current warnings are calculated from source readings; historical Helix events are separate.'}
      </p>
      {compact ? (
        <p class="alert-primer-body">
          <strong>PEG_BREAK</strong>, <strong>CHAIN_FLOW</strong>, <strong>MIGRATION</strong>, <strong>NET_MINT</strong>/<strong>NET_BURN</strong>, and <strong>DOM_SHIFT</strong> describe the monitored rules, not evidence that each rule had usable inputs in this refresh.
        </p>
      ) : (
      <div class="alert-rule-cards" aria-label="Alert rules checked">
        <article class="alert-rule-card">
          <b>PEG_BREAK</b>
          <p>Flags a price deviation from $1. One basis point is 0.01%. {getActiveCoins().map(({ symbol, thresholds: t }) => `${symbol}: watch ${(t.pegWarnBps / 100).toFixed(2)}%, high ${(t.pegWarnBps * 2 / 100).toFixed(2)}%, critical ${(t.pegCriticalBps / 100).toFixed(2)}%.`).join(' ')}</p>
          <a href="#lesson-peg-mechanics" onClick={(e) => { e.preventDefault(); go('peg-mechanics'); }}>Learn pegs</a>
        </article>
        <article class="alert-rule-card">
          <b>CHAIN_FLOW</b>
          <p>Fires when one chain shows a large circulating-supply move that is not paired as a migration.</p>
          <a href="#lesson-read-dashboard" onClick={(e) => { e.preventDefault(); go('read-dashboard'); }}>Learn signals</a>
        </article>
        <article class="alert-rule-card">
          <b>MIGRATION</b>
          <p>Records routine activity when two chains move similar amounts in opposite directions, with net supply broadly unchanged. This does not prove a transfer.</p>
          <a href="#lesson-read-dashboard" onClick={(e) => { e.preventDefault(); go('read-dashboard'); }}>Learn signals</a>
        </article>
        <article class="alert-rule-card">
          <b>NET_MINT / NET_BURN</b>
          <p>Fires when a coin's net circulating USD across chains clears the issuance threshold.</p>
          <a href="#lesson-supply-market-cap" onClick={(e) => { e.preventDefault(); go('supply-market-cap'); }}>Learn supply</a>
        </article>
        <article class="alert-rule-card">
          <b>DOM_SHIFT</b>
          <p>Records activity when a coin's share of tracked supply moves by about a point or more in a week.</p>
          <a href="#lesson-read-dashboard" onClick={(e) => { e.preventDefault(); go('read-dashboard'); }}>Learn signals</a>
        </article>
      </div>
      )}
    </div>
  );
}
