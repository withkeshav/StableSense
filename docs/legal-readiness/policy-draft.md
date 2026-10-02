# StableSense Privacy Policy (DRAFT)

**Status: DRAFT - Not published, not effective. For operator review only.**
**Draft date: 2026-10-01**
**Last reviewed: 2026-10-01**

> **IMPORTANT:** This is a draft privacy policy for StableSense. It contains unresolved
> placeholders marked `[TODO: ...]` that must be completed by the operator before publication.
> This document does not constitute legal advice. The operator should have this reviewed by
> qualified legal counsel before publication.

---

## 1. Introduction

StableSense ("we", "us", "our") is a stablecoin market data dashboard. This privacy policy
explains what data we collect, how we use it, and your rights.

**Operator:** `[TODO: Legal entity name and jurisdiction]`
**Contact:** `[TODO: Privacy contact email or contact method]`
**Effective date:** `[TODO: To be set by operator]`

---

## 2. What data we collect

### 2.1 Data you provide directly

**None.** StableSense has no user accounts, no registration, no forms, and no input fields
that collect personal information. We do not ask for your name, email, phone number, wallet
address, or any other identifying information.

### 22.2 Data collected automatically

| Data | How | Where stored | Personal data? |
|------|-----|-------------|----------------|
| IP address | Server access logs (nginx + Fastify request logger) | Server log files | Yes (network identifier) |
| IP address, User-Agent, Referer | Browser-direct request to Google Fonts | Google servers | Yes (network identifier) |
| IP address | Browser-direct request to CoinGecko (coin tab charts/tickers) | CoinGecko servers | Yes (network identifier) |
| Request metadata (method, URL, status, response time) | Fastify request logger | Server log files | No (operational) |

### 2.3 Browser storage (localStorage)

We store the following preferences in your browser's localStorage. These are **not** personal
data and are **not** transmitted to our servers:

| Key | Contents |
|-----|----------|
| `stablesense:theme` | Theme preference (light / dark / system) |
| `stablesense:refresh` | Auto-refresh interval |
| `stablesense:compact` | Compact mode toggle |
| `stablesense:v2:*` | Cached market data (SWR cache) |
| `stablesense:tourSeen` | First-run tour dismissal flag |

We do **not** use cookies, sessionStorage, IndexedDB, or service workers.

---

## 3. How we use data

| Purpose | Legal basis (when DPDP tranche 3 commences) | Current basis |
|---------|---------------------------------------------|---------------|
| Serve the dashboard | Legitimate use (service delivery) | Contractual necessity |
| Display market data | Legitimate use (service delivery) | Contractual necessity |
| Generate AI narratives | Legitimate use (service delivery) | Contractual necessity |
| Server logging and security | Legitimate use (security) | Legitimate interest |
| Google Fonts loading | `[TODO: Consent or legitimate use]` | `[TODO: To be determined]` |

We do **not**:
- Sell or rent personal data
- Use personal data for advertising or profiling
- Share personal data with third parties for their own purposes
- Process special category data (health, biometrics, etc.)

---

## 4. Third-party services

The following third-party services receive data when you use StableSense:

| Service | What they receive | Why | Their privacy policy |
|---------|-------------------|-----|---------------------|
| **Cloudflare** | IP address, User-Agent, request metadata; receives all traffic as the edge in front of the site | CDN, TLS termination and DDoS protection for every request | [cloudflare.com/privacypolicy](https://www.cloudflare.com/privacypolicy/) |
| **Google Fonts** | IP address, User-Agent, Referer | Font loading on dashboard pages | [policies.google.com/privacy](https://policies.google.com/privacy) |
| **CoinGecko** | Visitor IP (browser-direct, coin tab only) | 90-day price charts and tickers | [coingecko.com/en/privacy](https://www.coingecko.com/en/privacy) |
| **DefiLlama** | Server IP only | Stablecoin market data (backend) | Not reviewed |
| **Helix** | Server IP, API key | Trends and events data (backend) | Not reviewed |
| **OpenAI (or compatible provider)** | Server IP, API key, aggregated market context | AI narrative generation (backend) | [openai.com/privacy](https://openai.com/privacy) |

**Note:** Cloudflare sits in front of the whole site and therefore sees every visitor request, including IP, before any other row in this table. Its response headers also include NEL (Network Error Logging) reporting to Cloudflare. The backend services (DefiLlama, Helix, OpenAI) receive **no user personal data**.
They receive only aggregated, anonymized market data and server-to-server request metadata.

---

## 5. Data retention

| Data type | Retention period | Notes |
|-----------|-----------------|-------|
| Server access logs (IP addresses) | `[TODO: To be determined by operator]` | Currently no configured retention policy |
| Browser localStorage | Until user clears browser data | User-controlled |
| Backend SQLite database | `[TODO: To be determined by operator]` | Contains no personal data |
| Cron job logs | `[TODO: To be determined by operator]` | No personal data |

**DPDP alignment (when tranche 3 commences):** Rule 8 requires erasure when purpose is no
longer served, with a 3-year inactivity rule for large platforms and a 1-year minimum
retention for logs. `[TODO: Operator to set specific retention periods aligned with DPDP Rule 8.]`

---

## 6. Your rights

### 6.1 Under current Indian law (IT Act 2000 + SPDI Rules 2011)

The SPDI Rules 2011 provide limited rights regarding sensitive personal data. StableSense does
not collect sensitive personal data as defined under those rules.

### 6.2 Under DPDP Act 2023 (when tranche 3 commences, ~May 2027)

When the DPDP Act's substantive provisions come into force, you will have the following rights
as a Data Principal:

- **Right to access** (s 11) - information about your personal data
- **Right to correction and erasure** (s 12) - correct, complete, update, or erase
- **Right to grievance redressal** (s 13) - lodge a complaint
- **Right to nominate** (s 14) - nominate someone to exercise rights on your behalf

To exercise these rights, contact: `[TODO: Contact method for rights requests]`

**Response time:** DPDP Rule 14 requires response within 90 days.

### 6.3 GDPR rights (if applicable)

If you are in the European Economic Area, you may have additional rights under the GDPR,
including data portability, restriction of processing, and objection. Whether GDPR applies
depends on our offering of services to individuals in the EU. `[TODO: Operator to confirm
GDPR applicability and provide contact for GDPR requests.]`

---

## 7. Children's privacy

StableSense does not knowingly collect personal data from children under 18. The application
has no age-gating mechanism. When DPDP tranche 3 commences, we will comply with Section 9
requirements for verifiable parental consent if we become aware of under-18 users.

`[TODO: Operator to decide whether to implement age-gating or add a minimum age statement.]`

---

## 8. Data security

We implement the following security measures:
- Parameterized SQL queries (prevent SQL injection)
- No storage of API keys in source code (environment variables only)
- Backend bound to localhost (127.0.0.1) with nginx reverse proxy
- `[TODO: Additional security measures to be documented]`

**Known gaps:**
- Origin nginx config has no TLS (port 80 only). Public HTTPS is terminated at the Cloudflare edge, so visitors do connect over HTTPS; origin-to-edge encryption is unverified. - `[TODO: Operator to confirm origin encryption and whether the backend is ever exposed directly.]`
- No rate limiting on backend endpoints - `[TODO: Operator to implement]`
- No configured log retention or rotation policy - `[TODO: Operator to configure]`

---

## 9. Cross-border data transfer

StableSense uses services that may process data outside India:
- Cloudflare (global edge network; sees every visitor request)
- Google Fonts (Google servers, global)
- CoinGecko (global CDN)
- OpenAI or compatible AI provider (location depends on configuration)

When DPDP tranche 3 commences, cross-border transfers are permitted by default unless the
destination is on a notified restricted list (s 16). `[TODO: Operator to monitor the
restricted list and update this section.]`

---

## 10. Changes to this policy

We may update this policy from time to time. We will notify users of material changes through
the application or by updating the "Last reviewed" date above.

---

## 11. Contact

For privacy-related inquiries, contact: `[TODO: Privacy contact email or method]`

**Data Protection Officer (when required by DPDP):** `[TODO: To be appointed when tranche 3 commences]`

---

## 12. Legal framework

This policy is drafted with reference to:
- **Information Technology Act, 2000** and **SPDI Rules 2011** (currently operative in India)
- **Digital Personal Data Protection Act, 2023** (enacted, substantive provisions not yet in force)
- **Digital Personal Data Protection Rules, 2025** (notified 13 November 2025, substantive provisions commence ~May 2027)
- **GDPR** (if applicable to our user base - `[TODO: Operator to confirm]`)

---

*This draft was prepared on 2026-10-01 based on source-code audit and legal research.
It requires operator review, completion of all [TODO] placeholders, and legal counsel
approval before publication. This is not legal advice.*
