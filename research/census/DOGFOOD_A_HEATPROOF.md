# CENSUS Measurement Brief — Dogfood A: HeatProof (idea-001)

**Venture:** HeatProof (`idea-001`)  
**Category:** B2B Energy Performance Contracting (EPC)  
**Terrain Problem:** `prob-001-epc-dispute` (M&V baseline drift and payment disputes)  
**Witness Status:** NO_EVIDENCE (Pre-witness; field rate unmeasured)  

---

## 1. Denominator Funnel

| Funnel Level | Population ID | Statistical Unit | Point / Range | Basis & Source |
|---|---|---|---|---|
| **Universe** | `pop-a01-epc-universe` | `unit-building-commercial` | ~55,000,000 | Eurostat Building Stock (non-residential) |
| **Eligible** | `pop-a02-epc-eligible` | `unit-epc-engagement` | 600 – 10,000 (Central ~3,500) | EUROACE 2023 / BPIE Cumulative |
| **Exposed** | `pop-a03-epc-exposed` | `unit-epc-engagement` | 600 – 10,000 | IPMVP contractual M&V obligation (100%) |
| **Affected** | `pop-a04-epc-affected` | `unit-epc-engagement` | **NOT_YET_MEASURED** | Dispute rate unknown (Requires WITNESS) |
| **Serviceable**| `pop-a05-epc-serviceable` | `unit-epc-engagement` | **NOT_YET_MEASURED** | Contracts with telemetry access |

---

## 2. Epistemic Assessment & Bounding

- **Top-Down Sanity Check:** Total EU ESCO market is €3B–€5B/year. If average contract annual value is €500k, that implies ~7,000 active projects.
- **Counter-Estimate:** BPIE records 35,000+ cumulative projects since 2000. Assuming average 5-year project duration gives ~7,000 active projects.
- **Main Uncertainty:** Project value distribution is heavily skewed; smaller contracts (<€100k) are underreported in industry surveys.
- **Next Measurement Task:** Survey 30 ESCO project managers to estimate the dispute rate (`% of settlements contested`).
