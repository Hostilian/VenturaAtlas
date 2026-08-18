# EPREL Retail-State Drift Monitor
**ID:** idea-418 | **OMEGA:** XVII-B | **Date:** 2026-08-18
**Status:** researched | **Score:** 84/100 (analyst-provisional)
**Confidence:** MEDIUM
**Best role:** Module for large retailers; possibly standalone for compliance-intensive verticals

---

## The Mandatory System

EPREL (European Product Registry for Energy Labelling) is the EU's authoritative registry for energy-labelled products.

- Suppliers register product models in EPREL before placement on the market
- Suppliers provide public model information + technical/compliance information
- Dealers have obligations around displaying correct energy labels and product-information sheets
- EPREL exposes APIs suitable for online stores

### Recent Improvement: GTINs + Model Pictures (July 2026)

The Commission now allows additional product identification including **commercial name, GTIN, and model pictures** (pictures available from July 20, 2026). This makes automated identity reconciliation significantly more useful.

## What NOT to Build

- "Retrieve the EPREL energy label" API wrapper — Commission already supplies APIs and supporting mechanisms
- Generic energy-labelling compliance dashboard

## The Product: Retail Drift Monitor

Crawl a retailer's entire online catalogue. Map SKU/GTIN/model to EPREL. Check:

- Correct energy label displayed
- Correct energy class
- Correct class range
- Correct Product Information Sheet (PIS)
- Correct model identity
- Valid supplier state
- Correct QR / registration relationship
- No stale discontinued model
- No mismatch between marketplaces

### Example Output

```
46,830 products checked

44   missing mandatory label presentation
31   wrong EPREL model mappings
7    products mapped to unverified supplier model
113  stale PIS files
6    GTIN collisions
9    marketplaces disagree with retailer's canonical PIM
```

## Why This Fits the Product Identity Spine Thesis

The state-divergence surface:
```
manufacturer → EPREL → PIM → retailer → marketplace → product_page
```

Every hop introduces drift. The monitor catches it before enforcement actions.

## Competitive Risk

Retail/PIM vendors may absorb this as a feature. The stronger the free EPREL API becomes, the less attractive simple retrieval becomes. The moat is the **catalogue-scale mapping** (GTIN/SKU → EPREL model), not the data access itself.

## First Experiment

Offer one mid-size online retailer a free drift report on their full product range. Ask:
- Did they already know about these mismatches?
- Who owns the fix (content team, legal, supplier)?
- Would they pay for ongoing monitoring?

**PASS:** "We have 200+ drifted models — we need this monthly"
**KILL:** "Our ERP/PIM team already catches this before publishing"

## Key Metrics

| Metric | Score |
|--------|-------|
| Transaction Blocking Power (TBP) | 5 (enforcement risk, not immediate shipment block) |
| Preflight Advantage (PFA) | 7 |
| Government Fix Risk (GFR) | 5 (GTIN mapping layer is durable; single-field retrieval is commoditized) |
| Interface Accessibility (IFA) | 9 (public EPREL API) |
| Preflight Fidelity (PFF) | 8 |
| Transaction Value at Risk (TVR) | 6 (regulatory fine risk; not per-shipment) |
| Production Pain Evidence (PPE) | inferred |
| Operational Choke-Point | 5 |
| Machine-Checkability | 9 |
| Evidence Compounding | 7 |

## Kill Conditions

- Retail/PIM vendors add EPREL synchronization as a standard feature
- Enforcement risk for incorrect labels is shown to be minimal in practice
- EPREL API improvements make the catalogue-mapping layer trivial

## Sources

- EPREL public API and supplier documentation
- Commission: GTIN and model pictures available from July 20, 2026
- EU Energy Labelling Regulation dealer obligations
