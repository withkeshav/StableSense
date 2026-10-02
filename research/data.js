// All sourced figures for the State of Stablecoins hub. Every number carries
// its own source and its own as-of date. Where aggregators disagree, the range
// is given rather than a single silently-chosen number; where the evidence
// does not reach, the value is marked UNRESOLVED rather than estimated.
//
// Date discipline, three separate kinds that must never be merged:
//   * RESEARCH_REVIEWED is when this edition's research record was reconciled.
//     It is a publication date, not a measurement date.
//   * MEASURE_AS_OF carries each headline measure's own as-of date, because
//     they are not the same date and a single dataset-wide date would imply
//     they were.
//   * HISTORICAL_DATASETS are event-dated series (the depeg cases), whose
//     dates are the events themselves and which no review pass re-dates.
// The five highest-stakes claims (Treasury-holder ranking, GENIUS Act
// effective-date mechanics, SVB/USDC low, UST collapse figure, Aug 2026 supply
// contraction) were verified against primary sources on 2026-09-08 and
// re-verified on 2026-09-21; the 2026-10-02 reconciliation pass corrected
// contradicted claims without restarting the research passes. See the
// `verifiedClaims` export and the methodology note in the footer.

export const AS_OF = '2026-09-26';          // legacy historical-case dataset review date
export const RESEARCH_REVIEWED = '2026-10-02';
export const MEASURE_AS_OF = {
  totalMarketCap: '2026-08-13',
  totalMarketCapSeries: '2026-09-26',
  treasuryHolderRanking: 'TIC Jun 2026 (sovereign top 3) and TIC Jan 2023 (older anchors)',
  tetherReserveExposure: '2026-03-31',
  openUsdReserveSnapshot: '2026-10-01',
  circleDistributionCosts: '2026-06-30',
  x402CumulativeTotal: '2026-10-01',
  x402FiveChainMonth: 'August 2026',
  x402WashAdjusted: '2026-04-21',
  tokenizedRwaReported: 'early July 2026',
  tokenizedRwaTransferActivity: '2026-07-02',
  tokenizedRwaLandingPage: '2026-05-31',
  kansasCityFedBulletin: '2025-08-08, updated 2026-09-22',
  geniusCommencement: 'statute as enacted 2025-07-18; final-rule trigger UNRESOLVED',
  stablecoinPaymentsShare: '2025 data, published 2026',
};
export const HISTORICAL_DATASETS = {
  depegs: 'Events dated May 2022, March 2023 and October 2025. Each case carries its own event and price date; a review pass does not re-date a historical event.',
  marketCapHistory: 'Year-end marks 2017 to 2025 from one aggregator series, plus a dated 2026 observation. The 2026 point is not a year-end mark.',
  regulationTable: 'Per-jurisdiction status dates, carried per row.',
};

// Hub build marker rendered in the footer freshness badge. Derived from
// package.json at build time via vite.config.research.mjs (__HUB_BUILD__), so
// it can never drift out of sync with the app version the way a hand-edited
// literal did. The fallback is the dev-server case, where no define runs.
export const HUB_BUILD = typeof __HUB_BUILD__ === 'string' ? __HUB_BUILD__ : 'dev';

// --- the four manually-verified claims (see the methodology note in the footer) -
export const verifiedClaims = [
  {
    id: 'treasury-ranking',
    claim: 'Stablecoin-issuer Treasury-holder ranking',
    resolution: "Tether's reported ~$141B in T-bill holdings (Q1 2026 attestation) would rank among the top foreign holders on the June 2026 TIC table (Japan $1,116.7B, United Kingdom $939.9B, China Mainland $633.4B) and exceeds Germany ($91.3B) and Norway ($104.4B) as of the Jan 2023 TIC table the original comparison used. Sovereign rows are mixed-vintage: top-3 are TIC Jun 2026; the Germany/Norway anchors remain Jan 2023 pending the next data refresh. The comparison is duration-mismatched: issuers hold short-dated T-bills, while TIC ranks total (long+short) foreign holdings.",
    sources: [
      { label: 'US Treasury TIC - Major Foreign Holders', url: 'https://ticdata.treasury.gov/Publish/mfhhis01.txt' },
      { label: 'Tether transparency / reserves attestation', url: 'https://tether.to/en/transparency/' },
      { label: 'Circle reserve report', url: 'https://www.circle.com/en/transparency' },
    ],
  },
  {
    id: 'genius-effective-date',
    claim: 'GENIUS Act commencement mechanics (statute text verified; commencement UNRESOLVED)',
    resolution: "Enacted July 18, 2025. Section 20 sets general commencement at the earlier of 18 months after enactment or 120 days after the primary federal payment stablecoin regulators issue any final implementing regulations, so January 18, 2027 is the outer limit rather than a settled date. Section 3(b)(1) separately places its offer-and-sale prohibition three years after enactment. Whether a qualifying final rule has triggered the earlier date is UNRESOLVED: this edition does not establish whether such a rule has been issued. Statutory mechanics are established and current commencement is not, so this report does not describe any GENIUS duty as locked, operative or in force. Proposed rules are not final rules. Re-verify commencement before relying on these statutory duties.",
    sources: [
      { label: 'GENIUS Act enacted text, Sec. 20 (12 U.S.C. 5901 note)', url: 'https://www.congress.gov/bill/119th-congress/senate-bill/1582/text' },
      { label: 'OCC bulletin 2026-3 - GENIUS Act NPRM', url: 'https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-3.html' },
      { label: 'FDIC - GENIUS Act proposed rulemaking', url: 'https://www.fdic.gov/news/financial-institution-letters/2026/notice-proposed-rulemaking-establish-genius-act' },
    ],
  },
  {
    id: 'svb-usdc-low',
    claim: 'SVB / USDC low',
    resolution: "USDC's secondary-market low was $0.8789 on the morning of March 11, 2023, per CoinGecko Research; specific Curve liquidity pools dropped below $0.82. Circle disclosed $3.3B (~8% of $40B reserves) stranded at Silicon Valley Bank. The peg recovered after the US government backstopped all SVB depositors.",
    sources: [
      { label: 'CoinGecko Research - Stablecoin Supply Impacted by SVB', url: 'https://www.coingecko.com/research/publications/stablecoins-supply-svb-impact' },
      { label: 'CNBC - USDC breaks dollar peg', url: 'https://www.cnbc.com/2023/03/11/stablecoin-usdc-breaks-dollar-peg-after-firm-reveals-it-has-3point3-billion-in-svb-exposure.html' },
    ],
  },
  {
    id: 'ust-collapse',
    claim: 'UST / Terra collapse figure',
    resolution: "UST's stablecoin supply peaked near $18B market cap before the depeg (Reuters, ScienceDirect); the combined UST + LUNA market-cap loss over the collapse was roughly $60B (CoinMarketCap data via Binance). The often-cited '$40B' is an ambiguous partial figure and is not used here unqualified.",
    sources: [
      { label: 'ScienceDirect - Anatomy of a Stablecoin failure', url: 'https://www.sciencedirect.com/science/article/abs/pii/S1544612322005359' },
      { label: 'Reuters - TerraUSD falls to 30 cents', url: 'https://www.reuters.com/technology/dollar-pegged-stablecoin-terrausd-falls-30-cents-2022-05-11/' },
      { label: 'Binance - The Collapse of LUNA and UST', url: 'https://www.binance.com/en/square/post/22931497315953' },
    ],
  },
  {
    id: 'aug-2026-contraction',
    claim: 'August 2026 stablecoin supply contraction',
    resolution: "On August 2, 2026 stablecoin supply dropped roughly $15B within days (USDT fell from about $189B to $183B), the sharpest monthly contraction since the Terra collapse by some measures. Critically for learners, this was a redemption story, not a depeg: USDT and USDC continued trading within roughly 0.1% of $1 throughout. Supply shrinking is a volume story; depeg is a price story.",
    sources: [
      { label: 'Bitsgap - Stablecoin supply vs depeg, 2026 data', url: 'https://bitsgap.com/blog/stablecoin-supply-a-leading-market-signal' },
      { label: 'Stablecoin Beat - Total market capitalization series', url: 'https://stablecoinbeat.com/charts/market-cap' },
      { label: 'DefiLlama - Stablecoins dashboard', url: 'https://defillama.com/stablecoins' },
    ],
  },
  {
    id: 'kansascityfed-discrepancy',
    claim: 'Kansas City Fed conditional Treasury-demand example (source disagrees with itself; coefficient UNRESOLVED)',
    resolution: "The Bulletin states that an extra $1 of stablecoins raises total Treasury holdings by $0.50 while $1 less in bank deposits lowers them by $0.08, then states a net effect of $0.30. Its own components give $0.42, a gap of $0.12 with no reconciliation offered. Two versions of the note disagree with each other as well: the later HTML (which identifies a September 22, 2026 publisher correction) uses an 8 percent bank Treasury share, a $0.08 reduction and 2.5 percent loan contraction, while the linked PDF gives 20 percent, $0.20 and 1 percent; both retain the $0.30 net, and the PDF reader's cache freshness is unknown. The intended net-demand coefficient is therefore UNRESOLVED and no headline rests on either version. What survives both versions is the source's own hedge: if the sellers of the shifted funds sell Treasuries at the same rate issuers buy them, a larger stablecoin market has no net effect on Treasury demand, and households forgoing Treasury purchases would reduce it. Gross issuer Treasury holdings are not net new demand.",
    sources: [
      { label: 'Kansas City Fed Economic Bulletin, HTML, corrected 2026-09-22', url: 'https://www.kansascityfed.org/research/economic-bulletin/stablecoins-could-increase-treasury-demand-but-only-by-reducing-demand-for-other-assets/' },
      { label: 'Federal Reserve FEDS Note, Banks in the Age of Stablecoins (2025-12-17)', url: 'https://www.federalreserve.gov/econres/notes/feds-notes/banks-in-the-age-of-stablecoins-implications-for-deposits-credit-and-financial-intermediation-20251217.html' },
    ],
  },
  {
    id: 'stablecoin-payments-share',
    claim: 'Share of stablecoin transfer value that is real economic activity (two different definitions, both stated)',
    resolution: "BCG and Allium report more than $62 trillion of annual stablecoin transfers with real economic activity of $4.2 trillion, about 7 percent of the total, and separately about $350 to $550 billion of observable bilateral goods-and-services payments in 2025, which is 0.565 to 0.887 percent of the gross figure and which the authors label a directionally robust lower bound with named exclusions. An earlier version of this report asserted that 95 to 99 percent of stablecoin volume is non-payment. No source contains that figure and it is withdrawn; the correct framing is about 7 percent under the broad definition and under 1 percent under the narrow goods-and-services definition. No single commerce share is established because the two definitions are not interchangeable.",
    sources: [
      { label: 'BCG and Allium Labs, Stablecoin payments: the truth behind the numbers (2026-09-30)', url: 'https://www.bcg.com/assets/2026/white-paper-stablecoin-payments-truth-behind-numbers.pdf' },
    ],
  },
  {
    id: 'open-usd-live',
    claim: 'Open USD (OUSD) is issuer-reported live, not announced-only (supply snapshot is not adoption)',
    resolution: "Bridge reported OUSD launched by Bridge Building Inc., a Stripe company, on Base, Ethereum, Solana and Tempo on September 30, 2026, with free 1:1 mint and burn reported on Solana that day. Bridge reports conditional OCC approval to establish Bridge National Trust Bank; conditional approval is not a final charter and no primary OCC order is verified here, so current charter status is UNRESOLVED. The issuer's own reserve page reported total supply in circulation of $468,445,399 at 11:30 UTC on October 1, 2026, backed by $257,214,691 cash and $211,230,708 Treasuries, which sum exactly to total supply (54.91 percent cash, 45.09 percent Treasuries). That is one dated issuer-reported snapshot, not adoption, velocity or payment volume. Open Standard describes partner rewards proportional to supply and activity, with an opportunity to earn equity. These company statements do not establish realized payouts, holder yield, direct holder title to reserve assets or an instruction right over their investment.",
    sources: [
      { label: 'Open Standard, Open USD is live (2026-09-30)', url: 'https://joinopenstandard.com/blog/open-usd-is-live' },
      { label: 'Bridge, OUSD issued by Bridge (2026-09-30)', url: 'https://www.bridge.xyz/blog/ousd-is-live-issued-by-bridge' },
      { label: 'Bridge, OUSD reserve page (snapshot 2026-10-01 11:30 UTC)', url: 'https://reserves.bridge.xyz/ousd' },
    ],
  },
];

// --- Section 1: taxonomy scale (mid-2026, ranges per research files) -----
export const taxonomy = [
  { id: 'fiat-usd', label: 'Fiat-USD', scale: '~$303B', asOf: 'Sep 2026', examples: 'USDT, USDC', mechanism: 'Full reserve in cash + short-term US Treasuries; redemption at par for approved institutions (retail exits through exchanges, not the issuer); arbitrage enforces the peg. The dominant case the dashboard tracks. Supply contracted ~$15B in Aug 2026 on redemptions while prices held within ~0.1% of $1.', why: 'Macro-relevant: the issuers are now structural buyers of US T-bills, tying crypto health to Treasury market liquidity. Tether has pre-launched a US-compliance token (USAT) ahead of final GENIUS rules.' },
  { id: 'fiat-non-usd', label: 'Fiat non-USD', scale: '~$2B', asOf: 'Aug 2026', examples: 'EURC, JPYC, XSGD', mechanism: 'Mechanically similar to USDT/USDC but referenced to EUR, JPY, GBP or SGD. MiCA daily caps apply to non-euro-currency EMTs, not euro-pegged tokens.', why: 'Infrastructure for a 24/7 on-chain FX market; different reference currencies create different regulatory and liquidity questions.' },
  { id: 'commodity', label: 'Commodity-backed', scale: '~$4.6-6B', asOf: 'early-mid 2026', examples: 'PAXG, XAUT, KAG', mechanism: 'Token = allocated physical gold in vaults (London, Switzerland). Price tracks gold spot, not $1. No peg-break risk in the dollar sense; takes on gold volatility and redemption friction.', why: 'Digitizes the oldest safe-haven asset; ~96% of the category is gold. Silver and oil remain economically marginal.' },
  { id: 'crypto-synth', label: 'Crypto-collateralized / synthetic', scale: '~$13B', asOf: 'Aug 2026', examples: 'USDS/DAI, USDe, LUSD', mechanism: 'DAI/USDS: over-collateralized crypto vaults with liquidations. USDe: delta-neutral basis trade (spot long + short perp), funding rate pays yield. Peg enforced by code, not a bank promise.', why: 'Censorship-resistant dollar with no bank dependency; risk migrates to smart-contract bugs, liquidation cascades, and (USDe) funding-rate inversion.' },
  { id: 'algorithmic', label: 'Algorithmic', scale: 'near zero as a pure category', asOf: 'May 2026', examples: 'UST (dead), Frax v2 (re-collateralized)', mechanism: 'No direct backing; a sister token absorbs sell pressure via mint/burn. UST May 2022 is the case study: the death spiral erased ~$60B combined in roughly a week.', why: 'Banned or excluded from regulated payment-stablecoin status everywhere (MiCA, GENIUS, HK, UAE). A cautionary tale, not a live design.' },
  { id: 'rwa', label: 'RWA / tokenized funds', scale: '~$33.5B reported, excluding stablecoins', asOf: 'early July 2026, CryptoRank citing RWA.xyz; secondary report, not current primary fund AUM', examples: 'BUIDL, BENJI, OUSG', mechanism: 'Tokenized fund shares holding Treasuries or private credit are interests in a fund, not direct title to every security. Access, transfer restrictions and redemption timing are product-specific, not a universal T+1 rule. Payment tokens and fund shares may interact or substitute in some uses.', why: 'Legal wrappers, yield and access rules matter as well as the underlying asset. Low weekly public transfers do not prove economically idle capital; reported value, represented value and fund AUM are different measures.' },
];

// token comparison table rows
export const tokens = [
  { token: 'USDT', category: 'fiat-usd', peg: 'USD', issuer: 'Tether', mcap: '~$183B', chain: 'Multi-chain', asOf: 'Sep 2026' },
  { token: 'USDC', category: 'fiat-usd', peg: 'USD', issuer: 'Circle', mcap: '~$74B', chain: 'Multi-chain', asOf: 'Sep 2026' },
  { token: 'DAI/USDS', category: 'crypto-synth', peg: 'USD (on-chain)', issuer: 'Sky (ex-MakerDAO)', mcap: '~$10.6B', chain: 'Ethereum, Arbitrum, Solana', asOf: 'Aug 2026' },
  { token: 'USDe', category: 'crypto-synth', peg: 'USD (synthetic)', issuer: 'Ethena', mcap: '~$2.3-6B', chain: 'Ethereum, Solana, Base', asOf: 'Aug 2026 (volatile)' },
  { token: 'USD1', category: 'fiat-usd', peg: 'USD', issuer: 'World Liberty Financial', mcap: '~$4.2B', chain: 'BNB Chain, Ethereum', asOf: 'Sep 2026 (5th-largest)' },
  { token: 'USAT', category: 'fiat-usd', peg: 'USD', issuer: 'Tether (US entity)', mcap: 'early growth', chain: 'Ethereum (planned multi-chain)', asOf: 'Sep 2026 (launched pre-rules)' },
  { token: 'PAXG', category: 'commodity', peg: 'Gold (1 oz)', issuer: 'Paxos', mcap: '~$1.9-2.55B', chain: 'Ethereum', asOf: 'early 2026' },
  { token: 'XAUT', category: 'commodity', peg: 'Gold (1 oz)', issuer: 'Tether (TG Commodities)', mcap: '~$2.67-2.9B', chain: 'Ethereum, Tron', asOf: 'early 2026' },
  { token: 'EURC', category: 'fiat-non-usd', peg: 'EUR', issuer: 'Circle', mcap: '~$456M', chain: 'Ethereum, Solana, Base', asOf: 'Aug 2026' },
  { token: 'JPYC', category: 'fiat-non-usd', peg: 'JPY', issuer: 'JPYC Inc.', mcap: '~$55M', chain: 'Ethereum, Polygon', asOf: 'Aug 2026' },
  { token: 'BUIDL', category: 'rwa', peg: '$1 (fund NAV)', issuer: 'BlackRock / Securitize', mcap: 'no verified current AUM (see dated reports)', chain: 'Ethereum, Solana, Polygon, Optimism, BNB Chain, Avalanche, Arbitrum, Aptos', asOf: 'eight-chain deployment reported May 2026; no current fund AUM verified' },
  { token: 'BENJI', category: 'rwa', peg: '$1 (fund NAV)', issuer: 'Franklin Templeton', mcap: '~$368M-2.4B', chain: 'Stellar, Ethereum, Solana', asOf: 'mid-2026' },
  { token: 'OUSG', category: 'rwa', peg: '$1 (fund NAV)', issuer: 'Ondo Finance', mcap: '~$319-334M', chain: 'Ethereum, Polygon, Solana, XRP Ledger', asOf: '2026-09-17 (Ondo product page)' },
];

// --- Section 2: scale and trajectory --------------------------------------
export const marketCapHistory = [
  // year-end total stablecoin market cap, USD billions
  { year: 2017, cap: 1.5 },
  { year: 2018, cap: 3 },
  { year: 2019, cap: 5.7 },
  { year: 2020, cap: 27 },
  { year: 2021, cap: 163 },
  { year: 2022, cap: 138 }, // post-UST crash
  { year: 2023, cap: 130 },
  { year: 2024, cap: 205 },
  { year: 2025, cap: 308 },
  { year: 2026, cap: 303 }, // Sep 2026 snapshot (Stablecoin Beat/DefiLlama); contracted from ~$321B peak after the Aug 2 redemption wave
];

export const scaleMarkers = [
  { year: 2022, month: 5, label: 'UST collapse', desc: '~$60B combined UST+LUNA erased in ~1 week' },
  { year: 2023, month: 3, label: 'SVB / USDC', desc: 'USDC low $0.8789; $3.3B stranded at SVB' },
  { year: 2025, month: 7, label: 'GENIUS Act enacted', desc: 'Signed July 17-18, 2025. Section 20 commencement is the earlier of 18 months or 120 days after final regulations; no final rule is verified, so commencement is UNRESOLVED' },
  { year: 2026, month: 8, label: 'Aug 2 contraction', desc: '~$15B redeemed within days; pegs held within ~0.1%' },
  { year: 2026, month: 9, label: 'Open USD live', desc: 'OUSD issued by Bridge Building Inc. on Base, Ethereum, Solana and Tempo, 2026-09-30; issuer-reported supply snapshot $468.4M on 2026-10-01' },
];

// Total market cap, stated with the scope it actually measures. One dated
// aggregator figure is evidenced for this record; a second independent
// same-date, same-universe measurement is the falsifier and does not exist
// here, so no cross-source range is asserted (UNRESOLVED).
export const marketCapMeasure = {
  headline: '$308.0B',
  measures: 'Total stablecoin market capitalisation across all issuers and all tracked chains, one aggregator measurement',
  asOf: '2026-08-13',
  changeYoy: '+14.3% year over year',
  dollarShare: 'about 99.5% dollar-denominated',
  distanceFromPeak: '4.5% below its May 2026 peak',
  crossSourceRange: 'UNRESOLVED. No second independent measurement for the same date and universe is verified in this report\'s research record, so none is quoted.',
  source: 'One aggregator, reported by a secondary compilation',
  url: 'https://reap.global/blog/stablecoin-statistics-2026',
};

export const projections = [
  { name: 'IMF', range: '$0.5-3.7T', low: 500, high: 3700, by: '2030', note: 'Wide, official; base case ~$1.5-2T' },
  { name: 'Citi', range: '$1.9-4T', low: 1900, high: 4000, by: '2030', note: 'Base $1.9T, bull $4T' },
  { name: 'Bain', range: 'up to $3.8T', low: 1900, high: 3800, by: '2030', note: '~12x current' },
  { name: 'Standard Chartered', range: '$2T', low: 2000, high: 2000, by: '2028', note: 'Aggressive near-term slope' },
  { name: 'JPMorgan', range: '~$500B', low: 500, high: 500, by: '2028', note: 'Conservative' },
];

// --- Section 3: Treasury holdings (verified) ----------------------------
export const treasuryHolders = [
  { name: 'Japan', type: 'sovereign', value: 1116.7, note: 'TIC Jun 2026' },
  { name: 'United Kingdom', type: 'sovereign', value: 939.9, note: 'TIC Jun 2026' },
  { name: 'China', type: 'sovereign', value: 633.4, note: 'TIC Jun 2026' },
  { name: 'Luxembourg', type: 'sovereign', value: 318.2, note: 'TIC Jan 2023 (pre-refresh)' },
  { name: 'Switzerland', type: 'sovereign', value: 290.5, note: 'TIC Jan 2023 (pre-refresh)' },
  { name: 'Cayman Islands', type: 'sovereign', value: 285.3, note: 'TIC Jan 2023 (pre-refresh)' },
  { name: 'Canada', type: 'sovereign', value: 254.1, note: 'TIC Jan 2023 (pre-refresh)' },
  { name: 'Ireland', type: 'sovereign', value: 253.4, note: 'TIC Jan 2023 (pre-refresh)' },
  { name: 'Taiwan', type: 'sovereign', value: 234.6, note: 'TIC Jan 2023 (pre-refresh)' },
  { name: 'India', type: 'sovereign', value: 232.0, note: 'TIC Jan 2023 (pre-refresh)' },
  { name: 'Tether (issuer)', type: 'issuer', value: 141, note: 'Q1 2026 attestation' },
  { name: 'Norway', type: 'sovereign', value: 104.4 },
  { name: 'Germany', type: 'sovereign', value: 91.3 },
  { name: 'UAE', type: 'sovereign', value: 64.9 },
  { name: 'Combined issuers (4)', type: 'issuer', value: 182.4, note: 'Tether+Circle+First Digital+Paxos', benchmark: true },
];

// --- Section 4: banks ----------------------------------------------------
export const bankCallouts = [
  { label: 'NY Fed (Feb 2026, Staff Report 1185)', stat: 'Banks exposed to stablecoin flows lend less relative to peers.', detail: 'First direct evidence of liquidity-driven disintermediation; partner banks run "narrow" to absorb flow volatility.' },
  { label: 'White House CEA (Apr 2026)', stat: 'Minimal lending impact modeled.', detail: 'Assumes a small baseline market; criticized by Americans for Financial Reform and the Consumer Bankers Association as "built on favorable assumptions."' },
];

// Yield-bearing stablecoin debate (extends Section 4). The GENIUS Act
// prohibits payment stablecoins from paying interest; yield-bearing variants
// compete with bank deposits and MMFs. Both sides, cited, neutral.
export const yieldDebate = [
  { label: 'Prohibition view (GENIUS Act, Jul 2025)', stat: 'Payment stablecoins may not pay interest or yield.', detail: 'CRS IF13173/IF13174 outline the tension between stablecoins as payment mechanisms versus savings vehicles. The Act draws a clear boundary between payments and deposit-taking.' },
  { label: 'Macro-stability view (State Street, Apr 2026)', stat: 'Yield-bearing stablecoins compete directly with bank deposits and MMFs.', detail: 'At scale, this could alter bank funding structures, affect credit supply, and amplify run dynamics in short-term funding markets.' },
  { label: 'Disintermediation view (BPI, 2026)', stat: 'Yield-bearing stablecoins reduce bank deposits and lending.', detail: 'Citing Cong, Chiu et al.: banks must compete for deposits, potentially crowding out lending.' },
  { label: 'Adoption-cost view (Federal Reserve, Dec 2025)', stat: 'Non-yielding stablecoins carry a high opportunity cost when rates are elevated.', detail: 'The Fed notes this could slow adoption unless stablecoins evolve to pay yield, creating a regulatory tension with the GENIUS prohibition.' },
];

// T-bill maturity distribution from issuer transparency attestations.
// Teaches why issuers prefer short-term bills (liquidity for redemptions)
// and the Yadav/Malone Treasury-interdependence point.
export const tBillMaturities = [
  { issuer: 'Tether (Q1 2026 attestation)', buckets: [
    { label: '0-30 days', pct: 22 },
    { label: '31-90 days', pct: 41 },
    { label: '91-180 days', pct: 24 },
    { label: '180+ days', pct: 13 },
  ]},
  { issuer: 'Circle (Q1 2026 reserve report)', buckets: [
    { label: '0-30 days', pct: 31 },
    { label: '31-90 days', pct: 48 },
    { label: '91-180 days', pct: 17 },
    { label: '180+ days', pct: 4 },
  ]},
];

// GENIUS Act rulemaking status (dated paragraph, not a live tracker).
// Commencement mechanics are known from the enrolled text; whether a final
// implementing rule has actually triggered the earlier date is UNRESOLVED, so
// nothing here is described as locked or currently operative.
export const geniusStatus = {
  enacted: 'July 18, 2025',
  asOf: 'Sep 2026',
  commencementMechanics: 'Section 20: general commencement is the earlier of 18 months after enactment (an outer limit of January 18, 2027) or 120 days after the primary federal payment stablecoin regulators issue any final implementing regulations. Section 3(b)(1) separately places its offer-and-sale prohibition three years after enactment.',
  commencementStatus: 'UNRESOLVED. This report does not establish whether a qualifying final implementing rule has been issued. January 18, 2027 is an outer limit rather than a settled commencement date.',
  totalRulemakings: 26,
  agencies: 6,
  nprmsIssued: 10,
  finalRules: null,
  reserveClasses: 'Eight eligible reserve classes under Sec. 4(a)(1)(A), not Treasury bills alone. See the reserve note below for the list.',
  note: 'NPRMs from OCC (bulletin 2026-3), FDIC, NCUA and Treasury were in comment periods at the last check. Because commencement is unconfirmed, this report does not describe any GENIUS duty as currently in force; it describes what the statute requires once commenced. Earlier estimates of a 2026 commencement date are obsolete.',
  source: 'GENIUS Act enacted text (Sec. 4 and Sec. 20); Paradigm GENIUS Act Rulemaking Tracker; OCC bulletin 2026-3; FDIC proposal',
  url: 'https://www.congress.gov/bill/119th-congress/senate-bill/1582/text',
};

// GENIUS reserves are a statutory list, not "T-bills only". Quoted from the
// enrolled text's structure rather than paraphrased into a single asset class.
export const geniusReserves = {
  citation: 'GENIUS Act Sec. 4(a)(1)(A), 12 U.S.C. 5903(a)(1)(A)',
  headline: 'Reserves must be at least 1:1 and comprise a list of eight eligible classes. Treasury bills are one of them, not the whole of it.',
  classes: [
    'Coins and currency.',
    'Insured deposits.',
    'Treasury bills, notes or bonds of 93 days or less, measured by remaining or original maturity.',
    'Overnight repo backed by such Treasury securities.',
    'Overnight reverse repo against Treasury notes, bills or bonds: tri-party, centrally cleared, or bilateral with a creditworthy counterparty.',
    'Shares of a registered Government money market fund invested solely in the preceding classes.',
    'Other similarly liquid Federal Government-issued assets approved by the regulator.',
    'Tokenized forms of the eligible classes.',
  ],
  disclosure: 'Sec. 4 also requires monthly publication of reserve composition, including average tenor and the geographic location of custody per category.',
  pledgeBan: 'Sec. 4 prohibits pledging or rehypothecating reserves outside the statute\'s stated exceptions.',
  accounting: 'Sec. 3(g) denies non-permitted stablecoins the treatment of cash or cash equivalent for accounting purposes, cash-equivalent margin and collateral eligibility, and acceptable wholesale settlement asset status.',
  scope: 'Statutory requirement. It binds once the Act commences, and commencement is itself UNRESOLVED.',
  url: 'https://www.congress.gov/bill/119th-congress/senate-bill/1582/text',
};

// Gross issuer Treasury exposure is not net new Treasury demand. The Kansas
// City Fed example is the clearest available illustration, and the source
// disagrees with itself, so the coefficient is UNRESOLVED and no headline
// rests on it.
export const treasuryDemandMechanism = {
  title: 'Gross holdings are not net new demand',
  lead: 'Tether reports about $141B of direct and indirect US Treasury bill exposure against about $183B of token liabilities as of 2026-03-31. That is gross exposure, not incremental demand. Where the money came from decides whether issuer purchases add to, replace or reduce Treasury demand.',
  kcFed: 'Under an explicitly strong assumption that bank and issuer asset mixes hold, the Kansas City Fed Bulletin models an extra $1 of stablecoins raising Treasury holdings by $0.50 and $1 less in bank deposits lowering them by $0.08, and states a $0.30 net effect.',
  discrepancy: 'Its own components give $0.42, not $0.30; the $0.12 gap is unreconciled. Two versions of the note also disagree: the later publisher-corrected HTML uses an 8 percent bank Treasury share, a $0.08 reduction and 2.5 percent loan contraction, while the linked PDF gives 20 percent, $0.20 and 1 percent. Both retain the $0.30 net, and the PDF reader\'s cache freshness is unknown.',
  status: 'UNRESOLVED. The intended net-demand coefficient is not established, and this report does not publish a corrected one.',
  hedge: 'What survives both versions is the source\'s own hedge: if the sellers of the shifted funds sell Treasuries at the same rate issuers buy them, a larger stablecoin market has no net effect on Treasury demand at all. Where households forgo or sell Treasury purchases the effect reverses sign, because $1 less household buying creates only $0.50 of issuer buying.',
  implication: 'Stablecoin growth can redirect short-term safe-asset demand. It cannot be used to measure net new Treasury demand, debt relief or lending contraction market-wide.',
  url: 'https://www.kansascityfed.org/research/economic-bulletin/stablecoins-could-increase-treasury-demand-but-only-by-reducing-demand-for-other-assets/',
};

// BPI full-journey finding (callout next to the remittance calculator).
export const bpiFinding = {
  label: 'Bank Policy Institute (Jul 2026)',
  finding: 'Stablecoins showed no systematic cost advantage over traditional channels; full-journey cost 0.3% to 9% across ten corridors.',
  detail: 'On/off-ramp FX dominated the cost. Speed followed the local rail, not the chain. Gas-only comparisons (the middle hop) are not the whole journey.',
};

// --- Section 5: cross-border ---------------------------------------------
// Author's teaching model, not a qualified research estimate. Every lever is
// visible on the widget. The scenario table underneath is what makes this
// defensible: each row says what we are allowed to claim and from where.
export const remittanceCost = {
  // Default amount is the World Bank RPW measurement point ($200), not $1,000.
  defaultAmount: 200,
  // Traditional side: three NAMED assumption schedules, not one black-box "% + fixed".
  // The $245 fixed figure from the previous version was a Learn-range reading
  // repurposed as a SWIFT ticket; it is deleted as a fee and only appears as a
  // worked $10,000 example in the scenario table, attributed to that reading.
  traditionalSchedules: [
    { id: 'rpw', label: 'RPW-like retail % ($200/$500 only)', feePct: 6.49, fixedUsd: 0, warnAbove: 500, warn: 'RPW only mystery-shops $200 and $500. Do not extrapolate this percentage to commercial sizes.' },
    { id: 'sme', label: 'SME wire: 2% FX + $40', feePct: 2, fixedUsd: 40, warnAbove: null },
    { id: 'commercial', label: 'Commercial: 25 bp FX + $25', feePct: 0.25, fixedUsd: 25, warnAbove: null },
  ],
  defaultTraditional: 'rpw',
  // Stablecoin side: the full journey split into named hops. Default is the
  // "I already hold it and they accept it" case (ramps off, gas on). A one-click
  // "full cash-to-cash" preset turns both ramps on.
  stablecoin: {
    networkFeeUsd: 0.10,        // representative L2/Base fee
    onrampPct: 0.5,             // author assumption, middle of the 0.1-1% range
    offrampPct: 0.5,            // author assumption, middle of the 0.1-1% range
    includeOnramp: false,
    includeOfframp: false,
    days: 'seconds',
  },
  // Float / opportunity cost of time (author assumption, not World Bank).
  // floatCost = amount * annualOpportunityRate * daysInTransit / 365
  defaultDaysInTransit: 4,     // traditional default
  defaultOpportunityRate: 4.5, // author assumption, cash/T-bill order of magnitude
  label: "Author's model, not the World Bank series",
};

// Static, sourced scenario table. Figures are ranges where the primary source
// gives a range; "author model" rows are clearly labeled as such. The
// calculator's job is to let the reader replay A-E by moving sliders until the
// stacked rows match a row in this table.
export const remittanceScenarios = [
  {
    id: 'A', scenario: 'Worker sends $200', allowed: 'World Bank Remittance Prices Worldwide (named quarter)',
    traditional: 'Global average ~6.49% all-in Q1 2025; banks higher; Sub-Saharan Africa higher',
    stablecoin: 'BPI 2026 full journey 0.3-9%; gas is not the whole story',
    why: 'The actual remittance fact. This is the size World Bank RPW measures.',
    source: 'World Bank RPW Q1 2025 Issue 53; BPI Jul 2026',
  },
  {
    id: 'B', scenario: '$500', allowed: 'World Bank RPW $500 average',
    traditional: '~4.3% all-in (Q1 2025 figure, re-verify before quoting)',
    stablecoin: 'Same BPI caveat: on/off-ramp FX dominates, not gas',
    why: 'Shows the percentage falls as ticket grows, inside the RPW band.',
    source: 'World Bank RPW Q1 2025',
  },
  {
    id: 'C', scenario: '$10,000 personal', allowed: 'Author model, not RPW',
    traditional: 'e.g. 1-3% FX + $40; float ~$5 at 4.5%/4d',
    stablecoin: 'Gas + optional ramps',
    why: 'Kills the live $710 claim. RPW does not cover this size.',
    source: 'Author model; bank fee schedules',
  },
  {
    id: 'D', scenario: '$1M, recipient takes USDC', allowed: 'Author model',
    traditional: '10-50 bp commercial FX + $25 + ~$500 float',
    stablecoin: 'Gas only (already hold, they accept)',
    why: 'Why treasurers care about "stay on-chain": no ramp cost.',
    source: 'Author model; trade-press commercial FX ranges',
  },
  {
    id: 'E', scenario: '$1M, cash to cash', allowed: 'Author model + BPI spirit',
    traditional: 'Same as D',
    stablecoin: 'On-ramp + gas + off-ramp (0.1-1% each as a labeled band)',
    why: 'Why $0.10 is a lie for this path. Ramps dominate, not gas.',
    source: 'Author model; BPI Jul 2026 (0.3-9% full journey)',
  },
  {
    id: 'F', scenario: 'Blocked corridor / 10-day delay', allowed: 'Author model',
    traditional: 'D plus ~$1,200 float at 4.5%',
    stablecoin: 'Often same-day once ramped',
    why: 'Time as the feature. Float becomes a first-class term.',
    source: 'Author model',
  },
];

export const corridors = [
  { region: 'Latin America', detail: '~$1.5T in crypto 2022-2025, predominantly stablecoins; Argentina >60% of exchange crypto purchases are stablecoins; Brazil ~90% of crypto volume.', country: 'Argentina, Brazil' },
  { region: 'Sub-Saharan Africa', detail: 'Highest remittance costs globally (8.78% avg); Nigeria receives ~60% of regional stablecoin inflows since 2019, uses USDT for cross-border trade.', country: 'Nigeria' },
  { region: 'UAE-India', detail: "World largest remittance route; businesses convert AED to stablecoins for instant settlement into India.", country: 'UAE, India' },
];

// --- Section 6: dollarization --------------------------------------------
export const dollarizationCountries = [
  { country: 'Turkey', gdpPct: 4.3, detail: 'Highest share in the world (Chainalysis); USDT/TRY top local trading pair; savings vehicle against lira depreciation.' },
  { country: 'Argentina', gdpPct: null, detail: '60% of exchange crypto purchases are USDT/USDC; workers convert wages on receipt; landlords accept USDT for rent.' },
  { country: 'Nigeria', gdpPct: null, detail: '~60% of sub-Saharan Africa stablecoin inflows since 2019; IMF reports ~$59B crypto inflows Jul 2023-Jun 2024.' },
  { country: 'Lebanon', gdpPct: null, detail: 'Crypto volume +120% YoY in 2022; street vendors accept USDT at a premium over cash dollars.' },
  { country: 'Venezuela', gdpPct: null, detail: 'USDT P2P premium spiked ~40% overnight during early-2026 crisis; the state itself reportedly used USDT for oil sales.' },
];

// --- Section 7: depegs ---------------------------------------------------
export const depegs = [
  {
    id: 'ust',
    name: 'UST / Terra',
    date: 'May 2022',
    low: '$0.01 (May 13)',
    spark: [1.0,1.0,0.99,0.99,0.98,0.95,0.90,0.82,0.72,0.60,0.48,0.35,0.25,0.18,0.12,0.08,0.05,0.03,0.02,0.015,0.01,0.008,0.005,0.003,0.01],
    sparkLabels: ['May 1','May 2','May 3','May 4','May 5','May 6','May 7','May 8','May 9','May 10','May 11','May 12','May 13','May 14','May 15','May 16','May 17','May 18','May 19','May 20','May 21','May 22','May 23','May 24','May 25'],
    failureMode: 'Death spiral: algorithmic mint/burn hyperinflated LUNA, crashing both tokens toward zero',
    mech: "Algorithmic: UST relied on a sister token (LUNA) burning to absorb sell pressure. When confidence cracked, the mechanism minted ever more LUNA, hyperinflating it and crashing both tokens. Combined UST+LUNA loss ~$60B in roughly a week.",
    // Learner UI fields (shared with in-app Research tab; do not invent alternate lows/dates)
    learner: {
      caseKey: 'ust',
      short: 'UST · 2022',
      kind: 'Structural',
      color: 'coral',
      title: 'When confidence became the collateral',
      recovery: 'No recovery',
      question: 'What happens when the system needs belief to create its own exit liquidity?',
      trigger: 'Large withdrawals from Anchor and a falling UST price started the redemption loop.',
      mechanism: ['UST is sold', 'LUNA is minted', 'LUNA price falls', 'Backing confidence falls'],
      conclusion: 'A structural failure: the stabilizer and the thing being stabilized weakened together.',
      label: 'Algorithmic death spiral',
      heldPeg: 'Arbitrage with LUNA',
      brokeFirst: 'Confidence + exit liquidity',
      couldRecover: false,
      recoverText: 'No - stabilizer weakened too',
    },
  },
  {
    id: 'svb',
    name: 'USDC / SVB',
    date: 'March 2023',
    low: '$0.8789 (Mar 11)',
    spark: [1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.999,0.998,0.97,0.88,0.8789,0.90,0.94,0.97,0.99,0.995,0.998,0.999,1.0,1.0,1.0,1.0,1.0],
    sparkLabels: ['Mar 1','Mar 2','Mar 3','Mar 4','Mar 5','Mar 6','Mar 7','Mar 8','Mar 9','Mar 10','Mar 11','Mar 11','Mar 11','Mar 12','Mar 13','Mar 13','Mar 13','Mar 14','Mar 14','Mar 14','Mar 15','Mar 16','Mar 17','Mar 18','Mar 19'],
    failureMode: 'Banking scare: temporary depeg from stranded reserves, self-corrected after government backstop',
    mech: "Circle held $3.3B (~8% of backing) at Silicon Valley Bank. When SVB failed, USDC dropped to $0.8789 (CoinGecko Research); Curve pools went below $0.82. Recovered after the US government backstopped all SVB depositors.",
    learner: {
      caseKey: 'usdc',
      short: 'USDC · 2023',
      kind: 'Counterparty',
      color: 'amber',
      title: 'When reserves were safe, but temporarily unreachable',
      recovery: '~3 days',
      question: 'How can a fully backed token wobble when its assets are still there?',
      trigger: 'Uncertainty about whether deposits would be protected triggered secondary-market selling.',
      mechanism: ['Bank fails', 'Reserves are frozen', 'Redemption fear rises', 'Price discounts'],
      conclusion: 'A temporary counterparty-access problem: the assets remained, but immediate access was uncertain.',
      label: 'Bank-run scare',
      heldPeg: 'Cash + Treasury reserves',
      brokeFirst: 'Access to bank-held cash',
      couldRecover: true,
      recoverText: 'Yes - deposits were protected',
    },
  },
  {
    id: 'usde',
    name: 'USDe wobble',
    date: 'October 2025',
    low: '$0.65 print on Binance (Oct 11)',
    spark: [1.0,1.005,1.0,0.998,0.995,0.99,0.985,0.97,0.95,0.90,0.85,0.78,0.70,0.65,0.62,0.65,0.70,0.78,0.85,0.90,0.94,0.97,0.985,0.995,0.99],
    sparkLabels: ['Oct 1','Oct 2','Oct 3','Oct 4','Oct 5','Oct 6','Oct 7','Oct 8','Oct 9','Oct 10','Oct 11','Oct 12','Oct 13','Oct 14','Oct 15','Oct 16','Oct 17','Oct 18','Oct 19','Oct 20','Oct 21','Oct 22','Oct 23','Oct 24','Oct 25'],
    failureMode: 'CEX liquidity dislocation: USDe held closer to peg on DEXs while Binance printed $0.65 during the Oct 11, 2025 $19B crash',
    mech: "During the October 11, 2025 crypto crash (~$19B in liquidations), Ethena USDe briefly printed $0.65 on Binance while DEX prices held much closer to $1, recovering quickly. The lesson is venue-specific liquidity, not reserve insolvency: when a crash drains a CEX's order book, the last printed price can gape away from peg even while the backing hedges function. Distinguish an exchange-venue price gap from a system-wide depeg.",
    learner: {
      caseKey: 'usde',
      short: 'USDe · 2025',
      kind: 'Market structure',
      color: 'violet',
      title: 'When the hedge works differently under stress',
      recovery: 'After hedge rebalance',
      question: 'What changes when a dollar is made from a hedge rather than a reserve account?',
      trigger: 'The Oct 11, 2025 $19B crash: funding shock and thin CEX books printed a far-from-peg price on Binance while DEX prices held.',
      mechanism: ['Crash drains CEX books', 'Funding shifts negative', 'Last printed price gaps', 'Arbitrage restores print'],
      conclusion: 'A market-structure stress event: the mechanism recovered, but the printed price depended on venue liquidity, not only on the hedge.',
      label: 'Venue liquidity gap',
      heldPeg: 'Delta-neutral hedge',
      brokeFirst: 'CEX order book + funding',
      couldRecover: true,
      recoverText: 'Yes - hedges rebalanced, DEX anchors held',
    },
  },
];

export const depegTakeaways = [
  { n: '01', title: 'Look beyond the price', body: 'A price chart records the symptom. The peg design tells you where pressure can travel next.' },
  { n: '02', title: 'Ask what is redeemable', body: 'Cash reserves, collateral, and hedge positions behave differently when many holders want out. Retail cannot redeem with the issuer at par (institutional minimums and KYC apply); secondary markets enforce the retail price. That is why a Curve pool can wobble while primary collateral sits intact.' },
  { n: '03', title: 'Separate stress from collapse', body: 'Not every depeg is permanent. Recovery depends on whether the underlying mechanism can still function. Supply shrinking is not a depeg: Aug 2026 saw ~$15B redeemed with prices holding within ~0.1%.' },
  { n: '04', title: 'Ask where it settles', body: 'The same token behaves differently by rail: Tron carries retail USDT in emerging markets, Ethereum and L2s carry institutional and DeFi flow. Native issuance differs from bridged, and issuer freeze functions can strand balances on any of them.' },
];

// --- Section 8: regulation ----------------------------------------------
export const regulation = [
  { jurisdiction: 'United States', framework: 'GENIUS Act', status: 'Enacted Jul 2025. Commencement UNRESOLVED: section 20 sets it at the earlier of 18 months (outer limit Jan 18, 2027) or 120 days after final regulations, and no final rule is verified', pegs: 'USD', algorithmic: 'Banned', rules: '1:1 against eight eligible reserve classes, not T-bills alone; monthly composition disclosure; no pledge or rehypothecation outside statutory exceptions; no yield to holders; bank + nonbank PPSI; <$10B state path' },
  { jurisdiction: 'European Union', framework: 'MiCA', status: 'Token rules live Jun 30, 2024; CASP grandfathering ended Jul 1, 2026; EC review consultation closes Sep 30, 2026', pegs: 'EUR focus; other currencies capped', algorithmic: 'Banned in practice', rules: 'EMTs (single fiat) + ARTs (basket); 30/60% bank deposit quota; non-euro daily caps (euro-pegged EMTs are not subject to the cap)' },
  { jurisdiction: 'United Kingdom', framework: 'FSMA / FCA', status: 'FCA authorisation opens Sep 30, 2026; regime commences Oct 25, 2027; BoE systemic-issuer consultation closes Sep 22, 2026', pegs: 'GBP focus', algorithmic: 'Banned in practice', rules: '100% HQLA; 1% capital (diluted from 2%); no yield; BoE oversight for systemic' },
  { jurisdiction: 'Japan', framework: 'Payment Services Act', status: 'Live (2023, updated Jun 2025); foreign coins via licensed distributors from Jun 1 2026', pegs: 'JPY; USD via distributor', algorithmic: 'Banned', rules: 'Issuers limited to banks/trust/transfer providers; up to 50% gov bonds' },
  { jurisdiction: 'Singapore', framework: 'MAS Stablecoin Framework', status: 'Framework effective Jul 1, 2026 (single-currency stablecoins); legislation 2026', pegs: 'SGD + G10', algorithmic: 'Banned in practice', rules: '100% segregated reserves; monthly independent checks; MPI license' },
  { jurisdiction: 'Hong Kong', framework: 'Stablecoins Ordinance', status: 'Effective Aug 1, 2025; first licenses Apr 2026 (HSBC/StanChart tipped)', pegs: 'HKD + foreign', algorithmic: 'Explicitly banned', rules: 'HK$25M capital min; 100% reserve at market value' },
  { jurisdiction: 'UAE', framework: 'CBUAE Payment Token Reg', status: 'Live (Aug 2024)', pegs: 'AED focus; fiat', algorithmic: 'Banned in practice', rules: '100% fiat backing; first licensed AED token late 2024' },
  { jurisdiction: 'India', framework: 'Pending / ambiguous', status: 'Debated 2025-2026', pegs: 'n/a', algorithmic: 'n/a', rules: 'No explicit law; 30% tax; RBI favors CBDC; FEMA classification uncertain' },
];

// --- Section 8b: recent regulatory movement (dated, re-verify before citing) ---
export const regulationNews = [
  { date: 'Sep 2026', label: 'US: CLARITY Act Senate vote due Sep 15', detail: 'Market-structure bill that would narrow the SEC/CFTC gap for stablecoin-adjacent activity; a separate bill from the GENIUS Act (S.1582).', source: 'https://www.congress.gov/bill/119th-congress/house-bill/3633' },
  { date: 'Aug 26, 2026', label: 'Korea: Shinhan-Visa stablecoin pilot', detail: 'Strategic agreement to test stablecoin issuance, remittance, and redemption for the Korean market.', source: 'https://reports.tiger-research.com/p/2026-asia-stablecoin-market-overview-eng' },
  { date: 'Jul 14, 2026', label: 'Japan: JCB-Circle MOU', detail: 'Card network exploring USDC payments and cross-border settlement in Japan; travel-rule data requirements live from Aug 3, 2026.', source: 'https://cointelegraph.com/news/japans-jcb-signs-mou-with-circle-to-explore-usdc-payments-and-cross-border-settlements' },
];

// --- Section 9: reality check -------------------------------------------
// Each row keeps its own measure date. A row is never re-dated to the
// publication or review date of this edition.
export const realityCheck = [
  { label: 'US money-market funds', value: 7900, unit: '$B', note: 'ICI, Aug 2026' },
  { label: 'US gold ETFs', value: 530, unit: '$B', note: 'World Gold Council, Jul 2026' },
  { label: 'Fiat-pegged stablecoins', value: 303, unit: '$B', note: 'Sep 2026 snapshot; contracted -0.9% over the prior 90 days. Historical observation, not re-dated' },
  { label: 'RWA ex-stablecoins', value: 33.5, unit: '$B', note: 'Reported distributed value, early July 2026 (rwa.xyz). The separate represented or pipeline figure near $345B counts committed but not yet tradable assets and is not this measure' },
  { label: 'Tokenized gold', value: 6, unit: '$B', note: '~$5-8B, ~70% of tokenized commodities' },
];

// --- deduplicated source list (merged from all 3 research files) ---------
/**
 * Who earns the float: disclosed issuer economics, primary-sourced.
 * Every figure carries its own as-of date and states what it measures.
 * Tether publishes no line called "reserve income"; its single net line is
 * "Financial result" in the change-in-net-equity table. Circle does publish
 * "reserve income". They are not the same measure and must not be compared
 * as if they were.
 */
export const floatEconomics = [
  {
    issuer: 'Tether',
    measure: 'Net operating profit, Q2 2026',
    value: '+$1.50B',
    asOf: 'Q2 2026 (pub. 2026-07-31)',
    note: 'Tether\'s own release headline. The term is not defined in any Tether document; Tether does not state that mark-to-market is excluded.',
  },
  {
    issuer: 'Tether',
    measure: 'Change in net equity, Q2 2026 standalone',
    value: 'about -$4.21B',
    asOf: 'Q2 2026 (2026-06-30)',
    note: 'Derived from Tether\'s own change-in-net-equity table: H1 2026 is -$3,171m and Q1 2026 was +$1,040m. Tether publishes no reconciliation between this and the headline above.',
  },
  {
    issuer: 'Tether',
    measure: 'FY2025 financial result',
    value: '+$10.11B',
    asOf: 'FY2025 (2025-12-31)',
    note: 'Exact figure, 10,106 USD millions. Dividends of 10,855 were distributed, so equity fell year on year.',
  },
  {
    issuer: 'Circle',
    measure: 'Reserve income, Q2 2026',
    value: '$667.7M',
    asOf: 'Q2 2026 (2026-06-30)',
    note: 'From the 10-Q. 95.2% of Circle\'s Q2 2026 total revenue (96.0% for FY2025). This is the income on reserves, before the distribution split.',
  },
  {
    issuer: 'Circle',
    measure: 'Coinbase-only distribution, Q2 2026',
    value: '$324.6M',
    asOf: 'Q2 2026 (2026-06-30)',
    note: '46.3% of the $701.3M revenue line. Do not confuse with the $412.5M total distribution, transaction and other costs, which is a different, larger figure.',
  },
  {
    issuer: 'Circle',
    measure: 'Net loss from continuing operations, FY2025',
    value: '-$69.5M',
    asOf: 'FY2025 (2025-12-31)',
    note: 'A net loss despite reserve income of $2.64B, driven by $844.9M of compensation expense. Reserve income grew 58.7% year on year.',
  },
];

/**
 * The GENIUS Act no-yield rule, stated from the statute text itself.
 * Section 4(a)(11), codified at 12 U.S.C. 5903(a)(11), Public Law 119-27.
 */
export const yieldBan = {
  citation: 'GENIUS Act Sec. 4(a)(11), 12 U.S.C. 5903(a)(11)',
  quote: 'No permitted payment stablecoin issuer or foreign payment stablecoin issuer shall pay the holder of any payment stablecoin any form of interest or yield (whether in cash, tokens, or other consideration) solely in connection with the holding, use, or retention of such payment stablecoin.',
  payor: 'The issuers only. There is no de minimis, no safe harbour, and no exception; the only qualifier is the word "solely".',
  silence: 'The Act contains no "economically equivalent to interest" test. A whole-Act keyword sweep of the 142,949-character statute text returns "yield" exactly once (in the ban) and zero hits for reward, incentive, loyalty, dividend, bonus, rebate, cash back, cashback, points, airdrop, distributor, proceeds, surplus, income, revenue, retain, or economically. What it permits for rewards and loyalty programmes is therefore UNKNOWN: the statute is silent, and the silence is total.',
  reserveIncome: 'Reserve assets must be interest-bearing by construction. The Act nowhere requires or forbids passing that income on, so retaining it is unregulated rather than permitted or prohibited. Note that eligible reserves are a list of eight classes under Sec. 4(a)(1)(A), not Treasury bills alone; the 93-day Treasury provision sits inside that list.',
  effective: 'Section 20 sets commencement at the earlier of 18 months after enactment (an outer limit of January 18, 2027) or 120 days after the primary federal regulators issue final implementing regulations, so a final rule issued mid-2026 would bring it into force sooner. January 18, 2027 is the outer limit, not a fixed date, and whether an earlier trigger has occurred is UNRESOLVED in this report\'s research record.',
};

/**
 * The three clocks of an agentic payment. A stablecoin rail can be live while
 * the authorization layer above it is only a draft, and the two are routinely
 * reported as though they were the same thing.
 */
export const agenticRails = [
  { name: 'x402', operator: 'x402 Foundation (Linux Foundation), originated at Coinbase', layer: 'Settlement rail', asset: 'USDC primarily, any ERC-20/SPL', status: 'LIVE', detail: 'Protocol live since 2025; Foundation operational launch 2026-07-14.' },
  { name: 'MPP', operator: 'Stripe + Tempo Labs', layer: 'Settlement rail, with identity as an extension', asset: 'Stablecoin (Tempo USDC.e, Solana USDC), cards, Lightning', status: 'LIVE (production)', detail: 'Tempo chain mainnet 2026-03-18; Stripe stablecoin settlement live on it.' },
  { name: 'ACP', operator: 'OpenAI + Stripe', layer: 'Authorization, checkout, credential relay', asset: 'None named; the merchant\'s own PSP settles', status: 'SPEC LIVE (beta)', detail: 'Native in-chat purchase was withdrawn 2026-03. No GMV, transaction count or live merchant count is published by anyone.' },
  { name: 'AP2', operator: 'Google, now FIDO Alliance', layer: 'Authorization and identity evidence', asset: 'Instrument-agnostic; no money movement', status: 'ANNOUNCED + open spec v0.2', detail: 'No production deployment is sourceable. The repo\'s own samples steer users to mocked PSPs.' },
  { name: 'Visa TAP', operator: 'Visa (+ Cloudflare)', layer: 'Authorization and agent identity', asset: 'Visa card rails settle', status: 'PILOT, self-disclaimed', detail: 'Visa\'s only published figure is "hundreds" of transactions, Dec 2025. No 2026 count exists.' },
  { name: 'Mastercard Agent Pay / Agentic Tokens', operator: 'Mastercard', layer: 'Network and authorization', asset: 'Card rails; stablecoins only via AP4M', status: 'Consumer: enabled/pilot. AP4M: ANNOUNCED', detail: 'Mastercard publishes no agent transaction count; its own Q2 2026 deck contains zero occurrences of the word "agent".' },
  { name: 'ERC-8004', operator: 'MetaMask, Ethereum Foundation, Google, Coinbase authors', layer: 'Identity, discovery, reputation', asset: 'NONE (payments explicitly out of scope)', status: 'DRAFT since 2025-08-13', detail: 'Registries deployed and called on-chain, but no first-party source names a production marketplace transacting through them.' },
];

/**
 * Agentic payment volume, every published figure, with its publisher and what
 * it actually counts. The spread is the finding: these are not the same
 * quantity measured more or less precisely, they are different quantities.
 */
export const agenticVolume = [
  { figure: '12,293,450 transactions and $974,215.14 at six decimals, 27,467 unique buyers, 38,519 unique sellers', window: 'dashboard cumulative total, window and inclusion rules not stated in the page', publisher: 'x402scan (operator: Merit Systems), fetched 2026-10-01', label: 'MEASURED for what it indexes; the stated window and inclusion rules are not published, so this total cannot be placed on the same axis as an August-only count' },
  { figure: '$24.24M across 75.41M transactions', window: '"last 30 days", undated on the page', publisher: 'x402.org (the Foundation)', label: 'SELF-REPORT, no methodology and no timestamp on the landing page' },
  { figure: 'more than 100 million x402 payments across Base and Solana', window: 'cumulative, window unbounded', publisher: 'Coinbase CDP docs', label: 'SELF-REPORT, a vendor counting its own facilitator' },
  { figure: '$52.7M across 198.9M settlement transactions', window: 'cumulative since May 2025, as of 2026-09-09', publisher: 'TRM Labs', label: 'MEASURED, independent third party' },
  { figure: '$2.59bn across 18.3M payments, five countably comparable EVM chains; about 88% of that value in one bridging contract on Arbitrum', window: 'August 2026', publisher: 'Bitquery', label: 'MEASURED by a publisher-operated indexer; dominated by bridge transfers, not commerce' },
  { figure: '$317M residual after removing that one Arbitrum bridging contract from the five-chain total (rounded inputs give $318.25M)', window: 'August 2026', publisher: 'Bitquery', label: 'SCOPE-LIMITED subset residual: includes the other four chains, is not Arbitrum-only and is not commerce-only. The commerce-only share of x402 volume is UNRESOLVED: no source estimates it on a common denominator.' },
  { figure: 'about $15.0M across 109.6M transactions, wash and test activity excluded', window: 'cumulative to 2026-04-21', publisher: 'Visa + Artemis Analytics', label: 'MEASURED by Artemis, co-published by a Tempo validator; wash-adjusted, single ecosystem, earlier data date' },
  { figure: '$38,000 across ~184,600 transactions', window: 'cumulative to 2026-04-21', publisher: 'Visa + Artemis Analytics', label: 'MEASURED by Artemis, unadjusted companion to the row above' },
];

/**
 * Where the money actually lands, per transaction. This is the section the
 * headline totals hide: the median x402 transaction is about one cent.
 */
export const agenticTicketSize = [
  { measure: 'x402 median ticket, August 2026', value: '$0.006 Base, $0.001 Optimism, $0.01 Polygon', publisher: 'Bitquery', note: 'Per-chain medians. Arbitrum at $25.61 and Ethereum at $72.16 are outliers driven by a small number of large calls.' },
  { measure: 'x402 ticket distribution', value: 'median $0.01 to $0.10; 76% of activity below a $0.30 floor', publisher: 'Keyrock, in conversation with Coinbase and Tempo', note: 'Vendor-sourced measurement.' },
  { measure: 'x402 index census', value: 'median $0.009; 99th percentile $0.28; 51.4% under one cent', publisher: 'third-party census', note: 'SECONDARY, modelled from price lists times call counts, not measured on-chain.' },
  { measure: 'x402 mean settled value', value: '$0.265 raw, $0.129 on screened commerce', publisher: 'TRM Labs', note: 'MEASURED, independent.' },
  { measure: 'ERC-8004 agents on Base, value at stake', value: 'per-agent median $0.70, mean $16.74', publisher: 'Xiong et al., arXiv:2606.26028', note: 'MEASURED, independent academic. This is per agent, not per transaction.' },
];

export const growthHonest = {
  thesis: 'Growth in 2026 has stalled while the forecasts have not.',
  points: [
    {
      label: 'Issuance growth by year, from one aggregator series',
      value: '+58.4% (2024), +49.0% (2025), +1.5% (2026 to date)',
      source: 'DefiLlama stablecoin series, computed at year-end marks (2023-12-31 $130.35B, 2024-12-31 $206.47B, 2025-12-31 $307.54B, and $311.30B on 2026-09-26). Recompute, do not carry forward.',
    },
    {
      label: 'Distance below the 2026 peak',
      value: '-3.05%',
      source: 'Peak $321.09B on 2026-05-20 against $311.30B on 2026-09-26.',
    },
    {
      label: 'Real economic activity versus gross stablecoin transfers',
      value: 'about 7% broad, under 1% narrow',
      source: 'BCG and Allium Labs (2026-09-30): more than $62T of annual stablecoin transfers, with real economic activity of $4.2T, which the authors put at about 7% of the total. Separately, roughly $350B to $550B of observable bilateral goods-and-services payments in 2025, which is 0.565% to 0.887% of the gross figure and which the authors label a directionally robust lower bound. The two definitions are not interchangeable. An earlier version of this report claimed 95% to 99% was non-payment; no source contains that figure and it is withdrawn.',
    },
  ],
  note: 'The distinction that matters is between growth in issuance and growth in real payments. Issuance roughly tripled across 2024 and 2025 and then went flat; the multi-trillion forecasts to 2030 are unchanged by that. A 1.5% year is not evidence the forecasts are wrong, but it is evidence the current trajectory and the forecast trajectory are not the same line. On the other side, the payment share is a definition, not a measurement anyone has agreed on: about 7% under the broad definition and under 1% under the narrow goods-and-services one. The commercial share of stablecoin volume is UNRESOLVED.',
};

/**
 * Circle's own L1, stated at chain level rather than from coverage.
 * A live testnet and a live mainnet both exist, and reports of "testnet only"
 * come from a docs page that serves the testnet tab by default.
 */
export const arcStatus = {
  name: 'Arc',
  operator: 'Circle Internet Group (NYSE: CRCL)',
  status: 'MAINNET LIVE',
  launched: '2026-09-16 (New York)',
  chainId: '5042 (0x13b2)',
  testnetChainId: '5042002 (0x4cef52)',
  gas: 'USDC, with no volatile native token required',
  verification: 'Read from Circle\'s own release and probed directly against the RPC endpoint. The chain answered eth_chainId with 0x13b2 and returned an advancing block height, so the claim is chain-level, not a press claim.',
  caveat: 'A live testnet also exists (chain ID 5042002). Arc\'s "Connect to Arc" docs page serves the testnet tab by default, which is why some coverage describes Arc as testnet only. Both are live.',
};

/**
 * Open USD (OUSD). Issuer-reported LIVE since 2026-09-30, not announced-only.
 * The teaching point is preserved but relocated: a single dated supply snapshot
 * is not an adoption series, and reserve earnings accrue to partners rather
 * than to holders.
 */
export const openUsdStatus = {
  name: 'Open USD (OUSD)',
  issuer: 'Issued by Bridge Building Inc., a Stripe company. Open Standard, a consortium founded by Coinbase, Mastercard, Shopify, Stripe and Visa, states it is an independent company; the independence claim is about the company, not the issuer.',
  announced: 'Announced 2026-06-30 with "over 140 businesses" named on the consortium\'s own site; founding CEO Zach Abrams',
  status: 'LIVE, issuer-reported. Launched 2026-09-30.',
  chains: 'Base, Ethereum, Solana and Tempo, named by the issuer at launch. Solana went live the same day with free 1:1 mint and burn, per third-party reporting.',
  supplySnapshot: 'The issuer\'s own reserve page reported total supply in circulation of $468,445,399 at 11:30 UTC on 2026-10-01, described as fully collateralised: $257,214,691 cash (54.91%) and $211,230,708 Treasuries (45.09%), which sum exactly to total supply. Treasuries include money market funds holding T-bill ladders under three months.',
  supplyScope: 'Issuer self-report at one timestamp, and that is all it is. Supply is not adoption, velocity or payment volume. A single snapshot is not a series, so no trend, share or growth rate is derived from it here. Note also that DefiLlama lists a ticker "OUSD" that is Origin Dollar, an unrelated project, and it must not be read as this one.',
  reserveEarnings: 'Open Standard states that partners earn rewards proportional to the supply and activity they drive, with an opportunity to earn equity. These are company statements about partner economics, not token-holder yield or proof of realized payouts.',
  holderRights: 'A holder has a claim against the issuer. Nothing verified here gives a holder direct legal title to the reserve assets or any right to instruct how they are invested, and the reserve assets are not Treasuries alone.',
  charter: 'Bridge states it received conditional OCC approval to establish Bridge National Trust Bank. Conditional approval is not a final charter. No primary OCC order is verified in this report\'s research record, so the conditions and current status are UNRESOLVED.',
  preGuardClaim: 'A claim circulating in secondary coverage, that holding OUSD confers direct legal title to the reserve securities and the right to instruct how they are traded, is not supported by any source used here and is contradicted by the partner-not-holder structure. It is not repeated as fact.',
  marketReaction: 'UNRESOLVED. The earlier version of this report attributed a single-day price move at a specific issuer to the announcement as "plausible, not proven". No verified price series supports any attribution here, so none is asserted.',
  members: 'Confirmed from the consortium\'s own partner list: Visa, Mastercard, American Express, Discover, Stripe, BlackRock, BNY, Standard Chartered, DBS, Google, Samsung, IBM, Shopify, Coinbase, Ripple, MetaMask, Fireblocks. Circle and Tether are absent from the list.',
};

/**
 * The two funds that sit beside stablecoins rather than in them.
 * Figures are the issuers' own pages, fetched on the date shown.
 */
export const rwaFunds = [
  { product: 'Ondo USDY', issuer: 'Ondo Finance', size: '$2.29B', asOf: '2026-09-26 (Ondo product page)', backing: 'About 96% US Treasuries held via a bankruptcy-remote structure. Not backed by BUIDL.', note: 'A yield-bearing tokenized note, so it is a security rather than a payment instrument.' },
  { product: 'Ondo OUSG', issuer: 'Ondo Finance', size: '$319.8M', asOf: '2026-09-26 (Ondo product page)', backing: 'Tokenized fund shares; largest sleeve is State Street Galaxy SWEEP at roughly 45%, with BUIDL at roughly 30%.', note: 'Note the correction: earlier secondary reporting said OUSG was mostly BUIDL-backed. It is not.' },
  { product: 'BlackRock BUIDL', issuer: 'BlackRock / Securitize', size: 'no verified current AUM (UNRESOLVED); dated secondary reports below', asOf: 'reports dated 2026-05, early July and August 2026, none primary and not interchangeable', backing: 'Tokenized money market fund shares. A tokenized fund share is a fund interest; the underlying securities are owned by the fund. The two are legally and economically distinct.', note: 'Current fund-specific AUM is UNRESOLVED, so no range is presented as one. Dated secondary reports for the same fund are listed in buidlSecondaryReports rather than merged into a single figure. Securitize\'s $4.3B is platform-wide tokenized AUM as of 2026-06-30, not BUIDL AUM, and is not substituted for it. The only primary BUIDL figure on file is a cumulative gross sales number on a Form D/A, which is not AUM. BRSRV is a separate GENIUS-Act reserve vehicle, not a successor product.' },
];

/**
 * BUIDL: three differently dated secondary figures for one fund, kept apart on
 * purpose. Merging them into a "current range" would imply a currency and a
 * single valuation basis that none of them has. The gap is retained, not closed.
 */
export const buidlSecondaryReports = {
  status: 'No current BUIDL AUM is asserted. Each figure below is an attributed, dated secondary report.',
  reports: [
    { figure: 'about $2.5B to $2.9B', asOf: 'early July 2026', source: 'Secondary aggregator reporting; the same source notes BUIDL became tradeable on Uniswap via UniswapX in February 2026' },
    { figure: 'about $2.7B, alongside Circle USYC at about $3.0B; the same compilation elsewhere gives both funds as each about $2.4B to $3.0B', asOf: 'August 2026', source: 'A separate compilation citing DefiLlama' },
    { figure: 'approximately $2.4B, deployed across eight named chains', asOf: 'May 2026', source: 'Secondary research-house reporting' },
  ],
  attributionCorrection: 'An earlier version of this report cited the aggregator capture for the $2.7B figure. That capture contains no such figure: its only 2.7 is a $2.7 trillion 2030 DeFi-deployment projection, a different quantity in a different unit. The $2.7B figure is sourced to the DefiLlama-citing compilation instead.',
  issuerSide: 'Securitize\'s Q2 2026 release reports $4.3B total tokenized AUM as of 2026-06-30, platform-wide, and separately quotes approximately $5.0B managed onchain. Neither is BUIDL fund AUM and neither is substituted for it.',
  whatWouldCloseIt: 'A dated BUIDL-specific issuer or administrator disclosure with chain aggregation and a stated valuation basis.',
};

/**
 * Tokenized-value depth. Headline tokenized value counts committed and
 * represented assets; weekly public movement counts something else. Both are
 * stated, with their separate denominators, and neither is silently merged.
 */
export const rwaDepth = {
  headline: 'Reported value and actual weekly movement are different measurements',
  reportedValue: 'About $33.5B of tokenized real-world-asset value excluding stablecoins in early July 2026 (rwa.xyz), against a separate "represented" or pipeline figure near $345B that counts assets committed to tokenization but not yet freely tradable. Conflating those two is the single largest available error on this topic.',
  transferActivity: 'Of 1,289 tested tokenized assets above $100,000, 910 recorded zero weekly transfers and 379 recorded movement. That is 70.60% by count. By value, the publisher reports $32.9B without transfers against $26.2B active, stated as 56% of the value measured for transfer activity.',
  denominatorNote: 'The two percentages have different denominators and must not be swapped. Reproduced from the article\'s rounded components, $32.9B is 55.67% of the $59.1B transfer-measured subset; against the publisher\'s separate $60B market base it is 54.83%. The bases are not interchangeable.',
  dataDate: 'Article published 2026-07-02. The publisher\'s report landing page separately dates its data to 2026-05-31 and gives a $60B market size. The precise transfer week, exclusions and full methodology are UNRESOLVED.',
  interpretation: 'This establishes low reported weekly transfer activity, not economically idle capital. About $27B of the reported dormant value came from "represented" assets, which the publisher says were not necessarily designed for public secondary-market movement. A ledger-style holding can still perform useful economic functions off-chain.',
  defiShare: 'About 10% of tokenized RWA value flows into DeFi protocols, per the same secondary source; the definition of deployment is not given, so it is a single uncorroborated figure.',
  notEstablished: 'This evidence does not establish economic substitution between tokenized assets and stablecoins, and a tokenized fund share does not equal ownership of the underlying asset.',
  url: 'https://beincrypto.com/reality-of-rwa-tokenization-2026/',
};

/**
 * Reserve-income distribution. Open Standard's partner payout is not a new
 * category: Circle already discloses balance-linked distribution costs. What
 * cannot be compared is generosity, because like-for-like terms are missing.
 */
export const distributionEconomics = {
  headline: 'Paying distributors is not new, and the comparison is not available',
  incumbent: 'Circle\'s Q2 2026 Form 10-Q states that distribution costs payable to key distributors such as Coinbase and Binance are directly impacted by the amount of USDC held on their respective platforms. Circle reported reserve income of $667,733 thousand against distribution and transaction costs of $410,414 thousand for the three months to 2026-06-30, a ratio of 0.6146, and $1,320,241 thousand against $815,816 thousand for the six months, a ratio of 0.6179. Accrued distribution costs stood at $105,799 thousand at 2026-06-30, down from $119,038 thousand at 2025-12-31.',
  namedTerms: 'The same filing discloses Coinbase distribution costs of $324.6 million for the quarter and $655.3 million for the half year, and states that Coinbase receives allocations based on USDC held on its platform after issuer retention, plus half the remaining amount tied to broader ecosystem growth after approved third-party participants are paid. The issuer-retention amount is not disclosed.',
  caveat: 'The headline cost line combines distribution and transaction costs, so the distribution-only portion cannot be isolated from it. The named Coinbase figures come from a separate disclosure and are a named arrangement, not a universal distributor rate.',
  challenger: 'Open Standard states that reserve earnings go to partners, and that founders and participating partners can earn equity based on the supply and activity they drive. Bridge reports over $1 billion issued across stablecoins including OUSD; none of that is a partner payout figure.',
  conclusion: 'Routing reserve earnings to partners is a redistribution of an existing industry practice, not its introduction. The novelty claim is not established by this evidence. Whether Open Standard is more or less generous is UNRESOLVED: partial Circle terms are now evidenced, but a comparable Open Standard contract and realized payments are still missing, and one disclosed rate does not settle a comparison.',
  unresolved: 'UNRESOLVED: like-for-like net-of-fee contracts, issuer retention amounts and realized payouts on both sides.',
  circleUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042',
};

export const sources = [
  { id: 'tether-q2-2026', label: 'Tether - Q2 2026 attestation release ($1.5B net operating profit claim)', url: 'https://tether.io/news/tether-posts-strong-q2-performance-generates-1-5b-net-operating-profit-maintains-4-11b-reserve-buffer-and-expands-gold-holdings-to-more-than-146-tons/' },
  { id: 'genius-pl119-27', label: 'US Code - 12 U.S.C. 5903 (GENIUS Act Sec. 4), yield prohibition and 93-day reserve cap', url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title12-section5903&num=0&edition=prelim' },
  { id: 'x402-foundation', label: 'x402 Foundation - protocol homepage and 30-day network panel', url: 'https://x402.org/' },
  { id: 'x402scan', label: 'x402scan (Merit Systems) - live x402 transaction index', url: 'https://www.x402scan.com/' },
  { id: 'trm-x402', label: 'TRM Labs - "Who\'s actually paying? Measuring AI agent payments on-chain"', url: 'https://www.trmlabs.com/trm-tech-blog/whos-actually-paying-measuring-ai-agent-payments-onchain' },
  { id: 'bitquery-x402', label: 'Bitquery - x402 AI agent payments on-chain audit', url: 'https://bitquery.io/investigations/x402-ai-agent-payments-audit' },
  { id: 'keyrock-agent', label: 'Keyrock - "Who Pays the Agent?" (median ticket size, $0.30 card-fee floor)', url: 'https://keyrock.com/who-pays-the-agent/' },
  { id: 'visa-artemis-agentic', label: 'Visa + Artemis Analytics - Agentic Payments from the Ground Up (PDF)', url: 'https://www.visa.com/vcom-assets/content/dam/visa/reimagine-visa/thought-leadership/documents/agentic-payments-report.pdf' },
  { id: 'stripe-mpp', label: 'Stripe - Machine Payments Protocol launch post', url: 'https://stripe.com/blog/machine-payments-protocol' },
  { id: 'tempo-mainnet', label: 'Tempo - mainnet launch (MPP introduced alongside)', url: 'https://tempo.xyz/blog/mainnet' },
  { id: 'mpp-overview', label: 'MPP - protocol overview (co-authored by Tempo and Stripe)', url: 'https://mpp.dev/overview' },
  { id: 'acp-docs', label: 'Agentic Commerce Protocol (ACP) - documentation', url: 'https://www.agenticcommerce.dev/docs' },
  { id: 'ap2-protocol', label: 'AP2 - Agent Payments Protocol homepage', url: 'https://ap2-protocol.org/' },
  { id: 'fido-ap2', label: 'FIDO Alliance - trusted AI agent interactions standards', url: 'https://fidoalliance.org/fido-alliance-to-develop-standards-for-trusted-ai-agent-interactions/' },
  { id: 'visa-tap-dev', label: 'Visa - Trusted Agent Protocol (TAP) capability page', url: 'https://developer.visa.com/capabilities/trusted-agent-protocol' },
  { id: 'visa-tap-pr', label: 'Visa - press release: "hundreds" of agent-initiated transactions (Dec 2025)', url: 'https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.21961.html' },
  { id: 'cdp-x402', label: 'Coinbase CDP - x402 (vendor self-report on payment count)', url: 'https://docs.cdp.coinbase.com/x402/welcome' },
  { id: 'erc8004', label: 'ERC-8004 - Trustless Agents (draft; payments explicitly out of scope)', url: 'https://eips.ethereum.org/EIPS/eip-8004' },
  { id: 'circle-arc-mainnet', label: 'Circle - press release: Arc mainnet launch (2026-09-16)', url: 'https://www.circle.com/pressroom/circle-launches-arc-mainnet-an-economic-operating-system-for-the-internet' },
  { id: 'arc-rpc', label: 'Arc mainnet JSON-RPC endpoint (chain ID probe)', url: 'https://rpc.mainnet.arc.io' },
  { id: 'open-standard', label: 'Open Standard / Open USD - consortium site and partner list', url: 'https://joinopenstandard.com/' },
  { id: 'open-standard-intro', label: 'Open Standard - "Introducing Open USD" announcement (2026-06-30)', url: 'https://joinopenstandard.com/blog/introducing-open-usd' },
  { id: 'ondo-usdy', label: 'Ondo Finance - USDY product page (size and backing)', url: 'https://ondo.finance/usdy' },
  { id: 'ondo-ousg', label: 'Ondo Finance - OUSG product page (size and sleeve composition)', url: 'https://ondo.finance/ousg' },
  { id: 'buidl-formd', label: 'SEC EDGAR - BUIDL Form D/A (cumulative gross sales, not AUM)', url: 'https://www.sec.gov/Archives/edgar/data/2013810/000201381026000002/primary_doc.xml' },
  { id: 'securitize-buidl', label: 'Securitize - BUIDL fund page (no issuer-published AUM)', url: 'https://securitize.io/blackrock/buidl' },
  { id: 'defillama-stablecoincharts', label: 'DefiLlama - total stablecoin market cap series (growth computation)', url: 'https://stablecoins.llama.fi/stablecoincharts/all' },
  { id: 'tic', label: 'US Treasury TIC - Major Foreign Holders of Treasuries', url: 'https://ticdata.treasury.gov/Publish/mfh.txt' },
  { id: 'tether-transp', label: 'Tether transparency / reserves attestation', url: 'https://tether.to/en/transparency/' },
  { id: 'circle-transp', label: 'Circle reserve report', url: 'https://www.circle.com/en/transparency' },
  { id: 'congress-genius', label: 'Congress.gov - GENIUS Act (S.1582)', url: 'https://www.congress.gov/bill/119th-congress/senate-bill/1582' },
  { id: 'morganlewis-genius', label: 'Morgan Lewis - GENIUS Act breakdown', url: 'https://www.morganlewis.com/pubs/2025/07/genius-act-passes-in-us-congress-a-breakdown-of-the-landmark-stablecoin-law' },
  { id: 'coingecko-svb', label: 'CoinGecko Research - Stablecoin Supply Impacted by SVB', url: 'https://www.coingecko.com/research/publications/stablecoins-supply-svb-impact' },
  { id: 'cnbc-svb', label: 'CNBC - USDC breaks dollar peg', url: 'https://www.cnbc.com/2023/03/11/stablecoin-usdc-breaks-dollar-peg-after-firm-reveals-it-has-3point3-billion-in-svb-exposure.html' },
  { id: 'sd-terra', label: 'ScienceDirect - Anatomy of a Stablecoin failure (Terra-Luna)', url: 'https://www.sciencedirect.com/science/article/abs/pii/S1544612322005359' },
  { id: 'reuters-terra', label: 'Reuters - TerraUSD falls to 30 cents', url: 'https://www.reuters.com/technology/dollar-pegged-stablecoin-terrausd-falls-30-cents-2022-05-11/' },
  { id: 'binance-terra', label: 'Binance - The Collapse of LUNA and UST', url: 'https://www.binance.com/en/square/post/22931497315953' },
  { id: 'ecb-mpb', label: 'ECB Macroprudential Bulletin - euro stablecoins and sovereign bonds', url: 'https://www.ecb.europa.eu/press/financial-stability-publications/macroprudential-bulletin/html/ecb.mpbu202604_05.en.html' },
  { id: 'fed-feds', label: 'Federal Reserve FEDS Note - Banks in the Age of Stablecoins', url: 'https://www.federalreserve.gov/econres/notes/feds-notes/banks-in-the-age-of-stablecoins-implications-for-deposits-credit-and-financial-intermediation-20251217.html' },
  { id: 'bis-wp1370', label: 'BIS Working Paper 1370 - Dollarisation and monetary control', url: 'https://bis.org/publ/work1370.pdf' },
  { id: 'bis-aer', label: 'BIS Annual Economic Report - Anchoring trust in money', url: 'https://www.bis.org/publications/iii-anchoring-trust-money-innovation-beyond-stablecoins_2.pdf' },
  { id: 'imf-par-to-pressure', label: 'IMF WP 2026/005 - From Par to Pressure', url: 'https://www.imf.org/en/publications/wp/issues/2026/01/16/from-par-to-pressure-liquidity-redemptions-and-fire-sales-with-a-systemic-stablecoin-573271' },
  { id: 'coingecko-rwa', label: 'CoinGecko Research - RWA Report 2026', url: 'https://www.coingecko.com/research/publications/rwa-report-2026' },
  { id: 'rwa-xyz', label: 'rwa.xyz - RWA tokenization market data', url: 'https://rwa.xyz' },
  { id: 'defillama-stables', label: 'DefiLlama - Stablecoins dashboard', url: 'https://defillama.com/stablecoins' },
  { id: 'coindesk-tether-q1', label: 'CoinDesk - Tether Q1 2026 attestation results', url: 'https://www.coindesk.com/business/2026/05/01/tether-posts-usd1-04-billion-q1-profit-reaches-usd8-23-billion-reserve-buffer' },
  { id: 'worldbank-remittance', label: 'World Bank Remittance Prices Worldwide Issue 53 Q1 2025', url: 'https://remittanceprices.worldbank.org/sites/default/files/rpw_main_report_and_annex_q125_1_0.pdf' },
  { id: 'chainalysis-geo', label: 'Chainalysis Geography of Cryptocurrency 2025', url: 'https://www.chainalysis.com/reports/2025-geography-of-cryptocurrency-report/' },
  { id: 'visa-stablecoins', label: 'Visa - Stablecoin settlement live in the US', url: 'https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.21951.html' },
  { id: 'reuters-uk', label: 'Reuters - UK dilutes stablecoin capital requirement', url: 'https://www.reuters.com/business/finance/uk-dilutes-stablecoin-capital-requirement-final-crypto-rulebook-2026-06-29/' },
  { id: 'hkma-ord', label: 'HKMA - Stablecoin issuers regulatory regime (Hong Kong)', url: 'https://www.hkma.gov.hk/eng/key-functions/international-financial-centre/stablecoin-issuers/' },
  { id: 'cbuae-reg', label: 'CBUAE Payment Token Services Regulation', url: 'https://rulebook.centralbank.ae/en/rulebook/payment-token-services-regulation' },
  { id: 'tiger-research-asia', label: 'Tiger Research - 2026 Asia Stablecoin Market Outlook', url: 'https://reports.tiger-research.com/p/2026-asia-stablecoin-market-overview-eng' },
  { id: 'scorechain-mica', label: 'Scorechain - EU Stablecoin Regulation under MiCA', url: 'https://www.scorechain.com/blog/eu-stablecoin-regulation-mica' },
  { id: 'nyfed-sr1185', label: 'NY Fed Staff Report 1185 - Stablecoin Disintermediation', url: 'https://www.newyorkfed.org/research/staff_reports/sr1185' },
  { id: 'whitehouse-cea', label: 'White House CEA - Effects of stablecoin yield prohibition on bank lending', url: 'https://www.whitehouse.gov/research/2026/04/effects-of-stablecoin-yield-prohibition-on-bank-lending/' },
  { id: 'occ-nprm', label: 'OCC Bulletin 2026-3 - GENIUS Act NPRM', url: 'https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-3.html' },
  { id: 'fdic-nprm', label: 'FDIC - GENIUS Act proposed rulemaking (FIL 2026)', url: 'https://www.fdic.gov/news/financial-institution-letters/2026/notice-proposed-rulemaking-establish-genius-act' },
  { id: 'stablecoinbeat-mc', label: 'Stablecoin Beat - Total market capitalization series (Sep 2026)', url: 'https://stablecoinbeat.com/charts/market-cap' },
  { id: 'bitsgap-supply', label: 'Bitsgap - Stablecoin supply vs depeg, 2026 data', url: 'https://bitsgap.com/blog/stablecoin-supply-a-leading-market-signal' },
  { id: 'netcoins-usde', label: 'Netcoins - Ethena USDe depeg during the Oct 11, 2025 crash', url: 'https://www.netcoins.com/blog/ethenas-usde-depeg-an-overview-and-its-relation-to-the-ena-token' },
  { id: 'messari-usde', label: 'Messari - Ethena USDe (Oct 2025 Binance $0.65 print)', url: 'https://messari.io/project/ethena-usde' },
  { id: 'coinbase-usd1', label: 'Coinbase - USD1 (World Liberty Financial) market data', url: 'https://www.coinbase.com/price/usd1-wlfi' },
  { id: 'stablecoinbeat-reg', label: 'Stablecoin Beat - Global stablecoin regulation tracker (Sep 2026)', url: 'https://stablecoinbeat.com/regulation/' },
  { id: 'stablecoin-insider', label: 'Stablecoin Insider - depeg insurance', url: 'https://stablecoininsider.org/stablecoin-depeg-insurance/' },
  { id: 'stablecoin-insider-clarity', label: 'Stablecoin Insider - CLARITY Act Treasury stablecoin circuit breaker', url: 'https://stablecoininsider.org/clarity-act-treasury-stablecoin-circuit-breaker/' },
  { id: 'cointelegraph-jcb', label: 'Cointelegraph - JCB signs Circle MOU for Japan stablecoin payments', url: 'https://cointelegraph.com/news/japans-jcb-signs-mou-with-circle-to-explore-usdc-payments-and-cross-border-settlements' },
  { id: 'cointelegraph-uk', label: 'Cointelegraph - Bank of England innovation mandate covers stablecoins', url: 'https://cointelegraph.com/news/uk-boe-innovation-mandate-stablecoins' },
  // --- sources added by the 2026-10-02 reconciliation pass ---
  { id: 'genius-text', label: 'GENIUS Act enacted text (Sec. 4 reserve classes, Sec. 20 commencement trigger)', url: 'https://www.congress.gov/bill/119th-congress/senate-bill/1582/text' },
  { id: 'genius-reserve-classes', label: 'GENIUS Act Sec. 4(a)(1)(A) eligible reserve classes (eight, not T-bills only)', url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title12-section5903&num=0&edition=prelim' },
  { id: 'kansascityfed-bulletin', label: 'Kansas City Fed Economic Bulletin - stablecoins and Treasury demand (HTML corrected 2026-09-22; internal arithmetic unreconciled)', url: 'https://www.kansascityfed.org/research/economic-bulletin/stablecoins-could-increase-treasury-demand-but-only-by-reducing-demand-for-other-assets/' },
  { id: 'kansascityfed-pdf', label: 'Kansas City Fed Economic Bulletin PDF (reader-cache freshness unknown; differing component figures)', url: 'https://www.kansascityfed.org/documents/11132/EconomicBulletin25Jacewitz0808.pdf' },
  { id: 'fed-banks-stablecoins', label: 'Federal Reserve FEDS Note (2025-12-17) - Banks in the Age of Stablecoins', url: 'https://www.federalreserve.gov/econres/notes/feds-notes/banks-in-the-age-of-stablecoins-implications-for-deposits-credit-and-financial-intermediation-20251217.html' },
  { id: 'tether-q1-2026', label: 'Tether - Q1 2026 attestation: about $183B token liabilities and about $141B direct and indirect T-bill exposure (2026-03-31)', url: 'https://tether.io/news/tether-posts-1-04b-q1-2026-profit-despite-highly-volatile-global-markets-reaches-all-time-highs-8-23b-reserve-buffer-and-maintains-u-s-treasury-heavy-backing/' },
  { id: 'market-cap-2026-08', label: 'Total stablecoin market cap measurement, 2026-08-13, one aggregator via secondary compilation', url: 'https://reap.global/blog/stablecoin-statistics-2026' },
  { id: 'circle-10q-q2-2026', label: 'Circle - Form 10-Q for the quarter ended 2026-06-30 (balance-linked distribution costs, named Coinbase terms)', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042' },
  { id: 'bcg-allium-payments', label: 'BCG and Allium Labs - Stablecoin payments: the truth behind the numbers (about 7% broad, under 1% narrow goods-and-services)', url: 'https://www.bcg.com/assets/2026/white-paper-stablecoin-payments-truth-behind-numbers.pdf' },
  { id: 'open-usd-live-os', label: 'Open Standard - Open USD is live (issued by Bridge, a Stripe company; reserves at BlackRock, Lead Bank and BNY)', url: 'https://joinopenstandard.com/blog/open-usd-is-live' },
  { id: 'bridge-ousd-live', label: 'Bridge - OUSD issued by Bridge (launch chains, conditional OCC approval for Bridge National Trust Bank)', url: 'https://www.bridge.xyz/blog/ousd-is-live-issued-by-bridge' },
  { id: 'bridge-ousd-reserves', label: 'Bridge - OUSD reserve page (supply snapshot 2026-10-01 11:30 UTC: $468,445,399 supply, 54.91% cash, 45.09% Treasuries)', url: 'https://reserves.bridge.xyz/ousd' },
  { id: 'open-standard-structure', label: 'Open Standard - company structure and leadership (partner equity tied to supply and activity; shareholder board)', url: 'https://joinopenstandard.com/blog/company-structure-and-leadership' },
  { id: 'solana-compass-ousd', label: 'Solana Compass - Open USD goes live on Solana with free 1:1 mint and burn (2026-09-30)', url: 'https://solanacompass.com/news/open-standards-ousd-stablecoin-goes-live-on-solana' },
  { id: 'occ-circle-conditional', label: 'OCC - conditional approval, Circle trust bank application (2025-12-12; preliminary and conditional, not final authorization)', url: 'https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-125a.pdf' },
  { id: 'occ-five-charters', label: 'OCC release 2025-125 - five conditional trust-bank charter approvals (not an exhaustive current register)', url: 'https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-125.html' },
  { id: 'cnbc-circle-charter', label: 'CNBC (2026-07-10) - secondary report of later Circle trust-bank approval under the name Circle National Trust', url: 'https://www.cnbc.com/2026/07/10/circle-gets-an-occ-bank-charter-as-stablecoin-competition-heats-up-shares-surge-14percent.html' },
  { id: 'bitquery-x402-bots', label: 'Bitquery - two automated loops are 83% of the agent payments found (13.2M on Base, 5.7M one-cent on Polygon)', url: 'https://bitquery.io/investigations/x402-ai-agent-payments-audit' },
  { id: 'chainalysis-x402-ping', label: 'Chainalysis (2026-06-03) - x402 growth driven substantially by meme-coin farming; PING pay-to-mint over 150,000 transactions in month one', url: 'https://www.chainalysis.com/blog/x402-agentic-payments-adoption/' },
  { id: 'rwa-reports-value', label: 'CryptoRank (2026-07-15) - tokenized RWA about $33.5B reported versus about $345B represented (two different measures)', url: 'https://cryptorank.io/news/feed/d6bff-rwa-tokenization-news-today' },
  { id: 'beincrypto-transfer-activity', label: 'BeInCrypto (2026-07-02) - 910 of 1,289 assets above $100,000 with zero weekly transfers (70.60% by count, 56% by value, different denominators)', url: 'https://beincrypto.com/reality-of-rwa-tokenization-2026/' },
  { id: 'beincrypto-report-landing', label: 'BeInCrypto report landing page - data dated 2026-05-31, $60B market base (a different denominator again)', url: 'https://research.beincrypto.com/tokenization-2026-report-first-edition' },
  { id: 'spark-buidl', label: 'Spark Money (May 2026) - BUIDL about $2.4B across eight named chains (secondary, not an issuer AUM disclosure)', url: 'https://www.spark.money/research/rwa-tokenization-bitcoin-blockchain' },
  { id: 'securitize-q2-2026', label: 'Securitize - Q2 2026 results (2026-08-12): $4.3B platform tokenized AUM as of 2026-06-30, not BUIDL fund AUM', url: 'https://investors.securitize.io/news/news-details/2026/Securitize-Reports-Second-Quarter-2026-Results/default.aspx' },
  { id: 'report-full-2026-10-02', label: 'StableSense Research - State of Stablecoins, full dated report (2026-10-02)', url: './state-of-stablecoins-2026-10-02.md' },
];

// --- latest-research edition (2026-10-02 reconciliation) -------------------
// The corrections below are changes made to this page's own text when the
// stored primary sources were re-read on the review date. They are listed so a
// reader who saw an earlier version can see what moved and why, not appended
// quietly under the superseded claim. Each entry names the corrected state and
// what the earlier text asserted, so neither is left standing alone.
export const latestResearchCorrections = [
  {
    title: 'Open USD is live, not announced-only',
    body: 'Earlier text said OUSD had no circulating supply and was "still later this year". It was issued by Bridge Building Inc., a Stripe company, and went live on Base, Ethereum, Solana and Tempo on 2026-09-30. The issuer\'s own reserve page reported $468,445,399 supply at 11:30 UTC on 2026-10-01, split $257,214,691 cash (54.91%) and $211,230,708 Treasuries (45.09%), summing exactly to total supply. One dated self-report is not an adoption series. Reserve earnings accrue to partners, not token holders. An unsourced single-day price-move attribution for another issuer was removed.',
    asOf: 'launch 2026-09-30; reserve snapshot 2026-10-01 11:30 UTC',
  },
  {
    title: 'GENIUS reserves are a list, not Treasury bills',
    body: 'Earlier text implied reserves are bound to Treasury bills. Section 4(a)(1)(A) requires at least 1:1 reserves drawn from eight eligible classes, of which 93-day Treasuries are one. The full list is now on the page.',
    asOf: 'statute as enacted 2025-07-18',
  },
  {
    title: 'GENIUS commencement is unresolved, not locked',
    body: 'Earlier text called the 18-month fallback a locked date. Section 20 sets general commencement at the earlier of 18 months after enactment or 120 days after the primary federal regulators issue any final implementing regulations. 2027-01-18 is an outer limit. No final rule is verified, so the current trigger is UNRESOLVED and no GENIUS duty is described on this page as currently operative.',
    asOf: 'Historical Sep 2026 tracker counts; final-rule issuance UNKNOWN',
  },
  {
    title: 'Gross Treasury holdings are not net demand',
    body: 'The Kansas City Fed Bulletin states a $0.30 net effect whose own stated components give $0.42, a $0.12 gap it does not reconcile, and its HTML and PDF versions disagree on the inputs (8 percent bank Treasury share and $0.08 versus 20 percent and $0.20). The intended coefficient is UNRESOLVED and no corrected coefficient is published here. The source\'s own hedge, that the effect can be zero or negative depending on where the money came from, is the part that survives.',
    asOf: 'Bulletin 2025-08-08, publisher-corrected HTML 2026-09-22',
  },
  {
    title: 'Paying distributors is not a new practice',
    body: 'Earlier framing treated partner-oriented reserve economics as a departure. Circle\'s Q2 2026 Form 10-Q states distribution costs payable to key distributors such as Coinbase and Binance are directly impacted by the amount of USDC held on their platforms, and discloses named Coinbase terms ($324.6M for the quarter, $655.3M for the half year, allocated after undisclosed issuer retention). Routing reserve earnings to partners is a redistribution of an existing practice, not its introduction. Whether Open Standard is more or less generous is UNRESOLVED.',
    asOf: 'Circle 10-Q, quarter ended 2026-06-30',
  },
  {
    title: 'The 95-to-99 percent non-payment claim is withdrawn',
    body: 'Earlier text claimed 95% to 99% of stablecoin volume was non-payment. No source contains that figure and it is removed. The verified framing is BCG and Allium Labs (2026-09-30): more than $62T annual transfers, of which real economic activity is $4.2T (about 7%), and separately roughly $350B to $550B of observable bilateral goods-and-services payments in 2025 (0.565% to 0.887% of the gross figure), which the authors call a directionally robust lower bound. The two definitions are not interchangeable.',
    asOf: '2025 payment data, published 2026-09-30',
  },
  {
    title: 'x402 headline figures now carry their scopes',
    body: 'An unsourced $996,474 floor across 18.1M transactions was withdrawn: it matches neither the volume nor the transaction count of the dashboard\'s own cumulative totals. Those totals (12,293,450 transactions, $974,215.14) are now quoted, with an unpublished window. The $317M figure is identified as a five-chain August 2026 residual after removing one bridging contract holding about 88% of the value, not an Arbitrum-only or commerce-only figure. The commerce-only share remains UNRESOLVED.',
    asOf: 'dashboard cumulative, fetched 2026-10-01; Bitquery August 2026',
  },
  {
    title: 'BUIDL has no verified current AUM',
    body: 'Earlier text presented a $2.70-3.52B "sources disagree" range. A range implies a currency and a single valuation basis that none of the three underlying reports has, so they are now listed separately with their dates and no current AUM is asserted. The one cited aggregator capture contained no $2.7B BUIDL figure at all: its only 2.7 is a $2.7 trillion 2030 DeFi-deployment projection. Securitize\'s $4.3B is platform-wide tokenized AUM as of 2026-06-30, not BUIDL fund AUM, and is not substituted for it.',
    asOf: 'reports dated May, early July and August 2026',
  },
  {
    title: 'RWA count and value shares are separated',
    body: '910 of 1,289 tested assets above $100,000 recorded zero weekly transfers, which is 70.60% by count. The publisher\'s 56% is a different statement about value against a value-measured base. Neither establishes economically idle capital: about $27B of the reported dormant value came from "represented" assets not necessarily designed for public secondary-market movement, and a ledger-style holding can still perform economic functions off-chain.',
    asOf: 'article 2026-07-02; publisher landing page data 2026-05-31',
  },
  {
    title: 'No fabricated fallback on the headline counter',
    body: 'When the live fetch fails, the counter now shows a hyphen. It previously displayed a research range midpoint as global stablecoin market cap: a different measure from the five coins the counter actually tracks, and a point estimate no source published. Missing observations must not be presented as measured values.',
    asOf: 'static fallback removed',
  },
  {
    title: 'No single dataset-wide as-of date',
    body: 'The footer badge distinguishes the review date from measurement dates. Sources have different observation dates, stated with the reconciled findings. Older historical observations retain their original dates and are not newly verified just because this edition was published.',
    asOf: 'review date 2026-10-02',
  },
];

export const latestResearchOpen = [
  { label: 'Net Treasury demand', need: 'Holder origin assets, issuance flows, reserve allocations and displaced assets under a stated counterfactual. Gross issuer holdings do not supply it.' },
  { label: 'The Kansas City Fed coefficient', need: 'A publisher reconciliation of the stated $0.30 against its own $0.42 components and its two disagreeing versions.' },
  { label: 'GENIUS commencement trigger', need: 'An authoritative final implementing rule and its issuance date.' },
  { label: 'Current trust-bank authorizations', need: 'The primary final OCC orders for Circle and Bridge, plus reconciliation of the differing entity names in circulation.' },
  { label: 'Comparable distribution terms', need: 'Like-for-like net-of-fee contracts and realized payouts on both sides.' },
  { label: 'Commerce-only x402 volume', need: 'Merchant or service attribution with bridge, bot, test and self-payment exclusions on one consistent basis.' },
  { label: 'BUIDL AUM', need: 'A dated fund-specific issuer or administrator disclosure with chain aggregation and a stated valuation basis.' },
  { label: 'Open USD adoption', need: 'A partner-level series of balances and qualifying payment volume, not a supply snapshot or an integration count.' },
  { label: 'A second market-cap measurement', need: 'An independent same-date, same-universe figure. Forming a range from different dates or different stablecoin definitions would not be a range.' },
];