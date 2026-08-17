# OMEGA XV — Cutover Inventory Clock

Date: 2026-08-17  
Status: payment-validation staging, not validation or canonical promotion

## Decision

The fresh wedge is not generic regulatory software. It is a transaction preflight for inventory or purchase orders that cross a future state boundary and need evidence controlled by an upstream supplier, mill, certifier, or competent authority.

The two lead experiments are:

1. **AttestReady — AMR Export Inventory-to-Certificate Preflight**. A manual-first scan of batches, ingredients, origin, planned shipment, and supporting documents. It returns `CERTIFIER-READY`, `HUMAN REVIEW`, `EVIDENCE MISSING`, `SOURCE NOT ELIGIBLE`, or `AMBIGUOUS`; it does not issue an EHC or certify compliance.
2. **SteelLandedRisk — Steel Quota/Tariff-Cliff Transaction Preflight**. A PO-specific scenario joining quota state, customs timing, potential duty exposure, and melt-and-pour evidence. It does not promise quota allocation.

MicroIFUD remains a narrow test only. Generic EHC software, generic quota tracking, generic deadline trackers, and OrganicCOI as a new thesis remain rejected or demoted.

## Verified boundaries

The European Commission states that animal-origin imports require authorised countries, traceability, official certificates, and border checks; non-compliant consignments may be refused or otherwise handled by competent authorities. GOV.UK states that GB animal-product exports require an EHC and an official vet or inspector. The Commission’s steel consultation confirms that melt-and-pour evidence is a distinct object. These facts establish workflow pressure, not purchase demand.

The report’s 3 September AMR date, 1 October steel date, prices, scores, and payment thresholds are recorded as research hypotheses or implementation inputs. They must be refreshed before outreach. The UK-EU SPS trajectory is an explicit short-half-life risk for AttestReady.

## New metrics

- **CCIE — Certification Cutover Inventory Exposure:** inventory or PO value × probability of crossing the cutover × evidence deficiency × failure severity.
- **DRP — Deadline Reliability Penalty:** deadline certainty × implementation maturity × political durability × technical readiness.
- **TCS — Tariff Cliff Severity:** discontinuous economic magnitude × probability near the decision point × time available to reroute or reprice.
- **PCL — Pre-Certifier Leverage:** how much missing-fact discovery can be removed before an accountable professional or authority reviews the case.

No payment, customer data, certification outcome, quota allocation, or repeat need has been earned yet.
