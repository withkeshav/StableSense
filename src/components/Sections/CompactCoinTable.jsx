import { fmtB, fmtPct, fmtPrice, bps, pctChange, chgClass } from '../../utils/formatters.js';

/**
 * Compact tracked-coin table: price, 24h price change, peg drift, supply, and
 * 24h supply change in one card. Desktop renders a table; mobile renders a
 * sibling card list so no horizontal scrolling is needed at 375px.
 */
export default function CompactCoinTable({ coins, priceByCoin, cg, data, onSelectCoin }) {
  const renderRow = (c) => {
    const price = priceByCoin?.[c.symbol] ?? null;
    const priceChange = cg?.[c.coingeckoId]?.usd_24h_change ?? null;
    const pegBps = bps(price);
    const asset = data?.allStables?.peggedAssets?.find(
      (x) => String(x?.symbol || '').toUpperCase() === String(c.symbol || '').toUpperCase()
    );
    const supply = asset?.circulating?.peggedUSD ?? null;
    const prevSupply = asset?.circulatingPrevDay?.peggedUSD ?? null;
    const supplyChange = pctChange(supply, prevSupply);
    const dq = data?.dataQuality?.find((q) => q?.coin === c.symbol);

    const openBtn = onSelectCoin ? (
      <button
        type="button"
        class="coin-open"
        aria-label={`Open ${c.symbol} details`}
        onClick={() => onSelectCoin(c.symbol)}
      >
        Open
      </button>
    ) : null;
    const warn = dq ? <span class="stat-warning">Data unavailable</span> : null;

    return { c, price, priceChange, pegBps, supply, supplyChange, warn, openBtn, dq };
  };

  return (
    <div class="card mb-4">
      <div class="card-header">
        <div>
          <div class="card-title">Tracked coins</div>
          <div class="card-sub">Price, peg drift and supply in one compact table</div>
        </div>
      </div>
      <div class="card-body p0">
        <div class="tbl-wrap coin-table-wrap">
          <table class="data-table coin-table">
            <thead>
              <tr>
                <th>Coin</th>
                <th class="num">Price</th>
                <th class="num">24h</th>
                <th class="num">Peg</th>
                <th class="num">Supply</th>
                <th class="num">Supply 24h</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {coins.map((c) => {
                const r = renderRow(c);
                return (
                  <tr key={c.symbol}>
                    <td class="td-name"><span class="coin-dot" style={{ background: c.color }} aria-hidden="true"></span>{c.symbol}</td>
                    <td class="mono">{fmtPrice(r.price)}</td>
                    <td class={`mono ${chgClass(r.priceChange)}`}>{fmtPct(r.priceChange)}</td>
                    <td class={`mono ${chgClass(r.pegBps)}`}>{r.pegBps == null ? '-' : `${r.pegBps} bps`}</td>
                    <td class="mono">{fmtB(r.supply)}</td>
                    <td class={`mono ${chgClass(r.supplyChange)}`}>{fmtPct(r.supplyChange)}</td>
                    <td>{r.warn}{r.openBtn}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div class="coin-table-cards">
          {coins.map((c) => {
            const r = renderRow(c);
            return (
              <div class="coin-table-card" key={c.symbol}>
                <div class="cm-main"><span class="coin-dot" style={{ background: c.color }} aria-hidden="true"></span>{c.symbol}</div>
                <div>
                  <div class="cm-label">Price</div>
                  <div class="cm-val">{fmtPrice(r.price)}</div>
                </div>
                <div>
                  <div class="cm-label">24h</div>
                  <div class={`cm-val ${chgClass(r.priceChange)}`}>{fmtPct(r.priceChange)}</div>
                </div>
                <div>
                  <div class="cm-label">Peg</div>
                  <div class={`cm-val ${chgClass(r.pegBps)}`}>{r.pegBps == null ? '-' : `${r.pegBps} bps`}</div>
                </div>
                <div>
                  <div class="cm-label">Supply</div>
                  <div class="cm-val">{fmtB(r.supply)}</div>
                </div>
                <div>
                  <div class="cm-label">Supply 24h</div>
                  <div class={`cm-val ${chgClass(r.supplyChange)}`}>{fmtPct(r.supplyChange)}</div>
                </div>
                <div>
                  {r.warn}
                  {r.openBtn}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
