# Data Sources

Everything StableSense shows comes from the market dataset the backend persists from Helix trends (the live market path), CoinGecko for coin-tab charts and tickers (fetched in the browser), and the backend cron jobs for stress, canonical alerts, and AI narratives.

## Upstreams

| Source | Provides | Auth | CORS |
|---|---|---|---|
| Helix (`HELIX_API_BASE`) | Per-coin supply trends, per-chain distribution, market totals (backend market dataset) | Key optional | N/A (backend server-side) |
| [CoinGecko](https://www.coingecko.com/en/api) | Spot prices, 24h change/volume, 90-day price charts, exchange tickers | None | Open |
| [DefiLlama Stablecoins](https://stablecoins.llama.fi) | Legacy supply/chain path, used only when `LEGACY_UPSTREAMS=1` | None | Open |

## Endpoints

| Endpoint | Used by | Cadence |
|---|---|---|
| Helix `GET /api/trends?asset=X` | backend `jobs/fetch.js`, `jobs/stress.js` | 10 min (backend) |
| Helix `GET /api/trends/chains?asset=X` | backend `jobs/fetch.js` (skippable via `HELIX_FETCH_CHAINS=0`) | 10 min (backend) |
| `GET https://api.coingecko.com/api/v3/coins/{id}/market_chart` | Frontend (lazy, coin tab) | 5 min cache |
| `GET https://api.coingecko.com/api/v3/coins/{id}/tickers` | Frontend (lazy, coin tab) | 5 min cache |
| `GET https://stablecoins.llama.fi/*` | backend only, with `LEGACY_UPSTREAMS=1` | off by default |

## Rate-limit posture

- **Browser-direct (CoinGecko):** each visitor pays their own IP's rate limit; the 60s throttle and inflight dedupe keep the frontend well within CoinGecko's free tier (~10-30 req/min/IP). Chart/ticker calls are lazy per coin tab.
- **Backend:** a single VPS IP makes the 10-min fetch cadence the binding constraint; the Helix trends path is 1 request per asset per fetch (2 with chains), 5 coins.

## Freshness

The dashboard shows three clocks (`src/lib/freshness.js`), not one "last updated" time:

- **Checked:** when this browser fetch succeeded.
- **Market observed:** upstream observation time (CoinGecko `last_updated_at` when present; otherwise the assembled payload). DefiLlama daily supply can be several hours old and still on cadence.
- **Historical snapshot:** optional SQLite last-sync from `/api/healthz`. If the backend is not connected, this clock says so and does not mark a successful live fetch as Unavailable.

Overall state is Current / Delayed / Stale / Unavailable from the market (or checked) clock, with supply cadence treating under 28h as Current. AI narratives follow `AI_CADENCE_MIN` (default 120 min).

## Privacy

- Browser-direct fetches come from the visitor's own IP (no central aggregator, no API keys exposed).
- Optional backend reads (`/api/healthz`, `/api/ai`, `/api/alerts`, `/api/history`) contain no PII.
