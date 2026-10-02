# Parent review: privacy drafts not accepted

Status: blocked from publication pending correction and independent source review.

Parent measured that policy-draft.md, disclaimer-draft.md, data-inventory.json,
law-ledger.json and readiness.md all exist. Existence is not correctness.

## Confirmed defects and qualifications

- The DPO appointment requirement is not universal. The primary MeitY DPDP Act
  text defines DPO in section 2(l) by reference to Significant Data Fiduciaries
  and section 10(2)(a). Do not require the operator to appoint a DPO merely because
  substantive provisions commence. Separate the ordinary contact-person obligation
  from notified Significant Data Fiduciary obligations. Source consulted:
  https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf
- Section 7 contains specified uses, not a generic service-delivery/security
  legitimate-interest basis. The draft's legal-basis table has not established
  how each activity falls within a particular clause. Reassess rather than import
  GDPR terminology into Indian law.
- Parent curl HEAD to https://stablesense.withkeshav.com/ returned HTTP/2 200 over
  HTTPS with server: cloudflare. This contradicts presenting absence of TLS in
  a sample nginx config as proof that public visitors lack HTTPS. Origin encryption
  and current production settings remain unmeasured. Cloudflare must be included
  in the live service inventory; the returned headers also contain NEL reporting.
- Code-only observation cannot establish that the deployed site sets no cookies,
  uses no additional edge services or has no log rotation/retention. Do not present
  missing repository configuration as proof of a missing live control.
- Contribution email/GitHub submissions and credit publication involve names,
  contact details and optional social links. A blanket claim of no directly
  supplied personal data does not cover the planned contribution process.
- Request metadata can relate to an identifiable person when associated with an
  IP or other identifier; it cannot categorically be labelled non-personal.
- Source URLs alone are not the required evidence chain. Before acceptance, add
  durable primary captures and exact supporting passages for commencement,
  deadlines, retention requirements and other consequential legal claims. Board
  appointment status cannot be inferred from failure to find a notification.
- Automatic mandatory age-gating, mandatory font consent and universal response
  deadlines need applicability analysis, not blanket statements. Do not invent
  controls or require unnecessary personal-data collection to implement them.

The agent's report remains preserved as a draft. No public policy, compliance
claim or operational remediation is approved by this review. Current law timing
and all other substantive legal claims remain pending primary-source verification.
