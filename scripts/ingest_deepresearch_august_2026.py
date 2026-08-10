"""Ingest the curated August 2026 operational-chokepoint research pass.

This writer is deliberately staging-only. Analyst opportunity scores remain
provisional, customer evidence remains unproven, and semantic duplicates are
recorded as enrichment targets rather than added as new ideas.
"""

from __future__ import annotations

import datetime as dt
import os
import uuid

from va_runtime.atomic_io import atomic_write_json, read_json_safe


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE_PATH = os.path.join(ROOT, "data", "idea-staging-queue.json")
SOURCES_PATH = os.path.join(ROOT, "data", "sources.json")
RUNS_PATH = os.path.join(ROOT, "data", "research-runs.json")
RUN_ID = "run-res-002-20260810-august-operational-chokepoints"
NAMESPACE = uuid.UUID("2bdd8061-f1a9-4cc1-83e5-34b79e75046a")
NOW = "2026-08-10T00:00:00+00:00"


SOURCES = [
    ("s84", "EU Packaging and Packaging Waste Regulation implementation", "European Commission — DG Environment", "https://environment.ec.europa.eu/topics/waste-and-recycling/packaging-waste_en", ["PPWR generally applies from 12 August 2026", "PFAS restrictions cover food-contact packaging"]),
    ("s85", "Guidelines on Article 50 AI Act transparency obligations", "European Commission — DG CONNECT", "https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems", ["Article 50 transparency obligations apply from 2 August 2026", "machine-readable marking and disclosure requirements"]),
    ("s86", "Digital Waste Shipment System (DIWASS)", "European Commission — Green Forum", "https://green-forum.ec.europa.eu/green-business/digital-waste-shipment-system-diwass_en", ["DIWASS mandatory use from 21 May 2026", "corporate software API interconnection and operational exceptions"]),
    ("s87", "The future of work — platform work and algorithmic management", "European Commission — DG Employment", "https://employment-social-affairs.ec.europa.eu/policies-and-activities/rights-work/future-work_en", ["Platform Work Directive transposition by December 2026", "algorithmic management oversight"]),
    ("s88", "EUDAMED implementation overview", "European Commission — DG SANTE", "https://health.ec.europa.eu/medical-devices-eudamed/overview_en", ["four EUDAMED modules mandatory from 28 May 2026", "external device-registration state"]),
    ("s89", "EU methane emissions regulation implementation", "European Commission — DG Energy", "https://energy.ec.europa.eu/topics/carbon-management-and-fossil-fuels/methane-emissions_en", ["import MRV requirements from 1 January 2027", "contract-date and reasonable-efforts distinctions"]),
    ("s90", "European grids — connection queue evidence", "European Commission — DG Energy", "https://energy.ec.europa.eu/topics/infrastructure/european-grids_en", ["connection queues in at least 16 EU countries", "approximately 120 GW of mature renewable projects at timely-access risk"]),
    ("s91", "Machinery Regulation transition guidance for lifts", "European Commission — DG GROW", "https://single-market-economy.ec.europa.eu/document/download/3458d17c-0a0d-445b-b4b3-8067c776c727_en?filename=Technical+Guideline-Note_MR-LD_v5_clean.pdf", ["Machinery Regulation applies from 20 January 2027", "engineering changes can alter conformity evidence"]),
    ("s92", "Directive (EU) 2024/2853 on liability for defective products", "EUR-Lex", "https://eur-lex.europa.eu/eli/dir/2024/2853/oj/eng", ["software is a product for liability purposes", "new regime applies to products placed on the market after 9 December 2026"]),
    ("s93", "Verification of CBAM emissions", "European Commission — DG TAXUD", "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/cbam-verification_en", ["actual embedded emissions require accredited independent verification", "verifier reviews calculations and supporting evidence"]),
    ("s94", "The eFTI Regulation", "European Commission — DG MOVE", "https://transport.ec.europa.eu/transport-themes/logistics-and-multimodal-transport/efti-regulation_en", ["full application on 9 July 2027", "authorities must accept data from certified eFTI platforms"]),
    ("s95", "Sustainable consumption and green-transition consumer rights", "European Commission", "https://commission.europa.eu/topics/consumers/consumer-rights-and-complaints/sustainable-consumption_en", ["greenwashing protections apply from 27 September 2026", "environmental-claim evidence requirements"]),
    ("s96", "Cyber Resilience Act Single Reporting Platform", "ENISA", "https://www.enisa.europa.eu/topics/product-security-and-certification/single-reporting-platform-srp", ["CRA reporting obligations apply from 11 September 2026", "single reporting platform incident workflow"]),
]


CANDIDATES = [
    {
        "slug": "packgate-ppwr-market-access-stock-router",
        "name": "PackGate — PPWR Market-Access & Stock Router",
        "score": 92,
        "category": "Packaging & Product Compliance",
        "concept": "Lot-level preflight that tells operators whether packaging inventory can ship, must be held, repackaged, retested, or escalated under PPWR cutovers.",
        "customer": "EU consumer-goods manufacturers, food-service chains, private-label retailers, packaging converters, and importers",
        "problem": "ERP SKU and packaging-lot records do not preserve enough evidence to decide whether specific inventory may be placed on the market after a regulatory cutover.",
        "build": "Ingest SKU masters, packaging BOMs, lots, supplier declarations, tests, warehouse inventory, and market dates; emit SHIP/HOLD/REPACKAGE/RETEST/LEGAL REVIEW with reasons.",
        "sources": ["s84"],
        "choke": "Shipment release",
        "check": "Lot date, packaging component, evidence presence, and jurisdiction can be evaluated deterministically.",
        "asset": "Packaging-component, supplier-evidence, and cutover-outcome graph.",
        "verdict": "promote_after_customer_gate",
    },
    {
        "slug": "wasteflow-exceptionops-diwass-reconciliation",
        "name": "WasteFlow ExceptionOps — DIWASS Reconciliation Layer",
        "score": 88,
        "category": "Waste Logistics & Regulatory Infrastructure",
        "concept": "Pre-dispatch reconciliation and observability for mismatches between enterprise shipment systems and DIWASS.",
        "customer": "Waste brokers, recyclers, hazardous-waste operators, industrial manufacturers, and logistics companies",
        "problem": "Actor registration, consent, waste-code, quantity, and movement-document mismatches can block or invalidate physical waste shipments.",
        "build": "Reconcile ERP/TMS shipment state with DIWASS documents and API responses; run dispatch preflight and explain every blocker.",
        "sources": ["s86"],
        "choke": "Truck dispatch",
        "check": "Actor, consent, waste code, quantity, carrier, document status, and API response mismatches are machine-checkable.",
        "asset": "DIWASS rejection, exception, and resolution corpus.",
        "verdict": "promote_after_customer_gate",
    },
    {
        "slug": "eudamirror-eudamed-reality-reconciler",
        "name": "EudaMirror — EUDAMED Reality Reconciler",
        "score": 87,
        "category": "Medical Device Regulatory Operations",
        "concept": "Continuous diff between internal medical-device master data and the externally visible EUDAMED state.",
        "customer": "Medical-device manufacturers, authorised representatives, and regulatory operations teams",
        "problem": "UDI, actor, certificate, and device records can drift between PLM/QMS/SAP and mandatory EUDAMED modules.",
        "build": "Snapshot permitted EUDAMED state, map it to internal canonical records, and alert on orphan devices, UDI conflicts, certificate drift, and relationship mismatches.",
        "sources": ["s88"],
        "choke": "Regulatory record release and continued market access",
        "check": "Identifiers, certificate dates, actor relationships, and versioned record values can be diffed.",
        "asset": "Longitudinal external regulatory-state history and drift patterns.",
        "verdict": "promote_after_customer_gate",
    },
    {
        "slug": "queueready-grid-connection-readiness-os",
        "name": "QueueReady — Grid Connection Readiness OS",
        "score": 85,
        "category": "Energy Infrastructure Operations",
        "concept": "Readiness dossier and RFI-response control plane that prevents renewable and storage projects losing time because applicant-side evidence is incomplete.",
        "customer": "Renewable developers, battery-storage developers, grid consultants, and infrastructure investors",
        "problem": "Connection applications and operator RFIs stall when permits, studies, diagrams, equipment data, or ownership evidence are missing or stale.",
        "build": "Maintain a project readiness graph, map operator RFIs to documents and owners, and track gaps, deadlines, and expiry dates.",
        "sources": ["s90"],
        "choke": "Connection application submission or RFI response",
        "check": "Required artifact presence, expiry, completeness, ownership, and response deadline can be evaluated.",
        "asset": "Operator-request, application-pattern, and cycle-time dataset by jurisdiction.",
        "verdict": "deep_validate",
    },
    {
        "slug": "liabilityreplay-product-liability-evidence-simulator",
        "name": "LiabilityReplay — Product Liability Evidence Simulator",
        "score": 83,
        "category": "Product Liability & Release Evidence",
        "concept": "Adversarial reconstruction test that asks whether a manufacturer could produce the evidence file for a dated software or product claim today.",
        "customer": "Connected-product manufacturers, software vendors, insurers, and product-liability counsel",
        "problem": "Release, warning, dependency, model, patch, and approval evidence is fragmented when a dated product-liability claim arrives.",
        "build": "Run a simulated claim against release and operational systems, reconstruct the dated product state, and identify missing evidentiary links.",
        "sources": ["s92"],
        "choke": "Claim response and disclosure readiness",
        "check": "Version, deployment, test, warning, approval, vulnerability, and update records can be checked for dated closure.",
        "asset": "Cross-system evidence-gap and reconstruction-pattern corpus.",
        "verdict": "staged_hypothesis",
    },
    {
        "slug": "carbonverifier-handoff-cbam-evidence-layer",
        "name": "CarbonVerifier Handoff — CBAM Evidence-to-Verification Layer",
        "score": 82,
        "category": "Carbon Border & Trade Compliance",
        "concept": "Transforms supplier emissions evidence into verifier-ready CBAM packets and quantifies the financial exposure of missing primary data.",
        "customer": "Large EU importers, CBAM declarants, procurement teams, and accredited verifiers",
        "problem": "Calculations and supplier files do not arrive in a consistent, reviewable structure for independent verification.",
        "build": "Normalize installation, methodology, period, embedded-emissions, and supporting evidence into a verifier packet with gap-cost scenarios.",
        "sources": ["s93"],
        "choke": "Verifier acceptance and annual CBAM declaration",
        "check": "Required installation, period, method, evidence, and verifier fields can be checked for closure.",
        "asset": "Evidence-quality, verifier-question, and supplier-response dataset.",
        "verdict": "validate_large_importers",
    },
    {
        "slug": "freightcontract-testbench-efti-conformance-lab",
        "name": "FreightContract Testbench — eFTI Data Conformance Lab",
        "score": 81,
        "category": "Freight Software & Government API Testing",
        "concept": "Synthetic contract-testing and certification rehearsal for TMS and freight platforms implementing eFTI data exchanges.",
        "customer": "TMS vendors, freight platforms, logistics enterprises, and eFTI service providers",
        "problem": "Freight systems need to prove schema and workflow conformance across modes, jurisdictions, and evolving eFTI specifications before full application.",
        "build": "Generate multimodal freight fixtures, execute payload and access-flow tests, and return regulatory field-level expected/actual diffs.",
        "sources": ["s94"],
        "choke": "Platform certification and authority data handoff",
        "check": "Schema, identifier, access-link, mode, party, and jurisdiction cases can be deterministically tested.",
        "asset": "Cross-platform conformance fixture and failure corpus.",
        "verdict": "early_watch",
    },
]


ENRICHMENT_TARGETS = {
    "MarkSurvive — AI Provenance Survival Gate": ["idea-386", "s85"],
    "HumanReview Ledger": ["idea-363", "s87"],
    "MethaneContract": ["idea-399", "s89"],
    "MachineChange": ["idea-299", "idea-361", "s91"],
    "ClaimDiff": ["idea-300", "s95"],
    "CRA Clock": ["idea-401", "s96"],
    "TransitionLot": ["feature-of:packgate-ppwr-market-access-stock-router", "s84"],
    "SupplierProof SLA": ["cross-cutting-feature", "s84", "s89", "s93"],
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
        "subcategory": "operational chokepoint",
        "tags": ["august-2026", "operational-chokepoint", "machine-checkable", "evidence-compounding"],
        "status": "staged",
        "evidenceStatus": "official_forcing_function_verified_customer_demand_unproven",
        "promotionEligible": False,
        "requiresExternalEvidence": True,
        "sourceReferences": spec["sources"],
        "provenance": {
            "sourceType": "Deep Research — Large August 2026 Pass",
            "researchRunId": RUN_ID,
            "originalWordingAvailable": "full-private-attachment",
            "notes": "Primary-source forcing function verified; score and commercial claims remain analyst hypotheses.",
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
            "mainAdvantage": spec["asset"],
            "mainRisk": "Commercial urgency, access to operational data, integration burden, and willingness to pay are not yet validated.",
            "bestNextValidationStep": "Run 15 problem interviews and seek 3 paid design-partner commitments using a manual preflight or reconciliation deliverable.",
        },
        "researchAssessment": {
            "analystProvisionalOpportunityScore": spec["score"],
            "scoreScale": "0-100",
            "scoreStatus": "provisional_not_ranking_eligible",
            "initialVerdict": spec["verdict"],
            "operationalChokePoint": spec["choke"],
            "machineCheckability": spec["check"],
            "evidenceCompounding": spec["asset"],
        },
        "validationChecklist": {
            "gateStatus": "needs_customer_validation",
            "passed": False,
            "passedCount": 1,
            "failedCount": 0,
            "unknownCount": 4,
            "totalCriteria": 5,
            "scorePercentage": 20,
            "details": {
                "Official forcing function verified": "pass",
                "Duplicate risk cleared": "unknown",
                "Buyer workflow confirmed in interviews": "unknown",
                "Paid willingness-to-pay evidence": "unknown",
                "Operational data access demonstrated": "unknown",
            },
        },
        "killCriteria": {
            "killFlagged": False,
            "killCount": 0,
            "killConditions": {
                "No repeated operational failure in 15 interviews": False,
                "No buyer willing to provide representative data": False,
                "Incumbent system already resolves the full workflow": False,
                "No paid design partner after 30 qualified outreaches": False,
            },
            "killFlags": [],
        },
        "createdAt": NOW,
        "updatedAt": NOW,
        "prioritizedForValidation": spec["score"] >= 85,
        "reviewPriority": "high" if spec["score"] >= 85 else "medium",
        "priority": spec["score"],
    }


def main() -> None:
    sources = read_json_safe(SOURCES_PATH, default_if_missing=[])
    by_url = {item.get("url"): item for item in sources}
    used_ids = {item.get("id") for item in sources}
    added_sources = 0
    for sid, title, publisher, url, supports in SOURCES:
        if url in by_url:
            continue
        if sid in used_ids:
            raise RuntimeError(f"Source ID collision: {sid}")
        sources.append({
            "id": sid,
            "title": title,
            "type": "official_guidance",
            "publisher": publisher,
            "date": "2026",
            "url": url,
            "accessDate": "2026-08-10",
            "supports": supports,
            "confidenceLabel": "high",
            "sourceType": "primary",
            "researchRound": "august-2026-operational-chokepoints",
            "ideaIds": [],
            "visibility": "PUBLIC",
            "sourceClass": "PRIMARY_OR_OFFICIAL",
            "evidenceEligible": True,
            "provenanceEligible": True,
        })
        used_ids.add(sid)
        added_sources += 1

    queue = read_json_safe(QUEUE_PATH, default_if_missing=[])
    existing_slugs = {item.get("candidateSlug") or item.get("slug") for item in queue}
    added_candidates = 0
    for spec in CANDIDATES:
        if spec["slug"] in existing_slugs:
            continue
        queue.append(make_candidate(spec))
        existing_slugs.add(spec["slug"])
        added_candidates += 1

    runs = read_json_safe(RUNS_PATH, default_if_missing=[])
    if not any(run.get("runId") == RUN_ID for run in runs):
        runs.append({
            "runId": RUN_ID,
            "baselineCommit": "9c4d0d4",
            "questions": [
                "Where does source truth diverge from the real operational transaction?",
                "Which mandatory digital systems and cutovers create machine-checkable workflow blockers?",
                "Which proposed ideas are semantic duplicates of the current canonical corpus?",
            ],
            "queries": [
                "mandatory government system API 2026 operator failure",
                "regulatory cutover inventory placed on market 2026",
                "machine-readable marking survival transformation pipeline",
            ],
            "sourceCandidates": [source[0] for source in SOURCES],
            "inclusions": [candidate_id(spec["slug"]) for spec in CANDIDATES],
            "exclusions": list(ENRICHMENT_TARGETS),
            "claimsChanged": [
                "Seven distinct concepts staged; no provisional score promoted into canonical rankings.",
                "Eight semantic duplicates/features mapped to existing ideas or parent concepts.",
                "Operational choke-point, machine-checkability, and evidence compounding added as experimental research dimensions.",
            ],
            "deduplicationDecisions": ENRICHMENT_TARGETS,
            "agent": "research-intelligence-agent",
            "methodVersion": "epistemic-v3-operational-chokepoint",
            "startedAt": NOW,
            "endedAt": NOW,
            "reviewStatus": "approved_for_staging_not_canonical_promotion",
        })

    atomic_write_json(SOURCES_PATH, sources)
    atomic_write_json(QUEUE_PATH, queue)
    atomic_write_json(RUNS_PATH, runs)
    print(f"[OK] Added {added_sources} primary sources, {added_candidates} staged candidates, and recorded {RUN_ID}.")


if __name__ == "__main__":
    main()
