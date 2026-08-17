"""Ingest the attached Deep Research Expansion VII as private validation hypotheses."""

from __future__ import annotations

import os
import uuid

from va_runtime.atomic_io import atomic_write_json, read_json_safe


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE_PATH = os.path.join(ROOT, "data", "idea-staging-queue.json")
RUNS_PATH = os.path.join(ROOT, "data", "research-runs.json")
RUN_ID = "run-res-017-20260817-expansion-vii-transition-failure-detectors"
NOW = "2026-08-17T12:00:00+00:00"
BASELINE = "c665bd900f3f6e68dd1fefaf1599713076266854"
ATTACHMENT_SHA256 = "F876330B7DB147BD1BD61DD7DB638D7EFC64D50B4EDAAC7CCBB6949F5B936555"
NAMESPACE = uuid.UUID("6c5e9ad4-7f51-4d75-9c83-3f34e9204c4b")


CANDIDATES = [
    {
        "slug": "pidrelay-eu-customs-catalog-preflight",
        "name": "PIDRelay — Supplier PID Recovery & EU Customs Catalog Preflight",
        "score": 8.3,
        "category": "Cross-Border Commerce Evidence",
        "concept": "Supplier product-identity recovery and EU customs catalog preflight for private-label and multi-supplier sellers.",
        "customer": "Non-EU private-label and multi-supplier sellers preparing EU-bound catalogs",
        "problem": "Supplier identifiers, composition, origin, and product evidence are fragmented before customs and marketplace submission.",
        "build": "A bounded CSV audit that identifies missing product identity fields, requests recoverable supplier evidence, and produces a reviewable preflight report without asserting customs clearance.",
        "money": "€99 prepaid manual audit is a pricing hypothesis; willingness to pay is unvalidated.",
        "gate": "Run a 48-hour audit experiment with 40–60 qualified sellers; pass only with 3 prepaid audits or 5 real datasets plus 2 paid follow-ups.",
        "kill": "Kill after 100 qualified targets and 15 conversations if there are zero payments; kill if sellers cannot supply representative data or if official/incumbent workflows own the decision.",
        "tags": ["august-2026", "expansion-vii", "customs", "supplier-evidence", "short-half-life", "customer-evidence-unproven"],
    },
    {
        "slug": "permitecho-industrial-permit-evidence-reconciler",
        "name": "PermitEcho — Industrial Permit Evidence Reconciler",
        "score": 8.2,
        "category": "Industrial Permitting Evidence",
        "concept": "Version-aware reconciliation of industrial permit evidence, conditions, and conflicting project documents.",
        "customer": "Industrial permitting consultants, development managers, and project owners",
        "problem": "Permit conditions and supporting evidence are scattered across email, document versions, consultants, and project systems, creating evidence debt and rework.",
        "build": "A synthetic evidence/version-conflict demonstration followed by a paid evidence-debt audit; it must preserve source documents and surface conflicts for accountable experts.",
        "money": "€500 paid evidence-debt audit is a pricing hypothesis; willingness to pay is unvalidated.",
        "gate": "Contact permitting consultants and development managers, replay a messy historical project, and secure a paid evidence-debt audit before building a durable product.",
        "kill": "Kill if qualified experts reject the reconciled evidence output, representative historical data cannot be accessed, or no paid audit emerges after the planned outreach.",
        "tags": ["august-2026", "expansion-vii", "industrial-permitting", "evidence-debt", "version-conflict", "customer-evidence-unproven"],
    },
]


def candidate_id(slug: str) -> str:
    return f"candidate-{uuid.uuid5(NAMESPACE, slug)}"


def make_candidate(spec: dict) -> dict:
    cid = candidate_id(spec["slug"])
    return {
        "schemaVersion": "2.0.0", "id": cid, "candidateId": cid,
        "candidateSlug": spec["slug"], "slug": f'{spec["slug"]}-{cid}', "name": spec["name"],
        "oneSentenceConcept": spec["concept"], "elevatorPitch": f'{spec["problem"]} {spec["build"]}',
        "detailedDescription": spec["concept"], "category": spec["category"], "subcategory": "research-approved validation hypothesis",
        "tags": spec["tags"], "status": "staged", "evidenceStatus": "forcing_function_reported_customer_demand_unproven",
        "promotionEligible": False, "requiresExternalEvidence": True, "sourceReferences": [],
        "provenance": {"sourceType": "VenturaAtlas Deep Research Expansion VII - user supplied", "researchRunId": RUN_ID, "originalWordingAvailable": "private-attachment", "notes": "The attached report is a research receipt. No buyer interview, transaction, paid pilot, or independent validation is claimed."},
        "atAGlance": {"targetCustomer": spec["customer"], "problemSolved": spec["problem"], "whatToBuild": spec["build"], "howItMakesMoney": spec["money"], "whyCustomersPay": None, "estimatedEarningPotential": None, "startupCost": None, "overallScore": None, "confidenceScore": None, "mainAdvantage": "Targets a narrow evidence-reconciliation failure with a bounded manual-first experiment.", "mainRisk": "Buyer access, representative data, legal/accountability boundaries, and paid demand remain unvalidated.", "bestNextValidationStep": spec["gate"]},
        "researchAssessment": {"analystProvisionalOpportunityScore": spec["score"], "scoreScale": "0-10", "scoreStatus": "provisional_not_ranking_eligible", "priorityClass": "immediate_validation", "adjacentCanonicalOrCandidateRefs": [], "scoringDimensionsToMeasure": ["forcingFunction", "evidenceAccess", "workflowOwnership", "paidDemand", "falseAssuranceRisk", "timeToValue"]},
        "validationChecklist": {"gateStatus": "needs_customer_validation", "passed": False, "passedCount": 2, "failedCount": 0, "unknownCount": 6, "totalCriteria": 8, "scorePercentage": 25, "details": {"Forcing function reported": "pass", "Semantic duplicate review completed": "pass", "Representative workflow confirmed": "unknown", "Representative evidence obtained": "unknown", "Qualified expert outcome comparison": "unknown", "Paid willingness to pay": "unknown", "False-assurance boundary tested": "unknown", "Counterparty participation tested": "unknown"}},
        "killCriteria": {"killFlagged": False, "killCount": 0, "killConditions": {spec["kill"]: False}, "killFlags": []},
        "createdAt": NOW, "updatedAt": NOW, "prioritizedForValidation": True, "reviewPriority": "urgent", "priority": None,
    }


def main() -> None:
    queue = read_json_safe(QUEUE_PATH, default_if_missing=[])
    by_slug = {item.get("candidateSlug"): i for i, item in enumerate(queue)}
    added = 0
    for spec in CANDIDATES:
        record = make_candidate(spec)
        index = by_slug.get(spec["slug"])
        if index is None:
            queue.append(record)
            by_slug[spec["slug"]] = len(queue) - 1
            added += 1
        else:
            queue[index] = record

    ids = [candidate_id(spec["slug"]) for spec in CANDIDATES]
    run = {
        "runId": RUN_ID, "baselineCommit": BASELINE,
        "questions": ["Which research-approved concepts have a bounded, cheap buyer-validation experiment?", "Which forcing functions are reported but still lack buyer, data, and payment evidence?", "Which generic adjacent concepts should remain rejected or archived?"],
        "queries": ["EU customs product identity and supplier evidence", "industrial permitting evidence reconciliation", "TLS lifecycle and T+1 operational deadlines", "customs and permitting competitor/negative-space review"],
        "sourceCandidates": [], "inclusions": ids,
        "exclusions": ["generic customs catalog", "generic e-invoicing", "generic eFTI", "generic DPP", "generic CRA", "generic PPWR", "generic right-to-repair", "generic compliance dashboard"],
        "claimsChanged": ["PIDRelay and PermitEcho are staged as the only approved validation tracks from the attached report.", "The report's 8.3 and 8.2 scores are analyst hypotheses and are excluded from canonical ranking.", "No direct buyer interview, protected dataset, transaction, paid pilot, or validation claim was earned.", "PIDRelay carries a short regulatory-half-life risk; PermitEcho is retained as a structural evidence-debt hypothesis."],
        "deduplicationDecisions": {"PIDRelay": "stage_narrow_supplier_pid_preflight", "PermitEcho": "stage_narrow_permit_evidence_reconciliation", "generic_compliance_concepts": "reject_or_archive"},
        "validationPriorityQueue": [{"rank": 1, "proposal": CANDIDATES[0]["name"], "analystProvisionalScore": 8.3, "targetRefs": [ids[0]], "nextGate": CANDIDATES[0]["gate"]}, {"rank": 2, "proposal": CANDIDATES[1]["name"], "analystProvisionalScore": 8.2, "targetRefs": [ids[1]], "nextGate": CANDIDATES[1]["gate"]}],
        "immediateExperiments": [{"track": "A", "proposal": CANDIDATES[0]["name"], "duration": "48h", "acceptanceGate": "3 prepaid audits or 5 real datasets plus 2 paid follow-ups", "killGate": "0 payments after 100 qualified targets and 15 conversations"}, {"track": "B", "proposal": CANDIDATES[1]["name"], "duration": "manual-first", "acceptanceGate": "paid evidence-debt audit on a messy historical project", "killGate": "no representative data, expert rejection, or no paid audit"}],
        "attachment": {"sha256": ATTACHMENT_SHA256, "lines": 1132, "copiesProcessed": 1},
        "agent": "research-intelligence-agent", "methodVersion": "deep-research-expansion-vii-transition-failure-detectors-v1", "startedAt": NOW, "endedAt": NOW,
        "reviewStatus": "approved_for_private_staging_and_validation_not_canonical_promotion",
    }
    runs = read_json_safe(RUNS_PATH, default_if_missing=[])
    index = next((i for i, item in enumerate(runs) if item.get("runId") == RUN_ID), None)
    if index is None:
        runs.append(run)
    else:
        runs[index] = run
    atomic_write_json(QUEUE_PATH, queue)
    atomic_write_json(RUNS_PATH, runs)
    print(f"[OK] Added {added} private validation candidates and recorded {RUN_ID}; no canonical ideas or scores changed.")


if __name__ == "__main__":
    main()
