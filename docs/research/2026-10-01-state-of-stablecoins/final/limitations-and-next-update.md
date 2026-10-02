# Limitations and next update

Record: `docs/research/2026-10-01-state-of-stablecoins/` (R3 reconciled, 2026-10-02)
Companion: `final/synthesis.md`, `final/claims.json`, `final/review-disposition.json`,
`final/verification.json`

This file states what this draft cannot establish. It is deliberately specific, because a limitations
section that says "results may be incomplete" tells an operator nothing.

## 0. What the verification did and did not establish

`final/evidence/verify_captures.py` returns PASS at 41 of 41, and that is worth stating precisely,
because PASS is weaker than it sounds. It establishes that each claim's stored passage is present
verbatim in the capture the claim points at, that every source path resolves inside this project, and
that IDs are unique. It does not establish that the passage supports the whole claim, that the
capture is the primary source rather than reporting about one, that the source is current, or that
the extraction of the capture was complete. Those four are analyst judgements, and R3-01 below is
the standing proof that the last one can fail silently.

## 1. Evidence gaps that remain open

These are UNRESOLVED, not soft findings. Each names what would close it.

| Gap | Current state in this draft | What would close it |
|---|---|---|
| BUIDL assets under management | No primary issuer disclosure stored. Three differently dated secondary figures: 2.5-2.9bn (SS-072, early July 2026), 2.7bn (SS-072b, August 2026), 2.4bn (SS-072c, May 2026). Not interchangeable. No current AUM asserted. | A dated primary issuer disclosure or attestation. |
| RWA "idle value" definition | Source gives a count (56 percent of assets above 100,000 dollars) with no stated definition of idle. The original analysis is not stored. | The original analysis, with its denominator and idle definition stated. |
| True x402 commerce volume | No source estimates it. Bridge and bot shares are measured by three firms; the commerce residual is not. | A bridge-excluded, bot-excluded x402 volume series over time. |
| Circle and Open Standard distributor rates | Both balance-linked or earnings-routed. Neither discloses a rate or formula, so they cannot be compared on magnitude. | Any issuer disclosing distributor terms. |
| GENIUS commencement and effective-date mechanics | Statute text is stored. The commencement analysis asserted by earlier drafts from secondary sources was not independently verified and is not restated. | Primary commencement provisions plus final implementing rules. |
| Primary OCC orders (Circle trust charter, Bridge conditional approval) | Both are secondary or issuer-reported only. No OCC order is stored. | The OCC order or release itself. |
| Stablecoin market cap cross-source range | Only the 13 August 2026 aggregator figure is evidenced. The 270-317 billion range is not asserted because those captures are absent. | A second independent measurement for the same date. |
| OUSD live integrations and partner adoption | No dated series exists in this record. Supply is documented; routed volume is not. | A dated integration or volume disclosure from the issuer or a partner. |
| OUSD Solana holder distribution | The 47-wallet figure from earlier drafts has no capture here and is excluded. | A dated on-chain holder distribution with its methodology. |
| Stablecoin funding-source decomposition | Central to net Treasury demand, absent entirely. | A decomposition of stablecoin funding by holder type. |

## 2. Structural limitations of this record

**The evidence extractor could hide evidence, and did (R3-01).** Until R3, the markup stripper used
to build capture text treated a literal "<" in prose as a tag opener. Measured: 3,716 characters
swallowed from the Spark Money RWA capture, including the BUIDL May 2026 figure, and 26,586 from the
IMF WP/26/44 capture. Because the verifier checks that a sliced passage exists rather than that a
capture was extracted completely, this class of defect is invisible to it by construction. It is
fixed and reproducible via `flat_legacy()`, but the general lesson stands: a re-run that still shows
PASS is only as good as the extraction underneath it.

**Single-capture dependence.** Several claims rest on one capture from one firm. Tether reserves rest
on one issuer attestation. The RWA figures rest on one aggregator's reporting of RWA.xyz. The BCG
figures rest on one white paper. The Circle figures rest on one filing, which is stronger than the
others because it is a regulatory filing, but it is still one period. The x402 value range spans
three firms but three incompatible scopes, so corroboration is of the pattern and not of the level.

**The x402 numbers cannot be averaged, and one was withdrawn.** The Bitquery $317 million is the
source's own stated residual, not a computed one; an earlier review challenged it arithmetically and
was wrong to, because the 97.5 percent applies to Arbitrum alone while the 2.59 billion is a
five-chain total. The "$996 thousand across 18.1 million transactions" floor has been withdrawn
entirely, because it matches neither the volume nor the transaction count of any capture; the
evidenced low point is now the x402scan dashboard's own cumulative total, whose window is not stated
in the capture (SS-085).

**The Kansas City Fed article disagrees with itself.** Its components give 0.42 and its stated net is
0.30, an unexplained gap of 0.12. No reconciliation exists. The Bulletin has separately been updated
once, on 22 September 2026, to correct a calculation error in Treasury security holdings, and that
correction did not address this gap. This draft reports both figures and builds no headline on
either. If the Bank publishes a reconciliation, the US-debt framing may change.

**Authored digests masquerading as captures.** Several files in `native-rwa/evidence/` and
`native-market/evidence/` are researcher-authored JSON digests containing curated `key_passages` rather
than stored page text. A digest cannot verify its own quotes: it records what the researcher believed
was there. `final/evidence/verify_captures.py` now rejects such files explicitly, and no claim in the
final ledger rests on one. This is a latent defect in the upstream corpus, not only in this draft.

**Source quotations contain dashes; authored prose does not.** Thirteen ledger passages contain an
em or en dash inside the quoted text, from the GENIUS statute, the IMF papers and two aggregator
captures. These are left intact because altering a quotation would break the verbatim match the
verifier enforces. The project's typography rule governs authored prose, not source text.

**No fresh research wave was run.** Per the plan, only missing primary evidence needed to close material
defects was fetched, and in practice everything resolved against already-stored captures. The GENIUS
statute text, the IMF working paper PDF, the Circle 10-Q and the Chainalysis and Visa x402 notes were
all present. This draft is therefore thorough on the topics the upstream passes covered and thin where
they did not: Indian privacy law primary sources were not retrieved, and no financial-regulator primary
document was fetched.

**An independent review happened, and it was scoped.** The LongCat challenge (R2, preserved in
`final-review/`) checked every claim of the then-37-claim ledger against stored captures and returned
PASS_WITH_MINOR_FINDINGS: no conclusion overturned, three minor passage-support gaps, all three since
dispositioned. Its scope was the ledger, not the prose, the tooling or the legal appendix, so it is not
a review of those. The interrupted Step, DeepSeek and Bunny attempts are still not completed reviews.

## 3. Claims deliberately excluded rather than repaired

These had no supporting capture, so they are absent rather than softened:

- The claim that 95 to 99 percent of stablecoin volume is non-payment. Not in any source; the source
  says about 7 percent for the broad definition.
- Circle's stock falling about 15 percent on the OUSD announcement. No capture supports any specific
  price move.
- The 47-wallet Solana figure for OUSD.
- The 270-to-317 billion market-cap range, for want of the underlying captures.
- "Reserves are T-bills only" and "USDC partners receive no reserve-yield incentive", both refuted by
  the statute and by Circle's filing.
- The "$996 thousand across 18.1 million transactions" x402 floor, withdrawn for want of any capture
  holding either number.
- BUIDL AUM of $2.7 billion attributed to the aggregator capture. The figure is real and lives in a
  different capture; the aggregator capture holds only a $2.7 trillion 2030 projection.
- The planted claim that holding OUSD confers direct legal title to reserve Treasuries and the right
  to instruct BlackRock's trades. Named and refuted in the synthesis rather than silently dropped,
  because it was put to this record as a test.

## 4. Recommended next update

Ordered by how much each would change the conclusions, not by effort.

1. **Retrieve primary issuer AUM for BUIDL and at least two other tokenized Treasury funds.** This is the
   cheapest fix for a gap that currently prevents any AUM statement.
2. **Retrieve the original RWA idle-value analysis** and record its denominator and idle definition. Until
   then the 56 percent figure should not be published at all, in any form.
3. **Build a dated OUSD series** (supply, reserve composition, live integration count) so the incentive
   hypothesis in SS-101 becomes testable rather than rhetorical.
4. **Add a stablecoin funding-source decomposition** if one exists. This is the missing input for the
   gross-versus-net Treasury demand question, which is currently the weakest supported section.
5. **Retrieve final GENIUS implementing rules** once promulgated, and re-check the reserve classes,
   which could be narrowed by rulemaking.
6. **Re-verify the Circle 10-Q at the next quarter** to get a trend on accrued distribution costs
   rather than a single point.
7. **Re-run the verifier after any edit to this record.** `python3 final/evidence/verify_captures.py`
   must return PASS before any text here is reused. Note the limit of that check stated in section 0:
   it cannot tell you whether a capture was extracted completely, which is the one defect class that
   actually bit this record.
8. **Have the R3-01 extractor fix independently re-measured** before anyone treats this ledger as
   audit-grade. The character counts in section 2 are reproducible, but the fix was written by the
   same pass that reported the defect, and the defect was invisible to the verifier by construction.

## 5. Freshness

All captures in this record were taken 2026-10-01. Source as-of dates range from 2025-08-08 (Kansas
City Fed) to 2026-10-01 (Bridge reserve page). Anything older than a quarter should be re-checked before
publication, and the IMF working papers are research in progress by their authors' own statement, so they
may be revised.

A standing rule that has stopped serving: the upstream corpus's habit of pairing a headline figure with a
computed ratio the source never made. That habit produced the 95-to-99 percent claim, the KC Fed
mis-scaling, and the $317 million challenge error. Any future draft should require every number to carry
either a verbatim passage or a named tool computation that is reproducible from the stored capture.