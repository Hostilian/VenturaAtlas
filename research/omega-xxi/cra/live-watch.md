# CRA Single Reporting Platform live watch

As-of: **2026-09-27**

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
- **Observed 5 September 2026; ENISA FAQ updated 4 September 2026:** ENISA published a new SRP Glossary and substantially revised the FAQ. The FAQ now states that the 11 September launch will allow only mandatory Article 14 and Article 24(x) reporting; voluntary Article 15 reporting will not be available at launch and is deferred to a future phase.
- The revised FAQ gives the operational workflow: save an Early Warning as a draft, submit it, and continue the same notification record through the 72-hour notification, updates, and final report. This makes continuity, stage status, and evidence preservation central to the surviving orchestration wedge.
- The Glossary/FAQ now publish the complete field list, including product version, support status, component, attack vector, awareness timestamp, corrective measures, PEC/delay reason, and distinct AEV/SI fields, with per-stage required/optional/copied/automated status and expected formats.
- Registration details remain personal EU Login with MFA, one Primary AR and up to 20 Secondary ARs, invitations for Secondary ARs, and up to 20 notifications by a non-validated AR before validation becomes mandatory. No additional corporate-entity authentication is currently used.
- The revised FAQ clarifies coordinator selection: use the main establishment; if that cannot be determined, use the EU establishment with the most employees; for non-EU manufacturers, use the authorised-representative, importer, distributor, or user-count tie-break sequence.
- ENISA says CSIRTs participated in user and security testing and provided feedback. The FAQ now says the platform itself is scheduled for 11 September, while supporting materials will be progressively translated; platform-language availability beyond the initial release is deferred to a later project phase.
- ENISA documents a failure fallback: if the SRP is temporarily unavailable, contact the designated CSIRT directly if immediate communication is necessary, then submit through the SRP once restored. The direct contact does not replace the eventual SRP filing.
- **Post-launch check, 27 September 2026:** the SRP is operational at https://portal.cra-srp.enisa.europa.eu/ . ENISA now publishes the coordinator list, user manual, tutorial, Terms and Conditions, PEC guidance, and multilingual factsheet links.
- ENISA's post-launch FAQ discloses a production counter defect: the current 72-hour counter displays a due time 48 hours after Early Warning submission, so a notification can appear overdue before 72 hours have elapsed since legal awareness. ENISA says a future release will calculate it from the awareness timestamp. No AEV final-report counter is currently implemented; the SI counter uses one month after the 72-hour SI notification.
- The FAQ also states that Primary and Secondary ARs can continue/update one another's notifications, except drafts, which remain local to the individual AR account. This creates a concrete continuity boundary for evidence orchestration.

## Opportunity correction

- The cheap scope/runbook/template tier is not empty. Vexwatch advertises a EUR 49 small-team pack; CRA Report offers a browser-local reporting workflow; CVD Portal offers a free Article 14 template builder; and Venvera and Acuna explicitly sell reporting-clock/evidence workflows.
- The surviving portfolio hypothesis is not an SBOM generator or filing wrapper. It is incident-evidence integrity across awareness time, trigger classification, affected product/version reach, mitigation, affected-user notice, and the final-report trigger.
- Treat this as a re-underwriting of `idea-401` CRA ReachLedger / CRA Clock / CRA Incident Compiler, not a new candidate.

## Watch fields

| Field | Baseline |
|---|---|
| registration | EU Login + 2FA; one Primary AR, up to 20 Secondary ARs; CSIRT validation parallel to reporting |
| interface | AR interface guidance published |
| notification/update workflow | same record flows from draft/Early Warning to 72h, updates, and Final |
| public API | no API at initial release; future consideration only |
| sandbox/test account | not established |
| field matrix/schema | official Glossary and FAQ field list with stage/status/format guidance; no machine-readable API schema |
| manufacturer feedback | selected manufacturers and other users participated in pre-launch testing; feedback strengthened functionality, security, and usability |
| outage/failure reports | no outage captured; official fallback documented; production 72h-counter defect disclosed |
| vendor integrations | not yet audited |
| launch language/training | supporting materials progressively translated; additional platform languages deferred; launch materials planned |
| testing/feedback | CSIRTs participated in user and security tests; no failure metrics published |
| launch status | operational from 11 September 2026; public portal available |

## Re-score triggers

- API or integration documentation appears;
- machine-readable schema/field changes appear;
- registration is opened broadly;
- first manufacturer workflow evidence appears;
- launch outage or missed-deadline failure is documented;
- a cybersecurity vendor announces a working integration;
- ENISA materially changes timing or reporting flow.
- ENISA publishes the SRP URL, coordinator list, or a revised field matrix.
- ENISA clarifies or changes the voluntary-reporting phase/date.
- ENISA publishes launch materials, reports an outage, or changes AR limits/authentication or recovery workflow.
- ENISA publishes or revises the Glossary, launch scope, coordinator-selection rules, or field formats.
- Production defects, outages, counter corrections, or post-launch user feedback materially change the workflow.

## Post-launch re-score — 27 September 2026

- **Evidence-orchestration hypothesis: upgrade from pre-launch PROMISING to production-validated pain, but not validated demand.** ENISA itself documents a timing-display defect, no API at initial release, an awareness-time distinction, a recovery fallback, and draft visibility limits between ARs.
- The strongest wedge is now a vendor-neutral evidence and deadline-control layer that preserves legal awareness timestamps, reconciles the SRP's displayed counters against CRA deadlines, manages AEV/SI branching and PEC decisions, and keeps an auditable handoff across ARs and direct-CSIRT fallback.
- Do not build an SRP clone, API wrapper, or generic form filler. The official platform absorbs submission; the exposed private surface is pre-submission evidence integrity, cross-entity coordination, counter correction, and post-submission receipt/recovery assurance.
- Commercial validation remains open: no paid customer, failure-rate, or vendor-integration evidence was found in official sources. Keep the idea in re-underwrite/validation rather than promote it to a proven business.

Sources:

- https://digital-strategy.ec.europa.eu/en/policies/cra-reporting
- https://digital-strategy.ec.europa.eu/en/library/commission-publishes-new-guidance-support-timely-cyber-resilience-act-implementation
- https://www.enisa.europa.eu/topics/product-security-and-certification/single-reporting-platform-srp
- https://www.enisa.europa.eu/topics/product-security/single-reporting-platform-srp/frequently-asked-questions
- https://www.enisa.europa.eu/topics/product-security/single-reporting-platform-srp
- https://portal.cra-srp.enisa.europa.eu/
- https://vexwatch.com/
- https://crareport.eu/
- https://cvdportal.com/tools/notification-template-builder
- https://www.venvera.com/frameworks/cra
- https://acunagrc.com/en/solutions/cyber-resilience-act
