#!/usr/bin/env python3
"""
Venture Atlas OS — Ingest Deep Investigation #5 Opportunities
=============================================================
Parses and stages the 10 new opportunities from Deep Investigation #5 into
data/idea-staging-queue.json as staged candidates with candidate-<uuid4> IDs.
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
        "name": "PelletLoss Pre-Certification Twin",
        "oneSentenceConcept": "Simulated audit twin that detects documentary and physical failures in plastic-pellet-loss control systems before external certifiers arrive under Regulation (EU) 2025/2365.",
        "elevatorPitch": "Plastics manufacturers and converters facing mandatory microplastic pellet loss certification under EU 2025/2365 upload risk plans and facility evidence to receive a pre-certification failure report, uncovering gaps privately before expensive public audits.",
        "category": "EU Marketplace & Compliance",
        "subcategory": "microplastic pellet loss pre-certification",
        "tags": ["plastics", "pellet-loss", "pre-certification", "microplastics", "eu-2025-2365"],
        "targetCustomer": "EHS directors and plant managers at EU plastic converters, compounders, and resin warehouses",
        "problemSolved": "Mandatory 2027 third-party pellet loss certification with unannounced spot checks creating high risk of expensive audit failure",
        "whatToBuild": "Source-linked simulated audit engine generating pre-certification failure reports and corrective action retest maps",
        "howItMakesMoney": "€149 remote preflight audit, scaling to €299-€499 per site and €99/month recurring readiness workspace",
        "whyCustomersPay": "Saves tens of thousands in auditor re-inspection fees and prevents operational suspension risk",
        "startupCostMax": 0,
        "timeToMvp": "3 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 8.5,
            "frequencyOfNeed": 7.5,
            "willingnessToPay": 8.5,
            "marketDemand": 8.0,
            "speedToFirstRevenue": 9.0,
            "lowStartupCost": 9.5,
            "easeOfMvp": 8.5,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 9.0,
            "compoundingAsset": 8.5
        }
    },
    {
        "name": "AI Marking Survivability Lab",
        "oneSentenceConcept": "Whole-pipeline regression testing harness for AI content markers, measuring provenance signal survival across real-world CDN, compression, and social delivery chains.",
        "elevatorPitch": "Generative AI providers and media platforms facing EU AI Act Article 50 marking mandates run marked outputs through a transformation lab to identify exact delivery nodes that strip or corrupt machine-readable provenance.",
        "category": "AI evaluation & launch gates",
        "subcategory": "AI marking & provenance testing",
        "tags": ["ai-act", "article-50", "c2pa", "watermark", "survivability"],
        "targetCustomer": "Product engineering and compliance heads at generative AI providers and creative automation platforms",
        "problemSolved": "AI transparency markers breaking silently during routine image/video compression, CDN processing, and platform uploads",
        "whatToBuild": "Automated pipeline transformation graph subjecting C2PA/watermark outputs to controlled multi-platform degradation tests",
        "howItMakesMoney": "€99 per single pipeline audit, €249 professional audit, €149/month CI regression suite",
        "whyCustomersPay": "Prevents regulatory non-compliance fines under EU AI Act transparency rules",
        "startupCostMax": 0,
        "timeToMvp": "2 days",
        "grossMarginEstimate": 90,
        "scores": {
            "problemSeverity": 8.0,
            "frequencyOfNeed": 7.0,
            "willingnessToPay": 7.5,
            "marketDemand": 8.0,
            "speedToFirstRevenue": 8.5,
            "lowStartupCost": 9.5,
            "easeOfMvp": 8.0,
            "aiAutomationPotential": 8.5,
            "regulatoryTailwind": 9.0,
            "compoundingAsset": 7.5
        }
    },
    {
        "name": "eFTI Certification Preflight",
        "oneSentenceConcept": "Automated regression test suite for transport software vendors preparing for mandatory EU electronic freight transport information (eFTI) platform certification.",
        "elevatorPitch": "Logistics and TMS software developers targeting the July 2027 EU eFTI mandate point staging environments at a preflight harness to validate regulatory data schemas, error codes, and access permissions before accredited conformity assessment.",
        "category": "Developer tools & infrastructure",
        "subcategory": "regulatory transport API testing",
        "tags": ["efti", "freight", "logistics", "tms", "euefti-2027"],
        "targetCustomer": "CTOs and lead architects at European TMS, WMS, and logistics software vendors",
        "problemSolved": "High cost and delay of failed independent conformity assessments under EU Regulation 2020/1056",
        "whatToBuild": "Automated eFTI specification compiler and API test harness producing machine-readable certification preflight evidence",
        "howItMakesMoney": "€199 developer preflight, €499-€999 full preflight package, €149-€399/month spec drift subscription",
        "whyCustomersPay": "Reduces accredited body audit cycle time and avoids costly platform recertification failures",
        "startupCostMax": 0,
        "timeToMvp": "5 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 8.0,
            "frequencyOfNeed": 7.0,
            "willingnessToPay": 8.0,
            "marketDemand": 7.5,
            "speedToFirstRevenue": 8.0,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.5,
            "aiAutomationPotential": 8.5,
            "regulatoryTailwind": 9.5,
            "compoundingAsset": 9.0
        }
    },
    {
        "name": "EUDR Reference Integrity Gate",
        "oneSentenceConcept": "Pre-submission validation engine that verifies EUDR due diligence statement references, geolocation polygons, and supply chain evidence prior to TRACES submission.",
        "elevatorPitch": "Traders and operators handling timber, cattle, cocoa, coffee, oil palm, rubber, and soy run supply chain dossiers through an automated integrity check before filing in the EU TRACES system, preventing customs delays and rejection.",
        "category": "EU Marketplace & Compliance",
        "subcategory": "deforestation due diligence validation",
        "tags": ["eudr", "deforestation", "traces", "geolocation", "compliance"],
        "targetCustomer": "Import/export compliance directors and sustainability leads at commodity trading houses and food/timber processors",
        "problemSolved": "Draft EUDR due diligence statements failing automated TRACES checks or containing invalid plot geolocation polygons",
        "whatToBuild": "Standalone GIS and reference integrity gate validating plot coordinates, land cover overlap, and supplier declaration chains",
        "howItMakesMoney": "€15-€30 per statement validation or €299-€999/month enterprise subscription",
        "whyCustomersPay": "Eliminates port customs holds and supply chain blockages caused by rejected TRACES filings",
        "startupCostMax": 0,
        "timeToMvp": "4 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 8.5,
            "frequencyOfNeed": 8.0,
            "willingnessToPay": 8.0,
            "marketDemand": 8.5,
            "speedToFirstRevenue": 8.0,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.0,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 9.0,
            "compoundingAsset": 7.0
        }
    },
    {
        "name": "Refrigerant Reclaim Yield Ledger",
        "oneSentenceConcept": "Closed-loop yield reconciliation system tracking HVAC recovered F-gas volumes from jobsite extraction to certified reclaimed credit.",
        "elevatorPitch": "Commercial HVAC contractors and property managers log recovered gas metrics to benchmark technician yield, identify cylinder loss, and maximize financial credits for reclaimed fluorinated refrigerants.",
        "category": "Audit & Financial Forensics",
        "subcategory": "HVAC F-gas recovery reconciliation",
        "tags": ["fgas", "hvac", "refrigerant", "reclaim", "circular-economy"],
        "targetCustomer": "Operations directors at commercial HVAC maintenance companies and industrial refrigeration fleets",
        "problemSolved": "Valuable recovered F-gas disappearing between jobsite extraction and reclaimer credit due to lack of chain-of-custody yield tracking",
        "whatToBuild": "Cylinder-to-credit reconciliation ledger comparing expected vs actual reclaimed gas yields across sites and technicians",
        "howItMakesMoney": "€25-€40 per cylinder tracking cycle or 10-15% of recovered refrigerant credit optimization",
        "whyCustomersPay": "Recovers thousands of Euros in lost GWP refrigerant value while meeting F-gas recordkeeping rules",
        "startupCostMax": 0,
        "timeToMvp": "5 days",
        "grossMarginEstimate": 80,
        "scores": {
            "problemSeverity": 7.5,
            "frequencyOfNeed": 8.0,
            "willingnessToPay": 7.5,
            "marketDemand": 7.0,
            "speedToFirstRevenue": 8.0,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.5,
            "aiAutomationPotential": 7.5,
            "regulatoryTailwind": 8.5,
            "compoundingAsset": 8.0
        }
    },
    {
        "name": "Textile EPR Route Reconciliation",
        "oneSentenceConcept": "Cross-border eco-fee reconciliation ledger for apparel brands navigating fragmented European textile Producer Responsibility Organizations (PROs).",
        "elevatorPitch": "Fashion brands and multi-national footwear sellers reconcile SKU material composition and sales volumes across French, Dutch, and emerging national EPR schemes to prevent double-payment and optimize eco-modulated fee tiers.",
        "category": "EU Marketplace & Compliance",
        "subcategory": "textile extended producer responsibility",
        "tags": ["textile-epr", "apparel", "eco-fee", "pro", "espr"],
        "targetCustomer": "Finance and sustainability managers at mid-sized European fashion and footwear brands",
        "problemSolved": "Complex multi-jurisdictional eco-fee calculations causing overpayment and compliance reporting errors across EU national PROs",
        "whatToBuild": "SKU material breakdown to national PRO fee calculator and evidence audit generator",
        "howItMakesMoney": "€15-€30 per SKU audit or €199-€499/month brand subscription",
        "whyCustomersPay": "Reduces annual EPR eco-fee liabilities through verified eco-design tier matching",
        "startupCostMax": 0,
        "timeToMvp": "4 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 7.5,
            "frequencyOfNeed": 7.5,
            "willingnessToPay": 7.5,
            "marketDemand": 7.5,
            "speedToFirstRevenue": 8.0,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.5,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 8.5,
            "compoundingAsset": 7.0
        }
    },
    {
        "name": "Unsold Stock Disposition Evidence Rail",
        "oneSentenceConcept": "Vendor-neutral reconciliation ledger that tracks unsold fashion inventory across resale, donation, repair, and legal recycling to comply with ESPR destruction bans.",
        "elevatorPitch": "Apparel and luxury brands facing the July 2026 ESPR unsold goods destruction ban log inventory dispositions to generate auditable proof of non-destruction and derogation compliance.",
        "category": "Consumer Advocacy & Transparency",
        "subcategory": "unsold inventory disposition tracking",
        "tags": ["espr", "unsold-goods", "fashion", "recommerce", "circularity"],
        "targetCustomer": "Supply chain and sustainability directors at European clothing and footwear brands",
        "problemSolved": "Lack of auditable evidence tracking where unsold inventory ends up across fragmented third-party recommerce, donation, and recycling channels",
        "whatToBuild": "ERP-integrated disposition ledger validating end-state certificate of transfer for every removed SKU batch",
        "howItMakesMoney": "€25-€50 per batch audit or €499-€1,499/month enterprise compliance workspace",
        "whyCustomersPay": "Avoids severe regulatory penalties under EU Ecodesign rules prohibiting destruction of unsold apparel",
        "startupCostMax": 0,
        "timeToMvp": "5 days",
        "grossMarginEstimate": 80,
        "scores": {
            "problemSeverity": 8.0,
            "frequencyOfNeed": 7.0,
            "willingnessToPay": 7.5,
            "marketDemand": 7.0,
            "speedToFirstRevenue": 7.0,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.0,
            "aiAutomationPotential": 7.5,
            "regulatoryTailwind": 9.0,
            "compoundingAsset": 7.5
        }
    },
    {
        "name": "Carbon Permanence Diligence Compiler",
        "oneSentenceConcept": "Reversal-risk diligence engine for corporate carbon buyers assessing buffer pool adequacy and legal permanence structures across CDR projects.",
        "elevatorPitch": "Enterprise sustainability teams and carbon offset buyers evaluate permanent removal claims against EU Carbon Removal Certification Framework (CRCF) standards to quantify reversal liabilities.",
        "category": "Research & knowledge tools",
        "subcategory": "carbon removal reversal diligence",
        "tags": ["crcf", "carbon-removal", "cdr", "permanence", "reversal-risk"],
        "targetCustomer": "Chief Sustainability Officers and carbon procurement heads at corporate net-zero buyers",
        "problemSolved": "Unquantified reversal risk and opaque buffer pool mechanics in voluntary and compliance carbon removal contracts",
        "whatToBuild": "Diligence compiler evaluating project monitoring periods, buffer allocations, and contractual reversal guarantees",
        "howItMakesMoney": "€299-€999 per project diligence dossier or €499/month portfolio monitoring",
        "whyCustomersPay": "Protects corporate buyers against greenwashing claims and balance sheet impairment from reversed carbon credits",
        "startupCostMax": 0,
        "timeToMvp": "5 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 7.0,
            "frequencyOfNeed": 6.5,
            "willingnessToPay": 7.5,
            "marketDemand": 7.0,
            "speedToFirstRevenue": 7.0,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.0,
            "aiAutomationPotential": 7.5,
            "regulatoryTailwind": 8.5,
            "compoundingAsset": 7.5
        }
    },
    {
        "name": "Maritime EUA Reconciliation",
        "oneSentenceConcept": "Charter-party EU Emissions Trading System (ETS) allowance reconciliation workspace matching vessel AIS track data against owner-charterer allowance transfer obligations.",
        "elevatorPitch": "Shipowners and charterers reconcile EU ETS allowance transfers based on BIMCO clauses and actual voyage emissions, automating monthly allowance deficit calculations.",
        "category": "Audit & Financial Forensics",
        "subcategory": "maritime ETS charterer reconciliation",
        "tags": ["maritime-ets", "shipping", "eua", "bimco", "charterparty"],
        "targetCustomer": "Commercial operators and chartering managers at European shipping companies and commodity charterers",
        "problemSolved": "Friction and payment disputes between owners and charterers over EU Allowance (EUA) surrender obligations for voyage segments",
        "whatToBuild": "AIS voyage data to EU ETS emissions calculator and BIMCO clause allowance transfer reconciliation ledger",
        "howItMakesMoney": "€15-€30 per voyage reconciliation or €399-€899/month fleet workspace",
        "whyCustomersPay": "Prevents financial disputes over multi-million Euro carbon allowance transfers in maritime chartering",
        "startupCostMax": 0,
        "timeToMvp": "4 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 7.5,
            "frequencyOfNeed": 7.0,
            "willingnessToPay": 7.0,
            "marketDemand": 7.0,
            "speedToFirstRevenue": 7.5,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.5,
            "aiAutomationPotential": 7.5,
            "regulatoryTailwind": 8.5,
            "compoundingAsset": 7.0
        }
    },
    {
        "name": "CORSIA Eligibility Packet",
        "oneSentenceConcept": "Aviation carbon offset eligibility verification engine validating CORSIA Phase 2 compliance credits and Article 6 corresponding adjustments for airlines.",
        "elevatorPitch": "International airlines subject to mandatory CORSIA Phase 2 offset obligations verify unit eligibility, vintage, and host-country Article 6 authorization prior to ICAO compliance deadlines.",
        "category": "EU Marketplace & Compliance",
        "subcategory": "aviation CORSIA credit verification",
        "tags": ["corsia", "aviation", "article6", "icao", "carbon-offset"],
        "targetCustomer": "Environmental compliance heads and procurement managers at international commercial airlines",
        "problemSolved": "Risk of purchasing carbon credits rejected by ICAO during CORSIA Phase 2 compliance surrenders",
        "whatToBuild": "Eligible unit registry scanner and Article 6 authorization document validator for airline carbon portfolios",
        "howItMakesMoney": "€499 per airline portfolio audit or €999/month active monitoring",
        "whyCustomersPay": "Ensures 100% acceptance of CORSIA credit surrenders by aviation regulators",
        "startupCostMax": 0,
        "timeToMvp": "4 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 7.0,
            "frequencyOfNeed": 6.0,
            "willingnessToPay": 7.0,
            "marketDemand": 6.5,
            "speedToFirstRevenue": 7.0,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.5,
            "aiAutomationPotential": 7.5,
            "regulatoryTailwind": 8.0,
            "compoundingAsset": 6.5
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
        
        # Calculate composite headline
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
            "detailedDescription": f"Discovered via Deep Investigation #5. Category: {opp['category']} / {opp['subcategory']}.",
            "category": opp["category"],
            "subcategory": opp["subcategory"],
            "tags": opp["tags"] + ["deep-investigation-5", "autonomous-discovered"],
            "status": "staged",
            "generationMode": "llm-generated",
            "evidenceStatus": "unverified",
            "promotionEligible": False,
            "requiresExternalEvidence": True,
            "provenance": {
                "sourceType": "Deep Investigation #5 — Certification Failure Infrastructure",
                "provider": "deep-investigation-5",
                "researchRound": "round-12",
                "notes": "Ingested from Deep Investigation #5 reset"
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
                "mainAdvantage": "Pre-certification failure detection before expensive external audits",
                "mainRisk": "Channel acquisition conversion must be validated early",
                "bestNextValidationStep": "Offer founding remote preflight audit to targeted buyers before building."
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
        print(f"\n[SUCCESS] Successfully ingested {added_count} new opportunities into staging queue. Total staged: {len(queue)}")
    else:
        print("\n[INFO] No new opportunities were added.")

if __name__ == "__main__":
    main()
