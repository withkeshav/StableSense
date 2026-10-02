# Native Market Research: Stablecoin Market Structure, Open Standard/Open USD, RWA, x402, and Data Validation

**Research date:** 2026-10-01  
**Researcher:** Hermes subagent (Nous meituan/longcat-2.5-preview:free)  
**Scope:** Complete StableSense expansion scope - state of stablecoins, Open Standard/Open USD, RWA, economic impact/US debt, x402, data validation and narratives

---

## 1. State of Stablecoins

### Market Size and Structure

The stablecoin market reached approximately $308 billion in total market capitalization as of mid-August 2026, up ~14.3% year-over-year from ~$269 billion in August 2025 (DefiLlama). The all-time peak was ~$322 billion on May 17, 2026. The Federal Reserve noted aggregate market cap reached $317 billion as of April 6, 2026, representing >50% growth since early 2025.

**Concentration:** Tether (USDT) holds ~59% of stablecoin supply, USD Coin (USDC) ~23%, together ~82% of the market. Beyond the top two, the largest are Sky Dollar (USDS) ~2.1%, DAI ~1.5%, World Liberty Financial USD (USD1) ~1.3%, Ethena USDe ~1.3%, Global Dollar (USDG) ~1.1%, PayPal USD (PYUSD) ~0.9%, Ripple USD (RLUSD) ~0.5%.

**Supply vs. Usage Divergence:** USDT leads by supply (~59%) and on-chain trading volume (~74% on centralized exchanges), but USDC overtook USDT by annual adjusted transaction volume in 2025: $18.3 trillion vs. $13.3 trillion (Artemis, via Bloomberg). This means the ranking flips depending on whether you measure supply or usage.

**Real Payments vs. Gross Transfers:** Of the $28-62 trillion in gross stablecoin transfers in 2025, independent studies from BCG, McKinsey, and BIS estimate only about $350-550 billion was genuine real-economy payment activity. Most on-chain volume is trading, protocol activity, and moving funds between wallets and exchanges.

**Regional Distribution:** Asia is the largest stablecoin-flow region at ~$12.5 trillion in 2025 (+67% YoY). The majority of stablecoin flows occur outside the United States despite the dollar's dominance.

### Regulatory Landscape

The GENIUS Act was signed into law on July 18, 2025. Its effective date is the earlier of January 18, 2027 (18 months after enactment) or 120 days after primary federal regulators issue final implementing regulations. As of October 2026, the Act is not yet in effect. The OCC published a proposed rule in February 2026, the FDIC in April 2026, and the NCUA in May 2026. Comment periods have closed or are closing.

The EU's MiCA framework has applied since mid-2024. Hong Kong, UK, Singapore, Japan, and UAE have comparable frameworks. These regimes converge on full reserve backing, redemption at par value, and a ban on paying interest to holders.

Circle received OCC approval to operate as a trust bank (Circle National Trust) in July 2026. Stripe's Bridge received conditional OCC approval for Bridge National Trust Bank in February 2026, but it is not yet operational.

### Reserve Composition and Transparency

- **Tether (USDT):** Reported approximately $141 billion of direct and indirect US Treasury bill exposure as of March 31, 2026 (Q1 2026 attestation by BDO). States this ranks it as the 17th largest holder of US Treasuries globally. Reserves include ~84.5% cash equivalents, 8.2% secured loans, and smaller allocations to corporate bonds and precious metals.
- **USDC (Circle):** Reserves held through the Circle Reserve Fund, an SEC-registered 2a-7 government money market fund managed by BlackRock and custodied at BNY Mellon. Holds cash, short-dated US Treasuries, and overnight Treasury repurchase agreements. Circle publishes monthly third-party attestations.
- **Gemini GUSD:** Backed 100% by bank deposits (May 2026 attestation).

---

## 2. Open Standard / Open USD (OUSD)

### Announcement and Launch Timeline

- **June 30, 2026:** Open Standard announced Open USD (OUSD) with 140+ partner businesses including Visa, Mastercard, Stripe, BlackRock, Coinbase, and others.
- **September 24, 2026:** Open Standard published company structure update, naming Coinbase, Mastercard, Shopify, Stripe, and Visa as initial founding partners investing in the company and delivering $1B+ in near-term launch liquidity. Zach Abrams named full-time CEO.
- **September 30, 2026:** OUSD went live on Base, Ethereum, Solana, and Tempo blockchains. Integration paths live: BVNK, Stripe, Visa Stablecoin Platform (Coinbase starting October 1). Exchange support: Coinbase, Kraken, Uniswap.

### Legal Issuer and Structure

OUSD is issued by **Bridge Building Inc.**, a Stripe company. Bridge received conditional OCC approval to establish Bridge National Trust Bank in February 2026, but this entity is **not yet operational** and does not currently issue OUSD. The OCC's conditional approval is subject to additional requirements and does not constitute final charter approval or authorization for Bridge National Trust Bank to issue OUSD under the GENIUS Act.

Reserves are held at **BlackRock, Lead Bank, and BNY**. Reserve attestations are published monthly at reserves.bridge.xyz/ousd.

As of October 1, 2026, OUSD total supply in circulation was **$468,445,399** (100% collateralized), with $257.2M in cash (54.9%) and $211.2M in Treasuries (45.1%, including money-market funds with T-bill ladders <3-month duration).

### Governance Model

Open Standard is an independent company governed by a board of directors representing its shareholders. The five founding partners (Coinbase, Mastercard, Shopify, Stripe, Visa) are investing in the company. All founders and participating partners (200+ as of September 30, 2026) have the opportunity to earn equity based on the supply and activity they drive on their platforms. Over time, Open Standard will establish a board of directors drawn from its founders and representing its shareholders.

CEO Zach Abrams co-founded Bridge before Stripe acquired it for ~$1.1 billion. He led product teams at Square, Coinbase, and Brex.

### Distribution Economics

OUSD's core innovation is the redistribution of reserve economics:

1. **Zero-cost mint and redeem:** No fees for minting or redeeming OUSD, with no artificial limits on volume.
2. **Reserve earnings shared:** Partners receive all of the earnings from OUSD's reserves, less a small management fee to cover operational costs. This is a fundamental departure from the conventional model where the issuer captures most reserve income.
3. **No exit fees:** Businesses do not pay burn fees when redeeming OUSD.
4. **Equity participation:** Founders and partners can earn equity in Open Standard based on supply and activity they drive.

The model incentivizes utility and transaction volume rather than AUM accumulation. Open Standard charges developers a small fee on transactions, aligning its business model with payment networks.

### Partners vs. Integrations

The partner list (200+ companies) represents businesses that have signed up to use OUSD, but this is distinct from live integrations. As of launch (September 30, 2026):

- **Live integration paths:** BVNK, Stripe, Visa Stablecoin Platform (Coinbase from October 1)
- **Exchange support:** Coinbase, Kraken, Uniswap
- **Chains:** Base, Ethereum, Solana, Tempo

The gap between the 200+ partner list and actual live integrations is a key metric to track. Many partners are financial institutions and payment companies that have expressed intent but have not yet routed volume through OUSD.

### Launch vs. Live Use

OUSD launched with ~$468 million in total supply as of October 1, 2026. On Solana, 18.01 million OUSD in supply was held by 47 wallets as of September 30, 2026 (launch day). For scale, USDC on Solana had 7.86 billion in supply across 9.31 million holders at the same time.

Bridge has issued over $1 billion across dozens of stablecoins (including OUSD) over the past two years, but OUSD-specific volume is not yet separately disclosed.

### Bullish Thesis

1. **Unprecedented industry coalition:** 200+ companies including the largest payment networks, banks, and fintechs have joined. This is the broadest coalition ever assembled for a stablecoin launch.
2. **Economic alignment:** By sharing reserve earnings with distribution partners, OUSD creates direct financial incentives for partners to prefer it over incumbent stablecoins whose yield they never see.
3. **Zero-cost model:** Eliminating mint/redeem fees and exit fees removes friction that prevents businesses from using stablecoins for transactions.
4. **Regulatory positioning:** Bridge's conditional OCC approval and the GENIUS Act framework provide a path to full compliance.
5. **Incumbent vulnerability:** Circle's stock dropped ~15% on the OUSD announcement, suggesting the market sees OUSD as a credible threat to the issuer-captures-the-float model.

### Strongest Countercase

1. **Zero adoption proof:** OUSD launched with $468M supply vs. USDT's ~$183B and USDC's ~$73B. The gap is enormous and network effects favor incumbents.
2. **Partner list ≠ adoption:** The 200+ partner list represents intent, not live volume. USDG (a previous consortium stablecoin attempt) grew to only ~$3 billion after nearly two years.
3. **Issuer concentration risk:** Despite the governance rhetoric, OUSD is issued by Bridge (a Stripe company), and Stripe is making OUSD the default for its platform. This is not truly decentralized governance.
4. **Regulatory uncertainty:** Bridge National Trust Bank is not yet operational. The GENIUS Act is not yet in effect. The legal framework for OUSD's issuance is still evolving.
5. **Incumbent response:** Circle has deep liquidity, wide footprint across 30+ blockchains, and regulatory edge. Circle could pre-emptively widen reserve income sharing to defend its position.
6. **Solana concentration:** At launch, OUSD on Solana had only 47 wallets, suggesting limited initial distribution.

---

## 3. Real-World Assets (RWA)

### Market Size

The tokenized RWA market (excluding stablecoins) reached approximately $30-33.5 billion in on-chain value as of mid-2026, according to RWA.xyz. This represents growth of roughly 240-500% from 2024 levels (~$5-7.9 billion). The market added over $10 billion in the first five months of 2026 alone.

**Important distinction:** RWA.xyz distinguishes between "distributed value" (tokens actually issued and freely tradable on-chain, ~$33.5B) and "represented value" (assets committed to tokenization but not yet liquid, ~$345 billion). Different sources cite wildly different figures depending on which measure they use.

### Category Breakdown (mid-2026)

| Category | Approximate Value | Notes |
|----------|------------------|-------|
| US Treasuries | $12.9-16.2B | Largest category; led by BlackRock BUIDL |
| Private Credit | ~$5-12B | Varies by source; some methodologies weight this as largest |
| Commodities (mostly gold) | ~$4.6-7.3B | Led by PAXG, XAUT |
| Tokenized Equities | $1.3-2.2B | Fastest-growing segment (~50% in 30 days) |
| Bonds (non-Treasury) | ~$1.77B | Corporate, municipal, structured products |
| Real Estate | Low hundreds of millions | Limited on-chain traction |

### Key Products and Institutions

- **BlackRock BUIDL:** ~$2.5-2.9B in tokenized Treasury-backed money market fund. Live on 8 blockchains. Became tradeable on Uniswap via UniswapX in February 2026.
- **Circle USYC:** ~$2.7-3.0B in tokenized US Treasuries.
- **Franklin Templeton BENJI:** ~$1.0B in tokenized money market fund.
- **Ondo Finance:** ~$2.6B across tokenized Treasury products.
- **WisdomTree WTGXX:** ~$861M.

### Institutional Infrastructure

The DTCC (which clears and settles nearly all US stock trades and custodies over $114 trillion in securities) is piloting tokenized securities trading with 50+ major firms including BlackRock, Goldman Sachs, JPMorgan, and Ripple Prime, with a possible commercial launch by October 2026.

### Adoption Concerns

A widely cited analysis found that 56% of tokenized assets worth over $100,000 recorded zero weekly on-chain activity. Out of 1,289 tokenized assets tracked, only 379 saw any transfers during a typical week. Only about 10% of tokenized RWA value currently flows into DeFi protocols.

---

## 4. Economic Impact and US Debt Exposure

### Stablecoin Issuer Treasury Holdings

Tether reported approximately $141 billion of direct and indirect US Treasury bill exposure as of March 31, 2026. Circle manages another ~$79 billion in USDC reserves that are roughly 84% linked to Treasuries through direct holdings and collateralized repurchase agreements.

Collectively, stablecoin issuers hold <1% of the ~$6.2 trillion total T-bill market. Stablecoin reserves represent roughly 4% of money market fund assets.

### Net New Treasury Demand vs. Substitution

The Kansas City Fed (August 2025, updated September 2026) noted that stablecoin-driven Treasury demand does not appear from nowhere: it necessarily pulls funding from other uses, including bank lending and commercial paper markets. Under the assumption that banks' and issuers' current asset mixes continue, an additional $1 in stablecoins would increase total Treasury holdings by $0.50, but the net effect of $1 moved from banks to a stablecoin issuer would decrease bank lending by ~$0.50 while increasing total Treasury holdings by ~$0.30.

The BIS found that in 2024 alone, stablecoin issuers purchased approximately $40 billion in Treasury bills, comparable to the largest US government money market funds and larger than T-bill purchases by Japan, Singapore, and Germany in the same period.

### Market Impact

The IMF (March 2026) found that the GENIUS Act wiped an estimated ~$300 billion (about 18%) off the market value of incumbent payment firms, with cross-border firms hit hardest. The IMF also found a statistically significant negative relationship between stablecoin market cap and 1-month and 3-month Treasury yields, suggesting higher stablecoin demand translates into lower T-bill yields.

Stablecoin market cap growth correlates with stock prices of Coinbase (1.436 coefficient, p<0.05), PayPal (0.521, p<0.01), and Square (0.587, p<0.05), but not with Visa, Mastercard, or Amazon.

### Projections

If the recent trend in stablecoin issuers' growth in Treasury holdings continues, the associated demand for short-term Treasury securities could nearly double to about $400 billion by the end of 2030. A $2 trillion stablecoin market would generate $800 billion to $1 trillion in incremental T-bill demand.

---

## 5. x402 and Agent Payments

### Protocol Overview

x402 is an open payment protocol developed by Coinbase, launched in May 2025. It revives the dormant HTTP 402 status code so servers can request payment and AI agents can settle it inline, with no accounts or checkout flow per call. The protocol is blockchain-agnostic at the specification level, though current implementations focus primarily on EVM-compatible networks and stablecoin settlement.

The payment flow: (1) Agent sends HTTP request without payment. (2) Server returns 402 with payment descriptor (amount, currency, destination address, nonce/expiry). (3) Agent pays and retries with X-Payment header containing encoded payment proof. (4) Server verifies on-chain and responds with requested resource.

### Adoption Metrics

Agentic payments on Base crossed 100 million cumulative transactions through Q1 2026, surging from near-zero in Q3 2025. However, much of the growth was driven by meme coin farming activity, particularly PING, a "pay-to-mint" experiment that required users to pay 1 USDC to mint tokens. PING alone processed over 150,000 transactions in its first month.

**Transaction composition:** Transactions of $1+ now represent 95% of total volume transferred, up from 49% in early 2025. Transactions between 10 cents and $1 collapsed from 46% to just 4% over the same period.

**User profile:** x402 payers have an average wallet age of 197 days (vs. 423 days for rest of Base), hold an average of 26 different tokens (vs. 4), and have received capital inflows roughly 12x higher than the average Base wallet.

**Retention:** Weekly wallet retention has been volatile but trending upward. In October 2025, PING temporarily inflated retention to 87%, which then cratered to 5%. Recent drift higher suggests ongoing utility.

### Ecosystem Integration

- **Google AP2:** x402 can sit inside Google's Agent Payments Protocol as a crypto and stablecoin settlement extension, described by Google as one of the first extensions to AP2 and its only stablecoin facilitator.
- **Cloudflare:** Offers x402 SDK for MCP clients with payment support.
- **A2A x402 Extension:** Brings cryptocurrency payments to the Agent-to-Agent (A2A) protocol, developed with Coinbase, the Ethereum Foundation, and other organizations.

### Assessment

x402 has moved beyond proof-of-concept with real users, real volume, and real retention. However, mass adoption remains distant. The current participants are crypto-native and actively funding their wallets. The window for early movers sits between first-mover advantage and waiting for further validation. The 100M+ transaction count is heavily inflated by meme coin activity and does not represent organic commerce.

---

## 6. Data Validation and Narratives

### Measurement Disagreement

Different sources provide significantly different market size figures for the same period:

| Source | Date | Market Cap | Notes |
|--------|------|-----------|-------|
| DefiLlama | Aug 13, 2026 | $308.0B | Most-cited aggregator |
| Federal Reserve | Apr 6, 2026 | $317B | FEDS Notes |
| Brookings | June 2026 | ~$270B | Liang & Neiman |
| Banxa Report | Mid-Apr 2026 | ~$320B | Per CoinGecko/DefiLlama |
| Reuters | June 25, 2025 | $256B | Per CoinMarketCap |

These differences arise from different methodologies, data sources, and timing. The Brookings figure of ~$270B (June 2026) is notably lower than DefiLlama's $308B (August 2026), suggesting either a market decline or methodological differences.

### Gross Transfers vs. Real Payments

The most important data validation issue is distinguishing gross on-chain transfer volume from genuine economic activity. Of $28-62 trillion in gross stablecoin transfers in 2025, only ~$350-550 billion was genuine real-economy payments. This means ~95-99% of on-chain stablecoin volume is trading, protocol activity, and wallet-to-exchange movement.

### Bot-Heavy Payment Statistics

x402's 100M+ transactions are heavily driven by meme coin farming (PING). This illustrates a broader pattern: on-chain transaction counts are easily inflated by automated activity and do not establish commerce. Unadjusted transfer counts should not be used as evidence of adoption.

### Tokenized Assets vs. Fund Shares

RWA tokenization figures often conflate tokenized fund shares (e.g., BUIDL, USYC) with direct asset ownership. A tokenized money market fund share is not the same as direct ownership of the underlying Treasuries. The legal and economic rights differ significantly.

### Laws vs. Proposals

The GENIUS Act was signed into law on July 18, 2025, but its effective date is January 18, 2027 (or 120 days after final regulations, whichever comes first). As of October 2026, the law is enacted but not yet effective. Proposed rules from OCC, FDIC, and NCUA are not final. This distinction between enacted law and effective regulation is critical for accurate claims.

### Competing Narratives

**Bullish narrative:** Stablecoins are becoming payments infrastructure. The GENIUS Act provides regulatory clarity. Institutional adoption is accelerating. OUSD's shared economics model will redistribute the float from issuers to distributors. x402 enables agent payments at scale.

**Bearish narrative:** Most stablecoin volume is speculative, not payments. The market is concentrated in two issuers with entrenched network effects. OUSD's partner list is intent, not adoption. RWA tokenization has high idle rates (56% of assets with zero weekly activity). The GENIUS Act's effective date is still months away and implementation is uncertain.

**Synthesis:** Both narratives contain verifiable elements. The stablecoin market is genuinely growing and institutional adoption is real, but the gap between gross volume and real payments remains enormous. OUSD represents a credible structural innovation but has not yet proven adoption. The regulatory framework is converging but not yet in effect.

---

## 7. Evidence Captures

All source text captures are stored in the `evidence/` directory with filenames matching the source URL. Each capture includes the exact passage, URL, retrieval timestamp, and publication/data-as-of dates.

---

## 8. Unresolved Items

1. **OUSD live volume:** No public data on OUSD transaction volume or partner-level adoption metrics as of October 1, 2026. The $468M supply figure is from the Bridge reserve page but does not indicate velocity or real payment activity.
2. **Bridge National Trust Bank status:** The conditional OCC approval is not final. The timeline for operational approval and GENIUS Act authorization is unknown.
3. **Circle's competitive response:** Whether Circle will pre-emptively widen reserve income sharing to defend against OUSD is unknown as of October 2026.
4. **x402 organic volume:** The proportion of x402 transactions that are genuine commerce vs. meme coin farming is not publicly broken out.
5. **RWA represented vs. distributed:** The $345B "represented" RWA value vs. $33.5B "distributed" value gap needs further investigation to understand what is actually tradable.
6. **Stablecoin market cap methodology:** The significant disagreement between sources (Brookings $270B vs. DefiLlama $308B for overlapping periods) requires methodological reconciliation.
7. **GENIUS Act final rulemaking:** The timeline for final regulations from OCC, FDIC, and NCUA is uncertain. The effective date could shift from January 18, 2027 if final rules are issued earlier.
8. **OUSD governance specifics:** The exact governance rights of non-founding partners, the management fee percentage, and the equity distribution formula are not publicly disclosed.
