/**
 * Foundations module. Nine short lessons that give a reader the concepts behind
 * the dashboard before the advanced modules. Each lesson has one core idea, one
 * dated example, a limit, and a self-check.
 */
const FOUNDATIONS = {
  id: 'foundations',
  title: 'Foundations',
  summary: 'The promise, the peg, the backing, the break and the numbers on this dashboard.',
  level: 'Start here',
  lessons: [
    {
      id: 'what-is',
      title: 'A stablecoin is a token with a target',
      core: 'A stablecoin is a token designed to hold a steady value against a reference asset, usually the US dollar. The token is a claim on an issuer or a collateral system, and its market price can differ from the target.',
      body: 'The reference is the thing the token is measured against. For the five coins on this dashboard, that reference is $1.00. The peg is the promise to stay near it. The price is what the market pays right now. Those are three different things, and a chart only shows the third.',
      example: 'On 11 March 2023, USDC traded as low as $0.8789 while the target stayed $1.00. The peg was under stress; the reference had not moved. The price recovered after the US bank backstop. Source: CoinGecko Research, dated 2023-03-11.',
      caveat: 'A $1 target says nothing about the quality of the backing or the speed of redemption. A token can have a perfect target and a weak claim.',
      check: {
        q: 'What is the difference between the peg and the market price?',
        a: 'The peg is the target; the market price is what buyers and sellers agree to now. A depeg is the market price moving away from the target.',
      },
      sources: [
        {
          label: 'CoinGecko Research, stablecoin supply and SVB (as of 2023-03-11)',
          href: 'https://www.coingecko.com/research/publications/stablecoins-supply-svb-impact',
        },
      ],
    },
    {
      id: 'peg-mechanics',
      title: 'The peg is a target, not a law',
      core: 'The peg holds when redemption is credible and arbitrage is open. A trader can buy below $1 and redeem at $1, or mint at $1 and sell above it. The gap closes because the claim is enforceable, not because the number is written down.',
      body: 'For an issuer-backed coin, the redemption window does most of the work. For a crypto-backed coin, liquidations and collateral rules do it. For a synthetic coin, hedges and funding do it. In every model, the peg depends on a mechanism that someone can actually use.',
      example: 'If a coin trades at $0.9990, the gap is 10 bps, or 0.10%. A buyer who can redeem at $1.00 earns the gap, minus fees and time. If redemption is closed, the same gap can persist or widen.',
      caveat: 'Arbitrage cannot repair a solvency doubt. When holders question the backing, the price can stay below the peg even if the redemption right exists on paper.',
      check: {
        q: 'Why does a 10 bps gap usually close?',
        a: 'Because a buyer can buy the token below $1 and redeem it at $1, capturing the difference if redemption is open and the backing is credible.',
      },
      sources: [
        {
          label: 'BIS Papers 141, Will the real stablecoin please stand up? (2023)',
          href: 'https://www.bis.org/publ/bppdf/bispap141.pdf',
        },
      ],
    },
    {
      id: 'bps',
      title: 'Basis points are the unit of peg drift',
      core: 'One basis point is 0.01%. Ten bps is 0.10%. Fifty bps is 0.50%. The dashboard uses bps because stablecoin moves are small and percentages hide the difference between 2 bps and 20 bps.',
      body: 'A 10 bps move on a $1 token is one tenth of a cent. That sounds tiny, but it can be the difference between a normal market and a stressed one when the move is fast or the coin is large. Read the bps together with the cause, the volume and the time.',
      example: 'USDC at $0.9990 is 10 bps below $1.00. At $0.9950 it is 50 bps below. The first is a narrow gap; the second is a visible depeg.',
      caveat: 'A small bps move is not automatically safe, and a large one is not automatically fatal. The direction, speed and redemption status matter.',
      check: {
        q: 'How much is 50 bps in percent?',
        a: '0.50%.',
      },
    },
    {
      id: 'collateral-types',
      title: 'What is behind the token',
      core: 'The backing model decides where the risk sits. Fiat-backed coins hold cash, bank deposits, T-bills or repo. Crypto-backed coins hold over-collateralized vaults. Synthetic coins hold a hedged position. Algorithmic coins hold an incentive, not a reserve.',
      body: 'The label on the coin is less useful than the balance sheet behind it. Ask what the assets are, who custodies them, how quickly they can be sold, and who can redeem. A Treasury bill is high quality but may take a day to settle. A bank deposit is liquid until the bank is not.',
      example: 'USDT, USDC and PYUSD are fiat-backed. DAI is crypto-collateralized through Sky vaults. USDe is synthetic: spot staked ETH plus a short futures position. UST was algorithmic and failed in May 2022.',
      caveat: 'An attestation is a snapshot, not a full audit of every custodian and claim. A reserve can be real and still be illiquid at par during a run.',
      check: {
        q: 'Which risk is specific to a synthetic dollar?',
        a: 'The hedge and the funding rate. If the basis or funding flips, the yield can turn into a cost and the position can be unwound under stress.',
      },
      sources: [
        {
          label: 'Circle transparency, USDC reserves',
          href: 'https://www.circle.com/transparency',
        },
        {
          label: 'Tether transparency, USDT reserves',
          href: 'https://tether.io/transparency/',
        },
        {
          label: 'MakerDAO documentation, DAI vaults',
          href: 'https://docs.makerdao.com/',
        },
        {
          label: 'Ethena documentation, USDe design',
          href: 'https://docs.ethena.fi/',
        },
      ],
    },
    {
      id: 'redemption',
      title: 'Redemption is the pressure valve',
      core: 'The peg is only as strong as the redemption path. Who can redeem, at what minimum, with what fee, and under what gate? A retail holder may only be able to sell in the market; an authorized participant can go directly to the issuer.',
      body: 'When redemptions are open, a below-par price creates a trade. When they are closed or slow, the market price carries the full doubt. Read the issuer terms before you read the chart: the legal claim and the operational path are part of the peg.',
      example: 'A stablecoin can trade at $0.99 while the issuer still promises $1.00, because the holder cannot access the promise at that size or on that day. The gap is a liquidity and access problem, not only a backing problem.',
      caveat: 'A redemption right is only as good as the issuer ability to pay. A legal claim does not create cash in a run.',
      check: {
        q: 'Why can a coin trade below $1 even when the issuer says it is fully backed?',
        a: 'Because the holder may not have direct redemption access, or the backing may not be liquid at par on the day. The market price reflects access and confidence, not only the balance sheet.',
      },
    },
    {
      id: 'supply-market-cap',
      title: 'Supply, market cap and volume are different questions',
      core: 'Supply is the number of tokens outstanding. Market cap is supply times price, or the issuer-reported circulating value at $1. Volume is the value traded or transferred, which is mostly exchange and protocol activity.',
      body: 'This dashboard tracks five coins. Its market cap is the combined circulating value of those five, not the whole stablecoin market. The 24h number is a flow, not a payment total. A large market cap does not tell you whether the reserves are liquid; a large volume does not tell you whether people use the coin to buy goods.',
      example: 'A $10B coin can trade $30B in a day because the same dollars move through many trades. That is volume. It is not $30B of new payments.',
      caveat: 'Do not compare a tracked market cap with a global market cap and call the difference a flow. They are different scopes.',
      check: {
        q: 'What does the tracked market cap on Home measure?',
        a: 'The combined circulating value of the five coins tracked on the dashboard. It is not the global stablecoin market.',
      },
    },
    {
      id: 'chain-flow',
      title: 'A chain flow is a location change',
      core: 'Supply on a chain can rise because of a mint, a bridge, an exchange transfer or a migration. It can fall because of a burn or a bridge out. The chain total is a location, not a payment to an end user.',
      body: 'A bridge move can look like a payment and be an internal treasury move. The app pairs the largest outflow and inflow as a migration hint, not a directed path. Open the chain view before treating a flow as a customer transfer.',
      example: 'USDT supply on Tron can fall while USDT on Ethereum rises in the same day; that is a location shift, not necessarily a redemption. The coin total supply may be unchanged.',
      caveat: 'Chain flow does not prove end-user payment volume, and a migration pair is an approximation. It is a place to look, not a settled route.',
      check: {
        q: 'What is the difference between a burn and a bridge-out?',
        a: 'A burn reduces the coin total supply. A bridge-out moves supply from one chain to another; total supply can stay the same.',
      },
    },
    {
      id: 'depeg-causes',
      title: 'A depeg is a confidence event',
      core: 'A depeg is the market price moving away from the target. The cause decides whether it recovers: a bank-run scare, a reserve doubt, a collateral crash, a redemption gate, a code exploit, or a market panic.',
      body: 'The price is the symptom. The mechanism and the backing decide the path. A temporary custodian failure can recover when the assets are protected; a structural spiral can continue until the token is worthless.',
      example: 'USDC fell to $0.8789 in March 2023 when $3.3B of reserves were stranded at Silicon Valley Bank, then recovered after the depositor backstop. UST fell in May 2022 and did not recover; its algorithmic mechanism minted more LUNA into the sell pressure.',
      caveat: 'A stress score can observe the price aftermath; it does not prove the cause. A price chart alone cannot tell a custodian failure from an exploit or a solvency problem.',
      check: {
        q: 'Why did USDC recover while UST did not?',
        a: 'USDC had real assets behind it and the US backstopped the failed bank, so the claim was restored. UST had no reserve; its mechanism needed new buyers and collapsed under the sell pressure.',
      },
      sources: [
        {
          label: 'CoinGecko Research, USDC and SVB (as of 2023-03-11)',
          href: 'https://www.coingecko.com/research/publications/stablecoins-supply-svb-impact',
        },
        {
          label: 'Reuters, TerraUSD falls to 30 cents (2022-05-11)',
          href: 'https://www.reuters.com/technology/dollar-pegged-stablecoin-terrausd-falls-30-cents-2022-05-11/',
        },
      ],
    },
    {
      id: 'read-dashboard',
      title: 'Read the dashboard in this order',
      core: 'Start with the as-of date, then the peg, then the backing, then the flows, then the alerts. The order prevents a chart from becoming the whole story.',
      body: 'The header tells you whether the data is current. The peg band tells you the price pressure. The supply and chain views tell you where the tokens are. The alert feed is a prompt to investigate, not a verdict. The Learn and Research pages explain the definitions behind each number.',
      example: 'A 20 bps move with a current observation and no supply change is a price event. A 20 bps move with a $2B supply drop and a chain outflow is a different question. Read them together.',
      caveat: 'The stress index is an observation score built from peg drift, alerts and flow. It is not a probability of default, a credit rating or advice.',
      check: {
        q: 'What should you check before reading a chart?',
        a: 'The as-of date and freshness state. A stale chart can describe a market that no longer exists.',
      },
    },
  ],
};

export default FOUNDATIONS;
