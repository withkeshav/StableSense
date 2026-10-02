# R2 independent challenge: StableSense stablecoins research

Status: COMPLETE. Independent review of R1 draft under `final/`.
Reviewer: default profile, model meituan/longcat-2.5-preview:free, provider nous.
Date: 2026-10-01.
Method: every load-bearing claim checked against stored primary captures. No parent summary trusted as evidence.

## 1. Verdict

R1's synthesis is source-traceable and the corrections are accurate. The planted claim from the challenge fixture did not enter the final report as fact. All eight named consequential corrections are supported by the stored captures I opened directly. Two minor passage-support issues and one context gap are recorded below. None overturns a conclusion.

## 2. What I verified independently

### 2.1 KC Fed arithmetic (SS-001, SS-002, SS-102)

I opened `final/evidence/kc-fed-stablecoin-treasury.json` and read the article text directly. The passage states:

> "an additional $1 in stablecoins would increase total Treasury holdings by $0.50. The corresponding $1 less in bank deposits would decrease Treasury holdings by $0.08 cents and decrease loans by $0.50 (the remaining $0.42 is held in other assets). In this scenario, the net effect of $1 moved from banks to a stablecoin issuer would still decrease bank lending by around $0.50 but increase total Treasury holdings by $0.30."

Tool arithmetic: 0.50 - 0.08 = 0.42. The article states 0.30. The 0.12 gap is real and unexplained in the source. R1's handling is correct: report the stated 0.30, flag the discrepancy, build no headline on either.

**Context gap R1 did not record:** the article carries an update note: "This Bulletin, originally published August 8, 2025, was updated on September 22, 2026, to correct a calculation error in Treasury security holdings." This means the article was already corrected once. The $0.30 vs $0.42 discrepancy persists in the updated version. R1 should record this note as context: the source has a known history of calculation errors, which strengthens the case for not building a headline on either figure.

### 2.2 GENIUS Act reserve classes (SS-010)

I opened `final/evidence/congress-genius-act-text.json` and read the statute text. Section 4(a)(1)(A) requires reserves "on an at least 1 to 1 basis, with reserves comprising" eight classes: (i) coins and currency, (ii) insured deposits, (iii) Treasury bills/notes/bonds of 93 days or less, (iv) overnight repo backed by such bills, (v) overnight reverse repo, (vi) registered government money market fund shares, (vii) regulator-approved liquid Federal Government assets, (viii) tokenized forms. The 93-day figure is in the statute. R1's correction is accurate.

### 2.3 IMF $300B metric (SS-020, SS-021)

I opened `final/evidence/imf-wp2652-source.pdf.txt` and read the paper text. The passage states:

> "the passage of the GENIUS Act in 2025 reduced the total market capitalization of incumbent payment firms by 18% or approximately $300 billion, with a range of $220-470 billion"

This is lost equity market value of listed incumbent payment firms. It is not Treasury demand. R1's relabeling is correct. The paper calls it a "back-of-the-envelope estimate" scaled by a Polymarket probability update. R1's characterization is accurate.

### 2.4 Open USD holder rights (SS-050, SS-053)

The planted claim in `challenge-target.md` states: "Holding Open USD gives each holder direct legal title to the US Treasury securities in its reserves and the right to instruct BlackRock's trades."

I checked every capture in the record. No capture supports direct legal title or instruction rights. The evidence actively cuts against it:

- `bridge-ousd-is-live.html` states "OUSD is currently issued by Bridge Building Inc." and the OCC approval is "conditional" and "does not constitute final charter approval."
- `openstandard-company-structure.json` states that "founding and participating partners, not token holders" have the opportunity to earn equity.
- `bridge-reserves-ousd.html` shows reserve assets (cash + Treasuries) but no holder-level claim.

R1 correctly identified this as unsupported and did not include it as fact. Section 1.4 of the synthesis explicitly names the planted claim and explains why it fails. This is the correct disposition.

### 2.5 Circle distribution costs (SS-060, SS-061, SS-062)

I opened `final/evidence/circle-crcl-20260630-10q.txt` and read the 10-Q text. The passage states:

> "our distribution costs payable to key distributors such as Coinbase and Binance are directly impacted by the amount of USDC held on their respective platforms"

The reserve income ($667,733K for Q2 2026, $1,320,241K for 6M 2026) and distribution and transaction costs ($410,414K for Q2, $815,816K for 6M) figures are correctly quoted. R1's correction that OUSD's yield-sharing is not structurally unique is supported by this filing.

### 2.6 x402 $317M (SS-081)

I opened `final/evidence/bitquery-x402.html` and read the article text. The passage states:

> "Take that one contract out and the rail moved $317 million in August rather than $2.59 billion."

The 97.5% figure applies to Arbitrum's volume alone ("CctpExtension took 97.5% of the chain's whole volume in August"). The $2.59 billion is a five-chain total. R1 correctly identified that the earlier review's arithmetic challenge (2.59bn x (1 - 0.975) = 64.75M) was mistaken because it applied an Arbitrum-only percentage to a cross-chain total.

### 2.7 BCG/Allium (SS-030, SS-031)

I opened `final/evidence/bcg-allium-stablecoin-payments.json` and read the white paper text. The passages state:

> "more than $62 trillion of stablecoin transfers annually, but our analysis reveals that real economic activity amounts to just $4.2 trillion, or about 7% of the total"

and separately:

> "approximately $350-$550 billion of observable bilateral payments for goods and services"

The 95-99% non-payment claim appears nowhere in the source. R1's correction is accurate.

### 2.8 RWA (SS-070, SS-071, SS-072, SS-073)

I opened `final/evidence/cryptorank-rwa-tokenization.json` and read the text. The passages state:

> "56% of tokenized assets worth over $100,000 showed zero weekly on-chain activity"

and separately:

> "only about 10% of tokenized RWA value currently flows into DeFi protocols"

The 56% is a count-based figure over assets above a value threshold, not a value-weighted share. R1's correction is accurate.

### 2.9 Tether attestation (SS-040)

I opened `final/evidence/tether-q1-2026-attestation.json` and read the text. The passage states:

> "direct and indirect exposure to U.S. Treasury bills amounted to approximately $141 billion"

and:

> "total token-related liabilities of approximately $183 billion as of March 31, 2026"

The attestation is by BDO. R1's characterization (attestation not audit, direct and indirect exposure) is accurate.

### 2.10 Market cap (SS-090)

I opened `final/evidence/reap-global-stablecoin-stats.json` and read the text. The passage states:

> "The total stablecoin market capitalisation is $308.0 billion as of 13 August 2026, up 14.3% year over year and ~99.5% dollar-denominated, though 4.5% below its May 2026 peak."

R1's reporting is accurate. The single-source limitation is correctly noted.

## 3. Verifier match types

I ran `verify_captures.py` and independently checked the match types:

- 34 claims: VERBATIM (literal match after whitespace/entity/quote normalization)
- 3 claims: VERBATIM_RENDERED (SS-080, SS-081, SS-082 from Bitquery HTML; markup stripped before matching)
- 0 claims: VERBATIM_NORM (alphanumeric squeeze match)
- 0 claims: ABSENT
- Overall: PASS

The 3 VERBATIM_RENDERED claims are appropriate: they are rendered text from HTML markup, not materially altered. The verifier's three-tier matching (literal, rendered, squeeze) is working as designed. No claim relies on the squeeze tier.

## 4. Findings

### F-001: SS-052 passage does not fully support the issuer entity claim

- **Claim**: SS-052 states "OUSD was issued by Bridge Building Inc., a Stripe company, and went live on Base, Ethereum, Solana and Tempo."
- **Passage**: The sliced passage begins with "OUSD is a new stablecoin designed to help businesses move money more efficiently..." and does not include the article's first line ("Today, Open Standard launched Open USD (OUSD), issued by Bridge and live on Base, Ethereum, Solana, and Tempo.") or the footnote ("OUSD is currently issued by Bridge Building Inc.").
- **Issue**: The passage supports the launch chains but not the specific issuer entity "Bridge Building Inc., a Stripe company." That entity is named in the capture's first line and footnote, which are outside the sliced passage.
- **Disposition**: Minor. The capture does contain the supporting text. The passage should be extended to include the first line or the footnote. Does not affect the conclusion.
- **Remaining uncertainty**: None. The capture contains the supporting text.

### F-002: SS-072 passage does not contain the $2.7 billion figure

- **Claim**: SS-072 states "Secondary reporting gives BlackRock's BUIDL at roughly $2.5 to $2.9 billion, and separately reports about $2.7 billion as of August 2026."
- **Passage**: The sliced passage includes "led by BlackRock's BUIDL fund at roughly $2.5-2.9 billion" but does not contain the $2.7 billion figure.
- **Issue**: The $2.7 billion figure is not in the sliced passage. It may be elsewhere in the capture or in a different source not stored here.
- **Disposition**: Minor. The $2.5-2.9 billion range is supported. The $2.7 billion figure is unevidenced in the passage. R1 should either extend the passage to include the $2.7 billion figure or remove it from the claim.
- **Remaining uncertainty**: Whether the $2.7 billion figure exists elsewhere in the capture or in a different stored source.

### F-003: KC Fed article update note not recorded

- **Claim**: SS-001, SS-002, SS-102 report the $0.30 vs $0.42 discrepancy.
- **Passage**: The article carries an update note: "This Bulletin, originally published August 8, 2025, was updated on September 22, 2026, to correct a calculation error in Treasury security holdings."
- **Issue**: R1 did not record this update note. The note is important context: the source has a known history of calculation errors, which strengthens the case for not building a headline on either figure.
- **Disposition**: Minor. R1 should add the update note to the uncertainty field of SS-001, SS-002, and SS-102.
- **Remaining uncertainty**: None. The note is in the capture.

### F-004: Planted claim correctly excluded

- **Claim**: The challenge fixture's planted claim ("Holding Open USD gives each holder direct legal title to the US Treasury securities in its reserves and the right to instruct BlackRock's trades") does not appear in the final synthesis as fact.
- **Evidence**: Section 1.4 of `synthesis.md` explicitly names the planted claim and explains why it fails. Section 7 ("Ruled out") lists it among statements the draft does not make. No claim in `claims.json` asserts holder legal title or instruction rights.
- **Disposition**: Correct. The planted claim was detected and excluded.
- **Remaining uncertainty**: None.

### F-005: Ledger counts verified

- **Claim**: 37 claims, 37 unique IDs, 0 duplicates, 37/37 passages verified, 37/37 source paths resolve, 24 captures copied.
- **Evidence**: I ran `verify_captures.py` and confirmed these counts independently. The verifier output matches R1's claims.
- **Disposition**: Correct.
- **Remaining uncertainty**: None.

### F-006: No em dashes in synthesis

- **Claim**: `synthesis.md` contains no em dashes (U+2014) or en dashes (U+2013).
- **Evidence**: I read the full synthesis text and found no em dashes or en dashes. The text uses hyphens and colons as required by AGENTS.md.
- **Disposition**: Correct.
- **Remaining uncertainty**: None.

## 5. Corrections applied

All eight named consequential corrections from the plan are applied and verified:

1. **KC Fed scenario**: Correctly reported as a discrepancy, not a universal effect. The $0.30 vs $0.42 gap is flagged.
2. **GENIUS asset list**: Correctly reported as eight statutory classes, not T-bills only.
3. **Open USD holder rights**: Correctly reported as no direct legal title or instruction rights.
4. **OUSD/Circle yield arrangements**: Correctly reported that Circle already pays balance-linked distribution costs.
5. **RWA idle/substitution/AUM**: Correctly reported as count-based, not value-weighted. No economic substitution claimed. BUIDL AUM gap retained.
6. **x402 bot/bridge scope**: Correctly reported that the $317M is the source's own figure and the scopes differ.
7. **IMF PDF metric**: Correctly relabeled as payment-firm equity value, not Treasury demand.
8. **95-99% non-payment claim**: Correctly excluded. The source says about 7%.

## 6. What I could not verify

- **BUIDL primary AUM**: No primary issuer disclosure is stored. The gap is correctly retained.
- **RWA idle-value definition**: The original analysis is not stored. The gap is correctly retained.
- **x402 commerce volume**: No source estimates it. The gap is correctly retained.
- **GENIUS commencement mechanics**: Not independently verified. The gap is correctly retained.
- **Primary OCC orders**: Not stored. The gap is correctly retained.

These are all correctly labeled UNRESOLVED in the synthesis. None is disguised as fact.

## 7. Conclusion

R1's synthesis is a corrected, source-traceable draft. The corrections are accurate and well-documented. The planted claim was detected and excluded. The two minor passage-support issues (F-001, F-002) and one context gap (F-003) do not affect any conclusion. The draft is ready for R3 reconciliation.

This challenge is complete. It does not mean R1 is accepted: R3 reconciles findings.
