# CENSUS Measurement Brief — Dogfood C: FlexCovenant (idea-008)

**Venture:** FlexCovenant (`idea-008`)  
**Category:** Industrial Energy Flexibility × Grid Governance  
**Terrain Problem:** `prob-008-flexibility-baseline-drift` (Unverifiable flexibility baseline adjustments)  
**Witness Status:** NO_EVIDENCE (Pre-witness; baseline dispute rate unmeasured)  

---

## 1. Denominator Funnel

| Funnel Level | Population ID | Statistical Unit | Point / Range | Basis & Source |
|---|---|---|---|---|
| **Facility Universe**| `pop-c01-facility-universe`| `unit-facility` | ~40,000 | EU Industrial Emissions Directive (IED) register |
| **Eligible Sites** | `pop-c02-flex-eligible` | `unit-facility` | 2,500 – 6,000 | Industrial sites with >1MW dispatchable flexibility |
| **Exposed Sites** | `pop-c03-flex-exposed` | `unit-facility` | 1,200 – 3,000 | Sites contracted in TSO balancing / reserve markets |
| **Affected Sites** | `pop-c04-flex-affected` | `unit-facility` | **NOT_YET_MEASURED** | Baseline dispute frequency unknown |

---

## 2. Epistemic Assessment & Bounding

- **Asset Unit Semantics:** Statistical unit is `unit-facility` (physical site), not enterprise. A chemical conglomerate (1 enterprise) may operate 12 distinct flexibility facilities.
- **Regulatory Foundation:** Clean Energy Package (Directive 2019/944) mandate for demand-response participation.
- **Main Uncertainty:** National grid code differences across EU-27 determine whether sub-metering or baseline adjustment is mandatory.
- **Next Measurement Task:** Analyze ENTSO-E balancing market non-delivery settlement records for 2024.
