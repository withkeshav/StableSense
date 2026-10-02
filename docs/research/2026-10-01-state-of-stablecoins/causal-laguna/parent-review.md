# Parent review: causal challenger not accepted as finished synthesis

Status: useful leads recovered; report requires correction before use.

## Measured structure

Python checked the written artifacts: 16 key_claim_verification entries, not the
18 claimed in the child handoff. The reported 106 is the size of the input pool,
not a complete verification ledger. There are 8 source JSON files and 7 manifest
entries. Six manifest entries resolve under sources/; vb-opinion-status.json is
at the record root, contrary to the manifest's common base_dir. A path that exists
elsewhere does not satisfy its declared locator.

## Source check: Treasury demand

Parent fetched the Kansas City Fed source directly:
https://www.kansascityfed.org/research/economic-bulletin/stablecoins-could-increase-treasury-demand-but-only-by-reducing-demand-for-other-assets/

The source's explicitly conditional scenario uses issuer Treasury allocation
of 0.50 and bank allocation of 0.20, yielding net 0.30. The child's claimed exact
passage instead says bank allocation 0.08. Tool arithmetic gives 0.50 - 0.08 =
0.42, not 0.30. Use the actual source assumptions and do not call this a universal
measured marginal effect or a cap. The source also allows zero or negative net
demand depending on funding sources and equilibrium asset allocation.

## Other defects requiring disposition

- GENIUS reserve eligibility includes assets besides Treasury bills. The report's
  blanket assertion that reserves are legally bound to T-bills is overbroad.
- Distinct legal wrappers do not prove RWA and stablecoins never substitute. The
  report itself lists mechanisms for substitution; the bottom line exceeds its
  evidence. The idle-value definition remains unverified.
- Claims that USDC distribution partners receive no reserve-yield incentive need
  comparison with actual Circle/Coinbase distribution agreements. The report did
  not supply that comparison and cannot establish uniqueness by assertion.
- OUSD's hypothetical Treasury-only yield pool is a scenario, not actual income
  or a guaranteed equal partner allocation. Python gives 9,507,099.37 per year
  for 468,445,399 * 0.451 * 0.045, before fees. Dividing equally among 200 gives
  47,535.50, but neither equal shares nor the assumed rate is established.
- The Arbitrum 97.5% bridge share must not be applied to a cross-chain total. As
  a purely hypothetical arithmetic check, 2.59 billion * (1 - 0.975) is 64.75
  million, not the reported 317 million. Reconcile chain scope and denominators
  before using either subtraction.
- Fixed supply/transaction thresholds in the report are unsupported judgement,
  not established falsifiers of causal mechanisms.
- Spark Money is secondary reporting for BUIDL, not primary issuer AUM evidence.
  Its historical figure cannot become a current AUM correction without its date.
- The IMF paper recovery is a promising lead. Independently check the stored
  original PDF and quotation before accepting the claim; multiple parsing methods
  on one paper are not three independent sources.

## External opinion

No space-bunny-free opinion was obtained. The child conflated a gateway virtual
key with the authorized upstream VB route and used the malformed provider ID
opencod-go in attempts. Provider-restricted failures and malformed IDs do not
establish that the real VB lane is unavailable. Do not propagate its global
provider verdict. The completion also records an unread failed CLI result.
Do not inspect or test unrelated bot keys or operator sessions in follow-up.

Preserve the child report for provenance. No report conclusion above is approved
for publication; original research and public site remain untouched by this review.
