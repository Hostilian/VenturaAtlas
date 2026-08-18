# Battery Health Attestation
**ID:** idea-419 | **OMEGA:** XVII-B | **Date:** 2026-08-18
**Status:** researched | **Score:** 80/100 (analyst-provisional)
**Confidence:** MEDIUM
**Best role:** Module, not first company. Evidence-quality layer for battery passport ecosystem.

---

## The Problem

Battery-management-system (BMS) representations of state-of-health (SOH) are unreliable. A 2026 cross-manufacturer study covering more than 1,000 electric vehicles found:

- Significant variation between actual capacity degradation and BMS representations
- Manufacturer-level differences in SOH calculation methods
- Cases where useful SOH information was unavailable

The EU Battery Regulation mandates SOH in battery passports — but the evidence-quality problem is not solved by mandating the field.

## What NOT to Build

- "We test battery health" — independent battery-health certification/testing already exists commercially
- Generic battery-passport generator
- Simple battery-passport schema validator

## The Product: SOH Evidence Attestation

Every published battery-health value carries structured provenance:

```
battery_id
passport_version
soh_value
measurement_method
software_version
calibration_version
raw_input_provenance
bms_data_reference
independent_diagnostic_data (if available)
confidence
timestamp
signer
```

Then if SOH changes from 91% to 84%, the system can answer:

- **Did the battery degrade?**
- **Did the algorithm change?**
- **Did calibration change?**
- **Did another measurement method produce the new result?**

That is an evidence-quality problem, distinct from health testing.

## Why Not a Standalone Company

- Battery diagnostics already crowded
- Passport conformance tooling ecosystem growing rapidly (BatteryPass-Ready, DPP vendors)
- Core value is the **evidence-structure layer** on top of existing health data, not the measurement

Most viable as:
1. A module within a ProofOps / EvidenceGraph platform
2. An API offered to battery-passport platform vendors
3. A component of a Battery Passport SaaS for recyclers/second-life operators

## Residual Opportunity

The clearest standalone case: **second-life battery trading**. When a used EV battery enters the secondary market, buyers need to trust not just the SOH number but the **method and provenance** behind it. That is a specific, monetizable transaction.

## Key Metrics

| Metric | Score |
|--------|-------|
| Transaction Blocking Power (TBP) | 5 (trust barrier, not legal block) |
| Preflight Advantage (PFA) | 6 |
| Government Fix Risk (GFR) | 6 (regulation mandates field but not evidence structure) |
| Interface Accessibility (IFA) | 7 |
| Preflight Fidelity (PFF) | 6 |
| Transaction Value at Risk (TVR) | 7 (second-life battery transaction values) |
| Production Pain Evidence (PPE) | industry_association (2026 cross-manufacturer study) |
| Operational Choke-Point | 5 |
| Machine-Checkability | 8 |
| Evidence Compounding | 8 |

## Kill Conditions

- Battery diagnostics platforms add passport-linked provenance records
- BatteryPass-Ready extends conformance testing to cover measurement-method attestation
- Second-life battery trading market too thin for standalone economics

## Sources

- 2026 cross-manufacturer EV battery study: SOH variation across 1,000+ vehicles (arXiv)
- EU Battery Regulation: SOH in battery passport mandate
- BatteryPass-Ready: conformance/interoperability test environment development
