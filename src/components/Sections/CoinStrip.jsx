import { useState } from 'preact/hooks';
import { fmtB, fmtPrice, bps } from '../../utils/formatters.js';
import CompactCoinTable from './CompactCoinTable.jsx';

function bpsText(value) {
  if (value == null) return '-';
  const abs = Math.abs(value);
  return `${value > 0 ? '+' : ''}${value} ${abs === 1 ? 'bp' : 'bps'}`;
}

export default function CoinStrip({ coins = [], priceByCoin = {}, cg, data, onSelectCoin }) {
  const [view, setView] = useState('cards');

  const rows = coins.map((coin) => {
    const price = priceByCoin?.[coin.symbol] ?? null;
    const drift = bps(price);
    const asset = data?.allStables?.peggedAssets?.find(
      (item) => String(item?.symbol || '').toUpperCase() === String(coin.symbol || '').toUpperCase()
    );
    const supply = asset?.circulating?.peggedUSD ?? null;
    return { coin, price, drift, supply };
  });

  return (
    <section class="od-coin-section" aria-label="Tracked stablecoins">
      <div class="od-coin-head">
        <h2>Tracked coins</h2>
        <div class="od-coin-view" role="group" aria-label="Tracked coin view">
          <button type="button" class={view === 'cards' ? 'selected' : ''} aria-pressed={view === 'cards'} onClick={() => setView('cards')}>Cards</button>
          <button type="button" class={view === 'table' ? 'selected' : ''} aria-pressed={view === 'table'} onClick={() => setView('table')}>Table</button>
        </div>
      </div>

      {view === 'cards' ? (
        <div class="od-coin-strip">
          {rows.map(({ coin, price, drift, supply }) => {
            const pos = drift == null ? 50 : Math.max(4, Math.min(96, 50 + drift * 10));
            return (
              <button
                type="button"
                class="od-coin-card"
                key={coin.symbol}
                style={{ '--c': coin.color, '--pos': `${pos}%` }}
                onClick={() => onSelectCoin?.(coin.symbol)}
                aria-label={`Open ${coin.symbol} details`}
              >
                <span class="od-coin-card-head">
                  <span class="od-coin-sym"><span class="od-dot" />{coin.symbol}</span>
                  <span class="od-bps-chip">{bpsText(drift)}</span>
                </span>
                <span class="od-coin-price">{fmtPrice(price)}</span>
                <span class="od-coin-cap"><span>Market cap</span><b>{fmtB(supply)}</b></span>
                <span class="od-coin-track" aria-hidden="true"><i /></span>
              </button>
            );
          })}
        </div>
      ) : (
        <CompactCoinTable
          coins={coins}
          priceByCoin={priceByCoin}
          cg={cg}
          data={data}
          onSelectCoin={onSelectCoin}
        />
      )}
    </section>
  );
}
