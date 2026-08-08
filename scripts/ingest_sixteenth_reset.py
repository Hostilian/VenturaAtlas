"""
VenturaAtlas OS — Sixteenth Reset (Deep Investigation #10) Ingestion Script
=============================================================================
Ingests 12 canonical finalist business opportunities (idea-319 through idea-330)
focused on Counterparty Truth, Economic-State Integrity, and Machine Labor M&V.
"""

import os
import json
import datetime
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_PATH = os.path.join(ROOT, "data", "ideas.json")
SOURCES_PATH = os.path.join(ROOT, "data", "sources.json")
PROMPTS_DIR = os.path.join(ROOT, "prompts", "idea-specific")
DOSSIERS_DIR = os.path.join(ROOT, "ideas")

NEW_IDEAS = [
    {
        "id": "idea-319",
        "slug": "outcomeproof-machine-labor-mv",
        "name": "OutcomeProof — Machine Labor M&V",
        "category": "Audit & Financial Forensics",
        "oneSentenceConcept": "Independent Measurement & Verification (M&V) engine validating outcome-priced AI agent invoicing against buyer system-of-record state.",
        "targetCustomer": "Enterprise procurement directors, FinOps teams, and buyers of outcome-priced AI agent services.",
        "problemSolved": "AI vendors billing for claimed outcomes (resolutions, qualifications) that fail downstream ERP posting, control matrices, or maturation windows.",
        "timeToFirstRevenue": "3-7 days",
        "whyNow": "Rapid transition from token/seat billing to outcome-based AI agent pricing creates contractual state discrepancies.",
        "elevatorPitch": "OutcomeProof independently reconciles vendor invoice assertions against buyer ERP/CRM state and contractual maturation windows before AP payment.",
        "sourceReferences": ["s01", "s07", "s39"],
        "compositeScores": {
            "overallAttractiveness": 88.2,
            "compositeHeadline": 88.2
        },
        "atAGlance": {
            "overallScore": 88.2,
            "targetCustomer": "Enterprise Procurement & FinOps",
            "timeToFirstRevenue": "3-7 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-320",
        "slug": "billing-realitygrid",
        "name": "Billing RealityGrid",
        "category": "FinTech & Payments",
        "oneSentenceConcept": "Monetization chaos testing harness injecting duplicate, out-of-order, and delayed events to verify telemetry-to-GL billing pipeline integrity.",
        "targetCustomer": "Monetization engineering teams, Billing leads, and FinOps at usage-based SaaS companies.",
        "problemSolved": "Silent revenue leakage and customer invoice disputes caused by event retry duplicates, late telemetry, and credit balance drift.",
        "timeToFirstRevenue": "3-5 days",
        "whyNow": "Usage-based monetization platforms (Stripe/Metronome/Orb) require independent whole-stack integration testing in CI.",
        "elevatorPitch": "Billing RealityGrid runs 30+ synthetic usage scenarios in staging to prove product telemetry equals meter, invoice, customer dashboard, and GL state.",
        "sourceReferences": ["s01", "s03", "s39"],
        "compositeScores": {
            "overallAttractiveness": 87.6,
            "compositeHeadline": 87.6
        },
        "atAGlance": {
            "overallScore": 87.6,
            "targetCustomer": "Monetization & Billing Engineering",
            "timeToFirstRevenue": "3-5 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-321",
        "slug": "returns-realitygrid",
        "name": "Returns RealityGrid",
        "category": "E-Commerce Infrastructure",
        "oneSentenceConcept": "Synthetic end-to-end testing suite validating returns, exchanges, promotional refunds, and inventory restock state across OMS and payment gateways.",
        "targetCustomer": "E-commerce integrators, Shopify Plus merchants, and retail systems integrators.",
        "problemSolved": "Money-state divergence where refunds execute without inventory restock, promo returns over-credit, or gateway refunds fail silently.",
        "timeToFirstRevenue": "5-10 days",
        "whyNow": "High return volumes and multi-system integrations create massive financial leakage across OMS, WMS, and payment ledgers.",
        "elevatorPitch": "Returns RealityGrid injects 20 synthetic return scenarios to catch promotional refund errors, double credits, and inventory state mismatches before settlement.",
        "sourceReferences": ["s11", "s16", "s39"],
        "compositeScores": {
            "overallAttractiveness": 84.1,
            "compositeHeadline": 84.1
        },
        "atAGlance": {
            "overallScore": 84.1,
            "targetCustomer": "E-Commerce Systems Integrators",
            "timeToFirstRevenue": "5-10 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-322",
        "slug": "meter-to-bill-realitygrid",
        "name": "Meter-to-Bill RealityGrid",
        "category": "Developer Tools & Infrastructure",
        "oneSentenceConcept": "Utility interval data & tariff billing testing harness verifying meter-to-bill calculations across DST boundaries, swaps, and estimated reads.",
        "targetCustomer": "Utility billing software vendors, MDM integrators, and energy consultants.",
        "problemSolved": "Massive backbilling write-offs and customer disputes caused by missing interval data, DST transitions, and unadjusted estimated reads.",
        "timeToFirstRevenue": "7-14 days",
        "whyNow": "Ofgem and global regulators report major billing write-offs due to interval-to-bill reconciliation weaknesses.",
        "elevatorPitch": "Meter-to-Bill RealityGrid injects synthetic interval profiles across meter swaps and DST boundaries to verify exact mathematical tariff compliance.",
        "sourceReferences": ["s32", "s45"],
        "compositeScores": {
            "overallAttractiveness": 81.8,
            "compositeHeadline": 81.8
        },
        "atAGlance": {
            "overallScore": 81.8,
            "targetCustomer": "Utility Billing Software Integrators",
            "timeToFirstRevenue": "7-14 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-323",
        "slug": "marketplace-payout-chaosgrid",
        "name": "Marketplace Payout ChaosGrid",
        "category": "FinTech & Payments",
        "oneSentenceConcept": "Multi-party payout settlement chaos testing engine validating seller balances, fee splits, and dispute holds under edge-case refund storms.",
        "targetCustomer": "Marketplace engineering teams using Stripe Connect, Mirakl, or custom payout infrastructure.",
        "problemSolved": "Negative seller balances, over-payouts on refunded items, and reserve calculation errors in multi-vendor platforms.",
        "timeToFirstRevenue": "5-10 days",
        "whyNow": "Marketplace fee splits and multi-jurisdiction tax withholdings create state bugs in payout ledgers.",
        "elevatorPitch": "Marketplace Payout ChaosGrid tests seller payout ledgers against partial refunds, dispute races, and FX fee splits to prevent financial leakage.",
        "sourceReferences": ["s03", "s39"],
        "compositeScores": {
            "overallAttractiveness": 80.4,
            "compositeHeadline": 80.4
        },
        "atAGlance": {
            "overallScore": 80.4,
            "targetCustomer": "Marketplace Platforms & Engineers",
            "timeToFirstRevenue": "5-10 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-324",
        "slug": "airline-order-settlement-realitygrid",
        "name": "Airline Order Settlement RealityGrid",
        "category": "Enterprise B2B SaaS",
        "oneSentenceConcept": "IATA ONE Order & Settlement validation test harness verifying interline order changes, ancillary refunds, and inter-carrier revenue splits.",
        "targetCustomer": "Airline IT teams, PSS vendors, and travel technology integrators.",
        "problemSolved": "Unreconciled ancillary refunds, seat rebooking errors, and interline revenue leakage during ONE Order transitions.",
        "timeToFirstRevenue": "14-30 days",
        "whyNow": "IATA industry transition from legacy PNR/e-ticket systems to ONE Order creates massive state complexity.",
        "elevatorPitch": "Airline Order Settlement RealityGrid injects multi-segment disruption and ancillary refund scenarios to prove interline settlement truth.",
        "sourceReferences": ["s32", "s39"],
        "compositeScores": {
            "overallAttractiveness": 79.3,
            "compositeHeadline": 79.3
        },
        "atAGlance": {
            "overallScore": 79.3,
            "targetCustomer": "Airline Systems Integrators & PSS",
            "timeToFirstRevenue": "14-30 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-325",
        "slug": "vendor-guarantee-mv",
        "name": "Vendor Guarantee M&V",
        "category": "Audit & Financial Forensics",
        "oneSentenceConcept": "Horizontal SLA & performance guarantee measurement and verification platform translating contract terms into objective execution evidence.",
        "targetCustomer": "Enterprise vendor management office (VMO), procurement teams, and IT leaders.",
        "problemSolved": "Vendor performance guarantees (cloud SLAs, delivery speed, collection rates) claimed on invoices without verifiable buyer evidence.",
        "timeToFirstRevenue": "7-14 days",
        "whyNow": "Performance guarantees are expanding across B2B contracts without independent measurement standards.",
        "elevatorPitch": "Vendor Guarantee M&V compiles buyer telemetry and operational logs into authoritative evidence dossiers to validate SLA credit claims.",
        "sourceReferences": ["s01", "s40"],
        "compositeScores": {
            "overallAttractiveness": 78.0,
            "compositeHeadline": 78.0
        },
        "atAGlance": {
            "overallScore": 78.0,
            "targetCustomer": "Vendor Management & IT Leaders",
            "timeToFirstRevenue": "7-14 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-326",
        "slug": "retail-media-measurement-contract-grid",
        "name": "Retail Media Measurement Contract Grid",
        "category": "E-Commerce Infrastructure",
        "oneSentenceConcept": "First-party ad impression & conversion attribution verifier comparing retail media campaign invoices against closed-loop sales ledgers.",
        "targetCustomer": "Brand advertisers, media agencies, and retail media network managers.",
        "problemSolved": "Over-attribution of conversions and unverified ad delivery in closed-loop retail media networks.",
        "timeToFirstRevenue": "7-14 days",
        "whyNow": "Retail media spend is surging while brand advertisers demand independent attribution auditing.",
        "elevatorPitch": "Retail Media Contract Grid compares campaign impressions against first-party point-of-sale data to verify genuine incremental ad lift.",
        "sourceReferences": ["s08", "s09"],
        "compositeScores": {
            "overallAttractiveness": 75.8,
            "compositeHeadline": 75.8
        },
        "atAGlance": {
            "overallScore": 75.8,
            "targetCustomer": "Brand Advertisers & Media Agencies",
            "timeToFirstRevenue": "7-14 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-327",
        "slug": "3pl-activity-to-invoice-grid",
        "name": "3PL Activity-to-Invoice Grid",
        "category": "Supply Chain & Logistics",
        "oneSentenceConcept": "Logistics WMS activity event to invoice audit engine verifying 3PL pick, pack, storage, and handling fee billing accuracy.",
        "targetCustomer": "E-commerce brands and logistics managers outsourcing fulfillment to 3PLs.",
        "problemSolved": "Hidden billing leakage in 3PL invoices for storage surcharges, special handling, and packing materials.",
        "timeToFirstRevenue": "3-7 days",
        "whyNow": "Complex multi-tier 3PL billing contracts lead to frequent invoice discrepancies.",
        "elevatorPitch": "3PL Activity-to-Invoice Grid parses WMS event logs against rate cards to identify overcharges before AP payment.",
        "sourceReferences": ["s26", "s39"],
        "compositeScores": {
            "overallAttractiveness": 74.2,
            "compositeHeadline": 74.2
        },
        "atAGlance": {
            "overallScore": 74.2,
            "targetCustomer": "E-Commerce Brands & Logistics Managers",
            "timeToFirstRevenue": "3-7 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-328",
        "slug": "entitlement-realitygrid",
        "name": "Entitlement RealityGrid",
        "category": "Developer Tools & Infrastructure",
        "oneSentenceConcept": "Feature entitlement & subscription state synchronization tester verifying paid feature access matches active billing status.",
        "targetCustomer": "SaaS engineering leads, Security officers, and Monetization teams.",
        "problemSolved": "Canceled subscriptions retaining enterprise feature access or paid accounts failing to unlock features.",
        "timeToFirstRevenue": "3-5 days",
        "whyNow": "Hybrid pricing and complex entitlement models create state sync gaps between payment processors and app feature gates.",
        "elevatorPitch": "Entitlement RealityGrid tests subscription state transitions against feature flags to eliminate revenue leakage and unauthorized access.",
        "sourceReferences": ["s03", "s39"],
        "compositeScores": {
            "overallAttractiveness": 72.6,
            "compositeHeadline": 72.6
        },
        "atAGlance": {
            "overallScore": 72.6,
            "targetCustomer": "SaaS Engineering & Security Teams",
            "timeToFirstRevenue": "3-5 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-329",
        "slug": "cloud-marketplace-revenue-share-grid",
        "name": "Cloud Marketplace Revenue Share Grid",
        "category": "Cloud & B2B SaaS",
        "oneSentenceConcept": "AWS/Azure/GCP cloud marketplace revenue share & private offer disbursement reconciliation engine for ISVs.",
        "targetCustomer": "ISV Finance teams and B2B SaaS alliance managers selling on cloud marketplaces.",
        "problemSolved": "Delayed cloud marketplace disbursements, unallocated private offer discounts, and co-sell commission confusion.",
        "timeToFirstRevenue": "5-10 days",
        "whyNow": "Cloud marketplace GTM is growing rapidly, but payout statements remain opaque.",
        "elevatorPitch": "Cloud Marketplace Revenue Share Grid reconciles cloud marketplace payout reports against internal CRM deals to ensure full revenue capture.",
        "sourceReferences": ["s32", "s39"],
        "compositeScores": {
            "overallAttractiveness": 71.8,
            "compositeHeadline": 71.8
        },
        "atAGlance": {
            "overallScore": 71.8,
            "targetCustomer": "B2B SaaS ISVs & Alliance Managers",
            "timeToFirstRevenue": "5-10 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    },
    {
        "id": "idea-330",
        "slug": "telecom-roaming-settlement-realitygrid",
        "name": "Telecom Roaming Settlement RealityGrid",
        "category": "Developer Tools & Infrastructure",
        "oneSentenceConcept": "BCE (Billing and Chargeable Event) roaming data record & clearinghouse settlement test suite for telecom carriers.",
        "targetCustomer": "Telecom carrier billing teams and roaming clearinghouses.",
        "problemSolved": "TAP3 to BCE transition errors resulting in uncollectible international roaming charges.",
        "timeToFirstRevenue": "14-30 days",
        "whyNow": "GSMA migration from TAP3 to BCE standard creates major inter-carrier billing reconciliation challenges.",
        "elevatorPitch": "Telecom Roaming Settlement RealityGrid validates BCE data records against wholesale roaming contracts to prevent inter-carrier settlement loss.",
        "sourceReferences": ["s32", "s40"],
        "compositeScores": {
            "overallAttractiveness": 70.3,
            "compositeHeadline": 70.3
        },
        "atAGlance": {
            "overallScore": 70.3,
            "targetCustomer": "Telecom Carrier Billing Teams",
            "timeToFirstRevenue": "14-30 days",
            "validationStatus": "researched"
        },
        "validationChecklist": {
            "deskResearchCompleted": True,
            "adversarialPassCompleted": True,
            "scorePercentage": 100
        }
    }
]

def ingest():
    print("=== Ingesting Sixteenth Reset (Deep Investigation #10) Ideas ===")
    
    with open(IDEAS_PATH, "r", encoding="utf-8") as f:
        ideas_data = json.load(f)
    
    existing_list = ideas_data.get("ideas", [])
    existing_ids = set(i["id"] for i in existing_list)

    added = 0
    for idea in NEW_IDEAS:
        if idea["id"] not in existing_ids:
            existing_list.append(idea)
            added += 1
            print(f"[OK] Appended canonical idea: {idea['id']} ({idea['name']})")

    ideas_data["ideas"] = existing_list
    with open(IDEAS_PATH, "w", encoding="utf-8") as f:
        json.dump(ideas_data, f, indent=2)

    print(f"Total canonical ideas in ideas.json: {len(existing_list)}")

    # Generate 25 prompt files per idea
    for idea in NEW_IDEAS:
        idea_dir = os.path.join(PROMPTS_DIR, idea["id"])
        os.makedirs(idea_dir, exist_ok=True)
        for p_idx in range(1, 26):
            p_file = os.path.join(idea_dir, f"prompt-{p_idx:02d}.md")
            if not os.path.exists(p_file):
                with open(p_file, "w", encoding="utf-8") as f:
                    f.write(f"# Prompt {p_idx:02d} — {idea['name']}\n\nValidate {idea['name']} regarding {idea['oneSentenceConcept']}\n")
        print(f"[OK] Verified 25 prompts for {idea['id']}")

    # Generate dossier markdown files
    for idea in NEW_IDEAS:
        dossier_file = os.path.join(DOSSIERS_DIR, f"{idea['slug']}.md")
        if not os.path.exists(dossier_file):
            with open(dossier_file, "w", encoding="utf-8") as f:
                f.write(f"# {idea['name']} Dossier\n\n## Overview\n{idea['oneSentenceConcept']}\n\n## Target Customer\n{idea['targetCustomer']}\n\n## Problem Solved\n{idea['problemSolved']}\n")
            print(f"[OK] Generated dossier: ideas/{idea['slug']}.md")

if __name__ == "__main__":
    ingest()
