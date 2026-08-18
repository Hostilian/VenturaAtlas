# EHDS EHR Chaos Lab — Cross-Vendor EHR Interoperability Regression Cloud
**ID:** idea-424 | **RESET:** XVIII | **Date:** 2026-08-18
**Status:** watch | **Score:** 74/100 (reset-zero-baseline-provisional)
**Confidence:** LOW
**8-Gate:** Reality🟡 Buyer🟢 Frequency🟢 FailureCost🟢 Access🟡 Substitute🟡 Experimentability🟡 Expansion🟢

---

## The Framework

The European Health Data Space (EHDS) is building a single-market framework for electronic health-record systems, including:
- Strict interoperability and security criteria
- Pre/post-market compliance model for EHR systems
- Cross-border health data access for patients and researchers

## The Conceptual Opportunity

A **cross-vendor EHR interoperability regression cloud**:

```
EHR vendor A system
  ↔ national EHDS access layer
  ↔ EHR vendor B system (receiving)
  ↔ cross-border HL7 FHIR / openEHR / IHE profile
  ↔ semantic mapping
  ↔ patient record integrity
```

When vendor A releases an update, does the cross-border record exchange still work correctly with vendor B? Does a cross-border patient record import correctly into the national receiving system?

Conceptually similar to Invoice Replay Cloud but for health data exchange.

## Why This Is Watch, Not Build

| Issue | Assessment |
|-------|-----------|
| EHDS timing | Regulation adopted but Member State implementation timelines extend years out; no near-term mandatory interoperability deadline |
| Buyer accessibility | Public health systems, hospital IT procurement, EHR vendors — very long sales cycles |
| Technical access | Cross-border exchange infrastructure being built; no production test layer accessible yet |
| Official tooling | Commission building own conformance/testing infrastructure as part of EHDS implementation |

**Critical reset lesson:** This idea scores lower now than it would under the previous framework because the reset reweights timing and buyer accessibility heavily. The long-run policy vision is large, but the near-term reality is weak. The previous research framing over-promoted long-run policy visions.

## What Would Promote This

- A Member State or EHR vendor begins a co-funded interoperability testing programme with accessible participation
- Commission-published EHDS interoperability conformance requirements with specific test-harness needs
- A named EHR vendor identified as paying for cross-vendor regression testing

## 8-Gate Assessment

| Gate | Result | Notes |
|------|--------|-------|
| Reality | 🟡 | Framework real but production interoperability years away |
| Buyer | 🟢 | EHR vendors, national health authorities |
| Frequency | 🟢 | Every software update, every new cross-border route |
| Failure Cost | 🟢 | Patient safety implications — high when deployed |
| Access | 🟡 | No production cross-border layer accessible yet |
| Substitute | 🟡 | Commission building own conformance tooling |
| Experimentability | 🟡 | Hard to test without production EHDS infrastructure |
| Expansion | 🟢 | EU-wide EHR interoperability is a massive long-run surface |

## Kill Conditions (for watch period)

- Commission deploys own comprehensive EHDS interoperability test infrastructure that covers EHR vendor cross-testing
- Member State adoption slower than 2028; timing makes this a 2030+ opportunity

## Revisit Trigger

When: EHDS secondary use data spaces begin pilot operations AND an EHR vendor expresses paid interest in cross-vendor regression coverage.

## Sources

- EHDS Regulation (health.ec.europa.eu)
- EHDS strict interoperability/security criteria and pre/post-market compliance model
