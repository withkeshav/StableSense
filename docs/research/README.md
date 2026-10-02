# Research method and public material

StableSense publishes the method used to evaluate claims, alongside selected
research outputs and their citations. Complete working records are retained
privately, not included in the current public repository.

## Read the method

- [Research methodology](../research-methodology.md): evidence, formulas,
  independent challenge, decisions, finality and updating.
- [Claim template](public/claim-template.md): fields for a traceable claim revision.
- [Publication checklist](public/publication-checklist.md): checks for source
  support, numerical scope and a clearly identified publication revision.

The report source, citations, chart data and site assets are in the root
`research/` directory. The [2026-10-02 published report](../../research/public/state-of-stablecoins-2026-10-02.md)
states source dates, calculations and unresolved findings. It is also served at
`/research/state-of-stablecoins-2026-10-02.md`. Updating the method alone does not
update the findings or establish that historical observations are current.

## What is not published here

Raw captures, transcripts, working ledgers, drafts, reviewer notes, internal plans,
legal-readiness drafts and agent instructions are not publication material.
Public citations identify the original publisher, relevant context and source date;
private capture paths are not substitutes for usable citations. Selected supporting
passages require context and reuse-rights checks. Private evidence retention is
not full public reproducibility, and should not be described as such.

Earlier working records were pushed publicly. Removing them from the current
files does not remove them from older Git commits, caches, forks or downloaded
copies. This cleanup preserves history and is not retroactive confidentiality.

## Limits and permissions

The method includes accounting and evaluation formulas with explicit assumptions.
Its synthetic arithmetic examples are not findings about the stablecoin market.
The benchmark protocol is proposed, not established by measured research runs.
Updating is a documented procedure, not a claim that an automatic updater exists.

Software is licensed under Apache-2.0. Original research content remains governed
by [RESEARCH-LICENSE](../../RESEARCH-LICENSE); it has not been given a separate open
research license. Third-party material retains its own rights. Publishing a method,
template or citation does not grant new permissions to reuse other people's work.

Before publishing code or documentation, run
`node scripts/verify-public-tree.mjs --index` for the staged tree and
`node scripts/verify-public-tree.mjs HEAD` for the committed tree. The check limits
published paths to website material and explicitly listed documents. It is not a
content or secret scanner; allowed files still require content review.
