# CRA Article 14 — claim, portfolio, and opportunity audit

As-of: **2026-08-21**  
Decision: **real deadline; material scope correction; no new venture candidate**

This is an operational research screen, not legal advice. A qualified EU product-cybersecurity lawyer should confirm any product-specific conclusion before commercial distribution.

## Bottom line

The 11 September 2026 reporting date is real and urgent for manufacturers of in-scope products with digital elements. The supplied thesis nevertheless contains two decisive errors:

1. standalone SaaS is not automatically a product with digital elements; and
2. the proposed cheap scope/runbook/template tier is already directly occupied.

The repository also already contains the same opportunity family as `idea-401` CRA ReachLedger, CRA Clock, CRA Incident Compiler, and CRA Incident Evidence Replay. The useful residue is a **timed incident-evidence rehearsal** inside that family, not another idea.

## Claim audit

| Supplied claim | Status | Correction or qualification |
|---|---|---|
| Article 14 applies from 11 September 2026 | Verified | Article 71(2) brings Article 14 into application before the general 11 December 2027 date. |
| The deadline is 21 days away on 21 August 2026 | Verified | Calendar difference is 21 days. |
| The duty covers actively exploited vulnerabilities and severe incidents | Verified | These are separate reporting triggers and need separate decision paths. |
| The first report is due within 24 hours of awareness | Verified | The clock starts on awareness of the relevant actively exploited vulnerability or severe incident, not on CVE publication or patch availability. |
| A full notification is due within 72 hours | Verified but incomplete | The 72-hour notification is not the end. An actively exploited vulnerability also requires a final report no later than 14 days after a corrective or mitigating measure is available; a severe incident requires a final report within one month after the 72-hour notification. |
| Reporting is through ENISA's Single Reporting Platform | Verified | One submission is routed to the designated coordinating CSIRT and ENISA. ENISA says the platform will be operational by 11 September; testing and guidance publication were still ongoing on the audit date. |
| Ordinary commercial software is in scope | Overbroad | Connected downloadable software can be an in-scope product with digital elements, but scope depends on the product boundary, data connection, market placement, exclusions, and economic-operator role. |
| SaaS is explicitly in scope | Materially false as stated | Standalone SaaS and general cloud services are not themselves products with digital elements. A cloud service can enter the product boundary only as a remote data processing solution designed under the manufacturer's responsibility whose absence prevents a product from performing a function. |
| Open source is exempt only when non-commercial | Directionally right but incomplete | Non-monetised free and open-source software is generally outside manufacturer obligations. Mere repository hosting, regular releases, contributions, or financing do not alone make it commercial. Monetisation and for-profit support can change the analysis, while open-source software stewards have a separate, lighter regime. |
| The July guidance was published because most organisations are unready | Unsupported causal claim | The Commission published final guidance and FAQs on 27 July 2026, but the inspected official material does not establish that asserted motive or a readiness percentage. |
| Article 14 is a 2026 SBOM deadline | False | The 2026 trigger is incident and exploited-vulnerability reporting. SBOM and broader Annex I/conformity obligations principally attach to the full regime from December 2027, although an existing component inventory can help incident triage. |
| No narrow cheap reporting-readiness competitor exists | False | Direct substitutes now include a EUR 49 small-team document pack with a reporting runbook and scope memo, a browser-local incident workflow, a free Article 14 template builder, and GRC products explicitly tracking the 24/72/final clocks. |
| The gap is mainly knowing the national CSIRT | Too shallow | Routing depends on the Article 14(7) electronic endpoint rules, including main establishment and non-EU representative/importer logic. The harder work is proving awareness time, trigger classification, affected product/version and market reach, mitigation, user notice, and final-report timing. |

## Preliminary portfolio exposure screen

| Artifact | Repository evidence | Preliminary screen on 2026-08-21 | Reassessment trigger |
|---|---|---|---|
| Venture Atlas GitHub Pages site | Public static website; repository describes it as open source; no sale, subscription, advertising, donation, or data-monetisation path found in the inspected public surface | **Likely outside CRA manufacturer scope** as a standalone website and non-monetised open-source project | Paid access, commercial support, user-data monetisation, an installable client/extension, or use as remote processing required by an in-scope product |
| Venture Atlas source repository | MIT-licensed public source; root npm package is marked `private`; no package-publication path found | **Likely outside manufacturer obligations** while genuinely non-commercial FOSS; not a final legal determination | Commercial licensing/distribution, for-profit support beyond cost recovery, or bundling under a commercial product |
| FactBounty | README calls it a local prototype; payment defaults to a local simulator; the Stripe adapter creates test identifiers and does not implement live payment settlement | **No evidence of current EU market placement**; the code demonstrates commercial intent but not a shipped product | Production deployment, a live paid service, distribution of a client/app/extension, or integration as required remote processing for another product |
| Cloud control plane and workers | Configuration and preflight material exist, but repository instructions expressly say configured does not mean deployed or healthy | **No evidence these are made available on the EU market** | Customer distribution, managed-product launch, or embedding in a sold product |

This screen cannot prove the absence of private deployments, contracts, paid support, private package distribution, or external products not represented in the repository. Those facts must be checked with the owner before relying on the result.

## Competition correction

The prompt compared mainly with broad AppSec vendors. That missed the direct cheap tier:

| Substitute | Observed offer | Consequence |
|---|---|---|
| Vexwatch CRA Blueprint | Scope/classification memo, CVD workflow, Article 14 runbook, RACI, internal register, SBOM starter guide; advertised founding price EUR 49 | Directly occupies the proposed small-team document pack |
| CRA Report | Browser-local deterministic workflow, trigger-path assistance, deadline calculation, missing-field checks, and staged SRP content | Directly occupies the proposed narrow reporting assistant |
| CVD Portal | Free Article 14 notification-template builder plus free disclosure portal and reporting resources | Removes much of the template wedge |
| Venvera | Per-product scope/classification and 24/72/final reporting clocks | Covers the process layer without generating SBOMs |
| Acuna | Incident workflow, required fields, clocks, owners, evidence trail, and fast manual SRP preparation | Direct evidence that the non-SBOM workflow is already sold |
| Commission + ENISA | Free scope guidance, FAQs, SRP instructions, and the official submission platform | Strong official do-it-yourself substitute |

The universal negative that “none” serves this workflow is therefore falsified. Price, adoption, workflow quality, and conversion remain unverified vendor claims; they do not need to be strong for the proposed empty-market thesis to fail.

## Repository disposition

- Do not create a new canonical or staged idea.
- Merge the useful work into `idea-401` / CRA Clock / CRA Incident Compiler.
- Keep the surviving wedge narrow: evidence-integrity and timed rehearsal across awareness, classification, product/version reach, mitigation, user notice, 24-hour warning, 72-hour notification, and final report.
- Kill a static scope quiz, CSIRT directory, generic template pack, SBOM generator, or thin SRP form wrapper as standalone products.
- Before any commercial EU release, execute the CRA pre-release gate in `SECURITY.md` and preserve the signed scope decision.

## Sources

Primary:

- Regulation (EU) 2024/2847: https://eur-lex.europa.eu/eli/reg/2024/2847/oj
- Commission CRA reporting page: https://digital-strategy.ec.europa.eu/en/policies/cra-reporting
- Commission guidance announcement, 27 July 2026: https://digital-strategy.ec.europa.eu/en/library/commission-publishes-new-guidance-support-timely-cyber-resilience-act-implementation
- Commission CRA open-source page: https://digital-strategy.ec.europa.eu/en/policies/cra-open-source
- ENISA Single Reporting Platform: https://www.enisa.europa.eu/topics/product-security-and-certification/single-reporting-platform-srp

Vendor offer evidence, treated as claims rather than proof of product quality or adoption:

- Vexwatch: https://vexwatch.com/
- CRA Report: https://crareport.eu/
- CVD Portal template builder: https://cvdportal.com/tools/notification-template-builder
- Venvera: https://www.venvera.com/frameworks/cra
- Acuna: https://acunagrc.com/en/solutions/cyber-resilience-act
