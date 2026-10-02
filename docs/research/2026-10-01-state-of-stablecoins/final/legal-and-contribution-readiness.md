# Legal, privacy and contribution readiness

**This is a separate appendix. It is not part of the stablecoin research and makes no claim of legal
compliance.** Nothing here is legal advice. Every statement below is either a measurement from this
repository, a clearly labelled UNKNOWN, or a correction of a defect identified in
`docs/legal-readiness/parent-review.md`. Current law, commencement dates and all other consequential legal
questions remain pending primary-source verification and, where applicable, operator or counsel input.

Record: `docs/research/2026-10-01-state-of-stablecoins/final/`
Reviewed drafts: `docs/legal-readiness/` (policy-draft.md, disclaimer-draft.md, readiness.md,
data-inventory.json, law-ledger.json) and `docs/legal-readiness/parent-review.md`
Reconciled: 2026-10-02, R3.

**Status of the statements below.** Section 1 was re-measured by R3 reading the files directly. The
privacy corrections in section 2 are of two kinds and they are not equally strong: where a claim is
about this repository, R3 or the parent review measured it here; where a claim is about external law
or the live deployment, it rests on a source URL or on a prior reviewer's measurement and is labelled
as such. No URL in this appendix is backed by a stored primary capture with a sliced passage, which
is section 2.7 restated as a limit on this file specifically. Treat the external-law items as leads to
verify, not as findings.

---

## 1. Licensing: measured, and its current state

Measured by R3 on 2026-10-02 by reading the files and the working tree directly:

| Item | Measured value | Source |
|---|---|---|
| `LICENSE` | Apache License, Version 2.0, January 2004 | `LICENSE`, read directly |
| `package.json` license field | `Apache-2.0` (changed from `SEE LICENSE IN LICENSE`) | `package.json`, read directly |
| `NOTICE` | Present, untracked in git. Names the copyright holder, separates research from software, and disclaims branding-as-endorsement | `NOTICE`, read directly |
| `RESEARCH-LICENSE` | Present, untracked in git. Source-available terms plus an added scope preamble | `RESEARCH-LICENSE`, read directly |

**Software is Apache-2.0.** Git shows `LICENSE` as modified with 203 insertions and 37 deletions: the
previous source-available text was replaced by the Apache-2.0 text, and `package.json` was updated to
match. Both changes are uncommitted in the working tree.

**Two corrections to the earlier appendix, on the record's own side.** The previous version of this
file said research terms were "preserved exactly as found" and that no new research permission had
been adopted. Measured, that is not accurate. `RESEARCH-LICENSE` is a new untracked file whose text
carries an added preamble stating the research scope, that software source files inside
`research/` and `docs/research/` are Apache-2.0 rather than source-available, and that no separate
open research license has been adopted. That preamble is a scope clarification, not a relicense of
third-party material, and `RESEARCH-LICENSE` states it does not relicense source captures. Whether
that clarification is the terms you intended is an operator decision, not a research finding, and it is
recorded here rather than treated as settled.

Consequences that are settled: software source files remain Apache-2.0, third-party material retains
its own licences, and no third-party capture has been relicensed. Changing either licence requires
operator approval and is out of scope for this work.

## 2. Privacy appendix: corrections to the drafts

The parent review found real defects. Most are corrected or bounded here. Two of its points could not be
checked inside this repository and are recorded as measurements with limits rather than as findings.

### 2.1 The DPO requirement is not universal. Corrected, with a citation R3 could not confirm.

The draft stated a DPO "when required by DPDP", and `readiness.md` listed appointing one as a roadmap
item for tranche 3. The parent review is right about the substance: the Data Protection Officer
obligation attaches to Significant Data Fiduciaries, not to the commencement of substantive
provisions generally. What is corroborated inside this repository is
`docs/research/2026-10-01-dpdp-act-rules-status.md`, which records section 10 as imposing additional
SDF obligations including an India-resident Data Protection Officer, and Rule 12 as an SDF duty. The
parent review's further citation of "section 2(l)" and "section 10(2)(a)" rests on a MeitY PDF at
`https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf`, which is not
stored as a capture here; R3 could not confirm those subsection numbers and does not repeat them as
verified. Section 10, not the subsection numbering, is the load-bearing citation.

Corrected position: an ordinary contact-person obligation and a notified-Significant-Data-Fiduciary
Data Protection Officer obligation are separate. The draft should not require a DPO merely because
substantive provisions commence. Whether StableSense is or would become an SDF is a separate question
that this record cannot answer.

### 2.2 Lawful-basis analysis is ungrounded. Not corrected here; labelled unresolved.

The draft's table asserts "contractual necessity" and "legitimate interest" as the basis for each
processing activity. Those are GDPR framings. Section 7 of the DPDP Act contains specified uses, not a
generic service-delivery or security legitimate-interest basis, and the draft does not establish how each
activity falls within a particular clause. Importing GDPR terminology into Indian law is the error.

Position: the lawful-basis mapping is **unresolved** and needs activity-by-activity analysis against the
statutory clauses. No corrected table is asserted here, because doing so properly is legal work requiring
primary-source review, and this appendix does not perform it.

### 2.3 Live HTTPS: the sample nginx config is not evidence about production. Corrected.

`policy-draft.md` and `readiness.md` present "no TLS configured in nginx config (port 80 only)" as a
security gap, which reads as a statement about visitors. It is a statement about a configuration file in
this repository. The parent review measured that `https://stablesense.withkeshav.com/` returns HTTP/2 200
over HTTPS with `server: cloudflare`, which directly contradicts presenting the sample config as proof
that public visitors lack HTTPS.

Corrected position: a sample configuration file is not the live deployment. The origin's TLS termination
and current production settings are **unmeasured** in this record, because that requires access to the
host, which research scope does not include.

**Cloudflare must be added to the service inventory, and it is absent.** R3 checked
`docs/legal-readiness/data-inventory.json`: its `third_party_providers` array lists Google Fonts and
others, but **no entry for Cloudflare**, even though Cloudflare is the tier terminating visitor TLS and
is therefore a data processor handling visitor IP addresses and request metadata. The parent review
measured `server: cloudflare` on the live response and recorded that the returned headers also contain
NEL reporting. Both are prior-reviewer measurements, not re-measured by R3: that requires a live network
request, which is outside research scope here. The inventory gap is measured, because it is a fact about
a file in this repository.

Consequences for the inventory once Cloudflare is added: visitor-facing processing location, origin
encryption, cache-log handling and any NEL reporting all fall in scope and are currently unexamined.

### 2.4 Missing personal-data categories. Corrected.

The draft claims "no user accounts, no forms, no authentication" and that no directly identifying personal
data is collected. That is true of the application and false as a blanket statement about the planned
contribution process, which necessarily involves names, contact details and optional social or website
links. A privacy notice published before contributions open would be wrong on its face.

Separately, request metadata is described in the draft as not personal data. It can relate to an
identifiable person once associated with an IP address or other identifier, so it cannot be categorically
excluded. R3 confirmed the inventory contradicts itself here by reading
`docs/legal-readiness/data-inventory.json` directly: `personal_data_summary.conclusion` says the
application "collects no directly identifying personal data", while three entries under
`external_network_requests` and two under `logging` set `personal_data` to "IP address (network
identifier)" or "IP address". The summary line and the tables disagree inside one file.

`personal_data_summary.cookies` is also `null` rather than a stated finding, and the file carries its
own `discrepancies` array. A null is an absent measurement, not a measured absence, and section 2.5
explains why it cannot be read as one.

### 2.5 Code-only observation cannot prove a missing live control. Corrected.

The draft concludes there is no cookie use, no additional edge services, and no log retention or rotation.
None of those can be established by reading repository code. What can be said: the repository configures
no cookie-consent mechanism and no retention policy. Whether the deployed site sets cookies, whether
Cloudflare or other edge services add processing, and what log retention exists at the host are all
**UNKNOWN** and require host-level inspection.

### 2.6 Mandatory controls without applicability analysis. Labelled, not asserted.

The readiness file lists age-gating, font consent and response deadlines as gaps. Automatic mandatory
age-gating, mandatory font consent and universal response deadlines each need an applicability analysis
before they become requirements. Implementing a control that does not apply is itself a defect: it can
force collection of personal data that is not needed. No control is prescribed here.

### 2.7 Source URLs are not an evidence chain. Acknowledged.

`law-ledger.json` cites sources. That is not the same as a durable primary capture with an exact
supporting passage for commencement, deadlines and retention requirements. Board appointment status in
particular cannot be inferred from not finding a notification. Adding primary captures for the
consequential claims is outstanding work, and this appendix does not claim those captures exist.

---

## 3. Operator inputs that remain UNKNOWN

These block a publishable policy and nothing else. The core stablecoin report does not depend on any of
them, and none of them was invented or guessed.

| Item | State | Why it matters |
|---|---|---|
| Operator identity for privacy notices | UNKNOWN | A notice must identify the data fiduciary. |
| Privacy contact address or method | UNKNOWN | A contact route is required by the drafts' own intent; no address was fabricated. |
| Retention periods for server logs and backend data | UNKNOWN | Cannot be set without operator policy. |
| GDPR applicability and EU representative | UNKNOWN | Depends on operator establishment and user base; not inferred. |
| Significant Data Fiduciary status | UNKNOWN | Determines the DPO obligation, per section 2.1. |
| Live cookie and edge-service behaviour | UNMEASURED | Requires host-level inspection. |
| Live log retention | UNMEASURED | Requires host-level inspection. |
| Whether the `RESEARCH-LICENSE` scope preamble states the intended research terms | OPERATOR DECISION | Section 1: the preamble is new and untracked, and it narrows what the research terms cover. It is a terms decision, not a research finding. |
| Whether Cloudflare, and any other live edge service, belongs in the published processor inventory | OPERATOR DECISION | Section 2.3: it is absent from the inventory, but adding a processor to a published list is a publication choice. |

## 4. Contribution credit policy

Credit is granted **only when a contribution is accepted and merged**. A submitted but rejected
contribution earns no credit, and no request for credit obliges the project to accept the contribution.

For an accepted contribution, the project records:

1. **Name**, as the contributor wishes it displayed.
2. **Optional website or social handle**, only if the contributor supplies one.
3. **A description of the contribution**, factual and short.

Deliberately excluded:

- No invented or inferred contact details. An email address is never constructed from a name, a GitHub
  username or a domain pattern.
- No claim of employment, endorsement or affiliation beyond what the contributor states.
- No retroactive attribution and no removal of credit except at the contributor's request.

Where a contribution carries third-party material, the contributor warrants they have the right to
contribute it under Apache-2.0. Research material additionally falls under `RESEARCH-LICENSE`, and a
contribution that would change either license needs operator approval rather than ordinary review.

## 5. Boundary statement

acknowledged gap.

This appendix corrects measurement and framing defects found by review, and records two operator
decisions rather than resolving them. It does not establish compliance with the DPDP Act, the GDPR, the
GENIUS Act or any other law, and it does not certify the site's security posture. It asserts no
remediation and deploys nothing. Where primary sources are absent, the position is UNKNOWN rather than
a confident sentence, because a wrong confident sentence in a privacy document is worse than an
acknowledged gap.

R3's own limit on this file: no statement in it is backed by a stored primary capture with a sliced
passage, unlike the stablecoin research ledger. The repository-measured items (section 1 licensing, the
Cloudflare inventory gap in 2.3, the inventory self-contradiction in 2.4) are facts about files in this
repo and can be re-checked by reading them. The external-law items (2.1 subsection numbering, 2.2
lawful basis, commencement, deadlines, retention) rest on a prior reviewer's reading of sources not
stored here, and are leads to verify rather than findings.