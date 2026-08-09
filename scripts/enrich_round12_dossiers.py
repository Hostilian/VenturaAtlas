import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IDEAS_DIR = os.path.join(ROOT, 'ideas')

dossiers = {
    "demandproof-loadledger.md": """# DemandProof / LoadLedger — Electricity Load Project Identity & Readiness Network (idea-395)

**Score:** 97.2/100  |  **Category:** Energy Grid & Electrical Infrastructure  |  **Rank:** 🥇 Round #12 Champion (1st / 12)

## Executive Summary

DemandProof / LoadLedger creates a neutral identity and readiness network for multi-gigawatt electricity-load requests. Before utilities, RTOs, and state regulators spend billions building grid infrastructure for requested demand, DemandProof verifies whether requested capacity represents genuine independent projects or one developer shopping the same 1 GW project across five candidate sites in Virginia, Pennsylvania, Ohio, Texas, and Georgia.

## The Underlying Failure Mode: Phantom Demand

The economic incentive for speculative grid queue requests is straightforward: when the cost of reserving an interconnection position is lower than the option value of securing fast grid access, developers submit multiple large-load requests across utility territories.

On August 4, 2026, Texas Governor Greg Abbott ordered a pause on new grid-connected data-center approvals pending an audit of roughly **474 GW** of proposed electricity demand under review—approximately 90% associated with data centers, representing more than five times Texas's peak load. Three days later, Reuters reported hundreds of millions in security deposits committed ($50,000/MW for Batch Zero applicants). FERC simultaneously ordered all six regional transmission organizations (RTOs) under its jurisdiction to reform large-load integration rules, and PJM initiated a Large Load Registry.

While regional registries track local queues, they do not resolve cross-jurisdiction project identity. A single 800 MW campus proposed across 5 utility queues can be misperceived as 4,000 MW of prospective load, leading to over-built transmission, stranded infrastructure, delayed legitimate projects, and ratepayer risk.

## Product Architecture

```
Developer
   │
   ├─ Utility A request (800 MW)
   ├─ Utility B request (800 MW)
   ├─ Utility C request (800 MW)
   └─ Utility D request (800 MW)
          │
          ▼
    DEMANDPROOF NETWORK
          │
          ▼
Underlying Project Cluster: DP-8F2A-2026
Match Probability: 87% (Same Customer + Fiber + Substation Specs)
          │
          ▼
AlternativeSiteGroup: ASG-182 (Target Capacity: 800 MW, Max Simultaneous Builds: 1)
          │
          ▼
Probabilistic Readiness Load: Nominal 4,000 MW ──► Expected 2029 Load: 710 MW
```

### Layer 1 — Identity (Privacy-Preserving Entity Resolution)
Answers: *Is this unique demand?*
Probabilistic entity resolution runs across signals without revealing raw site coordinates:
- Ultimate load customer & beneficial ownership
- Planned energization timeline & GPU generation
- Contract counterparties & fiber route requirements
- Equipment configurations, substation designs & transformer reservations
- Land option structures & water rights

### Layer 2 — Readiness Graph & AlternativeSiteGroup
Answers: *Is the project real, and what is its probability of energization?*
- **AlternativeSiteGroup (ASG)**: Formally represents site optionality (`ASG-182` with target capacity 900 MW across 3 utilities).
- **Nominal vs. Probability-Weighted MW**:
  - Raw Queue: 32.4 GW
  - After Duplicate Clustering: 21.7 GW
  - Probability-Weighted Expected Load: 14.2 GW
  - High-Confidence Firm Load: 9.8 GW

## Monetization & Defensibility

1. **Utilities & RTOs**: Annual planning subscriptions to eliminate stranded transmission capex and fulfill FERC mandates.
2. **Developers**: Confidential verification & DemandProof Grade credentials (Grade A/B) unlocking fast-track queue treatment.
3. **Lenders & Equipment Suppliers**: Transformer and switchgear suppliers query actual probability-weighted project execution timelines.
4. **Data Moat**: Over 5 years, DemandProof builds the world's largest dataset of `(Request, Readiness State, Alternative Sites, Execution Outcome)` to train predictive load forecasting models that no single utility possesses.

---

## 7-Day Payment Experiment
Deploy a confidential site-matching trial for two mid-Atlantic utility planning teams, running entity resolution against 20 candidate data center queue requests.
""",

    "loadenvelope-ci-gridenvelope.md": """# LoadEnvelope CI / GridEnvelope — Continuous Electrical Behavior & Grid Contract Assurance (idea-396)

**Score:** 95.9/100  |  **Category:** Energy Grid & Electrical Infrastructure  |  **Rank:** 🥈 Round #12 Runner-Up (2nd / 12)

## Executive Summary

LoadEnvelope CI ("GitHub Actions for Grid Promises") provides continuous behavioral verification for AI data center electrical loads against utility interconnection agreements. While utilities approve grid connections based on static engineering models, modern AI compute workloads, scheduler updates, GPU generations (Hopper to Rubin), and UPS/BESS firmware changes alter facility electrical dynamics continuously.

## NERC Alert & Grid Stability Drivers

On May 4, 2026, NERC issued a Level 3 Alert following customer-initiated large-load reductions and significant electrical oscillations occurring within seconds. AESO (Alberta) published dedicated connection guidance on June 12, 2026, for non-conforming loads, noting that power-electronics-heavy AI data centers produce steep ramp rates and unexpected dropouts.

A data center approved under **Model v12** (Max ramp 10 MW/min) may deploy **Scheduler v24**. A synchronized GPU checkpointing event across 8,000 nodes can drop 96 MW of grid load in 2.8 seconds, triggering protection relays and grid disturbance.

## Machine-Readable GridEnvelope & CI Workflow

```yaml
# GridEnvelope Contract: GE-TX-84.yaml
ramp_up:
  max_mw_per_min: 10
ramp_down:
  max_mw_per_sec: 40
voltage_ride_through:
  profile: AESO-GRID-X
frequency_bounds:
  min_hz: 59.5
  max_hz: 60.5
curtailment_response_seconds: 30
```

### Pre-Deployment CI Test Suite
```
Compute Scheduler Update (v24)
        │
        ▼
LOADENVELOPE HIL & SOFTWARE REPLAY
        │
        ├─ Workload Trace Replay (Checkpoint Sync Simulation)
        ├─ Grid Disturbance Simulation (Voltage Sag Response)
        └─ UPS / BESS Controller Firmware Conformance
        │
        ▼
RESULT: ❌ FAIL (Observed 96 MW drop in 2.8s > Limit 40 MW / 3s)
RECOMMENDATION: Stagger checkpoint synchronization windows across Clusters C4 and C7.
```

## Digital Grid Passport & Business Model

- **Digital Grid Passport**: Every software/hardware configuration version receives a cryptographic passport certifying operational compliance.
- **Customers**: Hyperscale data center operators (preventing utility curtailment penalties) and utility grid reliability coordinators.
- **Moat**: Normalized multi-site electrical disturbance traces across GPU, UPS, and BESS topologies.

---

## 7-Day Payment Experiment
Ingest 3 historical GPU cluster workload traces into a PSCAD/HIL simulation wrapper to detect electrical ramp violations against NERC Level 3 standards.
""",

    "bioscreen-ci.md": """# BioScreen CI — Continuous Independent Assurance for Nucleic-Acid Synthesis Screening (idea-397)

**Score:** 94.4/100  |  **Category:** Biosecurity & Synthetic Biology Safeguards  |  **Rank:** 🥉 Round #12 3rd Place (3rd / 12)

## Executive Summary

BioScreen CI delivers continuous, independent operational assurance for gene synthesis biosecurity screening systems. Following U.S. federal mandates (May 2025/2026 ASPR framework) requiring federally funded research procurement to use verified screening providers, BioScreen CI acts as an independent SOC 2 / penetration-testing harness for nucleic-acid synthesis providers.

## Regulatory Context & Capability Frontier

The White House and U.S. HHS/ASPR established updated screening requirements for sequence and customer verification. Meanwhile, open screening tools (IBBIS) and generative biology advances (e.g., April 2026 *Science* paper on generative bacteriophage design) have accelerated both provider adoption and potential evasion vectors.

BioScreen CI does not build another sequence classifier. It tests whether the synthesis provider's **entire operational pipeline** remains functional against evolving threat profiles and software regressions.

## Continuous Assurance Architecture

```
Synthesis Provider Pipeline
   │
   ├─ Customer Identity Verification
   ├─ Sequence Classifier Engine (IBBIS / SecureDNA)
   ├─ Human Escalation Workflow
   ├─ Order Routing & Benchtop Synthesizer API
   │
   ▼
BIOSCREEN CI AIR-GAPPED ASSURANCE SUITE
   │
   ├─ Controlled Challenge Classes (A–K)
   ├─ Default-Open Failure Mode Injections (Stale DB, API Timeout)
   ├─ Reseller Bypass & Multi-Factory Policy Drift Probes
   └─ Audit Logging & Record Retention Verifiers
   │
   ▼
CONFIDENTIAL ASSURANCE REPORT
Screening Version: 42.8 | Detection: 99.8% | Workflow Bypass: PASS | Status: VERIFIED
```

## Governance & Safety Moat

- **Responsible Disclosure**: Challenge sequence details remain strictly within a vetted, secure environment to prevent adversary feedback.
- **Independent Certification**: Grants verified badges to providers, satisfying NIH/NSF research funding procurement requirements and biosecurity insurer criteria.

---

## 7-Day Payment Experiment
Conduct a simulated workflow-bypass audit against 2 mock gene synthesis order-routing API endpoints.
""",

    "filterlife-slo-mediatruth.md": """# FilterLife SLO / MediaTruth — PFAS Filter Life & Vendor-Neutral Performance Intelligence (idea-398)

**Score:** 89.6/100  |  **Category:** Water Treatment & Environmental Intelligence

## Executive Summary

FilterLife SLO / MediaTruth provides a vendor-neutral performance intelligence network predicting the actual remaining useful life of activated carbon (GAC) and ion-exchange (IX) PFAS drinking water filters across municipal utilities.

## Regulatory Context & Chemical Complexity

The EU's harmonized PFAS drinking-water monitoring rules took effect on January 12, 2026, obligating Member States to monitor limits and remediate contamination. However, filter bed lifespan is highly dynamic: fluctuations in Dissolved Organic Matter (DOM) composition and water chemistry accelerate breakthrough and cause competitive desorption in aged carbon beds.

## Performance Network & Value Proposition

- **Cross-Utility Intelligence**: Pools influent water chemistry, flow rates, DOM metrics, and lab breakthrough results across participating utilities.
- **Vendor-Neutral Benchmarking**: Compares real-world cost per cubic meter treated across filter media suppliers (Vendor A vs B vs C), superseding lab brochures.
- **Predictive Breakthrough Alerts**: Forecasts PFOA/PFOS breakthrough dates with confidence intervals (e.g., PFOA breakthrough expected Nov 12–Dec 7), preventing premature media disposal or compliance violations.

---

## 7-Day Payment Experiment
Ingest historical GAC bed volumes and water chemistry logs from 3 water utilities to train a breakthrough prediction curve.
""",

    "methanetrueup-contractoracle.md": """# MethaneTrueUp / ContractOracle — Environmental Observation & Methane Contract Reconciliation Engine (idea-399)

**Score:** 88.2/100  |  **Category:** Climate & Energy Commodity Contracts

## Executive Summary

MethaneTrueUp / ContractOracle is a discrepancy reconciliation engine mapping independent satellite and sensor methane emissions observations directly to LNG purchase contracts, MiQ certificate holdings, and importer penalty exposures under EU methane import rules (effective July 20, 2026).

## The Contractual Contradiction Problem

When independent satellite observations detect a high-emissions plume at a production facility, but facility declarations and MiQ certificates claim low intensity, gas importers face financial and regulatory exposure. MethaneTrueUp resolves this contradiction by mapping physical observations through production periods, certificate vintages, cargo allocations, and specific contract clauses.

```
Satellite Methane Plume Event
        │
        ▼
METHANETRUEUP EVIDENCE ENGINE
        │
        ├─ Affected Cargo: LNG-8821
        ├─ Affected Certificates: 18,422 MiQ Vintages
        ├─ Contract Clause: EU-GAS-291 (Clause 7.4b)
        └─ Notice Window: Closes in 11 Days
        │
        ▼
ACTIONABLE CONTRACTUAL NOTICE ROUTER
```

---

## 7-Day Payment Experiment
Map 5 satellite methane plume events against sample LNG cargo allocation schedules and MiQ certificate registry data.
""",

    "reclaimproof.md": """# ReclaimProof — Physical & Mass-Balance Provenance Assurance for Reclaimed Refrigerants (idea-400)

**Score:** 85.4/100  |  **Category:** Circular Economy & F-Gas Compliance

## Executive Summary

ReclaimProof provides mass-balance and physical composition provenance assurance for reclaimed F-gases under European HFC phase-down quotas. Escalating quota scarcity creates financial incentives for invoice fraud and relabeling virgin HFCs as reclaimed gas.

## Mass-Balance & Lab Fingerprinting

Rather than relying solely on cylinder barcoding, ReclaimProof combines:
1. Reclaimer recovery intake volumes vs process yield limits (flagging impossible >92% yield claims).
2. Geotagged recovery source logs from HVAC service contractors.
3. Physical gas chromatography purity fingerprints verifying reclaimed origin.

---

## 7-Day Payment Experiment
Perform mass-balance reconciliation on 3 reclaimer inventory reports to verify input-to-output yield feasibility.
""",

    "cra-reachledger.md": """# CRA ReachLedger — Firmware Vulnerability Exposure & Patch Deployment Reachability Graph (idea-401)

**Score:** 81.0/100  |  **Category:** Cybersecurity & Cyber Resilience Act Compliance

## Executive Summary

CRA ReachLedger builds a last-mile device reachability and vulnerability exposure graph for hardware OEMs under the EU Cyber Resilience Act (reporting deadline Sept 11, 2026). It connects firmware SBOMs, distributor inventory records, secondary sales, and active device telemetry to quantify real customer exposure when severe vulnerabilities are identified.

## Competitor Assessment & Demotion

While initially evaluated as a high-priority opportunity, competitor search revealed that entrants such as Snowball (OnBoard) already link releases, production devices, SBOMs, and OTA state. CRA ReachLedger remains valuable for reseller/customer contact reachability but has lower whitespace than top Round #12 champions.

---

## 7-Day Payment Experiment
Audit device reachability for 100 sample hardware serial numbers against distributor shipment logs.
""",

    "medicare-mfp-reconcile.md": """# Medicare MFP Reconcile — Negotiated-Price Claim & Refund Reconciliation Engine (idea-402)

**Score:** 77.2/100  |  **Category:** Healthcare Financial Operations

## Executive Summary

Medicare MFP Reconcile automates remittance matching, claim verification, and manufacturer refund settlement under Medicare Maximum Fair Price (MFP) rules via the CMS Medicare Transaction Facilitator framework.

## Competitor Assessment & Demotion

Operational needs around Part D plans, 340B duplicate discount claims, and wholesaler refunds are substantial. However, multiple purpose-built startups are actively building MFP reconciliation tooling, shrinking the immediate whitespace.

---

## 7-Day Payment Experiment
Run remittance matching logic on sample Medicare Part D prescription claims.
""",

    "watercontact-compiler.md": """# WaterContact Compiler — Drinking Water Contact Material Formulation Compliance Engine (idea-403)

**Score:** 70.5/100  |  **Category:** Environmental & Product Compliance

## Executive Summary

WaterContact Compiler evaluates plumbing, valve, and pipe material formulations against European Drinking Water Directive harmonized Positive Lists.

## Competitor Assessment & Demotion

Dedicated regulatory consulting and lab testing ecosystems are rapidly forming around European Positive List formulation assessments, reducing venture scalability.

---

## 7-Day Payment Experiment
Check 10 chemical CAS numbers against the EU Positive List database.
""",

    "transformer-procurement-marketplace.md": """# Transformer Procurement Marketplace — AI Transformer Sourcing & Lead-Time Marketplace [KILLED] (idea-404)

**Score:** 67.0/100  |  **Category:** Power Equipment & Grid Logistics  |  **Status:** Disconfirmed Candidate

## Executive Summary & Disconfirmation Rationale

While high-voltage transformer lead times of 3–4 years present severe friction for data center and grid development, competitor validation confirmed that **Fluxco** recently raised ~$26M for an AI transformer sourcing platform handling 1,000+ units across active projects. Generic procurement marketplaces in this category are no longer undiscovered whitespace.

---

## Retained Disconfirmation Record
Retained in Venture Atlas OS to document market entrant scaling and prevent redundant research cycles.
""",

    "fueleu-pooling-marketplace.md": """# FuelEU Pooling Marketplace — Maritime FuelEU Compliance Pool Exchange [KILLED] (idea-405)

**Score:** 64.5/100  |  **Category:** Maritime & EU Compliance  |  **Status:** Disconfirmed Candidate

## Executive Summary & Disconfirmation Rationale

FuelEU Maritime allows vessel operators to pool GHG intensity to balance compliance penalties. However, competitor searches revealed that **OceanScore** and **BetterSea** already operate active marketplaces connecting thousands of commercial vessels.

---

## Retained Disconfirmation Record
Retained in Venture Atlas OS to document existing network dominance.
""",

    "generic-methane-certification-mrv.md": """# Generic Methane Certification/MRV — Commodity Gas Methane MRV & Registry Platform [KILLED] (idea-406)

**Score:** 62.5/100  |  **Category:** Environmental Certification  |  **Status:** Disconfirmed Candidate

## Executive Summary & Disconfirmation Rationale

Generic upstream methane MRV and certificate registries are heavily dominated by **MiQ** (certification standards) and **Xpansiv** (trading and settlement infrastructure). Venture Atlas narrowed methane opportunities strictly to downstream contract reconciliation (MethaneTrueUp / ContractOracle).

---

## Retained Disconfirmation Record
Retained in Venture Atlas OS to document incumbent market coverage.
"""
}

for filename, content in dossiers.items():
    filePath = os.path.join(IDEAS_DIR, filename)
    with open(filePath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] Enriched dossier: {filename}")

print(f"[SUCCESS] Enriched all {len(dossiers)} Round #12 dossiers with full forensic detail.")
