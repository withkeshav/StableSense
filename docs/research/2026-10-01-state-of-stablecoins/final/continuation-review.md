# Independent continuation review

Record: `docs/research/2026-10-01-state-of-stablecoins/`
Artifact: `final/continuation-review.md`
Date: 2026-10-02
Structured findings: `final/continuation-review-findings.json`

**Scope.** Read-only challenge of the operator-approved weak-section continuation against the
stored captures. I reviewed claims SS-001, SS-002, SS-005, SS-006, SS-007, SS-008, SS-009,
SS-014, SS-015, SS-063, SS-064, SS-071, SS-101 and SS-102, plus SS-085 because it carries the
x402 low end the synthesis promotes as evidenced, plus the whole of `synthesis.md` for
unsupported strong conclusions. I edited no existing file, made no commit or push, and made no
site or configuration change. No external retrieval was used; every finding is measured from
files inside the record.

**Independence.** I formed these findings from the captures before forming any view of prior
review history, and I do not assert or re-derive any prior disposition. Where this review
disagrees with an earlier reviewer, it says so on measured grounds about the capture, not by
appealing to another reviewer's verdict.

**Counts.** 14 findings: 5 measured errors, 4 uncertainties, 5 reviewer suggestions. No
artificial cap was applied; I stopped when the claims and prose named in the brief had been
checked against their captures.

---

## 1. Verifiers run, and what their PASS does not mean

Both verifiers were executed. Both returned exit 0 and PASS. Neither constitutes semantic
verification, and this review found defects that both passed over.

### 1.1 `verify_captures.py`

```
total_claims: 49   unique_ids: 49   passage_verbatim_verified: 49
passage_absent_or_partial: []   unmeasurable_capture: []
capture_is_authored_digest_not_page_text: []   overall: PASS
```

This is quote-match. It asks whether each `exact_passage` string occurs in the file named by
`source_path`, after declared normalisation. It does not ask whether the passage supports the
claim sentence, whether the scope in the claim matches the scope of the measurement, whether
the cited file is an origin capture rather than a researcher-authored digest, or whether the
`source_path` is registered in the manifest.

The gap is concrete. The script's docstring lists as check 4 that "the capture is a genuine
stored capture, not a researcher-authored digest (checked by shape)". In the code that check
only fires when a JSON capture's extracted body is under 200 characters. A prose `.txt` digest
of any length passes unflagged. Finding F-01 is exactly that case, and it passed.

### 1.2 `verify_continuation.py`

```
MANIFEST PASS: 37 capture entries; 14 continuation companions; 0 mismatches
DETERMINISTIC BUILD PASS: two rebuilds; claims, manifest, arithmetic byte-identical
PROSE/ARITHMETIC PASS: references resolve, no authored em/en dashes, new calculations match
```

Three measured checks: manifest hashes, build determinism, and prose reference resolution plus
dash discipline. Two limits matter here.

First, it iterates over manifest entries and hashes them. It never iterates over claims to
confirm each `source_path` is a registered entry. The one unregistered source path in the
ledger (F-01) is therefore structurally invisible to it. I measured it by hand.

Second, its three arithmetic assertions compare `arithmetic.json` against literals in its own
source. That is self-consistency of the record against itself, not agreement with the
captures. The module's own docstring says it reproduces "continuation integrity checks, not
semantic or independent review", and I confirmed the code does what the docstring claims.

---

## 2. Measured errors

### F-01 (high) SS-085 is sourced to an authored digest, and that file is not in the manifest

- Claim: `final/claims.json`, SS-085
- Prose: `final/synthesis.md` section 1.6, "The low end is now evidenced rather than asserted"
- Cited source: `final/evidence/x402scan.html.txt`
- Origin capture: `final/evidence/x402scan.html` (2,008,630 bytes, a manifest entry)

The cited file is a 15-line authored document whose own header reads:

```
Source: https://www.x402scan.com/
Retrieved: 2026-10-01
Extraction: final/evidence/build_claims.py extract_x402scan(), one regex on the
            embedded RSC payload.
```

The figures do not occur in the origin capture in quoted form. Grepping `x402scan.html` for
`12,293,450`, `27,467`, `38,519`, `974,215,144,043`, `974,215.14` and `0.079247` returns zero
occurrences of each. So `exact_passage` was matched against text the reviewer wrote, not
against retrieved bytes.

The numbers are nonetheless genuine. The origin capture contains, inside an escaped Next.js
RSC payload:

```
self.__next_f.push([1,"4e:{\"json\":{\"total_transactions\":12293450,
\"total_amount\":974215144043,\"unique_buyers\":27467,\"unique_sellers\":38519,
\"latest_block_timestamp\":\"2026-10-01T10:45:33.000Z\"}, ...
```

This matters because two statements in the record are now false. `verify_captures.py`'s
docstring claims a digest check that did not fire, and `limitations-and-next-update.md` line 78
states "No current claim is intentionally sourced to such a digest."

**Correction.** Repoint SS-085's `source_path` to `final/evidence/x402scan.html` and reset
`exact_passage` to a string that occurs there, such as `total_transactions\":12293450`. Add the
current `.txt` as a manifest companion so the derived-extraction lineage is hashed. Then
widen the digest check to `.txt` and `.md` sources and add a manifest-coverage assertion.

### F-02 (high) The record's own x402 residual is reconciled by the computation its prose calls the scope error

- Claim: SS-081; `final/evidence/arithmetic.json`
- Prose: `final/synthesis.md` section 1.6, first bullet
- Source: `final/evidence/bitquery-x402.html`

The synthesis declares the earlier review mistaken for computing a residual across scopes:

> That challenge was mistaken: 317 million is quoted directly from the source, and the 97.5
> percent applies to Arbitrum alone while the 2.59 billion is a five-chain total. Substituting
> a computed residual for the source's stated one is exactly the scope error the review was
> warning about.

But the source's own $317 million is reproducible only by a mixed-scope subtraction. The
capture states, verbatim, "Arbitrum's $2.33bn is 97.5% one contract", and gives Arbitrum
1.9 percent of payments and 90.0 percent of dollars out of the five-chain $2.59bn. So:

```
97.5% x $2.33bn              = $2.27175bn   (the one contract)
$2.59bn - $2.27175bn         = $0.31825bn   = $318.2M  -> the source's stated $317M
$2.59bn x (1 - 0.975)        = $64.75M                  (the earlier review's figure)
$2.33bn x (1 - 0.975)        = $58.3M                   (Arbitrum-only residual)
```

The source is self-consistent under a deliberate cross-scope residual. The earlier review's
$64.75M is wrong for a different and narrower reason: it applied one scope to both terms. The
record's own `arithmetic.json` performs the same mixed-scope subtraction the prose disowns,
via `x402_arbitrum_bridge_excluded = 2525250000.0`.

The $2.33bn Arbitrum total, the input that makes the residual reconcilable, is cited nowhere in
the ledger.

**Correction.** State the measured position: the $317M is quoted, and it is also reproducible
as the five-chain total minus 97.5 percent of Arbitrum's $2.33bn, so the source uses a
deliberately mixed-scope residual. Give the accurate reason the earlier review's figure was
wrong. Add the $2.33bn figure and its Arbitrum-only scope to SS-081. Restate the scope caution
as "do not read $317M as an Arbitrum-only or a five-chain-only residual", not "do not compute a
residual".

### F-03 (medium) The KC Fed version conflict is under-scoped, and its weighting is inverted

- Claims: SS-001, SS-002, SS-005, SS-102, all carrying an identical Continuation note
- Prose: `synthesis.md` section 1.1; `limitations-and-next-update.md` gap table
- Sources: `kc-fed-pdf-reader-20261002.json` versus `kc-fed-stablecoin-treasury.json`

Every continuation note describes the divergence as one coefficient, $0.20 versus $0.08. A
sentence-level diff of the two captures shows it is much wider:

| Item | PDF reader text | Revised HTML |
|---|---|---|
| Bank assets sentence | "20 percent of which are Treasuries (about $5 trillion total)" | "8 percent of which are Treasuries (about $2 trillion total) (Board of Governors of the Federal Reserve System 2026a, 2026b)" |
| Loan contraction | "a 1 percent decrease in both bank assets and bank lending" | "a 2.5 percent decrease in both bank assets and bank lending" |
| Reference base | single footnote on Circle repos | 2026 Federal Reserve citations, H.8 dated 20260918 |
| Per-$1 reduction | $0.20 | $0.08 |
| Internal consistency | 0.50 - 0.20 = 0.30, matches its stated net | 0.50 - 0.08 = 0.42, matches its own "(the remaining $0.42 is held in other assets)" |

The reduction figure is derived from the article's own bank Treasury share, to the cent, in both
versions. So the coefficient is not a free-floating typo; it tracks a changed input.

The record's framing is backwards. It presents the PDF as the version "consistent with its
stated $0.30 net", implying the HTML is the anomaly. On the measured evidence the revised HTML
is the later document, the one the publisher says was corrected on 2026-09-22, the one built on
2026 Federal Reserve data, and the one internally consistent on both its 0.42 residual and its
8 percent share. The PDF reader text is the superseded version. The intended coefficient stays
UNRESOLVED, but the current text implies a different weight of evidence than the captures
support, in a section the synthesis calls central.

**Correction.** Extend the Continuation note on all four claims and the section 1.1 paragraph to
name the share, the loan-contraction percentage and the reference base as part of the conflict.
Record that the revised HTML is later, publisher-corrected and self-consistent, so the PDF is
superseded. Keep the coefficient UNRESOLVED and keep both off any headline.

### F-04 (medium) A stored CNBC capture reports a July 2026 Circle approval that the record never accounts for

- Claim: SS-063, `research_status` "PARTIAL: original order captured; current authorization UNRESOLVED"
- Prose: `synthesis.md` section 2 and section 6; gap table row "Circle OCC authorization"
- Source: `final/evidence/cnbc-circle-occ-charter.json`, a manifest entry cited by no claim

The capture is dated 2026-07-10 and reports:

> Stablecoin issuer Circle surged after the U.S. Office of the Comptroller of the Currency, or
> OCC, granted it approval Friday to operate as a trust bank, the company said. Shares of the
> company were off their earlier highs but ended the day up nearly 5%. ... The new bank will
> operate under the name Circle National Trust. ... The charter does not greenlight Circle to
> operate as a commercial bank that takes deposits and makes loans.

Grepping the synthesis, limitations file, operator handoff and claims for "Circle National
Trust", "cnbc", "surge", "nearly 5" and "14 percent" returns nothing.

The record is right that SS-063 is a December 2025 preliminary order and right that current
authorization is unresolved. But it asserts that without disclosing that dated, on-point
evidence already sits in its evidence directory, under a different bank name. Silence here is
the pattern the record criticises elsewhere: treating an unexamined source as absent.

Separately, `synthesis.md` section 7 excludes "Circle's stock fell about 15 percent" for lack
of a capture. This capture supports a rise of nearly 5 percent, so that exclusion could be
closed on evidence and with the direction error recorded.

**Correction.** Add a claim citing this capture with its scope limits, or state in SS-063's
uncertainty field and the gap table why it is not relied on. Either way, do not leave it
silently uncited while asserting current status is unresolved.

### F-05 (low) Three prose citations point outside the manifest, and one does not resolve

- `synthesis.md` section 1.2: `firecrawl-recovery/captures/congress-genius-act.json`
- `synthesis.md` section 1.5: `final-bunny-routed/evidence/`
- `synthesis.md` section 8: `final/final-review/challenge.md` and `final/final-review/findings.json`

The first two exist and are byte-identical to the manifest captures (both sha256
`4055851e...` and `c38d0517...` respectively), but resolve only relative to the record root.
The third does not exist as written: `final/final-review/` is absent; the files are at
`final-review/` in the record root.

**Correction.** Repoint to `final/evidence/congress-genius-act-text.json` and
`final/evidence/circle-crcl-20260630-10q.txt`. Use `final-review/challenge.md` and
`final-review/findings.json`, or cite `review-disposition.json`.

---

## 3. Uncertainties

### F-06 (medium) SS-071's as_of date is not in the capture it cites

SS-071's `as_of` is "2026-05-31 (report landing page data date...)". Its cited capture,
`beincrypto-analysis-reader-20261002.json`, contains zero occurrences of "May 31" or
"2026-05-31"; its only date is 02 July 2026 for the article itself. The May 31 date comes from
a different manifest capture, `beincrypto-report-reader-20261002.json`, which no claim cites.
That capture also states "MARKET SIZE $60B", giving $32.9bn as 54.83 percent, against the
55.67 percent the record computes on the $59.1bn transfer-measured subset. The count-versus-value
correction is right and is the continuation's strongest single improvement; the attribution is
the defect. Add the second capture as a source for the date and state which denominator is being
reproduced.

### F-07 (medium) Two claims rest on reader excerpts that no verifier inspects

SS-005 and SS-071 are the only claims sourced to captures declaring
"Reader excerpt may be token-compressed or truncated; no origin bytes obtained; cache freshness
not established." Each has a hashed reader-response companion, but nothing compares the companion
to the excerpt or asserts completeness, and `verify_captures.py` has no truncation or staleness
check. The KC Fed excerpt ends mid-document at a footnote chart header. Flag any claim whose
capture declares a `capture_limit` in the verifier output, so a PASS line cannot be read as
covering them.

### F-08 (low) The OUSD scale comparison understates the gap by about three orders of magnitude

Section 3 item 1 says OUSD's "468 million dollars (SS-053) sits against issuers an order of
magnitude larger." Against SS-090's $308.0bn total market that is 657.5 times, about 2.82 orders
of magnitude, roughly 0.15 percent of the market; SS-040's $141bn Tether T-bill exposure alone
is about 301 times OUSD's supply. In a section whose purpose is to show how far the adoption
thesis is from settled, "an order of magnitude" invites the reader to treat OUSD as
comparable in scale.

### F-09 (low) Eight continuation claims duplicate two ledger fields

SS-005, SS-006, SS-007, SS-008, SS-009, SS-014, SS-015 and SS-064 carry identical strings in
`measurement_scope_and_exclusions` and `uncertainty_and_contrary_evidence`. Two fields defined to
hold different information hold the same text for every claim added in this pass, so
contrary-evidence review is not separately recorded for the substantive new funding-source
leads. Split the fields.

---

## 4. Reviewer suggestions

**F-10 (medium).** Add a manifest-coverage assertion to `verify_continuation.py`: every claim
`source_path` must appear in the manifest, and print the entries cited by no claim. Measured:
37 entries, 14 companions, 49 claims, one unregistered cited path, 11 uncited entries including
the four that F-04 and F-06 turn on.

**F-11 (low).** Extend SS-081's `exact_passage` to the $2.33bn Arbitrum figure and the chain
share row. That table is what makes the section's scope statements checkable, and its absence is
why F-02 went unnoticed.

**F-12 (low).** Add a claim for the Securitize platform AUM. The prose-only exclusion is
correct, but the capture is cited by no claim so the "$4.3 billion" string is unverified. Note
also that the same release contains "approximately $5.0 billion in assets now managed onchain"
against "$4.3 billion" total AUM.

**F-13 (low).** Add a claim for the unused OCC five-charter release, a second primary source for
SS-063's conditionality. Its silence on Bridge is useful negative evidence for the Bridge gap:
Bridge's issuer-reported approval is not among the five conditionally approved applications.

**F-14 (low).** SS-015 is a calibrated model prediction labelled `kind: fact`. The prose handles
it correctly; the label alone does not. Either add an estimate sub-kind or amend the fact
definition in the legend to cover a source's own stated model prediction.

---

## 5. Claim-by-claim verdict

| Claim | Verdict |
|---|---|
| SS-001 | Supported; continuation note under-scoped (F-03) |
| SS-002 | Supported; the 0.42-versus-0.30 gap is real and correctly framed as a source consistency check |
| SS-005 | Supported but materially under-scoped (F-03, F-07) |
| SS-006 | Supported; correctly held at conditional mechanisms, not observed funding shares |
| SS-007 | Supported; model estimate (F-14) |
| SS-008 | Supported; prose correctly refuses purchaser-level reading |
| SS-009 | Supported; correctly scoped to within-stablecoin flows |
| SS-014 | Supported; I also confirmed section 3(b)(1)'s three-year prohibition in the same capture |
| SS-015 | Supported with label caveat (F-14) |
| SS-063 | Supported but incomplete against in-record evidence (F-04) |
| SS-064 | Supported; I confirmed the allocation formula and both Coinbase cost figures in the 10-Q |
| SS-071 | Supported with attribution defect (F-06); denominator correction itself is correct |
| SS-101 | Supported and correctly labelled; surrounding prose understates the gap (F-08) |
| SS-102 | Supported; 650 x 0.42 = 273 and 650 x 0.30 = 195 both recomputed |
| SS-085 | Figures correct, sourcing defective (F-01) |

---

## 6. Whole-synthesis scan for unsupported strong conclusions

I read all 499 lines and checked each strong or conclusive construction against a cited capture.

**I found no unsupported strong conclusion resting on a misread source.** The defects are
elsewhere: sourcing provenance (F-01), an internal inconsistency in the record's own arithmetic
reasoning (F-02), an under-scoped version conflict (F-03), undisclosed contradicting in-record
evidence (F-04), citation paths (F-05) and magnitude language (F-08).

Specifically sound: the IMF 18 percent is correctly recorded against the tool's minus 18.57
percent as ordinary rounding rather than corrected; the 95-to-99 percent non-payment share is
excluded outright on evidence; the OUSD reserve arithmetic foots exactly against the capture;
the Circle-versus-Open-Standard conclusion is held at inference with superiority left
unresolved, which is the best-handled section in the document; the RWA section refuses to convert
low transfers into economic idleness; and the regulatory section refuses to call every GENIUS
duty operative.

On the operator's permission for inconclusive narratives with citations: every inconclusive
narrative I checked names its evidence, its competing explanation and its missing test. That
permission is being honoured, and the strongest narratives are the ones that stay nearest to
UNRESOLVED.

---

## 7. Honest unresolved

- **Which KC Fed document version is current.** F-03 establishes that the revised HTML is later
  and self-consistent, but confirming it requires a fresh origin fetch, which is outside this
  brief. The intended coefficient remains UNRESOLVED, as the record already says.
- **Whether the May 31, 2026 RWA denominator is $59.1bn or $60bn.** Both captures are stored and
  both are publisher-side. I can measure both; I cannot determine which the publisher intended.
- **Circle's current OCC authorization status.** F-04 surfaces dated in-record evidence of a July
  2026 approval. Whether that constitutes final authorization is a question of fact about the
  OCC's records, not about the captures. UNRESOLVED here.
- **Whether the CNBC capture's approval is the same legal event as the December 2025 order under a
  different name.** The captures name different entities and neither reconciles them. UNRESOLVED.
- **Whether SS-085's figures are the dashboard's own totals rather than a filtered series.** The
  payload keys are named `total_transactions` and `total_amount`, and the dashboard's inclusion
  rules are not in the capture. UNRESOLVED, and the record already says so.

Nothing in this review asserts operator acceptance, publication approval or legal compliance.
Research only; no deployment, no site or configuration change, no commit or push.