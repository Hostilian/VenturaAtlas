"""Ingest user-supplied Deep Research Expansion VI without promoting hypotheses."""

from __future__ import annotations

import os
import uuid

from va_runtime.atomic_io import atomic_write_json, read_json_safe


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE_PATH = os.path.join(ROOT, "data", "idea-staging-queue.json")
SOURCES_PATH = os.path.join(ROOT, "data", "sources.json")
RUNS_PATH = os.path.join(ROOT, "data", "research-runs.json")
SHOCK_PATH = os.path.join(ROOT, "data", "shockgraph.json")
RUN_ID = "run-res-008-20260812-expansion-vi"
NOW = "2026-08-12T19:30:00+00:00"
BASELINE = "460c7754b18139b4fcf5d9175cb9a761c98aa777"
ATTACHMENT_SHA256 = "B2B0F57F817EE550A8492E72A68697AE4BE3A1443B39C26750E289623895F951"
NAMESPACE = uuid.UUID("9a83153c-b454-48b3-aad9-0f7fcfa5af77")


SOURCES = [
    ("s170", "Guidelines on assurance continuity - practical change scenarios for certified ICT products", "European Union Agency for Cybersecurity", "https://certification.enisa.europa.eu/publications/guidelines-assurance-continuity-practical-change-scenarios-certified-ict-products_en", ["EUCC assurance-continuity guidance distinguishes minor and major product changes", "Prior evaluation work may or may not need to be repeated after a change"]),
    ("s171", "Addressing market challenges", "European Commission - DG HERA", "https://health.ec.europa.eu/health-emergency-preparedness-and-response-hera/preparedness/addressing-market-challenges_en", ["HERA maps supply chains, manufacturing capacity, and ever-warm sites", "EU FAB is intended to keep agile vaccine manufacturing capacity available for emergencies"]),
    ("s172", "Procurement and stockpiling", "European Commission - DG HERA", "https://health.ec.europa.eu/health-emergency-preparedness-and-response-hera/preparedness/procurement-and-stockpiling_en", ["HERA maps transport, storage, and distribution bottlenecks", "Strategic reserves are intended for timely emergency deployment"]),
    ("s173", "IP-backed finance in Europe: state of play and future perspectives", "European Union Intellectual Property Office", "https://www.euipo.europa.eu/en/publications/IP-backed-finance-in-Europe-state-of-play-and-future-perspectives", ["IP-rich firms face information asymmetry, uncertain value, weak secondary markets, and limited comparable data", "Valuation remains costly, complex, and inconsistent"]),
    ("s174", "Europe moves from analysis to action on IP-backed finance", "European Union Intellectual Property Office", "https://www.euipo.europa.eu/en/news/europe-moves-from-analysis-to-action-on-ip-backed-finance", ["The European IP-Backed Finance Roadmap was endorsed in June 2026", "Operational components are expected by the end of 2027; this is not current lending-market validation"]),
    ("s175", "Internal Market Emergency and Resilience Act", "European Commission - DG GROW", "https://single-market-economy.ec.europa.eu/single-market/internal-market-emergency-and-resilience-act_en", ["IMERA entered into application on 29 May 2026", "The framework addresses crisis-relevant goods and services while company demand for a private crisis-capacity OS remains unverified"]),
    ("s176", "Survey on an EU Blueprint for intellectual property licensing and spinoff creation", "European Commission - DG RTD", "https://research-and-innovation.ec.europa.eu/news/all-research-and-innovation-news/survey-eu-blueprint-intellectual-property-licensing-and-spinoff-creation-2026-07-17_en", ["The Commission is consulting on licensing, royalty sharing, equity participation, and academic spinoffs", "The Blueprint is expected by the end of 2026 and is not yet final"]),
    ("s177", "Sustainable transport investment plan", "European Commission - DG MOVE", "https://transport.ec.europa.eu/transport-themes/clean-transport/sustainable-transport-investment-plan_en", ["The plan seeks to unlock investment in renewable and low-carbon fuels", "Public support and planned auction mechanisms do not by themselves prove a private project's bankability"]),
    ("s178", "Construction Products Regulation", "European Commission - DG GROW", "https://single-market-economy.ec.europa.eu/sectors/construction/construction-products-regulation-cpr_en", ["Regulation EU 2024/3110 establishes the revised construction-products framework", "Its technical implementation does not validate automated reassessment decisions"]),
    ("s179", "Commission launches public consultation on the revision of the eInvoicing Directive", "European Commission - DG GROW", "https://single-market-economy.ec.europa.eu/news/commission-launches-public-consultation-revision-einvoicing-directive-2026-03-18_en", ["The Commission identified eInvoicing uptake and interoperability barriers", "The revision is still being prepared"]),
    ("s180", "Unfair trading practices", "European Commission - DG AGRI", "https://agriculture.ec.europa.eu/common-agricultural-policy/agri-food-supply-chain/unfair-trading-practices_en", ["EU rules prohibit specified practices including late payments and unilateral contract changes", "A ledger's evidentiary sufficiency and farmer willingness to pay remain unproven"]),
    ("s181", "ReFuelEU Aviation", "European Commission - DG MOVE", "https://transport.ec.europa.eu/transport-modes/air/environment/refueleu-aviation_en", ["Implementation requires collaboration among suppliers, airports, and airlines", "Airports must facilitate infrastructure for SAF delivery, storage, and refuelling"]),
    ("s182", "Public procurement", "European Commission - DG GROW", "https://single-market-economy.ec.europa.eu/single-market/public-procurement_en", ["The Commission is preparing a 2026 revision of public-procurement rules", "Sustainability, resilience, and Made in Europe criteria are policy direction, not a final revised framework"]),
    ("s183", "Critical Medicines Alliance", "European Commission - DG HERA", "https://health.ec.europa.eu/health-emergency-preparedness-and-response-hera/overview/critical-medicines-alliance_en", ["The Alliance highlights vulnerabilities in critical-medicine and API supply chains", "Recommendations include diversification, manufacturing, procurement, and balanced stockpiling"]),
]


# slug, name, score, category, sources, adjacency, priority, concept, customer, problem, build, gate
CANDIDATES = [
    ("cyber-assurance-continuity-os", "Cyber Assurance Continuity OS", 96, "Cybersecurity Assurance Continuity", ["s170"], ["idea-401", "candidate-5797eef1-9320-5f18-ac18-4acd582dc221"], "immediate_validation", "Certificate-aware change-impact and release-control system for maintaining cybersecurity assurance after product changes.", "EUCC-certified product vendors, evaluation facilities, certification bodies, and security engineering teams", "Code, dependency, configuration, and environment changes can invalidate or require reassessment of previously certified evidence.", "Link repositories, certified targets, security claims, evidence, assessor decisions, and release gates; compute an explainable certification-impact diff without asserting regulator approval.", "Connect one real product repository to one EUCC target and have qualified assessors grade affected-evidence recall, precision, and false-safe decisions."),
    ("medical-countermeasure-readiness-os", "Medical Countermeasure Readiness OS", 95, "Emergency Manufacturing Readiness", ["s171", "s172"], ["idea-377"], "immediate_validation", "Continuous activation-readiness model for reserved medical-countermeasure production capacity.", "HERA-aligned procurers, vaccine and therapeutic manufacturers, emergency planners, and capacity-reservation sponsors", "Reserved or ever-warm capacity can decay as people, inputs, equipment, permits, validation state, and supply chains change.", "Maintain line-level readiness state, run digital activation exercises, ingest physical drill results, and predict time and blockers to qualified output.", "Model one production line, run a bounded activation exercise, and compare predicted activation time and blockers with observed results."),
    ("ip-collateral-underwriter", "IP Collateral Underwriter", 93, "IP-Backed Finance", ["s173", "s174"], ["idea-333"], "immediate_validation", "Recovery-scenario, advance-rate, and collateral-monitoring engine for patents, code, trademarks, data, and licensing assets.", "Specialty lenders, guarantee institutions, IP-rich SMEs, investors, restructuring professionals, and insurers", "Static valuations do not tell a lender how much to advance, how collateral decays, or what can be recovered in orderly and liquidation scenarios.", "Model title, encumbrances, jurisdiction, market dependency, code and data transferability, revenue, enforcement, saleability, monitoring covenants, and recovery distributions.", "Underwrite 25 anonymized patent or software portfolios and test whether lenders find recovery, covenant, and advance-rate outputs decision-useful."),
    ("imera-crisis-capacity-os", "IMERA Crisis Capacity OS", 95, "Strategic Goods Crisis Operations", ["s175"], ["idea-373"], "immediate_validation", "Crisis-mode production compiler turning strategic-goods demand into executable plant, material, labour, quality, and allocation plans.", "Manufacturers of crisis-relevant goods, public emergency authorities, industrial planners, and strategic suppliers", "Normal production commitments and crisis orders collide across constrained lines, materials, tooling, people, quality release, logistics, and customer allocation.", "Compile crisis scenarios into capacity choices, substitutions, changeovers, supplier actions, regulatory evidence, conflict resolution, exercises, and decision receipts.", "Simulate one crisis-demand scenario at a manufacturer and measure whether planners discover unmodelled blockers and produce a feasible activation plan."),
    ("university-spinout-deal-os", "University Spinout Deal OS", 94, "Research Commercialisation", ["s176"], [], "immediate_validation", "Transaction workspace joining academic IP ownership, licence terms, equity, royalties, funding, approvals, and closing evidence.", "University technology-transfer offices, research organisations, founders, investors, funders, and legal advisers", "Scientific spinouts are delayed by fragmented ownership, background IP, inventor and funder rights, licence economics, equity, royalties, approvals, and negotiation history.", "Create a permissioned deal graph, model term interactions, surface conflicts, preserve decisions, and compile reviewable closing documents from approved state.", "Model 20 completed or anonymized university licence and spinout transactions; test cycle-time, issue discovery, and acceptance with TTOs and investors."),
    ("esaf-offtake-bankability", "eSAF Offtake Bankability Engine", 93, "Sustainable Fuel Project Finance", ["s177", "s181"], ["idea-405", "candidate-9458dea6-f31b-550d-b9c8-ea021f5d3c39"], "immediate_validation", "Contract-stack and downside engine for determining whether an eSAF project has financeable revenue and deliverability.", "eSAF developers, airlines, fuel suppliers, airports, infrastructure funds, lenders, insurers, and public-support providers", "Short buyer commitments, public auctions, power and feedstock risk, certification, airport delivery, credit support, and price gaps can leave nominal demand unfinanceable.", "Model offtakes, public support, duration, volume, price, power, hydrogen and carbon inputs, technology, credit, certification, airport logistics, and downside cases.", "Reconstruct ten eSAF project contract stacks and ask project-finance practitioners to distinguish credible FID paths from structurally weak projects."),
    ("strategic-api-stockpile-rotation", "Strategic API Stockpile Rotation OS", 94, "Critical Medicine Reserves", ["s172", "s183"], ["idea-377"], "immediate_validation", "Expiry-aware rotation and medicine-conversion system for active-pharmaceutical-ingredient strategic reserves.", "Health authorities, hospital and national procurers, API and medicine manufacturers, wholesalers, and reserve operators", "Static reserves lose value through expiry, demand shifts, packaging and quality changes, and inability to convert API into deployable medicine during a crisis.", "Track lot identity, shelf life, quality state, demand, release and conversion paths; optimize commercial rotation while preserving emergency coverage.", "Optimize one real or representative inventory portfolio and measure expiry reduction, emergency coverage, and operational feasibility with reserve owners."),
    ("construction-certification-delta-ci", "Construction Certification Delta CI", 93, "Construction Product Change Assurance", ["s178"], ["idea-175", "idea-394", "candidate-5797eef1-9320-5f18-ac18-4acd582dc221"], "immediate_validation", "BOM-and-technical-file change-impact CI for construction-product conformity evidence.", "Construction-product manufacturers, notified bodies, technical-assessment bodies, quality teams, and specifiers", "Material, supplier, design, process, intended-use, and standards changes can alter performance claims and reassessment needs while evidence remains document-bound.", "Connect PLM and technical files to declared performance, test evidence, standards, notified-body scope, and change decisions; flag review needs without automating legal acceptance.", "Ingest one product BOM, technical file, and engineering revision; compare reassessment findings with qualified reviewers."),
    ("critical-medicine-source-change-compiler", "Critical-Medicine Source-Change Compiler", 92, "Pharmaceutical Supply Qualification", ["s183"], ["idea-377"], "full_validation", "Evidence and execution compiler taking an alternate critical-medicine supplier from candidate to qualified source.", "Pharmaceutical manufacturers, marketing-authorisation holders, API producers, quality teams, and health authorities", "An alternate supplier is not crisis-usable until quality, process, analytical, stability, regulatory, technical-transfer, and supply evidence is complete.", "Map source-change requirements, gaps, testing, batches, comparability, regulatory actions, approvals, and readiness; maintain an emergency-qualified alternate graph.", "Replay two completed source changes and one candidate alternate; measure missing-requirement detection, cycle-time prediction, and false readiness."),
    ("einvoice-semantic-repair-gateway", "eInvoice Semantic Repair Gateway", 91, "Cross-Border eInvoicing", ["s179"], ["idea-215", "candidate-f97bf26a-9e2b-4ae7-991f-d2279e8c6820"], "competitive_validation", "Explainable semantic repair and interoperability gateway for non-conforming cross-border eInvoices.", "ERP vendors, Peppol access points, multinational finance teams, public buyers, and eInvoicing service providers", "Syntactically valid invoices can still fail semantic, code-list, tax, buyer-rule, and cross-network requirements.", "Validate against versioned rules, propose traceable repairs, preserve the original, and learn only from accepted corrections; do not silently rewrite financial records.", "Replay 1,000 rejected invoices across three jurisdictions and compare safe repair rate, false repairs, latency, and incumbent alternatives."),
    ("agri-contract-evidence-ledger", "Agri Contract Evidence Ledger", 90, "Agri-Food Trading Evidence", ["s180"], [], "full_validation", "Tamper-evident event and contract ledger for assessing specified EU unfair-trading-practice patterns.", "Producer organisations, cooperatives, food suppliers, enforcement advisers, and agri-finance or legal-support providers", "Orders, cancellations, payment clocks, deductions, unilateral changes, retaliation, and agreed grey practices are fragmented across messages, ERP data, and contracts.", "Normalize agreements and events, preserve source evidence, compute review flags under jurisdiction-specific rules, and export an adviser-ready chronology without making legal determinations.", "Reconstruct 50 resolved disputes or reviewed scenarios and test evidentiary completeness, classification disagreement, supplier trust, and payer economics."),
    ("refurbished-construction-requalification", "Refurbished Construction Requalification Network", 88, "Circular Construction Products", ["s178"], ["idea-175", "idea-269"], "standards_watch_validation", "Identity, condition, test, transformation, and scoped performance evidence for used and remanufactured construction products.", "Deconstruction operators, reuse marketplaces, testing bodies, product manufacturers, designers, contractors, and insurers", "Recovered products lack consistent evidence connecting prior use, deinstallation, condition, repair or remanufacture, intended use, and applicable technical specifications.", "Maintain product identity, chain of custody, inspection, transformation, tests, declarations, applicability, and expiry; preserve evolving technical-specification boundaries.", "Requalify one narrow product class across 30 items with a testing body and insurer; kill if standards or liability make reusable evidence non-portable."),
]


DEDUPLICATION = {
    "Cyber Assurance Continuity OS": {"decision": "stage_distinct_assurance_continuity", "targets": []},
    "Medical Countermeasure Readiness OS": {"decision": "stage_distinct_activation_readiness", "targets": ["idea-377"]},
    "IP Collateral Underwriter": {"decision": "stage_distinct_recovery_underwriting", "targets": []},
    "IMERA Crisis Capacity OS": {"decision": "stage_distinct_crisis_production", "targets": ["idea-373"]},
    "University Spinout Deal OS": {"decision": "stage_distinct_transaction_system", "targets": []},
    "eSAF Offtake Bankability Engine": {"decision": "stage_distinct_project_bankability", "targets": ["idea-405", "candidate-9458dea6-f31b-550d-b9c8-ea021f5d3c39"]},
    "Strategic API Stockpile Rotation OS": {"decision": "stage_distinct_inventory_rotation", "targets": ["idea-377"]},
    "Construction Certification Delta CI": {"decision": "stage_vertical_change_assurance", "targets": ["candidate-5797eef1-9320-5f18-ac18-4acd582dc221", "idea-175", "idea-394"]},
    "Critical-Medicine Source-Change Compiler": {"decision": "stage_distinct_source_qualification", "targets": ["idea-377"]},
    "Cyber Assurance Reuse Graph": {"decision": "module_of_cyber_assurance_continuity", "targets": []},
    "Academic IP Clean-Title Graph": {"decision": "module_of_spinout_and_ip_underwriting", "targets": []},
    "Innovation Procurement Qualification Passport": {"decision": "exact_private_and_canonical_family", "targets": ["candidate-9ece6f52-f118-56cd-ac52-4958c6bc6f49", "idea-211", "idea-265"]},
    "eInvoice Semantic Repair Gateway": {"decision": "stage_distinct_semantic_repair", "targets": ["idea-215", "candidate-f97bf26a-9e2b-4ae7-991f-d2279e8c6820"]},
    "Agri Contract Evidence Ledger": {"decision": "stage_distinct_utp_evidence", "targets": []},
    "Refurbished Construction Requalification Network": {"decision": "stage_distinct_used_product_requalification", "targets": ["idea-175", "idea-269"]},
    "Cyber Assessment Capacity Router": {"decision": "module_of_assurance_graph_and_test_capacity", "targets": ["idea-294"]},
    "SAF Airport Deliverability Router": {"decision": "module_of_esaf_bankability", "targets": []},
    "Emergency Supplier Qualification Graph": {"decision": "module_of_strategic_health_manufacturing", "targets": ["idea-377"]},
    "Public Procurement Evidence Compiler": {"decision": "exact_existing_procurement_family", "targets": ["candidate-9ece6f52-f118-56cd-ac52-4958c6bc6f49", "idea-211", "idea-265"]},
    "IP Royalty Underwriting Engine": {"decision": "module_of_ip_collateral_underwriter", "targets": ["idea-333"]},
}


def candidate_id(slug: str) -> str:
    return f"candidate-{uuid.uuid5(NAMESPACE, slug)}"


def make_candidate(spec: tuple) -> dict:
    slug, name, score, category, sources, adjacent, priority, concept, customer, problem, build, gate = spec
    cid = candidate_id(slug)
    return {
        "schemaVersion": "2.0.0", "id": cid, "candidateId": cid, "candidateSlug": slug, "slug": f"{slug}-{cid}", "name": name,
        "oneSentenceConcept": concept, "elevatorPitch": f"{problem} {build}", "detailedDescription": concept, "category": category,
        "subcategory": "continuity, readiness, underwriting, qualification, or commercialisation infrastructure",
        "tags": ["august-2026", "expansion-vi", "state-continuity", "customer-evidence-unproven"], "status": "staged",
        "evidenceStatus": "forcing_function_verified_customer_demand_unproven", "promotionEligible": False, "requiresExternalEvidence": True,
        "sourceReferences": sources,
        "provenance": {"sourceType": "VenturaAtlas Deep Research Expansion VI - user supplied", "researchRunId": RUN_ID, "originalWordingAvailable": "private-attachment", "notes": "Attachment scores, demand, pricing, recovery, readiness, legal conclusions, and outcome claims remain hypotheses."},
        "atAGlance": {"targetCustomer": customer, "problemSolved": problem, "whatToBuild": build, "howItMakesMoney": None, "whyCustomersPay": None, "estimatedEarningPotential": None, "startupCost": None, "overallScore": None, "confidenceScore": None, "mainAdvantage": "Maintains or proves a valuable state as products, factories, inventories, counterparties, and contracts change.", "mainRisk": "False assurance, expert and counterparty dependence, official capture, data access, liability, and paid demand remain unvalidated.", "bestNextValidationStep": gate},
        "researchAssessment": {"analystProvisionalOpportunityScore": score, "scoreScale": "0-100", "scoreStatus": "provisional_not_ranking_eligible", "priorityClass": priority, "adjacentCanonicalOrCandidateRefs": adjacent, "scoringDimensionsToMeasure": ["stateDecay", "activationReadiness", "assuranceDebt", "durationMismatch", "recoveryQuality", "evidenceReuse", "officialCaptureRisk", "counterpartyReadiness"]},
        "validationChecklist": {"gateStatus": "needs_customer_validation", "passed": False, "passedCount": 2, "failedCount": 0, "unknownCount": 6, "totalCriteria": 8, "scorePercentage": 25, "details": {"Forcing function verified": "pass", "Semantic duplicate review completed": "pass", "Representative workflow confirmed": "unknown", "Representative evidence obtained": "unknown", "Qualified expert outcome comparison": "unknown", "Paid willingness to pay": "unknown", "False-assurance boundary tested": "unknown", "Counterparty participation tested": "unknown"}},
        "killCriteria": {"killFlagged": False, "killCount": 0, "killConditions": {"No repeated state-decay failure in 15 interviews": False, "No access to representative evidence": False, "Qualified reviewers reject safe automation boundary": False, "Official or incumbent system owns the control point": False, "No paid design partner after 30 qualified outreaches": False}, "killFlags": []},
        "createdAt": NOW, "updatedAt": NOW, "prioritizedForValidation": priority == "immediate_validation", "reviewPriority": "urgent" if priority == "immediate_validation" else "medium", "priority": score,
    }


def upsert_by_id(items: list[dict], record: dict, key: str) -> None:
    index = next((i for i, item in enumerate(items) if item.get(key) == record[key]), None)
    if index is None:
        items.append(record)
    else:
        items[index] = record


def update_shockgraph() -> None:
    graph = read_json_safe(SHOCK_PATH, default_if_missing={})
    dependencies = [
        {"dependencyId": "dep-eucc-assurance-continuity", "type": "STANDARD", "name": "EUCC assurance-continuity rules and guidance", "status": "OPERATIONAL_GUIDANCE_2025-12-10", "checkedAt": NOW, "sourceRefs": ["s170"], "ideaRefs": ["idea-401"], "volatility": "MEDIUM"},
        {"dependencyId": "dep-eu-medical-countermeasure-readiness", "type": "INFRASTRUCTURE", "name": "HERA ever-warm manufacturing and strategic stockpile readiness", "status": "ACTIVE_PROGRAM", "checkedAt": NOW, "sourceRefs": ["s171", "s172", "s183"], "ideaRefs": ["idea-377"], "volatility": "HIGH"},
        {"dependencyId": "dep-eu-ip-backed-finance-roadmap", "type": "STANDARD", "name": "European IP-Backed Finance Roadmap", "status": "ROADMAP_ENDORSED_OPERATIONAL_COMPONENTS_EXPECTED_2027", "checkedAt": NOW, "sourceRefs": ["s173", "s174"], "ideaRefs": ["idea-333"], "volatility": "HIGH"},
        {"dependencyId": "dep-eu-imera", "type": "REGULATION", "name": "Internal Market Emergency and Resilience Act", "status": "IN_APPLICATION_SINCE_2026-05-29", "checkedAt": NOW, "sourceRefs": ["s175"], "ideaRefs": ["idea-373"], "volatility": "MEDIUM"},
        {"dependencyId": "dep-eu-construction-products-2024-3110", "type": "REGULATION", "name": "Revised Construction Products Regulation EU 2024/3110", "status": "IN_FORCE_PHASED_IMPLEMENTATION", "checkedAt": NOW, "sourceRefs": ["s178"], "ideaRefs": ["idea-175", "idea-394"], "volatility": "MEDIUM"},
        {"dependencyId": "dep-eu-refueleu-aviation", "type": "REGULATION", "name": "ReFuelEU Aviation supply-chain and airport infrastructure obligations", "status": "IN_APPLICATION", "checkedAt": NOW, "sourceRefs": ["s181"], "ideaRefs": ["idea-405"], "volatility": "MEDIUM"},
    ]
    for record in dependencies:
        upsert_by_id(graph["dependencies"], record, "dependencyId")
    shocks = [
        {"shockId": "shock-eucc-assurance-continuity-guidance", "dependencyId": "dep-eucc-assurance-continuity", "kind": "STANDARD_FINALIZED", "observedAt": NOW, "effectiveAt": "2025-12-10T00:00:00Z", "sourceRefs": ["s170"], "affectedIdeaRefs": ["idea-401"], "direction": "POSITIVE", "reviewRequired": True},
        {"shockId": "shock-imera-application-start", "dependencyId": "dep-eu-imera", "kind": "APPLICATION_START", "observedAt": NOW, "effectiveAt": "2026-05-29T00:00:00Z", "sourceRefs": ["s175"], "affectedIdeaRefs": ["idea-373"], "direction": "POSITIVE", "reviewRequired": True},
    ]
    for record in shocks:
        upsert_by_id(graph["shocks"], record, "shockId")
    ecosystems = [
        {"ecosystemId": "eco-eucc-assurance-continuity", "name": "EUCC vendors, evaluators, and certification bodies", "topology": "CERTIFIED_INTERMEDIARIES", "providerDensity": "UNKNOWN", "stage": "EARLY_ADOPTION", "sourceRefs": ["s170"], "ideaRefs": ["idea-401"]},
        {"ecosystemId": "eco-medical-countermeasure-readiness", "name": "EU emergency medical manufacturing and reserve network", "topology": "MULTI_PARTY_SUPPLY_CHAIN", "providerDensity": "CONSOLIDATING", "stage": "EARLY_ADOPTION", "sourceRefs": ["s171", "s172", "s183"], "ideaRefs": ["idea-377"]},
        {"ecosystemId": "eco-ip-backed-finance", "name": "European IP-backed finance ecosystem", "topology": "CERTIFIED_INTERMEDIARIES", "providerDensity": "EARLY", "stage": "SPEC_FORMING", "sourceRefs": ["s173", "s174"], "ideaRefs": ["idea-333"]},
        {"ecosystemId": "eco-crisis-capacity-imera", "name": "IMERA crisis-relevant goods production network", "topology": "MULTI_PARTY_SUPPLY_CHAIN", "providerDensity": "UNKNOWN", "stage": "MANDATORY_TRANSITION", "sourceRefs": ["s175"], "ideaRefs": ["idea-373"]},
        {"ecosystemId": "eco-saf-airport-delivery", "name": "SAF producers, suppliers, airports, and aircraft operators", "topology": "PHYSICAL_NETWORK", "providerDensity": "EARLY", "stage": "MANDATORY_TRANSITION", "sourceRefs": ["s177", "s181"], "ideaRefs": ["idea-405"]},
    ]
    for record in ecosystems:
        upsert_by_id(graph["ecosystems"], record, "ecosystemId")
    assessments = [
        {"assessmentId": "cp-medicine-resilience-readiness", "ideaId": "idea-377", "parties": [{"role": "public procurer or reserve owner", "mustParticipate": True, "canBeForced": True, "controlsData": True, "controlsDecision": True, "controlsBudget": True, "readiness": "UNKNOWN"}, {"role": "manufacturer or API supplier", "mustParticipate": True, "canBeForced": False, "controlsData": True, "controlsDecision": True, "controlsBudget": False, "readiness": "UNKNOWN"}], "coordinationTax": "HIGH", "weakestCriticalParty": "manufacturer or API supplier", "sourceRefs": ["s171", "s172", "s183"]},
        {"assessmentId": "cp-refueleu-deliverability", "ideaId": "idea-405", "parties": [{"role": "fuel producer or supplier", "mustParticipate": True, "canBeForced": False, "controlsData": True, "controlsDecision": True, "controlsBudget": True, "readiness": "UNKNOWN"}, {"role": "airport managing body", "mustParticipate": True, "canBeForced": True, "controlsData": True, "controlsDecision": True, "controlsBudget": True, "readiness": "UNKNOWN"}, {"role": "aircraft operator or offtaker", "mustParticipate": True, "canBeForced": True, "controlsData": True, "controlsDecision": True, "controlsBudget": True, "readiness": "UNKNOWN"}], "coordinationTax": "HIGH", "weakestCriticalParty": None, "sourceRefs": ["s177", "s181"]},
    ]
    for record in assessments:
        upsert_by_id(graph["counterpartyAssessments"], record, "assessmentId")
    atomic_write_json(SHOCK_PATH, graph)


def main() -> None:
    sources = read_json_safe(SOURCES_PATH, default_if_missing=[])
    urls = {str(item.get("url", "")).rstrip("/") for item in sources}
    ids = {item.get("id") for item in sources}
    added_sources = 0
    for sid, title, publisher, url, supports in SOURCES:
        if url.rstrip("/") in urls:
            continue
        if sid in ids:
            raise RuntimeError(f"Source ID collision: {sid}")
        sources.append({"id": sid, "title": title, "publisher": publisher, "url": url, "supports": supports, "type": "official_or_primary_evidence", "date": "2026", "accessDate": "2026-08-12", "confidenceLabel": "high", "sourceType": "primary", "researchRound": "deep-research-expansion-vi-2026-08-12", "ideaIds": [], "visibility": "PUBLIC", "sourceClass": "PRIMARY_OR_OFFICIAL", "evidenceEligible": True, "provenanceEligible": True})
        urls.add(url.rstrip("/")); ids.add(sid); added_sources += 1

    queue = read_json_safe(QUEUE_PATH, default_if_missing=[])
    by_slug = {item.get("candidateSlug") or item.get("slug"): i for i, item in enumerate(queue)}
    added_candidates = 0
    for spec in CANDIDATES:
        candidate, slug = make_candidate(spec), spec[0]
        if slug in by_slug:
            index = by_slug[slug]
            if queue[index].get("provenance", {}).get("researchRunId") == RUN_ID:
                queue[index] = candidate
            continue
        queue.append(candidate); by_slug[slug] = len(queue) - 1; added_candidates += 1

    target_by_name = {spec[1]: [candidate_id(spec[0])] for spec in CANDIDATES}
    validation_names = ["Cyber Assurance Continuity OS", "University Spinout Deal OS", "IP Collateral Underwriter", "Medical Countermeasure Readiness OS", "Strategic API Stockpile Rotation OS", "Construction Certification Delta CI", "eSAF Offtake Bankability Engine", "IMERA Crisis Capacity OS"]
    score_by_name = {spec[1]: spec[2] for spec in CANDIDATES}
    gate_by_name = {spec[1]: spec[-1] for spec in CANDIDATES}
    validation = [{"rank": rank, "proposal": name, "analystProvisionalScore": score_by_name[name], "targetRefs": target_by_name[name], "nextGate": gate_by_name[name]} for rank, name in enumerate(validation_names, 1)]
    run = {
        "runId": RUN_ID, "baselineCommit": BASELINE,
        "questions": ["Which of twenty proposals own a distinct continuity, readiness, underwriting, qualification, or commercialisation transition?", "Which proposals are modules or exact matches for existing canonical/private families?", "Which 2026 policy signals are operational, in application, under consultation, or still forthcoming?"],
        "queries": ["EUCC assurance continuity", "HERA ever-warm readiness stockpiling", "EUIPO IP-backed finance", "IMERA application", "academic spinout blueprint", "eSAF investment and ReFuelEU", "construction products regulation used products", "eInvoicing revision", "agri-food unfair trading practices", "public procurement revision"],
        "sourceCandidates": [item[0] for item in SOURCES], "inclusions": [candidate_id(spec[0]) for spec in CANDIDATES],
        "exclusions": [name for name, decision in DEDUPLICATION.items() if not decision["decision"].startswith("stage")],
        "claimsChanged": ["Twelve distinct candidates staged; eight proposals mapped to modules or exact existing families.", "EUCC assurance continuity and IMERA application are operational forcing functions; the spinout Blueprint, procurement revision, and eInvoicing revision are still developing.", "HERA and ReFuelEU confirm multi-party readiness and delivery dependencies, not customer demand for these products.", "IP-backed finance has an endorsed roadmap and structural barriers, but lender adoption, recovery data, and advance rates remain unverified.", "All scores and tiers remain analyst hypotheses and are not ranking eligible."],
        "deduplicationDecisions": DEDUPLICATION, "validationPriorityQueue": validation, "immediateExperiments": [{"rank": item["rank"], "proposal": item["proposal"], "targetRefs": item["targetRefs"], "nextGate": item["nextGate"]} for item in validation],
        "killAndDowngradeDecisions": {"Generic cybersecurity certification dashboard": "kill_authoritative_portal_exists", "Generic medical stockpile dashboard": "kill_gap_is_readiness_not_inventory", "Generic IP valuation PDF": "kill_need_underwriting_not_report", "Academic spinout document generator": "downgrade_transaction_state_is_moat", "Generic SAF marketplace": "kill_public_intermediation_emerging", "Public procurement opportunity search": "crowded_existing_family"},
        "metaDiscoveries": ["continuity_is_a_startup_category", "reserve_is_not_ready", "assurance_debt", "intangible_to_bankable", "research_commercialisation_infrastructure", "crisis_readiness_option_value", "contract_duration_mismatch"],
        "portfolioFamilies": {"AssuranceGraph": [candidate_id("cyber-assurance-continuity-os"), "module:cyber-assurance-reuse-graph"], "Strategic Health Manufacturing OS": [candidate_id("medical-countermeasure-readiness-os"), candidate_id("strategic-api-stockpile-rotation"), candidate_id("critical-medicine-source-change-compiler")], "Lab-to-Industry OS": [candidate_id("university-spinout-deal-os"), candidate_id("ip-collateral-underwriter"), "candidate-2fa25465-2747-46b7-a7db-530949f7c070", "candidate-82e94c00-be1b-52f9-a6b4-4e78085bc4cd"]},
        "newScoringDimensions": ["stateDecay"],
        "researchPasses": ["state_creation", "state_decay", "reserved_vs_ready", "state_transition", "qualification", "duration_mismatch", "collateral_conversion", "evidence_reuse", "reality_feedback", "option_value", "official_capture_risk", "system_of_record_gravity"],
        "omegaXiiContribution": {"dependencyRecordsAdded": 6, "shockRecordsAdded": 2, "obligationRecordsAdded": 0, "ecosystemRecordsAdded": 5, "counterpartyAssessmentsAdded": 2, "completionClaim": False},
        "attachment": {"sha256": ATTACHMENT_SHA256, "bytes": 60085, "lines": 2439, "copiesProcessed": 1},
        "agent": "research-intelligence-agent", "methodVersion": "epistemic-v9-continuity-readiness-bankability", "startedAt": NOW, "endedAt": NOW, "reviewStatus": "approved_for_private_staging_and_validation_not_canonical_promotion",
    }
    runs = read_json_safe(RUNS_PATH, default_if_missing=[])
    index = next((i for i, item in enumerate(runs) if item.get("runId") == RUN_ID), None)
    if index is None:
        runs.append(run)
    else:
        runs[index] = run

    atomic_write_json(SOURCES_PATH, sources)
    atomic_write_json(QUEUE_PATH, queue)
    atomic_write_json(RUNS_PATH, runs)
    update_shockgraph()
    print(f"[OK] Added {added_sources} primary sources, {added_candidates} private candidates, {RUN_ID}, and bounded ShockGraph deltas.")


if __name__ == "__main__":
    main()
