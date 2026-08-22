# Validation Plan — BatteryDuty -- V2G Battery-Use Rights & Wear Clearinghouse

## Experiments

- **Most Important Uncertainty:** Will fleet and aggregator buyers treat the receipt as settlement-grade evidence?
- **Riskiest Assumption:** Multi-party V2G arrangements create a real need for neutral wear accounting.
- **Cheapest Test:** One fake-but-realistic duty receipt based on anonymized charger/BMS exports.
- **Fastest Test:** Shadow-account a month of dispatches and ask buyers whether they would sign this output.
- **Interview Plan:** Interview 10 fleet operators, 5 aggregators, and 5 warranty stakeholders.

### Interview Questions
- What do you use today to reconcile dispatch, wear, and compensation?
- Where do disputes happen?
- Who pays when battery use is outside the envelope?
- Would you let a third party define the settlement record?
- What would make this untrustworthy?
- What proof would be enough to use it commercially?

- **Landing Page Test:** Show one real example receipt and ask for a pilot deposit.
- **Smoke Test:** Offer a one-month settlement shadow report before any software build.
- **Concierge Mvp:** Manually reconcile usage and produce a signed receipt.
- **Wizard Of Oz:** Simulate automated import behind a simple spreadsheet workflow.
- **Prototype Test:** Compare receipt output against fleet and aggregator judgment.
- **Pricing Test:** Offer per-fleet and per-dispatch pricing to see which is legible.
- **Demand Threshold:** At least 2 paid pilots or 1 pilot plus 1 conversion to recurring use.

### Success Criteria
- buyer accepts neutral accounting
- settlement output is reused
- disputes become faster to resolve
- revenue exceeds manual labor cost

### Failure Criteria
- OEM reports are considered sufficient
- buyers refuse third-party settlement evidence
- dispatch volumes are too small
- data access is too brittle

### Evidence Before Build
- last-event interviews
- sample charger/BMS exports
- signed pilot
- clear settlement use case

### Plan48 Hours
- create one sample receipt
- talk to 5 target fleets
- identify one recurring dispatch source

### Plan7 Days
- produce one shadow report
- test buyer willingness to pay
- document objections

### Plan30 Days
- run one month of reconciliation
- measure labor and disputes
- decide whether to build or stop

