#!/usr/bin/env python3
"""Reproduce continuation integrity checks, not semantic or independent review.

Exit 0: measured checks passed. Exit 1: measured mismatch.
Exit 2: required evidence could not be read or a rebuild could not run.
"""
import hashlib
import json
import re
import subprocess
from pathlib import Path

FINAL = Path(__file__).resolve().parent.parent
RECORD = FINAL.parent


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify_coverage(entries, claims):
    registered = {entry['copy'] for entry in entries}
    cited = {claim['source_path'] for claim in claims}
    assert not (cited - registered), sorted(cited - registered)
    return sorted(registered - cited)


def main():
    try:
        manifest = json.loads((FINAL / 'evidence-manifest.json').read_text())
        entries = manifest['copied']
        assert manifest['declared_count'] == len(entries)
        assert len({entry['copy'] for entry in entries}) == len(entries)
        companions = 0
        for entry in entries:
            assert sha(RECORD / entry['copy']) == entry['sha256'], entry['copy']
            for companion in entry.get('companions', []):
                assert sha(RECORD / companion['path']) == companion['sha256'], companion['path']
                companions += 1
        print(f'MANIFEST PASS: {len(entries)} capture entries; {companions} continuation companions; 0 mismatches')
        files = ['claims.json', 'evidence-manifest.json', 'evidence/arithmetic.json']
        baseline = {name: sha(FINAL / name) for name in files}
        for _ in range(2):
            subprocess.run(['python3', str(FINAL / 'evidence/build_claims.py')],
                           capture_output=True, text=True, check=True)
            assert {name: sha(FINAL / name) for name in files} == baseline
        print('DETERMINISTIC BUILD PASS: two rebuilds; claims, manifest, arithmetic byte-identical')
        claims = json.loads((FINAL / 'claims.json').read_text())
        unused = verify_coverage(entries, claims)
        print(f'COVERAGE PASS: {len(claims)} claims cite registered origin/reader captures')
        print('UNUSED CAPTURES:', json.dumps(unused))
        for claim in claims:
            path = RECORD / claim['source_path']
            if path.suffix == '.json':
                meta = json.loads(path.read_text())
                if meta.get('capture_limit'):
                    print('EXCERPT LIMIT:', claim['id'], meta['capture_limit'])
        identifiers = {claim['id'] for claim in claims}
        for name in ['synthesis.md', 'limitations-and-next-update.md']:
            text = (FINAL / name).read_text()
            assert not (set(re.findall(r'SS-\d+[a-z]?', text)) - identifiers), name
            assert '\u2014' not in text and '\u2013' not in text, name
        computed = json.loads((FINAL / 'evidence/arithmetic.json').read_text())['computed']
        assert computed['rwa_zero_transfer_count_share_pct'] == round(910 / 1289 * 100, 2)
        assert computed['rwa_zero_transfer_value_share_pct_rounded_inputs'] == round(32.9 / 59.1 * 100, 2)
        assert computed['kc_pdf_component_net'] == round(0.50 - 0.20, 4)
        assert computed['x402_five_chain_residual_rounded_inputs'] == round(2.59e9 - 2.33e9 * 0.975, 2)
        assert computed['rwa_zero_transfer_share_of_landing_market_pct'] == round(32.9 / 60 * 100, 2)
        print('PROSE/ARITHMETIC PASS: references resolve, no authored em/en dashes, new calculations match')
        return 0
    except AssertionError as error:
        print('FAIL:', error)
        return 1
    except (OSError, KeyError, ValueError, subprocess.CalledProcessError) as error:
        print('UNKNOWN: could not complete measurement:', error)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
