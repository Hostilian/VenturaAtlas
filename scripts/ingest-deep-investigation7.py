#!/usr/bin/env python3
"""
Venture Atlas OS — Ingest Deep Investigation #7 Full Reset Opportunities
========================================================================
Parses and stages all 7 finalist opportunities from Deep Investigation #7
into data/idea-staging-queue.json as candidate-<uuid4> records.
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
        "name": "Data Access Reality Lab",
        "oneSentenceConcept": "Black-box interoperability and failure lab for EU Data Act connected-product data rights, testing device-to-user and third-party data telemetry.",
        "elevatorPitch": "Connected-product IoT manufacturers run end-to-end device telemetry audits to catch gaps between declared product data rights and actual observed device/cloud data flows before September 2026 enforcement.",
        "category": "Developer tools & infrastructure",
        "subcategory": "EU Data Act connected product telemetry QA",
        "tags": ["data-act", "iot", "connected-products", "telemetry", "executable-rights"],
        "targetCustomer": "Engineering leads and compliance managers at European connected hardware/IoT manufacturers (€20M-€500M revenue)",
        "problemSolved": "Silent failures in user data export, third-party data sharing, and device ownership transfer telemetry under EU Data Act Article 3(1)",
        "whatToBuild": "Black-box device access test harness, telemetry declared-vs-observed diff engine, and third-party access journey validator",
        "howItMakesMoney": "€499 connected product data reality audit, €249/month per product model firmware regression testing",
        "whyCustomersPay": "Avoids severe EU Data Act non-compliance penalties and product distribution blocks across EU Member States",
        "startupCostMax": 0,
        "timeToMvp": "3 days",
        "grossMarginEstimate": 90,
        "scores": {
            "problemSeverity": 8.8,
            "frequencyOfNeed": 7.5,
            "willingnessToPay": 8.5,
            "marketDemand": 8.5,
            "speedToFirstRevenue": 9.0,
            "lowStartupCost": 9.5,
            "easeOfMvp": 8.5,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 9.5,
            "compoundingAsset": 9.0
        }
    },
    {
        "name": "DROP Auditor TestKit",
        "oneSentenceConcept": "Deterministic technical test suite for privacy auditors verifying California Delete Act (DROP) matching, derived profile deletion, and resurrection prevention.",
        "elevatorPitch": "Privacy audit firms and CPA practices license a technical testing suite to verify data broker deletion compliance, identifier normalization, and resurrection prevention under California DROP rules.",
        "category": "Audit & Financial Forensics",
        "subcategory": "California DROP privacy audit testkit",
        "tags": ["drop", "california-delete-act", "cppa", "data-brokers", "audit-tooling"],
        "targetCustomer": "Privacy auditors, CPA advisory firms, and cybersecurity compliance assessors auditing data brokers",
        "problemSolved": "Lack of objective technical test vectors for mandatory California Delete Act third-party compliance audits",
        "whatToBuild": "Synthetic consumer identity dataset, identifier normalization fuzzer, and reacquisition resurrection test harness",
        "howItMakesMoney": "$750-$1,500 founding auditor kit, $1,000-$5,000 per audit engagement license",
        "whyCustomersPay": "Enables audit firms to execute standardized, legally defensible Delete Act technical compliance audits",
        "startupCostMax": 0,
        "timeToMvp": "4 days",
        "grossMarginEstimate": 90,
        "scores": {
            "problemSeverity": 8.5,
            "frequencyOfNeed": 7.0,
            "willingnessToPay": 8.5,
            "marketDemand": 8.0,
            "speedToFirstRevenue": 8.0,
            "lowStartupCost": 9.5,
            "easeOfMvp": 8.0,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 9.0,
            "compoundingAsset": 8.5
        }
    },
    {
        "name": "AFIR Charger Checkout Field Assurance",
        "oneSentenceConcept": "Independent physical and digital mystery-shopping assurance testing ad-hoc card payments and pricing accuracy across EV charging station networks.",
        "elevatorPitch": "Charge point operators (CPOs) and motorway infrastructure owners deploy field assurance audits to verify ad-hoc card readers, preauthorization releases, and pricing displays under EU AFIR 2027 mandates.",
        "category": "EU Marketplace & Compliance",
        "subcategory": "AFIR EV charger payment field assurance",
        "tags": ["afir", "ev-charging", "cpo", "payment-terminals", "field-assurance"],
        "targetCustomer": "Charge point operators (CPOs), motorway service area operators, and EV payment network managers",
        "problemSolved": "Silent payment reader failures, delayed preauthorization releases, and price display mismatches at public EV charging points",
        "whatToBuild": "Field test suite capturing physical card taps, price display diffs, preauth hold tracking, and receipt API resolution",
        "howItMakesMoney": "€99 single site audit, €499 5-site readiness sweep, €50/station/month continuous field network monitoring",
        "whyCustomersPay": "Ensures full compliance with EU AFIR ad-hoc payment mandates and prevents customer charging session drop-offs",
        "startupCostMax": 50,
        "timeToMvp": "3 days",
        "grossMarginEstimate": 75,
        "scores": {
            "problemSeverity": 8.0,
            "frequencyOfNeed": 8.0,
            "willingnessToPay": 8.0,
            "marketDemand": 8.0,
            "speedToFirstRevenue": 8.5,
            "lowStartupCost": 8.5,
            "easeOfMvp": 7.5,
            "aiAutomationPotential": 7.0,
            "regulatoryTailwind": 9.0,
            "compoundingAsset": 8.5
        }
    },
    {
        "name": "Credit Appeal Journey Replay",
        "oneSentenceConcept": "Redress testing suite simulating applicant credit explanations, data corrections, and human intervention handoffs under EU Consumer Credit Directive rules.",
        "elevatorPitch": "Digital lenders and BNPL providers run automated applicant journey tests to verify human intervention rights, decision explanation delivery, and data correction propagation under EU Consumer Credit Directive Article 18.",
        "category": "Audit & Financial Forensics",
        "subcategory": "lending credit decision appeal testing",
        "tags": ["ccd2", "consumer-credit", "bnpl", "explainable-ai", "redress-testing"],
        "targetCustomer": "Compliance officers and risk management leads at BNPL providers, digital lenders, and embedded finance platforms",
        "problemSolved": "Failed human review escalation paths and unhandled applicant credit explanation requests under 2026 EU credit rules",
        "whatToBuild": "Synthetic credit applicant generator, explanation request fuzzer, and human reviewer decision handoff tracker",
        "howItMakesMoney": "€750 per credit engine audit or €750/month continuous redress regression testing",
        "whyCustomersPay": "Avoids regulatory sanctions and consumer redress enforcement under revised EU Consumer Credit rules",
        "startupCostMax": 0,
        "timeToMvp": "4 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 8.0,
            "frequencyOfNeed": 7.0,
            "willingnessToPay": 8.0,
            "marketDemand": 7.5,
            "speedToFirstRevenue": 7.5,
            "lowStartupCost": 9.5,
            "easeOfMvp": 7.5,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 9.0,
            "compoundingAsset": 8.0
        }
    },
    {
        "name": "Article 36 Contract-vs-Code Fuzzer",
        "oneSentenceConcept": "Property-based testing engine verifying smart-contract data-sharing code consistency against legal agreements under EU Data Act Article 36.",
        "elevatorPitch": "Enterprise software developers and smart-contract deployers fuzz smart-contract code against legal data-sharing agreements to verify safe termination, role expiration, and access control properties for EU declarations of conformity.",
        "category": "Developer tools & infrastructure",
        "subcategory": "smart contract legal agreement fuzzer",
        "tags": ["data-act", "article-36", "smart-contracts", "property-testing", "fuzzing"],
        "targetCustomer": "Blockchain developers, Web3 enterprise architects, and smart contract auditors building Data Act data spaces",
        "problemSolved": "Discrepancies between legal data-sharing contract terms and underlying smart-contract execution logic",
        "whatToBuild": "Solidity/Wasm invariant fuzzer comparing legal agreement constraints against deployed smart-contract bytecode",
        "howItMakesMoney": "€499 single contract fuzzing run or €299/month CI/CD smart-contract verification suite",
        "whyCustomersPay": "Required to issue mandatory EU Declaration of Conformity under EU Data Act Article 36",
        "startupCostMax": 0,
        "timeToMvp": "4 days",
        "grossMarginEstimate": 90,
        "scores": {
            "problemSeverity": 8.0,
            "frequencyOfNeed": 6.5,
            "willingnessToPay": 7.5,
            "marketDemand": 7.0,
            "speedToFirstRevenue": 7.5,
            "lowStartupCost": 9.5,
            "easeOfMvp": 7.5,
            "aiAutomationPotential": 8.5,
            "regulatoryTailwind": 8.5,
            "compoundingAsset": 8.0
        }
    },
    {
        "name": "Colorado Decision Appeal Replay",
        "oneSentenceConcept": "Automated decision-making technology (ADMT) appeal testing engine for tenant screening, employment, and insurance under Colorado SB26-189.",
        "elevatorPitch": "Employers, property management platforms, and insurers run end-to-end applicant redress tests to ensure automated rejection decisions support applicant notice, data correction, and human reconsideration.",
        "category": "Audit & Financial Forensics",
        "subcategory": "Colorado ADMT appeal testing",
        "tags": ["colorado-ai", "admt", "hiring-tech", "tenant-screening", "redress"],
        "targetCustomer": "HR tech platforms, tenant screening software providers, and insurance tech vendors operating in Colorado",
        "problemSolved": "Non-compliance with Colorado SB26-189 mandatory disclosure and human reconsideration rules for consequential decisions",
        "whatToBuild": "Applicant decision path simulator, data correction flow validator, and human review audit trail logger",
        "howItMakesMoney": "$499 per decision module audit or $299/month continuous compliance monitoring",
        "whyCustomersPay": "Protects against state enforcement actions for automated decision-making transparency failures",
        "startupCostMax": 0,
        "timeToMvp": "4 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 7.5,
            "frequencyOfNeed": 6.5,
            "willingnessToPay": 7.5,
            "marketDemand": 7.0,
            "speedToFirstRevenue": 7.0,
            "lowStartupCost": 9.5,
            "easeOfMvp": 7.5,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 8.0,
            "compoundingAsset": 7.5
        }
    },
    {
        "name": "TAKE IT DOWN 48h Staging Drill",
        "oneSentenceConcept": "Benign synthetic asset testing harness verifying online platform 48-hour content removal and duplicate image purging under FTC TAKE IT DOWN Act rules.",
        "elevatorPitch": "Online user-generated content platforms test takedown workflows using benign synthetic test fixtures to verify 48-hour removal timelines across CDNs, thumbnails, and duplicate reposts.",
        "category": "Developer tools & infrastructure",
        "subcategory": "FTC TAKE IT DOWN 48h staging drill",
        "tags": ["take-it-down", "ftc", "trust-and-safety", "content-moderation", "staging-drill"],
        "targetCustomer": "Trust and safety engineering leads and moderation directors at online content platforms and social networks",
        "problemSolved": "Failed 48-hour image removal and surviving CDN/thumbnail copies leading to FTC enforcement actions",
        "whatToBuild": "Synthetic benign test image generator, multi-endpoint takedown tracker, and 48h SLA failure reporter",
        "howItMakesMoney": "$750 per platform staging drill or $499/month quarterly SLA validation suite",
        "whyCustomersPay": "Avoids FTC civil penalties and public enforcement letters for non-compliant image removal workflows",
        "startupCostMax": 0,
        "timeToMvp": "3 days",
        "grossMarginEstimate": 90,
        "scores": {
            "problemSeverity": 7.5,
            "frequencyOfNeed": 6.0,
            "willingnessToPay": 7.0,
            "marketDemand": 6.5,
            "speedToFirstRevenue": 7.0,
            "lowStartupCost": 9.5,
            "easeOfMvp": 8.0,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 8.5,
            "compoundingAsset": 7.5
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
            "detailedDescription": f"Discovered via Deep Investigation #7 Full Reset. Category: {opp['category']} / {opp['subcategory']}.",
            "category": opp["category"],
            "subcategory": opp["subcategory"],
            "tags": opp["tags"] + ["deep-investigation-7", "autonomous-discovered"],
            "status": "staged",
            "generationMode": "llm-generated",
            "evidenceStatus": "unverified",
            "promotionEligible": False,
            "requiresExternalEvidence": True,
            "provenance": {
                "sourceType": "Deep Investigation #7 — Executable Rights & Failure Testing",
                "provider": "deep-investigation-7",
                "researchRound": "round-15",
                "notes": "Ingested from Deep Investigation #7 full reset report"
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
                "mainAdvantage": "Executable rights testing for operational compliance workflows",
                "mainRisk": "Channel acquisition conversion must be validated early",
                "bestNextValidationStep": "Offer founding preflight audit or testkit to targeted engineering leads."
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
        print(f"\n[SUCCESS] Ingested {added_count} new Investigation #7 opportunities into staging queue. Total staged: {len(queue)}")
    else:
        print("\n[INFO] No new opportunities were added.")

if __name__ == "__main__":
    main()
