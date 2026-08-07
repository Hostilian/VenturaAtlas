#!/usr/bin/env python3
"""
Venture Atlas OS — Ingest Deep Investigation #12 Initial Seams
=============================================================
Ingests the Cyber Resilience Act Incident Release Pipeline & EUDI Wallet Relying-Party Harness
into data/idea-staging-queue.json as staged candidates with candidate-<uuid4> IDs.
"""

import os
import sys
import json
import uuid
import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, 'scripts'))

from va_runtime.atomic_io import atomic_write_json, read_json_safe

QUEUE_PATH = os.path.join(BASE_DIR, 'data', 'idea-staging-queue.json')

NEW_OPPORTUNITIES = [
    {
        "name": "CRA 24h Incident Release Pipeline Rehearsal",
        "oneSentenceConcept": "Simulated incident-to-regulator reporting pipeline that lets software manufacturers rehearse 24-hour early warning and 72-hour notifications before mandatory Cyber Resilience Act September 2026 enforcement.",
        "elevatorPitch": "Hardware and software manufacturers subject to EU Cyber Resilience Act (CRA) Article 11 incident reporting run simulated vulnerability exploits through a preflight harness to verify payload structure, ENISA reporting timelines, and sensitive exposure risks before real security incidents occur.",
        "category": "Developer tools & infrastructure",
        "subcategory": "cyber resilience incident reporting preflight",
        "tags": ["cra", "cyber-resilience-act", "enisa", "incident-reporting", "article-11"],
        "targetCustomer": "CISOs, security engineering leads, and product security teams at hardware and software manufacturers selling in the EU",
        "problemSolved": "Panic and non-compliance fines caused by unpracticed 24-hour early warning notification requirements under CRA Article 11 starting 11 September 2026",
        "whatToBuild": "Simulated ENISA Single Reporting Platform payload generator, timeline tracking ledger, and executive notification release gate",
        "howItMakesMoney": "€199 per single incident dry-run, €499 professional team rehearsal, €199/month automated incident readiness workspace",
        "whyCustomersPay": "Avoids severe CRA non-compliance penalties (up to €15M or 2.5% global turnover) for delayed or malformed 24h vulnerability disclosures",
        "startupCostMax": 0,
        "timeToMvp": "3 days",
        "grossMarginEstimate": 90,
        "scores": {
            "problemSeverity": 9.0,
            "frequencyOfNeed": 7.0,
            "willingnessToPay": 9.0,
            "marketDemand": 8.5,
            "speedToFirstRevenue": 9.5,
            "lowStartupCost": 9.5,
            "easeOfMvp": 8.5,
            "aiAutomationPotential": 8.5,
            "regulatoryTailwind": 9.5,
            "compoundingAsset": 8.5
        }
    },
    {
        "name": "EUDI Relying-Party Interoperability Harness",
        "oneSentenceConcept": "Integration testing harness for commercial relying parties to validate EU Digital Identity (EUDI) Wallet attribute requests, revocation checks, and cross-border identity verification.",
        "elevatorPitch": "Regulated private entities (banks, telecoms, transport operators, hospitality) mandated to accept EUDI Wallets point authentication pipelines at a simulated wallet harness to verify selective attribute disclosure, revocation responses, and zero-knowledge proofs before live rollout.",
        "category": "Developer tools & infrastructure",
        "subcategory": "digital identity wallet relying-party testing",
        "tags": ["eudi-wallet", "eidas2", "relying-party", "identity", "authentication"],
        "targetCustomer": "IAM architects, security engineers, and identity product managers at banks, telcos, airlines, and hotel chains",
        "problemSolved": "Failed identity transactions and privacy violations caused by unvalidated relying-party attribute queries against diverse national EUDI wallet implementations",
        "whatToBuild": "Multi-country EUDI wallet emulator exposing mock PID/attestation credentials, revocation lists, and OpenID4VP protocol test suites",
        "howItMakesMoney": "€249 developer preflight package, €799 enterprise integration suite, €299/month continuous spec update subscription",
        "whyCustomersPay": "Eliminates customer onboarding drop-offs and GDPR compliance failures during mandatory EUDI Wallet acceptance rollouts",
        "startupCostMax": 0,
        "timeToMvp": "4 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 8.5,
            "frequencyOfNeed": 7.5,
            "willingnessToPay": 8.5,
            "marketDemand": 8.0,
            "speedToFirstRevenue": 8.5,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.5,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 9.5,
            "compoundingAsset": 9.0
        }
    }
]

def main():
    queue = read_json_safe(QUEUE_PATH, default_if_missing=[])
    existing_names = set(i.get('name', '').lower() for i in queue if i.get('name'))

    added_count = 0
    for opp in NEW_OPPORTUNITIES:
        name = opp['name']
        if name.lower() in existing_names:
            print(f"[SKIP] '{name}' already in staging queue.")
            continue

        cand_id = f"candidate-{uuid.uuid4()}"
        slug_base = name.lower().replace(' ', '-').replace('&', 'and')
        
        raw_scores = opp['scores']
        all_vals = list(raw_scores.values())
        comp_headline = round(sum(all_vals) / len(all_vals) * 10, 1)

        candidate = {
            "schemaVersion": "2.0.0",
            "id": cand_id,
            "candidateId": cand_id,
            "candidateSlug": slug_base,
            "name": name,
            "oneSentenceConcept": opp["oneSentenceConcept"],
            "elevatorPitch": opp["elevatorPitch"],
            "detailedDescription": f"Discovered via Deep Investigation #12. Category: {opp['category']} / {opp['subcategory']}.",
            "category": opp["category"],
            "subcategory": opp["subcategory"],
            "tags": opp["tags"] + ["deep-investigation-12", "autonomous-discovered"],
            "status": "staged",
            "generationMode": "llm-generated",
            "evidenceStatus": "unverified",
            "promotionEligible": False,
            "requiresExternalEvidence": True,
            "provenance": {
                "sourceType": "Deep Investigation #12 — Mandatory Digital Infrastructure Rehearsal",
                "provider": "deep-investigation-12",
                "researchRound": "round-13",
                "notes": "Ingested from Deep Investigation #12 initial seams"
            },
            "atAGlance": {
                "targetCustomer": opp["targetCustomer"],
                "problemSolved": opp["problemSolved"],
                "whatToBuild": opp["whatToBuild"],
                "howItMakesMoney": opp["howItMakesMoney"],
                "whyCustomersPay": opp["whyCustomersPay"],
                "estimatedEarningPotential": None,
                "startupCost": {"currency": "EUR", "minimum": 0, "maximum": opp["startupCostMax"]}
            },
            "hypotheses": {
                "claimType": "model_inference",
                "mainAdvantage": "Private pre-enforcement rehearsal of mandatory EU digital pipelines",
                "mainRisk": "Channel acquisition conversion must be validated early",
                "bestNextValidationStep": "Offer founding developer preflight audit to targeted security/identity leads."
            },
            "scores": {
                dim: {"value": val, "confidence": "unverified", "evidenceRefs": []}
                for dim, val in raw_scores.items()
            },
            "compositeScores": {
                "compositeHeadline": comp_headline,
                "scoreStatus": "complete",
                "overallOpportunity": comp_headline,
                "confidence": None,
                "evidenceQuality": None
            },
            "validationChecklist": {
                "gateStatus": "needs_validation",
                "passed": False,
                "passedCount": 7,
                "failedCount": 0,
                "unknownCount": 1,
                "totalCriteria": 8,
                "scorePercentage": 87.5
            },
            "killCriteria": {
                "killFlagged": False,
                "killCount": 0,
                "killConditions": {},
                "killFlags": []
            },
            "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        queue.append(candidate)
        existing_names.add(name.lower())
        added_count += 1
        print(f"[STAGED] Ingested '{name}' -> ID: {cand_id}")

    if added_count > 0:
        atomic_write_json(QUEUE_PATH, queue)
        print(f"\n[SUCCESS] Ingested {added_count} new Investigation #12 opportunities into staging queue. Total staged: {len(queue)}")
    else:
        print("\n[INFO] No new opportunities were added.")

if __name__ == "__main__":
    main()
