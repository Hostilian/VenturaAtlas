# CENSUS — Opportunity Measurement × Denominator Intelligence Architecture

> **Core Directives:**
> 1. *NO MARKET NUMBER WITHOUT A DENOMINATOR MODEL.*
> 2. *NO DENOMINATOR WITHOUT A STATISTICAL UNIT.*
> 3. *UNKNOWN IS NOT ZERO.*
> 4. *A RANGE WITH HONEST UNCERTAINTY IS BETTER THAN A PRECISE FICTION.*

CENSUS is the opportunity measurement, denominator intelligence, and market quantification layer of **Venture Atlas OS**. It transforms vague TAM hand-waving into mathematically defensible, empirical denominator funnels with explicit uncertainty bounds.

---

## 1. Domain Ontology

```
POPULATION UNIVERSE (Broadest Set of Units)
       │  [Filter: Industry / Regulatory / Geography]
       ▼
ELIGIBLE POPULATION (Capable of using solution)
       │  [Filter: Exposure Condition / Trigger]
       ▼
EXPOSED POPULATION (Encounter the relevant situation)
       │  [Filter: Problem Incidence / Friction Rate]
       ▼
AFFECTED POPULATION (Actively suffer the problem)
       │  [Filter: Economic Severity / Willingness to Pay]
       ▼
SERVICEABLE POPULATION (CENSUS Ownership Boundary)
       │  [Filter: MERCURY Commercial Reachability]
       ▼
COMMERCIALLY REACHABLE POPULATION (MERCURY Ownership)
       │  [Filter: Validated Conversion / WTP]
       ▼
CURRENTLY OBTAINABLE POPULATION (Joint Ownership)
```

---

## 2. Statistical Unit Integrity

CENSUS strictly distinguishes statistical units to prevent unit conflation errors:
- `ENTERPRISE`: Independent legal entity with economic decision autonomy.
- `ESTABLISHMENT` / `LOCAL_UNIT`: Physical location or plant of an enterprise.
- `PERSON` / `EMPLOYEE`: Individual worker or decision maker.
- `ACCOUNT`: Contractual / billing relationship.
- `EVENT` / `TRANSACTION`: Discrete occurrence in time (Flow metric).
- `ASSET` / `FACILITY`: Physical infrastructure (e.g. building, energy site).

**Unit Arithmetic Invariants:**
- `STOCK ≠ FLOW`: Enterprises cannot be multiplied directly by annual fee without frequency normalization.
- `ENTERPRISES ≠ ESTABLISHMENTS`: An enterprise with 50 locations is 1 enterprise and 50 establishments.
- `CURRENCIES ≠ SUMMABLE`: EUR and USD cannot be added without explicit currency exchange and nominal price date.

---

## 3. Schema Entities (`schemas/`)

1. **`CensusStatisticalUnit` (`schemas/census-statistical-unit.schema.json`):** Defines statistical counting units and explicit incompatible units.
2. **`CensusPopulation` (`schemas/census-population.schema.json`):** Funnel level definitions with strict `basisType` epistemic tracking.
3. **`CensusSource` (`schemas/census-source.schema.json`):** Official statistical dataset registry (NACE/NAICS/Eurostat) with coverage inclusions and exclusions.
4. **`CensusEstimate` (`schemas/census-estimate.schema.json`):** Quantitative metrics with lower/central/upper uncertainty bounds, value states (`KNOWN`, `UNKNOWN`, `NOT_YET_MEASURED`), and anti-TAM guards.
5. **`CensusEstimateLineage` (`schemas/census-estimate-lineage.schema.json`):** Directed acyclic derivation tracking with explicit unit conversion steps.
6. **`CensusMeasurementQuestion` (`schemas/census-measurement-question.schema.json`):** Ranked empirical questions prioritized by Expected Value of Perfect Information (EVPI).

---

## 4. Anti-TAM-Theater Linter (Rules L01–L13)

- **L01:** Unit declaration required for every estimate.
- **L02:** Population level declaration required.
- **L03:** Suppressed / unknown data must NOT be represented as 0.
- **L04:** Revenue estimate without validated price state is rejected.
- **L05:** SCENARIO method estimates cannot claim empirical validation.
- **L06:** Unnormalized Stock × Flow multiplication is blocked.
- **L07:** Over-precision penalty (>3 significant figures on Fermi estimates).
- **L08:** Arbitrary "1% of TAM" SOM claims are blocked as epistemic theater.
- **L09:** Nonprobability convenience samples cannot produce design-based population inferences.
- **L10:** Subset population count cannot exceed parent population count.
- **L11:** Monetary metrics must declare ISO currency code and nominal price year.
- **L12:** Derived estimates must explicitly declare input assumptions.
- **L13:** Stale data older than threshold triggers review warning.
