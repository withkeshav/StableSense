"""Approved weak-section continuation. Source slices, not authored quotations.

R3 remains the historical baseline in build_claims.py. This module applies the
operator-approved continuation deterministically and preserves earlier readings
in review-disposition.json. No retrieval or model calls occur during a build.
"""
import hashlib
import json
from pathlib import Path

CAPTURES = [
    'kc-fed-pdf-reader-20261002.json',
    'fed-stablecoin-funding-20261002.json',
    'bis-safe-asset-prices-20261002.json',
    'tbac-digital-money-20261002.json',
    'beincrypto-report-reader-20261002.json',
    'beincrypto-analysis-reader-20261002.json',
    'occ-five-charters-20261002.json',
    'occ-circle-conditional-20261002.json',
    'securitize-q2-20261002.json',
    'bis-mmf-monetary-20261002.json',
    'nyfed-flight-safety-20261002.json',
    'bis-macro-model-20261002.json',
]


def passage(directory, name, anchor, end=None):
    path = Path(directory) / name
    if name.endswith('.json'):
        text = json.loads(path.read_text())['markdown']
    else:
        text = path.read_text()
    start = text.index(anchor)
    stop = text.index(end, start) if end else len(text)
    return text[start:stop].strip()


def apply_updates(ledger, directory):
    by_id = {claim['id']: claim for claim in ledger}
    for identifier in ('SS-001', 'SS-002', 'SS-102'):
        claim = by_id[identifier]
        claim['uncertainty_and_contrary_evidence'] += (
            ' Continuation: the linked PDF reader capture uses a bank Treasury share of 20 percent '
            'and a $0.20 reduction, consistent with its stated $0.30 net. The revised HTML uses '
            '$0.08 and retains $0.30. The PDF reader may be cached and is truncated; this is a '
            'document-version discrepancy, not a publisher reconciliation. The literal word '
            "'cents' after a dollar amount is also ambiguous. Neither version measures the actual funding mix."
        )
        claim['research_status'] = 'UNRESOLVED: intended revised coefficient'
    rwa = by_id['SS-071']
    rwa.update({
        'claim': 'BeInCrypto reports that 910 of 1,289 tested tokenized assets above $100,000 had zero weekly transfers; their $32.9 billion represented 56 percent of the value measured for transfer activity, not 56 percent of the asset count.',
        'source_url': 'https://beincrypto.com/reality-of-rwa-tokenization-2026/',
        'as_of': '2026-05-31 (report landing page data date; precise transfer observation window not disclosed in captured article)',
        'captured_at': json.loads((Path(directory) / 'beincrypto-analysis-reader-20261002.json').read_text())['capturedAt'],
        'source_path': 'final/evidence/beincrypto-analysis-reader-20261002.json',
        'exact_passage': passage(directory, 'beincrypto-analysis-reader-20261002.json', 'Across 1,289 tokenized assets', '## **The Next Problem'),
        'passage_finder_status': 'SLICED_VERBATIM',
        'measurement_scope_and_exclusions': 'Publisher summary of its own analysis, not independently reproduced. Count and value denominators are separate. Includes Represented assets: about $27 billion of the reported dormant value. No weekly transfer does not establish economic idleness, failed adoption, absence of yield or absence of off-chain servicing.',
        'uncertainty_and_contrary_evidence': 'Supersedes R3 count-based interpretation. Publisher page and article are now stored as reader responses, not full origin captures. Full report and underlying asset-level dataset are not stored. Exact week, chains, transfer exclusions and count methodology remain UNRESOLVED. The report page calls the 56 percent a value share; the article states the denominator. Rounded value components yield about 55.67 percent.',
        'falsifier': 'Full report or reproducible asset-level dataset contradicting the reported denominator, values or transfer classification.',
        'research_status': 'PARTIAL: denominator corrected; economic idle claim UNRESOLVED',
    })
    circle = by_id['SS-063']
    circle.update({
        'claim': 'The OCC December 12, 2025 decision grants Circle\'s proposed First National Digital Currency Bank preliminary conditional approval only; final authorization to commence business requires all preopening requirements to be met.',
        'source_url': 'https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-125a.pdf',
        'as_of': '2025-12-12',
        'captured_at': json.loads((Path(directory) / 'occ-circle-conditional-20261002.json').read_text())['capturedAt'],
        'source_path': 'final/evidence/occ-circle-conditional-20261002.json',
        'exact_passage': passage(directory, 'occ-circle-conditional-20261002.json', 'The OCC has granted preliminary conditional approval only.', '\n\n\n\n1'),
        'passage_finder_status': 'SLICED_VERBATIM',
        'measurement_scope_and_exclusions': 'Primary OCC charter decision as issued December 12, 2025. Historical preliminary approval, not evidence of final authorization or operational status in October 2026.',
        'uncertainty_and_contrary_evidence': 'Supersedes unqualified secondary approval wording in R3. A later final authorization was not established in this continuation. Proposed reserve-management and custody activities are not proof that they commenced.',
        'falsifier': 'A later OCC final authorization changes current status, but does not erase the historical preliminary nature of this decision.',
        'research_status': 'PARTIAL: original order captured; current authorization UNRESOLVED',
    })
    by_id['SS-101'].update({
        'claim': 'HYPOTHESIS: partner incentives could increase OUSD balances and payment use attributable to incentivized distributors. Supply growth alone, or a flat integration count alone, cannot establish or falsify this causal thesis.',
        'measurement_scope_and_exclusions': 'Untested causal hypothesis. Existing integrations can grow volume without adding integrations. Requires dated partner-level balances, qualifying payment volume, realized payouts and a credible comparison.',
        'uncertainty_and_contrary_evidence': 'No such series or counterfactual is stored. Treasury balances, exchange inventory, promotions and market growth can explain supply independently of the incentive. Superior economics and adoption remain UNRESOLVED.',
        'falsifier': 'Under a credible comparison controlling for launch effects, promotions and market growth, realized partner incentives produce no additional partner balances or qualifying payment use. Flat integration count by itself is not a valid falsifier.',
        'research_status': 'UNRESOLVED: causal adoption effect',
    })
    specs = [
        ('SS-008', 'us-debt', 'bis-mmf-monetary-20261002.json', '2024-10-17 (publisher date)',
         'Using a new series of crypto shocks,', 'The views expressed',
         'BIS Working Paper 1219 reports opposite responses of prime money-market fund assets and stablecoin capitalization to monetary tightening: prime-MMF assets rise while stablecoin capitalization declines.',
         'Publisher abstract of empirical response estimates, not purchaser-level source-of-funds tracking. Opposite aggregate responses to a common shock do not identify how many stablecoin purchases were funded by MMF redemption. Full paper and dataset not reanalysed here.',
         'Revised paper or replication overturning the response estimates; purchaser-level data could separately establish actual source flows.'),
        ('SS-009', 'us-debt', 'nyfed-flight-safety-20261002.json', '2024-04 (revision date on publisher page)',
         'Similar to the more traditional money market funds', 'Full Article',
         'New York Fed Staff Report 1073 documents flight-to-safety from riskier to safer stablecoins during crypto stress and says stablecoin flows tend to occur within blockchains.',
         'Publisher abstract on within-stablecoin flows and runs, not observed allocation from deposits, MMFs or direct Treasury holdings into new stablecoin issuance. Full article not reanalysed in this continuation.',
         'Revised study or replication overturning the within-stablecoin flight-to-safety findings.'),
        ('SS-015', 'us-debt', 'bis-macro-model-20261002.json', '2026-06-23 (publisher date)',
         'We analyse the macroeconomic impact of stablecoins', 'The views expressed',
         'BIS Working Paper 1363 models opposing bank-lending and fiscal-space channels; its US-calibrated baseline predicts a modest long-run output reduction, with results changing under alternative reserve regulation, public debt and foreign-demand scenarios.',
         'Quantitative macroeconomic model described in publisher abstract, not measured funding-source shares, an observed fiscal dividend or a forecast adopted by BIS. Full paper assumptions and calibration not independently audited here.',
         'Revised model, calibrated assumptions or external validation overturning these model predictions.'),
        ('SS-005', 'us-debt', 'kc-fed-pdf-reader-20261002.json', '2025-08-08 (printed PDF date; cached version freshness unestablished)',
         'To put this effect in dollar terms,', 'Assuming the stablecoin market grows',
         'The linked Kansas City Fed PDF reader text uses a $0.20 bank Treasury reduction and $0.50 issuer increase, giving the stated $0.30 net, unlike the revised HTML\'s $0.08 reduction.',
         'PDF reader excerpt only, truncated, with no origin bytes or independent cache freshness. Confirms different text in two captured versions, not which version is intended or empirically correct.',
         'Publisher clarification reconciling the PDF and revised HTML; obtaining a fresh origin PDF may reveal a different version.'),
        ('SS-006', 'us-debt', 'fed-stablecoin-funding-20261002.json', '2025-12-17',
         'The impact on U.S. bank deposits depends', '2.2 Stablecoin Issuers',
         'A Federal Reserve FEDS Note separates domestic deposit substitution, foreign demand and conversion from investment products; it says stablecoins can reduce, recycle or restructure deposits rather than simply drain them.',
         'Author analysis of conditional mechanisms, not observed market-wide funding shares. A mint paid from a bank account does not identify which asset the purchaser sold to fund it. Quantitative funding-source decomposition remains UNRESOLVED.',
         'Observed purchaser funding data or corrected author analysis contradicting the proposed mechanisms.'),
        ('SS-007', 'us-debt', 'bis-safe-asset-prices-20261002.json', 'daily sample January 2021 to March 2026 (paper webpage abstract)',
         'This paper examines the impact', 'JEL classification:',
         'BIS working-paper abstract reports that a $3.5 billion stablecoin inflow lowers three-month Treasury bill yields by 0.71 basis points on impact and up to 4 basis points within 10 days, with limited longer-tenor spillovers.',
         'Authors\' econometric estimate described in the publisher abstract, not independently replicated. Does not identify the origin-asset funding mix or estimate fiscal debt sustainability. Full paper not reviewed in this continuation; not a linear extrapolation rule.',
         'Replication, revised identification or a revised paper overturning the reported result.'),
        ('SS-064', 'economics', 'circle-crcl-20260630-10q.txt', '2026-06-30',
         'Under the Collaboration Agreement, Coinbase receives', 'Transaction costs We incur',
         'Circle\'s Q2 2026 10-Q discloses Coinbase allocations linked to platform balances after issuer retention and half the remaining broader-ecosystem amount after approved third-party payments; Coinbase distribution costs were $324.6 million for the quarter and $655.3 million for the half year.',
         'Named Coinbase arrangement, not a universal distributor rate. Issuer-retention amount and all contract terms are not established by this passage. Combined distribution/transaction cost line remains distinct from separately disclosed Coinbase distribution costs. Like-for-like Open Standard comparison remains UNRESOLVED.',
         'A revised filing or comparable Open Standard contract disclosure contradicting the described allocation or settling the comparison.'),
        ('SS-014', 'regulatory', 'congress-genius-act-text.json', '2025-07-18',
         'SEC. 20.', 'ApprovedJuly 18, 2025.',
         'GENIUS Act section 20 sets general commencement at the earlier of 18 months after enactment or 120 days after primary Federal payment stablecoin regulators issue any final implementing regulations.',
         'Primary statutory trigger, not a finding that an early trigger has occurred. Section 3(b)(1) separately delays its offer/sale prohibition until three years after enactment. Final-rule issuance and actual current commencement remain UNRESOLVED.',
         'Amended statute or authoritative final-rule record changing or establishing the operative trigger.'),
    ]
    for identifier, topic, name, as_of, anchor, end, claim_text, scope, falsifier in specs:
        path = Path(directory) / name
        meta = json.loads(path.read_text()) if name.endswith('.json') else {}
        url = meta.get('url') or by_id['SS-060']['source_url']
        ledger.append({
            'id': identifier, 'claim': claim_text, 'kind': 'fact', 'topic': topic,
            'source_url': url, 'as_of': as_of,
            'captured_at': meta.get('capturedAt', by_id['SS-060']['captured_at']),
            'source_path': 'final/evidence/' + name,
            'exact_passage': passage(directory, name, anchor, end),
            'passage_finder_status': 'SLICED_VERBATIM',
            'measurement_scope_and_exclusions': scope,
            'uncertainty_and_contrary_evidence': scope,
            'falsifier': falsifier,
        })
    from reconcile_continuation import apply
    return apply(ledger, directory)


def extend_manifest(manifest, directory):
    for name in CAPTURES:
        path = Path(directory) / name
        data = path.read_bytes()
        meta = json.loads(data)
        companions = []
        for field in ('raw_file', 'reader_response'):
            companion = meta.get(field)
            if companion:
                content = (Path(directory) / companion).read_bytes()
                companions.append({'path': 'final/evidence/' + companion,
                                   'sha256': hashlib.sha256(content).hexdigest(),
                                   'bytes': len(content)})
        if meta.get('raw_file', '').endswith('.pdf'):
            name_txt = meta['raw_file'] + '.txt'
            content = (Path(directory) / name_txt).read_bytes()
            companions.append({'path': 'final/evidence/' + name_txt,
                               'sha256': hashlib.sha256(content).hexdigest(),
                               'bytes': len(content)})
        manifest.append({'copy': 'final/evidence/' + name,
                         'copied_from': 'Approved continuation, captured directly into final/evidence',
                         'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data),
                         'capture_url': meta['url'], 'captured_at': meta['capturedAt'],
                         'retrieval_route': meta['retrieval_route'],
                         'capture_limit': meta.get('capture_limit', 'Full origin bytes retained'),
                         'companions': companions})
    from reconcile_continuation import manifest_companion
    return manifest_companion(manifest, directory)


def update_arithmetic(values):
    values.update({
        'rwa_zero_transfer_count_share_pct': round(910 / 1289 * 100, 2),
        'rwa_zero_transfer_value_share_pct_rounded_inputs': round(32.9 / (32.9 + 26.2) * 100, 2),
        'kc_pdf_component_net': round(0.50 - 0.20, 4),
    })
    from reconcile_continuation import arithmetic
    return arithmetic(values)
