# CENSUS Measurement Brief — Dogfood B: FactBounty (idea-061)

**Venture:** FactBounty (`idea-061`)  
**Category:** Physical Verification Marketplace / On-Demand Audit  
**Terrain Problem:** `prob-061-shelf-truth-gap` (Retail execution drift & unverified shelf reality)  
**Witness Status:** NO_EVIDENCE (Pre-witness; commercial status C0)  

---

## 1. Denominator Funnel & Stock-to-Flow

| Funnel Level | Population ID | Statistical Unit | Point / Range | Basis & Source |
|---|---|---|---|---|
| **Enterprise Stock** | `pop-b01-mfg-universe` | `unit-enterprise` | ~350,000 | Eurostat SBS (Mfg >10 employees) |
| **Eligible Stock** | `pop-b02-cpg-eligible` | `unit-enterprise` | 25,000 – 45,000 | NACE C10 (Food), C11 (Beverages), C20 |
| **Audit Event Flow** | `pop-b03-audit-flow` | `unit-verification-event` | 1.2M – 4.5M events/yr | Assumed 50–100 retail audit events/enterprise/yr |
| **Affected Flow** | `pop-b04-drift-events` | `unit-verification-event` | **NOT_YET_MEASURED** | Discrepancy rate requires shelf inspection receipts |

---

## 2. Epistemic Assessment & Bounding

- **Unit Conversion Discipline:** Enterprise count (Stock) cannot be multiplied directly by event fee. Stock is converted to annual audit volume (Flow) via explicit lineage step `lin-b03`.
- **Pricing & Revenue State:** Unit price per audit is NOT_YET_MEASURED. Revenue TAM cannot be computed until customer willingness to pay is established in MERCURY.
- **Commercial Evidence:** Strictly C0 (Hypothetical Buyer). 0 paying customers.
- **Next Measurement Task:** Measure execution discrepancy frequency across 5 major supermarket chains.
