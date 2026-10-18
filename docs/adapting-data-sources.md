# Adapting data sources

StableSense is Apache-2.0 software. A fork can replace the market data source, run its own backend, and publish its own version. This guide describes the seam a fork has to implement, the payload the frontend already expects, and the rules that keep missing data from looking like a measured zero.

It is a fork guide, not a promise that every upstream is a one-line config change. The current default is Helix. The legacy DefiLlama + CoinGecko path and the Helix v2 bulk read are existing switches, not a generic source registry.

## What is pluggable

The backend writes rows into SQLite and `/api/market` assembles those rows into one canonical payload. That payload is the seam.

- A new adapter maps an upstream response to the row shapes in [A minimal adapter](#a-minimal-adapter).
- The existing writers persist those rows.
- `buildMarketView()` in `backend/jobs/lib/marketView.js` turns the rows into `/api/market`.
- The frontend transforms that payload in `src/lib/marketBackend.js` into the internal dashboard shape. It does not read Helix directly.

The frontend also loads CoinGecko 90-day price charts and exchange tickers directly from the browser for the coin tabs. Replacing the backend market source does not replace those calls. Replacing the chart source is a separate change in `src/lib/api.js`.

## Current paths and switches

| Path | Selected by | What it reads |
|---|---|---|
| Helix trends, default | unset | `backend/jobs/fetch.js` calls Helix `/api/trends` and `/api/trends/chains` per tracked coin |
| Helix v2 bulk read | `HELIX_V2=1` | one `GET /api/v2/market?assets=...&window=latest&include=chains` call, mapped by `backend/jobs/lib/helixV2.js` |
| Legacy upstreams | `LEGACY_UPSTREAMS=1` | DefiLlama supply and chains plus CoinGecko prices, for backfills and deliberate fallback |

`HELIX_V2` affects the fetch job only. The stress job keeps the v1 trends window because it needs the price series for its z-score.

There is no `DATA_SOURCE` flag today. A fork should add one explicit switch next to these paths instead of editing the Helix mapper in place. The switch belongs in the adapter selection, not in the frontend.

## The canonical market payload

`GET /api/market` returns this shape. Every number is in USD unless the field says otherwise; every timestamp is milliseconds since the Unix epoch.

```jsonc
{
  "generatedAt": 1787000000000,
  "source": "helix-via-cron",
  "observedAt": 1786999990000,
  "market": {
    "totalCirculatingUsd": 269000000000,
    "delta24hUsd": -5700000000,
    "ts": 1786999990000
  },
  "coins": [
    {
      "symbol": "USDT",
      "name": "Tether USD",
      "price": 0.9998,
      "change24h": -0.02,
      "ts": 1786999990000,
      "supply": 183200000000,
      "supplyDelta24h": -1140000000,
      "depegIndex": null,
      "chains": [
        {
          "chain": "ethereum",
          "supply": 80000000000,
          "delta24h": 420000000,
          "ts": 1786999990000
        }
      ]
    }
  ],
  "dataQuality": [],
  "supplyHistory": {
    "USDT": [
      { "ts": 1786924800000, "value": 183300000000 }
    ]
  }
}
```

Field rules:

- `generatedAt` is when the response was assembled. It is not an observation date.
- `observedAt` is the newest upstream observation across prices and chains. It is the clock the dashboard uses for "market observed".
- `market.ts` is the newest stored `market_snapshots` row timestamp, or null. It can be older than `observedAt`; it is not the same clock.
- `change24h` is a percentage number, for example `-0.02` for a 0.02 percent fall. It is not a fraction.
- `supplyDelta24h` is a change in USD, not a percentage.
- `chains[].chain` is lowercase. The DB writers lowercase it so "Tron" and "tron" cannot double-count one rail.
- `chains[].supply` is circulating USD on that chain. `chains[].delta24h` is the 24 hour change in USD.
- `supplyHistory[SYMBOL]` is a daily series. Each point is `{ ts, value }`, where `ts` is midnight UTC in milliseconds and `value` is circulating USD. The builder dedupes one row per coin, UTC day and chain, and applies the era rule in `marketView.js`.
- `dataQuality` is an array of `{ coin, reason }`. A missing price or snapshot must appear here. It is not a place to put a plausible estimate.
- `source` is a label. Change it if a fork wants a different label; display logic does not depend on it.

`buildMarketView()` prefers the sum of the per-coin daily series for the market total. A stored `market_snapshots` total is only a fallback when the series measured nothing or overflowed to a non-finite value.

## A minimal adapter

Create a new mapper, for example `backend/jobs/lib/mySourceMap.js`. It should return the same row shapes the existing writers accept. The writers live in `backend/jobs/lib/marketWrites.js`.

```js
function finite(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Map one upstream response to the three row shapes the fetch job writes.
 * Unknown values stay null. Never use 0 for "not reported".
 */
export function mapMySource(payload) {
  const priceRows = [];
  const snapshotRows = [];
  const assets = Array.isArray(payload?.assets) ? payload.assets : [];

  for (const asset of assets) {
    const coin = String(asset?.symbol || '').toUpperCase();
    const ts = Number(asset?.observedAt);
    if (!coin || !Number.isFinite(ts) || ts <= 0) continue;

    // change is a percent, not a fraction.
    priceRows.push({
      coin,
      ts,
      price: finite(asset.priceUsd),
      change: finite(asset.change24hPct),
      volume: null,
    });

    for (const chain of Array.isArray(asset.chains) ? asset.chains : []) {
      const chainTs = Number(chain?.observedAt ?? ts);
      const circulating = finite(chain?.supplyUsd);
      if (!chain?.name || !Number.isFinite(chainTs) || chainTs <= 0) continue;
      // snapshots.circulating_usd is NOT NULL. Skip a chain with no finite
      // supply; dataQuality reports it rather than storing a false zero.
      if (circulating == null) continue;
      snapshotRows.push({
        coin,
        chain: String(chain.name).trim().toLowerCase(),
        ts: chainTs,
        circulating,
        delta: finite(chain.delta24hUsd),
      });
    }
  }

  const marketTs = Number(payload?.observedAt);
  const total = finite(payload?.totalUsd);
  const delta = finite(payload?.delta24hUsd);
  return {
    priceRows,
    snapshotRows,
    marketRow: Number.isFinite(marketTs) && marketTs > 0
      ? { ts: marketTs, total, delta }
      : null,
  };
}
```

Then wire it in `backend/jobs/fetch.js` with one explicit switch. Keep the Helix branch as the default so an absent or misspelled switch does not silently change the source.

```js
const source = process.env.DATA_SOURCE || 'helix';

if (source === 'my-source') {
  const payload = await getJson('https://example.invalid/market');
  const mapped = mapMySource(payload);
  writePriceRows(db, mapped.priceRows);
  writeSnapshotRows(db, mapped.snapshotRows);
  upsertMarketRow(db, mapped.marketRow);
} else {
  // existing Helix v1 or Helix v2 branch
}
```

The writers are no-ops on an empty batch. `upsertMarketRow()` rejects a row whose `total` is not a positive finite number, so a broken total cannot overwrite a good one with zero.

Do not write the `/api/market` JSON by hand. Write the rows and let `buildMarketView()` assemble the payload. That keeps the frontend, alerts, history and data-quality path on one contract.

## Coin identities

The frontend registry is `src/utils/coin-config.js`. A fork that keeps the same five coins must keep these fields for each entry:

- `symbol`
- `coingeckoId`
- `llamaStablecoinId` (or an alias the legacy path understands)
- `color`
- `thresholds.pegCriticalBps`
- `thresholds.pegWarnBps`
- `thresholds.chainSpikeUsd`
- `thresholds.megaSupplyUsd`

`ACTIVE_STABLECOINS` controls the visible set. Adding a coin is not only a frontend change: the backend duplicates `TRACKED_COINS` and `COIN_NAMES` in `backend/jobs/lib/marketView.js`, because the server does not import `src/`. Keep the two lists in sync.

If a new source uses different coin identities, map them into these symbols before writing rows. The alert thresholds, tab routing and chart colours all resolve through this registry.

## Frontend charts and tickers

`src/lib/api.js` fetches `/api/market` and lazily loads CoinGecko chart and ticker data. `src/lib/marketBackend.js` then builds the internal shape used by `derive.js`, including `cgSimple`, the per-coin `*Detail` shims, `allStables`, `chainData`, the clocks and `dataQuality`.

If a fork keeps CoinGecko for charts and tickers, no frontend change is needed. If it replaces CoinGecko, keep the shapes the coin tab reads:

- `cgSimple[coingeckoId]` with `usd`, `usd_24h_change` and `last_updated_at`.
- `cg{SYMBOL}Chart.prices` as `[[timestampMs, price], ...]`.
- `cg{SYMBOL}` with a `tickers` array used by the exchange-volume chart.

Otherwise update `src/lib/api.js` and the consumers in `src/components/Coin/` together. Do not leave a half-replaced path that silently renders an old source under a new label.

## Null, as-of and data-quality rules

These rules are not style preferences. They are how the dashboard avoids showing an outage as a healthy market.

- A missing value is `null`, never `0`, `1`, or the previous value.
- A chain snapshot with no finite circulating supply is not written; `snapshots.circulating_usd` is NOT NULL. The missing chain is reported by `dataQuality` rather than stored as zero.
- A price of zero or below is a failed feed, not a peg at zero.
- A missing previous supply is unknown, not a zero change. The table and cards render `-`.
- Keep the observation timestamp from the upstream. Do not replace it with `Date.now()`.
- If the source reports a partial asset set, write what it reported and let `buildMarketView()` add `dataQuality` reasons for the missing coins.
- A stale cached payload may still be shown, but the freshness label must say so. Do not relabel stale data as current.
- If the source cannot be reached, the job should record the failure and leave the last good rows in place. Do not delete rows to make the response look clean.

## Tests and a manual check

Run the repository suite and both builds:

```bash
npm test
npm run build:all
```

The mapper and market-view tests are fixture-based. Start with:

- `backend/jobs/lib/marketView.test.js`
- `backend/jobs/lib/marketView.supplyHistory.test.js`
- `backend/jobs/lib/helixMap.test.js`
- `backend/jobs/lib/helixV2.test.js`
- `backend/jobs/lib/marketSnapshotUpsert.test.js`

Add a fixture test for the new mapper that covers:

1. A complete asset and chain.
2. A missing price, a missing chain and a non-finite number.
3. A source with no assets at all.
4. A repeated timestamp, which must not crash the write.
5. A total that is zero, negative or non-finite, which must not overwrite a good total.

For a manual check, run the backend against a temporary data directory and request the payload:

```bash
DATA_DIR=/tmp/stablesense-source-test PORT=8787 node backend/server.js
curl -s http://127.0.0.1:8787/api/market
```

Then check:

- `coins` includes every tracked symbol, with nulls where the source did not report a field.
- `observedAt` is the upstream time, not the response time.
- `dataQuality` names each missing coin and reason.
- `supplyHistory` points are midnight UTC and ascending.
- The dashboard shows `-` for missing values, not `$0.00`, `0 bps` or `+0.00%`.
- With the source offline, the last good rows remain and the freshness state says stale or unavailable.

Run `node --check` on every backend file changed by the adapter.

## Adding a new source: checklist

1. Read this guide, [api-protocol.md](./api-protocol.md) and [data-sources.md](./data-sources.md).
2. Confirm the canonical payload and units above match the fields your source can provide.
3. Add `backend/jobs/lib/mySourceMap.js` and fixture tests.
4. Add one explicit source switch in `backend/jobs/fetch.js`; keep the current path as the default.
5. Map coin identities into `src/utils/coin-config.js` and keep the backend `TRACKED_COINS` and `COIN_NAMES` in sync.
6. Decide whether CoinGecko charts and tickers stay or are replaced.
7. Update `backend/.env.example` and the docs with the new variable names, never with secret values.
8. Run `npm test` and `npm run build:all`.
9. Check the dashboard with the source online, with a partial payload, and with the source offline.
10. Check light, dark and a 375px viewport before publishing.

## License and attribution

The software is Apache-2.0. Keep `LICENSE`, `NOTICE` and the copyright notices. Research prose, figures and datasets are governed separately by `RESEARCH-LICENSE`; replacing a data source does not relicense that material.

A fork is permitted. A fork is not endorsed by StableSense, and it does not inherit the StableSense name, domain or contributor credit. Respect the terms of any upstream source you add, and keep its keys in the backend environment, never in the frontend or the repository.
