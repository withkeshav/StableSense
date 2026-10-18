/**
 * Chain distribution panel: share of tracked supply per chain, with the chains CTA.
 */
export default function ChainDistributionPanel({ symbol, chainShares, setActiveTab }) {
  return (
    <article class="panel glass chain-panel">
      <header class="panel-head">
        <div>
          <p class="panel-kicker">WHERE IT MOVES</p>
          <h2>Chain distribution</h2>
          <p class="panel-sub">Share of {symbol} supply across the chains tracked here</p>
        </div>
      </header>
      <div class="chain-list">
        {chainShares.length ? chainShares.map((r, idx) => (
          <div key={r.chain}>
            <span><i class={`chain-dot ${['one', 'two', 'three', 'four'][idx] || 'one'}`} />{r.chain}</span>
            <b>{r.pct}%</b>
            <em style={{ width: `${r.pct}%` }} />
          </div>
        )) : <div class="info-empty">No chain rows</div>}
      </div>
      <footer class="chart-footer">
        <span>Top chains by circulating supply</span>
        {setActiveTab ? (
          <button type="button" onClick={() => setActiveTab('chains')}>Explore chains</button>
        ) : null}
      </footer>
    </article>
  );
}
