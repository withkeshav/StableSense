# StableSense Privacy and Legal Readiness Checklist

**Date: 2026-10-01**
**Status: DRAFT - For operator review**

This document identifies what is known, what is unknown, and what actions are needed before
publishing a privacy policy and disclaimer for StableSense.

---

## 1. Summary

| Area | Status | Notes |
|------|--------|-------|
| Data flow audit | Complete | Source-code audit done; no live deployment verification |
| Browser storage inventory | Complete | localStorage only; no cookies, no PII |
| Network request inventory | Complete | Google Fonts, CoinGecko, same-origin backend, DefiLlama, Helix, OpenAI |
| Logging audit | Complete | Fastify logger + nginx access log capture IP; no DB persistence of IP |
| Indian DPDP legal status | Complete | Act enacted but substantive provisions not yet in force (~May 2027) |
| Privacy policy draft | Complete | Contains [TODO] placeholders requiring operator input |
| Disclaimer draft | Complete | Contains [TODO] placeholders requiring operator input |
| Operator contact info | UNKNOWN | Must be provided by operator |
| Retention periods | UNKNOWN | Must be set by operator |
| DPO appointment | UNKNOWN | Required when DPDP tranche 3 commences |
| GDPR applicability | UNKNOWN | Must be assessed by operator |
| TLS/HTTPS | Partial | Public HTTPS terminated at Cloudflare edge (live header check, server: cloudflare). Origin nginx config is HTTP only; origin-to-edge encryption unverified |
| Rate limiting | Gap | No rate limiting on backend endpoints |
| Log retention policy | Gap | No configured retention or rotation |
| Age-gating | Gap | No mechanism to prevent under-18 use |
| Consent mechanism for fonts | Gap | No opt-out for Google Fonts (third-party IP disclosure) |

---

## 2. What we know (source-backed)

### 2.1 Data collection

- **No user accounts, no forms, no authentication.** The application collects no directly
  identifying personal data (no names, emails, phone numbers, wallet addresses).
- **IP addresses are collected** in server access logs (nginx + Fastify logger) and
  disclosed to third parties (Google Fonts, CoinGecko) via browser-direct requests.
- **Browser localStorage** stores only UI preferences (theme, refresh interval, compact
  mode, tour dismissal, market data cache). No personal data.
- **No cookies, no sessionStorage, no IndexedDB, no service workers.**
- **No analytics or tracking scripts** (no gtag, Segment, Sentry, etc.).

### 2.2 Data destinations

| Destination | Data shared | Trigger |
|-------------|-------------|---------|
| Google Fonts | IP, User-Agent, Referer | Every dashboard page load |
| CoinGecko | Visitor IP (browser-direct) | Coin tab charts/tickers |
| DefiLlama | Server IP | Backend cron job |
| Helix | Server IP, API key | Backend cron job |
| OpenAI (or compatible) | Server IP, API key, aggregated market context | Backend cron job |
| Same-origin backend | Request metadata (IP in logs) | All API calls |

### 2.3 Backend

- SQLite database with **no user/account/identity tables**.
- All endpoints are read-only GET, no authentication, no rate limiting.
- Bound to 127.0.0.1:8787, fronted by nginx.
- Public site is served over HTTPS terminated at the Cloudflare edge (verified by live response header `server: cloudflare` on 2026-10-02); the origin nginx config itself is HTTP on port 80.

### 2.4 Indian DPDP status (as of 2026-10-01)

- **DPDP Act 2023** enacted 11 August 2023, **not self-executing**.
- **DPDP Rules 2025** notified 13 November 2025 (G.S.R. 846(E)).
- **Three tranches:** Tranche 1 (in force Nov 2025, institutional only), Tranche 2 (~Nov 2026,
  Consent Managers), Tranche 3 (~May 2027, all substantive obligations).
- **Current operative law:** IT Act 2000 + SPDI Rules 2011.
- **Data Protection Board:** Legally constituted but unseated as of late August 2026.
- **Supreme Court challenge:** Pending (Venkatesh Nayak v. UoI), no stay granted.
- **Penalties:** Not enforceable until tranche 3.

---

## 3. What is unknown (requires operator input)

| # | Item | Why it matters | Action needed |
|---|------|----------------|---------------|
| 1 | **Operator legal entity name** | Privacy policy must identify the data fiduciary | Operator to provide |
| 2 | **Privacy contact email** | Required for rights requests and inquiries | Operator to provide |
| 3 | **Data retention periods** | DPDP Rule 8 requires defined retention; current logs have no policy | Operator to set and document |
| 4 | **DPO appointment** | Required when DPDP tranche 3 commences (Rule 9) | Operator to appoint before May 2027 |
| 5 | **GDPR applicability** | Determines whether EU rights apply | Operator to assess user base |
| 6 | **Governing law and jurisdiction** | Required for dispute resolution | Operator to specify |
| 7 | **Conflict of interest disclosures** | Required for research integrity | Operator to disclose any holdings/relationships |
| 8 | **AI provider identity** | OPENAI_BASE_URL may point to non-OpenAI provider | Operator to confirm actual provider |
| 9 | **Helix API key ownership** | HELIX_API_KEY is a server-side secret; confirm it is not a personal key | Operator to confirm |
| 10 | **Processing locations** | DPDP cross-border rules require knowing where data is processed | Operator to document all server locations |
| 11 | **Children's privacy approach** | DPDP s 9 requires verifiable parental consent under 18 | Operator to decide: age-gating or minimum age statement |
| 12 | **Consent mechanism for Google Fonts** | Only third-party browser-direct call; no opt-out exists | Operator to decide: self-host fonts or add consent |

---

## 4. Operational gaps and recommended actions

### 4.1 Security gaps

| Gap | Risk | Recommended action | Priority |
|-----|------|-------------------|----------|
| Origin TLS in nginx config | Origin-edge hop unverified (public HTTPS is terminated at Cloudflare) | Confirm origin encryption; terminate HTTPS at origin or verify the tunnel | Medium |
| No rate limiting | API abuse, DDoS | Implement rate limiting (e.g., Fastify rate-limit plugin) | Medium |
| No log retention policy | Indefinite IP storage | Configure log rotation and retention policy | Medium |
| No request size limits | DoS via large payloads | Configure body limits in Fastify | Low |

### 4.2 Privacy gaps

| Gap | Risk | Recommended action | Priority |
|-----|------|-------------------|----------|
| Google Fonts discloses visitor IP | Third-party tracking without consent | Self-host fonts or implement consent mechanism | Medium |
| No privacy policy published | Legal risk, user trust | Complete and publish this draft | High |
| No DPO/contact published | DPDP Rule 9 violation (when tranche 3 commences) | Appoint DPO and publish contact | High (by May 2027) |
| No data retention policy | DPDP Rule 8 violation (when tranche 3 commences) | Set and document retention periods | High (by May 2027) |
| No breach response procedure | DPDP Rule 7 violation (when tranche 3 commences) | Establish breach notification procedure | High (by May 2027) |
| No age-gating | DPDP s 9 risk if under-18 users | Implement age-gating or add minimum age statement | Medium |

### 4.3 Documentation gaps

| Gap | Risk | Recommended action | Priority |
|-----|------|-------------------|----------|
| Stale docs (data-sources.md, api-protocol.md) | Misleading data flow descriptions | Update docs to reflect current architecture | Medium |
| Version mismatch (package.json vs config.js) | Confusion, sync issues | Sync versions | Low |
| No SECURITY.md update | Missing security documentation | Update SECURITY.md with current measures | Low |

---

## 5. DPDP tranche 3 compliance roadmap

When DPDP tranche 3 commences (~May 2027), StableSense will need to:

1. **Publish a completed privacy policy** with all [TODO] placeholders resolved.
2. **Appoint a Data Protection Officer** (India-resident if SDF) and publish contact info.
3. **Implement consent mechanism** if relying on consent (vs. legitimate uses under s 7).
4. **Establish breach notification procedure** (Board + 72h report + affected principals).
5. **Set and document data retention periods** aligned with Rule 8.
6. **Implement rights request workflow** (90-day response for access, correction, erasure, grievance).
7. **Review children's data handling** (verifiable parental consent if under-18 users).
8. **Review cross-border transfers** against any notified restricted list.
9. **Update privacy policy** to reflect DPDP as operative law (not just incoming framework).

---

## 6. Files produced

| File | Path | Description |
|------|------|-------------|
| Privacy policy draft | `docs/legal-readiness/policy-draft.md` | Draft with [TODO] placeholders |
| Disclaimer draft | `docs/legal-readiness/disclaimer-draft.md` | Draft with [TODO] placeholders |
| Data inventory | `docs/legal-readiness/data-inventory.json` | Source-based data flow inventory |
| Law ledger | `docs/legal-readiness/law-ledger.json` | Legal status with sources |
| Readiness checklist | `docs/legal-readiness/readiness.md` | This document |
| DPDP research brief | `docs/research/2026-10-01-dpdp-act-rules-status.md` | Detailed DPDP legal research |

---

## 7. Verification notes

- **Source audit:** Based on reading source files in `/mnt/ai-archive/other-tools/stablesense`.
  No live deployment was accessed. No VPS, no environment variables, no secrets were read.
- **Legal research:** Based on web search of official Indian government sources (India Code,
  MeitY, PIB) and primary-record trackers. Research date: 2026-10-01.
- **No claim of compliance:** This document does not assert that StableSense complies with
  any law. It identifies what is known, what is unknown, and what actions are needed.
- **Not legal advice:** This is a research and drafting aid. The operator should consult
  qualified legal counsel before publishing any privacy policy or disclaimer.

---

*Prepared 2026-10-01 by Hermes Agent (automated source audit and legal research).*
