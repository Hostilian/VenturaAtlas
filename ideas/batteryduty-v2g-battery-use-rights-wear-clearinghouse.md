# BatteryDuty -- V2G Battery-Use Rights & Wear Clearinghouse

> A neutral settlement layer for vehicle-to-grid battery use that records who used which battery, under what operating envelope, and what wear or compensation consequences follow.

## At a Glance

| Field | Summary |
|---|---|
| Idea ID | `idea-432` |
| Target customer | Fleet operators and V2G aggregators |
| Problem | V2G usage creates warranty, wear, and settlement disputes across multiple parties. |
| What to build | Battery duty receipts, operating-envelope tracking, and settlement-ledger exports. |
| How it makes money | Concierge settlement reports; fleet subscriptions; per-dispatch reconciliation. |
| Why customers pay | The product should produce a faster, safer, more verifiable outcome than ad hoc spreadsheets and charger logs. |
| Earning potential | USD 25k-1.5M annual scenario range; not a forecast |
| Startup cost | USD 0-10k scenario range |
| Time to MVP | 2-6 weeks |
| Time to first revenue | 1-4 weeks |
| Profitability condition | Contribution margin per fleet must exceed reconciliation, support, and review cost. |
| Overall opportunity score | 91/100 |
| Confidence | Medium |
| Main advantage | Durable ledger across mobility, warranty, and resale use cases |
| Main risk | OEMs or vertically integrated platforms absorb the ledger first |
| Best next validation | Shadow one month of charger/BMS exports for a fleet and ask whether the output would govern commercial settlement. |

## Identity and Provenance

- **Canonical ID:** `idea-432`
- **Legacy ID:** `batteryduty-v2g-battery-use-rights-wear-clearinghouse`
- **Slug:** `batteryduty-v2g-battery-use-rights-wear-clearinghouse`
- **Category:** Energy & Mobility Infrastructure
- **Status:** watch
- **Tags:** vehicle-to-grid, battery wear, settlement, fleet, warranty, energy storage, OMEGA XIX, 2026
- **Source references:** iea.org/vehicle-to-grid-technology, sciencedirect.com/v2g-impact-on-battery-degradation
- **Provenance status:** Derived from the 2026-08-22 reset corpus

## Customer Perspective

- **Primary Customer:** Fleet operators and V2G aggregators
- **Economic Buyer:** Fleet operators and V2G aggregators
- **Daily User:** fleet energy managers, dispatch operators, warranty admins
- **Current Situation:** Teams use charger exports, OEM portals, and manual spreadsheets to reconcile V2G use.
- **Specific Problem:** Multiple parties disagree about allowed battery use, wear, and compensation.
- **Frequency:** Ongoing across every dispatch cycle.
- **Pain And Cost:** Potential warranty disputes, degraded asset value, and hard-to-settle payments.

## Product Definition

- **Core Proposition:** A battery duty receipt for every grid-service dispatch.
- **MVP Scope:** Capture battery identity, allowed envelope, measured throughput, and settlement logic.
- **Key Features:** receipt generation, wear-budget tracking, exception flags, exportable dispute packet
- **Tech Stack:** web app, API, database, signed event log, charger/BMS import

## Financial & Profitability Analysis

- **Revenue Streams:** concierge fleet reports, recurring settlement subscriptions, integration fees
- **Pricing Strategy:** per fleet + per dispatch volume
- **Gross Margin:** 70-85%
- **Break-even Point:** a small number of commercial fleets with recurring V2G activity

## Validation & Action Plan

- **Validation Method:** concierge shadow accounting
- **Metric Gate:** 2-3 paid pilots or a signed settlement-use agreement
- **First Action:** interview fleets already testing bidirectional charging
- **Seven Day Plan:** create one sample duty receipt and a dispute packet
- **Thirty Day Plan:** run one month of shadow accounting and compare to buyer expectations

## Source References

- **iea.org/vehicle-to-grid-technology**: Vehicle-to-grid technology
- **sciencedirect.com/v2g-impact-on-battery-degradation**: Vehicle-to-grid impact on battery degradation

