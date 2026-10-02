#!/usr/bin/env python3
"""Build final/claims.json for the R1 synthesis.

Every exact_passage is sliced out of the stored capture at run time by
locator, never retyped. If the anchor text is not found the claim is emitted
with passage_finder_status = ANCHOR_NOT_FOUND and does not count as verified.
Arithmetic claims carry a tool-computed value from the same run.
"""

import hashlib
import html
import json
import os
import re
import subprocess

D = "/mnt/ai-archive/other-tools/stablesense/docs/research/2026-10-01-state-of-stablecoins"
FINAL = os.path.join(D, "final")
EVDIR = os.path.join(FINAL, "evidence")

# ---- durable capture files to copy into final/evidence/, with provenance ----
COPIES = {
    "firecrawl-recovery/captures/kansascityfed-stablecoin-treasury.json": "kc-fed-stablecoin-treasury.json",
    "firecrawl-recovery/captures/congress-genius-act.json": "congress-genius-act-text.json",
    "firecrawl-recovery/captures/imf-wp2652-genius-act-shocks.json": "imf-wp2652-page.json",
    "firecrawl-recovery/captures/imf-wp2652-genius-act-shocks.pdf": "imf-wp2652-source.pdf",
    "firecrawl-recovery/captures/imf-stablecoin-shocks-wp2644.json": "imf-wp2644-stablecoin-shocks.json",
    "firecrawl-recovery/captures/bcg-stablecoin-payments.json": "bcg-allium-stablecoin-payments.json",
    "firecrawl-recovery/captures/tether-q1-2026-attestation.json": "tether-q1-2026-attestation.json",
    "firecrawl-recovery/captures/reap-global-stablecoin-stats.json": "reap-global-stablecoin-stats.json",
    "firecrawl-recovery/captures/openstandard-company-structure.json": "openstandard-company-structure.json",
    "firecrawl-recovery/captures/openstandard-partners.json": "openstandard-partners.json",
    "firecrawl-recovery/captures/solanacompass-ousd-solana.json": "solanacompass-ousd-solana.json",
    "firecrawl-recovery/captures/bitcoinmagazine-ousd-launch.json": "bitcoinmagazine-ousd-launch.json",
    "firecrawl-recovery/captures/cnbc-circle-occ-charter.json": "cnbc-circle-occ-charter.json",
    "firecrawl-recovery/captures/cryptorank-rwa-tokenization.json": "cryptorank-rwa-tokenization.json",
    "firecrawl-recovery/captures/spark-money-rwa-tokenization.json": "spark-money-rwa-tokenization.json",
    "firecrawl-recovery/captures/reap-global-stablecoin-stats.json": "reap-global-stablecoin-stats.json",
    "firecrawl-recovery/captures/metamask-what-is-x402.json": "metamask-what-is-x402.json",
    "native-market/evidence/bridge-ousd-is-live.html": "bridge-ousd-is-live.html",
    "native-market/evidence/bridge-reserves-ousd.html": "bridge-reserves-ousd.html",
    "native-market/evidence/openstandard-ousd-is-live.html": "openstandard-ousd-is-live.html",
    "native-market/evidence/openstandard-introducing-open-usd.html": "openstandard-introducing-open-usd.html",
    "native-x402/evidence/bitquery-x402.html": "bitquery-x402.html",
    # R3: the synthesis's x402 volume floor of "$996 thousand" came from a prose
    # research draft, not from any capture. The real x402scan page capture is in
    # the record but was never copied into final/evidence/, which is why no claim
    # could be made to rest on it. It is a 2 MB Next.js page whose global totals
    # live in the embedded RSC payload, so it also needs the deterministic text
    # extraction below.
    "native-x402/evidence/x402scan.html": "x402scan.html",
    "native-x402/evidence/chainalysis-x402.md": "chainalysis-x402.md",
    "native-x402/evidence/visa-artemis-x402.md": "visa-artemis-x402.md",
    "final-bunny-routed/evidence/circle-crcl-20260630-10q.txt": "circle-crcl-20260630-10q.txt",
}


def body(rel):
    p = os.path.join(D, rel)
    t = open(p, errors="replace").read()
    if rel.endswith(".json"):
        d = json.loads(t)
        return d.get("markdown") or d.get("html") or "", d
    return t, {}


# R3 fix: the previous tag strip was the greedy r"<[^>]+>", which treats a
# literal "<" in body prose as a tag opener. In spark-money-rwa-tokenization.json
# a table cell reading "<$500M | Backed Finance" opened a span that swallowed
# 3,716 characters of real text (measured: legacy flat 18,408 chars, fixed 22,124),
# including the BUIDL "$2.4 billion as of May 2026" passage. In
# imf-stablecoin-shocks-wp2644.json the string "<0.1; p<0.05" swallowed 26,586
# characters (measured: legacy flat 40,460, fixed 67,046). A capture cannot be
# evidence if the extraction silently deletes the evidence, so the tag regex is now
# name-anchored and script/style bodies are dropped before tags are stripped.
TAG_RE = re.compile(r"</?[A-Za-z][A-Za-z0-9:_-]*(?:\s[^<>]*?)?/?>")
SCRIPT_STYLE_RE = re.compile(r"(?is)<(script|style)\b[^>]*>.*?</\1\s*>")


def strip_markup(t):
    t = SCRIPT_STYLE_RE.sub(" ", t)
    return TAG_RE.sub(" ", t)


def flat(t):
    # JSON captures store markdown with escaped newlines; turn those into spaces
    # so a passage spans a paragraph break in the stored file the same way it
    # does in the rendered page.
    t = str(t).replace("\\n", " ").replace("\\t", " ")
    return re.sub(r"\s+", " ", html.unescape(strip_markup(t))).strip()


def flat_legacy(t):
    """The pre-R3 normaliser, kept only so the defect is reproducible on demand."""
    t = str(t).replace("\\n", " ").replace("\\t", " ")
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"(?s)<[^>]+>", " ", t))).strip()


def slice_passage(flattext, start_anchor, length=520, before=0):
    """Verbatim slice of the stored text around a unique anchor."""
    i = flattext.find(start_anchor)
    if i < 0:
        return None
    j = max(0, i - before)
    return flattext[j:j + length].strip()


# ---- arithmetic, computed here, never by hand ----
KC_ISSUER, KC_BANK = 0.50, 0.08
KC_STATED_NET = 0.30
KC_COMPONENT_NET = round(KC_ISSUER - KC_BANK, 4)
KC_INTERNAL_GAP = round(KC_COMPONENT_NET - KC_STATED_NET, 4)
OUSD_SUPPLY = 468445399
OUSD_CASH, OUSD_TSY = 257214691, 211230708
OUSD_POOL_4_5 = round(OUSD_SUPPLY * 0.045, 2)
OUSD_POOL_PER_200 = round(OUSD_SUPPLY * 0.045 / 200, 2)
X402_AUG_TOTAL = 2.59e9
X402_ARB_BRIDGE_SHARE = 0.975
IMF_POINT, IMF_PROB_FROM = -0.013, 0.93
IMF_SCALED = round(IMF_POINT / (1 - IMF_PROB_FROM) * 100, 2)
CIRCLE_RI_Q, CIRCLE_DIST_Q = 667733, 410414
CIRCLE_RI_6M, CIRCLE_DIST_6M = 1320241, 815816
CIRCLE_ACCRUED_DIST = 105799
X402SCAN_TOTAL_UNITS = 974215144043   # raw USDC units in the page's RSC payload
X402SCAN_TXN = 12293450
X402SCAN_BUYERS = 27467
X402SCAN_SELLERS = 38519
X402SCAN_USDC_DECIMALS = 6
BCG_TRANSFERS_T, BCG_REAL_T = 62.0, 4.2

ARITH = {
    "kc_component_net": KC_COMPONENT_NET,
    "kc_stated_net": KC_STATED_NET,
    "kc_internal_gap": KC_INTERNAL_GAP,
    "ousd_pool_4_5pct": OUSD_POOL_4_5,
    "ousd_pool_per_200": OUSD_POOL_PER_200,
    "x402_arbitrum_bridge_excluded": round(X402_AUG_TOTAL * X402_ARB_BRIDGE_SHARE, 2),
    "x402_residual_if_subtracted": round(X402_AUG_TOTAL * (1 - X402_ARB_BRIDGE_SHARE), 2),
    "imf_scaled_pct": IMF_SCALED,
    "circle_distribution_to_reserve_income_q2": round(CIRCLE_DIST_Q / CIRCLE_RI_Q, 4),
    "circle_distribution_to_reserve_income_6m": round(CIRCLE_DIST_6M / CIRCLE_RI_6M, 4),
    "circle_accrued_dist_pct_of_6m_reserve_income": round(CIRCLE_ACCRUED_DIST / CIRCLE_RI_6M * 100, 2),
    "bcg_real_economy_share_pct": round(BCG_REAL_T / BCG_TRANSFERS_T * 100, 2),
    "bcg_bilateral_low_bound_pct": round(350e9 / (BCG_TRANSFERS_T * 1e12) * 100, 3),
    "bcg_bilateral_high_bound_pct": round(550e9 / (BCG_TRANSFERS_T * 1e12) * 100, 3),
    "x402scan_total_usd": round(X402SCAN_TOTAL_UNITS / 10 ** X402SCAN_USDC_DECIMALS, 2),
    "x402scan_avg_usd_per_txn": round(X402SCAN_TOTAL_UNITS / 10 ** X402SCAN_USDC_DECIMALS / X402SCAN_TXN, 6),
    "x402scan_buyers": X402SCAN_BUYERS,
    "x402scan_sellers": X402SCAN_SELLERS,
}


def build_ledger(texts):
    """Each claim names its capture copy and an anchor that must exist in it."""
    spec = []

    def add(cid, text, kind, copy, anchor, url, as_of, scope, uncertainty, falsifier, topic, length=520, before=0):
        spec.append(dict(id=cid, claim=text, kind=kind, copy=copy, anchor=anchor,
                         source_url=url, as_of=as_of, scope=scope,
                         uncertainty=uncertainty, falsifier=falsifier,
                         topic=topic, length=length, before=before))

    KC = "https://www.kansascityfed.org/research/economic-bulletin/stablecoins-could-increase-treasury-demand-but-only-by-reducing-demand-for-other-assets/"
    GEN = "https://www.congress.gov/bill/119th-congress/senate-bill/1582/text"
    IMF52 = "https://www.imf.org/-/media/files/publications/wp/2026/english/wpiea2026052-source-pdf.pdf"
    IMF44 = "https://www.imf.org/en/Publications/WP/Issues/2026/06/05/Stablecoin-Shocks-568043"
    BCG = "https://www.bcg.com/assets/2026/white-paper-stablecoin-payments-truth-behind-numbers.pdf"

    # --- Kansas City Fed: conditional scenario, and the source's own arithmetic gap ---
    add("SS-001", "Under an explicitly conditional assumption that bank and issuer asset mixes hold, an additional $1 of stablecoins raises total Treasury holdings by $0.50 while $1 less in bank deposits lowers them by $0.08.",
        "fact", "kc-fed-stablecoin-treasury.json", "Under the strong assumption that banks", KC, "2025-08-08",
        "Scenario arithmetic in one Economic Bulletin article. Not a universal marginal effect and not a cap.",
        "The same article states the net effect is $0.30, but its own two components sum to $0.42; see SS-002. It also allows zero or negative net demand. The Bulletin was already revised once: the capture carries the note 'This Bulletin, originally published August 8, 2025, was updated on September 22, 2026, to correct a calculation error in Treasury security holdings' (R2 F-003). The 0.42 against 0.30 inconsistency survives that revision, so the source has a demonstrated history of arithmetic error and neither figure should carry a headline.",
        "If the Federal Reserve Bank of Kansas City revises or withdraws the article.", "us-debt", 620)
    add("SS-002", "The Kansas City Fed article states a net effect of $0.30 while its own stated components ($0.50 up, $0.08 down) sum to $0.42; the $0.12 gap is unexplained in the source.",
        "fact", "kc-fed-stablecoin-treasury.json", "In this scenario, the net effect", KC, "2025-08-08",
        "Internal consistency check on one paragraph of the article, recomputed by tool from the article's own figures.",
        "The article may intend $0.08 to be a rounded or differently defined quantity; no reconciliation is given. Report the stated $0.30 and flag it rather than silently choosing a value. The Bulletin's own update note (updated September 22, 2026 'to correct a calculation error in Treasury security holdings') shows the source has been corrected once already and the 0.12 gap is not the error that correction addressed (R2 F-003).",
        "If the Bank publishes a correction or a note reconciling the two figures.", "us-debt", 420)
    add("SS-003", "The same article states that if the funding sources selling Treasuries sell at the same rate issuers buy, a larger stablecoin market has no net effect on Treasury demand at all.",
        "fact", "kc-fed-stablecoin-treasury.json", "should the sources of the funds", KC, "2025-08-08",
        "Explicit caveat on the funding-source assumption. Bounds the scenario above.",
        "None found; this is the source hedging its own headline.",
        "If the Bank removes or changes the caveat.", "us-debt", 420)
    add("SS-004", "Households funding stablecoin purchases by forgoing or selling Treasury holdings would reduce Treasury demand, since $1 less household purchase creates only $0.50 of issuer purchase.",
        "fact", "kc-fed-stablecoin-treasury.json", "if households forego purchasing new Treasuries", KC, "2025-08-08",
        "Illustrative funding-source case from the same article.",
        "Does not quantify the share of stablecoin funding that actually comes from households.",
        "If the Bank publishes a decomposition of funding sources.", "us-debt", 480)

    # --- GENIUS statutory reserve eligibility: primary statute, eight clauses ---
    add("SS-010", "GENIUS Act section 4(a)(1)(A) requires reserves at least 1 to 1, comprising coins and currency, insured deposits, Treasury bills/notes/bonds of 93 days or less, overnight repo and reverse repo against such Treasuries, registered government money market fund shares, regulator-approved liquid Federal Government assets, and tokenized forms of those classes.",
        "fact", "congress-genius-act-text.json", "maintain identifiable reserves backing", GEN, "2025-07-18",
        "Statutory reserve asset list as enrolled text. Replaces the earlier claim that reserves are T-bills only, which is overbroad.",
        "Final implementing rules may narrow or refine eligible instruments; OCC/FDIC/NCUA proposals were not final as of capture.",
        "If the statute text changes or a final rule alters eligible classes.", "regulatory", 1500)
    add("SS-011", "GENIUS Act section 4(a)(1)(C) requires issuers to publish monthly reserve composition on their website, including total outstanding tokens and the amount, composition, average tenor and geographic location of custody per reserve category.",
        "fact", "congress-genius-act-text.json", "publish the monthly composition", GEN, "2025-07-18",
        "Statutory disclosure duty, quoted from the enrolled text.",
        "Applies from the Act's commencement mechanics, which were not independently verified here.",
        "If the statute text changes.", "regulatory", 700)
    add("SS-012", "GENIUS Act section 4(a)(2) prohibits pledging, rehypothecating or reusing reserves except as the statute allows.",
        "fact", "congress-genius-act-text.json", "Prohibition on rehypothecation", GEN, "2025-07-18",
        "Statutory restriction on reserve reuse.",
        "Exceptions follow in the text that were not exhaustively extracted here.",
        "If the statute text changes.", "regulatory", 420)
    add("SS-013", "GENIUS Act section 3(g) provides that a payment stablecoin not issued by a permitted payment stablecoin issuer is not treated as cash or a cash equivalent for accounting, is not eligible as cash-equivalent margin or collateral, and is not acceptable as a settlement asset for specified wholesale payments.",
        "fact", "congress-genius-act-text.json", "(g) Treatment.—A payment stablecoin that is not issued", GEN, "2025-07-18",
        "Statutory de-recognition of non-permitted stablecoins in specific institutional roles.",
        "Scope is limited to the listed roles and to stablecoins outside the permitted regime.",
        "If the statute text changes.", "regulatory", 780)

    # --- IMF: metric identity, and the correct paper for the yield result ---
    add("SS-020", "IMF Working Paper WP/26/52 estimates that passage of the GENIUS Act reduced the total market capitalization of incumbent payment firms by 18 percent, approximately $300 billion, with a range of $220 to $470 billion across sensitivity exercises.",
        "fact", "imf-wp2652-source.pdf", "reduced the total market capitalization of incumbent payment firms by 18", IMF52, "2026-05-06",
        "Lost market value of listed incumbent payment firms. This is not Treasury demand and not stablecoin market cap.",
        "The paper itself calls this a back-of-the-envelope estimate scaled by a Polymarket probability update; earlier drafts mislabelled the metric as Treasury demand.",
        "If IMF revises the working paper or publishes a final version.", "us-debt", 620)
    add("SS-021", "The WP/26/52 scaling divides an observed 1.3 percent relative price move by the probability update around the decisive vote, from roughly 93 percent to near certainty.",
        "fact", "imf-wp2652-source.pdf", "pt∗ −1 ≈ 93%", IMF52, "2026-05-06",
        "Method detail from the working paper, confirming the estimate is a scaling rather than a directly observed total.",
        "Tool recomputation of the stated components gives a slightly different percentage than the paper's rounded figure.",
        "If the paper's method section changes.", "us-debt", 500)
    add("SS-022", "IMF Working Paper WP/26/44 finds that stablecoin demand shocks triggered persistent declines in short-term Treasury yields and a depreciation of the US dollar, and that payment providers benefited while banks showed no evidence of priced disintermediation risk.",
        "fact", "imf-wp2644-stablecoin-shocks.json", "Stablecoin demand shocks have triggered persistent declines in shortterm Treasury yields", IMF44, "2026-06-06",
        "Event-study and SVAR-IV identification on high-frequency stablecoin market cap changes. This is the Treasury-yield result, and it belongs to WP/26/44, not WP/26/52.",
        "Working paper describing research in progress; the authors state views are their own.",
        "If the paper is revised or withdrawn.", "us-debt", 620)

    # --- BCG / Allium: two different real-economy figures, both from one source ---
    add("SS-030", "BCG and Allium Labs report more than $62 trillion of annual stablecoin transfers with real economic activity of $4.2 trillion, about 7 percent of the total.",
        "fact", "bcg-allium-stablecoin-payments.json", "more than $62 trillion of stablecoin transfers annually", BCG, "2026-09-30",
        "Behaviour-based flow attribution across stablecoin transfers. The 7 percent share is the source's own.",
        "The same white paper separately reports a much smaller bilateral goods-and-services figure; the two use different definitions and must not be merged.",
        "If BCG or Allium publishes revised flow attribution.", "market")
    add("SS-031", "The same BCG and Allium study reports approximately $350 to $550 billion of observable bilateral payments for goods and services in 2025, and describes this as a directionally robust lower bound that excludes internal exchange settlements and card-based payments.",
        "fact", "bcg-allium-stablecoin-payments.json", "approximately $350–$550 billion of observable bilateral payments", BCG, "2026-09-30",
        "Narrow goods-and-services definition, explicitly a lower bound with named exclusions.",
        "Earlier drafts paired this figure with the gross total to claim 95 to 99 percent of volume is non-payment; that ratio is not supported by the source's own 7 percent figure. This claim supersedes that framing.",
        "If the study revises its bilateral payments estimate.", "market", 700)

    # --- Tether reserve attestation ---
    add("SS-040", "Tether's Q1 2026 attestation, prepared by BDO, reports total token-related liabilities of approximately $183 billion and direct and indirect exposure to US Treasury bills of approximately $141 billion as of March 31, 2026.",
        "fact", "tether-q1-2026-attestation.json", "direct and indirect exposure to U.S. Treasury bills amounted to approximately $141 billion", "https://tether.io/news/tether-posts-1-04b-q1-2026-profit-despite-highly-volatile-global-markets-reaches-all-time-highs-8-23b-reserve-buffer-and-maintains-u-s-treasury-heavy-backing/", "2026-03-31",
        "Issuer attestation, not an audit opinion. Exposure is direct and indirect, so it includes collateral and repo, not only outright bills.",
        "Attestations are less rigorous than audited financial statements; a detailed reserve breakdown by instrument was not located in the stored capture.",
        "If Tether publishes a later attestation with a materially different figure.", "us-debt", 620)

    # --- Open USD / Open Standard ---
    add("SS-050", "Open Standard states that founding and participating partners, not token holders, receive the opportunity to earn equity based on the supply and activity they drive on their platforms.",
        "fact", "openstandard-company-structure.json", "will have the opportunity to earn equity based on the supply and activity", "https://joinopenstandard.com/blog/company-structure-and-leadership", "2026-09-24",
        "Vendor statement about its own structure. Evidence of a stated arrangement, not of realised payouts.",
        "No partner-level payout data is public, so the claim that this is unusually generous remains untested against actual arrangements.",
        "If Open Standard publishes partner payout data or changes the structure.", "open-usd", 560)
    add("SS-051", "Open Standard states it will be governed by a board of directors representing its shareholders, and that over time that board will be drawn from its founders.",
        "fact", "openstandard-company-structure.json", "Open Standard will be governed by a board of directors representing its shareholders", "https://joinopenstandard.com/blog/company-structure-and-leadership", "2026-09-24",
        "Vendor statement of intent about future governance.",
        "Open Standard describes itself as independent while OUSD is issued by Bridge Building Inc., a Stripe company; the independence claim is about the company, not the issuer.",
        "If the company publishes its board composition.", "open-usd", 560)
    # R2 F-001: the sliced passage began at "OUSD is a new stablecoin...", which
    # omits both the issuer line ("issued by Bridge and live on Base, Ethereum,
    # Solana, and Tempo") and the footnote naming the legal entity ("OUSD is
    # currently issued by Bridge Building Inc."). The anchor is moved back to the
    # article's first line and the length is extended so the passage carries the
    # launch line, the legal-entity footnote and the OCC caveat together.
    add("SS-052", "OUSD was issued by Bridge Building Inc. and went live on Base, Ethereum, Solana and Tempo.",
        "fact", "bridge-ousd-is-live.html", "Today, Open Standard launched Open USD", "https://www.bridge.xyz/blog/ousd-is-live-issued-by-bridge", "2026-09-30",
        "Issuer's own launch announcement. The issuer is the legal entity named in the article's footnote, Bridge Building Inc.",
        "None for the fact of issuance. The article's footnote is explicit that Bridge National Trust Bank is a separate, not yet operational legal entity that does not issue OUSD, and that the OCC approval is conditional rather than a final charter. The phrase 'a Stripe company' is NOT asserted here: it is supported by a different capture (SS-052b), not by this one.",
        "If Bridge announces a change of issuer.", "open-usd", 1300)
    add("SS-052b", "Open Standard's own launch page states that OUSD is issued by Bridge, a Stripe company, with reserves held at BlackRock, Lead Bank and BNY.",
        "fact", "openstandard-ousd-is-live.html", "OUSD is issued by Bridge, a Stripe company", "https://joinopenstandard.com/blog/open-usd-is-live", "2026-09-30",
        "Open Standard's own announcement, a second and separate capture from the Bridge post used for SS-052. It is the capture that carries the 'a Stripe company' characterisation and the custodian list.",
        "Two issuer-side sources are used for the issuer identity because neither one alone states both the legal entity and the corporate parent. The custodial arrangement is stated by the company, not independently audited here.",
        "If Open Standard publishes a different issuer or custodian statement.", "open-usd", 420)
    add("SS-053", "The Bridge reserve page reported OUSD total supply in circulation of $468,445,399 at 11:30 UTC on October 1, 2026, with reserve assets of $257,214,691 cash and $211,230,708 Treasuries, described as fully collateralised, and Treasuries including money market funds with T-bill ladders under three months.",
        "fact", "bridge-reserves-ousd.html", "468,445,399 OUSD Total Supply in Circulation", "https://reserves.bridge.xyz/ousd", "2026-10-01",
        "Issuer self-reported reserve page at one timestamp. Cash plus Treasuries sums exactly to total supply.",
        "Self-reported. Supply is not adoption, velocity or payment volume.",
        "If the reserve page shows a materially different composition or collateralisation.", "open-usd", 620)
    add("SS-054", "Bridge stated that it received conditional OCC approval to establish Bridge National Trust Bank.",
        "fact", "bridge-ousd-is-live.html", "conditional approval to establish Bridge National Trust Bank", "https://www.bridge.xyz/blog/ousd-is-live-issued-by-bridge", "2026-09-30",
        "Issuer statement about a regulatory milestone. Conditional approval is not final charter authorisation.",
        "No primary OCC order is stored in this record, so the conditions and current status are unverified here.",
        "If the OCC issues a final charter or a denial.", "open-usd", 460)
    add("SS-055", "OUSD went live on Solana on September 30, 2026 with free 1:1 mint and burn.",
        "fact", "solanacompass-ousd-solana.json", "went live on Solana on 30 September with free 1:1 mint and burn", "https://solanacompass.com/news/open-standards-ousd-stablecoin-goes-live-on-solana", "2026-09-30",
        "Third-party reporting of a launch event.",
        "Launch is not usage; no Solana holder counts are stored in this record.",
        "If OUSD is delisted from Solana.", "open-usd", 460)

    # --- Circle: the actual reserve-yield distribution arrangement ---
    add("SS-060", "Circle's Q2 2026 Form 10-Q states that distribution costs payable to key distributors such as Coinbase and Binance are directly impacted by the amount of USDC held on their platforms.",
        "fact", "circle-crcl-20260630-10q.txt", "our distribution costs payable to key distributors such as Coinbase and Binance are directly impacted", "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042", "2026-06-30",
        "Issuer filing. This is the primary evidence that incumbents already tie distributor economics to balances.",
        "The filing does not disclose the rate or the contractual formula, only that it is balance-linked.",
        "If Circle discloses distributor terms or changes the linkage.", "economics", 620)
    add("SS-061", "Circle reported reserve income of $667,733 thousand and distribution and transaction costs of $410,414 thousand for the three months ended June 30, 2026, and reserve income of $1,320,241 thousand against distribution and transaction costs of $815,816 thousand for the six months then ended.",
        "fact", "circle-crcl-20260630-10q.txt", "Reserve income $ 667,733", "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042", "2026-06-30",
        "Unaudited condensed consolidated statements. Tool-computed ratios are in the ledger's arithmetic record.",
        "Distribution and transaction costs are combined in the filing, so the distribution-only portion cannot be isolated.",
        "If Circle separates distribution from transaction costs in a later filing.", "economics", 620)
    add("SS-062", "Circle reported accrued distribution costs of $105,799 thousand as of June 30, 2026, down from $119,038 thousand as of December 31, 2025.",
        "fact", "circle-crcl-20260630-10q.txt", "Accrued distribution costs $ 105,799", "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042", "2026-06-30",
        "Balance sheet liability line, in thousands.",
        "A balance, not a period expense; it cannot be read as a payout rate.",
        "If the accrued balance moves sharply in a later filing.", "economics", 460)
    add("SS-063", "CNBC reported that the OCC granted Circle approval to operate as a trust bank, giving it the ability to manage reserves directly for its regulated stablecoins, and that the charter does not authorise Circle to operate as a commercial bank taking deposits and making loans.",
        "fact", "cnbc-circle-occ-charter.json", "The new bank will operate under the name Circle National Trust", "https://www.cnbc.com/", "2026-07-01",
        "Secondary reporting of a regulatory event; no primary OCC order is stored.",
        "Date of the article is inferred from capture metadata and should be confirmed before publication.",
        "If the OCC publishes or withdraws the approval.", "regulatory", 620)

    # --- RWA ---
    add("SS-070", "Reported tokenized RWA value excluding stablecoins was about $33.5 billion in early July 2026 per RWA.xyz, with a separate represented or pipeline value near $345 billion that counts assets committed to tokenization but not yet freely tradable.",
        "fact", "cryptorank-rwa-tokenization.json", "reached approximately $33.5 billion as of early July 2026", "https://cryptorank.io/news/feed/d6bff-rwa-tokenization-news-today", "2026-07-15",
        "Distributed on-chain value only. The two measures are different quantities and must never be conflated.",
        "Aggregator reporting of RWA.xyz data; underlying methodology not independently checked.",
        "If RWA.xyz revises its distributed value series.", "rwa", 620)
    add("SS-071", "An analysis cited in secondary reporting found that 56 percent of tokenized assets worth over $100,000 recorded zero weekly on-chain activity, with 379 of 1,289 tracked assets seeing any transfers in a typical week.",
        "fact", "cryptorank-rwa-tokenization.json", "out of 1,289 tokenized assets tracked, only 379 saw any transfers", "https://cryptorank.io/news/feed/d6bff-rwa-tokenization-news-today", "2026-07-15",
        "One snapshot from an analysis this capture only describes as widely cited. The definition of idle is not stated in the source, and earlier drafts misstated it as 56 percent of value.",
        "The 56 percent is a count-based figure over assets above a value threshold, not a value-weighted share, and the original analysis is not stored here.",
        "If the original analysis is retrieved and states a different denominator.", "rwa", 620)
    # R2 F-002 was understated. The $2.7 billion figure is not merely absent from
    # the sliced passage, it is absent from the whole cryptorank capture: the only
    # "2.7" there is "$2.7 trillion", a 2030 DeFi-deployment projection, a
    # different quantity in a different unit. The August 2026 "$2.7 billion"
    # BUIDL figure actually lives in reap-global-stablecoin-stats.json ("Circle
    # USYC held ~$3.0 billion and BlackRock BUIDL ~$2.7 billion", DefiLlama,
    # Aug 2026), so SS-072 is split: the $2.5-2.9bn range stays on the
    # cryptorank capture, the $2.7bn August figure moves to its real source.
    add("SS-072", "Secondary reporting gives BlackRock's BUIDL fund at roughly $2.5 to $2.9 billion, and notes it became tradeable on Uniswap via UniswapX in February 2026.",
        "fact", "cryptorank-rwa-tokenization.json", "led by BlackRock’s BUIDL fund at roughly $2.5-2.9 billion", "https://cryptorank.io/news/feed/d6bff-rwa-tokenization-news-today", "2026-07-15",
        "Secondary aggregator reporting of a fund size, as of early July 2026. No primary issuer AUM disclosure is stored in this record, so no current AUM figure is asserted.",
        "The BUIDL AUM gap remains open. This capture contains no $2.7 billion figure for BUIDL; its only 2.7 is a $2.7 TRILLION 2030 DeFi-deployment projection, which is a different quantity and must not be read as a fund size (R2 F-002, corrected beyond the review's own wording). Spark Money gives $2.4 billion as of May 2026 (SS-072b). All three carry different dates and are not interchangeable.",
        "A primary issuer disclosure of BUIDL AUM.", "rwa", 480)
    add("SS-072b", "A separate secondary compilation reports BlackRock BUIDL at about $2.7 billion as of August 2026, alongside Circle USYC at about $3.0 billion, and elsewhere gives both funds as each about $2.4 to $3.0 billion.",
        "fact", "reap-global-stablecoin-stats.json", "BlackRock BUIDL ~$2.7 billion", "https://reap.global/blog/stablecoin-statistics-2026", "2026-08-13",
        "One aggregator citing DefiLlama, August 2026, for on-chain tokenized Treasury products. This is the actual source of the 2.7 billion figure that R2 could not locate in the cryptorank capture.",
        "Neither figure is a primary issuer disclosure. The same compilation also states the two funds as 'each ~$2.4-3.0 billion', which brackets the 2.7 billion point figure rather than contradicting it. Combined with SS-072 and SS-072c the record holds three differently dated secondary figures for one fund, which is the reason no AUM number is asserted.",
        "A primary issuer disclosure of BUIDL AUM.", "rwa", 460)
    add("SS-072c", "Spark Money reported that as of May 2026 BUIDL held approximately $2.4 billion and was deployed across eight chains: Ethereum, Solana, Polygon, Optimism, BNB Chain, Avalanche, Arbitrum and Aptos.",
        "fact", "spark-money-rwa-tokenization.json", "As of May 2026, BUIDL holds approximately", "https://www.spark.money/research/rwa-tokenization-bitcoin-blockchain", "2026-05-01",
        "Secondary research-house reporting, May 2026, with a deployment list. Still not a primary issuer disclosure, so still no AUM asserted.",
        "This passage was previously unreadable: the R1 build's tag-strip regex deleted 3,716 characters of this capture, including this sentence (R3 tooling defect, see review-disposition.json R3-01). The upstream causal-laguna ledger had already flagged the $2.5-2.9B against $2.4B conflict; that flag is now readable in the primary capture itself and is consistent.",
        "A primary issuer disclosure of BUIDL AUM.", "rwa", 560)
    add("SS-073", "The same reporting says only about 10 percent of tokenized RWA value flows into DeFi protocols.",
        "fact", "cryptorank-rwa-tokenization.json", "only about 10% of tokenized RWA value currently flows into DeFi protocols", "https://cryptorank.io/news/feed/d6bff-rwa-tokenization-news-today", "2026-07-15",
        "Share of value deployed in DeFi as reported. Definition of deployment is not given.",
        "Single secondary source; not independently verified.",
        "If a primary dataset reports a materially different DeFi deployment share.", "rwa", 460)

    # --- x402 ---
    add("SS-080", "Bitquery counted every payment of the x402 shape on six chains and reported that August 2026 came to 18.3 million payments worth $2.6 billion across five countably comparable EVM chains, with almost nine tenths of the value in a single bridging contract on Arbitrum.",
        "fact", "bitquery-x402.html", "August came to 18.3 million payments worth $2.6 billion", "https://bitquery.io/investigations/x402-ai-agent-payments-audit", "2026-09-06",
        "Five chains counted the same way; a sixth could not be. Chain-level and cross-chain scopes are not interchangeable.",
        "The headline value is dominated by bridge transfers, not commerce.",
        "If Bitquery revises the chain set or counting method.", "x402", 620)
    add("SS-081", "Bitquery states that a single verified contract, Circle's cross-chain transfer protocol extension, took 97.5 percent of Arbitrum's whole volume in August from 34,577 payers, and that excluding that one contract the rail moved $317 million in August rather than $2.59 billion.",
        "fact", "bitquery-x402.html", "Take that one contract out and the rail moved $317 million", "https://bitquery.io/investigations/x402-ai-agent-payments-audit", "2026-09-06",
        "Arbitrum-only scope. An earlier review challenged this figure arithmetically, but $317 million is the source's own stated residual and is quoted here as such.",
        "Do not subtract 97.5 percent from a cross-chain total; the scopes differ.",
        "If Bitquery publishes a corrected decomposition.", "x402", 620)
    add("SS-082", "Bitquery reports that two automated loops account for 83 percent of the agent payments it found: one wallet sending 13.2 million payments to a single address over 52 days on Base, and 5.7 million one-cent payments on Polygon.",
        "fact", "bitquery-x402.html", "Those two together are 83% of every agent payment", "https://bitquery.io/investigations/x402-ai-agent-payments-audit", "2026-09-06",
        "Bot-dominance finding within the payments Bitquery could attribute to the x402 shape.",
        "One source; not corroborated by an independent chain analytics firm in this record.",
        "An independent audit reproducing or contradicting the loop shares.", "x402", 620)
    add("SS-083", "Chainalysis reports that growth in agentic payment activity was driven substantially by meme coin farming, with PING, a pay-to-mint experiment charging 1 USDC, processing over 150,000 transactions in its first month.",
        "fact", "chainalysis-x402.md", "meme coin activity, particularly PING", "https://www.chainalysis.com/blog/x402-agentic-payments-adoption/", "2026-06-03",
        "One analytics firm's account of what drove transaction counts. Establishes count inflation, not payment volume.",
        "Single source for this attribution.",
        "An independent breakdown separating protocol experimentation from commerce.", "x402", 620)
    add("SS-084", "Visa and Artemis report that, since its May 2025 launch, one x402 implementation processed roughly $15.0 million in adjusted volume across 109.6 million transactions, where adjusted totals exclude identified wash and test activity.",
        "fact", "visa-artemis-x402.md", "it has processed roughly", "https://www.visa.com/en-us/thought-leadership/innovation/agentic-payments-from-the-ground-up", "2026-04-21",
        "Wash-adjusted figures for one ecosystem, a data-as-of of April 2026, earlier than the other x402 measurements.",
        "Different scope, date and adjustment rules from the cross-chain counts; cannot be averaged with them.",
        "If Visa and Artemis restate the adjusted series.", "x402", 560)

    # --- Market size, single-source, range reported ---
    add("SS-085", "The x402scan dashboard capture, as fetched on 2026-10-01, reports global totals of 12,293,450 transactions, 27,467 unique buyers, 38,519 unique sellers and a total amount of 974,215,144,043 raw USDC units, which is $974,215.14 at six decimals.",
        "fact", "x402scan.html.txt", "total_transactions", "https://www.x402scan.com/", "2026-10-01",
        "One dashboard's own cumulative-to-capture totals, read from the page's embedded data payload and unit-converted by tool. This is the low end of the x402 volume range and it is now evidenced, which the R1 draft's $996 thousand figure was not.",
        "The earlier $996,474 across 18.1 million transactions figure in the R1 synthesis came from a prose research draft and matches neither this capture's volume (974,215.14) nor its transaction count (12,293,450); it is withdrawn. The dashboard's own window, inclusion rules and refresh cadence are not stated in the capture, so this total is not directly comparable with Bitquery's August-only five-chain figure or with the Visa and Artemis wash-adjusted series. Do not average or subtract across them.",
        "If x402scan restates its totals or documents its counting window.", "x402", 520)
    add("SS-090", "DefiLlama-reported total stablecoin market capitalisation was $308.0 billion as of 13 August 2026, up 14.3 percent year over year and about 99.5 percent dollar-denominated, and 4.5 percent below its May 2026 peak.",
        "fact", "reap-global-stablecoin-stats.json", "The total stablecoin market capitalisation is", "https://reap.global/blog/stablecoin-statistics-2026", "2026-08-13",
        "One aggregator's figure, reported here without the cross-source range because no other market-cap capture in this record is a primary measurement.",
        "Earlier drafts quoted a 270 to 317 billion range attributed to Brookings and the Federal Reserve; those captures are not stored in this record, so the range is not asserted here.",
        "A second independent market-cap measurement for the same date.", "market", 620)

    # --- Kind: inference, hypothesis, opinion, all explicitly labelled ---
    add("SS-100", "INFERENCE: reserve earnings exist for someone. Circle already pays balance-linked distribution costs to key distributors. Open Standard's proposal to route reserve earnings to partners is therefore a redistribution of an existing practice, not the introduction of one, and its novelty claim is not established by the evidence in this record.",
        "inference", "circle-crcl-20260630-10q.txt", "our distribution costs payable to key distributors such as Coinbase and Binance are directly impacted", "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042", "2026-06-30",
        "Inference from Circle's filing plus Open Standard's own structure statement. Labelled inference, not fact.",
        "Circle's filing does not disclose the rate, and Open Standard's fee and allocation are undisclosed, so the two arrangements cannot be compared on magnitude.",
        "Disclosure of distributor rates by any issuer would let this be scored rather than argued.", "economics", 620)
    add("SS-101", "HYPOTHESIS: if Open USD's partner yield-sharing works as described, the first observable effect should be partner-driven supply growth rather than holder yield. Supply growth without a rising count of live payment integrations would falsify the incentive thesis.",
        "hypothesis", "bridge-reserves-ousd.html", "468,445,399 OUSD Total Supply in Circulation", "https://reserves.bridge.xyz/ousd", "2026-10-01",
        "Stated as a testable prediction with its own falsifier, not as a conclusion.",
        "No counterfactual baseline for a comparable launch exists in this record, so the test is not yet runnable.",
        "A dated snapshot showing supply growth with flat or falling live integrations.", "open-usd", 620)
    add("SS-102", "SCENARIO: if the Kansas City Fed component figures were the operative ones, a $650 billion shift of deposits into stablecoins would add roughly $273 billion of net Treasury holdings rather than the $195 billion implied by the article's stated $0.30 rate. This is arithmetic on a contested source figure, not a forecast.",
        "scenario", "kc-fed-stablecoin-treasury.json", "Assuming the stablecoin market grows from $250 billion to $900 billion", KC, "2025-08-08",
        "Scenario arithmetic only. Both rates are the article's; the article itself allows zero or negative net demand.",
        "Illustrative scaling of a source whose own components and stated net disagree.",
        "Resolution of the source's internal $0.12 inconsistency.", "us-debt", 620)

    ledger = []
    for s in spec:
        txt = texts.get(s["copy"])
        if txt is None:
            ledger.append({**{k: v for k, v in s.items() if k not in ("copy", "anchor", "length", "before", "topic")},
                           "source_path": None, "exact_passage": None,
                           "passage_finder_status": "CAPTURE_NOT_COPIED", "topic": s["topic"]})
            continue
        passage = slice_passage(txt, s["anchor"], s["length"], s["before"])
        ledger.append({
            "id": s["id"],
            "claim": s["claim"],
            "kind": s["kind"],
            "topic": s["topic"],
            "source_url": s["source_url"],
            "as_of": s["as_of"],
            "captured_at": "2026-10-01",
            "source_path": f"final/evidence/{s['copy']}",
            "exact_passage": passage,
            "passage_finder_status": "SLICED_VERBATIM" if passage else "ANCHOR_NOT_FOUND",
            "measurement_scope_and_exclusions": s["scope"],
            "uncertainty_and_contrary_evidence": s["uncertainty"],
            "falsifier": s["falsifier"],
        })
    return ledger


X402SCAN_RE = re.compile(
    r"\\\"total_transactions\\\":(\d+),"
    r"\\\"total_amount\\\":(\d+),"
    r"\\\"unique_buyers\\\":(\d+),"
    r"\\\"unique_sellers\\\":(\d+),"
    r"\\\"latest_block_timestamp\\\":\\\"([^\"]+)\\\""
)


def extract_x402scan(path, out_path):
    """Deterministic text rendering of the x402scan dashboard totals.

    The page is a Next.js app whose global statistics live in the embedded RSC
    payload inside <script> tags, so a normal markup strip removes the very
    numbers the capture exists to evidence. This reads the payload with one
    explicit regex and writes a small text file whose exact contents are
    reproducible from the capture. It invents nothing: every number written is
    copied verbatim from the payload, and the assertion below re-reads the
    capture and fails loudly if the payload is absent or changes shape.
    """
    raw = open(path, errors="replace").read()
    m = X402SCAN_RE.search(raw)
    if not m:
        raise SystemExit(f"x402scan payload not found in {path}; refusing to synthesise")
    tx, amount, buyers, sellers, ts = m.groups()
    lines = [
        "Source: https://www.x402scan.com/",
        f"Retrieved: 2026-10-01",
        "Extraction: final/evidence/build_claims.py extract_x402scan(), one regex on the",
        "            embedded RSC payload. Numbers below are copied verbatim from the",
        "            capture; the USD figure is a tool unit conversion, not a source quote.",
        "",
        "GLOBAL STATISTICS (verbatim from the page's embedded data payload)",
        f'"total_transactions": {int(tx):,}',
        f'"total_amount": {int(amount):,}   (raw units)',
        f'"unique_buyers": {int(buyers):,}',
        f'"unique_sellers": {int(sellers):,}',
        f'"latest_block_timestamp": {ts}',
        "",
        f"total_amount at 6 decimals: ${int(amount) / 10**X402SCAN_USDC_DECIMALS:,.2f}",
        f"average per transaction:    ${int(amount) / 10**X402SCAN_USDC_DECIMALS / int(tx):,.6f}",
    ]
    text = "\n".join(lines) + "\n"
    open(out_path, "w").write(text)
    return text


def main():
    os.makedirs(EVDIR, exist_ok=True)
    manifest = []
    texts = {}
    for src, dst in COPIES.items():
        sp = os.path.join(D, src)
        if not os.path.exists(sp):
            manifest.append({"declared_source": src, "copy": dst, "status": "SOURCE_ABSENT"})
            continue
        data = open(sp, "rb").read()
        dp = os.path.join(EVDIR, dst)
        open(dp, "wb").write(data)
        rec = {
            "copy": f"final/evidence/{dst}",
            "copied_from": src,
            "sha256": hashlib.sha256(data).hexdigest(),
            "bytes": len(data),
        }
        meta = {}
        if src.endswith(".json"):
            meta = json.loads(open(sp, errors="replace").read())
            rec["capture_url"] = meta.get("url")
            rec["captured_at"] = meta.get("capturedAt")
        manifest.append(rec)
        if src.endswith(".json") or src.endswith(".md") or src.endswith(".html") or src.endswith(".txt"):
            texts[dst] = flat(body(src)[0])
        elif src.endswith(".pdf"):
            # PDF text is extracted to a sibling .txt at run time; the PDF itself
            # stays in evidence/ as the durable original.
            txt_path = os.path.join(EVDIR, dst + ".txt")
            subprocess.run(["pdftotext", sp, txt_path], check=False)
            if os.path.exists(txt_path):
                texts[dst] = flat(open(txt_path, errors="replace").read())
                rec["text_extraction"] = f"final/evidence/{dst}.txt (pdftotext)"
                manifest[-1] = rec

        if dst == "x402scan.html":
            # The dashboard's totals are inside <script>, which strip_markup
            # correctly removes. The ledger therefore reads the derived text
            # file, and the claim's source_path points at that file so the
            # verifier can check the passage against a real stored artefact.
            txt_path = os.path.join(EVDIR, dst + ".txt")
            extract_x402scan(dp, txt_path)
            texts[dst + ".txt"] = flat(open(txt_path, errors="replace").read())
            rec["text_extraction"] = f"final/evidence/{dst}.txt (build_claims.py extract_x402scan)"
            rec["extraction_note"] = (
                "Derived text rendered from the page's embedded RSC payload. "
                "The raw capture is retained alongside it."
            )
            manifest[-1] = rec

    from weak_section_updates import extend_manifest, update_arithmetic
    manifest = extend_manifest(manifest, EVDIR)
    update_arithmetic(ARITH)
    json.dump({"declared_count": len(manifest), "copied": manifest},
              open(os.path.join(FINAL, "evidence-manifest.json"), "w"), indent=1)
    json.dump({"tool": "final/evidence/build_claims.py", "computed": ARITH},
              open(os.path.join(EVDIR, "arithmetic.json"), "w"), indent=1)
    print(json.dumps(ARITH, indent=1))
    print("copied", len(manifest), "captures")
    return texts


if __name__ == "__main__":
    texts = main()
    from weak_section_updates import apply_updates
    ledger = apply_updates(build_ledger(texts), EVDIR)
    json.dump(ledger, open(os.path.join(FINAL, "claims.json"), "w"), indent=1)
    ok = sum(1 for c in ledger if c["passage_finder_status"] == "SLICED_VERBATIM")
    print("claims:", len(ledger), "| verbatim sliced:", ok)
    for c in ledger:
        if c["passage_finder_status"] != "SLICED_VERBATIM":
            print("  UNRESOLVED:", c["id"], c["passage_finder_status"])