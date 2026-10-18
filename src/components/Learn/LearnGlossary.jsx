const GROUPS = [
  {
    title: 'The basics',
    terms: [
      { term: 'Peg', def: 'The target value a stablecoin tries to hold, usually $1.00. The peg is a promise, not a market price.' },
      { term: 'Depeg', def: 'The market price moving away from the target. It is measured in basis points; 50 bps is 0.50%.' },
      { term: 'Basis point (bps)', def: 'One hundredth of a percentage point. 100 bps = 1%. Peg drift is quoted in bps because the moves are small.' },
      { term: 'Reference asset', def: 'The value the token is measured against. Usually the US dollar, but it can be gold, another currency, a basket or a fund.' },
      { term: 'Redemption', def: 'Exchanging a stablecoin for its backing at face value. The path that makes the peg enforceable, if it is open.' },
      { term: 'Collateral', def: 'The assets backing the token or the vault. Quality, custody, maturity and liquidity all matter.' },
      { term: 'Over-collateralization', def: 'Backing each token with more than $1 of assets so the peg survives a collateral drawdown.' },
      { term: 'Reserve attestation', def: 'A third-party check on the issuer assets, usually a snapshot rather than a full audit of every custodian and claim.' },
      { term: 'Arbitrage', def: 'Buying below $1 and redeeming at face value, or minting at $1 and selling above it. The force that pulls a price back when redemption is open.' },
    ],
  },
  {
    title: 'Market structure',
    terms: [
      { term: 'Mint', def: 'New tokens created, adding supply.' },
      { term: 'Burn', def: 'Tokens destroyed, removing supply.' },
      { term: 'Cross-chain flow', def: 'Supply moving between blockchains for liquidity, yield, exchange settlement or a migration. A location change, not a payment to an end user.' },
      { term: 'Bridge', def: 'A mechanism that moves tokens between chains. It can look like a payment while remaining an internal treasury move.' },
      { term: 'Dominance', def: 'A coin share of tracked stablecoin supply. A shift is a change in mix, not automatically a flow.' },
      { term: 'TVL', def: 'Total value locked: assets deposited in DeFi protocols, often denominated in stablecoins.' },
      { term: 'Funding rate', def: 'The periodic fee longs pay shorts, or vice versa, in perpetual futures. Ethena USDe earns yield from this.' },
      { term: 'Delta-neutral', def: 'A position whose price moves cancel out, used by synthetic issuers to hold a dollar value without a bank deposit.' },
      { term: 'Authorized participant', def: 'A party with direct mint or redemption access to an issuer. Retail holders may only be able to trade in the market.' },
      { term: 'Liquidity', def: 'How quickly an asset can be sold near its stated value. A high-quality asset can still be illiquid at par on the day of a run.' },
    ],
  },
  {
    title: 'Risk and rules',
    terms: [
      { term: 'Stress index', def: 'A 0-100 observation score combining peg drift, active alerts and flow pressure. It is not a probability of default.' },
      { term: 'Whale watch', def: 'Detection of unusual chain supply jumps against that chain own history, using z-scores.' },
      { term: 'Z-score', def: 'How many standard deviations a move sits from its recent baseline. A high value is a prompt to look, not a verdict.' },
      { term: 'Severity', def: 'Alert triage: WARNING, HIGH, CRITICAL. A higher level means more measured stress, not a prediction.' },
      { term: 'Algorithmic stablecoin', def: 'A model with no direct reserve that relies on incentives and a sister token. UST is the cautionary example.' },
      { term: 'Tokenized fund', def: 'A regulated security holding assets such as Treasuries on-chain. It can pay yield but is not a payment stablecoin.' },
      { term: 'NAV', def: 'Net asset value: the per-share value of a fund assets minus liabilities. A tokenized fund price can differ from its NAV in the market.' },
      { term: 'Solvency', def: 'Whether assets exceed liabilities. A liquid market price can hide a solvency problem, and a solvent issuer can still face a liquidity run.' },
      { term: 'Market maker', def: 'A firm that quotes both buy and sell prices. Market makers provide the exit liquidity that a redemption window cannot supply every second.' },
    ],
  },
];

function termId(term) {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Glossary grouped by the question a reader is asking: basics, market structure,
 * risk and rules. Every term has a stable anchor for the lesson links.
 */
export default function LearnGlossary() {
  return (
    <section class="card learn-glossary" id="learn-glossary">
      <div class="card-header">
        <div>
          <div class="card-title">Glossary</div>
          <div class="card-sub">Plain definitions for the words on this page and the dashboard.</div>
        </div>
      </div>
      <div class="card-body">
        {GROUPS.map((group) => (
          <div class="learn-term-group" key={group.title}>
            <h3>{group.title}</h3>
            <div class="learn-term-grid">
              {group.terms.map((item) => (
                <div class="learn-term" id={`term-${termId(item.term)}`} key={item.term}>
                  <div class="learn-term-name">{item.term}</div>
                  <div class="text-muted small">{item.def}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
