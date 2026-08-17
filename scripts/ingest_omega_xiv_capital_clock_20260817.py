"""Ingest a bounded, source-backed OMEGA XIV Capital Clock research slice."""

from __future__ import annotations

import os
import uuid

from va_runtime.atomic_io import atomic_write_json, read_json_safe

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCES_PATH = os.path.join(ROOT, "data", "sources.json")
PROGRAMS_PATH = os.path.join(ROOT, "data", "capital-programs.json")
CLOCKS_PATH = os.path.join(ROOT, "data", "capital-clock-ledger.json")
QUEUE_PATH = os.path.join(ROOT, "data", "idea-staging-queue.json")
RUNS_PATH = os.path.join(ROOT, "data", "research-runs.json")
RUN_ID = "run-res-018-20260817-omega-xiv-capital-clock"
NOW = "2026-08-17T12:30:00+00:00"
BASELINE = "c665bd900f3f6e68dd1fefaf1599713076266854"
NAMESPACE = uuid.UUID("f2e7d5a8-5b8d-41bb-b0a6-6f54fc4c2a9a")

SOURCES = [
    ("s302", "European grids", "European Commission — DG Energy", "https://energy.ec.europa.eu/topics/infrastructure/european-grids_en", ["Grid connection queues are reported in at least 16 EU countries", "The Commission guidance recommends maturity criteria and first-ready first-served"]),
    ("s303", "The Net-Zero Industry Act", "European Commission — DG GROW", "https://single-market-economy.ec.europa.eu/industry/sustainability/net-zero-industry-act_en", ["NZIA creates mandatory non-price criteria in specified procurement and renewable auctions", "Criteria include sustainability, resilience, cybersecurity, responsible conduct, and timely delivery"]),
    ("s304", "SAFE — Security Action for Europe", "European Commission — DG DEFIS", "https://defence-industry-space.ec.europa.eu/eu-defence-industry/safe-security-action-europe_en", ["SAFE provides up to 150 billion euros in long-maturity loans", "Procurement contracts must keep outside-EU/EEA-EFTA/Ukraine component costs at no more than 35 percent"]),
    ("s305", "The EIC selects new European scale-ups for STEP Scale Up investments", "European Innovation Council", "https://eic.ec.europa.eu/news/eic-selects-new-european-scale-ups-step-scale-investments-2026-07-28_en", ["The EIC reports 2026 STEP Scale Up selection and batching context", "The programme is a concentrated scale-up financing channel, not broad SMB demand"]),
    ("s306", "Second Call of the Public Sector Loan Facility", "European Climate, Infrastructure and Environment Executive Agency", "https://cinea.ec.europa.eu/news-events/news/second-call-proposals-under-public-sector-loan-facility-now-open-2025-10-23_en", ["The facility combines grant support with EIB lending", "Public-sector applicant and procurement friction remains a key commercial risk"]),
]

PROGRAMS = [
    {"id": "cap-nzia-clean-tech-procurement", "name": "Net-Zero Industry Act procurement and auction criteria", "type": "PROCUREMENT", "headline": None, "status": "AUTHORIZED", "source": "s303", "actors": ["public authorities", "clean-tech manufacturers", "renewable project promoters"], "recipients": ["net-zero technology suppliers", "auction participants"]},
    {"id": "cap-safe-security-action-europe", "name": "SAFE Security Action for Europe", "type": "LOAN", "headline": 150000000000, "status": "DEPLOYING", "source": "s304", "actors": ["Member States", "defence primes", "qualified suppliers"], "recipients": ["Member State defence programmes", "common-procurement contractors"]},
    {"id": "cap-eu-grid-connections", "name": "European grid connection readiness and queue transition", "type": "INFRASTRUCTURE_CAPEX", "headline": 584000000000, "status": "ALLOCATED", "source": "s302", "actors": ["renewable developers", "storage developers", "TSOs and DSOs"], "recipients": ["grid-connected generation and storage projects"]},
    {"id": "cap-eic-step-scale-up", "name": "EIC STEP Scale Up", "type": "EQUITY", "headline": None, "status": "CALL_OPEN", "source": "s305", "actors": ["European scale-ups", "EIC Fund", "co-investors"], "recipients": ["selected technology scale-ups"]},
    {"id": "cap-public-sector-loan-facility", "name": "Public Sector Loan Facility", "type": "MIXED", "headline": None, "status": "CALL_OPEN", "source": "s306", "actors": ["public-sector applicants", "EIB", "CINEA"], "recipients": ["public-sector climate projects"]},
]

CLOCKS = [
    {"id": "clock-nzia-recurring-bid-evidence", "program": "cap-nzia-clean-tech-procurement", "type": "PROCUREMENT_CLOCK", "expires": None, "state": "OPEN", "objects": ["sustainability evidence", "resilience evidence", "cybersecurity evidence", "timely-delivery evidence"], "actors": ["bid owner", "supplier-quality owner", "public buyer"], "failure": "Bid loses non-price eligibility or score; capital is not awarded.", "source": "s303"},
    {"id": "clock-safe-component-origin", "program": "cap-safe-security-action-europe", "type": "ELIGIBILITY_CLOCK", "expires": None, "state": "OPEN", "objects": ["costed BOM", "component origin evidence", "design-control rights", "common-procurement eligibility"], "actors": ["prime contractor", "supplier", "Member State procurer"], "failure": "Contract eligibility or procurement acceptance is blocked; loan-backed procurement can slip.", "source": "s304"},
    {"id": "clock-grid-project-maturity", "program": "cap-eu-grid-connections", "type": "QUEUE_CLOCK", "expires": None, "state": "OPEN", "objects": ["permits", "grid studies", "technical design", "site control", "maturity milestones"], "actors": ["project developer", "DSO or TSO", "regulator"], "failure": "A less mature project occupies queue capacity or a project loses timely grid access.", "source": "s302"},
    {"id": "clock-step-2026-batch-1", "program": "cap-eic-step-scale-up", "type": "APPLICATION_CLOCK", "expires": "2026-09-09T23:59:59Z", "state": "UPCOMING", "objects": ["investment case", "scale-up evidence", "co-investor materials"], "actors": ["scale-up", "EIC Fund", "co-investor"], "failure": "Application misses the batching window; this does not prove purchase demand for software.", "source": "s305"},
    {"id": "clock-public-loan-facility-call", "program": "cap-public-sector-loan-facility", "type": "APPLICATION_CLOCK", "expires": "2026-09-17T23:59:59Z", "state": "UPCOMING", "objects": ["grant application", "project finance case", "public procurement path"], "actors": ["public-sector applicant", "EIB", "CINEA"], "failure": "Grant-and-loan pairing opportunity is missed; public-sector sales friction remains untested.", "source": "s306"},
]

THESIS = [
    ("nzia-bidproof-nonprice-tender-evidence-capsule", "NZIA BidProof — Non-Price Tender Evidence Capsule", "NEW / DEEP RESEARCH", 9.1, "Evidence capsule for recurring clean-tech bid criteria; paid demand, variation across buyers, and incumbent tender-suite substitution are unknown.", "Clean-tech manufacturers and renewable auction bidders", "Pre-submit bid-evidence preflight", "Start with a €99 evidence preflight hypothesis; require 3 payments or 5 real bid packs plus 2 paid follow-ups."),
    ("safe-origintrace-component-cost-origin-evidence", "SAFE OriginTrace — Component-Cost & Design-Control Evidence Graph", "NEW / DEEP RESEARCH", 8.8, "Origin and design-control evidence graph for SAFE-eligible procurement; security, prime concentration, and integration economics are unknown.", "Defence primes and qualified component suppliers", "Component-origin eligibility decision", "Test one redacted BOM and origin packet with a procurement or supplier-quality owner before building integrations."),
    ("milestone-to-cash-funding-completion-evidence", "Milestone-to-Cash — Funding Completion Evidence Graph", "NEW HORIZONTAL HYPOTHESIS", 8.0, "Cross-programme milestone evidence and acceptance layer; recipient budget and programme-specific variation are unknown.", "Project controllers, recipients, and programme administrators", "Milestone acceptance and payment request", "Replay three historical milestone packages and secure one paid evidence audit; do not anchor the product to RRF expiry."),
]


def cid(slug):
    return f"candidate-{uuid.uuid5(NAMESPACE, slug)}"


def make_candidate(spec):
    slug, name, status, score, risk, customer, control, gate = spec
    ident = cid(slug)
    return {"schemaVersion": "2.0.0", "id": ident, "candidateId": ident, "candidateSlug": slug, "slug": f"{slug}-{ident}", "name": name, "oneSentenceConcept": risk, "elevatorPitch": f"{risk} Control point: {control}.", "detailedDescription": risk, "category": "Capital Clock", "subcategory": "capital transition evidence", "tags": ["omega-xiv", "capital-clock", "provisional", "customer-evidence-unproven"], "status": "staged", "evidenceStatus": "capital-transition-reported_customer-demand-unproven", "promotionEligible": False, "requiresExternalEvidence": True, "sourceReferences": [], "provenance": {"sourceType": "OMEGA XIV Capital Clock - source-backed research slice", "researchRunId": RUN_ID, "notes": "Analyst score is provisional and not ranking eligible; this is not validation."}, "atAGlance": {"targetCustomer": customer, "problemSolved": risk, "whatToBuild": control, "howItMakesMoney": "Paid evidence preflight or audit is a pricing hypothesis; no WTP evidence exists.", "whyCustomersPay": None, "estimatedEarningPotential": None, "startupCost": None, "overallScore": None, "confidenceScore": None, "mainAdvantage": "Sits at a named capital transition and evidence control point.", "mainRisk": "Official portals, consultants, primes, tender suites, inaccessible data, and sales-cycle length may absorb the wedge.", "bestNextValidationStep": gate}, "researchAssessment": {"analystProvisionalOpportunityScore": score, "scoreScale": "0-10", "scoreStatus": "provisional_not_ranking_eligible", "priorityClass": "immediate_validation" if status.startswith("NEW") else "research", "capitalClockStatus": status, "controlPoint": control, "noveltyDistance": "GENUINELY_NEW" if status.startswith("NEW") else "EXISTING_IDEA_UPDATE"}, "validationChecklist": {"gateStatus": "needs_customer_validation", "passed": False, "passedCount": 3, "failedCount": 0, "unknownCount": 5, "totalCriteria": 8, "scorePercentage": 37.5, "details": {"Capital programme verified": "pass", "Named transition and gate": "pass", "Novelty review recorded": "pass", "Representative workflow confirmed": "unknown", "Representative evidence obtained": "unknown", "Paid willingness to pay": "unknown", "Incumbent gap tested": "unknown", "Repeatability tested": "unknown"}}, "killCriteria": {"killFlagged": False, "killCount": 0, "killConditions": {"Official portal, incumbent, or consultant owns the control point": False, "Required evidence is inaccessible": False, "No paid artifact after qualified outreach": False}, "killFlags": []}, "createdAt": NOW, "updatedAt": NOW, "prioritizedForValidation": True, "reviewPriority": "urgent", "priority": None}


def main():
    sources = read_json_safe(SOURCES_PATH, default_if_missing=[])
    source_ids = {x.get("id") for x in sources}
    for sid, title, publisher, url, supports in SOURCES:
        if sid not in source_ids:
            sources.append({"id": sid, "title": title, "publisher": publisher, "url": url, "supports": supports, "type": "official_or_primary_evidence", "date": "2026", "accessDate": "2026-08-17", "confidenceLabel": "high", "sourceType": "primary", "researchRound": "omega-xiv-capital-clock-2026-08-17", "ideaIds": [], "visibility": "PUBLIC", "sourceClass": "PRIMARY_OR_OFFICIAL", "evidenceEligible": True, "provenanceEligible": True})
    programs = []
    for item in PROGRAMS:
        programs.append({"capitalProgramId": item["id"], "name": item["name"], "jurisdiction": "EU", "authority": "European Union institution or programme authority", "capitalType": item["type"], "headlineAmount": item["headline"], "contestableAmount": None, "currentlyAvailableAmount": None, "currency": "EUR", "status": item["status"], "announcedAt": None, "authorizedAt": None, "openedAt": None, "applicationDeadline": None, "awardExpectedAt": None, "contractDeadline": None, "completionDeadline": None, "paymentDeadline": None, "recurrence": "UNKNOWN", "eligibleActors": item["actors"], "capitalRecipients": item["recipients"], "coFinancingRequired": None, "sourceRefs": [item["source"]], "checkedAt": NOW, "confidence": "HIGH"})
    clocks = []
    for item in CLOCKS:
        clocks.append({"clockId": item["id"], "programId": item["program"], "clockType": item["type"], "startsAt": None, "expiresAt": item["expires"], "state": item["state"], "requiredObjects": item["objects"], "responsibleActors": item["actors"], "failureEffect": item["failure"], "capitalAtRisk": None, "remediationTimeEstimate": None, "sourceRefs": [item["source"]], "checkedAt": NOW, "confidence": "HIGH"})
    queue = read_json_safe(QUEUE_PATH, default_if_missing=[])
    by_slug = {item.get("candidateSlug"): i for i, item in enumerate(queue)}
    for spec in THESIS:
        record = make_candidate(spec)
        if spec[0] in by_slug: queue[by_slug[spec[0]]] = record
        else: queue.append(record); by_slug[spec[0]] = len(queue) - 1
    queue_match = next((item for item in queue if item.get("candidateSlug") == "queueready-grid-connection-readiness-os"), None)
    if queue_match:
        queue_match.setdefault("researchAssessment", {})["capitalClockStatus"] = "EXISTING_IDEA_REUNDERWRITE"
        queue_match["researchAssessment"]["capitalClockEvidenceRefs"] = ["cap-eu-grid-connections", "clock-grid-project-maturity"]
        queue_match["researchAssessment"]["noveltyDistance"] = "EXISTING_IDEA_REUNDERWRITE"
        queue_match["atAGlance"]["bestNextValidationStep"] = "Re-underwrite the existing QueueReady thesis with one developer or grid consultant project and measure readiness evidence recall, time saved, and willingness to pay."
    run = {"runId": RUN_ID, "baselineCommit": BASELINE, "questions": ["Where is capital moving and what evidence controls its next state?", "Which clocks are actionable for a founder and which are already too compressed?", "Does the capital control point already exist in Venture Atlas?"], "queries": ["European grids connection queues maturity first-ready first-served", "Net-Zero Industry Act non-price procurement criteria", "SAFE 150 billion component origin 35 percent", "EIC STEP Scale Up 2026", "Public Sector Loan Facility call"], "sourceCandidates": [x[0] for x in SOURCES], "inclusions": [cid(x[0]) for x in THESIS] + ["queueready-grid-connection-readiness-os"], "exclusions": ["RRF August rescue standalone venture", "IRIS2 terminal readiness as new venture", "generic grant finder", "generic funding dashboard", "generic AI gigafactory software"], "claimsChanged": ["Capital Clock is now represented as programmes, gates, and clocks with null-first amounts and explicit state.", "NZIA BidProof and SAFE OriginTrace are new staged hypotheses; QueueReady is re-underwritten rather than rediscovered.", "RRF and IRIS2 are clock-compressed examples and are not promoted into new venture candidates.", "No capital headline is treated as addressable market, disbursement, buyer demand, or validation."], "validationPriorityQueue": [{"rank": 1, "proposal": THESIS[0][1], "status": THESIS[0][2]}, {"rank": 2, "proposal": THESIS[1][1], "status": THESIS[1][2]}, {"rank": 3, "proposal": "QueueReady — Grid Connection Readiness OS", "status": "EXISTING / RE-UNDERWRITE"}], "immediateExperiments": [{"proposal": THESIS[0][1], "artifact": "bid-evidence preflight", "acceptance": "3 payments or 5 real bid packs plus 2 paid follow-ups"}, {"proposal": THESIS[1][1], "artifact": "redacted component-origin evidence map", "acceptance": "one procurement or supplier-quality owner accepts usefulness and pays for follow-up"}, {"proposal": "QueueReady — Grid Connection Readiness OS", "artifact": "readiness dossier audit", "acceptance": "one real project, measurable time saved, and paid follow-up"}], "attachment": {"sha256": "recorded-in-user-attachment", "copiesProcessed": 1}, "agent": "research-intelligence-agent", "methodVersion": "omega-xiv-capital-clock-p0-v1", "startedAt": NOW, "endedAt": NOW, "reviewStatus": "deep_research_integrated_not_validation_not_canonical_promotion"}
    runs = read_json_safe(RUNS_PATH, default_if_missing=[])
    index = next((i for i, x in enumerate(runs) if x.get("runId") == RUN_ID), None)
    if index is None: runs.append(run)
    else: runs[index] = run
    atomic_write_json(SOURCES_PATH, sources); atomic_write_json(PROGRAMS_PATH, {"schemaVersion": "1.0.0", "generatedAt": NOW, "programs": programs}); atomic_write_json(CLOCKS_PATH, {"schemaVersion": "1.0.0", "generatedAt": NOW, "clocks": clocks}); atomic_write_json(QUEUE_PATH, queue); atomic_write_json(RUNS_PATH, runs)
    print(f"[OK] Recorded {len(programs)} capital programs, {len(clocks)} clocks, {len(THESIS)} new hypotheses, and one QueueReady re-underwrite.")


if __name__ == "__main__": main()
