# Firecrawl Recovery: Source-Grounded Research Leads

**Generated:** 2026-10-01  
**Method:** Firecrawl v2 scrape (https://api.firecrawl.dev/v2/scrape) with markdown+html formats  
**Scope:** 22 unique source URLs fetched, 40 claims verified against original passages

---

## 1. Recovery Summary

| Metric | Value |
|--------|-------|
| Total claims in ledger | 40 |
| Claims with existing captures | 11 |
| Claims with new Firecrawl captures | 29 |
| Unique source URLs fetched | 22 |
| Successful fetches | 22 |
| Credits used | 75 (from 10,764 remaining) |

### Verification Results

| Status | Count | Description |
|--------|-------|-------------|
| Verified | 20 | Exact passage found in captured content |
| Partial | 19 | Key phrases/numbers found but exact wording differs |
| Mismatch | 1 | Content does not support the claim (NM-040: IMF landing page only) |
| Failed | 0 | All fetches succeeded |

---

## 2. Key Findings from Primary Sources

### 2.1 GENIUS Act Statutory Text ( congress.gov )

**Source:** https://www.congress.gov/bill/119th-congress/senate-bill/1582/text  
**Captured:** 140,823 chars markdown  
**Status:** Primary statutory text

**Effective Date Mechanics:**
> "EFFECTIVE DATE. This Act, and the amendments made by this Act, shall take effect on the earlier of (1) the date that is 18 months after the date of enactment of this Act; or (2) the date that is 120 days after the date on which the primary Federal payment stablecoin regulators issue any final regulations"

**Permissible Reserves (Section 4):**
> "maintain identifiable reserves backing the outstanding payment stablecoins of the permitted payment stablecoin issuer on an at least 1 to 1 basis, with reserves comprising— (i) United States coins and currency... (ii) funds held as demand deposits... (iii) Treasury bills, notes, or bonds— (I) with a remaining maturity of 93 days or less; or (II) issued with a maturity of 93 days or less; (iv) money received under repurchase agreements... backed by Treasury bills with a maturity of 93 days or less; (v) reverse repurchase agreements... collateralized by Treasury notes, bills, or bonds on an overnight basis"

**Key Research Leads:**
- The 93-day T-bill requirement is statutory, not just a secondary source interpretation
- Reserves must be 1:1 and identifiable
- Rehypothecation is prohibited except for specific purposes
- Payment stablecoins are NOT backed by the full faith and credit of the US
- The effective date could shift earlier if final regulations are issued before January 18, 2027

### 2.2 OUSD Issuance and Legal Rights (Bridge + Open Standard)

**Sources:**
- https://www.bridge.xyz/blog/ousd-is-live-issued-by-bridge
- https://joinopenstandard.com/blog/ousd-is-live
- https://joinopenstandard.com/blog/introducing-open-usd
- https://reserves.bridge.xyz/ousd

**Key Findings:**

1. **Issuer:** OUSD is issued by Bridge Building Inc., NOT Bridge National Trust Bank
   - "OUSD is currently issued by Bridge Building Inc.. The OCC's conditional approval is subject to additional requirements and does not constitute final charter approval or authorization for Bridge National Trust Bank to issue OUSD under the GENIUS Act."

2. **Reserve Custodians:** BlackRock, Lead Bank, and BNY
   - "OUSD is issued by Bridge, a Stripe company, with reserves held at BlackRock, Lead Bank and BNY."

3. **Partner vs. Holder Economics:**
   - "Partners receive all of the earnings from Open USD's reserves, less a small management fee to cover Open USD's operational costs."
   - This is PARTNER economics, NOT holder economics. OUSD token holders do NOT receive reserve earnings.

4. **Reserve Snapshot (as of Oct 1, 2026):**
   - Total Supply: $468,445,399
   - Cash: $257,214,691 (54.9%)
   - Treasury: $211,230,708 (45.1%)
   - "Treasuries include money-market funds comprised of T-bill ladders with less than 3-month duration."

5. **Minting/Redemption:**
   - "Businesses can mint and redeem Open USD at no cost and with no artificial limits on volume."
   - "Bridge will not charge fees for minting or redeeming or impose liquidity restrictions that delay those transactions."

**Key Research Leads:**
- OUSD's reserve composition (45.1% Treasuries) is close to the GENIUS Act's permissible reserve requirements
- The partner yield-sharing model is a structural departure from USDT/USDC where issuers capture reserve earnings
- Bridge National Trust Bank is not yet operational; the OCC approval is conditional
- The $468M supply is held by very few wallets (47 on Solana at launch)

### 2.3 Stablecoin Market Data (Reap Global / DefiLlama)

**Source:** https://reap.global/blog/stablecoin-statistics-2026  
**Captured:** 40,921 chars markdown

**Key Figures:**
- Total stablecoin market cap: $308.0 billion (as of Aug 13, 2026)
- USDT: ~59% of supply, USDC: ~23%, together ~82%
- ~99.5% dollar-denominated
- USDC transaction volume: $18.3T in 2025, USDT: $13.3T
- Stablecoin supply has "decoupled from the crypto price cycle"

**Key Research Leads:**
- The supply vs. usage divergence (USDT dominates supply, USDC dominates volume) is a structural feature
- The "decoupling" claim needs further investigation - is it truly decoupling or just different cyclical dynamics?

### 2.4 Tether Treasury Exposure (Tether Q1 2026 Attestation)

**Source:** https://tether.io/news/tether-posts-1-04b-q1-2026-profit-despite-highly-volatile-global-markets-reaches-all-time-highs-8-23b-reserve-buffer-and-maintains-u-s-treasury-heavy-backing/  
**Captured:** 8,260 chars markdown

**Key Findings:**
- "As of March 31, 2026, direct and indirect exposure to U.S. Treasury bills amounted to approximately $141 billion"
- "This positions Tether as the 17th largest holder of U.S. Treasuries globally"
- Q1 2026 profit: $1.04 billion
- Reserve buffer: $8.23 billion (all-time high)
- Gold holdings: ~$20 billion
- Bitcoin holdings: ~$7 billion

**Key Research Leads:**
- Tether's $141B Treasury exposure is a significant source of demand for short-duration government debt
- The "17th largest holder" claim should be verified against current Treasury data
- Tether's profit model depends on reserve yield, creating demand for short-term instruments

### 2.5 BCG Stablecoin Payments Analysis

**Source:** https://www.bcg.com/assets/2026/white-paper-stablecoin-payments-truth-behind-numbers.pdf  
**Captured:** 29,345 chars markdown

**Key Findings:**
- "in 2025, there was approximately $350-$550 billion of observable bilateral payments for exchange settlements and stablecoin card-based payments"
- "Real economy payments ($350-550 billion): This category represents payments for goods and services"
- B2B payments: ~40% of real economy payments, growing at 65% per year
- C2C payments: ~25% of total
- C2B payments: ~25% of total
- B2C payments: ~10% of total
- TRON is the dominant rail by volume (~$235-375 billion of transactions)
- "As of December 2025, stablecoin market capitalization exceeded $307 billion"

**Key Research Leads:**
- The $350-550B "real economy payments" figure is much lower than the $28-62T gross transfer volume
- B2B is the largest segment, suggesting stablecoins are primarily a business payment tool
- TRON dominance suggests cost-sensitive use cases (remittances, cross-border)

### 2.6 Forbes: Stablecoins vs. ACH

**Source:** https://www.forbes.com/sites/digital-assets/2026/04/20/rails-have-shifted-stablecoins-topped-ach-at-75-trillion-a-month/  
**Captured:** 21,121 chars markdown

**Key Findings:**
- "In February alone, stablecoin monthly volume hit $7.2 trillion, surpassing the US ACH network ($6.8T) for the first time in history"
- "Stablecoin onchain settlement hit $7.2 trillion in February on a 30-day rolling basis"
- "The $7.5 trillion settlement number is the demand-side counterpart to a year of regulated infrastructure builds"
- "Stablecoin total supply has reached $315 billion, up from roughly $200 billion at the start of 2025"

**Key Research Leads:**
- The $7.2T vs. ACH comparison depends on methodology (Artemis Analytics)
- Raw onchain volume includes DeFi liquidity provisioning, MEV, and arbitrage flows
- The "surpassing ACH" claim is significant but needs methodological scrutiny

### 2.7 IMF Working Paper on Stablecoins and Payments

**Source:** https://www.imf.org/en/publications/wp/issues/2026/03/20/stablecoins-and-the-future-of-payments-evidence-from-financial-markets-574831  
**Captured:** 6,364 chars markdown (landing page only)

**Status:** MISMATCH - The captured content is only the landing page, not the full working paper. The $300 billion figure claimed in NM-040 is NOT in the captured markdown.

**Key Research Leads:**
- The IMF working paper (WP/2026/052) examines financial market expectations for stablecoins in payments
- The actual paper content was not captured; the $300B figure needs verification from the PDF
- The paper uses "high-frequency variation in stock prices" to estimate market expectations

---

## 3. New Research Leads for Causal Investigation

### Lead 1: Partner Yield-Sharing as Distribution Incentive

**Question:** Does OUSD's model of returning reserve earnings to partners (not holders) create genuine distribution advantages over incumbents?

**Evidence:**
- OUSD: "Partners receive all of the earnings from Open USD's reserves, less a small management fee"
- USDT: Tether captures reserve earnings ($1.04B profit in Q1 2026)
- USDC: Circle captures reserve earnings

**Competing Hypotheses:**
- H1a: Partner yield-sharing creates genuine distribution incentives
- H1b: Partner yield-sharing is economically equivalent to existing rebate structures
- H1c: The model is unsustainable at scale

**Falsifier:** If OUSD supply remains below $1B after 6 months, the model is not driving adoption

### Lead 2: Stablecoin Reserve Demand vs. RWA Tokenization

**Question:** Is RWA tokenization additive to or substitutive for stablecoin Treasury demand?

**Evidence:**
- Stablecoin issuers hold $141B+ in Treasuries (Tether alone)
- Tokenized RWA market: $30B+ (excluding stablecoins)
- Both compete for short-duration Treasury demand

**Competing Hypotheses:**
- H2a: Complementary (stablecoins = payment rail, RWA = yield-bearing asset)
- H2b: Substitutive (both compete for same Treasury demand)
- H2c: RWA recycles existing Treasury holders, stablecoins create new demand

**Falsifier:** If RWA tokenized Treasury products show inflows from existing MMF investors, H2c is supported

### Lead 3: x402 Commerce vs. New Issuance

**Question:** Does x402 drive new USDC issuance (creating new Treasury demand) or just transfer existing USDC?

**Evidence:**
- x402 has 100M+ transactions on Base
- Much of the growth was driven by meme coin farming (PING)
- USDC is the primary stablecoin used in x402 transactions

**Competing Hypotheses:**
- H3a: x402 drives new USDC issuance (new Treasury demand)
- H3b: x402 transfers existing USDC (no new Treasury demand)
- H3c: x402 is neutral but affects velocity

**Falsifier:** If USDC minting spikes correlate with x402 volume growth, H3a is supported

### Lead 4: Governance vs. Issuer Control

**Question:** Does Open Standard's partner governance model actually constrain Bridge (Stripe) as the sole issuer?

**Evidence:**
- OUSD is issued by Bridge Building Inc. (a Stripe company)
- Bridge National Trust Bank is not yet operational
- Open Standard is "an independent company" with partner governance

**Competing Hypotheses:**
- H4a: Partner governance is genuine and constrains Bridge
- H4b: Partner governance is cosmetic; Bridge controls issuance
- H4c: The governance model is transitional until Bridge National Trust Bank is operational

**Falsifier:** If Bridge unilaterally changes OUSD terms on its platform, H4b is supported

### Lead 5: GENIUS Act Effective Date and Market Structure

**Question:** How will the GENIUS Act's effective date (Jan 18, 2027 or earlier) reshape the stablecoin market?

**Evidence:**
- The Act requires 1:1 reserves in permitted assets (93-day T-bills, etc.)
- The Act prohibits rehypothecation
- The Act provides bankruptcy priority for stablecoin holders
- OCC, FDIC, and NCUA have proposed rules but not final rules

**Key Research Leads:**
- The 93-day T-bill requirement could increase demand for short-duration government debt
- The bankruptcy priority provision could make stablecoins more attractive than bank deposits
- The effective date could shift earlier if final regulations are issued soon

---

## 4. Unresolved Gaps

1. **NM-003 (Bloomberg):** The $18.3T vs. $13.3T figures are confirmed in the Bloomberg article, but the exact passage wording differs from the claim. The numbers are correct.

2. **NM-004 (BCG):** The $350-550B range is confirmed in the BCG white paper, but the exact passage wording differs. The numbers are correct.

3. **NM-005 (Congress):** The GENIUS Act text confirms the effective date mechanics. The 93-day T-bill requirement is statutory.

4. **NM-019 (Tether):** The $141B Treasury exposure is confirmed in Tether's Q1 2026 attestation.

5. **NM-030 (Forbes):** The $7.2T stablecoin volume surpassing ACH is confirmed, but the exact passage wording differs.

6. **NM-032 (Spark.money):** BUIDL is confirmed on 8 chains, but the $2.5-2.9B AUM figure is not in the captured content.

7. **NM-040 (IMF):** The $300B figure is NOT in the captured content (landing page only). The actual working paper PDF was not captured.

8. **OUSD Legal Rights:** No capture explicitly states that OUSD token holders have direct legal title to reserve assets. The legal structure appears to be an issuer liability model (like USDC), not a direct ownership model.

9. **x402 "True Commerce" Volume:** The proportion of organic vs. speculative x402 transactions remains unknown.

10. **RWA "Idle" Definition:** The 56% idle figure's methodology is not fully specified.

---

## 5. Capture Files

All raw capture data is stored in:
`/mnt/ai-archive/other-tools/stablesense/docs/research/2026-10-01-state-of-stablecoins/firecrawl-recovery/captures/`

Each file contains:
- Full markdown content
- Full HTML content
- Metadata (URL, timestamp, HTTP status, content type)
- Capture timestamp

The evidence manifest is at:
`/mnt/ai-archive/other-tools/stablesense/docs/research/2026-10-01-state-of-stablecoins/firecrawl-recovery/evidence-manifest.json`

The verification ledger is at:
`/mnt/ai-archive/other-tools/stablesense/docs/research/2026-10-01-state-of-stablecoins/firecrawl-recovery/verification.json`
