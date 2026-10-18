# Data Sources

The dashboard's market figures come from the market dataset the backend persists from Helix trends (the live market path). Coin-tab 90-day charts and tickers come from CoinGecko in the browser. The backend cron jobs write stress series, canonical alert events, and AI narratives.

## Upstreams

| Source | Provides | Auth | CORS |
|---|---|---|---|
| Helix (`HELIX_API_BASE`) | Per-coin supply trends, spot price and 24h change, per-chain distribution, canonical events, market totals (backend market dataset) | Key optional | N/A (backend server-side) |
| [CoinGecko](https://www.coingecko.com/en/api) | 90-day price charts and top exchange tickers for coin tabs (browser); not the dashboard spot price on the Helix path | None | Open |
| [DefiLlama Stablecoins](https://stablecoins.llama.fi) | Legacy supply/chain path, used only when `LEGACY_UPSTREAMS=1` | None | Open |

## Endpoints

| Endpoint | Used by | Cadence |
|---|---|---|
| Helix `GET /api/trends?asset=X` | backend `jobs/fetch.js`, `jobs/stress.js` (supply, price, 24h change, stress series) | 10 min (backend) |
| Helix `GET /api/trends/chains?asset=X` | backend `jobs/fetch.js` (per-chain supply; skippable via `HELIX_FETCH_CHAINS=0`) | 10 min (backend) |
| Helix `GET /api/events?asset=X&limit=25` | backend `jobs/stress.js` (canonical alert events) | 10 min (backend) |
| `GET https://api.coingecko.com/api/v3/coins/{id}/market_chart` | Frontend (lazy, coin tab) | 5 min cache |
| `GET https://api.coingecko.com/api/v3/coins/{id}/tickers` | Frontend (lazy, coin tab) | 5 min cache |
| `GET https://stablecoins.llama.fi/*` | backend only, with `LEGACY_UPSTREAMS=1` | off by default |

## Rate-limit posture

- **Browser-direct (CoinGecko):** each visitor pays their own IP's rate limit; the 60s throttle and inflight dedupe keep the frontend well within CoinGecko's free tier (~10-30 req/min/IP). Chart/ticker calls are lazy per coin tab.
- **Backend:** a single VPS IP makes the 10-min cadence the binding constraint. The fetch job makes 2 Helix calls per coin per cycle (trends plus chains, chains skippable via `HELIX_FETCH_CHAINS=0`). The stress job adds 1 trends call and 1 events call per coin. Five coins therefore cost up to 20 Helix calls per 10 minutes across both jobs.

## Freshness

The dashboard shows three clocks (`src/lib/freshness.js`), not one "last updated" time:

- **Checked:** when this browser fetch succeeded.
- **Market observed:** upstream observation time. On the Helix path this is the trends point timestamp carried into the market payload; on the legacy path it is CoinGecko `last_updated_at` when present, otherwise the assembled supply timestamps. Daily supply can be several hours old and still on cadence.
- **Historical snapshot:** optional SQLite last-sync from `/api/healthz`. If the backend is not connected, this clock says so and does not mark a successful live fetch as Unavailable.

Overall state is Current / Delayed / Stale / Unavailable from the market (or checked) clock, with supply cadence treating under 28h as Current. AI narratives follow `AI_CADENCE_MIN` (default 120 min).

## Privacy

- Browser-direct fetches come from the visitor's own IP (no central aggregator, no API keys exposed).
- Optional backend reads (`/api/healthz`, `/api/ai`, `/api/alerts`, `/api/history`) contain no PII.
