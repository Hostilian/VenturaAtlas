"""Ingest the 12 August 2026 deep-research expansion round.

The supplied round contains fifteen named opportunities and a useful execution-
layer thesis. This writer keeps analyst scores provisional, deduplicates against
the canonical corpus, stages only genuinely distinct concepts, and records the
top-five validation queue without granting publication or ranking authority.
"""

from __future__ import annotations

import os
import uuid

from va_runtime.atomic_io import atomic_write_json, read_json_safe


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE_PATH = os.path.join(ROOT, "data", "idea-staging-queue.json")
SOURCES_PATH = os.path.join(ROOT, "data", "sources.json")
RUNS_PATH = os.path.join(ROOT, "data", "research-runs.json")
RUN_ID = "run-res-003-20260812-deep-research-expansion"
NAMESPACE = uuid.UUID("76531f99-c767-4fc8-b2ee-7fb33d80d58c")
NOW = "2026-08-12T13:15:00+00:00"


SOURCES = [
    {
        "id": "s97",
        "title": "EU AI Act implementation timeline",
        "publisher": "European Commission - DG CONNECT",
        "url": "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
        "supports": [
            "The AI Act became generally applicable on 2 August 2026 with stated exceptions",
            "Article 50 transparency rules apply from August 2026",
        ],
    },
    {
        "id": "s98",
        "title": "The Digital Product Passport Registry is now live",
        "publisher": "European Commission - DG GROW",
        "url": "https://single-market-economy.ec.europa.eu/news/digital-product-passport-registry-now-live-2026-07-20_en",
        "supports": [
            "The DPP Registry and testing environment launched on 20 July 2026",
            "The first implementation deadline is 18 February 2027 for certain large batteries",
        ],
    },
    {
        "id": "s99",
        "title": "European Digital Identity Regulation",
        "publisher": "European Commission - DG CONNECT",
        "url": "https://digital-strategy.ec.europa.eu/en/policies/eudi-regulation",
        "supports": [
            "Member States must provide EU Digital Identity Wallets by the end of 2026",
            "The framework prioritises user control and avoiding unnecessary data sharing",
        ],
    },
    {
        "id": "s100",
        "title": "Transparency obligations under Article 50 of the AI Act - Questions and Answers",
        "publisher": "European Commission - AI Office",
        "url": "https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act",
        "supports": [
            "Article 50 transparency obligations apply from 2 August 2026",
            "Interactive AI notices must be clear from the first interaction and meet accessibility requirements",
        ],
    },
    {
        "id": "s101",
        "title": "Directive on repair of goods",
        "publisher": "European Commission - DG JUST",
        "url": "https://commission.europa.eu/law/law-topic/consumer-protection-law/directive-repair-goods_en",
        "supports": [
            "Member States must transpose and apply the repair directive from 31 July 2026",
            "The framework promotes repair and spare-parts availability",
        ],
    },
    {
        "id": "s102",
        "title": "AI Literacy - Questions and Answers",
        "publisher": "European Commission - DG CONNECT",
        "url": "https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers",
        "supports": [
            "AI literacy obligations have applied since 2 February 2025",
            "Supervision and enforcement rules apply from 3 August 2026",
        ],
    },
    {
        "id": "s103",
        "title": "EU Space Act proposal",
        "publisher": "European Commission - DG DEFIS",
        "url": "https://defence-industry-space.ec.europa.eu/eu-space-act_en",
        "supports": [
            "The proposal addresses safety, resilience, environmental sustainability, and competitiveness",
            "The proposal remains under the ordinary legislative procedure and is not treated as enacted law",
        ],
    },
    {
        "id": "s104",
        "title": "CBAM definitive regime",
        "publisher": "European Commission - DG TAXUD",
        "url": "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/cbam-definitive-regime_en",
        "supports": [
            "The CBAM definitive regime applies from 1 January 2026",
            "Authorised declarants report embedded emissions and surrender certificates",
        ],
    },
    {
        "id": "s105",
        "title": "Digitalisation of the energy systems",
        "publisher": "European Commission - DG Energy",
        "url": "https://energy.ec.europa.eu/topics/eus-energy-system/digitalisation-energy-system_en",
        "supports": [
            "The 2026-2027 programme funds smart-grid, AI-energy, renewable, smart-building, and efficiency digitalisation",
            "European energy digitalisation creates integration demand but does not itself prove buyer willingness to pay",
        ],
    },
    {
        "id": "s106",
        "title": "DG SANTE Management Plan 2026",
        "publisher": "European Commission - DG SANTE",
        "url": "https://commission.europa.eu/document/download/4a5ae74d-2749-45f6-bb80-91a4b4e75054_en?filename=sante_mp_2026_en.pdf",
        "supports": [
            "Critical-medicines policy work includes shortage resilience and supply dependency",
            "The policy signal does not validate a commercial shortage-prediction product",
        ],
    },
    {
        "id": "s107",
        "title": "FAQ on Empowering Consumers for the Green Transition",
        "publisher": "European Commission - DG JUST",
        "url": "https://commission.europa.eu/document/download/3c257883-bb2a-4dd9-a6dc-501d587bb34f_en?filename=faq-empowerting-consumers-gtd.pdf",
        "supports": [
            "Environmental-claim and sustainability-label rules apply from 27 September 2026",
            "The rules also cover existing products and old stock in business-to-consumer contexts",
        ],
    },
    {
        "id": "s108",
        "title": "Cyber Resilience Act reporting obligations",
        "publisher": "European Commission - DG CONNECT",
        "url": "https://digital-strategy.ec.europa.eu/en/policies/cra-reporting",
        "supports": [
            "CRA vulnerability and severe-incident reporting starts on 11 September 2026",
            "Early warning is due within 24 hours and full notification within 72 hours of awareness",
        ],
    },
]


CANDIDATES = [
    {
        "slug": "cra-incident-compiler-regulatory-clock",
        "name": "CRA Incident Compiler - Regulatory Clock and Submission Evidence",
        "score": 94,
        "category": "Cybersecurity & Cyber Resilience Act Compliance",
        "concept": "Engineering-integrated CRA incident compiler that reconstructs awareness, starts 24/72-hour clocks, and assembles the Single Reporting Platform submission evidence trail.",
        "customer": "EU IoT, connected-product, industrial-device, and network-equipment manufacturers",
        "problem": "Potentially reportable vulnerabilities originate across issue trackers, observability, SBOM, SOC, and support systems, leaving awareness time and affected product scope disputed.",
        "build": "Connect GitHub or GitLab, Jira or Linear, Sentry, vulnerability scanners, SBOM repositories, and incident systems; preserve a timestamped awareness and product-impact timeline and generate reviewable CRA report packets.",
        "sources": ["s108", "s96"],
        "adjacent": ["idea-401"],
        "priority": "top_tier_1",
    },
    {
        "slug": "ai-interaction-transparency-sdk",
        "name": "AI Interaction Transparency SDK",
        "score": 89,
        "category": "AI Governance & Compliance",
        "concept": "Developer SDK that inserts contextual AI-interaction notices, locale and accessibility variants, and proof-of-display records across chatbot, voice-agent, support, recruiting, and onboarding interfaces.",
        "customer": "SaaS vendors and enterprises deploying interactive AI systems to EU users",
        "problem": "AI interaction notices are implemented inconsistently across products, channels, locales, and interface releases, with little evidence that the required notice was actually shown.",
        "build": "Ship web, mobile, voice, and contact-centre components with policy configuration, versioned disclosure wording, accessibility checks, and tamper-evident proof-of-display events.",
        "sources": ["s97", "s100"],
        "adjacent": ["idea-266"],
        "priority": "high",
    },
    {
        "slug": "ai-literacy-evidence-engine",
        "name": "AI Literacy Evidence Engine",
        "score": 83,
        "category": "AI Governance & Workforce Compliance",
        "concept": "Policy-as-code engine that maps actual AI-system use to role-specific literacy requirements, micro-evaluations, and dated evidence of completion.",
        "customer": "AI providers and deployers with distributed staff using materially different AI systems and risk contexts",
        "problem": "Generic annual training does not show that workers understand the capabilities, risks, and controls relevant to the AI systems they actually operate.",
        "build": "Inventory AI systems and roles, assign contextual learning and evaluations, record policy and content versions, and export evidence without claiming that training alone establishes legal compliance.",
        "sources": ["s102", "s97"],
        "adjacent": [],
        "priority": "medium",
    },
    {
        "slug": "cbam-supplier-evidence-network",
        "name": "CBAM Supplier Evidence Network",
        "score": 81,
        "category": "Carbon Border & Trade Compliance",
        "concept": "Reusable supplier-to-importer evidence network for installation, product, methodology, embedded-emissions, verifier, and reporting-period data under CBAM.",
        "customer": "EU importers, non-EU installations, procurement teams, CBAM declarants, and accredited verifiers",
        "problem": "The same non-EU supplier repeatedly answers inconsistent emissions-data requests from multiple importers, while evidence quality and methodology lineage remain hard to reuse.",
        "build": "Create permissioned installation and product records, standardised evidence requests, verifier handoffs, period/version lineage, and importer-specific exports without presenting supplier assertions as verified facts.",
        "sources": ["s104", "s93"],
        "adjacent": ["candidate-d4967815-830f-5375-8630-84b117af1340"],
        "priority": "medium",
    },
    {
        "slug": "energy-flexibility-normalization-api",
        "name": "Energy Flexibility Normalization API",
        "score": 80,
        "category": "Energy Infrastructure & Grid Software",
        "concept": "European interoperability API normalising smart-meter, EV charger, heat-pump, battery, tariff, and grid-signal data for demand-response applications.",
        "customer": "Energy retailers, aggregators, building-energy platforms, device vendors, and flexibility-market developers",
        "problem": "Country, operator, meter, tariff, and device fragmentation forces each flexibility application to rebuild adapters and operational semantics.",
        "build": "Start with one country and one device class; normalise identity, interval data, tariff events, control permissions, and dispatch receipts behind a stable developer contract.",
        "sources": ["s105"],
        "adjacent": ["idea-274", "idea-392"],
        "priority": "watch",
    },
]


VALIDATION_PRIORITY = [
    {
        "rank": 1,
        "proposal": "CRA Incident Compiler",
        "analystProvisionalScore": 94,
        "targetType": "new_adjacent_candidate",
        "targetRefs": ["candidate-c17caacb-c87c-52d9-bdc3-bc83de8f2588", "idea-401"],
        "nextGate": "Interview 15 manufacturers; replay five historical incidents and determine whether awareness time, reportability, and product scope can be reconstructed; seek three paid design partners.",
    },
    {
        "rank": 2,
        "proposal": "AI Provenance Gateway",
        "analystProvisionalScore": 93,
        "targetType": "canonical_family_enrichment",
        "targetRefs": ["idea-266", "idea-386"],
        "nextGate": "Run ten real asset pipelines and measure provenance survival, transformation lineage completeness, false assurance, and buyer willingness to pay for gateway versus CI testing.",
    },
    {
        "rank": 3,
        "proposal": "GreenClaim CI",
        "analystProvisionalScore": 92,
        "targetType": "canonical_enrichment",
        "targetRefs": ["idea-300"],
        "nextGate": "Scan 500 live claims from 15 EU brands; obtain counsel-reviewed precision/recall labels and three paid pilots before changing any canonical score.",
    },
    {
        "rank": 4,
        "proposal": "Credential Firewall for EUDI",
        "analystProvisionalScore": 91,
        "targetType": "canonical_family_enrichment",
        "targetRefs": ["idea-346", "idea-207"],
        "nextGate": "Test ten relying-party flows against the current ARF; document which requested attributes are technically optional and obtain design partners without asserting legal necessity automatically.",
    },
    {
        "rank": 5,
        "proposal": "DPP Bridge / Passport API",
        "analystProvisionalScore": 90,
        "targetType": "canonical_family_enrichment",
        "targetRefs": ["idea-261", "idea-032"],
        "nextGate": "Use the live Registry test environment to register representative battery records, map missing supplier fields, and secure three importer or manufacturer pilots.",
    },
]


DEDUPLICATION = {
    "CRA Incident Compiler": {"decision": "stage_distinct_adjacent_module", "targets": ["idea-401"]},
    "AI Provenance Gateway": {"decision": "enrich_existing_family", "targets": ["idea-266", "idea-386"]},
    "GreenClaim CI": {"decision": "enrich_existing", "targets": ["idea-300"]},
    "Credential Firewall for EUDI": {"decision": "enrich_existing_family", "targets": ["idea-346", "idea-207"]},
    "DPP Bridge / Passport API": {"decision": "enrich_existing_family", "targets": ["idea-261", "idea-032"]},
    "AI Interaction Transparency SDK": {"decision": "stage_distinct_candidate", "targets": []},
    "Open-Source CRA Evidence Graph": {"decision": "module_of_existing_family", "targets": ["idea-401", "idea-019", "idea-361"]},
    "Repairability Operations OS": {"decision": "duplicate_existing_family", "targets": ["idea-295", "idea-264"]},
    "Packaging Claim Linter": {"decision": "feature_of_existing_claim_and_packaging_work", "targets": ["idea-300", "candidate-19eaa002-a32e-546c-80b3-1eafb6faa24c"]},
    "EUDI Test Cloud": {"decision": "duplicate_existing", "targets": ["idea-356"]},
    "AI Literacy Evidence Engine": {"decision": "stage_distinct_candidate", "targets": []},
    "Space Compliance Graph": {"decision": "enrich_existing_watch_only_proposal_not_law", "targets": ["idea-383"]},
    "CBAM Supplier Data Network": {"decision": "stage_network_extension", "targets": ["candidate-d4967815-830f-5375-8630-84b117af1340"]},
    "Energy Flexibility API": {"decision": "stage_bounded_vertical_first_candidate", "targets": ["idea-274", "idea-392"]},
    "Medicine Shortage Intelligence API": {"decision": "enrich_existing", "targets": ["idea-377"]},
}


def candidate_id(slug: str) -> str:
    return f"candidate-{uuid.uuid5(NAMESPACE, slug)}"


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
        "subcategory": "compliance execution layer",
        "tags": ["august-2026", "deep-research-expansion", "execution-layer", "customer-evidence-unproven"],
        "status": "staged",
        "evidenceStatus": "official_forcing_function_verified_customer_demand_unproven",
        "promotionEligible": False,
        "requiresExternalEvidence": True,
        "sourceReferences": spec["sources"],
        "provenance": {
            "sourceType": "Deep Research Expansion Round - user supplied",
            "researchRunId": RUN_ID,
            "originalWordingAvailable": "private-attachment",
            "notes": "Forcing-function timing checked against official sources; commercial claims and score remain hypotheses.",
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
            "mainAdvantage": "Machine-executable workflow and evidence trail around a dated regulatory trigger.",
            "mainRisk": "Buyer urgency, integration access, decision accuracy, and willingness to pay remain unvalidated.",
            "bestNextValidationStep": "Run 15 workflow interviews, obtain representative data, replay five real cases, and seek three paid design partners.",
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
                "Official forcing function verified": "pass",
                "Semantic duplicate review completed": "pass",
                "Buyer workflow confirmed in interviews": "unknown",
                "Representative operational data obtained": "unknown",
                "Paid willingness-to-pay evidence": "unknown",
                "Decision precision and failure modes measured": "unknown",
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
        "prioritizedForValidation": spec["priority"].startswith("top_tier"),
        "reviewPriority": "urgent" if spec["priority"].startswith("top_tier") else "medium",
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
            "type": "official_guidance",
            "date": "2026",
            "accessDate": "2026-08-12",
            "confidenceLabel": "high",
            "sourceType": "primary",
            "researchRound": "deep-research-expansion-2026-08-12",
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
    existing_run = next((run for run in runs if run.get("runId") == RUN_ID), None)
    if existing_run is None:
        runs.append({
            "runId": RUN_ID,
            "baselineCommit": "1f4a25802c12d38c32bb8b12d084fb388657be18",
            "questions": [
                "Which of the fifteen supplied opportunities are actually distinct from the canonical corpus?",
                "Which 2026 regulatory triggers are verified by current official primary sources?",
                "Which five concepts deserve validation priority without changing canonical scores or maturity?",
            ],
            "queries": [
                "EU AI Act Article 50 transparency obligations 2 August 2026 official",
                "EU CRA reporting 11 September 2026 24 hours 72 hours official",
                "PPWR applies generally 12 August 2026 official",
                "Empowering Consumers Green Transition 27 September 2026 official FAQ",
                "EUDI wallet Member States end 2026 official",
                "DPP Registry live February 2027 batteries official",
                "CBAM definitive regime 1 January 2026 official",
                "AI literacy enforcement 3 August 2026 official",
            ],
            "sourceCandidates": [source["id"] for source in SOURCES] + ["s84", "s93", "s95", "s96"],
            "inclusions": [candidate_id(spec["slug"]) for spec in CANDIDATES],
            "exclusions": [name for name, decision in DEDUPLICATION.items() if not decision["decision"].startswith("stage")],
            "claimsChanged": [
                "Five distinct candidates staged; ten proposals mapped to existing canonical or staged families.",
                "Top five recorded as a validation-priority queue, not as a canonical ranking update.",
                "EU Space Act treated as a proposal under negotiation rather than an active-law deadline.",
                "All commercial scores, pricing, demand, and willingness-to-pay claims remain provisional.",
            ],
            "deduplicationDecisions": DEDUPLICATION,
            "validationPriorityQueue": VALIDATION_PRIORITY,
            "agent": "research-intelligence-agent",
            "methodVersion": "epistemic-v4-execution-layer-dedup",
            "startedAt": NOW,
            "endedAt": NOW,
            "reviewStatus": "approved_for_staging_and_validation_priority_not_canonical_promotion",
        })
    else:
        existing_run["validationPriorityQueue"] = VALIDATION_PRIORITY
        existing_run["startedAt"] = NOW
        existing_run["endedAt"] = NOW

    atomic_write_json(SOURCES_PATH, sources)
    atomic_write_json(QUEUE_PATH, queue)
    atomic_write_json(RUNS_PATH, runs)
    print(f"[OK] Added {added_sources} primary sources, {added_candidates} staged candidates, and recorded {RUN_ID}.")


if __name__ == "__main__":
    main()
