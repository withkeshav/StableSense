import { fmtB, fmtPct } from '../../utils/formatters.js';

/**
 * Whale-watch anomalies for this coin: mobile cards plus the desktop table.
 */
export default function WhaleAnomaliesCard({ symbol, whaleRows }) {
  return (
    <div class="card mb-4">
      <div class="card-header"><div class="card-title">{symbol} Anomalies</div></div>
      <div class="card-body p0">
        <div class="whale-cards-mobile">
          {whaleRows.map((row, idx) => (
            <div class="whale-mobile-card" key={`cw-${idx}`}>
              <div class="wm-main">{row.chain}</div>
              {row.migration ? <p class="whale-mig-note">Leg of {row.migration.label} migration</p> : null}
              <div><div class="wm-label">Supply Delta</div><div class="wm-val">{fmtB(row.delta)}</div></div>
              <div><div class="wm-label">Z-score</div><div class="wm-val" title={`Raw z: ${row.z.toFixed(1)}σ`}>{row.displayZ >= 10 ? '>10σ' : `${row.displayZ.toFixed(1)}σ`}</div></div>
              <div><div class="wm-label">Share of tracked</div><div class="wm-val">{fmtPct(row.shareOfTracked)}</div></div>
            </div>
          ))}
        </div>
        <div class="whale-table-desktop">
          <table class="data-table whale-watch-table" style="min-width:320px">
            <thead><tr><th>Chain</th><th>Supply Delta</th><th>Z-score</th><th>Share of tracked</th></tr></thead>
            <tbody>
              {whaleRows.map((row, idx) => (
                <tr key={`tw-${idx}`}>
                  <td class="td-name">
                    {row.chain}
                    {row.migration ? <div class="whale-mig-note">Leg of {row.migration.label} migration</div> : null}
                  </td>
                  <td class="mono">{fmtB(row.delta)}</td>
                  <td class="mono" title={`Raw z: ${row.z.toFixed(1)}σ`}>{row.displayZ >= 10 ? '>10σ' : `${row.displayZ.toFixed(1)}σ`}</td>
                  <td class="mono">{fmtPct(row.shareOfTracked)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
