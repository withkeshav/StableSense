const SOURCES = [
  {
    label: 'BIS, Stablecoins: framing the debate (2026-04-20)',
    href: 'https://www.bis.org/speeches/20260420-stablecoins-framing-debate',
    note: 'Definition: tokens that aim to maintain a stable value against a reference asset.',
  },
  {
    label: 'BIS Papers 141, Will the real stablecoin please stand up? (2023)',
    href: 'https://www.bis.org/publ/bppdf/bispap141.pdf',
    note: 'Peg design, reference assets and the limits of the label.',
  },
  {
    label: 'Circle transparency, USDC reserves',
    href: 'https://www.circle.com/transparency',
    note: 'Reserve reports and attestations. A snapshot, not a full audit.',
  },
  {
    label: 'Tether transparency, USDT reserves',
    href: 'https://tether.io/transparency/',
    note: 'Reserve attestations and issuer disclosures.',
  },
  {
    label: 'MakerDAO documentation, DAI vaults',
    href: 'https://docs.makerdao.com/',
    note: 'Over-collateralized vaults, liquidation and stable fees.',
  },
  {
    label: 'Ethena documentation, USDe',
    href: 'https://docs.ethena.fi/',
    note: 'The spot-plus-short design, funding yield and custody.',
  },
  {
    label: 'GENIUS Act, enrolled text (2025-07-18)',
    href: 'https://www.congress.gov/bill/119th-congress/senate-bill/1582/text',
    note: 'US reserve, disclosure and commencement terms. Commencement remains unresolved.',
  },
  {
    label: 'ESMA, MiCA Article 49 (applies 2024-06-30)',
    href: 'https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-49-issuance-and-redeemability-e',
    note: 'EU e-money token issuance and redeemability.',
  },
  {
    label: 'CoinGecko Research, stablecoins and SVB (2023-03-11)',
    href: 'https://www.coingecko.com/research/publications/stablecoins-supply-svb-impact',
    note: 'USDC low of $0.8789 and the reserve-custodian failure.',
  },
  {
    label: 'Reuters, TerraUSD falls to 30 cents (2022-05-11)',
    href: 'https://www.reuters.com/technology/dollar-pegged-stablecoin-terrausd-falls-30-cents-2022-05-11/',
    note: 'A dated record of the UST collapse.',
  },
  {
    label: 'World Bank, Remittance Prices Worldwide',
    href: 'https://remittanceprices.worldbank.org/',
    note: 'Corridor costs for remittances, not stablecoin-only.',
  },
];

export default function LearnSources() {
  return (
    <section class="card learn-sources" id="learn-sources">
      <div class="card-header">
        <div>
          <div class="card-title">Sources and dates</div>
          <div class="card-sub">The concepts are evergreen. Every example and number keeps its own date.</div>
        </div>
      </div>
      <div class="card-body">
        <p class="learn-sources-intro">
          These links are the starting points for the basic concepts. The research hub carries the
          full claim ledger, including the cases where sources disagree or the evidence is missing.
        </p>
        <ul class="learn-source-list">
          {SOURCES.map((source) => (
            <li key={source.href}>
              <a href={source.href} target="_blank" rel="noopener noreferrer">{source.label}</a>
              <span>{source.note}</span>
            </li>
          ))}
        </ul>
        <p class="mb-0">
          <a class="learn-link-btn" href="/research/#sources" target="_blank" rel="noopener noreferrer">
            Full source ledger in the research hub &rsaquo;
          </a>
        </p>
      </div>
    </section>
  );
}
