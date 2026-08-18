# Invoice Replay Cloud — Cross-Country E-Invoice Production Regression
**ID:** idea-421 | **RESET:** XVIII | **Date:** 2026-08-18
**Status:** priority | **Score:** 88/100 (reset-zero-baseline-provisional)
**Confidence:** MEDIUM
**8-Gate:** Reality🟢 Buyer🟢 Frequency🟢 FailureCost🟢 Access🟢 Substitute🟡/🔴 Experimentability🟢 Expansion🟢

---

## What Is Killed First

**KILL:** Another European e-invoice API.
**KILL:** Another XML/schema validator.
**KILL:** Another Peppol gateway.
**KILL:** Another "AI invoice compliance checker."

Why: Tradeshift, Pagero/Thomson Reuters, Iopole, Storecove and others already provide cross-country e-invoicing. The Commission provides a free eInvoice Test Bed (REST/SOAP). Ecosio and multiple open-source validators are free. Poland provides an official KSeF test environment. Storecove already advertises France sandbox testing.

## The Real Problem

> **schema valid ≠ business transaction works**

A syntactically perfect invoice can still fail because of:
- Routing (wrong platform assignment)
- Tax treatment (e.g. cross-border VAT edge cases)
- Lifecycle handling (duplicate detection, credit-note sequencing)
- Recipient lookup failure (directory miss)
- Credit-note / correction logic
- Rounding differences across country implementations
- Downstream buyer system ingestion (SAP/Oracle import rejection)

### Production Failure Example

```
France invoice:             XML schema PASS
PA routing:                 PASS
Recipient directory:        PASS
Tax reporting fields:       PASS
Buyer SAP ingestion:        FAIL
Credit-note lifecycle:      FAIL

Poland KSeF equivalent:     PASS
Germany EN16931/XRechnung:  PASS

Release:                    BLOCKED
```

## The Product: BrowserStack for Finance-System Regulatory Transactions

Not: conformance test suite.
Not: schema validator.
Not: network / gateway.

**Full production-behavior replay:**

```
ERP invoice scenario
  → tax logic
  → country schema
  → routing
  → government/approved platform
  → lifecycle response
  → buyer receipt
  → buyer accounting import
  → correction/credit note
  → reconciliation
```

### Example Report

```
Invoice Replay: DE-001 → FR-001 (Sep 2026 France mandatory-receiver)

Country:             France
Platform:            Chorus Pro
Schema:              PASS
Routing:             PASS
Directory:           PASS
Tax:                 PASS
Lifecycle (issue):   PASS
Credit-note seq:     FAIL — credit note references original invoice ID
                     rejected by Chorus Pro (requires document series prefix)
Buyer ingestion:     FAIL — SAP FI-002 rejects >2 decimal places in unit price
Overall:             BLOCKED
```

## Falsification Question

> Do multinational ERP/tax teams still build substantial internal regression suites despite paying an e-invoicing network?

- **No:** Kill it — the sandbox already covers this.
- **Yes, but internal = expensive:** Potentially very interesting.
- **Yes, and they share across vendors:** Platform opportunity.

## Forcing Functions

| Event | Date | Impact |
|-------|------|--------|
| Poland KSeF 2.0 mandatory (first wave) | Feb 1, 2026 | Businesses already live |
| Poland KSeF 2.0 mandatory (main wave) | Apr 1, 2026 | Main wave already live |
| France mandatory receiver capability | Sep 1, 2026 | Imminent |
| EU ViDA cross-border digital reporting | Jul 1, 2030 | Long-term anchor |

## Buyer Profile

Multinational ERP/tax teams, e-invoicing platform vendors integrating country packs, tax-technology consulting firms running country go-lives.

**Exact payer:** Tax technology director at mid-large multinational with operations in 3+ EU countries currently onboarding France/Poland mandates.

## First Experiment

1. Contact 20 multinational ERP/tax teams with Polish or French operations
2. Ask: "Do you have internal test suites beyond what your e-invoicing network provides?"
3. If yes: offer to run their next France onboarding scenario end-to-end and deliver a failure report
4. **PASS:** 3 paid trials at €199–€499 each
5. **KILL:** "Our e-invoicing vendor / SAP Finance handles all of this"

## Key Metrics (8-Gate)

| Gate | Result | Notes |
|------|--------|-------|
| Reality | 🟢 | Poland live Feb/Apr 2026; France Sep 2026 |
| Buyer | 🟢 | Multinational ERP/tax teams named |
| Frequency | 🟢 | Every go-live, every new country pack |
| Failure Cost | 🟢 | Blocked transactions, manual correction, VAT penalties |
| Access | 🟢 | Official test environments exist |
| Substitute | 🟡/🔴 | Storecove/Pagero sandboxes + SAP test clients |
| Experimentability | 🟢 | 20 contacts + offer in < 7 days |
| Expansion | 🟢 | Per-country → multi-country → continuous regression |

## Provisional Metrics (production-failure framework)

| Metric | Score |
|--------|-------|
| Transaction Blocking Power (TBP) | 8 |
| Preflight Advantage (PFA) | 8 |
| Government Fix Risk (GFR) | 5 (lifecycle/SAP-ingestion problem is not a schema fix) |
| Interface Accessibility (IFA) | 7 (official test envs exist) |
| Preflight Fidelity (PFF) | 6 (how well does test env simulate prod?) |
| Transaction Value at Risk (TVR) | 7 |
| Production Pain Evidence (PPE) | inferred |

## Kill Conditions

- Sandbox/test mode from e-invoicing vendors already covers credit-note lifecycle + buyer ingestion
- ERP vendors confirm they bundle country-specific test suites automatically
- Zero payment interest from 20 target contacts

## Sources

- KSeF 2.0 mandatory waves: Feb 1 and Apr 1, 2026 (ksef.podatki.gov.pl)
- France facturation électronique: Sep 1, 2026 receiver capability (impots.gouv.fr)
- EU ViDA work programme: Jul 1, 2030 cross-border digital reporting
- Storecove France 2026 sandbox (storecove.com)
- Commission eInvoice Test Bed (itb.ec.europa.eu)
- Ecosio free validator; KSeF test environment (ksef-test.mf.gov.pl)
