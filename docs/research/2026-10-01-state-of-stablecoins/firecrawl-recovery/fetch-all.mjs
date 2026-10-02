import { nextKey } from '/mnt/ai-data/projects/omnisearch/dist/system/key-vault.js';
import { MemoryCache } from '/mnt/ai-data/projects/omnisearch/dist/router/cache.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT_DIR = '/mnt/ai-archive/other-tools/stablesense/docs/research/2026-10-01-state-of-stablecoins/firecrawl-recovery/captures';
mkdirSync(OUT_DIR, { recursive: true });

const URLS = [
  { key: 'reap-global-stablecoin-stats', url: 'https://reap.global/blog/stablecoin-statistics-2026' },
  { key: 'bloomberg-usdc-volume', url: 'https://www.bloomberg.com/news/articles/2026-01-08/stablecoin-transactions-rose-to-record-33-trillion-led-by-usdc' },
  { key: 'bcg-stablecoin-payments', url: 'https://www.bcg.com/assets/2026/white-paper-stablecoin-payments-truth-behind-numbers.pdf' },
  { key: 'congress-genius-act', url: 'https://www.congress.gov/bill/119th-congress/senate-bill/1582/text' },
  { key: 'occ-genius-act-nprm', url: 'https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-3.html' },
  { key: 'openstandard-company-structure', url: 'https://joinopenstandard.com/blog/company-structure-and-leadership' },
  { key: 'solanacompass-ousd-solana', url: 'https://solanacompass.com/news/open-standards-ousd-stablecoin-goes-live-on-solana-with-free-11-minting-for-businesses' },
  { key: 'spark-money-rwa-tokenization', url: 'https://www.spark.money/research/rwa-tokenization-bitcoin-blockchain' },
  { key: 'cryptorank-rwa-tokenization', url: 'https://cryptorank.io/news/feed/d6bff-rwa-tokenization-news-today' },
  { key: 'tether-q1-2026-attestation', url: 'https://tether.io/news/tether-posts-1-04b-q1-2026-profit-despite-highly-volatile-global-markets-reaches-all-time-highs-8-23b-reserve-buffer-and-maintains-u-s-treasury-heavy-backing/' },
  { key: 'spark-money-stablecoin-treasury', url: 'https://www.spark.money/research/stablecoin-treasury-yield-impact' },
  { key: 'kansascityfed-stablecoin-treasury', url: 'https://www.kansascityfed.org/research/economic-bulletin/stablecoins-could-increase-treasury-demand-but-only-by-reducing-demand-for-other-assets/' },
  { key: 'imf-stablecoin-shocks-wp2644', url: 'https://www.imf.org/-/media/files/publications/wp/2026/english/wpiea2026044-source-pdf.pdf' },
  { key: 'nodit-x402-protocol', url: 'https://blog.nodit.io/ai-agents-that-pay-for-themselves-how-the-x402-protocol-works/' },
  { key: 'metamask-what-is-x402', url: 'https://metamask.io/news/what-is-x402' },
  { key: 'bitcoinmagazine-ousd-launch', url: 'https://bitcoinmagazine.com/news/visa-mastercard-and-over-140-open-usd' },
  { key: 'openstandard-partners', url: 'https://joinopenstandard.com/partners/' },
  { key: 'mordor-stablecoin-market', url: 'https://www.mordorintelligence.com/industry-reports/stablecoin-market' },
  { key: 'forbes-stablecoins-ach', url: 'https://www.forbes.com/sites/digital-assets/2026/04/20/rails-have-shifted-stablecoins-topped-ach-at-75-trillion-a-month/' },
  { key: 'paulhastings-genius-act-guide', url: 'https://www.paulhastings.com/insights/crypto-policy-tracker/the-genius-act-a-comprehensive-guide-to-us-stablecoin-regulation' },
  { key: 'cnbc-circle-occ-charter', url: 'https://www.cnbc.com/2026/07/10/circle-gets-an-occ-bank-charter-as-stablecoin-competition-heats-up-shares-surge-14percent.html' },
  { key: 'imf-stablecoins-payments-2026', url: 'https://www.imf.org/en/publications/wp/issues/2026/03/20/stablecoins-and-the-future-of-payments-evidence-from-financial-markets-574831' },
];

async function getCreditUsage(key) {
  const resp = await fetch('https://api.firecrawl.dev/v2/team/credit-usage', {
    headers: { 'Authorization': 'Bearer ' + key }
  });
  const data = await resp.json();
  return data.data?.remainingCredits ?? 'unknown';
}

async function scrapeUrl(key, url) {
  const resp = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: url,
      formats: ['markdown', 'html']
    })
  });
  const data = await resp.json();
  return data;
}

async function main() {
  const cache = new MemoryCache();
  const keyObj = await nextKey('firecrawl', cache);
  const key = keyObj.key;

  const creditsBefore = await getCreditUsage(key);
  console.log('Credits before:', creditsBefore);

  const results = [];
  const errors = [];

  // Fetch in batches of 5 to avoid overwhelming
  const BATCH_SIZE = 5;
  for (let i = 0; i < URLS.length; i += BATCH_SIZE) {
    const batch = URLS.slice(i, i + BATCH_SIZE);
    console.log(`\nFetching batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(URLS.length / BATCH_SIZE)}...`);
    
    const promises = batch.map(async (item) => {
      try {
        const data = await scrapeUrl(key, item.url);
        const result = {
          key: item.key,
          url: item.url,
          success: data.success,
          statusCode: data.data?.metadata?.statusCode,
          contentType: data.data?.metadata?.contentType,
          markdownLength: data.data?.markdown?.length ?? 0,
          htmlLength: data.data?.html?.length ?? 0,
          markdown: data.data?.markdown ?? null,
          html: data.data?.html ?? null,
          metadata: data.data?.metadata ?? null,
          error: data.error ?? null,
          capturedAt: new Date().toISOString()
        };
        
        // Save individual file
        const filePath = join(OUT_DIR, item.key + '.json');
        writeFileSync(filePath, JSON.stringify(result, null, 2));
        
        console.log(`  ${item.key}: success=${data.success}, status=${result.statusCode}, md=${result.markdownLength} chars`);
        return result;
      } catch (e) {
        console.error(`  ${item.key}: ERROR - ${e.message}`);
        errors.push({ key: item.key, url: item.url, error: e.message });
        return null;
      }
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults.filter(r => r !== null));
  }

  const creditsAfter = await getCreditUsage(key);
  console.log('\nCredits after:', creditsAfter);
  console.log('Credits used:', creditsBefore - creditsAfter);

  // Save summary
  const summary = {
    fetchedAt: new Date().toISOString(),
    totalUrls: URLS.length,
    successful: results.filter(r => r.success).length,
    failed: errors.length,
    creditsBefore,
    creditsAfter,
    creditsUsed: creditsBefore - creditsAfter,
    results: results.map(r => ({
      key: r.key,
      url: r.url,
      success: r.success,
      statusCode: r.statusCode,
      markdownLength: r.markdownLength,
      htmlLength: r.htmlLength,
      capturedAt: r.capturedAt
    })),
    errors
  };

  writeFileSync(join(OUT_DIR, 'fetch-summary.json'), JSON.stringify(summary, null, 2));
  console.log('\nSummary saved to fetch-summary.json');
  console.log(`Total: ${summary.successful} successful, ${summary.failed} failed`);
}

main().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
