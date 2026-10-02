# StableSense research methodology

Research turns a question into traceable evidence and a challenged synthesis.
This document describes the method, not an internal operating manual or a
claim that the method has already passed a research benchmark.

## Scope and records

Record the question, purpose, audience, exclusions, deliverable, stopping condition
and what would overturn the proposed answer before collection. Ask one scoped
question where missing context changes the work. Retain source captures, a claim
ledger, synthesis, independent challenges, dispositions and acceptance decisions
as a complete versioned evidence record.
The public repository holds this method, templates and approved publication material,
not the raw working archive. The public research index is [research/README.md](research/README.md).
Temporary notes are not a durable evidence store.

## Independent research and review

Run three genuinely independent passes for research-heavy content, then reconcile
per topic. Assign distinct roles, questions, competing theses and falsifiers.
Record the researchers, methods and tools used. When models assist the work,
record their actual identities and limitations. Repeating a pass with the same
model does not establish model diversity, and model agreement is not independent
source corroboration. Reviewers should inspect original evidence, not only the
first researcher's explanation.

## Evidence and numeric claims

Each material factual claim requires a durable capture, working source locator,
exact supporting passage, capture time, explicit data as-of date, scope, exclusions,
uncertainty, contrary evidence and falsifier. Verify capture paths exist and quoted
passages match stored content. A successful retrieval does not prove claim support.
Keep legal text, issuer statements, independent reporting and observations distinct.
Compute displayed figures and chart prose from the actual dataset using tools.

Where measures disagree, explain their dates, definitions and denominators. Report
a range only when the measures are meaningfully comparable. Do not average incompatible
figures or treat model consensus as source corroboration. Flag unknowns explicitly.

## Retrieval

Reuse stored captures where they answer the dated question. Record the retrieval
method, original source URL, source version, capture time and any limitations.
If the reader omits content rendered by JavaScript, obtain that content through
an appropriate reader and label the extraction method. Disclose truncation and
obtain the relevant full context before treating text as absent. Record retrieval
failures as unavailable evidence. AI-derived extraction is not raw evidence.
Preserve original captures when recovering missing or changed sources; a current page
does not establish what it said earlier. Do not publish third-party raw captures
merely because they are stored in this repository.

## Narratives, challenge and acceptance

Separate factual findings, attributed opinions, testable inferences and unresolved
hypotheses. For causal connections, state the mechanism, competing explanation,
counterfactual, confounders and test that could overturn it. Correlation, transfer
volume and gross issuance do not alone establish incremental economic demand.

Have independent reviewers inspect stored sources, not paraphrased excerpts. Use a
separate planted-fault fixture to test the challenge process, never plant falsehoods
in the factual ledger. The lead re-checks accepted reviewer findings against captures
and records dispositions and unresolved disagreement without overwriting history.
Manually verify high-impact claims against primary sources before publication.

Research completion means the brief is covered with verified evidence or explicitly
identified gaps, challenges have dispositions, and the synthesis exposes remaining
uncertainty. A collection report alone is not completion. Owner acceptance, site
updates and deployment are separate actions. Reuse requires freshness review and
an explicit revalidation trigger.

## Claim lifecycle and decisions

The unit of research is a claim with a revision history, not a whole document with
one confidence score. Use the [claim template](research/public/claim-template.md)
to keep the question, evidence, calculation and decision together.

1. Question: state the proposition, intended use, scope and what would disprove it.
2. Evidence: record source identity, version, dates, locator, exact passage and
   original capture hash. Keep original bytes separate from reader output and
   researcher-authored summaries. Record truncation and extraction limitations.
3. Calculation: record input claim IDs, units, denominator, time window, exclusions,
   formula, command and actual output. A result inherits its inputs' limitations.
4. Challenge: an independent reviewer checks the original context and proposes a
   competing explanation. Each finding names the claim and evidence, not just a concern.
5. Decision: the lead verifies each finding and records accepted, rejected or
   unresolved, with reasons. A reviewer recommendation is not an observation.
6. Finality: freeze a version with its evidence and unresolved gaps. Record the
   owner's separate acceptance and publication decisions. Final means the scoped
   work is closed for that version, not that the facts cannot change.
7. Updating: keep the prior version and append a superseding revision. Recalculate
   dependants and recheck public text before publishing the changed conclusion.

Keep three independent fields instead of flattening them into a confidence grade:

| Field | Recorded values | Meaning |
|---|---|---|
| Evidence disposition | DRAFT, SUPPORTED, UNRESOLVED, CONTRADICTED | The support for this specific proposition in its stated scope |
| Freshness | NOT_REVIEWED, CURRENT_FOR_AS_OF, NEEDS_RECHECK, SUPERSEDED | Whether it may still be used for this dated purpose |
| Publication decision | NOT_REQUESTED, PENDING, APPROVED, WITHHELD | The owner's decision about this revision and surface |

These are recorded decisions, not labels assigned by keyword rules. Where a
decision instrument is used, pass a closed question with its evidence and criteria;
retain the question, actual result, reason and abstention. A failed instrument
returns no invented pick. It cannot grant permission, resolve a factual conflict
by itself or replace the lead's source check. Do not convert model confidence into
publication permission. Record owner approval separately.

An unresolved claim can appear as an attributed narrative when its limitations
are visible and that presentation is approved. It must not become an unqualified
headline, chart caption or numeric input. Failure to retrieve evidence is
UNRESOLVED, not evidence that the proposition is false.

## Formulas and their limits

All terms must use compatible populations, dates, units and definitions. Missing
terms stay unknown, not zero. Equations expose assumptions; they do not establish
causation or supply missing evidence. The examples below are synthetic arithmetic,
not estimates of the stablecoin market. They were calculated with Python Decimal.

### Net additional Treasury holdings

`N = delta(T_issuers) + delta(T_banks) + delta(T_other_investors)`

Use an exhaustive, non-overlapping investor population and the same instrument
definition and time window. Include displaced holdings with their negative signs;
do not count a fund's Treasury holdings again as its investor's indirect exposure.
This accounting change does not by itself attribute the change to stablecoins or
measure demand's effect on yields. Gross issuer purchases are not net demand.

Synthetic example: issuer holdings rise by 80 units, bank holdings fall by 12 and
other investor holdings fall by 28. The net change is 40 units. If the displaced
holdings are unknown, the net is UNRESOLVED, not 80.

### Attributed commerce and unexplained residuals

`C = sum(value(transaction) for transactions with verified commerce attribution)`

`R = V_total - V_excluded`

For C, document the payment or order evidence, chain set, window, asset units,
refund treatment, duplicate handling and classification limits. Report unclassified
value separately. For R, exclusions must be contained in the total, disjoint and
measured in the same scope. A residual is not proof of commerce.

Synthetic example: total value is 100 units and known exclusions are 70. The
residual is 30; commerce value remains unknown without attribution evidence.

### Quiet assets: count and value are different

`quiet_count_share = count(quiet_assets) / count(all_eligible_assets)`

`quiet_value_share = sum(value(quiet_assets)) / sum(value(all_eligible_assets))`

Define quiet by the observed transfer window, not assumed economic inactivity.
Use the same eligible asset set and valuation date for the two shares. Zero
transfers do not show that an asset earned no yield or served no financing role.

Synthetic example: three of four assets are quiet and hold 30 of 100 value units.
The count share is 75%; the value share is 30%. Neither measures economic idleness.

### Source discrepancy

`absolute_gap = abs(x - y)`

`relative_gap = abs(x - y) / max(abs(x), abs(y))`

The relative gap is undefined when both values are zero. Only calculate it after
checking comparable definitions, dates and units. For positive values 20 and 8,
the synthetic relative gap is 60%. It measures discrepancy, not which source is
right. Keep version conflicts visible; a reported range is not a confidence interval.

### Verification coverage

Record a vector of checks, each with its own denominator:

`capture_coverage = claims_with_resolvable_captures / claims_requiring_captures`

`quote_coverage = claims_with_verified_passages / claims_requiring_passages`

`calculation_coverage = reproduced_calculations / calculations_requiring_reproduction`

`review_coverage = claims_with_disposed_review / claims_requiring_review`

A zero denominator is NOT_APPLICABLE with the exclusion reason, not a perfect
score. An unavailable measurement is UNKNOWN. Matching a quotation proves the
quotation occurs in the stored text, not that the source is authentic or the
claim follows from it. Coverage must not compensate for an unsupported central
claim. Do not average these checks into a factual-confidence score.

## Finality and updating

A final revision includes a frozen brief, claim ledger, evidence manifest,
calculation outputs, reviewer findings, dispositions, unresolved register and
acceptance decision. Name the exact commit or immutable package hash. Preserve
source dates separately from retrieval and review dates. Freeze the reviewer
record too; never overwrite it with the lead's preferred conclusion.

For every claim, record its dependencies, last review, next review trigger, owner
and the evidence needed to change it. Review triggers are specific to the claim:
an amended filing, a new attestation, a changed source version, a legal
commencement event, a dataset revision or a named contradictory observation.
Choose any calendar interval explicitly for the intended use; do not invent a
universal expiry period. A historic as-of claim may remain valid historically
while being unusable as a current statement.

When a trigger occurs:

1. Mark the affected claim NEEDS_RECHECK and identify dependent claims, figures,
   captions, summaries and share images. Do not claim a scheduled check ran.
2. Preserve the new source version alongside the old one and record the difference.
3. Recheck support and recompute all affected formulas against the updated dataset.
4. Obtain a fresh challenge for the changed consequential conclusions and dispose
   of it against the original evidence.
5. Create a superseding revision and record what changed, what did not and why.
6. Obtain the separate publication decision, then verify the exact published
   revision. A repo push, site build and deployment are different operations.

If retrieval, calculation or review cannot be completed, retain NEEDS_RECHECK
and the reason. No update status is reported as good without a measurement.
Verifier commands use distinct exits: 0 for measured pass within their declared
scope, 1 for measured failure, 2 when unable to measure. Human support and
publication decisions are not implied by an integrity check's exit code.

## Becoming a benchmark

This is a method and a proposed evaluation protocol, not a proven benchmark.
Passing repository tests or hash checks does not measure research accuracy.

Build a versioned fixture set from author-created synthetic cases or material
whose reuse rights have been checked. Keep third-party rights and permissions
with each fixture. Separate answer keys from researcher inputs; disclose when
a case is synthetic. Do not plant falsehoods in a real research ledger.

Include cases for scope mismatch, denominator changes, duplicate transfers,
count-versus-value confusion, gross-versus-net substitution, truncated captures,
source revisions, legal conditional-versus-final approval, incorrect reviewer
objections and genuine unresolved evidence. UNRESOLVED must sometimes be the
correct answer. An intentionally unsupported claim must not gain support because
the fixture supplies a plausible number.

Before evaluating a run, freeze the brief, fixture version, answer key, methods
compared and scoring definitions. Record actual model/provider, tool access,
source access, fallback events, commands, outputs, cost and elapsed time when
measured. Unmeasured cost or time stays unknown. Have an independent reviewer
check the answer key and disagreement dispositions. Separate formula regression
tests from end-to-end source interpretation and update-propagation tests.

Report these measurements separately, with case counts and denominators:

`false_support_rate = incorrectly_supported_outputs / all_supported_outputs`

`unresolved_recall = correctly_unresolved_cases / cases_requiring_unresolved`

`false_resolution_rate = resolved_outputs_on_unresolved_cases / cases_requiring_unresolved`

`defect_detection_recall = confirmed_planted_defects_found / all_planted_defects`

`review_precision = confirmed_defects_reported / all_reported_defects`

`update_propagation_coverage = correctly_updated_dependants / affected_dependants`

A zero denominator is undefined or NOT_APPLICABLE, not a perfect result. Keep
false support on central claims visible rather than averaging it away with
correct answers to easy cases. Synthetic example: nine correct supported
outputs and one incorrect supported output give a false-support rate of 10%.
That is an illustration of the metric, not a measured method performance.

The synthetic examples can be checked independently with this command:

```bash
python3 -c 'from decimal import Decimal as D; print(D(80)-D(12)-D(28), D(100)-D(70), D(3)/D(4)*100, D(30)/D(100)*100, abs(D(20)-D(8))/max(abs(D(20)),abs(D(8)))*100, D(1)/(D(9)+D(1))*100)'
```

This verifies the illustrative arithmetic only. It does not run a benchmark,
verify source support or measure the actual stablecoin market.

Benchmark status requires actual runs, checked answer keys, measured results,
repeatability and a stated limit on what the fixture set tests. Define acceptance
criteria before seeing results and record who approved them. No arbitrary
confidence threshold or model agreement can substitute for these measurements.
