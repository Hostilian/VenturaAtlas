# OMEGA XVII — Regulatory Handshake / Production-Failure Markets
## Research date: 18 August 2026
**OMEGA Round:** XVII-B (Regulatory Handshake continuation — distinct from XVII-A Public Money Graph, 17 Aug)
**Classification:** MAJOR DEEP RESET
**Round winner:** CATCHFlow (idea-415) — CATCH Preflight & Certificate Lineage
**Runner-up:** CertFlow / HandshakeLab (idea-416) — CERTEX Regulatory Handshake Lab
**Finalist:** F-Gas Shipment & Quota Integrity Gate (idea-417)
**Ideas ingested:** idea-415, idea-416, idea-417, idea-418, idea-419, idea-420
**Research run ID:** run-res-omega-xviib-20260818-regulatory-handshake

---

## Executive Thesis

### The Production-Failure Market

A new category of startup opportunity appears when five conditions hold simultaneously:

1. **Mandatory digital system** — a registry, API, or platform becomes unavoidable for a real transaction.
2. **Real transaction** — goods, payment, or release depends on it.
3. **Multiple systems** — company data must match government/partner data.
4. **Failure blocks value** — shipment, product, transaction, or release gets delayed.
5. **Preflight possible** — failure can be detected before submission.

This shifts the search from "what regulation creates compliance work?" to:
**"What mandatory digital transaction can fail and stop money, goods, or operations?"**

### Regulatory CI/CD

The customer-facing pitch for the platform thesis:
> **Catch machine-to-machine compliance failures before they reach production.**

Analogous to what CI/CD did for software defects — shift regulatory failure left.

### HandshakeGraph (new architecture layer)

Adds to the existing NormGraph / IdentityGraph / AssetGraph / EvidenceGraph / ProofOps stack.

Stores: `private system ↔ government/partner system` with interface, message, schema, identifier mapping, certificate, state machine, authorization, quantity, reservation, failure code, version, country, environment, test result.

---

## New Canonical Rankings (OMEGA XVII-B ideas only)

| Rank | Idea | ID | Score | Status |
|------|------|----|-------|--------|
| 1 | CATCHFlow — CATCH Preflight & Certificate Lineage | idea-415 | 94.0 | priority |
| 2 | CertFlow / HandshakeLab — CERTEX Regulatory Handshake Lab | idea-416 | 93.0 | priority |
| 3 | F-Gas Shipment & Quota Integrity Gate | idea-417 | 90.5 | priority |
| 4 | EPREL Retail-State Drift Monitor | idea-418 | 84.0 | researched |
| 5 | Battery Health Attestation | idea-419 | 80.0 | researched |
| 6 | Recall Propagation Proof | idea-420 | 75.0 | watch |

All scores are **analyst-provisional** (research-pass scores). They are not ranking-eligible until full 25-dimension backfill is completed per methodology.

---

## Cross-Round Objective Hierarchy (as of OMEGA XVII-B)

| Objective | Current Contender |
|-----------|------------------|
| Most urgent live-system opportunity | CATCHFlow (idea-415) |
| Broadest platform thesis | CertFlow / HandshakeLab (idea-416) |
| Best first vertical for CertFlow | F-Gas Shipment Gate (idea-417) |
| Durable retail compliance module | EPREL Retail Drift (idea-418) |
| Evidence-quality deepening | Battery Health Attestation (idea-419) |
| Most urgent new opportunity (physical) | ScrapRoute (idea-412) |
| Strongest public-data asset | AidGraph (idea-407) |

---

## New VentureAtlas Metrics Introduced

### Transaction Blocking Power (TBP)

| Score | Meaning |
|------:|---------|
| 0 | Nice-to-have analysis |
| 2 | Internal inconvenience |
| 4 | Audit / remediation burden |
| 6 | Release / process delayed |
| 8 | Customer transaction or shipment blocked |
| 10 | Legally impossible to proceed / market access blocked |

### Preflight Advantage (PFA)

How much cheaper is detecting the failure before committing the transaction vs. after?

### Government Fix Risk (GFR)

- **10** = startup is basically a workaround for one missing UI button
- **0** = underlying cross-company coordination problem persists regardless of official tooling

### Interface Accessibility (IFA)

| Score | Meaning |
|------:|---------|
| 10 | Public API + sandbox + docs |
| 7 | Certified partner / test environment available |
| 5 | Accessible through customer systems |
| 3 | National implementation / agreements required |
| 0 | Government-only inaccessible system |

### Preflight Fidelity (PFF)

How accurately does the test environment predict real production behavior? Critical for "Gate" ideas.

### Transaction Value at Risk (TVR)

Order-of-magnitude value blocked by a single failure event. Affects willingness-to-pay.

### Production Pain Evidence (PPE)

Enum: `none` | `inferred` | `consultant_reports` | `industry_association` | `named_company` | `multiple_companies` | `government_acknowledged` | `measured_transactions` | `paid_remediation`

CATCH currently: **government_acknowledged** (Market Advisory Council Aug 2026 operational stabilisation call) + **industry_association** (CLECAT reports) + **named_company** (FT shipment disruption reporting).

---

## New Research Heuristics

### Catalyst Type Upgrade

| Type | Meaning |
|------|---------|
| A | Speculative — proposal stage |
| B | Adopted — future law |
| C | Imminent — < 180 days |
| D | Applicable — requirement exists |
| **E** | **Observable production failure — users currently experiencing the pain** |

Type E carries a strong **problem-reality score** (not automatically a high opportunity score — temporary bugs are dangerous — but evidence of genuine pain).

### Follow the Error Code

For any mandatory government/business system, search:
`"<system>" error`, `rejected`, `validation`, `failed`, `delayed`, `manual entry`, `interoperability`, `transition period`, `technical issue`, `customs broker`, `API problem`, `support forum`

This is often more revealing than `"<regulation>" market opportunity`.

### Pain Primary vs Legal Primary

- **Legal primary**: Commission/regulation tells you the system exists.
- **Pain primary**: Industry association/operator tells you the system creates recurring problems.

Both are required. One establishes obligation; the other establishes pain.

### Research Saturation Rule

If `canonical ideas > 250` and `active experiments = 0`, autonomous agents should allocate only ~30% of compute to new idea discovery. The remainder must go to: deduplication, fact refresh, competitive falsification, experiments, prototype, outreach, customer evidence.

### Promotion Tax (new candidate checklist)

Before adding a new canonical idea, the agent must supply:
1. Nearest three existing ideas and why this is not a variant
2. Strongest competitor
3. Free substitute
4. Exact buyer
5. Exact mandatory interface
6. Exact failure mode
7. Why failure is recurring
8. Why official system won't simply fix it
9. 7-day falsification test

### Evidence Stack

Layer 1 — Legal existence (primary legislation / official system)
Layer 2 — Technical reality (spec / API / registry docs)
Layer 3 — Operational pain (industry / operator evidence)
Layer 4 — Competition (current commercial / OSS / official substitutes)
Layer 5 — Buyer evidence (interview)
Layer 6 — Behavior (pilot)
Layer 7 — Money (payment)

A score based only on layers 1–3 must never visually appear as certain as an 88 backed by layers 1–7.

---

## New Architecture Primitives

### Regulated Quantity Ledger

`authorization → total_available_quantity → reservation → transaction → split → transformation → consumption → cancellation → remaining_quantity`

Relevant across: CERTEX quota checks, CATCH quantity allocation, CBAM emissions, F-gas quota, EUDR commodity lineage, waste shipment quantities, battery material quantities.

### Quantity Lineage as Hidden Killer Feature

Identity + quantity + state explain a large fraction of regulatory failures:
- **Identity**: Is this the same operator / product / certificate / vessel / facility?
- **Quantity**: Is enough authorized quantity still available?
- **State**: Is the certificate / registration / license currently usable?
- **Time**: Is it valid on the transaction date?
- **Relationship**: Does this certificate actually authorize this object / actor / action?
- **Schema**: Does the receiving machine interpret it correctly?

AI extracts dirty inputs; deterministic code performs the actual gate.

### RegulatoryTransaction object model

```
RegulatoryTransaction
    identity
    actor(s)
    product
    quantity
    jurisdiction
    procedure
    supportingFormalities[]
    regulatorySystemStates[]
    authorizations[]
    reservations[]
    evidence[]
    testScenario
    predictedOutcome
    actualOutcome
    failureCodes[]
```

### Production Failure Corpus (new research asset spec)

For each mandatory-system failure:
```
system | version | date | jurisdiction | workflow | input | expected | actual
error | root_cause | fix | source | confidence | commercial_impact
```

---

## Graveyard Batch

| Idea | Reason |
|------|--------|
| Generic seafood traceability SaaS | osapiens, PSQR, and others already in market |
| AI catch-certificate generator | Addresses symptom, not structural cross-system problem |
| Generic CATCH information dashboard | Wrong layer — pain is in cross-system reconciliation |
| Sustainability provenance platform + CATCH checkbox | Wrong thesis |
| Generic battery-passport validator | BatteryPass-Ready + DPP vendor ecosystem |
| Generic Safety Gate monitor | SafeCart + low-cost scrapers already exist |
| Generic FuelEU / ReFuelEU reporting SaaS | EU building integration + incumbents in market |
| EUDR API test environment #37 | Official tooling already supplies test machinery |

---

## Watch List

| Idea | Reason |
|------|--------|
| PassportMesh / Vehicle Circularity Passport | Regulation (EU) 2026/1738 published Aug 2026; major passport obligations years away. Long-run architecture problem (battery passport + DPP + vehicle passport coexistence) — real eventually but not a 2026 build catalyst |
| Renewable Fuel Evidence Mesh | FuelEU Maritime / ReFuelEU Aviation infrastructure being built; commercial vendors already offering products |
| Digital-Euro PSP Regression Lab | Specs and pilot still evolving |

---

## CATCHFlow 72-Hour Experiment Plan

1. Corpus-dedupe against all VenturaAtlas canonical / staged / orphan ideas
2. Build `catchflow-research.md` with official CATCH rules + August operational issues
3. Map every input object used for import certification
4. Identify 20 most common likely preflight failures from official guidance + industry reports
5. Separate temporary CATCH bugs from durable cross-system problems
6. Build a small data model
7. Create five synthetic shipments
8. Introduce quantity, vessel, species, processing, and authorization defects deliberately
9. Make the validator catch them
10. Create one printable evidence report
11. Find 50 EU seafood importers / freight forwarders / customs intermediaries
12. Send a simple service offer
13. Record responses
14. Lower the score if nobody cares

---

## Dossiers

- ideas/catchflow-catch-preflight-certificate-lineage.md (idea-415)
- ideas/certflow-certex-regulatory-handshake-lab.md (idea-416)
- ideas/fgasgate-shipment-quota-integrity-gate.md (idea-417)
- ideas/eprelwatch-retail-state-drift-monitor.md (idea-418)
- ideas/batteryhealth-attestation-evidence-layer.md (idea-419)
- ideas/recallpropagation-proof-compliance-os-module.md (idea-420)

## Superseded Stub

- ideas/catchlint-digital-customs-preflight-compiler.md — 11-line stub from earlier pass; expanded and cross-referenced to idea-415

## Prompt stubs

- prompts/idea-specific/idea-415/ (25 stubs — to be generated)
- prompts/idea-specific/idea-416/ (25 stubs — to be generated)
- prompts/idea-specific/idea-417/ (25 stubs — to be generated)
- prompts/idea-specific/idea-418/ (25 stubs — to be generated)
- prompts/idea-specific/idea-419/ (25 stubs — to be generated)
- prompts/idea-specific/idea-420/ (25 stubs — to be generated)
