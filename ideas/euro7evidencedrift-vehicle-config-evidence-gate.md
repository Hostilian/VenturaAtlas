# Euro 7 Vehicle Evidence Drift — Vehicle Configuration Evidence Gate
**ID:** idea-423 | **RESET:** XVIII | **Date:** 2026-08-18
**Status:** watch | **Score:** 79/100 (reset-zero-baseline-provisional)
**Confidence:** LOW-MEDIUM
**8-Gate:** Reality🟡 Buyer🟢 Frequency🟢 FailureCost🟢 Access🔴 Substitute🟡 Experimentability🟡 Expansion🟡

---

## The Regulatory Event

Euro 7 applies to new light-duty vehicle types from **November 29, 2026**. The regime includes an **Environmental Vehicle Passport** concept and broader environmental-performance requirements extending beyond conventional exhaust emissions to brake dust, tyre abrasion, battery durability, and software/calibration state.

## The Systems Problem

```
type_approval
  ↔ vehicle_configuration
  ↔ battery_durability_state
  ↔ software_version / calibration_version
  ↔ environmental_performance_data
  ↔ environmental_vehicle_passport
```

A software/calibration revision that changes an environmental parameter after certification creates a configuration drift problem: does the vehicle configuration delivered on VIN X still correspond to the regulatory/passport state claimed at time of type approval?

## The Gate Concept

```
VIN query
  → declared type-approval state
  → current software version
  → current calibration version
  → environmental parameter(s) derived from this software/calibration
  → passport state
  → delta
```

If delta is material: configuration is non-conformant.

## Why This Is Watch, Not Priority

| Obstacle | Assessment |
|----------|-----------|
| Buyer accessibility | OEM compliance engineers / homologation teams — very long procurement, deeply embedded tooling, partner onboarding requirements |
| Incumbent tooling | OEMs have sophisticated type-approval management stacks; homologation specialists (IDIADA, TÜV, DEKRA) deeply embedded |
| Technical access | VIN → configuration data requires OEM partnership or regulatory access; not publicly available |
| Bootstrap feasibility | Very poor |

**Lesson from this reset:** A perfect regulation does not compensate for an unreachable buyer. High access gate score (🔴) alone is not recoverable without a clear entry path.

## Possible Narrow Wedge

**Software-update evidence logging** for Tier-1 suppliers and independent test labs — not OEMs directly.

If a Tier-1 supplier updating ECU software needs to prove the update did not change Euro 7-relevant parameters, they may need an evidence record independent of OEM tooling. This is a narrower hypothesis but more bootstrap-accessible.

## Promotion Conditions

- Interview evidence from a Tier-1 supplier or independent test lab showing their current tooling does not cover cross-update environmental-parameter change evidence
- An accessible pilot partner with Euro 7-relevant software update workflows

## Key Metrics (8-Gate)

| Gate | Result | Notes |
|------|--------|-------|
| Reality | 🟡 | Nov 29, 2026 application — imminent but OEM cycles much longer |
| Buyer | 🟢 | OEM compliance / homologation team identified |
| Frequency | 🟢 | Software update cycles generate ongoing need |
| Failure Cost | 🟢 | Type-approval non-conformance = major regulatory/recall liability |
| Access | 🔴 | Very poor bootstrap accessibility |
| Substitute | 🟡 | OEM internal tooling + homologation specialists |
| Experimentability | 🟡 | Hard to falsify quickly without OEM access |
| Expansion | 🟡 | Vehicle passport ecosystem possible but years away |

## Kill Conditions

- No Tier-1 supplier or test lab willing to co-develop within 60 days
- OEM tooling confirmed to already handle cross-update parameter tracking

## Sources

- Euro 7 light-duty application: November 29, 2026 (EUR-Lex)
- Environmental Vehicle Passport concept (EUR-Lex COM(2022) 586)
- Euro 7 technical requirements and certification rules (EUR-Lex summary)
