# Claim revision template

Use this template to structure a research record. It preserves the evidence,
reasoning and decision for one proposition. Publishing the template does not
publish completed ledgers or approve a claim.

## Identity and question

- Claim ID:
- Revision ID and immutable record location:
- Supersedes revision, if any:
- Author or responsible researcher:
- Proposition, stated precisely:
- Intended use and audience:
- Entity, asset, chain and geographic scope:
- Observation window and data as-of date:
- Units, denominator and exclusions:
- Competing explanation:
- Falsifier and the evidence that could change the answer:

## Evidence records

Repeat for every supporting or contrary source:

- Source ID, publisher, title or filing identifier:
- Original URL and section, page, table or dataset locator:
- Publication date, data date and capture time, separately:
- Source version or revision:
- Capture type: original bytes, reader output or derived extraction:
- Private capture path and SHA-256:
- Exact supporting or contrary passage, with surrounding context:
- Extraction command and actual output location, if applicable:
- Truncation, omitted content or access limitations:
- What this source establishes within the proposition's scope:
- What this source does not establish:
- Reuse rights and any permitted public excerpt:

A source summary is not an original capture. A matching quotation does not prove
source authenticity or semantic support. Missing evidence stays missing.

## Calculation and dependencies

- Input claim IDs and exact revisions:
- Dataset version, units, window, denominator and exclusions:
- Formula and assumptions:
- Command or notebook cell that executed it:
- Actual output, including errors or inability to measure:
- Independent arithmetic check and its actual result:
- Missing inputs and how they limit the result:
- Dependent claims, tables, figures, captions and share images:

Do not fill a missing numeric input with zero or an assumed peg. Distinguish a
measured zero from unavailable data. Label synthetic examples explicitly.

## Challenge and disposition

- Reviewer identity, serving model/provider if relevant, and review record:
- Finding ID, affected claim and proposed correction:
- Original evidence inspected by the reviewer:
- Lead's direct verification of the finding:
- Disposition: accepted, rejected or unresolved:
- Reason and evidence for that disposition:
- Remaining conflict and evidence required to settle it:

Retain the original finding. A rejected finding does not disappear, and a
reviewer's claimed observation is not verified until the lead checks it.

## Decision and finality

- Evidence disposition: DRAFT initially; later SUPPORTED, UNRESOLVED or CONTRADICTED:
- Scope-specific support reason, uncertainty and contrary evidence:
- Decision instrument question, criteria, actual result and abstention, if used:
- Human source verification and responsible lead:
- Freshness: NOT_REVIEWED initially; later CURRENT_FOR_AS_OF, NEEDS_RECHECK or SUPERSEDED:
- Final package commit or immutable hash, when the version is closed:
- Owner acceptance decision and its record:
- Publication decision: NOT_REQUESTED initially; later PENDING, APPROVED or WITHHELD:
- Exact publication revision and surface approved, if any:

These fields record separate decisions. File integrity does not establish support;
support does not establish freshness; acceptance does not authorize deployment.

## Updating

- Last direct evidence review:
- Next review trigger and its rationale:
- Responsible owner:
- New evidence or event that would require rechecking:
- Affected dependants and public surfaces:
- Superseding revision and change reason, when applicable:
- Recalculation command and actual result:
- New reviewer disposition and publication decision:

Preserve prior versions. If an update cannot be measured, record the reason and
retain NEEDS_RECHECK rather than reporting the claim as current.
