# CRA Single Reporting Platform live watch

As-of: **2026-08-24**

## Current official state

- Reporting obligations begin 11 September 2026.
- Early warning: within 24 hours of awareness.
- Full notification: within 72 hours.
- Final report: no later than 14 days after a corrective measure is available for an actively exploited vulnerability, or within one month for a severe incident.
- Standalone SaaS and general cloud services are not automatically products with digital elements. A cloud service enters scope as a remote data processing solution only when it is designed under the manufacturer's responsibility and its absence prevents a product function.
- Article 14 also applies to in-scope products placed on the market before the general 11 December 2027 application date.
- ENISA says functional and security testing is under way.
- ENISA has published Assigned Representative registration guidance, notification/update guidance (3 August 2026), and interface-function guidance (14 August 2026).
- ENISA's FAQ now publishes the staged reporting field matrix: common fields plus separate vulnerability and incident fields, marked as obligatory, copied/updated, optional, conditionally obligatory, or automated across the 24-hour, 72-hour, and final stages.
- The FAQ explicitly says organisations may automate internal workflows, but **no Application Programming Interfaces will be provided at this stage**. Submission therefore remains an official web-platform handoff rather than a public machine-to-machine integration point.
- The public URL and the list of designated national CSIRT coordinators had not yet been published; ENISA says the latter will be provided later.

## Opportunity correction

- The cheap scope/runbook/template tier is not empty. Vexwatch advertises a EUR 49 small-team pack; CRA Report offers a browser-local reporting workflow; CVD Portal offers a free Article 14 template builder; and Venvera and Acuna explicitly sell reporting-clock/evidence workflows.
- The surviving portfolio hypothesis is not an SBOM generator or filing wrapper. It is incident-evidence integrity across awareness time, trigger classification, affected product/version reach, mitigation, affected-user notice, and the final-report trigger.
- Treat this as a re-underwriting of `idea-401` CRA ReachLedger / CRA Clock / CRA Incident Compiler, not a new candidate.

## Watch fields

| Field | Baseline |
|---|---|
| registration | AR guidance published |
| interface | AR interface guidance published |
| notification/update workflow | guidance published |
| public API | not established |
| sandbox/test account | not established |
| field matrix/schema | official stage matrix captured in ENISA FAQ; no machine-readable API schema |
| manufacturer feedback | none captured |
| outage/failure reports | none captured pre-launch |
| vendor integrations | not yet audited |

## Re-score triggers

- API or integration documentation appears;
- machine-readable schema/field changes appear;
- registration is opened broadly;
- first manufacturer workflow evidence appears;
- launch outage or missed-deadline failure is documented;
- a cybersecurity vendor announces a working integration;
- ENISA materially changes timing or reporting flow.
- ENISA publishes the SRP URL, coordinator list, or a revised field matrix.

Sources:

- https://digital-strategy.ec.europa.eu/en/policies/cra-reporting
- https://digital-strategy.ec.europa.eu/en/library/commission-publishes-new-guidance-support-timely-cyber-resilience-act-implementation
- https://www.enisa.europa.eu/topics/product-security-and-certification/single-reporting-platform-srp
- https://www.enisa.europa.eu/topics/product-security/single-reporting-platform-srp/frequently-asked-questions
- https://vexwatch.com/
- https://crareport.eu/
- https://cvdportal.com/tools/notification-template-builder
- https://www.venvera.com/frameworks/cra
- https://acunagrc.com/en/solutions/cyber-resilience-act
