# DemandProof / LoadLedger — Electricity Load Project Identity & Readiness Network (idea-395)

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
