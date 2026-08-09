# BidTwin / AuctionProof — Bid-to-Built Resilience Assurance System Dossier

> **Frontier Research Tier Opportunity** (Score: 96.1 / 100)  
> **Category:** EU Marketplace & Compliance  
> **Status:** Frontier Opportunity / Deep Validation  

---

## Key Research Question

> <span style="color:red;font-weight:bold;font-size:1.2rem">How can renewable energy developers and strategic buyers prove that real-world component substitutions three years after contract award do not break the non-price resilience conditions under which they won public support?</span>

---

## Executive Summary & Core Insight

Public procurement across Europe is undergoing a fundamental structural transition:  
> **From "Who gives us energy/products cheapest?" to "Who gives us competitive pricing while satisfying statutory resilience, component origin, cybersecurity, and delivery capability requirements?"**

Under the EU Net-Zero Industry Act (NZIA), Member States must apply non-price resilience and sustainability criteria to at least **30% of annual renewable energy auction volume (or 6 GW/year per Member State)**.

**BidTwin / AuctionProof** creates an executable digital twin of public tender commitments. It optimizes complex multi-vendor supply chain configurations during bidding to maximize winning probability, and continuously audits post-award component substitutions during multi-year construction to prevent contract default or subsidy clawbacks.

---

## The BID → BUILT Optimization Engine

```text
               AUCTION BID PHASE (Solar 400 MW)
                              │
  ┌───────────────────────────┼───────────────────────────┐
  ▼                           ▼                           ▼
Option A (Third-Country)   Option B (Full EU)         Option C (Hybrid)
CAPEX: €238M               CAPEX: €247M               CAPEX: €243M
Resilience Score: 14/30    Resilience Score: 23/30    Resilience Score: 21/30
Win Probability: LOW       Win Probability: HIGH      Win Probability: OPTIMAL
                              │
                              ▼
                   AWARDED TO OPTION C
                              │
                              ▼
            CONSTRUCTION PHASE (18 Months Later)
                              │
               Inverter Supplier B Disappears
                              │
                              ▼
             SUBSTITUTION ALERT (BidTwin Engine)
             "Swapping Inverter B to Third-Country Inverter Z
              drops NZIA Resilience Score below Award Threshold.
              Alternative Compatible EU Supplier Found: Inverter B2."
```

---

## Competitive Moat & Strategic Positioning

- **Why Not Traditional ESG SaaS?** ESG SaaS measures generic carbon emissions. BidTwin connects **Bill of Materials (BOM) origin + supplier contracts + country-specific auction scoring rules + project CAPEX models** to calculate the exact monetary value of supply-chain resilience.
- **Why Not Procurement Tooling?** Procurement tools handle initial tender submission. BidTwin manages the **continuous 3-year construction lifecycle**, verifying that component changes do not violate award conditions.
- **Defensibility**: Multi-year tender bid data + supplier origin graphs + country-specific auction scoring algorithms + historic win/loss predictions.

---

## Phase 0 Developer API Protocol

```text
POST /v1/bidtwin/auctions/evaluate
POST /v1/bidtwin/projects/optimize
POST /v1/bidtwin/substitutions/audit
POST /v1/bidtwin/assurance/export
```

BidTwin launches first in renewable energy auctions (Solar PV & Onshore/Offshore Wind) before expanding into Critical Medicines procurement tenders and Defence procurement (EDIP/SAFE).
