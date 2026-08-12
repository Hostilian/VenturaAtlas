"""Ingest the 12 August 2026 fresh-opportunity deep-research round.

The supplied document ranks twenty proposals. This writer verifies forcing
functions, records a decision for every proposal, stages only distinct concepts,
and keeps all analyst scores outside canonical ranking authority.
"""

from __future__ import annotations

import os
import uuid

from va_runtime.atomic_io import atomic_write_json, read_json_safe


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE_PATH = os.path.join(ROOT, "data", "idea-staging-queue.json")
SOURCES_PATH = os.path.join(ROOT, "data", "sources.json")
RUNS_PATH = os.path.join(ROOT, "data", "research-runs.json")
RUN_ID = "run-res-004-20260812-fresh-opportunity-round"
NAMESPACE = uuid.UUID("6ac58298-e19e-49e8-a876-dd71758fefc9")
NOW = "2026-08-12T15:00:00+00:00"


SOURCES = [
    {
        "id": "s109",
        "title": "Observability for Delegated Execution in Agentic AI Systems",
        "publisher": "arXiv - Abhinav Mishra and Kumar Sharad",
        "url": "https://arxiv.org/abs/2606.09692",
        "supports": [
            "Standard logs cannot reliably reconstruct which heterogeneous actions occurred under a delegation",
            "A gateway and shared information model can bind delegation context at execution time",
        ],
        "type": "primary_research",
        "date": "2026-06-08",
    },
    {
        "id": "s110",
        "title": "Data Act explained",
        "publisher": "European Commission - DG CONNECT",
        "url": "https://digital-strategy.ec.europa.eu/en/factpages/data-act-explained",
        "supports": [
            "The Data Act includes cloud-switching and functional-equivalence duties",
            "Switching charges including data-egress charges are removed from 12 January 2027",
        ],
        "type": "official_guidance",
        "date": "2026",
    },
    {
        "id": "s111",
        "title": "New EU rules to stop the destruction of unsold clothes and shoes",
        "publisher": "European Commission - DG Environment",
        "url": "https://environment.ec.europa.eu/news/new-eu-rules-stop-destruction-unsold-clothes-and-shoes-2026-02-09_en",
        "supports": [
            "The ESPR ban and its derogations apply to large companies from 19 July 2026",
            "Resale, remanufacturing, donation, reuse, returns handling, and justified destruction exceptions create disposition workflows",
        ],
        "type": "official_guidance",
        "date": "2026-02-09",
    },
    {
        "id": "s112",
        "title": "EU reinforces its cybersecurity with post-quantum cryptography",
        "publisher": "European Commission - DG CONNECT",
        "url": "https://digital-strategy.ec.europa.eu/en/news/eu-reinforces-its-cybersecurity-post-quantum-cryptography",
        "supports": [
            "All Member States should start transitioning to post-quantum cryptography by the end of 2026",
            "Critical infrastructure should complete transition as soon as possible and no later than the end of 2030",
        ],
        "type": "official_guidance",
        "date": "2025-06-23",
    },
    {
        "id": "s113",
        "title": "EU sets the first voluntary standard for permanent carbon removals",
        "publisher": "European Commission - DG Climate Action",
        "url": "https://climate.ec.europa.eu/news-other-reads/news/eu-sets-worlds-first-voluntary-standard-permanent-carbon-removals-2026-02-03_en",
        "supports": [
            "The first CRCF permanent-removal methodologies cover DACCS, BioCCS, and biochar carbon removal",
            "The methodologies define quantification, permanence, leakage, liability, and certification requirements",
        ],
        "type": "official_guidance",
        "date": "2026-02-03",
    },
    {
        "id": "s114",
        "title": "Proposal for a public interface for the declaration of posting of workers",
        "publisher": "European Commission / EUR-Lex",
        "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52024PC0531",
        "supports": [
            "The proposal would create a multilingual IMI-connected public interface for posting declarations",
            "Participation would be voluntary for Member States, so proposal timing is not treated as enacted-law certainty",
        ],
        "type": "official_legislative_proposal",
        "date": "2024-11-13",
    },
    {
        "id": "s115",
        "title": "Simpler digital rules to help EU businesses grow",
        "publisher": "European Commission - DG Communication",
        "url": "https://commission.europa.eu/news-and-media/news/simpler-digital-rules-help-eu-businesses-grow-2025-11-19_en",
        "supports": [
            "The proposed European Business Wallet would support digital signing, timestamps, seals, verified documents, and secure exchange",
            "The wallet remains a legislative proposal and is not treated as a current mandate",
        ],
        "type": "official_legislative_proposal",
        "date": "2025-11-19",
    },
    {
        "id": "s116",
        "title": "European Steel and Metals Action Plan",
        "publisher": "European Commission - DG GROW",
        "url": "https://single-market-economy.ec.europa.eu/document/download/7807ca8b-10ce-4ee2-9c11-357afe163190_en?filename=Communication+-+Steel+and+Metals+Action+Plan.pdf",
        "supports": [
            "The Commission identifies refined scrap-quality classifications as necessary for matching secondary-material supply and demand",
            "Policy support for secondary-material markets does not prove a paid quality-graph business",
        ],
        "type": "official_strategy",
        "date": "2025-03-19",
    },
    {
        "id": "s117",
        "title": "Regulation (EU) 2024/1028 on short-term accommodation rental data",
        "publisher": "European Union / EUR-Lex",
        "url": "https://eur-lex.europa.eu/legal-content/en/LSU/?uri=CELEX:32024R1028",
        "supports": [
            "The short-term accommodation rental data regulation applies from 20 May 2026",
            "Where registration systems exist, hosts, platforms, authorities, registration numbers, and national digital entry points form a fragmented operational workflow",
        ],
        "type": "official_law",
        "date": "2024-04-11",
    },
    {
        "id": "s118",
        "title": "The 2030 Consumer Agenda",
        "publisher": "European Commission - DG Communication",
        "url": "https://commission.europa.eu/news-and-media/news/2030-consumer-agenda-strengthening-consumer-protection-competitiveness-and-sustainable-growth-2025-11-19_en",
        "supports": [
            "The Commission announced a Digital Fairness Act proposal for 2026",
            "The proposal is not enacted, so it supports watch-and-test activity rather than a compliance-deadline claim",
        ],
        "type": "official_strategy",
        "date": "2025-11-19",
    },
    {
        "id": "s119",
        "title": "Financing building renovations",
        "publisher": "European Commission - DG Energy",
        "url": "https://energy.ec.europa.eu/topics/energy-efficiency/financing/financing-building-renovations_en",
        "supports": [
            "The revised EPBD adds common data instruments and a framework intended to increase renovation lending",
            "Public support, technical assistance, and private lending are separate inputs that still require country-specific underwriting validation",
        ],
        "type": "official_guidance",
        "date": "2026",
    },
]


CANDIDATES = [
    {
        "slug": "agent-action-flight-recorder",
        "name": "Agent Action Flight Recorder",
        "score": 97,
        "category": "AI Agent Security & Governance",
        "concept": "Tamper-evident execution gateway that binds principal, delegation, authority, tool, resource, and side effect for every consequential AI-agent action.",
        "customer": "Enterprise security, platform engineering, internal audit, and regulated AI-agent teams",
        "problem": "Ordinary agent traces record calls but cannot reliably answer which cross-system side effects occurred under a particular delegated authority.",
        "build": "Wrap MCP, HTTP, browser, database, shell, email, and payment tools with delegation-scoped action receipts, side-effect capture, revocation state, and forensic queries.",
        "sources": ["s109"],
        "adjacent": ["idea-341", "idea-347"],
        "priority": "prototype_1",
        "next_gate": "Interview 15 enterprise security and platform teams; replay five agent incidents and prove that delegation-scoped reconstruction adds evidence their observability stack cannot supply.",
    },
    {
        "slug": "pqc-migration-ci",
        "name": "PQC Migration CI",
        "score": 92,
        "category": "Cybersecurity & Cryptographic Migration",
        "concept": "Repository-native migration agent that opens post-quantum cryptography pull requests and tests hybrid interoperability, compatibility, and performance.",
        "customer": "Security engineering teams, software vendors, critical-infrastructure operators, and maintainers of cryptographic libraries",
        "problem": "Cryptographic inventories identify exposure but do not perform or continuously verify the risky code and protocol migration work.",
        "build": "Detect cryptographic call sites and protocol assumptions, propose bounded hybrid migrations, generate compatibility fixtures, and gate merges on performance and interoperability evidence.",
        "sources": ["s112"],
        "adjacent": [],
        "priority": "validate_7",
        "next_gate": "Benchmark on five open-source repositories and measure correct pull-request rate, hybrid interoperability, performance regression, maintainer acceptance, and rollback safety.",
    },
    {
        "slug": "biochartrace-crcf-mrv-compiler",
        "name": "BiocharTrace - CRCF MRV Compiler",
        "score": 91,
        "category": "Carbon Removal MRV & Certification",
        "concept": "Machine-readable CRCF requirements compiler and batch-lineage evidence system for biochar carbon-removal certification.",
        "customer": "Biochar project developers, certification schemes, auditors, buyers, and equipment operators",
        "problem": "Project telemetry, feedstock records, process batches, laboratory evidence, permanence, and leakage calculations are fragmented across certification workflows.",
        "build": "Encode the biochar methodology into versioned requirements, map plant and laboratory data to each requirement, preserve batch lineage, and produce auditor-review packets.",
        "sources": ["s113", "s69"],
        "adjacent": ["idea-388"],
        "priority": "validate_8",
        "next_gate": "Translate one complete biochar methodology into executable requirements and process one real project batch with a developer and certification expert.",
    },
    {
        "slug": "posted-worker-orchestrator",
        "name": "Posted Worker Orchestrator",
        "score": 90,
        "category": "Cross-Border Labour Compliance",
        "concept": "Country-aware workflow that converts HRIS and payroll data into posting requirements, A1 evidence, declarations, worksite proof, and exception handling.",
        "customer": "Construction, staffing, maintenance, installation, and field-service employers posting workers across EU borders",
        "problem": "Employers reconstruct country-specific posting, payroll, social-security, declaration, and worksite evidence for every assignment across disconnected systems.",
        "build": "Start with Czech, German, Polish, and Austrian routes; generate a reviewed requirement graph and coordinate documents, owners, deadlines, changes, and proof delivery.",
        "sources": ["s114"],
        "adjacent": ["idea-263"],
        "priority": "validate_9",
        "next_gate": "Run ten Czech-German-Polish-Austrian posting scenarios with payroll and labour-mobility experts; separate current national duties from proposed EU interfaces.",
    },
    {
        "slug": "european-business-credential-router",
        "name": "European Business Credential Router",
        "score": 89,
        "category": "Business Identity & Verifiable Credentials",
        "concept": "Developer routing layer for requesting, issuing, exchanging, verifying, refreshing, and revoking European business documents and authority credentials.",
        "customer": "B2B SaaS platforms, public-sector suppliers, banks, insurers, and business onboarding providers",
        "problem": "Business identity, authority, licences, seals, and verified documents span registries, wallet formats, relying-party rules, and revocation systems.",
        "build": "Prototype a jurisdiction- and document-aware API over registry, signing, timestamp, seal, credential, and revocation adapters without assuming the proposed wallet law is adopted.",
        "sources": ["s115"],
        "adjacent": ["idea-341", "idea-344", "idea-353", "candidate-cdcad55a-a4f6-4375-a21c-7866a9c1fa49"],
        "priority": "watch_proposal",
        "next_gate": "Map ten cross-border business-document journeys and test whether a common router removes integration work independent of the proposal's final legislative form.",
    },
    {
        "slug": "secondary-material-quality-graph",
        "name": "Secondary Material Quality Graph",
        "score": 89,
        "category": "Circular Materials & Industrial Procurement",
        "concept": "Specification and evidence graph matching recycled-material batches to industrial requirements by chemistry, contamination, test method, provenance, and processing history.",
        "customer": "Industrial recyclers, steel and metals buyers, manufacturers, laboratories, and quality teams",
        "problem": "Secondary materials are economically stranded when supplier descriptions and buyer specifications cannot be compared with consistent quality and provenance evidence.",
        "build": "Start with one material class; normalize specifications, samples, test results, contamination thresholds, chain of custody, and buyer acceptance outcomes before adding transaction features.",
        "sources": ["s116"],
        "adjacent": ["idea-269", "idea-380"],
        "priority": "validate_later",
        "next_gate": "Choose one material and collect 100 real supplier lots, buyer specifications, laboratory results, and acceptance decisions; measure match precision before building a marketplace.",
    },
    {
        "slug": "short-term-rental-registration-router",
        "name": "Short-Term Rental Registration Router",
        "score": 87,
        "category": "Travel Regulation & Property Operations",
        "concept": "PMS and channel-manager adapter that routes property identity, host documents, registration numbers, listing URLs, and activity data across fragmented short-term-rental authorities.",
        "customer": "Property-management systems, channel managers, professional hosts, and short-term-rental compliance operators",
        "problem": "EU-level data rules coexist with national, regional, and municipal registration systems, leaving property and platform operators to maintain many local workflows.",
        "build": "Implement two jurisdictions end to end, including registration, validation, number-to-listing mapping, activity-data export, status changes, and exception reconciliation.",
        "sources": ["s117"],
        "adjacent": [],
        "priority": "validate_later",
        "next_gate": "Integrate two materially different registration regimes with one PMS dataset and verify maintenance cost, rejection patterns, and willingness to pay among 15 operators.",
    },
    {
        "slug": "efti-adapter-mesh",
        "name": "eFTI Adapter Mesh",
        "score": 86,
        "category": "Freight Data & Regulatory Interoperability",
        "concept": "Edge adapters translating legacy TMS, ERP, warehouse, and carrier data into certified eFTI-platform contracts with reconciliation receipts.",
        "customer": "Transport-management vendors, freight forwarders, carriers, warehouses, and eFTI platform providers",
        "problem": "Legacy freight systems cannot consistently emit the common datasets and operational states required by eFTI platforms and authority checks.",
        "build": "Build three representative source-system adapters, canonical mappings, conformance tests, retry and correction workflows, and signed delivery receipts against one platform sandbox.",
        "sources": ["s94"],
        "adjacent": ["candidate-e78f2fd2-bd47-41fa-9471-485703cc779f", "candidate-249a46c3-f3a3-5bb6-81db-7d8a1afa639c"],
        "priority": "validate_later",
        "next_gate": "Connect three legacy freight data shapes to one eFTI platform test environment and quantify mapping exceptions, maintenance cost, and vendor demand.",
    },
    {
        "slug": "ux-fairness-ci",
        "name": "UX Fairness CI",
        "score": 85,
        "category": "Consumer Protection & Product Quality",
        "concept": "Browser-based regression harness detecting manipulative choice architecture, obstructed cancellation, asymmetric consent, and vulnerable-user harms across product releases.",
        "customer": "Consumer SaaS, marketplaces, subscription products, product counsel, design systems, and quality teams",
        "problem": "Ordinary visual and functional tests do not measure whether interface changes make refusal, cancellation, comparison, or informed choice materially harder.",
        "build": "Create paired user-journey fixtures, measurable friction and symmetry rules, evidence screenshots, and counsel-reviewed test labels; treat future Digital Fairness legislation as watch-only.",
        "sources": ["s118", "s95"],
        "adjacent": ["idea-213", "idea-306"],
        "priority": "watch_proposal",
        "next_gate": "Label 200 live and historical journeys with consumer-law experts; measure precision, repeatability, and developer actionability before making compliance claims.",
    },
    {
        "slug": "renovation-finance-graph",
        "name": "Renovation Finance Graph",
        "score": 85,
        "category": "Building Renovation & Climate Finance",
        "concept": "Property-level graph translating a technical renovation plan into cost, subsidy, energy saving, cash-flow, eligibility, and lender-underwriting evidence.",
        "customer": "Renovation one-stop shops, lenders, energy-service firms, housing operators, and building owners",
        "problem": "Technical renovation measures, grants, borrower constraints, projected savings, contractor quotes, and loan criteria are evaluated in separate workflows.",
        "build": "Start in one country with one housing segment; combine EPC and building data, measure packages, costs, grants, savings assumptions, borrower inputs, and lender feedback in an auditable case file.",
        "sources": ["s119"],
        "adjacent": [],
        "priority": "validate_later",
        "next_gate": "Underwrite 25 real renovation cases in one country with a lender and one-stop shop; measure data gaps, approval lift, cycle time, and prediction calibration.",
    },
]


DEDUPLICATION = {
    "Agent Action Flight Recorder": {"decision": "stage_distinct_delegation_scoped_execution_layer", "targets": ["idea-341", "idea-347"]},
    "Cloud Exit Drill / ExitOps": {"decision": "duplicate_existing", "targets": ["idea-372", "candidate-e3fa364c-faad-4648-9d30-a195af007ac3"]},
    "Grid Connection Underwriter": {"decision": "enrich_existing_grid_readiness_family", "targets": ["idea-273", "idea-395", "candidate-d8eac9f2-5d74-55ad-9e26-624a866b0904"]},
    "Unsold Inventory Surplus Router": {"decision": "duplicate_existing_family", "targets": ["idea-381", "candidate-652d0198-f85e-4df4-9679-25065c1a23d6"]},
    "Machine Data Switchboard": {"decision": "duplicate_existing", "targets": ["idea-276", "idea-366", "idea-362"]},
    "Worker Decision Ledger": {"decision": "exact_duplicate", "targets": ["idea-363"]},
    "PQC Migration CI": {"decision": "stage_distinct_candidate", "targets": []},
    "BiocharTrace / CRCF MRV Compiler": {"decision": "stage_distinct_mrv_module", "targets": ["idea-388"]},
    "Posted Worker Orchestrator": {"decision": "stage_distinct_operational_wedge", "targets": ["idea-263"]},
    "Software Liability Replay": {"decision": "exact_duplicate_existing_family", "targets": ["idea-364", "candidate-ffb826bb-b1b6-5ce8-bf39-fc40c1f454c4"]},
    "Building GWP Compiler": {"decision": "enrich_existing", "targets": ["idea-394"]},
    "European Business Credential Router": {"decision": "stage_distinct_router_adjacent_to_authority_family", "targets": ["idea-341", "idea-344", "idea-353"]},
    "Secondary Material Quality Graph": {"decision": "stage_distinct_candidate", "targets": ["idea-269", "idea-380"]},
    "SovereigntyGraph": {"decision": "enrich_existing_family", "targets": ["idea-374", "idea-372"]},
    "Waste Shipment Adapter API": {"decision": "feature_of_existing_staged_candidate", "targets": ["candidate-153e8656-5387-5bd7-a153-3ea9a4cbd468"]},
    "Cross-Border Worker Proof API": {"decision": "merge_into_posted_worker_and_trade_passport_family", "targets": ["idea-263"]},
    "STR Registration Router": {"decision": "stage_distinct_candidate", "targets": []},
    "eFTI Adapter Mesh": {"decision": "stage_distinct_adapter_adjacent_to_preflight", "targets": ["candidate-e78f2fd2-bd47-41fa-9471-485703cc779f", "candidate-249a46c3-f3a3-5bb6-81db-7d8a1afa639c"]},
    "UX Fairness CI": {"decision": "stage_watch_only_candidate", "targets": ["idea-213", "idea-306"]},
    "Renovation Finance Graph": {"decision": "stage_bounded_country_first_candidate", "targets": []},
}


def candidate_id(slug: str) -> str:
    return f"candidate-{uuid.uuid5(NAMESPACE, slug)}"


def ref(slug: str) -> str:
    return candidate_id(slug)


VALIDATION_PRIORITY = [
    {"rank": 1, "proposal": "Agent Action Flight Recorder", "analystProvisionalScore": 97, "targetType": "new_adjacent_candidate", "targetRefs": [ref("agent-action-flight-recorder"), "idea-341", "idea-347"], "nextGate": CANDIDATES[0]["next_gate"]},
    {"rank": 2, "proposal": "Cloud Exit Drill / ExitOps", "analystProvisionalScore": 96, "targetType": "canonical_validation", "targetRefs": ["idea-372"], "nextGate": "Interview 15 CTO and procurement teams with more than EUR250k annual cloud spend; run a real restore drill and test whether exitability changes resilience, procurement, or negotiation decisions."},
    {"rank": 3, "proposal": "Grid Connection Underwriter", "analystProvisionalScore": 95, "targetType": "existing_family_validation", "targetRefs": ["idea-273", "idea-395", "candidate-d8eac9f2-5d74-55ad-9e26-624a866b0904"], "nextGate": "Choose one jurisdiction, build ten manual probability-time-cost site reports, and sell at least three before adding a new grid idea."},
    {"rank": 4, "proposal": "Unsold Inventory Surplus Router", "analystProvisionalScore": 94, "targetType": "existing_family_validation", "targetRefs": ["idea-381", "candidate-652d0198-f85e-4df4-9679-25065c1a23d6"], "nextGate": "Obtain one anonymized inventory CSV and manually optimize lawful disposition under brand, value, timing, and derogation constraints; measure recovered value and evidence completeness."},
    {"rank": 5, "proposal": "Machine Data Switchboard", "analystProvisionalScore": 93, "targetType": "canonical_validation", "targetRefs": ["idea-276", "idea-366", "idea-362"], "nextGate": "Use exactly three OEMs in one vertical and prove that statutory access can be normalized into a stable operational contract with acceptable latency, completeness, and maintenance cost."},
    {"rank": 6, "proposal": "Worker Decision Ledger", "analystProvisionalScore": 93, "targetType": "canonical_validation", "targetRefs": ["idea-363"], "nextGate": "Demo an end-to-end consequential-decision, explanation, appeal, human-review, and remedy workflow with platform operators and worker representatives."},
    {"rank": 7, "proposal": "PQC Migration CI", "analystProvisionalScore": 92, "targetType": "new_candidate_validation", "targetRefs": [ref("pqc-migration-ci")], "nextGate": CANDIDATES[1]["next_gate"]},
    {"rank": 8, "proposal": "BiocharTrace / CRCF MRV Compiler", "analystProvisionalScore": 91, "targetType": "new_adjacent_candidate", "targetRefs": [ref("biochartrace-crcf-mrv-compiler"), "idea-388"], "nextGate": CANDIDATES[2]["next_gate"]},
    {"rank": 9, "proposal": "Posted Worker Orchestrator", "analystProvisionalScore": 90, "targetType": "new_adjacent_candidate", "targetRefs": [ref("posted-worker-orchestrator"), "idea-263"], "nextGate": CANDIDATES[3]["next_gate"]},
    {"rank": 10, "proposal": "Software Liability Replay", "analystProvisionalScore": 90, "targetType": "canonical_validation", "targetRefs": ["idea-364", "candidate-ffb826bb-b1b6-5ce8-bf39-fc40c1f454c4"], "nextGate": "Interview ten manufacturers and product-liability practitioners; replay five incidents and measure whether exact historical product-state reconstruction changes investigation time or claim outcomes."},
]


def make_candidate(spec: dict) -> dict:
    cid = candidate_id(spec["slug"])
    return {
        "schemaVersion": "2.0.0",
        "id": cid,
        "candidateId": cid,
        "candidateSlug": spec["slug"],
        "slug": f'{spec["slug"]}-{cid}',
        "name": spec["name"],
        "oneSentenceConcept": spec["concept"],
        "elevatorPitch": f'{spec["problem"]} {spec["build"]}',
        "detailedDescription": spec["concept"],
        "category": spec["category"],
        "subcategory": "execution-layer opportunity",
        "tags": ["august-2026", "fresh-opportunity-round", "execution-layer", "customer-evidence-unproven"],
        "status": "staged",
        "evidenceStatus": "forcing_function_verified_customer_demand_unproven",
        "promotionEligible": False,
        "requiresExternalEvidence": True,
        "sourceReferences": spec["sources"],
        "provenance": {
            "sourceType": "VenturaAtlas Fresh 2026 Opportunity Round - user supplied",
            "researchRunId": RUN_ID,
            "originalWordingAvailable": "private-attachment",
            "notes": "Forcing-function claims checked against primary sources; commercial claims and supplied score remain hypotheses.",
        },
        "atAGlance": {
            "targetCustomer": spec["customer"],
            "problemSolved": spec["problem"],
            "whatToBuild": spec["build"],
            "howItMakesMoney": None,
            "whyCustomersPay": None,
            "estimatedEarningPotential": None,
            "startupCost": None,
            "overallScore": None,
            "confidenceScore": None,
            "mainAdvantage": "A machine-executable workflow around a newly available rail, consequential action, forbidden behavior, or physical bottleneck.",
            "mainRisk": "Buyer urgency, data access, decision quality, integration cost, and willingness to pay remain unvalidated.",
            "bestNextValidationStep": spec["next_gate"],
        },
        "researchAssessment": {
            "analystProvisionalOpportunityScore": spec["score"],
            "scoreScale": "0-100",
            "scoreStatus": "provisional_not_ranking_eligible",
            "priorityClass": spec["priority"],
            "adjacentCanonicalOrCandidateRefs": spec["adjacent"],
        },
        "validationChecklist": {
            "gateStatus": "needs_customer_validation",
            "passed": False,
            "passedCount": 2,
            "failedCount": 0,
            "unknownCount": 4,
            "totalCriteria": 6,
            "scorePercentage": 33.33,
            "details": {
                "Forcing function or infrastructure rail verified": "pass",
                "Semantic duplicate review completed": "pass",
                "Buyer workflow confirmed in interviews": "unknown",
                "Representative operational data obtained": "unknown",
                "Paid willingness-to-pay evidence": "unknown",
                "Decision quality and failure modes measured": "unknown",
            },
        },
        "killCriteria": {
            "killFlagged": False,
            "killCount": 0,
            "killConditions": {
                "No repeated workflow failure in 15 interviews": False,
                "No buyer willing to provide representative data": False,
                "Existing system resolves the end-to-end workflow": False,
                "No paid design partner after 30 qualified outreaches": False,
            },
            "killFlags": [],
        },
        "createdAt": NOW,
        "updatedAt": NOW,
        "prioritizedForValidation": spec["priority"] == "prototype_1",
        "reviewPriority": "urgent" if spec["priority"] == "prototype_1" else "medium",
        "priority": spec["score"],
    }


def main() -> None:
    sources = read_json_safe(SOURCES_PATH, default_if_missing=[])
    by_url = {item.get("url"): item for item in sources}
    used_ids = {item.get("id") for item in sources}
    added_sources = 0
    for source in SOURCES:
        if source["url"] in by_url:
            continue
        if source["id"] in used_ids:
            raise RuntimeError(f'Source ID collision: {source["id"]}')
        sources.append({
            **source,
            "accessDate": "2026-08-12",
            "confidenceLabel": "high",
            "sourceType": "primary",
            "researchRound": "fresh-opportunity-round-2026-08-12",
            "ideaIds": [],
            "visibility": "PUBLIC",
            "sourceClass": "PRIMARY_OR_OFFICIAL",
            "evidenceEligible": True,
            "provenanceEligible": True,
        })
        used_ids.add(source["id"])
        added_sources += 1

    queue = read_json_safe(QUEUE_PATH, default_if_missing=[])
    existing_by_slug = {item.get("candidateSlug") or item.get("slug"): index for index, item in enumerate(queue)}
    added_candidates = 0
    for spec in CANDIDATES:
        if spec["slug"] in existing_by_slug:
            index = existing_by_slug[spec["slug"]]
            if queue[index].get("provenance", {}).get("researchRunId") == RUN_ID:
                queue[index] = make_candidate(spec)
            continue
        queue.append(make_candidate(spec))
        existing_by_slug[spec["slug"]] = len(queue) - 1
        added_candidates += 1

    runs = read_json_safe(RUNS_PATH, default_if_missing=[])
    record = {
        "runId": RUN_ID,
        "baselineCommit": "a56e61b1bed173259a9191d3180e7a68e5e61180",
        "questions": [
            "Which of the twenty supplied proposals are distinct from 294 canonical and 221 privately staged records?",
            "Which forcing functions are verified, and which remain proposals or strategy signals?",
            "How should the supplied top-ten order map to actual validation targets without changing canonical ranking authority?",
        ],
        "queries": [
            "delegation-scoped agent execution observability gateway 2026 primary research",
            "Data Act cloud switching charges 12 January 2027 official",
            "ESPR unsold apparel destruction 19 July 2026 official",
            "EU post-quantum roadmap end 2026 official",
            "CRCF biochar permanent removal methodology February 2026 official",
            "posted worker e-declaration proposal official",
            "European Business Wallet proposal verified documents official",
            "short-term rental registration data Regulation 2024/1028 official",
            "eFTI full application 9 July 2027 official",
            "renovation finance EPBD official",
        ],
        "sourceCandidates": [source["id"] for source in SOURCES] + ["s69", "s86", "s87", "s90", "s92", "s94", "s95"],
        "inclusions": [candidate_id(spec["slug"]) for spec in CANDIDATES],
        "exclusions": [name for name, decision in DEDUPLICATION.items() if not decision["decision"].startswith("stage")],
        "claimsChanged": [
            "Ten distinct concepts staged; ten proposals mapped to existing canonical or staged families.",
            "All twenty proposals received an explicit semantic-resolution decision.",
            "The supplied top-ten order is recorded as a validation queue, not a ranking or publication instruction.",
            "European Business Wallet, posted-worker e-declaration, and Digital Fairness Act signals are treated as proposals or watch items rather than enacted-law deadlines.",
            "Scores, market sizes, prices, demand, and willingness-to-pay claims remain provisional.",
        ],
        "researchMethodExtensions": [
            "official_rail_to_missing_last_mile_adapter",
            "autonomous_software_to_missing_authority_and_consequence_record",
            "forbidden_previous_behavior_to_disposition_or_exception_workflow",
            "scarce_physical_capacity_to_underwriting_or_optimization",
        ],
        "prototypePriority": [
            {"rank": 1, "proposal": "Agent Action Flight Recorder", "targetRefs": [ref("agent-action-flight-recorder")]},
            {"rank": 2, "proposal": "Cloud Exit Drill / ExitOps", "targetRefs": ["idea-372"]},
            {"rank": 3, "proposal": "Grid Connection Underwriter", "targetRefs": ["idea-273", "idea-395", "candidate-d8eac9f2-5d74-55ad-9e26-624a866b0904"]},
        ],
        "deduplicationDecisions": DEDUPLICATION,
        "validationPriorityQueue": VALIDATION_PRIORITY,
        "agent": "research-intelligence-agent",
        "methodVersion": "epistemic-v5-rail-consequence-bottleneck-dedup",
        "startedAt": NOW,
        "endedAt": NOW,
        "reviewStatus": "approved_for_private_staging_and_validation_not_canonical_promotion",
    }
    existing_index = next((i for i, run in enumerate(runs) if run.get("runId") == RUN_ID), None)
    if existing_index is None:
        runs.append(record)
    else:
        runs[existing_index] = record

    atomic_write_json(SOURCES_PATH, sources)
    atomic_write_json(QUEUE_PATH, queue)
    atomic_write_json(RUNS_PATH, runs)
    print(f"[OK] Added {added_sources} primary sources, {added_candidates} staged candidates, and recorded {RUN_ID}.")


if __name__ == "__main__":
    main()
