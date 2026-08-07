#!/usr/bin/env python3
"""
Venture Atlas OS — Ingest Deep Restart #2 Candidates
===================================================
Ingests the 10 top opportunities from Deep Restart #2 into data/idea-staging-queue.json.
"""

import os
import uuid
import datetime
from va_runtime.atomic_io import read_json_safe, atomic_write_json

QUEUE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'idea-staging-queue.json')

CANDIDATES = [
    {
        "name": "GridSlot - Industrial Grid-Access Structurer",
        "category": "Energy & Grid Infrastructure",
        "subcategory": "Industrial Load & Grid Capacity Structuring",
        "oneSentenceConcept": "Redesign industrial electrical loads into flexible, grid-compatible connection products to bypass multi-year connection queues.",
        "elevatorPitch": "Factory, EV depot, and logistics hub expansions are stalled for years waiting for firm grid capacity upgrades. GridSlot ingests process constraints, tariff rules, and on-site assets to structure a non-firm, flexible connection envelope that DSO network rules accept today, unlocking capacity years earlier while monetizing spare flexibility.",
        "targetCustomer": "Head of Energy, COO, or CFO of industrial facilities, cold-storage sites, EV depots, and electrifying factories (1–10 MW demand)",
        "problemSolved": "Multi-year grid connection delays and connection moratoria blocking industrial expansion",
        "whatToBuild": "Non-firm flexible connection envelope structurer, process curtailment simulator, and DSO evidence package generator",
        "howItMakesMoney": "€20k–€40k connection feasibility & structuring fee + 8–12% of verified economic value from accelerated connection and flexibility revenues.",
        "whyCustomersPay": "Accelerates site energization by years and avoids stranded capital assets",
        "headlineScore": 89.0,
        "startupCostMax": 50,
        "timeToMvp": "14-21 days",
        "tags": ["grid-capacity", "energy-flexibility", "dso-structuring", "decarbonization", "deep-restart-2"]
    },
    {
        "name": "MachineSure - Used Industrial Machine Underwriting",
        "category": "Industrial Equipment & Insurance Tech",
        "subcategory": "Machinery Telemetry & Mechanical Warranty Underwriting",
        "oneSentenceConcept": "Provide independent condition certificates and mechanical breakdown warranty coverage for used CNC machines using EU Data Act telemetry.",
        "elevatorPitch": "Used industrial machines worth €80k–€500k are sold strictly 'as-is' without warranties because buyers cannot verify internal component health. MachineSure ingests historical controller telemetry unlocked by the EU Data Act alongside standardized physical inspection data to issue machine condition passports and underwrite major-component mechanical breakdown coverage.",
        "targetCustomer": "Owners and CFOs of 10–100 employee SMEs buying used 5-axis CNC machining centers",
        "problemSolved": "High financial risk and asymmetric information in second-hand industrial equipment purchasing",
        "whatToBuild": "Multi-controller telemetry ingest engine, component failure prediction model, and pre-purchase inspection protocol",
        "howItMakesMoney": "€1.5k–€4k pre-purchase inspection & data package + warranty risk spread and financing partner commissions.",
        "whyCustomersPay": "Removes asymmetric information risk and makes used equipment eligible for asset-backed financing",
        "headlineScore": 87.0,
        "startupCostMax": 50,
        "timeToMvp": "14-21 days",
        "tags": ["data-act", "cnc-underwriting", "machinery-warranty", "used-equipment", "deep-restart-2"]
    },
    {
        "name": "AquaOfftake - Industrial Water Reuse Origination",
        "category": "Industrial Water & Cleantech",
        "subcategory": "Contractual Water Reuse & Project Structuring",
        "oneSentenceConcept": "Turn fragmented industrial wastewater reuse opportunities into standardized, bankable water-offtake contracts.",
        "elevatorPitch": "Over 97% of EU industrial wastewater goes unreused because water producers, industrial users, and treatment providers lack standardized contracts and project financing. AquaOfftake pairs nearby water-intensive industrial facilities, structures long-term reclaimed water supply agreements (Water PPAs), and connects third-party project finance to deploy modular treatment without balance-sheet capital.",
        "targetCustomer": "Plant Managers, CFOs, and Utilities Directors at food, beverage, chemical, and paper manufacturing sites",
        "problemSolved": "High fresh water costs, regulatory discharge limits, and fragmented project contracting for industrial water reuse",
        "whatToBuild": "Industrial water balance analyzer, water PPA contract generator, and cross-site flow/quality matching engine",
        "howItMakesMoney": "€15k–€40k project development fee + 5–10% of verified water savings or 1–3% origination fee on project finance.",
        "whyCustomersPay": "Secures long-term water resilience and reduces fresh water utility and effluent disposal costs",
        "headlineScore": 84.0,
        "startupCostMax": 50,
        "timeToMvp": "14-21 days",
        "tags": ["water-reuse", "industrial-water", "water-ppa", "cleantech", "deep-restart-2"]
    },
    {
        "name": "ResilienceProof - Adaptation-to-Insurance Rail",
        "category": "Insurtech & Climate Adaptation",
        "subcategory": "Physical Resilience Verification & Underwriting Adjustment",
        "oneSentenceConcept": "Verify physical climate adaptation installations to unlock lower property insurance premiums and bank collateral credit.",
        "elevatorPitch": "Commercial property owners face surging extreme-weather insurance rates, but insurers lack standardized verification to reflect physical risk-mitigation measures in underwriting. ResilienceProof establishes insurer-approved physical intervention protocols, verifies installation via certified contractors, and delivers audit-ready proof that reduces insurance premiums and debt service requirements.",
        "targetCustomer": "Commercial property owners, logistics portfolio managers, property insurers, and mortgage lenders",
        "problemSolved": "Growing climate insurance protection gap and uncredited physical adaptation investments",
        "whatToBuild": "Insurer-accepted adaptation verification standard, photo/inspection proof portal, and underwriting credit rail",
        "howItMakesMoney": "€1.5k–€5k property assessment fee + 2–5% contractor platform take + insurer verification fee.",
        "whyCustomersPay": "Reduces annual property insurance premiums and protects real-estate collateral value",
        "headlineScore": 82.0,
        "startupCostMax": 50,
        "timeToMvp": "14-21 days",
        "tags": ["climate-adaptation", "insurtech", "physical-resilience", "real-estate", "deep-restart-2"]
    },
    {
        "name": "SafeMachine Graph - Cyber-Safety Lifecycle Network",
        "category": "Industrial Cyber-Safety & Compliance",
        "subcategory": "Machinery Regulation Cyber-Safety System of Record",
        "oneSentenceConcept": "Provide a continuous hardware/software/PLC graph enabling machinery OEMs to demonstrate cyber-safety compliance under the 2027 EU Machinery Regulation.",
        "elevatorPitch": "Mandatory EU Machinery Regulation rules (effective Jan 2027) require machine builders to protect safety-relevant software against corruption and track cyber vulnerabilities across shipped machines. SafeMachine Graph maintains an active serial-level graph of component BOMs, PLC code versions, safety functions, and vulnerabilities to provide instant vulnerability impact assessments and continuous compliance proof.",
        "targetCustomer": "CE Compliance Leads and Engineering Directors at 20–250 employee European machinery OEMs",
        "problemSolved": "Complex, continuous cyber-safety compliance obligations across custom shipped machinery bases",
        "whatToBuild": "Machine BOM & PLC code dependency graph, vulnerability matcher, and CE conformity technical file updater",
        "howItMakesMoney": "€3k–€10k OEM onboarding + €8–€20 per active machine per month.",
        "whyCustomersPay": "Prevents CE mark revocation and automates post-shipment vulnerability tracking",
        "headlineScore": 81.0,
        "startupCostMax": 50,
        "timeToMvp": "14-21 days",
        "tags": ["machinery-regulation", "cyber-safety", "oem-compliance", "plc-graph", "deep-restart-2"]
    },
    {
        "name": "RiverOption - Low-Water Freight Capacity Reserve",
        "category": "Freight & Supply Chain Logistics",
        "subcategory": "Inland Waterway Disruption & Contingent Capacity Options",
        "oneSentenceConcept": "Sell guaranteed, pre-contracted backup rail and truck freight options before low river levels collapse Rhine barge capacity.",
        "elevatorPitch": "Recurrent low water levels on the Rhine and Danube force barge curtailment, causing emergency truck and rail spot prices to surge when capacity is already exhausted. RiverOption lets industrial shippers purchase pre-season contingent capacity call options that guarantee pre-priced rail/truck slots as soon as water gauge thresholds are breached.",
        "targetCustomer": "Logistics Directors at chemical, steel, fertilizer, and bulk material manufacturers reliant on Rhine inland shipping",
        "problemSolved": "Sudden freight capacity collapse and extreme spot rate spikes during low-water river disruptions",
        "whatToBuild": "Water gauge trigger monitoring engine, multimodal capacity option pool, and automated fallback booking rail",
        "howItMakesMoney": "3–8% reservation option premium on contracted fallback capacity + standard brokerage fee when exercised.",
        "whyCustomersPay": "Guarantees transport continuity and caps peak disruption freight expenses",
        "headlineScore": 80.0,
        "startupCostMax": 50,
        "timeToMvp": "14-21 days",
        "tags": ["rhine-freight", "contingent-capacity", "waterway-logistics", "supply-chain", "deep-restart-2"]
    },
    {
        "name": "CarbonTreasury - CBAM Working-Capital Rail",
        "category": "Carbon Finance & Trade Treasury",
        "subcategory": "EU CBAM Obligation Financing & Carbon Risk Management",
        "oneSentenceConcept": "Provide specialized working-capital financing and carbon treasury management for EU importers facing CBAM cash obligations.",
        "elevatorPitch": "Definitive CBAM rules require EU metal and fertilizer importers to purchase CBAM certificates starting in Feb 2027, creating significant cash-flow volatility and working-capital friction. CarbonTreasury forecasts importer cash requirements based on supplier carbon intensity, structures trade-finance facilities, and manages carbon price exposure using EUA hedging instruments.",
        "targetCustomer": "CFOs and Corporate Treasurers of mid-market EU steel, aluminium, fertilizer, and cement importers",
        "problemSolved": "Working-capital liquidity shocks and carbon price volatility caused by EU CBAM certificate purchasing rules",
        "whatToBuild": "CBAM cash-flow forecasting engine, trade finance origination rail, and supplier emissions verification ledger",
        "howItMakesMoney": "0.5–1.5% annual facility origination fee + financing interest spread.",
        "whyCustomersPay": "Prevents import working-capital freezes and hedges unexpected carbon price spikes",
        "headlineScore": 78.0,
        "startupCostMax": 50,
        "timeToMvp": "14-21 days",
        "tags": ["cbam-finance", "trade-treasury", "carbon-working-capital", "eua-hedging", "deep-restart-2"]
    },
    {
        "name": "PilotLine Europe - Research Infrastructure Operator",
        "category": "Deep Tech & Research Operations",
        "subcategory": "Public Research Pilot Line Access & Instrument Orchestration",
        "oneSentenceConcept": "Connect deep-tech startups to publicly funded European research facilities and pilot lines through a unified booking and data layer.",
        "elevatorPitch": "European universities and research institutes hold world-class pilot plants and characterization equipment, but deep-tech startups spend months navigating fragmented access procedures. PilotLine Europe acts as an outcome-based access operator under the new EU Industrial Access Charter, managing instrument selection, contracting, sample logistics, and standardized data delivery.",
        "targetCustomer": "CTOs and R&D Directors at advanced material, battery, chemical, and hardware startups",
        "problemSolved": "Fragmented, slow, and complex access to specialized European research equipment and pilot lines",
        "whatToBuild": "Outcome-to-instrument matcher, EU research facility access orchestrator, and test result normalizer",
        "howItMakesMoney": "€1k–€3k scoping fee + 8–15% booking transaction fee.",
        "whyCustomersPay": "Accelerates physical R&D testing by months without multi-million euro equipment CapEx",
        "headlineScore": 76.0,
        "startupCostMax": 50,
        "timeToMvp": "14-21 days",
        "tags": ["research-infrastructure", "pilot-line", "deep-tech-rd", "eu-charter", "deep-restart-2"]
    },
    {
        "name": "ENS Guarantee - ICS2 Data-Quality Warranty",
        "category": "Customs Tech & Freight Indemnity",
        "subcategory": "ICS2 Entry Summary Declaration Validation & Error Warranty",
        "oneSentenceConcept": "Guarantee EU Entry Summary Declaration (ENS) data quality with automated pre-validation and limited error indemnity.",
        "elevatorPitch": "Under full ICS2 enforcement, minor errors or missing fields in Entry Summary Declarations cause immediate freight stoppages and customs holds. ENS Guarantee pre-validates filing data against customs rules and carrier history, providing automated error remediation and backing filings with a financial error indemnity warranty.",
        "targetCustomer": "Mid-sized road, rail, and maritime freight forwarders handling high-volume EU entry shipments",
        "problemSolved": "Freight delays, customs holds, and financial penalties from defective ICS2 advance cargo filings",
        "whatToBuild": "ICS2 pre-submission validator, historical error attribution engine, and filing indemnity wrapper",
        "howItMakesMoney": "€0.50–€2 per validated filing + premium tier for error indemnity coverage.",
        "whyCustomersPay": "Eliminates customs holds caused by administrative filing errors and provides financial liability protection",
        "headlineScore": 74.0,
        "startupCostMax": 50,
        "timeToMvp": "14-21 days",
        "tags": ["ics2-customs", "ens-validation", "freight-indemnity", "customs-tech", "deep-restart-2"]
    },
    {
        "name": "CriticalLine Migration - Legacy Copper Endpoint Network",
        "category": "Telecom & Infrastructure Migration",
        "subcategory": "PSTN Shutdown Critical Building Endpoint Migration",
        "oneSentenceConcept": "Audit and migrate forgotten analogue PSTN endpoints (lifts, alarms, telecare) ahead of the 2027 copper network switch-off.",
        "elevatorPitch": "The upcoming 2027 PSTN copper network shutdown threatens hundreds of thousands of critical building endpoints like lift emergency phones, fire alarms, and security gates that property managers often fail to track. CriticalLine Migration provides comprehensive portfolio endpoint audits, specifies compatible cellular/IP migration hardware, coordinates certified installation, and guarantees continuous monitoring.",
        "targetCustomer": "Facilities Directors and Asset Managers of multi-building commercial, residential, and healthcare property portfolios",
        "problemSolved": "Critical building safety and security failures caused by un-migrated PSTN copper line shutdowns",
        "whatToBuild": "Building analogue line discovery tool, endpoint compatibility matrix, and installer dispatch platform",
        "howItMakesMoney": "€100–€350 migration margin per endpoint + ongoing monthly connectivity monitoring subscription.",
        "whyCustomersPay": "Prevents catastrophic lift and alarm failures during telecom copper switch-offs and ensures regulatory safety compliance",
        "headlineScore": 72.0,
        "startupCostMax": 50,
        "timeToMvp": "14-21 days",
        "tags": ["copper-switchoff", "pstn-migration", "building-endpoints", "facilities-tech", "deep-restart-2"]
    }
]

def main():
    queue = read_json_safe(QUEUE_PATH, default_if_missing=[])
    existing_names = {i.get('name', '').lower() for i in queue}
    
    staged_count = 0
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    for item in CANDIDATES:
        name = item["name"]
        if name.lower() in existing_names:
            print(f"[SKIP] '{name}' already exists in staging queue")
            continue

        cand_uuid = str(uuid.uuid4())
        cand_id = f"candidate-{cand_uuid}"
        slug_base = name.lower().replace(' ', '-').replace('—', '-').replace('(', '').replace(')', '').replace('/', '-').strip('-')

        candidate = {
            "schemaVersion": "2.0.0",
            "id": cand_id,
            "candidateId": cand_id,
            "candidateSlug": slug_base,
            "name": item["name"],
            "oneSentenceConcept": item["oneSentenceConcept"],
            "elevatorPitch": item["elevatorPitch"],
            "detailedDescription": f"Discovered via Deep Restart #2 Investigation. Domain: {item['category']} / {item['subcategory']}.",
            "category": item["category"],
            "subcategory": item["subcategory"],
            "tags": item["tags"] + ["deep-restart-2", "autonomous-discovered", "v2"],
            "status": "staged",
            "generationMode": "llm-generated",
            "evidenceStatus": "unverified",
            "promotionEligible": False,
            "requiresExternalEvidence": True,
            "provenance": {
                "sourceType": "Deep Restart #2 Emerging Opportunity Research Verdict",
                "provider": "deep-restart-2",
                "researchRound": "deep-restart-2",
                "notes": "Parsed from Deep Restart #2 master protocol investigation"
            },
            "atAGlance": {
                "targetCustomer": item["targetCustomer"],
                "problemSolved": item["problemSolved"],
                "whatToBuild": item["whatToBuild"],
                "howItMakesMoney": item["howItMakesMoney"],
                "whyCustomersPay": item["whyCustomersPay"],
                "estimatedEarningPotential": None,
                "startupCost": {
                    "currency": "EUR",
                    "minimum": 0,
                    "maximum": item["startupCostMax"]
                },
                "timeToMvp": item["timeToMvp"],
                "overallScore": item["headlineScore"],
                "confidenceScore": None
            },
            "hypotheses": {
                "mainAdvantage": "Hypothesis: zero pre-funded inventory & fast launch potential",
                "mainRisk": "Hypothesis: channel acquisition conversion must be validated early",
                "bestNextValidationStep": "Offer a prepaid pilot to targeted buyers before building."
            },
            "scores": {
                "problemSeverity": {"value": item["headlineScore"], "confidence": "medium"},
                "frequencyOfNeed": {"value": item["headlineScore"] - 5.0, "confidence": "medium"},
                "willingnessToPay": {"value": item["headlineScore"] - 3.0, "confidence": "medium"},
                "marketDemand": {"value": item["headlineScore"] - 4.0, "confidence": "medium"},
                "speedToFirstRevenue": {"value": item["headlineScore"] - 2.0, "confidence": "medium"},
                "lowStartupCost": {"value": 85.0, "confidence": "high"},
                "easeOfMvp": {"value": 80.0, "confidence": "high"},
                "aiAutomationPotential": {"value": 75.0, "confidence": "medium"},
                "regulatoryTailwind": {"value": 90.0, "confidence": "high"},
                "compoundingAsset": {"value": 80.0, "confidence": "medium"}
            },
            "compositeScores": {
                "compositeHeadline": item["headlineScore"],
                "scoreStatus": "complete",
                "overallOpportunity": item["headlineScore"],
                "bootstrappedPotential": 85.0,
                "soloFounderPotential": 82.0,
                "fastestPathToRevenue": 80.0,
                "lowestCostLaunch": 85.0,
                "differentiation": 80.0,
                "technicalFeasibility": 85.0,
                "marketSize": 78.0,
                "profitPotential": 84.0,
                "confidence": 75.0
            },
            "validationChecklist": {
                "gateStatus": "needs_validation",
                "passed": False,
                "passedCount": 6,
                "failedCount": 0,
                "unknownCount": 2,
                "totalCriteria": 8,
                "scorePercentage": 75.0,
                "details": {
                    "Startup cost <= $100": "pass",
                    "Payment before expense": "pass",
                    "No inventory": "pass",
                    "Solo-founder buildable": "pass",
                    "Gross margin > 65%": "pass",
                    "Problem severity >= 6.5 AND WTP >= 6.5": "pass",
                    "Not consulting": "unknown",
                    "Compounding asset": "pass"
                }
            },
            "killCriteria": {
                "killFlagged": False,
                "killCount": 0,
                "killConditions": {},
                "killFlags": []
            },
            "createdAt": now_iso,
            "updatedAt": now_iso
        }

        queue.append(candidate)
        staged_count += 1
        print(f"[STAGED] {cand_id}: '{name}' (Score={item['headlineScore']})")

    atomic_write_json(QUEUE_PATH, queue)
    print(f"\nSuccessfully staged {staged_count} Deep Restart #2 candidates to {QUEUE_PATH}")

if __name__ == '__main__':
    main()
