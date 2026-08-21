# RESET XX — Public Infrastructure Edge
## Research Date: 21 August 2026
**Round Type:** FRESH-SLATE DISCOVERY & INFRASTRUCTURE BOUNDARY PIVOT  
**Classification:** Core Hunting Primitive Evolution, Epistemic Calibration  
**Research Run ID:** `run-res-reset-xx-20260821-public-infrastructure-edge`

> **AUDIT CORRECTION — 21 August 2026:** This supplied leaderboard failed corpus deduplication and is not accepted as a fresh-opportunity ranking. Five retained entries duplicate or re-underwrite existing records. No score below is ranking-eligible, no new canonical idea is approved, and no new staged candidate should be created. See `research/reset-xx-audit/README.md` and `data/reset-xx-audit.json`.

---

## Executive Summary & The New Hunting Primitive

Previous iterations of VenturaAtlas searched for:
$$\text{New Regulation} \longrightarrow \text{Compliance Workflow} \longrightarrow \text{Operational Chokepoint}$$

RESET XX proposes a useful search heuristic, which still requires buyer, substitute, and corpus validation:
### The Public Infrastructure Edge
$$\text{Gov / Standard Body ships Free Core Infrastructure} \longrightarrow \text{Enterprises integrate it} \longrightarrow \text{Reference implementation stops at production boundary} \longrightarrow \text{Interop / Drift / Chaos / Fallback / Reconciliation} \longrightarrow \mathbf{High\text{-}WTP\text{ Testing Moat}}$$

The Commission, national governments, and standard bodies increasingly ship reference implementations, hosted demonstration sandboxes, open-source SDKs, and basic test beds. Some EU age-verification reference components explicitly require further production integration. Relying parties retain operational responsibility for failures such as:
- Cross-device timeouts and UI lockups
- Fallback failures (DC API + ZKP $\rightarrow$ mdoc $\rightarrow$ OID4VP)
- External trust drift (stale Trusted Lists, revoked attestation providers)
- Dynamic edge cases that open-source sample code ignores

---

## Reset Leaderboard

| Rank | Supplied Idea | Supplied Score | Audited Decision | Core Thesis |
|:---:|---|:---:|:---:|---|
| 🥇 **1** | **AgeGate Replay** | **8.4 / 10** | **DUPLICATE — merge into `idea-309`** | EU Age-Verification Production Chaos Lab (BrowserStack + Chaos Monkey for relying parties) |
| 🥈 **2** | **SmallSoft Gate** | **8.0 / 10** | **DUPLICATE — re-underwrite `idea-359`** | Secure runtime, auth, secret isolation, and TTL for 1–10 user AI-generated internal apps |
| 🥉 **3** | **MandateMesh** | **7.9 / 10** | **DUPLICATE — merge into `idea-341` / `idea-344`** | Versioned delegation graph and authority chain for EU Business Wallets before signature |
| **4** | **NonFirm Replay** | **7.6 / 10** | **OVERLAP — GridSlot / CurtailmentCost Replay** | Pre-signature forensic simulation for flexible / non-firm grid connection agreements |
| **5** | **TrustList Sentry** | **7.4 / 10** | **DUPLICATE FEATURE — TrustList Drift** | Git diff / drift monitor for EU digital trust infrastructure & attribute catalogues |
| **6** | **FieldHandoff** | **7.3 / 10** | **ADJACENT FEATURE — research only** | Chain-of-custody and handoff receipts across Human $\leftrightarrow$ Robot $\leftrightarrow$ Agent physical work |
| **7** | **CashCliff** | **7.0 / 10** | **RESEARCH ONLY — crowded/unproven** | Probabilistic job-level liquidity scenarios for trade contractors |
| **8** | **DPP Roundtrip** | **6.8 / 10** | 🔴 **KILLED (OVERLAP)** | Overlaps existing VenturaAtlas DPP & Registry testing sandbox |
| **9** | **EUDR OutageProof** | **6.4 / 10** | 🔴 **KILLED (TOO NARROW)** | Short half-life contingency identifiers; overlaps existing EUDR family |
| **10** | **API Patch Receipt** | **6.3 / 10** | 🔴 **KILLED (INSUFFICIENT NOVELTY)** | API drift/change detection already heavily mined across repository |

---

## Pruned & Killed Hypotheses (Exclusion Map)

- **Generic EU Age-Verification API:** Killed. The Commission and national bodies provide free reference verifier components, wallets, and test harnesses.
- **Generic EUDI Conformance Tester:** Downgraded. The official Functional Conformance Assessment Framework (FCAF) and Test Bed are advancing rapidly.
- **Generic DPP Registry Validator / Generator:** Killed. The live EU Registry already includes testing sandboxes and validation rules.
- **CRA Incident-Reporting Dashboard:** Duplicate of CRA Clock / CRA ReachLedger (`idea-401`).
- **Generic SMB Cash-Flow App:** High competition (Relay, Float, Pulse, QuickBooks Cash).

---

## Strategic Validation Directives

1. **AgeGate Chaos Lab / `idea-309` update (€149 Founding Pilot):**
   - Contact 30–40 software agencies, identity integrators, gaming studios, and platforms.
   - Run a scripted 14-scenario chaos test against their staging endpoint.
   - Falsify: Will integrators pay for real-world chaos & edge-case testing beyond free Commission testbeds?

2. **Small-Software Deployment Cloud / `idea-359` re-underwriting (€29 Concierge Deployment):**
   - Target power users with 5–10 local AI-generated Streamlit/Node tools.
   - Wrap local tools with Passkey/Google login, secret isolation, user allowlists, and auto-destroy TTLs.
   - Compare Replit private deployments and Vercel, Cloudflare, and Modal sandboxes.
   - Falsify: Are builders willing to pay for controls their cheapest substitute does not provide?
