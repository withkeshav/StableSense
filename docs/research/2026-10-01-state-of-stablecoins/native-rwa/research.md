# Native RWA and Stablecoin Economic Impact - Research Pass

**Date:** 2026-10-01
**Scope:** RWA depth, stablecoin macroeconomics, US-debt narrative, x402, methodology, narratives
**Method:** Independent web research with primary-source evidence captures

---

## 1. State of Stablecoins (Context)

The stablecoin market stands at approximately $289-303B as of mid-2026 across aggregators (CoinMarketCap ~$300B, CoinGecko ~$291B, DefiLlama ~$289B). USDT (~$183B) and USDC (~$74B) control over 80% of supply. The GENIUS Act (signed July 18, 2025) requires payment-stablecoin reserves to be 1:1 in permitted assets including cash, T-bills with 93-day maturity or less, and overnight repo. Full implementation is January 18, 2027 under the 18-month fallback (no final rule issued before September 20, 2026).

**Key structural fact:** Stablecoin issuers hold well over $150B in US Treasuries. Tether alone reported ~$141B in Q1 2026 attestation. Combined issuers (Tether, Circle, First Digital, Paxos) hold ~$182B. This makes them structural buyers of short-dated T-bills.

---

## 2. Open Standard / Open USD

**Status: LIVE (not just announced).** The Open Standard consortium announced Open USD (OUSD) on June 30, 2026, with 140+ named partners including Visa, Mastercard, Stripe, BlackRock, BNY, Standard Chartered, Google, Shopify, Coinbase, and others. A subsequent blog post titled "OUSD is live" confirms the token is now available for businesses and developers to use.

**Model:** Zero-cost mint and redeem; reserve yield returned to participating partners net of a management fee. Governance through a partner board. Over 200 partners as of the latest post.

**What is NOT yet established:**
- No circulating supply data on CoinGecko or DefiLlama (returns 0.0 / null)
- No launch chain named in primary materials
- No measurable transaction volume or adoption metrics
- Circle and Tether are absent from the partner list
- The token is absent from DefiLlama's 427 tracked pegged assets

**Assessment:** The announcement is real and the token is live, but measurable adoption data does not yet exist. The model (partner-governed, zero-fee, yield-sharing) is a design choice, not a measured outcome. The absence of Circle and Tether from the partner list is notable - the two largest issuers are not participating.

---

## 3. RWA Depth

### 3.1 Market Size

Tokenized RWA (excluding stablecoins) reached approximately $38.6B in on-chain value as of September 27, 2026, per rwa.xyz. This is up from $33.5B in July 2026 and ~$18-26B in 2025. The trajectory: ~$2B (2022) -> ~$6.4B (end-2024) -> ~$18-26B (2025) -> $31-38B (mid-2026).

**Segment breakdown (September 2026):**
- Tokenized US Treasuries & MMFs: $14.7B (76 products, ~58,700 holders)
- Private credit: $7.9-18.9B (methodology-dependent; $33.7B originated all-time)
- Commodities (mostly gold): $5.5B
- Corporate bonds: $1.77B
- Tokenized equities: $0.5-1B (newest category, accelerating after Nasdaq March 2026 approval)
- Real estate: $1-3B (estimated)

**Critical caveat:** 56% of reported RWA value sits idle (thirdweb analysis). Tokenized Treasuries and private credit trade thinly, with activity dominated by mint-and-redeem cycles rather than secondary transfers. $524.8B of RWA perpetuals traded in Q1 2026 against ~$33B of spot value - derivatives dwarf the underlying.

### 3.2 Legal Structure and Holder Rights

RWA tokens are legally securities, not payment instruments. The SEC's January 28, 2026 joint statement confirmed that "tokenization doesn't change the legal nature of the underlying asset - if an asset is a security offchain, it remains a security when tokenized."

**Three tokenization models (Franklin Templeton):**

1. **Digitally native tokens:** Direct exposure to underlying assets. Token holders are official owners with full rights including voting. Franklin Templeton's tokenized money market fund is an example. Most restrictive (permissioned, KYC/AML required).

2. **Synthetic exposure tokens:** Token holders own shares of an SPV that houses the underlying assets. No direct ownership rights or investor protections. "Token holders do not possess ownership rights, nor investor protections linked to the underlying assets." Robinhood, Kraken, and Ondo tokenized stocks use this model. Permissionless (KYT only).

3. **Digital twin tokens:** Ownership recorded off-chain; token functions as a receipt. Subject to T+1 settlement. DTCC, NYSE, and Nasdaq planned issuances use this model.

**Key legal risk:** Where tokens are issued through bankruptcy-remote SPVs, underlying assets are intended to be protected. Weaker structures may leave holders as unsecured creditors. The legal structure behind the token determines recovery prospects in issuer insolvency.

### 3.3 Securities vs Payment Instruments

The dividing line between stablecoins and RWA funds is yield and access, not the underlying asset:
- **Stablecoins (payment instruments):** No yield to holders, 1:1 reserve backing, redeemable at par for approved institutions. GENIUS Act prohibits interest payments.
- **RWA funds (securities):** Pay yield, require KYC, restrict transfers, T+1 redemption. Subject to securities laws.

Institutions pair stablecoin (checking) with tokenized fund (yield sweep). The same T-bills sit in both, under different legal wrappers.

### 3.4 Collateral and Redemption

Stablecoin redemption: Retail cannot redeem with the issuer at par (institutional minimums and KYC apply). Secondary markets enforce the retail price. This is why a Curve pool can wobble while primary collateral sits intact.

RWA fund redemption: T+1 settlement, mint-and-redeem cycles dominate. Secondary market liquidity is thin. 56% of RWA value sits idle.

### 3.5 Reserve Yield Economics

The gap between what reserves earn and what the holder receives is the entire business model for stablecoin issuers. Key figures:
- Tether Q2 2026: $1.5B "net operating profit" (release headline) vs -$4.21B change in net equity (attestation). Tether publishes no reconciliation.
- Circle Q2 2026: $667.7M reserve income (95.2% of revenue). FY2025: $2.64B reserve income, but -$69.5M net loss due to $844.9M compensation expense.
- The GENIUS Act prohibits paying yield to holders. Retention of reserve income is unregulated rather than permitted.

---

## 4. Economics and US Debt: Testing the Thesis

### The Thesis: "Buying a USD stablecoin means buying US debt"

**What is true:**
- Stablecoin issuers hold $150B+ in US Treasuries (mostly T-bills)
- The GENIUS Act legally binds issuer reserves to T-bills of 93 days or less
- Tether alone (~$141B) exceeds the holdings of Germany ($91.3B) and Norway ($104.4B) per TIC data
- BIS research confirms stablecoin inflows measurably reduce 3-month T-bill yields (0.71 bps on impact, up to 4 bps within 10 days for a $3.5B inflow)
- In 2025, stablecoin issuers purchased nearly $35B of T-bills, similar to the largest US government money market funds

**What is incomplete or misleading:**
- The Kansas City Fed (Jacewitz, 2025) directly tests this thesis and finds the net effect depends on the source of funds. "An additional $1 in stablecoins would increase total Treasury holdings by $0.50" but "the corresponding $1 less in bank deposits would decrease Treasury holdings by $0.08." Net effect: +$0.30 in Treasury demand per $1 shifted, not +$1.
- "Should the sources of the funds that are shifted toward stablecoins sell Treasuries at the same rate that stablecoin issuers purchase them, then a larger stablecoin market will have no net effect on Treasury demand at all."
- If households sell existing Treasuries to buy stablecoins, Treasury demand would actually decline.
- The comparison is duration-mismatched: issuers hold short-dated T-bills, while TIC ranks total (long+short) foreign holdings.

**The "recycled dollars" question:**
- The Fed's FEDS Note (Wang, 2025) finds that foreign demand for USD stablecoins may actually increase deposits in US banks if issuers hold reserves domestically, potentially offsetting domestic outflows.
- Stablecoin issuers' bank deposit shares vary widely: Circle ~13%, Tether near-zero, GUSD bank-deposit only.
- If issuers hold reserves primarily as bank deposits, this maintains banking system size while shifting from insured retail to uninsured wholesale deposits.
- If issuers invest in Treasuries instead, this could reduce bank deposits, but the effect depends on whether counterparties ultimately deposit proceeds back into the banking system.

**Incremental vs recycled Treasury demand:**
- The Kansas City Fed's calculation: $1 moved from banks to stablecoin issuers increases total Treasury holdings by $0.30 (not $1), because banks also hold Treasuries (8% of assets) and loans (50% of assets).
- The net effect on Treasury demand is positive but partial. The net effect on bank lending is negative (~-$0.50 per $1 shifted).
- At $2T stablecoin scale (Standard Chartered projection), the incremental Treasury demand could be substantial, but it would be partially offset by reduced bank Treasury holdings and reduced loan supply.

**Verdict on the thesis:** "Buying a USD stablecoin means buying US debt" is directionally true but quantitatively overstated. The net incremental Treasury demand is roughly $0.30 per $1 of stablecoin issuance (if sourced from bank deposits), not $1. If sourced from existing Treasury holders, the net effect could be zero or negative. The thesis conflates gross issuer holdings with net incremental demand.

---

## 5. Bank Deposits and Lending

**The disintermediation debate is genuinely contested:**

**NY Fed Staff Report 1185 (Lee & Tou, Feb 2026):** Banks exposed to stablecoin flows lend less relative to peers. Partner banks run "narrow" to absorb flow volatility. First direct evidence of liquidity-driven disintermediation.

**Federal Reserve FEDS Note (Wang, Dec 2025):** For each $100B of net deposit drain not recycled to banks, $60-126B contraction in bank lending. Aggregate credit supply likely to decline, lending costs may rise.

**White House CEA (Apr 2026):** Minimal lending impact modeled. Assumes small baseline market. Criticized by Americans for Financial Reform and Consumer Bankers Association.

**State Street (2026):** Yield-bearing stablecoins could lead to trillions less in bank credit. $2T stablecoin growth without yield implies ~10% deposit reduction and +24bp funding cost increase.

**Key distinction:** The impact depends on (1) whether stablecoins pay yield (GENIUS Act says no), (2) where demand originates (domestic deposits vs foreign inflows vs MMFs), and (3) how issuers manage reserves (bank deposits vs T-bills vs repo).

---

## 6. Dollarization and Monetary Sovereignty

- 98% of stablecoins by value are USD-pegged (BIS)
- Turkey: 4.3% of GDP in stablecoin purchases (highest measured)
- Argentina: >60% of exchange crypto purchases are USDT/USDC
- Nigeria: ~60% of sub-Saharan Africa stablecoin inflows since 2019
- BIS Working Paper 1370 (Jul 2026): Stablecoin flows show little response to capital controls, unlike bank deposits
- ECB's Lagarde (May 2026): "It is no longer about whether stablecoins should exist, but whether jurisdictions can afford to be without them"

**Monetary sovereignty risk:** When citizens choose USD stablecoins over national currency, monetary policy loses transmission mechanism. Central banks could lose power of monetary tools if stablecoins backed by foreign assets become the norm.

---

## 7. x402 and Agent Payments

**Protocol status:** Live since 2025. x402 Foundation (Linux Foundation) operational launch July 14, 2026.

**Volume data (conflicting):**
- x402scan: $996,474 across 18.1M transactions (~30 days to 2026-09-26)
- x402.org: $24.24M across 75.41M transactions ("last 30 days", undated)
- Coinbase CDP: 100M+ payments (cumulative, unbounded)
- TRM Labs: $52.7M across 198.9M transactions (cumulative to 2026-09-09)
- Bitquery: $2.59B across 18.3M payments (August 2026)

**Critical finding (TRM Labs via PYMNTS, Sep 2026):** After filtering, only 0.6% to 7.5% of payment value appeared to be agentic. Most x402 payments are NOT from AI agents - they are ordinary software scripts, scheduled processes, and self-dealing.

**Chainalysis (Jun 2026):** 100M+ transactions on Base, but "much of the growth was driven by meme coin farming activity" (PING). Transactions of $1+ now represent 95% of volume, up from 49% in early 2025.

**Median transaction:** $0.006 (Base), $0.001 (Optimism), $0.01 (Polygon) per Bitquery. Agent payments today are overwhelmingly tiny machine-to-machine calls, not commerce.

**Assessment:** x402 is a live settlement rail with real volume, but the "agent commerce" narrative is ahead of the data. Most activity is testing, scripts, and speculative activity rather than autonomous AI agent commerce.

---

## 8. Methodology and Data Validation

**Measurement disagreements are the finding, not a problem to resolve:**
- RWA market size: $31-38B depending on tracker and methodology
- x402 volume: $996K to $2.59B depending on window and inclusion rules
- Stablecoin market cap: $289-303B depending on aggregator
- Treasury holdings: Tether's own release vs attestation disagree by ~$5.7B for Q2 2026

**Key methodological principles:**
1. Every claim must carry a source and as-of date
2. Where sources disagree, report the range and explain why
3. Distinguish source-reported data from measured data
4. Distinguish gross from net (issuer holdings vs incremental demand)
5. Distinguish cumulative from period-specific
6. Distinguish measured from modeled (CEA vs Fed vs BIS models reach different conclusions)

**Falsifiers:**
- No live issuance/adoption disproves a launch claim
- Restrictive rights disprove an unrestricted-ownership claim
- Unadjusted transfer counts do not establish commerce
- Reinvested existing dollar assets do not alone establish net new Treasury financing
- Issuer custody does not establish direct holder ownership of reserves

---

## 9. Bull and Bear Narratives

### Bull Narrative
Stablecoins are becoming structural buyers of US debt, a payments rail, and a dollarization force. The GENIUS Act locks in T-bill demand. RWA tokenization is the fastest-growing institutional crypto category. By 2030, stablecoins could reach multi-trillion scale. Open Standard's partner-governed model could challenge Circle and Tether's dominance. x402 is the HTTP for money.

### Bear Narrative
The "buying stablecoin = buying US debt" thesis is overstated - net incremental Treasury demand is ~$0.30 per $1, not $1. RWA is $38B against $7.9T in money market funds - a rounding error. 56% of RWA value sits idle. x402 volume is mostly bots and testing, not commerce. Open USD has no measurable supply or adoption. Bank disintermediation is contested with no consensus number. The 2026 growth rate (+1.5% YTD) is far below the multi-trillion forecasts.

### Observable Tests
1. Does OUSD circulating supply appear on CoinGecko/DefiLlama? (If not by Q1 2027, the launch is not material)
2. Does T-bill issuance increase in line with stablecoin growth? (Net incremental demand test)
3. Does x402 median transaction size rise above $1? (Commerce vs plumbing test)
4. Does RWA secondary market volume exceed mint/redeem volume? (Real market test)
5. Do bank loan-to-asset ratios contract at stablecoin partner banks? (Disintermediation test)

---

## 10. Unknowns and Inaccessible Sources

- Open USD circulating supply, launch chain, and adoption metrics: not yet published
- Tether's reconciliation between $1.5B "net operating profit" and -$4.21B change in net equity: not published
- x402 all-time transaction count from first party: not published
- Reconciliation between x402 headline numbers (4x-24x spread): not published
- AP2 production deployment: not sourceable
- 2026 Visa TAP or Mastercard Agent Pay transaction count: not published
- Named news publisher serving paid content over x402 in production: not found

---

## 11. Evidence Captures

All evidence is saved in `evidence/` directory as JSON files with URL, retrieval timestamp, source date, and key passages. 15 captures total.

---

*Research only. No publication approval. All claims trace to saved evidence.*
