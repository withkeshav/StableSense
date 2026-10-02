# StableSense - Agent Instructions

Instructions for AI coding assistants (OpenCode, Claude Code, etc.) working in this repository.

**This file is the canonical, durable agent spec for this repo and it is tracked in git.** It describes
what is true about the project and what any agent must not break. Read it at the start of a session and
treat it as authoritative over any other note, plan, or log you find: `.progress/` holds working notes
that go stale, this file does not.

**Where working notes live (do not confuse the two, and do not create a third).** `.progress/` is a
scratch folder for temporary and internal working files. It is gitignored on purpose, it is not backed
up, and anything inside it may be cleared at any time, so nothing durable belongs there. If a rule, a
decision, or a fact about this project matters beyond the current task, it belongs in THIS file or in
`docs/`, not in `.progress/`. Do not create a second agent-instruction file (`agent.md`, a per-assistant
notes file, a duplicate of this one): this file is the single agent spec, and a duplicate invites an
agent to follow the stale copy. The one thing worth reading before research-heavy work is the methodology
playbook at `.progress/research-methodology.md`; treat it as a convenience reference that may be gone,
and the method is also summarised under Research methodology below.

## Project identity

- Product name: **StableSense** (brand). Do not use the old names "StablePulse" or "StableScope" anywhere in UI, docs, or keys.
- Package name: `stablesense` (`package.json`). npm scripts: `dev`, `build`, `preview`, `test`.
- Repo folder is still named `stablescope`; do not rename it or reference it in user-facing docs.
- The legacy Cloudflare Worker (`stablescope-cors.keshav-maheshwari.workers.dev`) was dropped in v2.1.0; the app now fetches live data browser-direct and the optional backend is served same-origin.
- Version: `APP_VERSION` in `src/config.js` and `version` in `package.json` must stay in sync.
- The Learn tab teaches the broader value-referenced-token definition (stable relative to a reference, usually but not always USD); the tracked coin set in `src/utils/coin-config.js` stays USD-pegged by design. Do not narrow the Learn copy back to dollar-only, and do not add non-USD coins to `ACTIVE_STABLECOINS` without a separate scoping decision.

## Strict rules

1. **No em dash (U+2014) anywhere**: not in docs, not in dashboard text, not in code. Use hyphens (`-`), colons, commas, or rephrase. The null/unknown placeholder in the dashboard is a single hyphen `-`.
2. **Mobile-first is mandatory.** Every change must remain mobile-optimized: bottom nav under 768px, card-based tables under 480px, 44px touch targets, safe-area insets, responsive charts. Never add horizontal scrolling at 375px unless deliberate.
3. **Default theme is Light.** Dark and System remain available options. Never change the default back to `system` or `dark`.
4. **Software license: Apache-2.0.** Preserve LICENSE, copyright and applicable NOTICE content. Research prose, figures and datasets remain separately governed by RESEARCH-LICENSE; software source files within research directories use Apache-2.0. Do not imply third-party material has been relicensed or adopt new research permissions without operator approval.
5. **No secrets.** Never commit keys, tokens, or `OPENAI_*` values. Config is via runtime `window.STABLESENSE_CONFIG` or build-time `STABLESENSE_AI_API_BASE`. Backend keys live only in `backend/.env` (git-ignored).
6. **Numeric-claim precision.** Every prominent single-number display (OG share images, hero counters, headline stats, chart axes) must state precisely what it measures and what it excludes, in the visible label itself, not buried in a footnote. "Combined market cap of the 5 stablecoins tracked on this dashboard" and "total global stablecoin market cap across all issuers" are different numbers, never conflate them. Where sources disagree, show the range and cite the source and as-of date rather than silently picking one number. This applies to the research hub and to any future headline-number surface in the app. **This includes any prose claim that describes a chart's data** (a percentage, a share, a ranking, "X is under/over Y%"). Compute it from the same data object the chart itself renders and verify the arithmetic before writing the sentence, do not estimate or recall it from memory. A real instance of this: research/index.html's taxonomy chart caption once claimed the five non-fiat-USD categories were "under 5%" of the total; running the chart's own parsing logic against research/data.js's actual `taxonomy` array gives 16.2%, over 3x the claimed figure. The fix must be re-derived from the data on every edit to that data, not copied forward.
7. **When fixing a sizing/layout bug by constraining an element's box (explicit height/width), inventory every child of that element first, not just the one causing the bug you're fixing.** A real instance: fixing a Chart.js canvas that grew to 1600px+ tall (a `maintainAspectRatio:false` chart needs its direct parent to have an explicit, non-content-driven height, or the two chase each other in a resize feedback loop) was done by adding a fixed height directly to `.chart-wrap`, which also contains a `.chart-caption` paragraph as a sibling of the canvas. The caption then had nowhere to fit and visually overlapped the next element in the page. The correct fix wraps only the canvas in its own inner box (`.chart-canvas-box`) and leaves the outer container auto-height. Any time a fix targets one child's sizing need, check whether the container being constrained has other content that also needs room.
8. **A site/property's own logo or wordmark must link to that same property, never to a different one.** Convention (and user expectation) is that clicking a logo keeps you where you are or takes you to that property's own home; if it needs to also offer a way to a different property (e.g., the research hub linking to the live dashboard), that must be a separately, explicitly labeled link, not overloaded onto the logo itself. Check this any time a page's brand mark is added or its href is touched.

## Research methodology

Retrieval policy: OmniSearch is the first choice for search and page fetch. If requested
content requires JavaScript, retry with `forceJsRender:true` (Crawl4AI). Use applicable
TinyFish extraction, direct Crawl4AI or other internal retrieval paths before interactive
browser-use. Native web tools are fallback only. Browser-use is reserved for necessary
on-page exploration, navigation or actions, or recovery after applicable internal paths
demonstrably failed on the exact URL. Record the URL, attempted tools and failure evidence
before escalating. JavaScript alone, a thin HTTP 200 shell, or convenience is not an
exception. Repeat this policy explicitly in every research worker brief; exclude interactive
browser tools from pure retrieval workers where the harness supports that restriction.

For any research-heavy content effort (new Learn lessons, hub updates, anything with sourced external
facts), read `.progress/research-methodology.md` first if it is present. It is the reusable playbook for
how research passes were run for the stablecoin content: three independent passes, cross-checked against
each other, a manual verification gate on the highest-stakes claims before anything ships. Because that
file sits in the disposable `.progress/` folder, treat it as a convenience copy, not a dependency: if it
has been cleared, the method is reproduced in summary here. Run three genuinely independent passes
(different agents or sessions, never the same one three times), require every claim to carry a source and
an explicit as-of date, cross-check the passes against each other rather than trusting one, report a
range where they disagree instead of picking a number silently, and manually verify the few claims that
will be screenshotted or quoted against primary sources directly before publishing.

## Commands

```bash
npm test       # vitest (src/**/*.test.js), pure logic only
npm run build  # vite build -> dist/
npm run dev    # dev server (frontend only; AI layer disabled by default)
npm run preview

# Backend (optional, lite VPS service)
cd backend
npm install
npm run fetch  # backfill history from DefiLlama/CoinGecko
npm run ai     # generate one AI narrative
npm start      # serve /api/healthz, /api/ai, /api/history on :8787
```

Always run `npm test` and `npm run build` after changes. When changing backend files, run `node --check` on the changed file.

## Structure

- `src/lib/derive.js` - pure logic: stress index, chain flows, migration pairs, whale watch, chart series, alert generation. Must stay framework-free.
- `src/lib/api.js` - browser-direct data layer: DefiLlama + CoinGecko fetches with SWR caching. No keys, no backend dependency for live data.
- `src/lib/ai.js` - AI narrative fetch from `aiApiBase`.
- `src/utils/formatters.js` - formatting helpers (fmtB/fmtPct/fmtPrice/timeAgo/bps/pctChange). Pure functions with `-` placeholder on invalid input.
- `src/utils/coin-config.js` - stablecoin registry (`STABLECOIN_REGISTRY`, `ACTIVE_STABLECOINS`). Adding a coin is a config-only change.
- `src/utils/storage.js` - localStorage key constants (`stablesense:*`) + one-time legacy key migration.
- `src/config.js` - `aiApiBase` resolution (`window.STABLESENSE_CONFIG` -> `STABLESENSE_AI_API_BASE` -> `''`) and `APP_VERSION`.
- `src/components/` - Header, Sidebar, MobileNav, SettingsPanel, Tabs/, Sections/, ui/. Tabs drive views; Sections are page content; ui has StatCard, Sparkline, ChartWrapper, RefreshCountdown, SkeletonLoader, AiTicker (Chart.js lazy-loaded). Tabs: Home, Coin, Learn, Chains, Alerts, About.
- `src/hooks/useTheme.js` - theme state; localStorage key `stablesense:theme`.
- `index.html` - pre-paint theme bootstrap (default light), meta, favicon, manifest.
- `backend/` - optional Fastify + SQLite service: `jobs/fetch.js` (history), `jobs/ai.js` (narratives), `lib/db.js`, `lib/env.js`, `server.js`, `deploy/` (systemd, nginx, crontab).
- Docs live in `docs/`; CHANGELOG follows Keep-a-Changelog. Do not put local drafts in `docs/` (see .gitignore).

## Testing conventions

- Tests target pure modules only (`src/lib/derive.test.js`, `src/utils/formatters.test.js`).
- Keep tests deterministic (no timers/network/mock time where possible; `timeAgo` tests use offsets).
- When changing a formatter or derive function, update its test file in the same change.

## Data model

The frontend reads live market data through the optional same-origin backend (`backend/`), which
accumulates history from Helix trends and serves market snapshots plus CoinGecko 90-day charts; when the
backend is absent the app degrades gracefully and shows a hyphen rather than a false number. All display
math is computed client-side in `src/lib/derive.js` (see `docs/api-protocol.md`). The backend imports
`src/utils/coin-config.js` (a shared config file) for the coin registry. Note for older notes and docs:
the pre-v2.1.0 description of the app fetching DefiLlama and CoinGecko browser-direct is no longer
accurate for the dashboard's supply and price path.
