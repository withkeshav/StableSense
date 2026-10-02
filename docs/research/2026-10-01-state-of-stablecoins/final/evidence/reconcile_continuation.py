"""Deterministic reconciliation against preserved captures, not new retrieval."""
import hashlib
import json
from pathlib import Path

KC_NOTE = (
    'Continuation reconciliation: the HTML identifies a September 22, 2026 publisher correction '
    'and cites 2026 Federal Reserve data. It is the later documented revision, not evidence '
    'that the PDF reader is current. HTML versus PDF reader differs on bank Treasury share '
    '(8 versus 20 percent), Treasury reduction ($0.08 versus $0.20), and loan contraction '
    '(2.5 versus 1 percent). Both retain a $0.30 net. HTML components give $0.42; its '
    'parenthetical $0.42 is other bank assets, not an explicit corrected net-demand result. '
    'The PDF excerpt has unknown cache freshness and ends at a chart/footnote fragment. '
    'The intended net-demand coefficient remains UNRESOLVED; neither measures purchaser funding shares.'
)


def source(directory, name):
    return json.loads((Path(directory) / name).read_text())


def slice_text(text, start, end):
    first = text.index(start)
    return text[first:text.index(end, first)].strip()


def apply(ledger, directory):
    by_id = {c['id']: c for c in ledger}
    for identifier in ('SS-001', 'SS-002', 'SS-102'):
        c = by_id[identifier]
        c['uncertainty_and_contrary_evidence'] = c['uncertainty_and_contrary_evidence'].split(' Continuation:')[0] + ' ' + KC_NOTE
    by_id['SS-005']['uncertainty_and_contrary_evidence'] = KC_NOTE
    by_id['SS-063']['uncertainty_and_contrary_evidence'] += (
        ' The stored CNBC July 10, 2026 article reports a later approval under the name '
        'Circle National Trust (SS-106). That differs from the December order entity name. '
        'It is secondary reporting, not a final OCC authorization; the relationship between '
        'the names and legal acts is unverified. Its reported share-price rise also does '
        'not verify an earlier draft claim of a fall on a different announcement.'
    )
    by_id['SS-071']['as_of'] = '2026-07-02 (article publication); report landing page separately dates data to 2026-05-31, see SS-103; precise transfer week unknown'
    by_id['SS-071']['uncertainty_and_contrary_evidence'] += (
        ' SS-103 separately sources the landing-page data date and $60 billion market base. '
        '$32.9 billion / $59.1 billion transfer-measured subset gives 55.67 percent; '
        'using the separate $60 billion market base gives 54.83 percent. These denominators '
        'are not interchangeable; the precise reconciliation and observation week are UNRESOLVED.'
    )
    raw = (Path(directory) / 'x402scan.html').read_text()
    from build_claims import X402SCAN_RE
    match = X402SCAN_RE.search(raw)
    if match is None:
        raise ValueError('Origin x402scan payload absent')
    by_id['SS-085'].update(source_path='final/evidence/x402scan.html', exact_passage=match.group(0))
    by_id['SS-085']['measurement_scope_and_exclusions'] = (
        'Embedded dashboard statistics object in stored origin HTML. Formatting and '
        'six-decimal conversion are derived, not verbatim source prose. Inclusion rules '
        'and cumulative window are unknown; global coverage is not independently established.'
    )
    by_id['SS-085']['claim'] = by_id['SS-085']['claim'].replace('reports global totals', 'contains a totals object')
    raw = (Path(directory) / 'bitquery-x402.html').read_text()
    by_id['SS-081']['exact_passage'] = slice_text(raw, '339,249 payments', '<h2><span class="num">05')
    by_id['SS-081']['claim'] += ' The source separately reports $2.33 billion of Arbitrum volume.'
    by_id['SS-081']['measurement_scope_and_exclusions'] = (
        'August 2026 five-chain total is $2.59 billion; Arbitrum-only total is $2.33 billion '
        'and its single-contract share is 97.5 percent. The stated $317 million is the '
        'five-chain rail residual after removal of that Arbitrum contract, not an Arbitrum-only '
        'residual and not a commerce-only measure.'
    )
    by_id['SS-081']['uncertainty_and_contrary_evidence'] = (
        'Rounded source inputs imply $318.25 million, not exactly the quoted $317 million; '
        'unrounded inputs are not stored. Removing a subset from its containing total is '
        'valid; applying an Arbitrum share to the entire five-chain total is not. '
        'Other bridge traffic, bots and tests may remain.'
    )
    uncertainties = {
        'SS-006': 'Conditional mechanisms are author analysis, not a measured source-of-funds distribution. No purchaser-level funding dataset was established.',
        'SS-007': 'Econometric identification and results were not replicated; full paper not reviewed. A yield response does not identify fiscal relief or purchaser funding shares.',
        'SS-008': 'Common-shock opposite aggregate responses cannot establish purchases funded by MMF redemptions. Full dataset and identification were not independently reanalysed.',
        'SS-009': 'Within-stablecoin safety migration does not identify origin assets financing new issuance. Full study was not independently replicated.',
        'SS-014': 'No qualifying final-rule issuance was established. The statutory trigger does not by itself establish current commencement.',
        'SS-015': 'Results depend on calibrated assumptions and alternative scenarios. Full paper calibration and external validity were not audited; this is not observed fiscal relief.',
        'SS-064': 'Issuer retention and all contractual details are missing. Comparable Open Standard realized payouts and terms remain UNRESOLVED.',
    }
    for identifier, text in uncertainties.items():
        by_id[identifier]['uncertainty_and_contrary_evidence'] = text
    specs = [
        ('SS-103', 'rwa', 'beincrypto-report-reader-20261002.json', '2026-05-31 (publisher landing-page data date)',
         'Source: rwa.xyz', 'CONCENTRATION',
         'BeInCrypto report landing page labels its data as May 31, 2026 and its market size as $60 billion.',
         'Publisher landing-page summary, excerpt only, not the full report or dataset; date attribution for SS-071 is separate from the article publication date.',
         'The article transfer-measured subset totals $59.1 billion. No reconciliation to the landing-page $60 billion is established. Reader freshness and completeness are unknown.'),
        ('SS-104', 'rwa', 'securitize-q2-20261002.json', '2026-06-30 AUM; release 2026-08-12',
         'Domingo concluded:', '(3) Adjusted EBITDA',
         'Securitize reports $4.3 billion total tokenized AUM as of June 30, 2026; its release separately quotes approximately $5.0 billion in assets now managed onchain.',
         'Platform-level issuer reporting, not BUIDL-specific AUM. The release defines AUM as Tokenized Assets Under Management.',
         'The approximately $5.0 billion onchain quote has a different description and no aligned valuation date here. It is not substituted for June 30 AUM or BUIDL fund AUM.'),
        ('SS-105', 'regulatory', 'occ-five-charters-20261002.json', '2025-12-12',
         'WASHINGTON', 'Related Links',
         'OCC release 2025-125 announces five conditional trust-bank approvals, naming First National Digital Currency Bank and Ripple as new charters, and BitGo, Fidelity and Paxos as conversions.',
         'One dated OCC announcement, corroborating historical conditionality in SS-063. It is not an exhaustive current charter register.',
         'Bridge and Circle National Trust are not named in this release. This does not establish that no separate or later authorization exists.'),
        ('SS-106', 'regulatory', 'cnbc-circle-occ-charter.json', '2026-07-10 (article metadata)',
         'Stablecoin issuer [Circle]', 'The news reflects a broader trend',
         'CNBC reports July 10, 2026 approval for Circle to operate a trust bank named Circle National Trust, direct reserve management, no commercial deposit-taking/lending greenlight, and a share-price rise of nearly 5 percent.',
         'Secondary report of company-announced approval and share movement, not a primary OCC final authorization or independently verified market-price series.',
         'Entity name differs from the December 2025 primary order. Identity, legal-act continuity and current final authorization remain UNRESOLVED. The price move does not test a different event date.'),
    ]
    for identifier, topic, name, date, start, end, claim, scope, uncertainty in specs:
        meta = source(directory, name)
        ledger.append({
            'id': identifier, 'kind': 'fact', 'topic': topic, 'claim': claim,
            'source_url': meta.get('url') or meta['metadata']['sourceURL'],
            'as_of': date, 'captured_at': meta['capturedAt'],
            'source_path': 'final/evidence/' + name,
            'exact_passage': slice_text(meta['markdown'], start, end),
            'passage_finder_status': 'SLICED_VERBATIM',
            'measurement_scope_and_exclusions': scope,
            'uncertainty_and_contrary_evidence': uncertainty,
            'falsifier': 'A corrected publisher document or primary record contradicting this attributed report.',
        })
    return ledger


def manifest_companion(manifest, directory):
    name = 'x402scan.html.txt'
    data = (Path(directory) / name).read_bytes()
    entry = next(e for e in manifest if e['copy'] == 'final/evidence/x402scan.html')
    entry.setdefault('companions', []).append({
        'path': 'final/evidence/' + name,
        'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data),
        'role': 'Derived formatting and unit conversion, not an origin quote capture',
    })
    return manifest


def arithmetic(values):
    values.pop('x402_arbitrum_bridge_excluded', None)
    values.pop('x402_residual_if_subtracted', None)
    values.update({
        'x402_arbitrum_contract_rounded_inputs': round(2.33e9 * 0.975, 2),
        'x402_five_chain_residual_rounded_inputs': round(2.59e9 - 2.33e9 * 0.975, 2),
        'x402_arbitrum_only_residual_rounded_inputs': round(2.33e9 * (1 - 0.975), 2),
        'x402_incorrect_five_chain_share_residual': round(2.59e9 * (1 - 0.975), 2),
        'rwa_zero_transfer_share_of_landing_market_pct': round(32.9 / 60 * 100, 2),
    })
    return values
