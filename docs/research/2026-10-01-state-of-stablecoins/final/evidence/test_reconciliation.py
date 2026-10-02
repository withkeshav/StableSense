"""Regression tests for evidence-integrity defects found by continuation review."""
import contextlib
import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import verify_captures
from verify_continuation import verify_coverage

FINAL = Path(__file__).resolve().parent.parent


class ReconciliationTests(unittest.TestCase):
    def run_capture_check(self, claims):
        # Test output is isolated; original verification.json is never overwritten.
        with tempfile.TemporaryDirectory(dir=os.environ.get('TMPDIR')) as directory:
            path = Path(directory)
            (path / 'claims.json').write_text(json.dumps(claims))
            with patch.object(verify_captures, 'FINAL', directory), contextlib.redirect_stdout(io.StringIO()):
                rc = verify_captures.main()
            return rc, json.loads((path / 'verification.json').read_text())

    def test_derived_digest_rejected(self):
        claims = [{'id': 'fixture', 'source_path': 'final/evidence/x402scan.html.txt', 'exact_passage': 'total_transactions'}]
        rc, result = self.run_capture_check(claims)
        self.assertEqual(rc, 1)
        self.assertEqual(result['overall'], 'FAIL')
        self.assertTrue(result['capture_is_authored_digest_not_page_text'])

    def test_missing_capture_unknown(self):
        rc, result = self.run_capture_check([{'id': 'fixture', 'source_path': '', 'exact_passage': 'x'}])
        self.assertEqual(rc, 2)
        self.assertEqual(result['overall'], 'INCOMPLETE_MEASUREMENT')

    def test_absent_passage_fails(self):
        rc, result = self.run_capture_check([{'id': 'fixture', 'source_path': 'final/evidence/x402scan.html', 'exact_passage': 'DELIBERATE NONEXISTENT TEST PASSAGE'}])
        self.assertEqual(rc, 1)
        self.assertEqual(result['overall'], 'FAIL')

    def test_duplicate_ids_fail(self):
        claim = next(c for c in json.loads((FINAL / 'claims.json').read_text()) if c['id'] == 'SS-085')
        rc, result = self.run_capture_check([claim, claim])
        self.assertEqual(rc, 1)
        self.assertEqual(result['overall'], 'FAIL')

    def test_unregistered_source_fails(self):
        with self.assertRaises(AssertionError):
            verify_coverage([{'copy': 'origin'}], [{'source_path': 'digest'}])

    def test_final_coverage_and_origin_passage(self):
        claims = json.loads((FINAL / 'claims.json').read_text())
        manifest = json.loads((FINAL / 'evidence-manifest.json').read_text())
        verify_coverage(manifest['copied'], claims)
        c = next(c for c in claims if c['id'] == 'SS-085')
        self.assertEqual(c['source_path'], 'final/evidence/x402scan.html')
        self.assertIn(c['exact_passage'], (FINAL.parent / c['source_path']).read_text())
        rc, result = self.run_capture_check([c])
        self.assertEqual(rc, 0)
        self.assertEqual(result['overall'], 'PASS')


if __name__ == '__main__':
    unittest.main()
