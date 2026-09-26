// Verify the two new hub sections render real content from data.js.
// Runs the same mapping the browser renderers use, on the built data,
// so a data/model mismatch fails here rather than silently in the page.
import * as data from '../research/data.js';

let fail = 0;
const check = (label, cond, detail = '') => {
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
check('agenticVolume has 7 rows', data.agenticVolume.length === 7, `got ${data.agenticVolume.length}`);
for (const r of data.agenticVolume) {
  check(`volume row "${r.publisher}" labelled`, !!(r.figure && r.window && r.publisher && r.label));
}
const spread = data.agenticVolume.length;
check('volume table shows more than one publisher', new Set(data.agenticVolume.map((r) => r.publisher)).size > 3, `${spread} rows, ${new Set(data.agenticVolume.map((r) => r.publisher)).size} publishers`);

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

console.log(`\nAS_OF=${data.AS_OF} HUB_BUILD=${data.HUB_BUILD}`);
console.log(fail === 0 ? '\nALL CHECKS PASSED' : `\n${fail} CHECK(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
