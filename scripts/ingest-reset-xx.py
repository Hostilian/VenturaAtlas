#!/usr/bin/env python3
"""
RESET XX — Superseded Ingestion Script for 21 August 2026 Reset
======================================================
Preserves the original supplied Reset XX ingestion payload for archaeology.
Execution is disabled because the post-ingestion audit found that the top ideas
duplicate or re-underwrite existing corpus records. See:

- research/reset-xx-audit/README.md
- data/reset-xx-audit.json

The original payload attempted to ingest:
1. AgeGate Replay — EU Age-Verification Production Chaos Lab (APPROVED_FOR_VALIDATION)
2. SmallSoft Gate — Secure Runtime for Tiny Agent-Built Apps (APPROVED_FOR_VALIDATION)
3. MandateMesh — Business-Wallet Delegation Graph (STRATEGIC_WATCH / DEEP_RESEARCH)
4. NonFirm Replay — Flexible Grid-Connection Economics Simulator (DEEP_VALIDATION)
5. TrustList Sentry — EUDI External-Trust Drift Monitor (PLATFORM_PRIMITIVE)
6. FieldHandoff — Human/Robot/Agent Work Receipt (RESEARCH_LEDGER)
7. CashCliff — Job-Level 13-Week Liquidity Replay (RESEARCH_LEDGER)

Generates:
- research/RESET_XX_PUBLIC_INFRASTRUCTURE_EDGE_2026-08-21.md
- Markdown dossiers in ideas/
- Markdown validation plans in validation-plans/
- Staged records in data/idea-staging-queue.json
"""

import json
import os
import sys
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESEARCH_DIR = os.path.join(ROOT, "research")
IDEAS_DIR = os.path.join(ROOT, "ideas")
VAL_PLANS_DIR = os.path.join(ROOT, "validation-plans")
STAGING_QUEUE_PATH = os.path.join(ROOT, "data", "idea-staging-queue.json")

RESET_DATE = "2026-08-21"
RESET_ID = "run-res-reset-xx-20260821-public-infrastructure-edge"

# 1. Research Markdown
RESEARCH_MD_CONTENT = """# RESET XX — Public Infrastructure Edge
## Research Date: 21 August 2026
**Round Type:** FRESH-SLATE DISCOVERY & INFRASTRUCTURE BOUNDARY PIVOT  
**Classification:** Core Hunting Primitive Evolution, Epistemic Calibration  
**Research Run ID:** `""" + RESET_ID + """`

---

## Executive Summary & The New Hunting Primitive

Previous iterations of VenturaAtlas searched for:
$$\\text{New Regulation} \\longrightarrow \\text{Compliance Workflow} \\longrightarrow \\text{Operational Chokepoint}$$

RESET XX establishes a sharper, structurally more defensible thesis:
### The Public Infrastructure Edge
$$\\text{Gov / Standard Body ships Free Core Infrastructure} \\longrightarrow \\text{Enterprises integrate it} \\longrightarrow \\text{Reference implementation stops at production boundary} \\longrightarrow \\text{Interop / Drift / Chaos / Fallback / Reconciliation} \\longrightarrow \\mathbf{High\\text{-}WTP\\text{ Testing Moat}}$$

The Commission, national governments, and standard bodies are increasingly shipping reference implementations, hosted demonstration sandboxes, open-source SDKs, and basic test beds. However, **their reference verifiers are explicitly not production-ready**. Relying parties bear 100% of the operational risk for real-world failures:
- Cross-device timeouts and UI lockups
- Fallback failures (DC API + ZKP $\\rightarrow$ mdoc $\\rightarrow$ OID4VP)
- External trust drift (stale Trusted Lists, revoked attestation providers)
- Dynamic edge cases that open-source sample code ignores

---

## Reset Leaderboard

| Rank | Fresh Idea | Score | Decision | Core Thesis |
|:---:|---|:---:|:---:|---|
| 🥇 **1** | **AgeGate Replay** | **8.4 / 10** | 🟢 **APPROVED_FOR_VALIDATION** | EU Age-Verification Production Chaos Lab (BrowserStack + Chaos Monkey for relying parties) |
| 🥈 **2** | **SmallSoft Gate** | **8.0 / 10** | 🟢 **APPROVED_FOR_VALIDATION** | Secure runtime, auth, secret isolation, and TTL for 1–10 user AI-generated internal apps |
| 🥉 **3** | **MandateMesh** | **7.9 / 10** | 🟡 **STRATEGIC_WATCH / DEEP_RESEARCH** | Versioned delegation graph and authority chain for EU Business Wallets before signature |
| **4** | **NonFirm Replay** | **7.6 / 10** | 🟡 **DEEP_VALIDATION** | Pre-signature forensic simulation for flexible / non-firm grid connection agreements |
| **5** | **TrustList Sentry** | **7.4 / 10** | 🟡 **PLATFORM_PRIMITIVE** | Git diff / drift monitor for EU digital trust infrastructure & attribute catalogues |
| **6** | **FieldHandoff** | **7.3 / 10** | ⚪ **RESEARCH_LEDGER** | Chain-of-custody and handoff receipts across Human $\\leftrightarrow$ Robot $\\leftrightarrow$ Agent physical work |
| **7** | **CashCliff** | **7.0 / 10** | ⚪ **RESEARCH_LEDGER** | Job-level 13-week liquidity replay & zero-cash date projector for trade contractors |
| **8** | **DPP Roundtrip** | **6.8 / 10** | 🔴 **KILLED (OVERLAP)** | Overlaps existing VenturaAtlas DPP & Registry testing sandbox |
| **9** | **EUDR OutageProof** | **6.4 / 10** | 🔴 **KILLED (TOO NARROW)** | Short half-life contingency identifiers; overlaps existing EUDR family |
| **10** | **API Patch Receipt** | **6.3 / 10** | 🔴 **KILLED (INSUFFICIENT NOVELTY)** | API drift/change detection already heavily mined across repository |

---

## Pruned & Killed Hypotheses (Exclusion Map)

- **Generic EU Age-Verification API:** Killed. The Commission and national bodies provide free reference verifier components, wallets, and test harnesses.
- **Generic EUDI Conformance Tester:** Downgraded. The official Functional Conformance Assessment Framework (FCAF) and Test Bed are advancing rapidly.
- **Generic DPP Registry Validator / Generator:** Killed. The live EU Registry already includes testing sandboxes and validation rules.
- **CRA Incident-Reporting Dashboard:** Duplicate of CRA Clock / CRA ReachLedger (`idea-014`).
- **Generic SMB Cash-Flow App:** High competition (Relay, Float, Pulse, QuickBooks Cash).

---

## Strategic Validation Directives

1. **AgeGate Replay (€149 Founding Pilot):**
   - Contact 30–40 software agencies, identity integrators, gaming studios, and platforms.
   - Run a scripted 14-scenario chaos test against their staging endpoint.
   - Falsify: Will integrators pay for real-world chaos & edge-case testing beyond free Commission testbeds?

2. **SmallSoft Gate (€29 Concierge Deployment):**
   - Target power users with 5–10 local AI-generated Streamlit/Node tools.
   - Wrap local tools with Passkey/Google login, secret isolation, user allowlists, and auto-destroy TTLs.
   - Falsify: Are builders willing to pay to share ephemeral local AI tools securely with teammates?
"""

# 2. Idea Dossiers
IDEAS_DATA = [
    {
        "slug": "agegate-replay-eu-age-verification-production-chaos-lab",
        "title": "AgeGate Replay — EU Age-Verification Production Chaos Lab",
        "rank": 1,
        "score": 8.4,
        "status": "APPROVED_FOR_VALIDATION",
        "category": "Identity & Regulatory Infrastructure",
        "content": """# AgeGate Replay — EU Age-Verification Production Chaos Lab

## Metadata
- **Status:** `APPROVED_FOR_VALIDATION`
- **Reset:** RESET XX (2026-08-21)
- **Score:** 8.4 / 10
- **Category:** Identity & Regulatory Infrastructure / Developer Tools
- **Domain:** EU Digital Identity / Age Assurance / Chaos Engineering

## 1. Executive Summary
AgeGate Replay is the **BrowserStack + Chaos Monkey + Sentry** for online services implementing the EU Age Verification blueprint. Rather than attempting to be an age-verification API (which the EU Commission is already commoditizing with free open-source components), AgeGate Replay stress-tests relying party staging endpoints against the messy, fragmented reality of evolving wallets, browsers, protocols (DC API + ZKP, mdoc, OID4VP), and dynamic trust-list changes.

## 2. The Problem & Market Timing
- **The Mandate:** Seven EU countries (FR, DK, GR, IT, ES, CY, IE) are actively piloting the Commission blueprint in 2026, with full EU rollout expected by end of 2026.
- **The Operational Trap:** The Commission's reference verifier is explicitly **not production-ready**. Relying parties must handle multi-modal fallbacks:
  - DC API + ZKP $\\rightarrow$ DC API + standard mdoc $\\rightarrow$ OID4VP + standard mdoc
  - Stale Commission Trusted List caches
  - Wallet timeouts trapping users in checkout loops
  - Cross-device verification handoff drops
  - Signature replay & attribute mismatches

## 3. The Product: Production Chaos Matrix
A relying party inputs their staging endpoint; AgeGate Replay executes an automated 14-scenario matrix:
1. Chrome + DC API + ZKP (Zero-Knowledge Proof)
2. Android Wallet A vs National Wallet B fallback loop
3. ZKP unavailable $\\rightarrow$ mdoc fallback
4. DC API unsupported $\\rightarrow$ OID4VP cross-protocol fallback
5. Issuer removed from official Trusted List (verifying unauthorized acceptance)
6. Stale trusted-list cache drift
7. Expired / revoked credential handling
8. Replayed proof rejection
9. Cross-device QR-code wallet timeout recovery

## 4. The €0-Capital Validation Plan
- **Offer:** "EU Age Verification Integration Stress Test — founding pilot €149."
- **Target Audience:** 30–40 software agencies, identity integrators, gaming studios, marketplaces, and online services implementing age assurance.
- **Pass Criteria:** 3 paid audits.
- **Strong Pass:** 1 integrator requests automated CI/CD regression runs on every pull request.
- **Kill Condition:** Integrators state their commercial IDP already provides end-to-end chaos coverage across all national wallets.
"""
    },
    {
        "slug": "smallsoft-gate-secure-runtime-for-tiny-agent-built-apps",
        "title": "SmallSoft Gate — Secure Runtime for Tiny Agent-Built Apps",
        "rank": 2,
        "score": 8.0,
        "status": "APPROVED_FOR_VALIDATION",
        "category": "Developer Tools & AI Infrastructure",
        "content": """# SmallSoft Gate — Secure Runtime for Tiny Agent-Built Apps

## Metadata
- **Status:** `APPROVED_FOR_VALIDATION`
- **Reset:** RESET XX (2026-08-21)
- **Score:** 8.0 / 10
- **Category:** Developer Tools / AI Runtime Security
- **Domain:** Small Software / AI Internal Apps / Sandboxed Sharing

## 1. Executive Summary
SmallSoft Gate is the secure runtime and deployment wrapper for "Small Software" — the explosion of single-user or tiny-team apps built by AI agents (Claude, Codex, Gemini). While building apps has become trivial, deploying arbitrary AI-generated code securely with auth, secret isolation, user allowlists, and auto-expiration remains painful. SmallSoft Gate turns `localhost` AI tools into private, hardened web applications via a single CLI command (`smallgate deploy`).

## 2. The Problem
- AI coding tools make bespoke internal apps free to create.
- However, 90% of these apps remain trapped on `localhost` because sharing them with colleagues requires configuring OAuth, environment secrets, database permissions, reverse proxies, and infrastructure management.
- Untrusted AI-generated code introduces prompt injection, data exfiltration, and credential leak risks if exposed naively.

## 3. Product Architecture (`smallgate deploy`)
- **Zero-Config Auth:** Instant Google Login / Passkey authentication with email allowlists.
- **Secret Isolation:** Secure credential vault with read-only/read-write scoping.
- **Runtime Sandboxing:** Outbound network restrictions and resource limits.
- **Lifecycle Management:** 7-day or 30-day automatic TTL, one-click destroy, and version rollback.
- **Audit Logging:** Track who accessed what data inside AI-generated utilities.

## 4. Validation Playbook
- **Target Customer:** Power users and agency operators with 5–10 AI-generated internal tools currently running on `localhost`.
- **Offer:** "€29 Concierge Deployment — I will turn your local AI script/dashboard into a private, auth-gated team app in 15 minutes."
- **Pass Criteria:** 5 repeat deployments from 3 distinct builders.
"""
    },
    {
        "slug": "mandatemesh-business-wallet-delegation-graph",
        "title": "MandateMesh — Business-Wallet Delegation Graph",
        "rank": 3,
        "score": 7.9,
        "status": "STRATEGIC_WATCH",
        "category": "Identity & Legal Infrastructure",
        "content": """# MandateMesh — Business-Wallet Delegation Graph

## Metadata
- **Status:** `STRATEGIC_WATCH / DEEP_RESEARCH`
- **Reset:** RESET XX (2026-08-21)
- **Score:** 7.9 / 10
- **Category:** Identity & Legal Infrastructure
- **Domain:** European Business Wallets / Corporate Authority Graphs

## 1. Executive Summary
MandateMesh builds the versioned, machine-readable delegation graph for European Business Wallets (Council negotiating position adopted June 2026). It solves the complex enterprise question: *"Who has legal authority to sign, seal, or submit this specific transaction on behalf of Company X right now?"*

## 2. The Problem
Enterprise legal authority is dynamic, multi-tiered, and jurisdiction-dependent:
$$\\text{Company} \\longrightarrow \\text{CFO} \\longrightarrow \\text{Subsidiary Director} \\longrightarrow \\text{Customs Broker} \\longrightarrow \\text{AI Agent}$$
Authority can be country-specific, threshold-limited (€50k cap), time-bounded, or revocable. When European Business Wallets go live, relying parties and enterprises will need cryptographically verifiable authority proofs before executing contracts or regulatory filings.

## 3. Core Engine
- **Delegation DAG:** Versioned evidence chain linking board resolutions $\\rightarrow$ power of attorney $\\rightarrow$ wallet keys $\\rightarrow$ active transaction scopes.
- **Pre-Execution Gate:** Verifies authority before signing/submitting to customs, tax, or counterparties.
- **Audit Receipt:** Deterministic proof of legal capacity at timestamp $T$.
"""
    },
    {
        "slug": "nonfirm-replay-flexible-grid-connection-economics-simulator",
        "title": "NonFirm Replay — Flexible Grid-Connection Economics Simulator",
        "rank": 4,
        "score": 7.6,
        "status": "DEEP_VALIDATION",
        "category": "Energy & Grid Infrastructure",
        "content": """# NonFirm Replay — Flexible Grid-Connection Economics Simulator

## Metadata
- **Status:** `DEEP_VALIDATION`
- **Reset:** RESET XX (2026-08-21)
- **Score:** 7.6 / 10
- **Category:** Energy & Grid Infrastructure / Financial Engineering
- **Domain:** Flexible Interconnection / BESS / Curtailment Modeling

## 1. Executive Summary
NonFirm Replay provides independent, pre-signature forensic simulation for battery (BESS) and renewable developers offered "non-firm" or flexible grid connection agreements. It models counterfactual revenue loss vs. grid fee discounts and connection speed advantages across thousands of historical/simulated dispatch intervals.

## 2. The Opportunity & Wedge
- 750–900 GW of global projects are currently blocked in grid queues that non-firm agreements could unlock (IEA 2026).
- The developer's dilemma: *"How much lifetime revenue do I forfeit by accepting a 15% curtailment cap in exchange for connecting 3 years faster?"*
- NonFirm Replay focuses strictly on independent pre-signature contract review rather than generic asset forecasting.
"""
    },
    {
        "slug": "trustlist-sentry-eudi-external-trust-drift-monitor",
        "title": "TrustList Sentry — EUDI External-Trust Drift Monitor",
        "rank": 5,
        "score": 7.4,
        "status": "PLATFORM_PRIMITIVE",
        "category": "Identity & Regulatory Infrastructure",
        "content": """# TrustList Sentry — EUDI External-Trust Drift Monitor

## Metadata
- **Status:** `PLATFORM_PRIMITIVE` (Integrated with AgeGate Replay & MandateMesh)
- **Reset:** RESET XX (2026-08-21)
- **Score:** 7.4 / 10
- **Category:** Identity & Regulatory Infrastructure
- **Domain:** European Trusted Lists / Attribute Catalogues / Trust Drift

## 1. Concept
A "Git diff for European digital trust infrastructure." Monitors Commission-published machine-readable lists of public-sector attestation providers, attribute catalogues, and root certificates (mandated under EU law as of 19 August 2026) to alert relying parties when external trust states change.
"""
    },
    {
        "slug": "fieldhandoff-human-robot-agent-work-receipt",
        "title": "FieldHandoff — Human/Robot/Agent Work Receipt",
        "rank": 6,
        "score": 7.3,
        "status": "RESEARCH_LEDGER",
        "category": "Physical AI & Field Operations",
        "content": """# FieldHandoff — Human/Robot/Agent Work Receipt

## Metadata
- **Status:** `RESEARCH_LEDGER`
- **Reset:** RESET XX (2026-08-21)
- **Score:** 7.3 / 10
- **Category:** Physical AI & Robotics / Field Operations

## 1. Concept
Chain-of-custody and handoff receipts for physical work coordinated between AI agents, teleoperated/autonomous robots, and human field technicians. Tracks state transitions, stoppage context, and completion liability at the physical work boundary.
"""
    },
    {
        "slug": "cashcliff-job-level-13-week-liquidity-replay",
        "title": "CashCliff — Job-Level 13-Week Liquidity Replay",
        "rank": 7,
        "score": 7.0,
        "status": "RESEARCH_LEDGER",
        "category": "SMB Financial Operations",
        "content": """# CashCliff — Job-Level 13-Week Liquidity Replay

## Metadata
- **Status:** `RESEARCH_LEDGER`
- **Reset:** RESET XX (2026-08-21)
- **Score:** 7.0 / 10
- **Category:** SMB Financial Operations / Construction & Trades

## 1. Concept
Job-level cash feasibility engine for trade contractors and commercial service providers. Answers one question: *"If I accept this €150k Net-60 project today with materials and payroll due upfront, on what exact date does my bank balance hit zero?"*
"""
    }
]

# 3. Validation Plans
VAL_PLANS = [
    {
        "filename": "agegate-replay-validation.md",
        "content": """# AgeGate Replay — Validation Plan & Execution Playbook

## 1. Core Falsification Hypothesis
**Hypothesis:** Identity integrators, gaming platforms, and digital services will pay €149–€499 for an automated 14-scenario chaos & interoperability test suite for their EU Age Verification staging endpoints because the free European Commission reference verifier does not test production failure modes.

**Kill Trigger:** If 30 targeted engineering leads state that their commercial IDP or the Commission testbed already covers 100% of real-world wallet fallbacks, timeout loops, and trust list drift without custom testing.

## 2. Target Audience (Sample Size: 40)
- Technical Leads at European Identity & Access Management (IAM) consultancies
- VP Engineering / Compliance Leads at online gaming and media platforms in FR, DK, GR, IT, ES, CY, IE
- Age assurance solution providers and specialized aggregators

## 3. The 14-Scenario Chaos Test Suite
1. `CHROME_DC_API_ZKP_HAPPY`: Chrome + Digital Credentials API + Zero-Knowledge Proof
2. `FALLBACK_MDOC`: ZKP unavailable $\\rightarrow$ fallback to standard ISO 18013-5 mdoc
3. `FALLBACK_OID4VP`: DC API unsupported $\\rightarrow$ fallback to OID4VP protocol
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
- **Success Criteria:** 3 paid audits completed within 14 days.
"""
    },
    {
        "filename": "smallsoft-gate-validation.md",
        "content": """# SmallSoft Gate — Validation Plan & Execution Playbook

## 1. Core Falsification Hypothesis
**Hypothesis:** AI power users and internal operators building bespoke 1-to-10 user tools with Claude/Codex/Gemini will pay €29/app to securely deploy and share their local scripts with colleagues with instant auth, user allowlists, and auto-destroy TTLs.

**Kill Trigger:** If users prefer either keeping scripts on localhost or using generic free hosting (Vercel/Streamlit Community Cloud) without caring about secret isolation or private allowlists.

## 2. Target Audience (Sample Size: 30)
- AI-forward operators and consultants sharing custom automation scripts
- Internal tooling leads at tech-forward agencies
- Founders with multiple local AI dashboards

## 3. Concierge Validation Offer (€29)
- "Send your local Python/Node script or repository."
- We wrap it with:
  - Google Workspace / Passkey login
  - Read/write secret vault
  - Outbound domain whitelisting
  - 14-day auto-destroy TTL
- Live private URL delivered within 30 minutes.

## 4. Success Criteria
- 5 paid deployments within 10 days.
"""
    }
]

def main():
    raise SystemExit(
        "RESET XX ingestion disabled after adversarial audit: the proposed candidates "
        "duplicate idea-309 and idea-359. See research/reset-xx-audit/README.md."
    )
    print("Ingesting RESET XX (Public Infrastructure Edge)...")

    # 1. Write research MD
    research_file = os.path.join(RESEARCH_DIR, "RESET_XX_PUBLIC_INFRASTRUCTURE_EDGE_2026-08-21.md")
    with open(research_file, "w", encoding="utf-8") as f:
        f.write(RESEARCH_MD_CONTENT.strip() + "\\n")
    print(f"  [+] Created research file: {research_file}")

    # 2. Write idea dossiers
    for idea in IDEAS_DATA:
        idea_file = os.path.join(IDEAS_DIR, f"{idea['slug']}.md")
        with open(idea_file, "w", encoding="utf-8") as f:
            f.write(idea["content"].strip() + "\\n")
        print(f"  [+] Created idea dossier: {idea_file}")

    # 3. Write validation plans
    for vp in VAL_PLANS:
        vp_file = os.path.join(VAL_PLANS_DIR, vp["filename"])
        with open(vp_file, "w", encoding="utf-8") as f:
            f.write(vp["content"].strip() + "\\n")
        print(f"  [+] Created validation plan: {vp_file}")

    # 4. Append top candidates to staging queue
    try:
        with open(STAGING_QUEUE_PATH, "r", encoding="utf-8") as f:
            staging_queue = json.load(f)
    except Exception:
        staging_queue = []

    staged_ids = [s.get("id") for s in staging_queue]

    new_staged = [
        {
            "schemaVersion": "2.1.0",
            "id": "candidate-reset-xx-agegate-replay",
            "slug": "agegate-replay-eu-age-verification-production-chaos-lab",
            "name": "AgeGate Replay — EU Age-Verification Production Chaos Lab",
            "oneSentenceConcept": "The BrowserStack and Chaos Monkey for EU age-verification relying parties stress-testing staging endpoints against multi-wallet, multi-protocol, and trust-list drift edge cases.",
            "status": "staged",
            "category": "Identity & Regulatory Infrastructure",
            "atAGlance": {
                "overallScore": 84.0,
                "confidenceScore": 9.0,
                "timeToMvp": "3-7 days",
                "bestNextValidationStep": "Offer €149 14-scenario integration stress test to 30 IAM integrators and platforms"
            },
            "provenance": {
                "sourceType": "Fresh-Slate Reset (Reset XX)",
                "researchRound": "RESET_XX_20260821",
                "notes": "Rank 1 overall in Public Infrastructure Edge reset (8.4/10)"
            }
        },
        {
            "schemaVersion": "2.1.0",
            "id": "candidate-reset-xx-smallsoft-gate",
            "slug": "smallsoft-gate-secure-runtime-for-tiny-agent-built-apps",
            "name": "SmallSoft Gate — Secure Runtime for Tiny Agent-Built Apps",
            "oneSentenceConcept": "Instant single-command deployment, passkey auth, secret isolation, and auto-destroy TTLs for bespoke 1-to-10 user AI-generated internal applications.",
            "status": "staged",
            "category": "Developer Tools & AI Infrastructure",
            "atAGlance": {
                "overallScore": 80.0,
                "confidenceScore": 8.5,
                "timeToMvp": "3-5 days",
                "bestNextValidationStep": "Offer €29 concierge deployment to operators with 5+ localhost AI tools"
            },
            "provenance": {
                "sourceType": "Fresh-Slate Reset (Reset XX)",
                "researchRound": "RESET_XX_20260821",
                "notes": "Rank 2 overall in Public Infrastructure Edge reset (8.0/10)"
            }
        }
    ]

    for item in new_staged:
        if item["id"] not in staged_ids:
            staging_queue.append(item)
            print(f"  [+] Appended staged candidate: {item['id']}")

    with open(STAGING_QUEUE_PATH, "w", encoding="utf-8") as f:
        json.dump(staging_queue, f, indent=2)
    print(f"  [+] Updated {STAGING_QUEUE_PATH}")

    print("\\nIngestion of RESET XX complete!")

if __name__ == "__main__":
    main()
