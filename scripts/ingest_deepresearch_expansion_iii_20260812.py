"""Ingest VenturaAtlas Deep Research Expansion III (12 August 2026).

The round contains 24 ranked proposals. This writer records a semantic decision
for every proposal, adds only distinct private candidates, and preserves scores
as analyst hypotheses rather than canonical ranking authority.
"""

from __future__ import annotations

import os
import uuid

from va_runtime.atomic_io import atomic_write_json, read_json_safe


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE_PATH = os.path.join(ROOT, "data", "idea-staging-queue.json")
SOURCES_PATH = os.path.join(ROOT, "data", "sources.json")
RUNS_PATH = os.path.join(ROOT, "data", "research-runs.json")
RUN_ID = "run-res-005-20260812-expansion-iii"
NOW = "2026-08-12T16:00:00+00:00"
NAMESPACE = uuid.UUID("13b639fc-5325-4baf-a7d7-b668dc8449bc")


SOURCES = [
    ("s120", "Protecting and empowering energy consumers", "European Commission - DG Energy", "https://energy.ec.europa.eu/topics/markets-and-consumers/energy-consumers-and-prosumers/protecting-and-empowering-energy-consumers_en", ["Energy-sharing and multiple-supplier rules apply by 17 July 2026", "National implementation still determines settlement details"]),
    ("s121", "DAC8", "European Commission - DG TAXUD", "https://taxation-customs.ec.europa.eu/taxation/tax-transparency-cooperation/administrative-co-operation-and-mutual-assistance/directive-administrative-cooperation-dac/dac8_en", ["DAC8 applies from 1 January 2026", "The first reporting year is 2026 and exchanges are due by 30 September 2027"]),
    ("s122", "Digital euro scheme rulebook", "European Central Bank", "https://www.ecb.europa.eu/euro/digital_euro/timeline/rulebook/html/index.en.html", ["Draft rulebook v0.91 and testing, UX, process, API, security, dispute, and settlement annexes were published on 2 July 2026", "Issuance remains contingent on EU legislation"]),
    ("s123", "European Health Data Space Regulation", "European Commission - DG SANTE", "https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space-regulation-ehds_en", ["Key implementing acts are due by March 2027", "Major primary- and secondary-use provisions apply gradually from 2029"]),
    ("s124", "EHDS Platform", "European Commission - DG SANTE", "https://health.ec.europa.eu/ehealth-digital-health-and-care/ehds-action/ehds-platform_en", ["European testing environments will automatically test harmonised EHR components", "Manufacturers must use official environments before market placement and retain results in technical documentation"]),
    ("s125", "The Net-Zero Industry Act", "European Commission - DG GROW", "https://single-market-economy.ec.europa.eu/industry/sustainability/net-zero-industry-act_en", ["Specified renewable auctions apply resilience, sustainability, cybersecurity, responsible-business, and delivery criteria", "Non-price criteria cover at least 30 percent of annual auction volume or 6 GW per country"]),
    ("s126", "New rules for urban wastewater management", "European Commission - DG Environment", "https://environment.ec.europa.eu/news/new-rules-urban-wastewater-management-set-enter-force-2024-12-20_en", ["Pharmaceutical and cosmetics producers must cover at least 80 percent of micropollutant removal costs", "The rule creates multi-party formulation, volume, evidence, and fee-allocation workflows"]),
    ("s127", "Interoperability assessments are now mandatory", "European Commission - Interoperable Europe Portal", "https://interoperable-europe.ec.europa.eu/interoperable-europe/news/interoperability-assessments-are-now-mandatory", ["Assessments became mandatory on 12 January 2025 for relevant new or revised cross-border digital public-service requirements", "Assessments cover legal, organisational, semantic, and technical interoperability"]),
    ("s128", "Revised Industrial Emissions Directive comes into effect", "European Commission - DG Environment", "https://environment.ec.europa.eu/news/revised-industrial-emissions-directive-comes-effect-2024-08-02_en", ["The revised directive tightens emissions and permit conditions and mandates electronic permitting", "Operating permits constrain around 75,000 large installations and farms"]),
    ("s129", "Import Control System 2", "European Commission - DG TAXUD", "https://taxation-customs.ec.europa.eu/customs-4/customs-security/ics2_en", ["ICS2 safety and security requirements became fully mandatory across all modes on 1 September 2025", "Accurate and complete ENS data is required and may be supplied through linked partial filings"]),
    ("s130", "New EU rules on substances of human origin", "European Commission - DG SANTE", "https://health.ec.europa.eu/blood-tissues-cells-and-organs/soho-regulation/new-eu-rules-substances-human-origin_en", ["The SoHO Regulation applies from 7 August 2027 with later application for specified provisions", "The framework strengthens crisis preparedness, resilience, traceability, and digital coordination"]),
    ("s131", "Water Resilience Strategy Actions Tracker", "European Commission - DG Environment", "https://environment.ec.europa.eu/topics/water/water-resilience-strategy-actions-tracker_en", ["The strategy advances water reuse, digitalisation, smart metering, and AI-supported water management", "A policy signal does not validate site-level water-risk predictions or buyer willingness to pay"]),
    ("s132", "SAFE - Security Action for Europe", "European Commission - DG DEFIS", "https://defence-industry-space.ec.europa.eu/eu-defence-industry/safe-security-action-europe_en", ["SAFE provides up to EUR150 billion in long-maturity loans for defence investments", "Common-procurement and category-specific contractor conditions create eligibility evidence requirements"]),
    ("s133", "EU Customs Reform", "European Commission - DG TAXUD", "https://taxation-customs.ec.europa.eu/customs/eu-customs-reform_en", ["The Customs Data Hub is intended to create one environment for product and supply-chain information", "The Hub timeline remains phased and the architecture has evolved through legislation and implementation"]),
    ("s134", "Rating scheme for data centres in the EU", "European Commission - DG Energy", "https://energy.ec.europa.eu/news/rating-scheme-data-centres-eu-commission-launches-call-feedback-2026-03-27_en", ["The EU database already collects data-centre performance indicators", "The rating scheme covers energy, water, renewables, heat reuse, and grid efficiency"]),
    ("s135", "REPowerEU - phase out of Russian energy imports", "European Commission - DG Energy", "https://energy.ec.europa.eu/strategy/repowereu-phase-out-russian-energy-imports_en", ["Regulation EU/2026/261 turned the Russian-gas phase-out into EU law", "Russian LNG is scheduled to be phased out by end-2026 and pipeline gas by 30 November 2027"]),
    ("s136", "Gigabit Infrastructure Act", "European Commission - DG CONNECT", "https://digital-strategy.ec.europa.eu/en/policies/gigabit-infrastructure-act", ["The GIA fully applies from 12 May 2026", "It promotes reuse of ducts and poles and coordination of civil works"]),
    ("s137", "Power-Flexible AI Data Centers: A New Paradigm for Grid-Responsive Compute", "arXiv - Williams et al.", "https://arxiv.org/abs/2606.25098", ["A real GPU-cluster deployment demonstrated rapid reduction, sustained curtailment, and workload shifting", "Technical feasibility does not establish a liquid flexibility market or broker demand"]),
]


CANDIDATES = [
    {
        "slug": "molecule-passport-gas-provenance-graph", "name": "Molecule Passport - Gas Provenance Graph", "score": 97,
        "category": "Energy Commodity Provenance", "sources": ["s89", "s135"], "adjacent": ["idea-399", "idea-400"], "priority": "experiment_1",
        "concept": "Commingled chain-of-custody and allocation graph binding gas and LNG volumes to origin, methane MRV, verification, contracts, cargoes, terminals, and import eligibility.",
        "customer": "LNG importers, gas traders, utilities, terminals, commodity financiers, insurers, and industrial buyers",
        "problem": "Physical commingling and multi-counterparty contract chains make origin and methane evidence incomplete or inconsistent before high-value cargoes reach the EU.",
        "build": "Model field-to-cargo-to-importer transfers with mass-balance or trace-and-claim allocation, contract evidence, verification expiry, unknown-volume reconciliation, and pre-arrival risk reports.",
        "gate": "Model one synthetic US-LNG-to-EU cargo with commingling, unknown origin, expired verification, and a missing contract clause; replay it with four domain practitioners.",
    },
    {
        "slug": "ehds-ehr-preflight-ci", "name": "EHDS EHR Preflight CI", "score": 93,
        "category": "Health Software Conformance", "sources": ["s123", "s124"], "adjacent": ["idea-379"], "priority": "full_validation",
        "concept": "Repository-native continuous interoperability and security regression testing for EHR components before official EHDS testing.",
        "customer": "EHR vendors, hospital software suppliers, interoperability platforms, and medical-software engineering teams",
        "problem": "Official market-entry tests occur too late to catch schema, coding, import/export, round-trip, security, and audit regressions on every software change.",
        "build": "Compile evolving EHDS specifications into synthetic-patient fixtures, import/export and round-trip tests, terminology edge cases, access controls, audit assertions, and technical evidence.",
        "gate": "Test two real EHR export/import implementations against 100 synthetic edge cases and compare findings with official environment requirements and vendor remediation time.",
    },
    {
        "slug": "digital-euro-conformance-ci", "name": "Digital Euro Conformance CI", "score": 92,
        "category": "Payment Protocol Conformance", "sources": ["s122"], "adjacent": ["idea-304"], "priority": "draft_watch",
        "concept": "Automated payment-flow regression suite and rulebook-diff compiler for the evolving digital-euro scheme.",
        "customer": "Banks, payment service providers, wallet vendors, acquirers, acceptance-device vendors, and payment processors",
        "problem": "Online, offline, recovery, dispute, UX, API, security, and settlement flows form a large moving conformance surface before formal testing.",
        "build": "Turn draft rulebook requirements into versioned end-to-end scenarios, traceable assertions, implementation-impact diffs, and evidence exports without claiming issuance is certain.",
        "gate": "Implement 100 v0.91 scenarios against one reference wallet flow and measure test determinism, specification ambiguity, and PSP interest while legislation remains unresolved.",
    },
    {
        "slug": "govinterop-ci", "name": "GovInterop CI", "score": 92,
        "category": "Public-Sector Interoperability", "sources": ["s127"], "adjacent": ["idea-169", "idea-334"], "priority": "full_validation",
        "concept": "Change-impact CI that generates evidence-backed interoperability assessments from actual public-service schemas, APIs, dependencies, and binding requirements.",
        "customer": "Government systems integrators and govtech vendors delivering cross-border EU public services",
        "problem": "Legal, organisational, semantic, and technical interoperability assessments are prepared manually and drift away from the system changes that triggered them.",
        "build": "Connect repositories, API schemas, identity modules, service dependencies, procurement requirements, and reusable EU solutions to produce reviewable impact diffs and report drafts.",
        "gate": "Replay ten historical public-system changes with two integrators and compare generated impact findings, false positives, and assessment preparation time against their prior process.",
    },
    {
        "slug": "industrial-permit-diff-engine", "name": "Industrial Permit Diff Engine", "score": 91,
        "category": "Industrial Environmental Permitting", "sources": ["s128"], "adjacent": [], "priority": "full_validation",
        "concept": "Plant change graph that maps proposed process, equipment, substance, throughput, water, waste, and emission changes to affected permit conditions and review actions.",
        "customer": "Large industrial operators, environmental engineering firms, plant owners, permit consultants, and infrastructure investors",
        "problem": "Factories change continuously, but permit-impact analysis is reconstructed manually from equipment files, process descriptions, emissions data, BAT conclusions, and local permits.",
        "build": "Create a canonical installation and permit graph, diff proposed modifications, flag affected conditions and evidence, and compare operating telemetry to authorised envelopes.",
        "gate": "Replay 20 historical plant modifications in one industrial vertical with environmental engineers and measure recall, review effort, false assurance, and avoided delay.",
    },
    {
        "slug": "soho-supply-continuity-router", "name": "SoHO Supply Continuity Router", "score": 90,
        "category": "Biological Supply Continuity", "sources": ["s130", "s65"], "adjacent": ["idea-385", "idea-391"], "priority": "high_difficulty",
        "concept": "Safety-constrained availability and allocation router for scarce, perishable substances of human origin across participating establishments.",
        "customer": "Authorised SoHO establishments, hospitals, blood and tissue services, transplant networks, and specialised logistics coordinators",
        "problem": "Availability decisions combine clinical compatibility, authorisation, preservation windows, temperature, transport, traceability, urgency, and local reserve thresholds.",
        "build": "Begin with one non-emergency substance and region; represent inventory, compatibility, authorisations, transport windows, reserves, allocation decisions, and audit receipts under mandatory clinical review.",
        "gate": "Simulate 50 historical allocation scenarios with authorised practitioners; require perfect safety-gate enforcement and measurable coordination improvement before any live routing.",
    },
    {
        "slug": "industrial-water-dependency-graph", "name": "Industrial Water Dependency Graph", "score": 90,
        "category": "Industrial Water Risk", "sources": ["s131"], "adjacent": ["idea-280"], "priority": "full_validation",
        "concept": "Site-level underwriting graph linking industrial processes to water sources, permits, catchments, treatment, competing users, drought scenarios, and mitigation projects.",
        "customer": "Water-intensive manufacturers, infrastructure investors, banks, insurers, and industrial site selectors",
        "problem": "Large capital projects are approved without a calibrated view of how water restrictions, source failure, permit limits, or competing demand affect production continuity.",
        "build": "Start with one catchment and vertical; combine permitted abstraction, source reliability, process demand, restriction rules, climate scenarios, reuse options, and observed interruptions.",
        "gate": "Backtest 25 operating sites in one catchment and obtain lender or insurer review of prediction calibration, missing data, and decision usefulness.",
    },
    {
        "slug": "safe-procurement-eligibility-graph", "name": "SAFE Procurement Eligibility Graph", "score": 89,
        "category": "Defence Procurement Eligibility", "sources": ["s132"], "adjacent": ["idea-374"], "priority": "specialist_validation",
        "concept": "Supplier, ownership, component, country, design-authority, procurement-structure, and programme-rule graph for SAFE eligibility review.",
        "customer": "Member-State procurement teams, prime contractors, defence suppliers, counsel, and specialist programme advisers",
        "problem": "Eligibility depends on multi-tier supplier origin, ownership, common-procurement structure, component restrictions, and ability to modify equipment without prohibited external control.",
        "build": "Encode programme versions and category-specific rules, resolve supplier ownership and component provenance, retain evidence, flag unknowns, and generate counsel-review packets.",
        "gate": "Reconstruct five published or synthetic procurement structures with specialist counsel and measure rule coverage, ownership-resolution gaps, and review-time reduction.",
    },
    {
        "slug": "customs-product-identity-compiler", "name": "Customs Product Identity Compiler", "score": 89,
        "category": "Customs Data Infrastructure", "sources": ["s129", "s133"], "adjacent": ["idea-261", "idea-361"], "priority": "early_architecture",
        "concept": "Persistent customs-ready product identity compiling classification, origin, manufacturer, materials, valuation, licences, restrictions, evidence, and revision history once per SKU.",
        "customer": "Importers, marketplaces, manufacturers, customs brokers, logistics platforms, and trade-compliance teams",
        "problem": "The same product is repeatedly and inconsistently reconstructed for ENS, declarations, sanctions, CBAM, product safety, VAT, returns, and future Customs Data Hub workflows.",
        "build": "Ingest product, supplier, BOM, tariff, licence, and declaration records; version classifications and origin evidence; expose approved identity attributes through broker and customs adapters.",
        "gate": "Compile 500 real SKUs for one importer, compare against historical declarations, and measure disagreement, broker rework, evidence gaps, and reuse across three workflows.",
    },
    {
        "slug": "grid-responsive-compute-broker", "name": "Grid-Responsive Compute Broker", "score": 87,
        "category": "Compute Flexibility Markets", "sources": ["s137", "s105"], "adjacent": ["idea-396"], "priority": "competition_watch",
        "concept": "Market and settlement layer aggregating deferrable or migratable GPU workloads across independent clouds into verified grid-flexibility capacity.",
        "customer": "Independent GPU clouds, data-centre operators, aggregators, utilities, and grid-service buyers",
        "problem": "Individual compute sites can modulate demand but lack a cross-provider mechanism to declare flexibility, preserve workload constraints, verify delivery, and settle compensation.",
        "build": "Model workload priority, deadline, migration, power telemetry, grid signal, curtailment delivery, baseline, rebound, and payment; avoid duplicating incumbent local schedulers.",
        "gate": "Simulate a multi-cloud 10 MW event with three operators and one flexibility buyer; validate baseline integrity, workload SLA preservation, and a viable settlement spread.",
    },
]


DEDUPLICATION = {
    "Molecule Passport / Gas Provenance Graph": {"decision": "stage_distinct_commingled_provenance_layer", "targets": ["idea-399", "idea-400"]},
    "Energy Sharing Settlement Router": {"decision": "enrich_existing_exact_family", "targets": ["idea-392"]},
    "NZIA Resilience BOM Compiler": {"decision": "exact_duplicate", "targets": ["idea-373"]},
    "DAC8 Data Repair Engine": {"decision": "exact_duplicate_private_candidate", "targets": ["candidate-913fb71e-5066-49a7-aab7-4a51c92dc54c"]},
    "EHDS Study Permit Compiler": {"decision": "exact_duplicate", "targets": ["idea-379"]},
    "Micropollutant EPR Ledger": {"decision": "existing_family", "targets": ["idea-293", "idea-378", "idea-384"]},
    "EHDS EHR Preflight CI": {"decision": "stage_distinct_candidate", "targets": ["idea-379"]},
    "Digital Euro Conformance CI": {"decision": "stage_draft_sensitive_candidate", "targets": ["idea-304"]},
    "GovInterop CI": {"decision": "stage_distinct_candidate", "targets": ["idea-169", "idea-334"]},
    "Industrial Permit Diff Engine": {"decision": "stage_distinct_candidate", "targets": []},
    "ICS2 Cargo Data Repair Gateway": {"decision": "exact_duplicate_private_candidate", "targets": ["candidate-3985f6d1-450a-4a96-bd1f-872648c43b03"]},
    "Duct & Civil Works Router": {"decision": "exact_duplicate", "targets": ["idea-287"]},
    "SoHO Supply Continuity Router": {"decision": "stage_distinct_safety_constrained_candidate", "targets": ["idea-385", "idea-391"]},
    "Industrial Water Dependency Graph": {"decision": "stage_distinct_underwriting_candidate", "targets": ["idea-280"]},
    "SAFE Procurement Eligibility Graph": {"decision": "stage_distinct_specialist_candidate", "targets": ["idea-374"]},
    "Customs Product Identity Compiler": {"decision": "stage_distinct_identity_layer", "targets": ["idea-261", "idea-361"]},
    "Robot Safety-Case CI": {"decision": "duplicate_existing_family", "targets": ["idea-299", "idea-367"]},
    "Refrigerant Lifecycle Ledger": {"decision": "duplicate_existing_family", "targets": ["idea-400", "candidate-e67ca315-3ce7-4b92-8401-660d0eedbf71"]},
    "Data-Centre Rating Digital Twin": {"decision": "exact_duplicate", "targets": ["idea-389"]},
    "Grid-Responsive Compute Broker": {"decision": "stage_narrow_broker_layer", "targets": ["idea-396"]},
    "Biotech SandboxOps": {"decision": "watch_only_policy_dependent_not_staged", "targets": []},
    "Agent-Commerce Mandate Reconciler": {"decision": "merge_into_machine_authority_family", "targets": ["idea-213", "idea-341", "candidate-16a1a702-eda3-56d1-81b0-f2cfc321a71d"]},
    "Shortage-Aware SoHO Logistics API": {"decision": "feature_of_soho_supply_continuity_router", "targets": []},
    "Water-Smart Factory Optimizer": {"decision": "feature_of_industrial_water_graph", "targets": []},
}


def candidate_id(slug: str) -> str:
    return f"candidate-{uuid.uuid5(NAMESPACE, slug)}"


VALIDATION_PRIORITY = [
    (1, "Molecule Passport / Gas Provenance Graph", 97, [candidate_id("molecule-passport-gas-provenance-graph"), "idea-399"], CANDIDATES[0]["gate"]),
    (2, "Energy Sharing Settlement Router", 96, ["idea-392"], "Use one Member State, one 20-unit building, two suppliers, 15-minute meter values, and four allocation rules; verify settlement instructions with a utility or community provider."),
    (3, "NZIA Resilience BOM Compiler", 95, ["idea-373"], "Load one solar project BOM and one auction's resilience criteria; quantify supplier substitutions, cost, evidence gaps, and projected score impact with procurement practitioners."),
    (4, "DAC8 Data Repair Engine", 94, ["candidate-913fb71e-5066-49a7-aab7-4a51c92dc54c"], "Inject missing TINs, duplicate identities, residency conflicts, asset ambiguity, and ledger mismatches into a 100,000-user fixture; measure repair completeness and reviewer effort."),
    (5, "EHDS Study Permit Compiler", 94, ["idea-379"], "Compile one Czech-German-Portuguese diabetes study into variables, dataset feasibility, minimum-necessary fields, and permit requirements without processing patient data."),
    (6, "Micropollutant EPR Ledger", 93, ["idea-293", "idea-378", "idea-384"], "Map one cosmetics portfolio from SKU and formulation to substances, national volumes, evidence, fee scenarios, and reformulation economics with a producer and wastewater expert."),
    (7, "EHDS EHR Preflight CI", 93, [candidate_id("ehds-ehr-preflight-ci")], CANDIDATES[1]["gate"]),
    (8, "Digital Euro Conformance CI", 92, [candidate_id("digital-euro-conformance-ci")], CANDIDATES[2]["gate"]),
    (9, "GovInterop CI", 92, [candidate_id("govinterop-ci")], CANDIDATES[3]["gate"]),
    (10, "Industrial Permit Diff Engine", 91, [candidate_id("industrial-permit-diff-engine")], CANDIDATES[4]["gate"]),
    (11, "ICS2 Cargo Data Repair Gateway", 91, ["candidate-3985f6d1-450a-4a96-bd1f-872648c43b03"], "Replay 10,000 historical ENS records, learn shipper-specific errors, and compare preflight findings against actual rejects, delays, and broker corrections."),
]


def make_candidate(spec: dict) -> dict:
    cid = candidate_id(spec["slug"])
    return {
        "schemaVersion": "2.0.0", "id": cid, "candidateId": cid, "candidateSlug": spec["slug"], "slug": f'{spec["slug"]}-{cid}',
        "name": spec["name"], "oneSentenceConcept": spec["concept"], "elevatorPitch": f'{spec["problem"]} {spec["build"]}',
        "detailedDescription": spec["concept"], "category": spec["category"], "subcategory": "regulated attribute or transaction infrastructure",
        "tags": ["august-2026", "expansion-iii", "attribute-infrastructure", "customer-evidence-unproven"], "status": "staged",
        "evidenceStatus": "forcing_function_verified_customer_demand_unproven", "promotionEligible": False, "requiresExternalEvidence": True,
        "sourceReferences": spec["sources"],
        "provenance": {"sourceType": "VenturaAtlas Deep Research Expansion III - user supplied", "researchRunId": RUN_ID, "originalWordingAvailable": "private-attachment", "notes": "Scores, market claims, pricing, demand, and willingness to pay remain hypotheses."},
        "atAGlance": {"targetCustomer": spec["customer"], "problemSolved": spec["problem"], "whatToBuild": spec["build"], "howItMakesMoney": None, "whyCustomersPay": None, "estimatedEarningPotential": None, "startupCost": None, "overallScore": None, "confidenceScore": None, "mainAdvantage": "The computed attribute or decision sits close to transaction eligibility, operational authority, or money movement.", "mainRisk": "Data access, rule interpretation, decision accuracy, incumbent response, and paid demand remain unvalidated.", "bestNextValidationStep": spec["gate"]},
        "researchAssessment": {"analystProvisionalOpportunityScore": spec["score"], "scoreScale": "0-100", "scoreStatus": "provisional_not_ranking_eligible", "priorityClass": spec["priority"], "adjacentCanonicalOrCandidateRefs": spec["adjacent"], "scoringDimensionsToMeasure": ["economicCoupling", "involuntaryFrequency", "evidenceGravity"]},
        "validationChecklist": {"gateStatus": "needs_customer_validation", "passed": False, "passedCount": 2, "failedCount": 0, "unknownCount": 5, "totalCriteria": 7, "scorePercentage": 28.57, "details": {"Forcing function verified": "pass", "Semantic duplicate review completed": "pass", "Buyer workflow confirmed": "unknown", "Representative operational data obtained": "unknown", "Paid willingness to pay": "unknown", "Decision quality measured": "unknown", "Safety and false-assurance boundary tested": "unknown"}},
        "killCriteria": {"killFlagged": False, "killCount": 0, "killConditions": {"No repeated workflow failure in 15 interviews": False, "No access to representative data": False, "Existing system resolves the workflow": False, "Decision quality below required threshold": False, "No paid design partner after 30 qualified outreaches": False}, "killFlags": []},
        "createdAt": NOW, "updatedAt": NOW, "prioritizedForValidation": spec["priority"] == "experiment_1", "reviewPriority": "urgent" if spec["priority"] == "experiment_1" else "medium", "priority": spec["score"],
    }


def main() -> None:
    sources = read_json_safe(SOURCES_PATH, default_if_missing=[])
    urls, ids, added_sources = {x.get("url") for x in sources}, {x.get("id") for x in sources}, 0
    for sid, title, publisher, url, supports in SOURCES:
        if url in urls:
            continue
        if sid in ids:
            raise RuntimeError(f"Source ID collision: {sid}")
        sources.append({"id": sid, "title": title, "publisher": publisher, "url": url, "supports": supports, "type": "official_or_primary_evidence", "date": "2026", "accessDate": "2026-08-12", "confidenceLabel": "high", "sourceType": "primary", "researchRound": "deep-research-expansion-iii-2026-08-12", "ideaIds": [], "visibility": "PUBLIC", "sourceClass": "PRIMARY_OR_OFFICIAL", "evidenceEligible": True, "provenanceEligible": True})
        urls.add(url); ids.add(sid); added_sources += 1

    queue = read_json_safe(QUEUE_PATH, default_if_missing=[])
    by_slug = {x.get("candidateSlug") or x.get("slug"): i for i, x in enumerate(queue)}
    added_candidates = 0
    for spec in CANDIDATES:
        candidate = make_candidate(spec)
        if spec["slug"] in by_slug:
            i = by_slug[spec["slug"]]
            if queue[i].get("provenance", {}).get("researchRunId") == RUN_ID:
                queue[i] = candidate
            continue
        queue.append(candidate); by_slug[spec["slug"]] = len(queue) - 1; added_candidates += 1

    validation = [{"rank": rank, "proposal": name, "analystProvisionalScore": score, "targetRefs": refs, "nextGate": gate} for rank, name, score, refs, gate in VALIDATION_PRIORITY]
    run = {
        "runId": RUN_ID, "baselineCommit": "8078c75095595d1a4a93045d44d015b8a504e9a6",
        "questions": ["Which of 24 proposals are distinct from 294 canonical and 231 private staged records?", "Which implementation windows are verified and which are drafts or future architecture?", "Which existing or new targets deserve the requested 11-item validation queue without changing canonical ranking authority?"],
        "queries": ["EU energy sharing multiple suppliers July 2026", "DAC8 2026 collection 2027 reporting", "digital euro v0.91 draft rulebook", "methane import MRV 2027 and Russian gas phase-out", "NZIA non-price auction criteria", "EHDS testing environments and secondary-use timeline", "urban wastewater producer responsibility 80 percent", "interoperability assessments January 2025", "ICS2 mandatory all modes", "SoHO August 2027", "SAFE procurement eligibility", "Customs Data Hub timeline"],
        "sourceCandidates": [x[0] for x in SOURCES] + ["s65", "s82", "s88", "s89", "s105"], "inclusions": [candidate_id(x["slug"]) for x in CANDIDATES],
        "exclusions": [name for name, decision in DEDUPLICATION.items() if not decision["decision"].startswith("stage")],
        "claimsChanged": ["Ten distinct candidates staged; fourteen proposals mapped to existing families, merged as features, or retained watch-only.", "ICS2 full mandatory cross-modal timing is recorded as 1 September 2025; the June 2026 source is a status announcement.", "Digital euro v0.91 remains draft and issuance remains contingent on legislation.", "All analyst scores and portfolio-tier assertions remain provisional and non-ranking-eligible."],
        "deduplicationDecisions": DEDUPLICATION, "validationPriorityQueue": validation,
        "immediateExperiments": [
            {"rank": 1, "proposal": "Molecule Passport", "targetRefs": [candidate_id("molecule-passport-gas-provenance-graph")]},
            {"rank": 2, "proposal": "Energy Sharing Settlement Router", "targetRefs": ["idea-392"]},
            {"rank": 3, "proposal": "NZIA Resilience BOM Compiler", "targetRefs": ["idea-373"]},
            {"rank": 4, "proposal": "DAC8 Data Repair Engine", "targetRefs": ["candidate-913fb71e-5066-49a7-aab7-4a51c92dc54c"]},
            {"rank": 5, "proposal": "EHDS Study Permit Compiler", "targetRefs": ["idea-379"]},
        ],
        "researchBranches": ["commingled_asset_ledgers", "continuous_regulatory_conformance", "regulatory_data_debt_windows"],
        "portfolioFamilies": ["machine_authority", "regulated_attribute_infrastructure", "european_rail_adapters", "continuous_conformance", "scarcity_intelligence"],
        "newScoringDimensions": ["economicCoupling", "involuntaryFrequency", "evidenceGravity"],
        "researchPasses": ["new_obligation", "official_rail", "regulated_attribute", "data_debt", "preflight", "physical_bottleneck", "forbidden_old_workflow", "machine_consequence"],
        "agent": "research-intelligence-agent", "methodVersion": "epistemic-v6-attribute-data-debt-conformance", "startedAt": NOW, "endedAt": NOW, "reviewStatus": "approved_for_private_staging_and_validation_not_canonical_promotion",
    }
    runs = read_json_safe(RUNS_PATH, default_if_missing=[])
    index = next((i for i, x in enumerate(runs) if x.get("runId") == RUN_ID), None)
    if index is None: runs.append(run)
    else: runs[index] = run

    atomic_write_json(SOURCES_PATH, sources); atomic_write_json(QUEUE_PATH, queue); atomic_write_json(RUNS_PATH, runs)
    print(f"[OK] Added {added_sources} primary sources, {added_candidates} staged candidates, and recorded {RUN_ID}.")


if __name__ == "__main__":
    main()
