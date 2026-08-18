# CATCHFlow — CATCH Preflight & Certificate Lineage
**ID:** idea-415 | **OMEGA:** XVII-B | **Date:** 2026-08-18
**Status:** priority | **Score:** 94/100 (analyst-provisional)
**Confidence:** MEDIUM–HIGH
**Precursor stub:** catchlint-digital-customs-preflight-compiler.md

---

## The Mandatory System

On **10 January 2026**, the EU made CATCH compulsory for EU operators importing covered fishery products under the IUU (Illegal, Unreported and Unregulated) catch-certification framework. CATCH replaced much of the paper workflow with a centralized digital process inside TRACES NT.

## The Production Failure Signal

On **4 August 2026**, the EU Market Advisory Council publicly called for the **operational stabilisation** of CATCH. It reported recurring technical, administrative and operational problems including:

- Duplicate and manual data entry
- Clearance delays at EU ports
- Divergent implementation practices across Member States
- Insufficient interoperability
- Insufficient delegated functionality for customs agents and freight forwarders

Earlier in 2026, trade groups (including CLECAT) reported serious implementation problems. The Financial Times reported shipment disruption at European ports during the initial rollout.

**Production Pain Evidence:** `government_acknowledged` + `industry_association` + `named_company`
**Catalyst Type:** E — Observable production failure

## What NOT to Build

- Generic seafood traceability SaaS (osapiens, PSQR already in market)
- AI catch-certificate generator
- Another TRACES/CATCH information dashboard
- Sustainability provenance platform with CATCH added as a checkbox

## The Product

### CATCH Certificate Lineage Model

A real seafood import chain:

```
vessel → catch → catch_certificate → exporter → processor →
processing_statement → storage/non-manipulation_document →
shipment → importer → CATCH → Member_State_authority → customs → release
```

CATCHFlow maintains a lineage graph across all of them and runs a **preflight** before the importer commits a shipment.

### Example Preflight Output

```
Shipment NL-240819-093

Import readiness: FAIL

Catch certificate:            valid
Vessel identity:              matched
Species code:                 matched
Processing statement:         valid
Quantity allocated previously: 18,420 kg
Current requested quantity:   6,900 kg
Remaining eligible quantity:  5,830 kg
Over-allocation:              1,070 kg  ← FAIL

Importer CATCH role:          valid
Representative delegation:    missing  ← FAIL
Certificate PDF:              accepted format
Destination authority fields: 1 unresolved mapping  ← WARN

Do not submit.
```

### Durable Problem (not a temporary bug)

Even with a perfect CATCH UI, someone must still reconcile:
- Vessel data
- Certificate data
- Processor data
- Quantity lineage
- Shipment data
- Importer data
- Third-country systems
- EU system state

That is the durable layer. The moat is **not** "CATCH's UI sucks."

## Software Primitives

- Certificate identity
- Vessel identity
- Species classification
- Product quantity
- Processing lineage
- Partial allocation
- Document versions
- Third-country system mappings
- Importer / representative identity
- Member State routing
- Pre-submission rules
- Exception handling
- Evidence preservation

## MVP: Software-Assisted Service

Not a 30-person SaaS architecture.

**Offer:** "Send us the paperwork for one upcoming CATCH shipment. We will preflight the documentation and quantity lineage before submission."

Start manually. Charge per shipment or small monthly bundle. Then observe exactly where human time goes.

### First Experiment: 20 Real Import Cases

Measure:
- Time to preflight
- Error categories
- Percentage containing fixable defects
- Financial consequence of defects
- Repeat frequency
- Who actually pays (importer, broker, exporter, or traceability platform)

## Land and Expand

```
catch-certificate preflight
  → processing statements
  → quantity lineage
  → delegation / broker workflow
  → third-country integrations
  → risk / evidence
  → full seafood-import regulatory evidence graph
  → TRACES-adjacent import systems
  → regulated food-import infrastructure
```

## Key Metrics

| Metric | Score |
|--------|-------|
| Transaction Blocking Power (TBP) | 9 |
| Preflight Advantage (PFA) | 9 |
| Government Fix Risk (GFR) | 4 (quantity lineage / cross-org problem persists) |
| Interface Accessibility (IFA) | 6 |
| Preflight Fidelity (PFF) | 7 |
| Transaction Value at Risk (TVR) | 8 (€250k+ container) |
| Production Pain Evidence (PPE) | government_acknowledged |
| Operational Choke-Point | 9 |
| Machine-Checkability | 8 |
| Evidence Compounding | 8 |

## Kill Conditions

- Commission improves CATCH bulk upload, validation, and delegation within 90 days (eliminates short-term pain)
- Quantity reconciliation shown to be already handled by existing import-management tools
- Zero payment interest from 50 importer / broker contacts
- Pain is 100% concentrated in third countries' systems — unreachable

## Sources

- EU TRACES / CATCH mandatory obligation: 10 January 2026
- Market Advisory Council operational stabilisation call: 4 August 2026
- CLECAT implementation complaints: early 2026
- Financial Times port disruption reporting: early 2026
- UK Fish Export Service / CATCH cross-system integration guidance: August 2026
- osapiens / PSQR: existing traceability competitor landscape
