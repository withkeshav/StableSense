import { fmtB, fmtPct } from '../../utils/formatters.js';

/**
 * Per-chain supply table, with a card layout under the mobile breakpoint.
 * Both layouts carry the same rows and the same hyphen for unknown change.
 */
export default function ChainSupplyTable({ symbol, rows }) {
  return (
    <div class="card">
      <div class="card-header"><div class="card-title">{symbol} by Chain</div></div>
      <div class="card-body p0">
        <div class="chain-table-desktop tbl-wrap">
          <table class="data-table">
            <thead><tr><th>Chain</th><th>Supply</th><th>1d %</th></tr></thead>
            <tbody>
              {rows.length ? rows.slice(0, 8).map((r) => (
                <tr key={r.chain}>
                  <td class="td-name">{r.chain}</td>
                  <td class="mono">{fmtB(r.cur)}</td>
                  <td class={`mono ${r.d1 > 0 ? 'td-pos' : r.d1 < 0 ? 'td-neg' : ''}`}>{r.d1 == null ? '-' : fmtPct(r.d1)}</td>
                </tr>
              )) : <tr><td colspan="3" class="info-empty">No chain rows</td></tr>}
            </tbody>
          </table>
        </div>
        <div class="chain-cards-mobile">
          {rows.length ? rows.slice(0, 8).map((r) => (
            <div class="chain-mobile-card" key={r.chain}>
              <div class="cm-main">{r.chain}</div>
              <div>
                <div class="cm-label">Supply</div>
                <div class="cm-val">{fmtB(r.cur)}</div>
              </div>
              <div>
                <div class="cm-label">1d %</div>
                <div class={`cm-val ${r.d1 > 0 ? 'td-pos' : r.d1 < 0 ? 'td-neg' : ''}`}>{r.d1 == null ? '-' : fmtPct(r.d1)}</div>
              </div>
            </div>
          )) : <div class="info-empty">No chain rows</div>}
        </div>
      </div>
    </div>
  );
}
