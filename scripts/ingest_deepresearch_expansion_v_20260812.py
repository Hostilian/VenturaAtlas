"""Ingest Deep Research Expansion V and its verified ShockGraph deltas."""

from __future__ import annotations

import os
import uuid

from va_runtime.atomic_io import atomic_write_json, read_json_safe


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE_PATH = os.path.join(ROOT, "data", "idea-staging-queue.json")
SOURCES_PATH = os.path.join(ROOT, "data", "sources.json")
RUNS_PATH = os.path.join(ROOT, "data", "research-runs.json")
SHOCK_PATH = os.path.join(ROOT, "data", "shockgraph.json")
RUN_ID = "run-res-007-20260812-expansion-v"
NOW = "2026-08-12T18:30:00+00:00"
BASELINE = "fc87084fda7f18ce9538839b4fc25a8585b85f70"
NAMESPACE = uuid.UUID("adf5b85f-1dc6-4aa0-81ee-4edb4c379a65")


SOURCES = [
    ("s154", "Industrial carbon management", "European Commission - DG Energy", "https://energy.ec.europa.eu/topics/carbon-management-and-fossil-fuels/industrial-carbon-management_en", ["CO2 transport infrastructure is a key enabler", "NZIA sets a binding target of 50 million tonnes annual EU injection capacity by 2030"]),
    ("s155", "Charter of Access for Industrial Users to Research and Technology Infrastructures", "European Commission - DG RTD", "https://research-and-innovation.ec.europa.eu/news/all-research-and-innovation-news/new-charter-boosts-access-companies-cutting-edge-research-and-technology-infrastructures-europe-2026-07-28_en", ["The voluntary charter targets limited availability information, access conditions, contracts, IP, and data cooperation", "The charter does not establish a mandatory booking market"]),
    ("s156", "Critical Chemicals Alliance", "European Commission - DG GROW", "https://single-market-economy.ec.europa.eu/sectors/chemicals/critical-chemicals-alliance_en", ["The Alliance is identifying critical chemical production and molecules", "Policy attention does not validate a private dependency-graph buyer"]),
    ("s157", "Soil Monitoring Law", "European Commission - DG Environment", "https://environment.ec.europa.eu/topics/soil-health/soil-monitoring-law_en", ["The law entered into force on 16 December 2025", "Member States must transpose by 16 December 2028 and address contaminated sites"]),
    ("s158", "PFAS pollution", "European Commission - DG Environment", "https://environment.ec.europa.eu/topics/chemicals/pfas-pollution_en", ["EU policy now spans PFAS monitoring, reporting, restriction, substitution, and remediation", "Public monitoring data does not by itself create a calibrated land-underwriting model"]),
    ("s159", "Towards the Advanced Materials Act", "European Commission - DG RTD", "https://research-and-innovation.ec.europa.eu/research-area/industrial-research-and-innovation/chemicals-and-advanced-materials/towards-advanced-materials-act_en", ["The Commission is preparing an Advanced Materials Act", "A forthcoming initiative is a policy signal, not an adopted qualification obligation"]),
    ("s160", "Bio-based industry", "European Commission", "https://commission.europa.eu/topics/competitiveness/competitiveness-coordination-tool-projects/biobased-industry_en", ["EU coordination supports biomanufacturing scale-up and bio-based industrial capacity", "Technology-transfer and qualification demand remain customer hypotheses"]),
    ("s161", "European Ocean Act consultation", "European Commission - DG MARE", "https://oceans-and-fisheries.ec.europa.eu/news/commission-launches-public-consultation-european-ocean-act-2026-04-23_en", ["The Commission launched consultation on a future European Ocean Act", "The act remains forthcoming and cannot be treated as operative law"]),
    ("s162", "AI Gigafactories", "European Commission", "https://commission.europa.eu/topics/competitiveness/competitiveness-coordination-tool-projects/ai-gigafactories_en", ["The EU is coordinating large AI-compute infrastructure projects", "Long-term compute offtake structures and buyer demand remain unverified"]),
    ("s163", "Nature Restoration Regulation", "European Commission - DG Environment", "https://environment.ec.europa.eu/topics/nature-and-biodiversity/nature-restoration-regulation_en", ["The Regulation entered into force on 18 August 2024", "Member States are expected to submit National Restoration Plans by September 2026"]),
    ("s164", "Affordable housing", "European Commission", "https://commission.europa.eu/topics/employment-and-social-affairs/affordability/affordable-housing_en", ["EU policy supports faster affordable-housing delivery", "Policy intent does not prove demand for a modular permit compiler or capacity market"]),
    ("s165", "Digital Networks Act", "European Commission - DG CONNECT", "https://digital-strategy.ec.europa.eu/en/policies/digital-networks-act", ["The 21 January 2026 proposal supports copper-to-fibre transition and national transition plans", "The Digital Networks Act remains a proposal"]),
    ("s166", "One journey, one ticket, full rights", "European Commission - DG MOVE", "https://transport.ec.europa.eu/news-events/news/one-journey-one-ticket-full-rights-commission-simplifies-europe-wide-travel-booking-and-train-travel-2026-05-13_en", ["The Commission proposed passenger booking and journey-rights changes", "The proposal does not establish an operating inter-operator disruption clearinghouse"]),
    ("s167", "Rail infrastructure capacity rules", "European Commission - DG MOVE", "https://transport.ec.europa.eu/news-events/news/new-eu-rules-will-improve-cross-border-rail-traffic-and-optimise-network-capacity-2026-06-10_en", ["Regulation EU 2026/1184 introduces harmonised, multiannual rail-capacity planning", "The first optimised timetable is expected in December 2030"]),
    ("s168", "European SMR strategy", "European Commission - DG Energy", "https://energy.ec.europa.eu/news/commission-unveils-strategy-bring-europes-first-smrs-online-early-2030s-2026-03-10_en", ["The strategy targets first European SMRs in the early 2030s and promotes a fleet approach", "Licensing, standardisation, supply chains, and project demand remain early and uncertain"]),
    ("s169", "OceanEye", "European Commission - DG MARE", "https://oceans-and-fisheries.ec.europa.eu/publications/oceaneye-making-eu-leader-ocean-observation_en", ["OceanEye is a developing European ocean-observation initiative", "Its eventual commercial API, terms, and insurance usefulness remain uncertain"]),
]


# slug, name, score, category, sources, adjacency, priority, concept, customer, problem, build, gate
CANDIDATES = [
    ("co2-capacity-router", "CO2 Capacity Router - Carbon Corridor OS", 95, "Carbon Transport Capacity", ["s154"], [], "immediate_validation", "Compatibility, routing, reservation, and bankability control plane for captured-CO2 transport and storage capacity.", "Industrial emitters, carbon transport and storage operators, project developers, lenders, and insurers", "A capture project can fail if compatible transport and injection capacity cannot be discovered, sequenced, and credibly reserved.", "Model CO2 specification, terminal and pipeline constraints, shipping slots, injection windows, reservation terms, fallback routes, and finance conditions.", "Build one synthetic corridor with three emitters, two transport modes, and two stores; validate reservation reality and bankability with ten operators or financiers."),
    ("chemical-domino-graph", "Chemical Domino Graph", 94, "Industrial Chemical Dependencies", ["s156"], ["idea-305", "idea-378", "idea-384"], "immediate_validation", "Multi-tier molecule-to-process-to-product-to-revenue graph for simulating chemical supply shocks and substitutions.", "Specialty-chemical producers, automotive and battery manufacturers, procurement teams, and industrial insurers", "A single precursor or process outage can cascade across formulations and production while conventional supplier maps stop above the molecule and process layers.", "Resolve molecules, transformations, sites, suppliers, formulations, products and revenue; simulate closures, price shocks, trade restrictions, and qualified substitutes.", "Map one specialty-chemical chain with two manufacturers and replay three historical shortages; measure unknown tiers and decision value."),
    ("brownfield-pfas-underwriter", "Brownfield PFAS Underwriter", 94, "Contaminated Land Finance", ["s157", "s158"], ["idea-398"], "immediate_validation", "Parcel-level contamination loss distribution and remediation-reserve engine for brownfield acquisition and lending.", "Industrial property buyers, lenders, insurers, developers, environmental consultants, and public land banks", "PFAS history, hydrogeology, sampling uncertainty, liability allocation, remediation method, duration, and residual risk are translated manually into transaction terms.", "Combine site history, official and sampled contamination, pathway models, remedy scenarios, comparable outcomes, legal review, and uncertainty into price and reserve scenarios.", "Underwrite five historical sites with consultants and lenders; compare predicted remediation range and reserve against realized cost and transaction decisions."),
    ("advanced-materials-qualification-network", "Advanced Materials Qualification Network", 92, "Physical Qualification Infrastructure", ["s155", "s159"], ["idea-175", "idea-294"], "immediate_validation", "Reusable evidence graph taking advanced materials from candidate substitute through test, pilot, qualification, and approved use.", "Materials producers, industrial OEMs, laboratories, pilot lines, and certification or quality teams", "Discovering a material does not prove process compatibility, performance, safety, durability, or production readiness for a specific use.", "Compile use-case requirements into test plans, reserve facilities, preserve samples and methods, ingest results, and publish scoped qualification evidence with expiry and lineage.", "Select five candidate substitutions and measure whether prior evidence can safely reduce duplicated testing with three OEMs and laboratories."),
    ("biomanufacturing-tech-transfer-compiler", "Biomanufacturing Tech-Transfer Compiler", 92, "Bioprocess Scale-Up", ["s160"], [], "full_validation", "Structured compiler from pilot bioprocess to production-facility requirements, transfer package, deviations, and scale-up evidence.", "Industrial-biotech startups, CDMOs, pilot facilities, fermentation operators, and investors", "Pilot success does not automatically transfer across vessel geometry, feed, mixing, oxygen, controls, downstream steps, quality, and facility constraints.", "Represent process parameters, equipment equivalence, materials, controls, quality attributes, hazards, deviations, and evidence from pilot through production batches.", "Replay two real or anonymized pilot-to-production transfers and test whether the compiler predicts deviations earlier than existing transfer packets."),
    ("bio-based-drop-in-qualification", "Bio-Based Drop-In Qualification OS", 93, "Industrial Material Substitution", ["s159", "s160"], ["candidate-345c0519-1c1d-5acb-8b6f-dd6489ca89b7"], "full_validation", "Formulation-to-test-to-approved-change workflow for qualifying bio-based substitutes in existing industrial products and processes.", "Chemical and materials producers, consumer-goods manufacturers, automotive suppliers, and industrial laboratories", "A bio-based candidate is not commercially usable until formulation, process, performance, safety, quality, cost, and supply equivalence are demonstrated.", "Compile incumbent requirements, simulate formulations, schedule evidence, track pilot batches and deviations, and maintain scoped approval history.", "Run three substitution dossiers through incumbent-versus-candidate testing and measure cycle time, failure discovery, and evidence reuse."),
    ("ocean-space-conflict-compiler", "Ocean Space Conflict Compiler", 92, "Offshore Project Bankability", ["s161", "s169"], ["idea-405"], "proposal_watch_validation", "Spatial dependency and conflict graph for offshore energy, cables, shipping, fishing, defence, nature, and port access.", "Offshore developers, lenders, insurers, ports, cable owners, maritime planners, and public authorities", "Large offshore projects cross overlapping rights, uses, habitats, security constraints, infrastructure, and consultation processes that can delay or destroy bankability.", "Combine authoritative spatial layers, rights, project schedules, stakeholder evidence, conflicts, mitigations, and uncertainty; never treat a future Ocean Act as current law.", "Reconstruct two permitted and one delayed offshore project; ask practitioners whether the graph would have surfaced critical conflicts earlier."),
    ("compute-offtake-bankability", "Compute Offtake Bankability Engine", 91, "Compute Infrastructure Finance", ["s162", "s148"], ["candidate-6b20fbf2-dfb8-5000-895b-b8342abb4b77", "candidate-fb95c237-1685-5798-98dd-5bc9d9920481"], "full_validation", "Contract and underwriting engine for long-term compute-capacity offtakes supporting data-centre and accelerator financing.", "Compute providers, large AI users, infrastructure funds, lenders, insurers, and data-centre developers", "Long-duration compute demand must be translated into credible hardware, power, service-level, utilization, price, credit, and obsolescence terms before it can finance capacity.", "Model buyer workloads, capacity curves, hardware generations, power, price and SLA structures, credit support, resale, and downside scenarios.", "Structure one synthetic 5-year offtake with two providers and three buyers; have infrastructure financiers identify missing bankability terms and fatal risks."),
    ("nature-restoration-project-os", "Nature Restoration Project OS", 92, "Nature Project Delivery", ["s163"], [], "immediate_validation", "Plan-to-parcel execution system converting restoration targets into land agreements, funded interventions, monitoring, and durable project evidence.", "Restoration developers, landowners, municipalities, conservation organisations, infrastructure investors, and public agencies", "National plans still require parcel selection, landowner agreements, intervention design, permits, funding, contractors, monitoring, and long-term maintenance.", "Model targets, parcels, rights, ecological baselines, interventions, counterparties, funding, procurement, milestones, monitoring, and permanence obligations.", "Select one anticipated plan area and manually build ten parcel pathways; validate landowner control points, funding sources, and project bottlenecks."),
    ("permit-ready-modular-housing", "Permit-Ready Modular Housing Compiler", 92, "Housing Delivery Infrastructure", ["s164"], [], "full_validation", "Compiler from modular building system plus parcel and local rules to a reviewable permit-ready configuration and evidence pack.", "Modular manufacturers, housing developers, municipalities, architects, and affordable-housing providers", "Standard modules still collide with local planning, fire, accessibility, energy, structure, utility, transport, and site conditions.", "Represent certified module constraints and parcel rules, generate allowable configurations and required evidence, and retain authority feedback as scoped precedent.", "Compile one modular system across five parcels in two jurisdictions and compare findings and rework with architects and permitting authorities."),
    ("multi-operator-rail-disruption-clearing", "Multi-Operator Rail Disruption Clearinghouse", 90, "Passenger Disruption Settlement", ["s166"], [], "proposal_watch_validation", "Evidence and settlement rail allocating passenger remedy and operator liability across disrupted multi-ticket journeys.", "Rail operators, ticket platforms, passenger-rights administrators, insurers, and mobility intermediaries", "When a multi-operator journey breaks, evidence, re-routing duty, passenger remedy, and inter-operator liability are fragmented and disputed.", "Normalize journey, ticket, disruption, re-routing, notification, cost, passenger-rights, and operator-agreement evidence; calculate proposed settlement under versioned rules.", "Replay 100 real or synthetic disrupted journeys with two operators or ticket platforms and measure legal ambiguity, manual handling, and settlement disagreement."),
    ("smr-fleet-configuration-ledger", "SMR Fleet Configuration Ledger", 89, "Nuclear Configuration Evidence", ["s168"], [], "strategy_watch", "Cross-project configuration and change-evidence ledger for a prospective fleet of standardized small modular reactors.", "SMR vendors, future licensees, engineering organisations, regulators, and nuclear supply-chain quality teams", "Fleet value depends on proving which design, component, analysis, supplier, test, and approved change applies to each unit across jurisdictions.", "Model reference design, jurisdictional deviations, licensed baseline, supplier configuration, evidence, change propagation, review state, and unresolved divergence.", "Interview ten nuclear configuration and licensing practitioners and reconstruct one non-safety-critical synthetic change; do not claim regulatory acceptance."),
    ("spectrum-capacity-exchange", "Spectrum Capacity Exchange", 88, "Shared Spectrum Operations", ["s165"], [], "proposal_watch", "Policy-aware request, coordination, reservation, interference, and settlement layer for shared terrestrial and satellite spectrum capacity.", "Mobile, private-network, satellite, venue, industrial, and spectrum-coordination operators", "Longer licences and spectrum-sharing policy do not solve real-time compatibility, incumbent protection, geographic coordination, interference evidence, and commercial settlement.", "Model licences, geography, time, power, equipment, incumbent protection, conflicts, authorization, usage receipts, and settlement while the DNA remains a proposal.", "Simulate one bounded private-network and satellite sharing case with spectrum specialists; kill if authority or incumbent systems necessarily absorb the control point."),
    ("rail-capacity-portfolio-os", "Rail Capacity Portfolio OS", 89, "Rail Infrastructure Capacity", ["s167"], ["idea-291"], "long_window_validation", "Portfolio optimizer for train-path applications, dependencies, alternatives, disruption exposure, and capacity value under multiannual EU planning.", "Rail freight operators, passenger entrants, rolling-stock owners, terminals, and logistics planners", "Cross-border capacity remains fragmented while decisions about paths, rolling stock, terminals, crews, alternatives, and customer commitments interact over multiple years.", "Represent path requests and dependencies, compare portfolios and fallback capacity, track application states, and quantify delay and stranded-asset exposure.", "Backtest one cross-border freight portfolio and validate data availability and decision improvement before the December 2030 timetable window."),
]


def candidate_id(slug: str) -> str:
    return f"candidate-{uuid.uuid5(NAMESPACE, slug)}"


DEDUPLICATION = {
    "CO2 Capacity Router / Carbon Corridor OS": {"decision": "stage_distinct_capacity_reservation", "targets": []},
    "DeepTech Lab Access OS": {"decision": "exact_private_family_enrich", "targets": ["candidate-2fa25465-2747-46b7-a7db-530949f7c070", "idea-294"]},
    "Chemical Domino Graph": {"decision": "stage_distinct_hidden_topology", "targets": ["idea-305", "idea-378", "idea-384"]},
    "Brownfield PFAS Underwriter": {"decision": "stage_distinct_land_underwriting", "targets": ["idea-398"]},
    "Advanced Materials Qualification Network": {"decision": "stage_distinct_reusable_qualification", "targets": ["idea-175", "idea-294"]},
    "Biomanufacturing Tech-Transfer Compiler": {"decision": "stage_distinct_scaleup_transfer", "targets": []},
    "Bio-Based Drop-In Qualification OS": {"decision": "stage_distinct_material_change_qualification", "targets": ["candidate-345c0519-1c1d-5acb-8b6f-dd6489ca89b7"]},
    "Ocean Space Conflict Compiler": {"decision": "stage_proposal_sensitive_bankability", "targets": ["idea-405"]},
    "Compute Offtake Bankability Engine": {"decision": "stage_distinct_finance_contract_layer", "targets": ["candidate-6b20fbf2-dfb8-5000-895b-b8342abb4b77", "candidate-fb95c237-1685-5798-98dd-5bc9d9920481"]},
    "Nature Restoration Project OS": {"decision": "stage_distinct_plan_to_project", "targets": []},
    "Permit-Ready Modular Housing Compiler": {"decision": "stage_distinct_local_configuration_compiler", "targets": []},
    "Copper Retirement Migration OS": {"decision": "exact_private_family", "targets": ["candidate-22158a0b-1b04-4c35-a985-338f688422a7"]},
    "Multi-Operator Rail Disruption Clearinghouse": {"decision": "stage_proposal_sensitive_clearing", "targets": []},
    "SMR Fleet Configuration Ledger": {"decision": "stage_strategy_watch", "targets": []},
    "Spectrum Capacity Exchange": {"decision": "stage_proposal_watch", "targets": []},
    "Rail Capacity Portfolio OS": {"decision": "stage_distinct_long_window_capacity", "targets": ["idea-291"]},
    "PFAS Remediation Performance Network": {"decision": "module_of_brownfield_underwriter", "targets": []},
    "Satellite D2D Spectrum Preflight": {"decision": "module_or_watch_with_spectrum_exchange", "targets": ["idea-383"]},
    "Chemical Substitution Qualification CI": {"decision": "wedge_of_advanced_materials_qualification", "targets": []},
    "Research Infrastructure IP Router": {"decision": "module_of_existing_lab_access_operator", "targets": ["candidate-2fa25465-2747-46b7-a7db-530949f7c070"]},
    "Offsite Housing Factory Capacity Router": {"decision": "module_of_modular_housing_compiler", "targets": []},
    "Nature Restoration Landowner Router": {"decision": "module_of_nature_restoration_os", "targets": []},
    "SMR Supply-Chain Qualification Graph": {"decision": "module_of_smr_configuration_ledger", "targets": []},
    "Rail Gauge Migration Asset Twin": {"decision": "watch_module_of_rail_capacity_family", "targets": []},
    "OceanEye Insurance API": {"decision": "watch_module_of_ocean_space_compiler", "targets": []},
}


def make_candidate(spec: tuple) -> dict:
    slug, name, score, category, sources, adjacent, priority, concept, customer, problem, build, gate = spec
    cid = candidate_id(slug)
    return {
        "schemaVersion": "2.0.0", "id": cid, "candidateId": cid, "candidateSlug": slug, "slug": f"{slug}-{cid}", "name": name,
        "oneSentenceConcept": concept, "elevatorPitch": f"{problem} {build}", "detailedDescription": concept, "category": category,
        "subcategory": "scarce capacity, qualification, topology, or plan-to-project infrastructure",
        "tags": ["august-2026", "expansion-v", "physical-evidence", "customer-evidence-unproven"], "status": "staged",
        "evidenceStatus": "forcing_function_verified_customer_demand_unproven", "promotionEligible": False, "requiresExternalEvidence": True,
        "sourceReferences": sources,
        "provenance": {"sourceType": "VenturaAtlas Deep Research Expansion V - user supplied", "researchRunId": RUN_ID, "originalWordingAvailable": "private-attachment", "notes": "Scores, market claims, capacity availability, pricing, buyer demand, and willingness to pay remain hypotheses."},
        "atAGlance": {"targetCustomer": customer, "problemSolved": problem, "whatToBuild": build, "howItMakesMoney": None, "whyCustomersPay": None, "estimatedEarningPotential": None, "startupCost": None, "overallScore": None, "confidenceScore": None, "mainAdvantage": "Moves a physical or contractual state from possible to qualified, reserved, executed, or underwritten.", "mainRisk": "Capacity access, evidence reuse, counterparty control, official capture, consulting intensity, and paid demand remain unvalidated.", "bestNextValidationStep": gate},
        "researchAssessment": {"analystProvisionalOpportunityScore": score, "scoreScale": "0-100", "scoreStatus": "provisional_not_ranking_eligible", "priorityClass": priority, "adjacentCanonicalOrCandidateRefs": adjacent, "scoringDimensionsToMeasure": ["capacityCriticality", "qualificationReuse", "realityFeedback", "planToProjectGap", "economicCoupling", "stateTransitionOwnership", "officialCaptureRisk", "counterpartyReadiness"]},
        "validationChecklist": {"gateStatus": "needs_customer_validation", "passed": False, "passedCount": 2, "failedCount": 0, "unknownCount": 5, "totalCriteria": 7, "scorePercentage": 28.57, "details": {"Forcing function verified": "pass", "Semantic duplicate review completed": "pass", "Capacity or qualification workflow confirmed": "unknown", "Representative physical data obtained": "unknown", "Paid willingness to pay": "unknown", "Outcome quality measured": "unknown", "Counterparty and false-assurance boundary tested": "unknown"}},
        "killCriteria": {"killFlagged": False, "killCount": 0, "killConditions": {"No repeated workflow failure in 15 interviews": False, "No access to representative physical evidence": False, "Official or incumbent system owns the transition": False, "Outcome quality below required threshold": False, "No paid design partner after 30 qualified outreaches": False}, "killFlags": []},
        "createdAt": NOW, "updatedAt": NOW, "prioritizedForValidation": priority == "immediate_validation", "reviewPriority": "urgent" if priority == "immediate_validation" else "medium", "priority": score,
    }


def upsert_by_id(items: list[dict], record: dict, key: str) -> None:
    index = next((i for i, item in enumerate(items) if item.get(key) == record[key]), None)
    if index is None: items.append(record)
    else: items[index] = record


def update_shockgraph() -> None:
    graph = read_json_safe(SHOCK_PATH, default_if_missing={})
    # A proposal is a dependency/watch signal, not an enacted-law shock.
    graph["shocks"] = [item for item in graph["shocks"] if item.get("shockId") != "shock-digital-networks-act-proposal"]
    dependencies = [
        {"dependencyId": "dep-eu-industrial-carbon-capacity", "type": "INFRASTRUCTURE", "name": "EU industrial carbon transport and 2030 injection-capacity buildout", "status": "NZIA_2030_TARGET_IMPLEMENTATION", "checkedAt": NOW, "sourceRefs": ["s154"], "ideaRefs": ["idea-388"], "volatility": "HIGH"},
        {"dependencyId": "dep-eu-technology-infrastructure-charter", "type": "STANDARD", "name": "Voluntary Charter of Access for Industrial Users to Research and Technology Infrastructures", "status": "VOLUNTARY_CHARTER_ADOPTED_2026-07-28", "checkedAt": NOW, "sourceRefs": ["s155"], "ideaRefs": ["idea-294"], "volatility": "MEDIUM"},
        {"dependencyId": "dep-eu-soil-monitoring-law", "type": "LAW", "name": "EU Soil Monitoring Law and contaminated-site framework", "status": "IN_FORCE_TRANSPOSITION_DUE_2028-12-16", "checkedAt": NOW, "sourceRefs": ["s157", "s158"], "ideaRefs": ["idea-398"], "volatility": "MEDIUM"},
        {"dependencyId": "dep-eu-nature-restoration-plans", "type": "REGULATION", "name": "EU Nature Restoration Regulation and national restoration plans", "status": "IN_FORCE_PLANS_EXPECTED_2026-09", "checkedAt": NOW, "sourceRefs": ["s163"], "ideaRefs": [], "volatility": "MEDIUM"},
        {"dependencyId": "dep-eu-digital-networks-proposal", "type": "REGULATION", "name": "Proposed Digital Networks Act and copper transition plans", "status": "PROPOSED_2026-01-21", "checkedAt": NOW, "sourceRefs": ["s165"], "ideaRefs": [], "volatility": "HIGH"},
        {"dependencyId": "dep-eu-rail-capacity-2026-1184", "type": "REGULATION", "name": "Regulation EU 2026/1184 on railway infrastructure capacity", "status": "ADOPTED_FIRST_OPTIMISED_TIMETABLE_EXPECTED_2030-12", "checkedAt": NOW, "sourceRefs": ["s167"], "ideaRefs": ["idea-291"], "volatility": "MEDIUM"},
    ]
    for record in dependencies: upsert_by_id(graph["dependencies"], record, "dependencyId")
    shocks = [
        {"shockId": "shock-carbon-injection-capacity-target", "dependencyId": "dep-eu-industrial-carbon-capacity", "kind": "NEW_LAW", "observedAt": NOW, "effectiveAt": "2030-01-01T00:00:00Z", "sourceRefs": ["s154"], "affectedIdeaRefs": ["idea-388"], "direction": "POSITIVE", "reviewRequired": True},
        {"shockId": "shock-technology-infrastructure-charter", "dependencyId": "dep-eu-technology-infrastructure-charter", "kind": "STANDARD_FINALIZED", "observedAt": NOW, "effectiveAt": "2026-07-28T00:00:00Z", "sourceRefs": ["s155"], "affectedIdeaRefs": ["idea-294"], "direction": "MIXED", "reviewRequired": True},
        {"shockId": "shock-soil-monitoring-law-in-force", "dependencyId": "dep-eu-soil-monitoring-law", "kind": "NEW_LAW", "observedAt": NOW, "effectiveAt": "2025-12-16T00:00:00Z", "sourceRefs": ["s157", "s158"], "affectedIdeaRefs": ["idea-398"], "direction": "POSITIVE", "reviewRequired": True},
        {"shockId": "shock-nature-restoration-plan-window", "dependencyId": "dep-eu-nature-restoration-plans", "kind": "APPLICATION_START", "observedAt": NOW, "effectiveAt": "2026-09-01T00:00:00Z", "sourceRefs": ["s163"], "affectedIdeaRefs": [], "direction": "POSITIVE", "reviewRequired": True},
        {"shockId": "shock-rail-capacity-regulation-adopted", "dependencyId": "dep-eu-rail-capacity-2026-1184", "kind": "NEW_LAW", "observedAt": NOW, "effectiveAt": "2026-06-11T00:00:00Z", "sourceRefs": ["s167"], "affectedIdeaRefs": ["idea-291"], "direction": "MIXED", "reviewRequired": True},
    ]
    for record in shocks: upsert_by_id(graph["shocks"], record, "shockId")
    obligations = [
        {"obligationId": "obl-nzia-co2-injection-capacity", "instrumentId": "dep-eu-industrial-carbon-capacity", "actor": "obligated EU oil and gas producers", "object": "annual CO2 injection capacity", "action": "contribute to development of EU storage capacity", "scope": "NZIA collective 50 million tonne annual injection-capacity target", "effectiveAt": "2030-01-01T00:00:00Z", "maturity": "ADOPTED", "secondaryLegislationPending": True, "exemptions": ["Producer-specific contribution and implementation details require current legal review"], "sourceRefs": ["s154"], "ideaRefs": ["idea-388"]},
        {"obligationId": "obl-soil-law-national-transposition", "instrumentId": "dep-eu-soil-monitoring-law", "actor": "EU Member States", "object": "national soil monitoring and contaminated-site framework", "action": "transpose the Soil Monitoring Law", "scope": "all soils and covered monitoring, assessment, and contaminated-site provisions", "effectiveAt": "2028-12-16T00:00:00Z", "maturity": "ADOPTED", "secondaryLegislationPending": True, "exemptions": [], "sourceRefs": ["s157", "s158"], "ideaRefs": ["idea-398"]},
    ]
    for record in obligations: upsert_by_id(graph["obligations"], record, "obligationId")
    ecosystems = [
        {"ecosystemId": "eco-co2-corridors", "name": "European captured-CO2 transport and storage corridors", "topology": "PHYSICAL_NETWORK", "providerDensity": "EARLY", "stage": "EARLY_ADOPTION", "sourceRefs": ["s154"], "ideaRefs": ["idea-388"]},
        {"ecosystemId": "eco-technology-infrastructures", "name": "European research and technology infrastructures", "topology": "FEDERATED_NETWORK", "providerDensity": "HIGHLY_FRAGMENTED", "stage": "EARLY_ADOPTION", "sourceRefs": ["s155"], "ideaRefs": ["idea-294"]},
        {"ecosystemId": "eco-contaminated-land", "name": "EU contaminated-site monitoring and remediation network", "topology": "CERTIFIED_INTERMEDIARIES", "providerDensity": "UNKNOWN", "stage": "PREPARATION", "sourceRefs": ["s157", "s158"], "ideaRefs": ["idea-398"]},
        {"ecosystemId": "eco-nature-restoration", "name": "EU national restoration plans and project delivery", "topology": "MULTI_PARTY_SUPPLY_CHAIN", "providerDensity": "UNKNOWN", "stage": "PREPARATION", "sourceRefs": ["s163"], "ideaRefs": []},
        {"ecosystemId": "eco-copper-transition", "name": "Proposed national copper-to-fibre transition plans", "topology": "PHYSICAL_NETWORK", "providerDensity": "CONSOLIDATING", "stage": "SPEC_FORMING", "sourceRefs": ["s165"], "ideaRefs": []},
        {"ecosystemId": "eco-rail-capacity", "name": "European rail infrastructure-capacity allocation", "topology": "FEDERATED_NETWORK", "providerDensity": "CONSOLIDATING", "stage": "MANDATORY_TRANSITION", "sourceRefs": ["s167"], "ideaRefs": ["idea-291"]},
    ]
    for record in ecosystems: upsert_by_id(graph["ecosystems"], record, "ecosystemId")
    assessments = [
        {"assessmentId": "cp-assured-test-slots", "ideaId": "idea-294", "parties": [{"role": "industrial customer", "mustParticipate": True, "canBeForced": True, "controlsData": True, "controlsDecision": True, "controlsBudget": True, "readiness": "UNKNOWN"}, {"role": "research or testing infrastructure", "mustParticipate": True, "canBeForced": False, "controlsData": True, "controlsDecision": True, "controlsBudget": False, "readiness": "UNKNOWN"}], "coordinationTax": "HIGH", "weakestCriticalParty": "research or testing infrastructure", "sourceRefs": ["s155"]},
        {"assessmentId": "cp-pfas-land-intelligence", "ideaId": "idea-398", "parties": [{"role": "asset owner or buyer", "mustParticipate": True, "canBeForced": True, "controlsData": True, "controlsDecision": True, "controlsBudget": True, "readiness": "UNKNOWN"}, {"role": "laboratory and environmental consultant", "mustParticipate": True, "canBeForced": False, "controlsData": True, "controlsDecision": False, "controlsBudget": False, "readiness": "UNKNOWN"}, {"role": "regulator or liable party", "mustParticipate": True, "canBeForced": None, "controlsData": True, "controlsDecision": True, "controlsBudget": None, "readiness": "UNKNOWN"}], "coordinationTax": "HIGH", "weakestCriticalParty": None, "sourceRefs": ["s157", "s158"]},
    ]
    for record in assessments: upsert_by_id(graph["counterpartyAssessments"], record, "assessmentId")
    atomic_write_json(SHOCK_PATH, graph)


def main() -> None:
    sources = read_json_safe(SOURCES_PATH, default_if_missing=[])
    urls, ids, added_sources = {str(x.get("url", "")).rstrip("/") for x in sources}, {x.get("id") for x in sources}, 0
    for sid, title, publisher, url, supports in SOURCES:
        if url.rstrip("/") in urls: continue
        if sid in ids: raise RuntimeError(f"Source ID collision: {sid}")
        sources.append({"id": sid, "title": title, "publisher": publisher, "url": url, "supports": supports, "type": "official_or_primary_evidence", "date": "2026", "accessDate": "2026-08-12", "confidenceLabel": "high", "sourceType": "primary", "researchRound": "deep-research-expansion-v-2026-08-12", "ideaIds": [], "visibility": "PUBLIC", "sourceClass": "PRIMARY_OR_OFFICIAL", "evidenceEligible": True, "provenanceEligible": True})
        urls.add(url.rstrip("/")); ids.add(sid); added_sources += 1

    queue = read_json_safe(QUEUE_PATH, default_if_missing=[])
    by_slug = {x.get("candidateSlug") or x.get("slug"): i for i, x in enumerate(queue)}
    added_candidates = 0
    for spec in CANDIDATES:
        candidate, slug = make_candidate(spec), spec[0]
        if slug in by_slug:
            i = by_slug[slug]
            if queue[i].get("provenance", {}).get("researchRunId") == RUN_ID: queue[i] = candidate
            continue
        queue.append(candidate); by_slug[slug] = len(queue) - 1; added_candidates += 1

    names = ["DeepTech Lab Access OS", "Brownfield PFAS Underwriter", "CO2 Capacity Router / Carbon Corridor OS", "Chemical Domino Graph", "Advanced Materials Qualification Network"]
    target_map = {
        "DeepTech Lab Access OS": ["candidate-2fa25465-2747-46b7-a7db-530949f7c070"],
        "Brownfield PFAS Underwriter": [candidate_id("brownfield-pfas-underwriter")],
        "CO2 Capacity Router / Carbon Corridor OS": [candidate_id("co2-capacity-router")],
        "Chemical Domino Graph": [candidate_id("chemical-domino-graph")],
        "Advanced Materials Qualification Network": [candidate_id("advanced-materials-qualification-network")],
    }
    score_map = {"DeepTech Lab Access OS": 95, "Brownfield PFAS Underwriter": 94, "CO2 Capacity Router / Carbon Corridor OS": 95, "Chemical Domino Graph": 94, "Advanced Materials Qualification Network": 92}
    gate_map = {spec[1]: spec[-1] for spec in CANDIDATES} | {
        "DeepTech Lab Access OS": "Manually compile ten experiment requirements into facility selection, contracting, booking, sample logistics, results, and IP receipts; test both startup and facility willingness to participate.",
        "CO2 Capacity Router / Carbon Corridor OS": next(spec[-1] for spec in CANDIDATES if spec[0] == "co2-capacity-router"),
    }
    validation = [{"rank": i + 1, "proposal": name, "analystProvisionalScore": score_map[name], "targetRefs": target_map[name], "nextGate": gate_map[name]} for i, name in enumerate(names)]
    run = {
        "runId": RUN_ID, "baselineCommit": BASELINE,
        "questions": ["Which of 25 proposals own a distinct capacity, qualification, topology, underwriting, or plan-to-project transition?", "Which live policy signals are adopted, voluntary, proposed, or long-window?", "Which proposals duplicate existing canonical or private records?"],
        "queries": ["industrial carbon management injection capacity", "technology infrastructure access charter", "Critical Chemicals Alliance", "Soil Monitoring Law PFAS", "Advanced Materials Act", "bio-based industry", "European Ocean Act", "AI Gigafactories", "Nature Restoration plans", "affordable housing", "Digital Networks Act", "multi-operator rail proposal", "rail capacity regulation", "SMR strategy", "OceanEye"],
        "sourceCandidates": [x[0] for x in SOURCES] + ["s148"], "inclusions": [candidate_id(x[0]) for x in CANDIDATES],
        "exclusions": [name for name, decision in DEDUPLICATION.items() if not decision["decision"].startswith("stage")],
        "claimsChanged": ["Fourteen distinct candidates staged; eleven proposals mapped to exact private families, modules, wedges, or watch layers.", "DeepTech Lab Access maps to the existing PilotLine Europe private candidate; Copper Retirement maps to CriticalLine Migration.", "The technology-infrastructure charter is voluntary, the Digital Networks Act is proposed, and SMR deployment remains an early-2030s strategy.", "Rail capacity rules are adopted, but the first optimized timetable is expected in December 2030.", "All scores and tiers remain provisional and non-ranking-eligible."],
        "deduplicationDecisions": DEDUPLICATION, "validationPriorityQueue": validation, "immediateExperiments": [{"rank": x["rank"], "proposal": x["proposal"], "targetRefs": x["targetRefs"]} for x in validation],
        "metaDiscoveries": ["capacity_as_api", "qualification_hidden_market", "plan_to_project_gap", "hidden_industrial_topology", "physical_evidence_beats_ai_content"],
        "researchBranches": ["scarce_capacity_markets", "qualification_graphs", "plan_to_project_infrastructure", "industrial_dependency_graphs", "underwrite_what_engineers_fear", "scarce_industrial_capacity"],
        "portfolioFamilies": ["european_deeptech_qualification_os", "european_industrial_capacity_exchange", "land_bankability_os", "industrial_bankability_os"],
        "newScoringDimensions": ["capacityCriticality", "qualificationReuse", "realityFeedback", "planToProjectGap"],
        "researchPasses": ["capacity", "reservation", "qualification", "physical_evidence", "plan_to_project", "topology", "underwriting", "current_access_method", "control_point", "counterparty", "evidence_gate", "reality_feedback"],
        "omegaXiiContribution": {"dependencyRecordsAdded": 6, "shockRecordsAdded": 5, "obligationRecordsAdded": 2, "ecosystemRecordsAdded": 6, "counterpartyAssessmentsAdded": 2, "completionClaim": False},
        "attachmentDeduplication": {"expansionVCopies": 2, "expansionVUniqueSha256": "8CC8B085708503C382BB8D0F822EA21E0351735B6F871E7EB2678DC5DFB1E2C7", "omegaXiiCopies": 3, "omegaXiiUniqueSha256": "AC87719C647B631DE841A5CBAE72B71E1A34EDED17B844EAFE3F3A1AB835B717"},
        "agent": "research-intelligence-agent", "methodVersion": "epistemic-v8-capacity-qualification-reality", "startedAt": NOW, "endedAt": NOW, "reviewStatus": "approved_for_private_staging_and_validation_not_canonical_promotion",
    }
    runs = read_json_safe(RUNS_PATH, default_if_missing=[])
    index = next((i for i, item in enumerate(runs) if item.get("runId") == RUN_ID), None)
    if index is None: runs.append(run)
    else: runs[index] = run

    atomic_write_json(SOURCES_PATH, sources); atomic_write_json(QUEUE_PATH, queue); atomic_write_json(RUNS_PATH, runs)
    update_shockgraph()
    print(f"[OK] Added {added_sources} primary sources, {added_candidates} staged candidates, recorded {RUN_ID}, and updated ShockGraph.")


if __name__ == "__main__":
    main()
