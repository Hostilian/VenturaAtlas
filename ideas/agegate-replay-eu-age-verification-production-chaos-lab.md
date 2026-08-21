# AgeGate Replay — EU Age-Verification Production Chaos Lab

## Metadata
- **Status:** `DUPLICATE_RESEARCH_UPDATE`
- **Canonical relation:** merge into `idea-309` AgeGate Chaos Lab
- **Reset:** RESET XX (2026-08-21)
- **Score:** 8.4 / 10
- **Category:** Identity & Regulatory Infrastructure / Developer Tools
- **Domain:** EU Digital Identity / Age Assurance / Chaos Engineering

## 1. Executive Summary
AgeGate Replay is the **BrowserStack + Chaos Monkey + Sentry** for online services implementing the EU Age Verification blueprint. Rather than attempting to be an age-verification API (which the EU Commission is already commoditizing with free open-source components), AgeGate Replay stress-tests relying party staging endpoints against the messy, fragmented reality of evolving wallets, browsers, protocols (DC API + ZKP, mdoc, OID4VP), and dynamic trust-list changes.

## 2. The Problem & Market Timing
- **Current rollout:** Seven front-runner countries (FR, DK, GR, IT, ES, CY, IE) are piloting in 2026. The official portal says this is ahead of general availability; it does not commit to full EU rollout by the end of 2026.
- **The Operational Trap:** The Commission's reference verifier is explicitly **not production-ready**. Relying parties must handle multi-modal fallbacks:
  - DC API + ZKP $\rightarrow$ DC API + standard mdoc $\rightarrow$ OID4VP + standard mdoc
  - Stale Commission Trusted List caches
  - Wallet timeouts trapping users in checkout loops
  - Cross-device verification handoff drops
  - Signature replay & attribute mismatches

## 3. The Product: Production Chaos Matrix
A relying party supplies an authorized staging endpoint. The proposed matrix has 14 scenarios, but execution feasibility remains unproven until test credentials and at least two implementations are available. The complete matrix is in `validation-plans/agegate-replay-validation.md`.
1. Chrome + DC API + ZKP (Zero-Knowledge Proof)
2. Android Wallet A vs National Wallet B fallback loop
3. ZKP unavailable $\rightarrow$ mdoc fallback
4. DC API unsupported $\rightarrow$ OID4VP cross-protocol fallback
5. Issuer removed from official Trusted List (verifying unauthorized acceptance)
6. Stale trusted-list cache drift
7. Expired / revoked credential handling
8. Replayed proof rejection
9. Cross-device QR-code wallet timeout recovery

This dossier is preserved as a protocol-specific research update, not a separate idea. The repository already contains the same production-journey testing wedge in `idea-309`, AgeProof Lab, and AgeProof / EUDI Real-World Regression Cloud.

## 4. The €0-Capital Validation Plan
- **Offer:** "EU Age Verification Integration Stress Test — founding pilot €149."
- **Target Audience:** 30–40 software agencies, identity integrators, gaming studios, marketplaces, and online services implementing age assurance.
- **Feasibility gate:** Execute at least 10 scenarios against two authorized implementations.
- **Pass Criteria:** 3 paid audits plus one material reproducible defect missed by existing tools.
- **Strong Pass:** 1 integrator requests automated CI/CD regression runs on every pull request.
- **Kill Condition:** Authorized access cannot be obtained, official/vendor tooling covers the observed matrix, or no buyer pays after 30 qualified offers.
