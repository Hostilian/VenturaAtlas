# Recall Propagation Proof
**ID:** idea-420 | **OMEGA:** XVII-B | **Date:** 2026-08-18
**Status:** watch | **Score:** 75/100 (analyst-provisional)
**Confidence:** MEDIUM
**Classification:** KILL for standalone; watch as Compliance OS module

---

## Why Generic Safety Gate Monitor Is Killed

SafeCart markets marketplace-scale recall matching against Safety Gate data. Other low-cost scrapers and monitoring tools exist.

**KILL:** Generic "monitor EU Safety Gate and match recalls against your catalog."

## The Residual Question

> Did the recall actually propagate through the operating business?

```
recall_notice
  → affected_GTINs / SKUs
  → web_listings_disabled
  → marketplace_listings_disabled
  → WMS_inventory_quarantined
  → fulfillment_blocked
  → customer_cohort_resolved
  → communication_sent
  → return / destruction_evidence
```

That is not a monitoring problem. It is an **evidence problem** — proving that an organization responded completely and in time.

## The Product

A Recall Response Evidence Graph:

For each recall notice:
1. Identify all affected GTINs / batch codes / date ranges
2. Map to current inventory locations (WMS, marketplace, in-transit)
3. Track status of each remediation step
4. Generate a timestamped evidence chain for regulators / insurers / legal

## Why It Is Watch, Not Priority

- Existing product-safety platforms (RecallDesk, FieldWatch, sector-specific tools) may already cover this
- The buyer (legal / compliance / risk) has lower transaction-blocking urgency than a customs failure
- The value is strongest for large multi-channel retailers — a harder first sale
- Requires WMS / marketplace integrations that raise MVP cost

## Promotion to Priority Conditions

- Interview evidence shows existing tools do NOT cover cross-channel propagation evidence
- A retailer offers to co-fund a pilot after experiencing an enforcement action
- EU Product Safety Regulation (GPSR) enforcement increases, creating documented gaps

## Relationship to Compliance OS

Most likely path: module within a broader product-safety or compliance-operations platform, triggered by incoming Safety Gate alerts. Sold as an add-on to WMS / OMS / marketplace management tools.

## Key Metrics

| Metric | Score |
|--------|-------|
| Transaction Blocking Power (TBP) | 5 |
| Preflight Advantage (PFA) | 6 |
| Government Fix Risk (GFR) | 3 (propagation evidence is inherently multi-system) |
| Interface Accessibility (IFA) | 8 (Safety Gate API is public) |
| Preflight Fidelity (PFF) | 7 |
| Transaction Value at Risk (TVR) | 7 (regulatory fine + liability) |
| Production Pain Evidence (PPE) | inferred |
| Operational Choke-Point | 4 |
| Machine-Checkability | 7 |
| Evidence Compounding | 8 |

## Kill Conditions (permanent)

- Existing product-safety platforms confirmed to cover multi-channel propagation evidence
- GPSR enforcement in practice shown to be low / non-automated

## Sources

- Safety Gate (EU Product Safety Database) public API
- SafeCart marketplace-scale recall matching (competitor landscape)
- EU General Product Safety Regulation (GPSR) enforcement obligations
