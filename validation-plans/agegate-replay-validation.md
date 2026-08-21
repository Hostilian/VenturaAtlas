# `idea-309` AgeGate Chaos Lab — EU Blueprint Validation Update

**Disposition:** Merge experiment into existing canonical `idea-309`; do not validate or promote AgeGate Replay as a separate idea.

## 1. Core Falsification Hypothesis
**Hypothesis:** Identity integrators, gaming platforms, and digital services will pay €149–€499 for an authorized production-journey chaos and interoperability test because their identity provider and official conformance tools do not cover the observed failure modes.

**Kill Trigger:** Kill if authorized test access cannot be obtained, the official/vendor tools cover the same observed matrix, or no buyer pays after 30 qualified offers. Statements alone are not a pass or kill result; inspect the buyer's actual test evidence where authorized.

## 2. Target Audience (Sample Size: 40)
- Technical Leads at European Identity & Access Management (IAM) consultancies
- VP Engineering / Compliance Leads at online gaming and media platforms in FR, DK, GR, IT, ES, CY, IE
- Age assurance solution providers and specialized aggregators

## 3. The 14-Scenario Chaos Test Suite

This is a proposed matrix, not a completed automated harness. Before outreach claims automation, execute at least 10 scenarios against two authorized implementations using test credentials and record reproducible traces.
1. `CHROME_DC_API_ZKP_HAPPY`: Chrome + Digital Credentials API + Zero-Knowledge Proof
2. `FALLBACK_MDOC`: ZKP unavailable $\rightarrow$ fallback to standard ISO 18013-5 mdoc
3. `FALLBACK_OID4VP`: DC API unsupported $\rightarrow$ fallback to OID4VP protocol
4. `WALLET_TIMEOUT_TRAP`: Wallet authentication exceeds 60s; test session drop vs. recovery
5. `TRUST_LIST_REVOKED`: Attestation provider deleted from Commission Trusted List
6. `STALE_CACHE_DRIFT`: Staging server running on 7-day stale Trusted List cache
7. `CROSS_DEVICE_QR_FAIL`: Mobile camera QR scan drops connection halfway
8. `MALFORMED_CLAIM`: Under-18 credential presented; assert rejection fidelity
9. `REPLAY_ATTACK`: Same ZKP proof submitted twice within 5 minutes
10. `ATTRIBUTE_MISMATCH`: Verifier requests `age_over_18` but receives `birth_date`
11. `MULTIPLE_NATIONAL_WALLETS`: France Identité vs. Italian IT-Wallet signature formats
12. `NETWORK_LATENCY_SPIKE`: Inject 3000ms latency on issuer public key retrieval
13. `UNTRUSTED_ROOT_ANCHOR`: Issuer signed by non-notified trust anchor
14. `EXPIRED_MDOC`: Valid signature but expired attestation validity interval

## 4. Financial Target & Offer
- **Founding Pilot Price:** €149 fixed fee per staging report.
- **Success Criteria:** 3 paid audits completed within 14 days, one repeat-release request, and one material reproducible defect missed by the buyer's existing tools.
- **Safety boundary:** Test only systems and credentials the owner has explicitly authorized; do not test production users or third-party wallets without permission.
