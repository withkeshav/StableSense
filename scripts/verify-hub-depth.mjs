// Verify the two new hub sections render real content from data.js.
// Runs the same mapping the browser renderers use, on the built data,
// so a data/model mismatch fails here rather than silently in the page.
import * as data from '../research/data.js';
import { readFileSync } from 'node:fs';

let fail = 0;
let checkCount = 0;
const check = (label, cond, detail = '') => {
  checkCount++;
  if (!cond) fail++;
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${label}${detail ? ' :: ' + detail : ''}`);
};

// --- section 9: float economics ---
check('floatEconomics has 6 rows', data.floatEconomics.length === 6, `got ${data.floatEconomics.length}`);
for (const r of data.floatEconomics) {
  check(`float row "${r.issuer} / ${r.measure}" complete`, !!(r.issuer && r.measure && r.value && r.asOf && r.note));
}
const tether = data.floatEconomics.filter((r) => r.issuer === 'Tether');
const circle = data.floatEconomics.filter((r) => r.issuer === 'Circle');
check('Tether rows present', tether.length === 3, `got ${tether.length}`);
check('Circle rows present', circle.length === 3, `got ${circle.length}`);
check('Tether negative-equity row is signed as negative', tether.some((r) => r.value.includes('-')), tether.map((r) => r.value).join(' | '));

// --- section 9: yield ban ---
const y = data.yieldBan;
check('yieldBan quote cites 12 USC 5903', y.citation.includes('5903'));
check('yieldBan quote contains the statutory phrase "solely in connection"', y.quote.includes('solely in connection'));
check('yieldBan marks rewards as UNKNOWN', y.silence.includes('UNKNOWN'));

// --- section 10: rails ---
check('agenticRails has 7 rows', data.agenticRails.length === 7, `got ${data.agenticRails.length}`);
for (const r of data.agenticRails) {
  check(`rail "${r.name}" complete`, !!(r.name && r.operator && r.layer && r.status && r.detail));
}
const erc = data.agenticRails.find((r) => r.name === 'ERC-8004');
check('ERC-8004 marked DRAFT', erc && /DRAFT/.test(erc.status), erc && erc.status);
check('ERC-8004 marked as not a payment layer', erc && /NONE/.test(erc.asset));

// --- section 10: volume ---
// Eight rows, not seven: the five-chain residual was split out so the
// $317M figure could not be read as an Arbitrum-only or commerce-only number.
check('agenticVolume has 8 rows', data.agenticVolume.length === 8, `got ${data.agenticVolume.length}`);
for (const r of data.agenticVolume) {
  check(`volume row "${r.publisher}" labelled`, !!(r.figure && r.window && r.publisher && r.label));
}
check('every volume row names its publisher', data.agenticVolume.every((r) => !!r.publisher));
check('volume table shows more than one publisher', new Set(data.agenticVolume.map((r) => r.publisher)).size > 3, `${data.agenticVolume.length} rows, ${new Set(data.agenticVolume.map((r) => r.publisher)).size} publishers`);

// --- section 10: ticket size ---
check('agenticTicketSize has 5 rows', data.agenticTicketSize.length === 5, `got ${data.agenticTicketSize.length}`);
check('ticket size includes the one-cent median finding',
  data.agenticTicketSize.some((t) => t.value.includes('$0.006') || t.value.includes('$0.001')),
  data.agenticTicketSize.map((t) => t.value).join(' | '));

// --- no em/en dashes anywhere in the new content ---
const blob = JSON.stringify({ f: data.floatEconomics, y: data.yieldBan, a: data.agenticRails, v: data.agenticVolume, t: data.agenticTicketSize });
const dashes = (blob.match(/[\u2013\u2014]/g) || []).length;
check('no em/en dashes in new content', dashes === 0, `${dashes} found`);

// --- HUB_BUILD derive: with the define injected it must be v-prefixed ---
check('HUB_BUILD falls back to dev only when define absent', data.HUB_BUILD === 'dev', `got ${data.HUB_BUILD}`);

// --- section 12: big players + honest growth ---
// These checks were written against an earlier version of the data in which
// Open USD was announced-only and BUIDL carried a "sources disagree" range.
// Both assumptions were falsified by the 2026-10-02 reconciliation, so the
// checks now enforce the corrected scopes and the explicit unknowns. A
// regression back to the announced-only or merged-range state must fail here.
check('arcStatus is mainnet live', data.arcStatus.status.startsWith('MAINNET'), data.arcStatus.status);
check('arcStatus carries both chain IDs', /0x13b2/.test(data.arcStatus.chainId) && /0x4cef52/.test(data.arcStatus.testnetChainId),
  `${data.arcStatus.chainId} / ${data.arcStatus.testnetChainId}`);

const ousd = data.openUsdStatus;
check('openUsdStatus is issuer-reported live, not announced-only',
  /LIVE/.test(ousd.status) && !/ANNOUNCED ONLY/.test(ousd.status), ousd.status);
check('openUsdStatus names Bridge as issuer', /Bridge Building Inc/.test(ousd.issuer), ousd.issuer.slice(0, 60));
check('openUsdStatus states the Stripe relationship', /Stripe company/.test(ousd.issuer));
check('openUsdStatus names the launch date', /2026-09-30/.test(ousd.status), ousd.status);
check('openUsdStatus carries a dated supply snapshot', /468,445,399/.test(ousd.supplySnapshot) && /2026-10-01/.test(ousd.supplySnapshot));
check('openUsdStatus states the cash/Treasury composition', /257,214,691/.test(ousd.supplySnapshot) && /211,230,708/.test(ousd.supplySnapshot));
check('openUsdStatus says the snapshot is not adoption', /not adoption/.test(ousd.supplyScope), ousd.supplyScope.slice(0, 60));
check('openUsdStatus distinguishes partner economics from holder yield',
  /partner economics/.test(ousd.reserveEarnings) && /not token-holder yield/.test(ousd.reserveEarnings));
check('openUsdStatus flags the Origin Dollar ticker clash', /Origin Dollar/.test(ousd.supplyScope));
check('openUsdStatus marks the pre-guard title claim unsupported', /not supported/.test(ousd.preGuardClaim));
check('openUsdStatus leaves market reaction UNRESOLVED', /UNRESOLVED/.test(ousd.marketReaction), ousd.marketReaction.slice(0, 40));
check('openUsdStatus names the four launch chains', /Base/.test(ousd.chains) && /Ethereum/.test(ousd.chains) && /Solana/.test(ousd.chains) && /Tempo/.test(ousd.chains));
check('openUsdStatus keeps charter status UNRESOLVED', /UNRESOLVED/.test(ousd.charter), ousd.charter.slice(0, 40));

check('rwaFunds has 3 rows', data.rwaFunds.length === 3, `got ${data.rwaFunds.length}`);
for (const r of data.rwaFunds) {
  check(`fund "${r.product}" complete`, !!(r.product && r.issuer && r.size && r.asOf && r.backing && r.note));
}
// BUIDL current AUM is unresolved. A "disagreeing range" would re-assert the
// single currency and valuation basis the three reports do not share.
const buidlRow = data.rwaFunds.find((r) => /BUIDL/.test(r.product));
check('BUIDL asserts no current AUM and marks it UNRESOLVED',
  /UNRESOLVED/.test(buidlRow.size) && !/disagree/i.test(buidlRow.size), buidlRow.size);
check('BUIDL refuses to substitute Securitize platform-wide AUM',
  /not BUIDL AUM/.test(buidlRow.note), '');
check('BUIDL notes the primary figure is gross sales, not AUM',
  /Form D\/A/.test(buidlRow.note) && /not AUM/.test(buidlRow.note));
check('OUSG backing attribution corrected away from mostly-BUIDL',
  /SWEEP/.test(data.rwaFunds.find((r) => /OUSG/.test(r.product)).backing));

// BUIDL dated secondary reports are kept separate, never merged into a range.
check('buidlSecondaryReports has 3 dated reports', data.buidlSecondaryReports.reports.length === 3,
  `got ${data.buidlSecondaryReports.reports.length}`);
check('buidlSecondaryReports asserts no current AUM', /No current BUIDL AUM is asserted/.test(data.buidlSecondaryReports.status));
for (const r of data.buidlSecondaryReports.reports) {
  check(`buidl report "${r.figure.slice(0, 18)}..." dated and sourced`, !!(r.figure && r.asOf && r.source));
}
check('buidl report dates are distinct', new Set(data.buidlSecondaryReports.reports.map((r) => r.asOf)).size === 3);
check('buidl records the aggregator-capture misattribution',
  /contains no such figure/.test(data.buidlSecondaryReports.attributionCorrection));

// RWA count versus value shares must not be conflated.
const depth = data.rwaDepth;
check('rwaDepth gives the by-count share', /70\.60% by count/.test(depth.transferActivity));
check('rwaDepth states the value share separately', /56% of the value measured/.test(depth.transferActivity));
check('rwaDepth flags the two denominators as non-interchangeable', /must not be swapped/.test(depth.denominatorNote));
check('rwaDepth separates reported value from represented value', /\$345B/.test(depth.reportedValue) && /\$33\.5B/.test(depth.reportedValue));
check('rwaDepth refuses the idle-capital inference', /not economically idle capital/.test(depth.interpretation));
check('rwaDepth marks the transfer week UNRESOLVED', /UNRESOLVED/.test(depth.dataDate));

// Distribution economics: incumbent practice already exists, comparison unresolved.
const de = data.distributionEconomics;
check('distributionEconomics names Circle as the incumbent',
  /Circle/.test(de.incumbent) && /directly impacted by the amount of USDC held/.test(de.incumbent));
check('distributionEconomics carries the named Coinbase terms',
  /324\.6 million/.test(de.namedTerms) && /655\.3 million/.test(de.namedTerms));
check('distributionEconomics notes the issuer-retention amount is undisclosed',
  /issuer-retention amount is not disclosed/.test(de.namedTerms));
check('distributionEconomics refuses the distribution-only isolation',
  /cannot be isolated/.test(de.caveat));
check('distributionEconomics denies the novelty claim',
  /not its introduction/.test(de.conclusion) && /novelty claim is not established/.test(de.conclusion));
check('distributionEconomics leaves the generosity comparison UNRESOLVED',
  /UNRESOLVED/.test(de.conclusion) && /UNRESOLVED/.test(de.unresolved));

// GENIUS: reserves are a list, and commencement is not a locked date.
const gr = data.geniusReserves;
check('geniusReserves lists eight eligible reserve classes',
  (gr.classes || gr.eligible || []).length === 8 || /eight/.test(JSON.stringify(gr)),
  JSON.stringify(Object.keys(gr)));
const gsj = JSON.stringify(data.geniusStatus);
check('geniusStatus marks commencement UNRESOLVED',
  /UNRESOLVED/.test(data.geniusStatus.commencementStatus), data.geniusStatus.commencementStatus.slice(0, 40));
check('geniusStatus treats 2027-01-18 as an outer limit only',
  /outer limit/.test(gsj) && !/locks? it at/i.test(gsj));
check('geniusStatus leaves an unmeasured final-rule count unknown, not zero',
  data.geniusStatus.finalRules === null, `finalRules=${data.geniusStatus.finalRules}`);
check('geniusStatus keeps the rulemaking counts',
  data.geniusStatus.totalRulemakings === 26 && data.geniusStatus.agencies === 6 && data.geniusStatus.nprmsIssued === 10,
  `${data.geniusStatus.totalRulemakings}/${data.geniusStatus.agencies}/${data.geniusStatus.nprmsIssued}`);
check('geniusStatus does not claim any duty is currently in force',
  /does not describe any GENIUS duty as currently in force/.test(data.geniusStatus.note));
check('geniusReserves states reserves are not Treasury bills alone',
  /not Treasury bills alone/.test(data.geniusStatus.reserveClasses), data.geniusStatus.reserveClasses);

// Treasury demand: gross holdings, and an unreconciled source coefficient.
const td = data.treasuryDemandMechanism;
check('treasuryDemandMechanism marks the net coefficient UNRESOLVED', /UNRESOLVED/.test(td.status), td.status);
check('treasuryDemandMechanism publishes no corrected coefficient',
  !/corrected coefficient is 0\./.test(JSON.stringify(td)));
check('treasuryDemandMechanism exposes the 0.30 versus 0.42 gap',
  /\$0\.42/.test(JSON.stringify(td)) && /\$0\.30/.test(JSON.stringify(td)));

// Payments: the withdrawn 95-to-99 percent claim must not return as an
// assertion. The only place the numbers may appear is the note that withdraws
// them, so the check enforces the withdrawal rather than a bare absence.
const gh = JSON.stringify(data.growthHonest);
check('growthHonest explicitly withdraws the 95-to-99% non-payment claim',
  /claimed 95% to 99% was non-payment/.test(gh) && /is withdrawn/.test(gh));
check('growthHonest states the broad about-7% share', /7%/.test(gh));
check('growthHonest states the narrow under-1% share', /under 1%|0\.565%|0\.887%/.test(gh));
check('growthHonest does not assert the withdrawn share in any headline point',
  !data.growthHonest.points.some((p) => /95%|99%/.test(p.value)),
  data.growthHonest.points.map((p) => p.value).join(' | '));
check('growthHonest marks the commercial share UNRESOLVED', /UNRESOLVED/.test(gh));

check('growthHonest thesis present', !!data.growthHonest.thesis);
check('growthHonest has 3 points', data.growthHonest.points.length === 3, `got ${data.growthHonest.points.length}`);
check('growthHonest shows the 2026 stall', /\+1\.5% \(2026/.test(data.growthHonest.points[0].value), data.growthHonest.points[0].value);

// x402 scopes: the withdrawn $996,474 floor and the $317M residual framing.
const av = JSON.stringify(data.agenticVolume);
check('agenticVolume drops the withdrawn 996,474 figure', !/996,?474/.test(av), '');
check('agenticVolume quotes the dashboard cumulative total instead',
  /12,293,450/.test(av) && /974,215\.14/.test(av));
check('agenticVolume identifies the 317M as a five-chain residual',
  /\$317M/.test(av) && /five-chain|five chain/i.test(av));
check('agenticVolume marks the commerce-only share UNRESOLVED',
  /UNRESOLVED/.test(av) && /commerce/i.test(av));

// Market cap: one dated measurement, no manufactured range.
const mc = data.marketCapMeasure;
check('marketCapMeasure carries its own as-of date', !!mc.asOf && /2026-08-13/.test(mc.asOf), mc.asOf);
check('marketCapMeasure refuses to fabricate a second-source range',
  /no (verified )?second/i.test(JSON.stringify(mc)), '');

// Research page structure. There is ONE maintained research page. Revision
// history lives on the brief changelog subpage, so the hub must not present a
// separate "latest report" entry point, and every correction must still be
// reachable on the changelog page.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hubHtml = readFileSync(new URL('../research/index.html', import.meta.url), 'utf8');
const changelogHtml = readFileSync(new URL('../research/changelog/index.html', import.meta.url), 'utf8');

check('research page states last-updated above the fold',
  /class="hub-updated"/.test(hubHtml) && /Last updated/.test(hubHtml));
check('research page links the research changelog', /href="\.\/changelog\/"/.test(hubHtml));
check('research page carries no separate latest-report section', !/id="latest-research"/.test(hubHtml));
check('research page does not host the dated report as a page-level entry point',
  !/state-of-stablecoins-2026-10-02\.md/.test(hubHtml));
check('research page carries the open-questions section', /id="open-questions"/.test(hubHtml));

check('changelog page is titled and dated',
  /Research changelog/.test(changelogHtml) && /2026-10-02/.test(changelogHtml));
check('changelog page says current findings live on the research page',
  /research page/.test(changelogHtml) && /what changed/i.test(changelogHtml));

check('latestResearchCorrections present and non-trivial',
  (data.latestResearchCorrections || []).length >= 10, `got ${(data.latestResearchCorrections || []).length}`);
for (const c of data.latestResearchCorrections || []) {
  check(`correction "${c.title.slice(0, 34)}..." names what changed and its date`,
    !!(c.title && c.body && c.asOf));
  check(`correction "${c.title.slice(0, 34)}..." is published verbatim on the changelog page`,
    changelogHtml.includes(esc(c.title)) && changelogHtml.includes(esc(c.body)));
}
const lr = JSON.stringify(data.latestResearchCorrections);
check('corrections name the earlier text, not just the new state',
  /[Ee]arlier (text|version|version of this report|framing)/.test(lr));
check('latestResearchOpen lists the unresolved items',
  (data.latestResearchOpen || []).length >= 9, `got ${(data.latestResearchOpen || []).length}`);
for (const o of data.latestResearchOpen || []) {
  check(`open item "${o.label}" states what evidence would close it`, !!(o.label && o.need));
}
check('open questions are rendered on the research page, not only in data',
  /id="open-questions-list"/.test(hubHtml));
check('sources list includes the dated full report',
  data.sources.some((s) => /state-of-stablecoins-2026-10-02/.test(s.url)),
  data.sources.length + ' sources');

// Date discipline: the review date must never double as a dataset-wide
// measurement date, and historical datasets must stay event-dated.
check('historical-case and latest-research review dates stay distinct',
  data.AS_OF === '2026-09-26' && data.RESEARCH_REVIEWED === '2026-10-02');
check('MEASURE_AS_OF carries per-measure dates', Object.keys(data.MEASURE_AS_OF).length >= 10,
  `${Object.keys(data.MEASURE_AS_OF).length} measures`);
check('MEASURE_AS_OF does not blanket every measure with the review date',
  Object.values(data.MEASURE_AS_OF).filter((v) => v === '2026-10-02').length === 0,
  Object.values(data.MEASURE_AS_OF).filter((v) => v === '2026-10-02').join(' | '));
check('MEASURE_AS_OF dates the depeg-era and early-2026 measures separately',
  /2026-08-13/.test(data.MEASURE_AS_OF.totalMarketCap) && /2026-03-31/.test(data.MEASURE_AS_OF.tetherReserveExposure));
check('HISTORICAL_DATASETS keeps the depeg cases event-dated',
  /May 2022/.test(data.HISTORICAL_DATASETS.depegs) && /March 2023/.test(data.HISTORICAL_DATASETS.depegs));
check('HISTORICAL_DATASETS does not re-date the historical series',
  !/2026-10-02/.test(data.HISTORICAL_DATASETS.depegs));

const blob2 = JSON.stringify({ g: data.growthHonest, a: data.arcStatus, o: data.openUsdStatus, r: data.rwaFunds, b: data.buidlSecondaryReports, d: data.rwaDepth, e: data.distributionEconomics, c: data.latestResearchCorrections, p: data.latestResearchOpen, m: data.marketCapMeasure });
const dashes2 = (blob2.match(/[\u2013\u2014]/g) || []).length;
check('no em/en dashes in section 12-13 content', dashes2 === 0, `${dashes2} found`);

console.log(`\nAS_OF=${data.AS_OF} HUB_BUILD=${data.HUB_BUILD}`);
console.log(`checks run: ${checkCount}`);
console.log(fail === 0 ? '\nALL CHECKS PASSED' : `\n${fail} CHECK(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
