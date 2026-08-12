"""Ingest VenturaAtlas Deep Research Expansion IV (12 August 2026).

Records all twenty semantic decisions, adds only distinct private candidates,
and keeps analyst scores outside canonical ranking authority.
"""

from __future__ import annotations

import os
import uuid

from va_runtime.atomic_io import atomic_write_json, read_json_safe


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE_PATH = os.path.join(ROOT, "data", "idea-staging-queue.json")
SOURCES_PATH = os.path.join(ROOT, "data", "sources.json")
RUNS_PATH = os.path.join(ROOT, "data", "research-runs.json")
RUN_ID = "run-res-006-20260812-expansion-iv"
NOW = "2026-08-12T17:30:00+00:00"
BASELINE = "213de14aa00308337e9c18ed07109d0dec38722e"
NAMESPACE = uuid.UUID("6cd1dcc0-3dc1-4cc7-90f7-246a7e6ac1f0")


SOURCES = [
    ("s138", "Registration opens for the Raw Materials Mechanism", "European Commission - DG GROW", "https://single-market-economy.ec.europa.eu/news/registration-opens-raw-materials-mechanism-under-eu-energy-and-raw-materials-platform-2025-11-18_en", ["The mechanism links buyers, sellers, projects, storage providers, and finance partners", "Commercial negotiations take place outside the Commission platform"]),
    ("s139", "European Critical Raw Materials Act", "European Commission", "https://commission.europa.eu/topics/competitiveness/green-deal-industrial-plan/european-critical-raw-materials-act_en", ["The CRMA establishes capacity, diversification, monitoring, and resilience measures", "The policy signal does not validate customer demand for a private treasury or offtake product"]),
    ("s140", "Batteries", "European Commission - DG Environment", "https://environment.ec.europa.eu/topics/waste-and-recycling/batteries_en", ["The battery framework spans sourcing, use, repurposing, and recycling", "Mandatory information can support—but does not itself validate—financial underwriting"]),
    ("s141", "Regulation EU 2023/1542 concerning batteries and waste batteries", "EUR-Lex", "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ%3AL%3A2023%3A191%3AFULL", ["Covered batteries require a battery passport from 18 February 2027", "The regulation defines battery-specific passport and health or lifetime information"]),
    ("s142", "EU Inc - a new harmonised corporate legal regime", "European Commission", "https://commission.europa.eu/topics/business-and-industry/doing-business-eu/company-law-and-corporate-governance/eu-inc-new-harmonised-corporate-legal-regime_en", ["The 18 March 2026 proposal includes digital formation, lifecycle actions, share transfers, financing, and employee options", "EU Inc remains a proposal rather than adopted law"]),
    ("s143", "One Europe, One Market roadmap", "European Commission", "https://commission.europa.eu/topics/competitiveness/one-europe-one-market-roadmap_en", ["EU Inc and the Industrial Accelerator Act are pending proposals", "The roadmap targets agreement by end-2026 but does not guarantee adoption or final design"]),
    ("s144", "Council gives final go ahead to EU Talent Pool", "Council of the European Union", "https://www.consilium.europa.eu/en/press/press-releases/2026/03/30/council-gives-final-go-ahead-to-eu-talent-platform-for-non-eu-jobseekers/", ["The Talent Pool regulation received final Council approval on 30 March 2026", "Candidates still need national residence and work permits; the platform is expected operational in 2027"]),
    ("s145", "Regulation on deforestation-free products", "European Commission - DG Environment", "https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en", ["EUDR applies from 30 December 2026 to large and medium operators", "Most micro and small operators follow on 30 June 2027"]),
    ("s146", "EUDR Information System", "European Commission - Green Forum", "https://green-forum.ec.europa.eu/nature-and-biodiversity/deforestation-regulation-implementation/information-system-deforestation-regulation_en", ["The official system supports geolocation data, GeoJSON, and machine-to-machine submission", "Upstream identity and data-quality repair remains outside simple submission generation"]),
    ("s147", "Chips Act 2.0", "European Commission - DG CONNECT", "https://digital-strategy.ec.europa.eu/en/policies/chips-act-2", ["The 3 June 2026 proposal includes Demand Accelerators and a B2B Semiconductor Supply Chain Platform", "Chips Act 2.0 remains a proposal and its final mechanisms may change"]),
    ("s148", "AI Factories", "European Commission - DG CONNECT", "https://digital-strategy.ec.europa.eu/en/policies/ai-factories", ["The Commission reports 19 AI Factories and 13 antennas as operational", "Public access, eligibility, queues, and heterogeneous environments can create routing friction"]),
    ("s149", "EU Open Source Strategy", "European Commission - DG CONNECT", "https://digital-strategy.ec.europa.eu/en/factpages/eu-open-source-strategy", ["The strategy promotes control, lower lock-in, and European open-source alternatives", "The strategy is a policy signal rather than proof of demand for automated refactoring"]),
    ("s150", "Commission proposes measures to boost EU industry and jobs", "European Commission", "https://commission.europa.eu/news-and-media/news/commission-proposes-new-measures-boost-eu-industry-and-jobs-2026-03-04_en", ["The Industrial Accelerator Act is a proposal with Made-in-EU and low-carbon considerations", "Origin formulas and implementation details remain subject to the legislative process"]),
    ("s151", "New Legislative Framework", "European Commission - DG GROW", "https://single-market-economy.ec.europa.eu/single-market/goods/new-legislative-framework_en", ["EU product rules use conformity assessment, accreditation, and market-surveillance structures", "A planned future Product Act must not be represented as enacted law"]),
    ("s152", "European Quantum Strategy", "European Commission - DG CONNECT", "https://digital-strategy.ec.europa.eu/en/policies/quantum", ["The EU has an active quantum strategy and a forthcoming Quantum Act", "A forthcoming act is insufficient evidence for immediate product demand"]),
    ("s153", "EU Ports Strategy", "European Commission - DG MOVE", "https://transport.ec.europa.eu/news-events/news/commission-unveils-eu-ports-strategy-strengthen-competitiveness-security-and-sustainability-european-2026-03-04_en", ["The Commission adopted the EU Ports Strategy on 4 March 2026", "The strategy covers competitiveness, resilience, security, sustainability, investment, and digitalisation"]),
]


CANDIDATES = [
    ("critical-materials-offtake-bankability", "Critical Materials Offtake Bankability Engine", 97, "Strategic Materials Finance", ["s138", "s139"], [], "full_validation", "Transaction workflow converting a public raw-material match into a qualified, financeable, monitored offtake.", "Strategic-material buyers, projects, lenders, insurers, traders, and export-credit agencies", "The public mechanism can create a match, while technical qualification, commercial terms, credit support, risk allocation, financing, and performance monitoring remain private.", "Model one commodity from qualification through term sheet, bankability review, finance conditions, and delivery receipts.", "Complete one rare-earth or lithium workflow and test it with ten buyers, ten projects, five lenders, and five insurers or traders."),
    ("eu-inc-corporate-action-os", "EU Inc Corporate Action OS", 93, "Corporate Legal Infrastructure", ["s142", "s143"], [], "proposal_watch_prebuild", "Event-sourced corporate-action ledger and API for the proposed EU Inc legal primitive.", "European founders, investors, legal providers, equity administrators, payroll platforms, and fintechs", "If adopted, a harmonised corporate form could standardise formation, shares, resolutions, financing, employee options, and lifecycle actions, but final law and interfaces remain uncertain.", "Prebuild the canonical company-event model, funding and employee-option simulator, evidence chain, and adapter architecture without claiming official integration.", "Validate the event model with corporate counsel and existing cap-table operators; stop major integration work until the enacted text and interfaces stabilise."),
    ("talent-pool-hire-to-arrival-os", "Talent Pool Hire-to-Arrival OS", 95, "Workforce Mobility", ["s144"], ["idea-263"], "full_validation", "Post-match workflow engine moving an EU Talent Pool candidate from job offer through national permits, relocation, payroll, and legal start.", "EU employers, recruitment agencies, relocation firms, and shortage-sector staffing providers", "The adopted public platform matches employers and candidates but national immigration, qualification, documentation, appointments, relocation, and onboarding remain fragmented.", "Encode official national rules and forms for one corridor and occupation, maintain human legal review, and orchestrate every state transition through employee start.", "Process twenty manually assisted hires across two corridors and measure time, blocker frequency, accuracy, and employer willingness to pay."),
    ("critical-materials-treasury-shock-twin", "Critical Materials Treasury - Shock Twin", 94, "Strategic Supply Resilience", ["s139"], ["idea-380"], "full_validation", "Physical-input treasury graph linking strategic materials to suppliers, inventory, products, revenue, substitutions, and shock scenarios.", "Automotive, battery, defence, aerospace, electronics, wind, and robotics manufacturers", "Spend ledgers obscure mine, refining, country, supplier, inventory, product, and revenue dependencies that determine the impact of a physical supply shock.", "Build a multi-tier material dependency graph with scenario simulation, inventory runway, revenue exposure, alternates, hedging, and stockpile recommendations.", "Backtest three historical material shocks with one manufacturer and compare recommendations against actual shortages, substitutions, and losses."),
    ("strategic-project-permit-graph", "Strategic Project Permit Graph", 94, "Industrial Project Bankability", ["s125", "s139"], ["candidate-6ff41838-249d-5913-bb8f-1b0d2679a580", "candidate-e8cbd8ea-6371-5cde-bbeb-f40b3ffb96bd"], "full_validation", "Critical-path graph predicting whether a large industrial project can obtain interdependent permits and operate on schedule.", "Industrial project developers, infrastructure investors, lenders, engineering firms, and site selectors", "Land, EIA, water, grid, emissions, construction, transport, and consultation approvals are interdependent, and delays can destroy project economics.", "Ingest project plans and authority records into a dependency graph, simulate modifications, forecast critical path and delay exposure, and retain evidence for lender review.", "Reconstruct three completed or delayed industrial projects and test schedule calibration with permitting practitioners and one lender."),
    ("eudr-plot-identity-repair", "EUDR Plot Identity Repair Engine", 94, "Agricultural Traceability", ["s145", "s146"], ["candidate-efaad4a5-2647-45bd-bd0a-5c024ba9e58c", "idea-369"], "immediate_validation", "Persistent plot-identity and upstream data-repair engine for EUDR geolocation and commodity allocation records.", "Commodity importers, traders, processors, producer groups, and EUDR service providers", "GeoJSON and supplier datasets contain invalid geometry, duplicates, impossible yields, inconsistent identifiers, and mixed-lot allocation errors before official submission.", "Resolve persistent real-world plot identities, validate geometry and plausible production, reconcile suppliers and lots, and export corrected official-system-ready records.", "Obtain messy data for 10,000 plots, inject known errors, and measure recall, false positives, repair time, and hours saved."),
    ("chip-design-in-qualification", "Chip Design-In Qualification Engine", 92, "Semiconductor Qualification", ["s147"], [], "proposal_watch_validation", "Component substitution compiler and evidence graph taking a possible European chip alternative through engineering qualification.", "Automotive, industrial-control, robotics, energy-electronics, and appliance OEM engineering teams", "Supplier discovery does not establish electrical, firmware, thermal, safety, reliability, package, or production equivalence.", "Compare BOMs, schematics, firmware, requirements, and test evidence; generate redesign estimates and a qualification plan; ingest bench outcomes into an approved-alternative graph.", "Select five industrial chips, identify alternatives, and have engineers score compatibility findings and estimated qualification effort."),
    ("eurocompute-router", "EuroCompute Router", 92, "Public and Sovereign Compute", ["s148"], ["candidate-fb95c237-1685-5798-98dd-5bc9d9920481"], "full_validation", "Entitlement, allocation, and workload-portability control plane across European public AI compute and commercial overflow.", "European AI startups, SMEs, research teams, AI Factory access providers, and sovereign-cloud operators", "Eligibility, application, queue, hardware, scheduler, quota, storage, and data rules vary across public and private compute environments.", "Normalize workload requirements, eligibility and application data, compare cost and wait, translate submissions, and preserve checkpoints across compatible environments.", "Route twenty representative jobs across three real access programmes and one commercial provider; measure eligibility accuracy, queue prediction, portability effort, and buyer value."),
    ("sovereign-refactor-ci", "Sovereign Refactor CI", 92, "Digital Independence Engineering", ["s149"], ["idea-372", "idea-374"], "full_validation", "Automated dependency replacement and equivalence-testing CI for reducing proprietary or jurisdictional software lock-in.", "Regulated enterprises, public bodies, software vendors, and cloud-platform teams", "Dependency inventories reveal lock-in but do not replace proprietary services or prove that the replacement preserves behavior, security, and operations.", "Scan code, SBOMs, infrastructure and APIs; propose portable adapters or open alternatives; create bounded changes; run equivalence and rollback tests; quantify residual dependency.", "Replace one bounded proprietary queue, storage, or identity dependency in three codebases and compare engineer time, test failures, and portability gain."),
    ("made-in-eu-origin-compiler", "Made-in-EU Origin Compiler", 90, "Economic Origin Infrastructure", ["s143", "s150"], ["idea-373", "candidate-eb7452bb-060f-5de3-bc87-4dd957942d29"], "proposal_watch_prebuild", "Versioned BOM and value-add graph simulating Made-in-EU eligibility under the pending Industrial Accelerator Act.", "Strategic manufacturers, procurement teams, project developers, and economic-development advisers", "Material, manufacturing, labour, supplier, and value-added provenance is fragmented, while final eligibility formulas remain pending.", "Prebuild a rule-versioned economic-origin graph and scenario engine, label every result as an estimate, and delay compliance claims until final legislation.", "Replay five procurement scenarios with origin specialists and test whether the graph remains useful under three plausible final-rule variants."),
    ("european-product-release-ci", "European Product Release CI", 88, "Physical Product Conformance", ["s151"], ["candidate-489cf5fd-32fd-4c0b-91ed-5a6566686079"], "policy_watch_prebuild", "Repository-native release gate linking physical-product changes to applicable EU conformity evidence and approval state.", "Hardware manufacturers, product engineering teams, notified-body advisers, and quality organisations", "BOM, firmware, label, manual, supplier, and test changes can invalidate release evidence across multiple product-rule frameworks.", "Represent product state and applicable rules, diff each change, require evidence and authorized approval, and preserve a signed release-state capsule without treating a planned Product Act as law.", "Replay twenty historical product changes and compare affected-rule recall and review effort with product-compliance engineers."),
    ("port-dependency-investment-twin", "Port Dependency and Investment Twin", 89, "Maritime Infrastructure Intelligence", ["s153"], [], "full_validation", "Port dependency graph and investment simulator connecting cargo, hinterland, energy, capacity, security, resilience, and capital projects.", "Ports, terminal operators, infrastructure funds, lenders, industrial tenants, and public port authorities", "Port investment decisions span cargo flows, grid capacity, clean fuels, rail and road links, security, industrial tenants, and disruption exposure without one calibrated dependency model.", "Model one port's physical and economic dependencies, simulate disruption and investment options, and compare time, capacity, resilience, and cash-flow outcomes.", "Backtest two disruptions and three completed investments at one port with operators and financiers; reject the thesis if decisions cannot be calibrated from accessible data."),
]


def candidate_id(slug: str) -> str:
    return f"candidate-{uuid.uuid5(NAMESPACE, slug)}"


DEDUPLICATION = {
    "Critical Materials Offtake Bankability Engine": {"decision": "stage_distinct_post_match_bankability", "targets": []},
    "Battery Passport Underwriting API": {"decision": "enrich_existing_battery_afterlife_underwriting_family", "targets": ["idea-270", "candidate-44fa8b82-bc67-42ff-9ff3-cd6fa70e2d67"]},
    "EU Inc Corporate Action OS": {"decision": "stage_proposal_watch_prebuild", "targets": []},
    "Talent Pool Hire-to-Arrival OS": {"decision": "stage_distinct_post_match_execution", "targets": ["idea-263"]},
    "Critical Materials Treasury / Shock Twin": {"decision": "stage_distinct_physical_input_treasury", "targets": ["idea-380"]},
    "Strategic Project Permit Graph": {"decision": "stage_distinct_greenfield_project_critical_path", "targets": ["candidate-6ff41838-249d-5913-bb8f-1b0d2679a580", "candidate-e8cbd8ea-6371-5cde-bbeb-f40b3ffb96bd"]},
    "EUDR Plot Identity Repair Engine": {"decision": "stage_distinct_upstream_identity_repair", "targets": ["candidate-efaad4a5-2647-45bd-bd0a-5c024ba9e58c", "idea-369"]},
    "Chip Design-In Qualification Engine": {"decision": "stage_proposal_sensitive_qualification_graph", "targets": []},
    "EuroCompute Router": {"decision": "stage_distinct_entitlement_and_portability_router", "targets": ["candidate-fb95c237-1685-5798-98dd-5bc9d9920481"]},
    "Sovereign Refactor CI": {"decision": "stage_distinct_active_remediation_layer", "targets": ["idea-372", "idea-374"]},
    "Made-in-EU Origin Compiler": {"decision": "stage_proposal_watch_architecture", "targets": ["idea-373", "candidate-eb7452bb-060f-5de3-bc87-4dd957942d29"]},
    "FDI Value-Add Scenario Engine": {"decision": "feature_of_made_in_eu_origin_compiler", "targets": []},
    "European Product Release CI": {"decision": "stage_distinct_pre_release_gate", "targets": ["candidate-489cf5fd-32fd-4c0b-91ed-5a6566686079"]},
    "Quantum Supply-Chain Qualification Graph": {"decision": "watch_only_forthcoming_act_no_immediate_candidate", "targets": []},
    "Port Dependency & Investment Twin": {"decision": "stage_distinct_infrastructure_twin", "targets": []},
    "Cross-Border Skills Evidence Router": {"decision": "exact_existing_family", "targets": ["idea-263"]},
    "Semiconductor Demand Consortium OS": {"decision": "feature_or_go_to_market_layer_for_chip_qualification", "targets": []},
    "Battery Warranty Reserve Engine": {"decision": "feature_of_existing_battery_underwriting_family", "targets": ["idea-270"]},
    "Strategic Stockpile Optimizer": {"decision": "feature_of_critical_materials_treasury", "targets": []},
    "EU Public-Compute FinOps": {"decision": "feature_of_eurocompute_router", "targets": []},
}


def make_candidate(spec: tuple) -> dict:
    slug, name, score, category, sources, adjacent, priority, concept, customer, problem, build, gate = spec
    cid = candidate_id(slug)
    return {
        "schemaVersion": "2.0.0", "id": cid, "candidateId": cid, "candidateSlug": slug, "slug": f"{slug}-{cid}",
        "name": name, "oneSentenceConcept": concept, "elevatorPitch": f"{problem} {build}", "detailedDescription": concept,
        "category": category, "subcategory": "public primitive adjacent transaction infrastructure",
        "tags": ["august-2026", "expansion-iv", "state-transition-ownership", "customer-evidence-unproven"], "status": "staged",
        "evidenceStatus": "public_primitive_verified_customer_demand_unproven", "promotionEligible": False, "requiresExternalEvidence": True,
        "sourceReferences": sources,
        "provenance": {"sourceType": "VenturaAtlas Deep Research Expansion IV - user supplied", "researchRunId": RUN_ID, "originalWordingAvailable": "private-attachment", "notes": "Scores, market claims, pricing, demand, and willingness to pay remain hypotheses."},
        "atAGlance": {"targetCustomer": customer, "problemSolved": problem, "whatToBuild": build, "howItMakesMoney": None, "whyCustomersPay": None, "estimatedEarningPotential": None, "startupCost": None, "overallScore": None, "confidenceScore": None, "mainAdvantage": "Owns a high-value state transition adjacent to a public primitive rather than duplicating the primitive.", "mainRisk": "Official capture, legislative change, data access, decision quality, consulting intensity, and paid demand remain unvalidated.", "bestNextValidationStep": gate},
        "researchAssessment": {"analystProvisionalOpportunityScore": score, "scoreScale": "0-100", "scoreStatus": "provisional_not_ranking_eligible", "priorityClass": priority, "adjacentCanonicalOrCandidateRefs": adjacent, "scoringDimensionsToMeasure": ["timingUrgency", "mandatoryFrequency", "economicCoupling", "stateTransitionOwnership", "evidenceGravity", "dataNetworkEffects", "publicRailAdjacency", "integrationDepth", "expansionPotential", "competition", "officialCaptureRisk", "legislativeUncertainty", "consultingIntensity", "customerConcentration"]},
        "validationChecklist": {"gateStatus": "needs_customer_validation", "passed": False, "passedCount": 2, "failedCount": 0, "unknownCount": 5, "totalCriteria": 7, "scorePercentage": 28.57, "details": {"Public primitive or policy verified": "pass", "Semantic duplicate review completed": "pass", "Buyer workflow confirmed": "unknown", "Representative operational data obtained": "unknown", "Paid willingness to pay": "unknown", "Decision quality measured": "unknown", "Official capture and false-assurance boundary tested": "unknown"}},
        "killCriteria": {"killFlagged": False, "killCount": 0, "killConditions": {"No repeated private execution gap in 15 interviews": False, "No access to representative data": False, "Official rail captures the workflow": False, "Decision quality below required threshold": False, "No paid design partner after 30 qualified outreaches": False}, "killFlags": []},
        "createdAt": NOW, "updatedAt": NOW, "prioritizedForValidation": priority == "immediate_validation", "reviewPriority": "urgent" if priority == "immediate_validation" else "medium", "priority": score,
    }


def main() -> None:
    sources = read_json_safe(SOURCES_PATH, default_if_missing=[])
    urls, ids, added_sources = {x.get("url") for x in sources}, {x.get("id") for x in sources}, 0
    for sid, title, publisher, url, supports in SOURCES:
        if url in urls:
            continue
        if sid in ids:
            raise RuntimeError(f"Source ID collision: {sid}")
        sources.append({"id": sid, "title": title, "publisher": publisher, "url": url, "supports": supports, "type": "official_or_primary_evidence", "date": "2026", "accessDate": "2026-08-12", "confidenceLabel": "high", "sourceType": "primary", "researchRound": "deep-research-expansion-iv-2026-08-12", "ideaIds": [], "visibility": "PUBLIC", "sourceClass": "PRIMARY_OR_OFFICIAL", "evidenceEligible": True, "provenanceEligible": True})
        urls.add(url); ids.add(sid); added_sources += 1

    queue = read_json_safe(QUEUE_PATH, default_if_missing=[])
    by_slug = {x.get("candidateSlug") or x.get("slug"): i for i, x in enumerate(queue)}
    added_candidates = 0
    for spec in CANDIDATES:
        candidate = make_candidate(spec); slug = spec[0]
        if slug in by_slug:
            i = by_slug[slug]
            if queue[i].get("provenance", {}).get("researchRunId") == RUN_ID:
                queue[i] = candidate
            continue
        queue.append(candidate); by_slug[slug] = len(queue) - 1; added_candidates += 1

    gates = {spec[1]: spec[-1] for spec in CANDIDATES}
    validation_names = [
        "Critical Materials Offtake Bankability Engine", "Battery Passport Underwriting API", "Talent Pool Hire-to-Arrival OS",
        "EUDR Plot Identity Repair Engine", "Chip Design-In Qualification Engine", "EU Inc Corporate Action OS",
    ]
    target_map = {
        "Critical Materials Offtake Bankability Engine": [candidate_id("critical-materials-offtake-bankability")],
        "Battery Passport Underwriting API": ["idea-270"],
        "Talent Pool Hire-to-Arrival OS": [candidate_id("talent-pool-hire-to-arrival-os")],
        "EUDR Plot Identity Repair Engine": [candidate_id("eudr-plot-identity-repair")],
        "Chip Design-In Qualification Engine": [candidate_id("chip-design-in-qualification")],
        "EU Inc Corporate Action OS": [candidate_id("eu-inc-corporate-action-os")],
    }
    score_map = {spec[1]: spec[2] for spec in CANDIDATES} | {"Battery Passport Underwriting API": 95}
    gate_map = gates | {"Battery Passport Underwriting API": "Backtest passport plus independent diagnostic features against realized battery transaction prices and beat age, mileage, and reported state-of-health baselines."}
    validation = [{"rank": i + 1, "proposal": name, "analystProvisionalScore": score_map[name], "targetRefs": target_map[name], "nextGate": gate_map[name]} for i, name in enumerate(validation_names)]

    run = {
        "runId": RUN_ID, "baselineCommit": BASELINE,
        "questions": ["Which of twenty proposals own a distinct private state transition?", "Where does each public primitive stop?", "Which claims are enacted, adopted, proposed, or merely strategic?", "Which candidates survive semantic review against 294 canonical and the private queue?"],
        "queries": ["Raw Materials Mechanism commercial negotiations", "battery passport February 2027", "EU Inc proposal March 2026", "EU Talent Pool national immigration procedures", "EUDR revised application dates", "Chips Act 2.0 proposal Demand Accelerators", "AI Factories operational count", "EU Open Source Strategy", "Industrial Accelerator Act proposal", "EU Ports Strategy"],
        "sourceCandidates": [x[0] for x in SOURCES] + ["s125"], "inclusions": [candidate_id(x[0]) for x in CANDIDATES],
        "exclusions": [name for name, decision in DEDUPLICATION.items() if not decision["decision"].startswith("stage")],
        "claimsChanged": ["Twelve distinct candidates staged; eight proposals mapped to existing families, subordinate modules, or watch-only policy branches.", "The Commission now describes 19 AI Factories and 13 antennas as operational, not merely under establishment.", "EU Inc, Chips Act 2.0, and the Industrial Accelerator Act remain proposals; all corresponding candidates are bounded as watch or prebuild.", "Battery Passport Underwriting maps to the existing Battery Afterlife Exchange family rather than creating a semantic duplicate.", "All analyst scores and portfolio tiers remain provisional and non-ranking-eligible."],
        "deduplicationDecisions": DEDUPLICATION, "validationPriorityQueue": validation, "immediateExperiments": [{"rank": x["rank"], "proposal": x["proposal"], "targetRefs": x["targetRefs"]} for x in validation],
        "metaDiscoveries": ["public_primitive_to_private_operating_system", "compliance_data_to_underwriting_data", "post_match_execution", "state_transition_ownership", "official_rail_capture_risk", "public_rail_created_moat"],
        "researchBranches": ["industrial_bankability", "public_primitive_arbitrage", "mandatory_data_to_financial_product", "qualification_graphs", "european_compute_arbitrage"],
        "portfolioFamilies": ["critical_materials_os", "european_corporate_os", "battery_capital_os", "workforce_mobility_os", "industrial_bankability_os"],
        "newScoringDimensions": {"positive": {"timingUrgency": 1.3, "mandatoryFrequency": 1.2, "economicCoupling": 1.5, "stateTransitionOwnership": 1.7, "evidenceGravity": 1.2, "dataNetworkEffects": 1.4, "publicRailAdjacency": 1.2, "integrationDepth": 1.1, "expansionPotential": 1.3}, "negative": {"competition": 1.3, "officialCaptureRisk": 1.6, "legislativeUncertainty": 1.5, "consultingIntensity": 1.0, "customerConcentration": 0.8}},
        "researchPasses": ["enumerate_public_primitive", "mark_explicit_boundary", "map_before_state", "map_after_state", "test_transaction_value", "test_official_capture", "test_evidence_feedback_loop", "test_legislative_certainty"],
        "agent": "research-intelligence-agent", "methodVersion": "epistemic-v7-public-primitive-state-transition", "startedAt": NOW, "endedAt": NOW, "reviewStatus": "approved_for_private_staging_and_validation_not_canonical_promotion",
    }
    runs = read_json_safe(RUNS_PATH, default_if_missing=[])
    index = next((i for i, item in enumerate(runs) if item.get("runId") == RUN_ID), None)
    if index is None: runs.append(run)
    else: runs[index] = run

    atomic_write_json(SOURCES_PATH, sources); atomic_write_json(QUEUE_PATH, queue); atomic_write_json(RUNS_PATH, runs)
    print(f"[OK] Added {added_sources} primary sources, {added_candidates} staged candidates, and recorded {RUN_ID}.")


if __name__ == "__main__":
    main()
