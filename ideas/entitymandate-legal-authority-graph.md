# EntityMandate — Legal Authority Graph for Companies + AI Agents Dossier

> **Frontier Research Tier Opportunity** (Score: 94.2 / 100)  
> **Category:** Developer Tools & Infrastructure  
> **Status:** Frontier Opportunity / Deep Validation  

---

## Key Research Question

> <span style="color:red;font-weight:bold;font-size:1.2rem">Can EntityMandate become the universal answer to 'who—or what—has legal authority to bind this organization?'</span>

---

## Executive Summary & Core Insight

Traditional identity systems answer *“Who is this user?”* OAuth answers *“What API scopes did a user grant?”*  
Neither system can answer:  
> **“Does this autonomous AI agent have delegated legal authority to execute a €72,000 B2B purchase order on behalf of ACME GmbH?”**

As autonomous software agents transition from copilot suggestions to executing consequential financial, legal, and procurement operations, B2B counterparties require cryptographic proof of delegated legal authority.

**EntityMandate** bridges the collision of three major 2026 movements:
1. **Corporate Digital Identity**: The European Council's June 2026 position on European Business Wallets (eIDAS 2.0) establishing legal representation and cross-border digital mandates.
2. **Autonomous AI Agents**: Proliferation of autonomous B2B purchasing, treasury routing, and contract execution agents.
3. **Verifiable Scoped Delegation**: Emerging intent-aware permission protocols binding legal mandates to cryptographic transaction receipts.

---

## The Authority Graph Architecture

```text
ACME GmbH (Legal Entity / Business Wallet)
   │
   ├── Board Resolution / Power of Attorney
   │
   └── CFO (Verified Corporate Officer)
         │
         └── Procurement Department Mandate
               │
               └── Procurement AI Agent (Agent ID: 0x82f...)
                     │
                     ├── Permitted Category: IT Hardware
                     ├── Transaction Limit: ≤ €25,000
                     ├── Geography: EU
                     ├── Human Signoff Threshold: > €10,000
                     └── Expiry: 2026-12-31
```

When a counterparty receives an instruction from Procurement AI Agent, it queries EntityMandate's verification API:

```json
{
  "authorized": true,
  "principal": "ACME GmbH (VAT: DE123456789)",
  "actor": "ProcurementAgent-172",
  "delegationChain": "verified",
  "authorityScope": "purchase.hardware",
  "requestedAmount": "EUR 8,420",
  "limitRemaining": "EUR 16,580",
  "humanApprovalRequired": false,
  "receiptHash": "0x9f8a3b2c1d...",
  "eIDAS2WalletSeal": "valid"
}
```

---

## Competitive Moat & Strategic Positioning

- **Why Not Arcade.dev / Identity Providers?** Arcade.dev secures generic agent actions. EntityMandate manages the **legal corporate representation graph** connecting board resolutions to B2B counterparties.
- **Why Not iGrant.io / Raw Wallets?** iGrant.io provides base wallet PaaS. EntityMandate sits **above wallets** as a programmable mandate compiler, evaluation engine, and verification rail.
- **Defensibility**: Company authority graph + national legal mapping + wallet integration + historical verification receipts + counterparty trust network.

---

## Phase 0 Developer API Protocol

```text
POST /v1/organizations
POST /v1/mandates
POST /v1/delegate
POST /v1/revoke
POST /v1/authorize
```

EntityMandate enables immediate enterprise deployment using internal corporate authority rules today, seamlessly upgrading to European Business Wallet eIDAS 2.0 credentials as national wallet implementations rollout across EU member states.
