# F-Gas Shipment & Quota Integrity Gate
**ID:** idea-417 | **OMEGA:** XVII-B | **Date:** 2026-08-18
**Status:** priority | **Score:** 90.5/100 (analyst-provisional)
**Confidence:** MEDIUM–HIGH
**Role:** Best first vertical for CertFlow (idea-416); also viable as standalone

---

## The Regulatory Environment

The EU F-gas system is heavily structured:

- F-gas Portal covers registration, licensing, HFC quota, and reporting workflows
- Implementing acts cover registration rules, reporting formats, declarations of conformity
- Commission fixed HFC quota reference values for **2027–2029** through a June 2026 implementing decision
- CERTEX explicitly supports registration, authorization, and quota-consumption checks for F-gases
- The Commission highlights F-gases as a significant customs-enforcement domain

## The Product

### Pre-Declaration Reconciliation Gate

Importer intends to bring in **800 refrigeration units**, each containing **1.3 kg refrigerant**.

The compliance system reads:
- Product / ERP: manufacturer, model, gas type, GWP, net fluorinated-gas quantity
- F-gas Portal: importer registration, quota route, authorization remaining, declaration version
- Customs: CN/TARIC classification, procedure, supporting-document refs

Gate asks: **Does everything agree before the declaration hits customs?**

### Example Output

```
Product classification:         PASS
Importer registration:          PASS
F-gas content declaration:      PASS
Authorization holder:           PASS
Available authorization:        FAIL
  Shipment demand:              1,040 kg eq basis
  Remaining usable auth:        913 kg
  Difference:                   127 kg  ← FAIL
Supporting-document identifier: PASS
Customs declaration F-gas field: PASS

Clearance risk: HIGH
```

## Why Not "F-Gas Management Platform"

Companies already broker quota and provide F-gas consulting/registration services.

The gap is much narrower:

**Continuous ERP/product/customs/F-gas-portal/CERTEX reconciliation before customs submission** — specifically the cross-system pre-declaration check, not the general quota management.

## First Experiment

1. Take a real equipment-import workflow
2. Model: ERP → product → F-gas Portal state → customs declaration → likely CERTEX checks
3. Identify the 10 most common failure modes from this specific flow
4. Build a single-page reconciliation tool
5. Offer to 20 refrigeration-equipment importers / F-gas specialists / customs brokers

**PASS:** 3 paid preflights at €99–€299 each
**KILL:** Quota specialists confirm their existing tools already catch this before declaration

## Relationship to CertFlow (idea-416)

F-gas is the **recommended first formality pack** for CertFlow because:
- Highly structured regulatory environment (numeric quotas, named registrations)
- CERTEX integration is explicit and documented
- Clear economic operators (refrigeration importers, HVAC equipment manufacturers)
- Quota mismatch = immediate customs failure
- Relatively small customer universe = easier to find and interview

If CertFlow validates here, the architecture generalizes. If it doesn't, kill the platform thesis and keep the F-gas vertical.

## Key Metrics

| Metric | Score |
|--------|-------|
| Transaction Blocking Power (TBP) | 9 |
| Preflight Advantage (PFA) | 8 |
| Government Fix Risk (GFR) | 5 (quota logic is durable; UI pain may be temporary) |
| Interface Accessibility (IFA) | 6 (F-gas portal has documented API / data model) |
| Preflight Fidelity (PFF) | 7 |
| Transaction Value at Risk (TVR) | 8 |
| Production Pain Evidence (PPE) | inferred (structured research, no named-company failures yet found) |
| Operational Choke-Point | 9 |
| Machine-Checkability | 9 |
| Evidence Compounding | 7 |

## Kill Conditions

- Existing F-gas quota brokers already provide pre-declaration reconciliation
- Customs software vendors (AEB, MIC) confirm F-gas checks are bundled in their next release
- F-gas Portal adds a direct "check my shipment" tool for importers
- Customer interviews show the pain is primarily in quota acquisition, not pre-declaration reconciliation

## Sources

- EU F-gas Portal: registration, licensing, HFC quota workflows
- Commission implementing decision: HFC quota reference values 2027–2029, June 2026
- CERTEX documentation: quota-consumption checks, F-gas as significant enforcement domain
- EU CSW-CERTEX Commission architecture documentation
