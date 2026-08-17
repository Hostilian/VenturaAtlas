# BatteryFlightGate — Physical State-of-Charge Evidence Gate for Air Cargo
**ID:** idea-413 | **OMEGA:** XVIII | **Date:** 2026-08-18
**Status:** priority | **Score:** 80/100

## The Regulatory Gap

From **1 January 2026**, IATA requires Li-ion batteries packed with equipment offered for air transport
at ≤30% of rated state of charge (SoC) unless appropriate approval applies.

**IATA DG Digital** (launched March 2026) digitizes DG declarations — but does NOT physically verify
the SoC in the warehouse. DHL's own guidance tells shippers to verify SoC with a battery tester
before shipment. That gap is the product.

## Official Digitisation Boundary

```
Official: DG declaration / acceptance automation (IATA DG Digital)
─────────────────────────────────────────────────────────────────
GAP:      physical SoC measurement at warehouse
─────────────────────────────────────────────────────────────────
Product:  serial/batch-linked measurement → evidence → declaration bridge
```

## The Product

Not: AI predicts compliance. Not: DG declaration software.

**Deterministic warehouse release gate:**

```
Shipment B-778 | 42 battery packs
42/42 SoC records present
41 under threshold | 1 reading: 38%
Status: HOLD
```

First version: CSV + mobile browser capture + PDF evidence report. No AI required.

## Product Boundary (Critical)

Does NOT certify battery safety.
Records: authorized measurement, source, threshold, shipment linkage, completeness.
Customer's trained DG staff remain responsible.

## First Product: Battery Air-Shipment Release Pack

Price: **$99–$199** per first workflow setup/audit.
Target: small electronics manufacturers, battery-pack assemblers, e-bike exporters, specialist forwarders.

## Payment Test

Offer: "I will convert your existing SoC process into one serial/batch-linked release record and
show where evidence can fall out before your DG declaration."
Target: 25 specialist shippers.

**PASS:** 3 payments of ~$99.
**STRONGER:** "Every shipment needs this."
**KILL:** "Our WMS/BMS/forwarder already records this in auditable form."

## Key Metrics

| Metric | Score |
|--------|-------|
| PPD (Physical Proof Distance) | 9.5 |
| ODB (Official Digitisation Boundary) | 9.0 |
| RSE | 4.0 |
| Contract Memory Score | 2.0 |

## Why Not #1

Operative since January — 8 months of adaptation time already elapsed.
WMS/forwarder/BMS may already cover this for many customers.

## Kill Conditions

- Warehouse already captures BMS readings in auditable form
- Forwarder handles acceptance + creates its own record
- WMS vendors add a numeric field + rules within 60 days
- Liability exposure exceeds subscription economics

## Sources

- IATA Dangerous Goods Regulations 2026 edition (≤30% SoC packing instruction)
- IATA DG Digital launch announcement March 2026
- DHL dangerous goods preparation guidance
- UN3481 packing instruction documentation
