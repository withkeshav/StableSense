# Operator handoff

## Current continuation, 2026-10-02

This section supersedes the current-state assertions in the historical R3 handoff below.
The operator approved the gap order and allowing inconclusive narratives with clear
citations or footnotes. That is not acceptance of the findings or publication approval.

Current package: 53 claims, 37 capture entries, 15 hashed companions.
The build now applies `evidence/weak_section_updates.py` after the preserved R3
baseline. `review-disposition.json` preserves earlier findings and superseded claim
records under `approved_continuation`.

Material changes:

- Later publisher-corrected KC Fed HTML and PDF reader differ on bank Treasury share,
  per-dollar reduction and loan contraction. HTML is the documented later revision,
  but still does not reconcile its net-demand arithmetic. Intended coefficient
  UNRESOLVED. PDF cache freshness unknown; no corrected forecast is asserted.
- Fed funding mechanisms and BIS short-bill yield evidence added. Actual funding mix,
  net new Treasury demand and fiscal-debt implication remain UNRESOLVED.
- Circle's stored filing discloses partial Coinbase allocation terms and separate
  Coinbase distribution costs. The earlier no-formula assertion was too broad.
  Comparable Open Standard terms and superiority remain UNRESOLVED.
- RWA 56 percent is value-weighted, not count. Publisher summary defines zero weekly
  transfers; 910/1,289 is 70.60 percent by count. Full methodology and economic idle
  conclusion remain UNRESOLVED. Represented assets may deliberately be ledger-like.
- Original Circle OCC order captured: preliminary conditional approval only. Current
  final authorization remains UNRESOLVED. GENIUS statutory commencement mechanics
  established; actual final-rule trigger remains UNRESOLVED.
- Invalid flat-integration-count falsifier removed. OUSD attribution requires partner
  balances, qualifying use and a credible comparison, not supply or integration count alone.

Funding-source follow-up checked the Fed note's cited research: aggregate MMF/monetary
responses and within-stablecoin flight-to-safety do not identify purchaser funding shares.
The separate macroeconomic source models fiscal-space trade-offs, not an observed fiscal
dividend. Quantitative decomposition remains UNRESOLVED. Collection stops here unless
actual origin-asset data emerges. Independent continuation review is now reconciled.

BUIDL-specific primary AUM, x402 commerce residual, original Bridge order/current
status, OUSD adoption series and aligned market-cap comparison remain UNRESOLVED.
Securitize's captured platform AUM is not substituted for BUIDL fund AUM.

Verification commands, from this record root:

    python3 final/evidence/verify_continuation.py
    python3 final/evidence/verify_captures.py

Measured: manifest 37 entries and 15 companions, zero mismatches;
two rebuilds byte-identical for claims, manifest and arithmetic; passage verifier
PASS 53/53. Software checks: `npm test`, 203 tests passed in 12 files, exit 0;
`npm run build`, exit 0; `git diff --check`, exit 0. Current actual command output is
retained in `final/reconciliation-verification.json`; `final/continuation-verification.json`
preserves the earlier pre-reconciliation run. Independent review findings
and their parent dispositions are in `continuation-review-findings.json` and
`continuation-reconciliation.json`. The revised draft has parent verification,
not a second independent review. Research draft complete, not operator-accepted.

Reconciliation corrects SS-085 origin provenance, x402 subset-removal arithmetic,
KC Fed version weighting, missing Circle secondary reporting and citation paths.
It also separates RWA date/denominator sources and adds platform-AUM and OCC claims.
The reviewer was not accepted wholesale: removing an Arbitrum contract from the
containing five-chain total is valid, and the KC Fed 0.42 parenthetical is other
bank assets, not an explicitly corrected net-demand result.

Scope observed: research only, no deployment, site edits, commits or pushes.
License and Cloudflare processor decisions remain settled. The known dev fallback
in `src/config.js` is untouched. All continuation changes are uncommitted.

## Historical R3 handoff, preserved below

The counts, routing state, old interpretations and pending operator decisions below
are historical, not a description of the current package. Current findings and open
gaps are in the section above and `limitations-and-next-update.md`.

Task: t_88335186 (R3, reconciliation and checked handoff, of the approved native-only recovery plan)
Supersedes: the R1 handoff that was written into this same file.
Completed: 2026-10-02
Status: research deliverables complete and checked. NOT operator-accepted, NOT approved for
publication, NOT a compliance statement.

## What this is

A corrected, source-traceable synthesis of the stablecoin research, built only from captures stored
in `docs/research/2026-10-01-state-of-stablecoins/`. The chain was R1 (draft), R2 (independent
challenge on a free LongCat route), R3 (this pass: reconcile, re-verify, hand over). R2's
challenge and findings are preserved unchanged in `final-review/`, and every finding it raised is
dispositioned in `final/review-disposition.json` against the actual capture.

Nothing here is approved. Marking the card complete means the research deliverables are built and
checked. Operator acceptance is a separate decision you have not made.

## Files produced (all under `docs/research/2026-10-01-state-of-stablecoins/final/`)

| File | What it is |
|---|---|
| `synthesis.md` | The report. Corrections, landscape, Open USD, RWA, connections, regulatory state, ruled-out claims, honesty boundary. |
| `claims.json` | 41 claims. Each with unique ID, kind, topic, source URL, as-of, capture date, durable source path, exact passage, scope and exclusions, uncertainty and contrary evidence, and a falsifier. |
| `evidence-manifest.json` | 25 captures copied into `final/evidence/`, each with SHA-256 and original path. |
| `evidence/` | The captures themselves, plus `build_claims.py` and `verify_captures.py`. |
| `verification.json` | Machine-checked output of `verify_captures.py`. Currently PASS at 41/41. |
| `verification-audit.json` | R3's own record of every check it ran, with actual output, keeping the factual evidence checks and the software integrity checks apart. |
| `review-disposition.json` | R2 findings F-001 to F-006 each linked to corrected, confirmed or unresolved, with capture evidence; plus three R3 findings of its own. |
| `limitations-and-next-update.md` | What this cannot establish, and what to do next, ordered by consequence. |
| `legal-and-contribution-readiness.md` | Separate appendix on privacy, licensing and contribution credit. Applicability items UNKNOWN, no compliance claim. |
| `operator-handoff.md` | This file. |

`review-disposition.json` did not exist when R1 finished; the plan made it R3's deliverable, and it
is the file that closes the R2 loop.

## Measured state, not asserted state

Run these to reproduce. All three are the project's own scripts.

    python3 final/evidence/build_claims.py     # rebuilds captures, ledger, arithmetic
    python3 final/evidence/verify_captures.py  # re-verifies the ledger
    cat final/evidence/arithmetic.json         # every computed number

Measured in this R3 session, after every edit:

- 41 claims, 41 unique IDs, zero duplicates.
- 41 of 41 exact passages sliced verbatim from their referenced capture.
- 41 of 41 source paths resolve inside this project. No cache-only references.
- 25 captures copied, each hashed in the manifest. I recomputed all 25 SHA-256 values against the
  files on disk: zero mismatches, 25 distinct copy names.
- `verify_captures.py`: PASS, exit code 0.
- `build_claims.py` run twice against the pre-existing files: `claims.json` and
  `evidence-manifest.json` byte-identical both times, so the build is deterministic.
- All 13 headline arithmetic values recomputed independently of `build_claims.py` and matched.
- Zero em dashes and zero en dashes in every prose file under `final/`.
- Software integrity, recorded separately because it is not evidence for the research: `npm test`
  203 tests passed in 12 files, exit 0. `npm run build` built in 753ms, exit 0. `git diff --check`
  clean, exit 0.

Full actual output for every check is in `final/verification-audit.json`.

One point of method worth stating plainly: the passages were not retyped. `build_claims.py` locates
an anchor string inside each stored capture and slices the surrounding text, so a passage that is
not present cannot become a quote. Seven claims failed this on the R1 first run and were fixed by
correcting the anchor or the capture reference, not by loosening the check.

## What R3 changed, beyond disposing R2's findings

Three defects were found by R3 itself. They are in `review-disposition.json` as R3-01 to R3-03, and
the first one is the one I would want a reviewer to look at hardest:

1. **The evidence extractor could hide evidence (R3-01).** The markup stripper treated a literal
   "<" in prose as a tag opener. Measured: it swallowed 3,716 characters of the Spark Money RWA
   capture, including the BUIDL "$2.4 billion as of May 2026" sentence, and 26,586 characters of the
   IMF WP/26/44 capture. The verifier could not catch this, because it checks that a sliced passage
   exists in a capture, not that the capture was extracted completely. Fixed with a name-anchored
   regex; the broken normaliser is retained so the defect stays reproducible.

2. **The x402 volume floor of $996 thousand was never sourced (R3-02).** It came from a prose
   research draft and matches neither the volume nor the transaction count of any capture. The real
   x402scan page capture was never copied into `final/evidence/`, and its totals sit inside `<script>`
   tags that the stripper removes, so no claim could have rested on it. Now it does: SS-085, with the
   dashboard's own totals ($974,215.14 at six decimals, mean $0.079247 per transaction) and the
   caveat that its window is not stated in the capture.

3. **The x402 bot attribution rested on one firm (R3-03).** Two corroborating captures were already
   in the record and unused: Chainalysis on PING pay-to-mint farming (SS-083), and Visa and Artemis
   on wash-adjusted volume (SS-084). Added, with their scope differences stated rather than averaged
   away.

## The corrections that changed conclusions

From R1, five of which overturned something a prior review had already signed off. R3 re-verified
all eight named consequential corrections and confirmed each against the capture.

1. **Kansas City Fed arithmetic.** The article's own components (0.50 up, 0.08 down) give 0.42. It
   states 0.30. Unexplained gap of 0.12. Both parent reviews accepted the stated 0.30. R3 adds that
   the Bulletin has already had one arithmetic correction applied, in September 2026, and that this
   gap is not the error it fixed. Reported as a discrepancy, with no headline built on either figure.

2. **GENIUS reserves are not T-bills only.** The enrolled statute text was already in the record.
   Eight eligible reserve classes, with the 93-day Treasury provision among them. Refuted against
   primary text.

3. **Open USD's yield-sharing is not structurally unique.** Circle's own Q2 2026 10-Q states that
   distribution costs to key distributors are "directly impacted by the amount of USDC held on their
   respective platforms". Distribution and transaction costs run 0.6146 of reserve income in the
   quarter and 0.6179 in the half year. This undercuts the central promotional claim and was never
   previously tested.

4. **The x402 $317 million figure is the source's own, verbatim.** An earlier review challenged it
   arithmetically and was mistaken; the 97.5 percent is Arbitrum-only while the 2.59 billion is a
   five-chain total. The review's own warning about scope was then violated by its own correction.

5. **The 95-to-99 percent non-payment claim was invented.** No capture contains it. BCG and Allium
   report about 7 percent on the broad definition (4.2/62 = 6.77 percent, tool-computed) and 0.565 to
   0.887 percent on a narrow goods-and-services definition the source itself calls a lower bound.

Also corrected: the IMF $300 billion figure is lost equity market value of payment firms, not
Treasury demand, and the Treasury-yield result belongs to a different working paper. Holding OUSD
gives no direct legal title to reserves and no instruction right; reserve earnings accrue to
partners, not holders.

R3 also corrected two of R2's own dispositions after re-reading the captures. R2's F-002 said to
extend the passage to include the $2.7 billion BUIDL figure; that figure is not in that capture at
all, so the claim was re-sourced instead (SS-072b) and the mis-attribution is recorded. And R2's
F-006 checked synthesis.md only; the real dash exposure is inside 13 ledger quotations, which are
source text and left intact.

## What stays unresolved, and why that is the correct outcome

Ten named gaps are in `limitations-and-next-update.md` with what would close each. Eight are listed
in `review-disposition.json`. The five that matter most:

- **BUIDL primary AUM.** Three differently dated secondary figures ($2.5-2.9bn July 2026, $2.7bn
  August 2026, $2.4bn May 2026), none a primary issuer disclosure. No AUM figure is asserted.
- **RWA idle-value definition.** The 56 percent is a count over assets above $100,000, with no
  stated definition of idle. Not publishable in any form until the original analysis is retrieved.
- **True x402 commerce volume.** Bridge and bot shares are measured from three firms; the commerce
  residual is estimated by no source in the record.
- **Stablecoin funding-source decomposition.** The missing input for gross-versus-net Treasury
  demand, which is the weakest supported section.
- **GENIUS commencement mechanics and primary OCC orders.** Statute text is stored; commencement is
  not verified and no OCC order is in the record.

Two structural findings belong on the record:

- Several files in `native-rwa/evidence/` and `native-market/evidence/` are researcher-authored
  digests, not stored page captures. A digest cannot verify its own quotes. No final claim rests on
  one, and the verifier rejects that shape.
- Claims SS-020 to SS-022 draw on IMF working papers, which the authors state are research in
  progress. Single-source and revisable. SS-102 is a scenario computed on the Kansas City Fed
  capture's contested figures, not an IMF source.

## What an independent reviewer should attack first

1. **The Circle distributor-cost reading (SS-060, SS-061).** Widest consequence, and it rests on one
   filing where distribution and transaction costs are combined, so the distribution-only portion
   cannot be isolated.
2. **The KC Fed discrepancy (SS-001, SS-002).** Confirm 0.42 against 0.30 directly in the capture,
   and confirm the September 2026 update note says what SS-001 says it says.
3. **The GENIUS clause enumeration (SS-010)** against the enrolled text, particularly the tokenized
   reserves clause.
4. **The R3-01 extractor fix itself.** Re-run `flat_legacy()` against the fixed normaliser over the
   same captures and confirm the recovered character counts. If the extractor can still hide
   evidence, the whole ledger is softer than it looks.
5. **Every place this draft still rests on a single capture**, listed in section 2 of the
   limitations file.

## Boundaries observed

Research only, under `final/`. No site or app edits, no version changes, no deployment, no git
commits or pushes, no credential changes, no new bots or child tasks, no browser extensions.
Original passes, captures, parent reviews, legal drafts and interrupted-attempt history are all
preserved unchanged; this work is additive. Evidence lives inside the project, not in a cache.

Software is Apache-2.0. `RESEARCH-LICENSE` carries a scope preamble that was added in this work and
is new and untracked; whether it states your intended research terms is your decision, and it is
recorded as such in `legal-and-contribution-readiness.md` section 1. The privacy and
contribution material is a separate appendix and makes no compliance claim.

Route for this task: free-only (`custom:litellm` / `space-bunny-free-vb`), no paid fallback, no
OpenRouter.

## Routing cleanup, with readback

The task body authorized restoring only the default-profile `fallback_providers` after completion and
after confirming no other active StableSense free-only task remained. Both conditions were checked and
the cleanup was performed.

Pre-check: queried the board database directly, because a child context cannot use the `hermes kanban`
CLI. All five StableSense cards: t_1f6499a2 done, t_dac7756d done, t_c88a2124 done, t_acfe23ef done,
t_88335186 running. **This task was the only non-terminal card**, so no other StableSense task needed
the free-only route.

Before: `hermes config get fallback_providers --json` returned `[]`.
Command run: `hermes config set fallback_providers '[{"provider":"ollama-tower","model":"ornith-9b:64k"}]'`,
exit 0.
Readback after: `hermes config get fallback_providers --json` returns
`[{"provider": "ollama-tower", "model": "ornith-9b:64k"}]`.

Left unchanged, and verified unchanged by reading `/mnt/ai-data/projects/agent-hermes/home/config.yaml`:

- Primary model: `default: deepseek-v4.1-flash`, `provider: custom:litellm`, alias `ds`. Untouched.
- Delegation block: `model: space-bunny-free-vb`, `provider: custom:litellm`, `fallback_providers: []`,
  `request_overrides.extra_body` = `{fallbacks: [], disable_fallbacks: true, num_retries: 0}`. Exactly
  the measured starting state the task body specified, and deliberately not switched to a paid or
  shared route.
- The dedicated free-only Bunny alias is intact.
- Custom monitor job `4de29bb6b8b3` reads `[paused]`, as required.
- No other profile touched. No historical record or evidence deleted.

## Recommended next step

Read `final/synthesis.md` and `final/review-disposition.json` and decide whether the ten open gaps
are worth closing before anything is shown outside this repository. My recommendation is to leave it
internal: the report's weakest support is the US-debt section, and it is weakest precisely where the
source disagrees with itself.

## Parent verification after R3 (2026-10-02)

The R3 pass above was resumed from the paused card and completed. The parent then re-verified it
independently rather than trusting its summary. Everything R3 measured reproduced:

- `verify_captures.py` re-run by the parent: 41 claims, 41 unique, 41/41 passages verbatim, PASS,
  exit 0, at the current ledger hash.
- All 25 manifest SHA-256 values recomputed against the files on disk: 25 ok, 0 mismatch, 0 missing.
- The extractor-defect measurement reproduced exactly with the module's own `flat()` and
  `flat_legacy()`: Spark 18,408 to 22,124 (3,716 recovered), IMF WP/26/44 40,460 to 67,046
  (26,586 recovered). The inherited figures of 3,730 and 26,699 did not reproduce, confirming R3's
  correction.
- Arithmetic recomputed independently: KC net 0.42 and gap 0.12; Circle ratios 0.6146 and 0.6179;
  BCG 6.77 percent; IMF scaling -18.57. All matched.
- `npm test` 203 passed in 12 files (exit 0); `npm run build` clean (exit 0); `git diff --check`
  clean (exit 0). Software checks, not research evidence.
- Routing cleanup read back: main `fallback_providers` now the authorized local entry, delegation
  left free-only, monitor `4de29bb6b8b3` paused, primary model untouched.

**Three defects the parent found in the completed package and corrected.** R3's own consistency
sweep resolved claim IDs against the ledger's id set, which cannot catch a wrong attribution that
still names a real ID. All three are prose fixes under `final/`; the ledger and captures are
unchanged and the verifier still passes at 41/41.

1. `operator-handoff.md` listed `SS-102` among "claims SS-020 through SS-022 and SS-102 draw on IMF
   working papers". Measured: `SS-102` sources `final/evidence/kc-fed-stablecoin-treasury.json`, the
   Kansas City Fed capture, not an IMF paper. Corrected to name only SS-020 to SS-022 as IMF sources
   and to state that SS-102 is a scenario on the KC Fed figures.
2. The same misattribution in `review-disposition.json` finding F-006's `r3_note`, which named
   `SS-102` in its list of IMF-paper quotations. Corrected the same way.
3. `operator-handoff.md` stated "`RESEARCH-LICENSE` terms are preserved and unchanged", which
   contradicts `legal-and-contribution-readiness.md` section 1, where R3 itself measured that
   `RESEARCH-LICENSE` is a new untracked file carrying an added scope preamble. The appendix was
   corrected and this line was not. Corrected to state the measured position and route it to the
   operator as a terms decision.

The first two are instances of the failure mode this package exists to catch: a summary statement
that is plausible, names real evidence, and is nonetheless not what the evidence says. They are left
recorded here rather than silently fixed so the same class can be looked for elsewhere.
