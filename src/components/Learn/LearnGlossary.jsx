const GLOSSARY = [
  { term: 'Peg', def: 'The target price a stablecoin tries to hold, almost always $1.00.' },
  { term: 'Depeg', def: 'A move away from the peg, usually measured in basis points (bps). 50 bps is half a percent.' },
  { term: 'Collateral', def: 'The assets backing the stablecoin so each token stays redeemable at $1.' },
  { term: 'Mint', def: 'New stablecoin tokens created, adding supply.' },
  { term: 'Burn', def: 'Stablecoin tokens destroyed, removing supply.' },
  { term: 'Cross-chain flow', def: 'Supply moving between blockchains, often for yield or liquidity reasons.' },
  { term: 'Stress index', def: 'A 0-100 score combining peg drift, active alerts, and flow pressure.' },
  { term: 'Whale watch', def: 'Detection of unusual supply jumps on a chain using z-scores.' },
  { term: 'Basis point (bps)', def: 'One hundredth of a percentage point. 100 bps = 1%.' },
  { term: 'Redemption', def: 'Exchanging a stablecoin for its backing at face value. The mechanism that keeps the peg honest.' },
  { term: 'Reserve attestation', def: 'A third-party check on an issuer\'s backing assets, usually a snapshot rather than a full audit.' },
  { term: 'Over-collateralization', def: 'Backing each token with more than $1 of assets so the peg survives market drawdowns.' },
  { term: 'Delta-neutral', def: 'A position that cancels out price moves, used by synthetic issuers to hold value without cash reserves.' },
  { term: 'Bridge', def: 'A mechanism that moves tokens between blockchains, a common vector for liquidity migration.' },
  { term: 'TVL', def: 'Total value locked: assets deposited in DeFi protocols, often denominated in stablecoins.' },
  { term: 'Dominance', def: 'A coin\'s share of tracked stablecoin supply. Shifts in it trigger DOM_SHIFT alerts.' },
  { term: 'Z-score', def: 'How many standard deviations a supply move sits from its recent baseline. High z-scores drive whale-watch flags.' },
  { term: 'Severity', def: 'The alert triage: WARNING, HIGH, CRITICAL. Higher levels signal more real stress.' },
  { term: 'Algorithmic stablecoin', def: 'A model with no direct backing that relies on market incentives. Historically the highest depeg risk.' },
  { term: 'Arbitrage', def: 'Buying a coin below $1 and redeeming at face value (or minting and selling above $1). The force that pulls prices back to the peg.' },
  { term: 'Reference asset', def: 'The real-world value a stablecoin is designed to track. Usually the US dollar, but can be gold, another fiat currency, or a basket.' },
  { term: 'Tokenized fund', def: 'A regulated security that holds traditional assets like Treasuries on-chain. Unlike a payment stablecoin, it pays yield but requires KYC and restricts transfers.' },
  { term: 'Funding rate', def: 'The periodic fee longs pay shorts (or vice versa) in perpetual futures. Ethena\'s USDe earns its yield from this.' },
];

/**
 * Glossary of terms used across the dashboard and the lessons.
 */
export default function LearnGlossary() {
  return (
    <section class="card">
      <div class="card-header">
        <div class="card-title">Glossary</div>
      </div>
      <div class="card-body p0">
        <div class="coverage-list p-3">
          {GLOSSARY.map((item) => (
            <div class="learn-term" key={item.term}>
              <div class="learn-term-name">{item.term}</div>
              <div class="text-muted small">{item.def}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
