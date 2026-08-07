#!/usr/bin/env python3
"""
Venture Atlas OS — Ingest Deep Investigation #6 Full Reset Opportunities
========================================================================
Parses and stages all 12 finalist opportunities from Deep Investigation #6
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
        "name": "CRA 24-Hour Incident Reporting Fire Drill",
        "oneSentenceConcept": "Productized timed fire drill simulating the first 72 hours of a CRA-reportable security incident before mandatory September 2026 ENISA reporting.",
        "elevatorPitch": "Connected hardware and software manufacturers subject to EU Cyber Resilience Act Article 14 run simulated vulnerability exploits through a timed operational drill to verify 24h early warning readiness and eliminate escalation bottlenecks.",
        "category": "Developer tools & infrastructure",
        "subcategory": "cyber resilience incident reporting preflight",
        "tags": ["cra", "cyber-resilience-act", "enisa", "incident-reporting", "fire-drill"],
        "targetCustomer": "CISOs, security engineering leads, and product security teams at connected hardware/software manufacturers",
        "problemSolved": "Panic and severe non-compliance fines caused by unpracticed 24h early warning & 72h notification mandates starting 11 September 2026",
        "whatToBuild": "Timed operational fire drill scenario engine, 24/72h notification packet generator, and approval bottleneck heatmaps",
        "howItMakesMoney": "€249 micro pilot, €499 real manufacturer drill, €750-€1,500 multi-team facilitated exercise",
        "whyCustomersPay": "Avoids severe CRA non-compliance fines (up to €15M or 2.5% global turnover) for delayed disclosures",
        "startupCostMax": 0,
        "timeToMvp": "2 days",
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
        "name": "Machine Customer TestGrid",
        "oneSentenceConcept": "Chaos engineering and simulated AI shopper platform that tests e-commerce stacks against autonomous agent commerce protocols and mutating checkout states.",
        "elevatorPitch": "E-commerce development agencies and mid-market merchants point staging environments at a chaos harness that simulates AI shopping agents encountering inventory races, price mutations, and payment 3DS interventions.",
        "category": "Developer tools & infrastructure",
        "subcategory": "AI agent commerce testing & chaos engineering",
        "tags": ["agentic-commerce", "machine-customers", "acp", "ucp", "chaos-engineering"],
        "targetCustomer": "E-commerce development agencies, headless commerce consultants, and mid-market merchants",
        "problemSolved": "Silent payment captures, stale inventory races, and transaction failures during autonomous AI shopping agent interactions",
        "whatToBuild": "Multi-scenario agent shopper emulator, state mutation harness, and protocol-level transaction trace recorder",
        "howItMakesMoney": "€199-€249 single audit, €149/month per store, €499-€1,500/month continuous testing suite",
        "whyCustomersPay": "Protects merchant revenue and brand trust against broken AI shopping transactions and security vulnerabilities",
        "startupCostMax": 0,
        "timeToMvp": "3 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 8.5,
            "frequencyOfNeed": 8.0,
            "willingnessToPay": 8.5,
            "marketDemand": 8.5,
            "speedToFirstRevenue": 8.5,
            "lowStartupCost": 9.0,
            "easeOfMvp": 8.0,
            "aiAutomationPotential": 9.0,
            "regulatoryTailwind": 8.0,
            "compoundingAsset": 9.5
        }
    },
    {
        "name": "EUDAMED Published-State Mirror",
        "oneSentenceConcept": "Independent published-state reconciliation tool comparing internal medical device QMS/ERP records against public EUDAMED database entries.",
        "elevatorPitch": "Medical device manufacturers compare internal Basic UDI-DI, trade name, and certificate records against official EUDAMED published records to catch public discrepancy errors before regulatory inspections.",
        "category": "Audit & Financial Forensics",
        "subcategory": "medical device EUDAMED reconciliation",
        "tags": ["eudamed", "mdr", "medical-devices", "udi", "compliance"],
        "targetCustomer": "Regulatory affairs directors and quality managers at European medical device manufacturers",
        "problemSolved": "Public EUDAMED registry records becoming inconsistent with internal QMS certificates, risking market hold notices",
        "whatToBuild": "Automated diff engine comparing internal CSV/XML device master files against public EUDAMED registry dumps",
        "howItMakesMoney": "€200-€500 per audit or €149/month per device portfolio monitoring",
        "whyCustomersPay": "Prevents regulatory audit non-conformities and product market withdrawal orders",
        "startupCostMax": 0,
        "timeToMvp": "3 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 8.0,
            "frequencyOfNeed": 7.5,
            "willingnessToPay": 8.0,
            "marketDemand": 7.5,
            "speedToFirstRevenue": 8.0,
            "lowStartupCost": 9.5,
            "easeOfMvp": 8.0,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 9.0,
            "compoundingAsset": 8.0
        }
    },
    {
        "name": "Product Release Defense Time-Machine",
        "oneSentenceConcept": "Immutable release-state capsule freezing software dependency trees, SBOMs, and test evidence to defend against post-2026 Product Liability claims.",
        "elevatorPitch": "Software companies shipping digitally dependent products freeze binary hashes, SBOMs, and vulnerability scans at each release date to provide verifiable evidence under the revised EU Product Liability Directive.",
        "category": "Developer tools & infrastructure",
        "subcategory": "product liability evidence archiving",
        "tags": ["pld", "product-liability", "sbom", "software-release", "provenance"],
        "targetCustomer": "CTOs and VP Engineering leads at European software companies shipping embedded or cloud-connected software",
        "problemSolved": "Inability to reconstruct exact software release state and known vulnerability status years later during product liability lawsuits",
        "whatToBuild": "CI-integrated release capsule generator creating cryptographically frozen release evidence bundles",
        "howItMakesMoney": "€199 per major release capsule or €299/month continuous release archiving",
        "whyCustomersPay": "Provides legally defensible evidence against strict liability claims under EU Product Liability Directive rules applying December 2026",
        "startupCostMax": 0,
        "timeToMvp": "4 days",
        "grossMarginEstimate": 90,
        "scores": {
            "problemSeverity": 8.0,
            "frequencyOfNeed": 7.0,
            "willingnessToPay": 7.5,
            "marketDemand": 7.5,
            "speedToFirstRevenue": 7.5,
            "lowStartupCost": 9.5,
            "easeOfMvp": 8.0,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 9.0,
            "compoundingAsset": 8.0
        }
    },
    {
        "name": "French E-Invoice Portfolio Readiness Sweep",
        "oneSentenceConcept": "Bulk SIREN registry audit service that identifies which small business clients lack active routing on approved French e-invoicing platforms.",
        "elevatorPitch": "French accounting firms upload client SIREN lists to receive an immediate breakdown of which clients are correctly routed on partner platforms before mandatory September 2026 reception rules.",
        "category": "EU Marketplace & Compliance",
        "subcategory": "French e-invoicing directory auditing",
        "tags": ["french-einvoicing", "siren", "pdp", "cpa", "compliance"],
        "targetCustomer": "Accounting firms (experts-comptables) managing 50-500 SME client portfolios in France",
        "problemSolved": "Accounting firms facing client mass disruption on 1 September 2026 due to unrouted or unregistered SME e-invoicing accounts",
        "whatToBuild": "Bulk SIREN directory query wrapper and actionable client follow-up list generator",
        "howItMakesMoney": "€99 per 100-client portfolio audit sweep",
        "whyCustomersPay": "Saves hundreds of hours of manual client intake checking before mandatory e-invoice reception deadlines",
        "startupCostMax": 0,
        "timeToMvp": "1 day",
        "grossMarginEstimate": 95,
        "scores": {
            "problemSeverity": 7.5,
            "frequencyOfNeed": 6.5,
            "willingnessToPay": 7.5,
            "marketDemand": 8.0,
            "speedToFirstRevenue": 9.5,
            "lowStartupCost": 9.5,
            "easeOfMvp": 9.0,
            "aiAutomationPotential": 7.5,
            "regulatoryTailwind": 9.0,
            "compoundingAsset": 6.5
        }
    },
    {
        "name": "Packaging Change-Impact Graph",
        "oneSentenceConcept": "Upstream packaging material dependency graph tracking how single supplier component changes invalidate downstream SKU recyclability declarations under PPWR.",
        "elevatorPitch": "Consumer packaged goods manufacturers map packaging component declarations (cap, liner, ink, adhesive) to detect which final SKUs lose recyclability status when a supplier modifies one sub-component.",
        "category": "Research & knowledge tools",
        "subcategory": "PPWR packaging component dependency tracking",
        "tags": ["ppwr", "packaging", "recyclability", "supply-chain", "compliance"],
        "targetCustomer": "Packaging managers and regulatory leads at CPG and food & beverage manufacturers",
        "problemSolved": "Upstream supplier material modifications silently invalidating final product PPWR recyclability claims",
        "whatToBuild": "Component-to-SKU dependency graph engine generating automated stale-declaration alerts",
        "howItMakesMoney": "€199 per packaging audit or €299-€699/month CPG workspace",
        "whyCustomersPay": "Prevents costly market recalls and eco-fee penalties under EU Packaging & Packaging Waste rules",
        "startupCostMax": 0,
        "timeToMvp": "4 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 7.5,
            "frequencyOfNeed": 7.0,
            "willingnessToPay": 7.5,
            "marketDemand": 7.5,
            "speedToFirstRevenue": 7.5,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.5,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 8.5,
            "compoundingAsset": 8.0
        }
    },
    {
        "name": "Cloud Exit Fire Drill",
        "oneSentenceConcept": "Automated cloud data extraction and restore test harness verifying multi-cloud exit feasibility under EU Data Act rules.",
        "elevatorPitch": "Software companies and cloud consumers execute actual micro-migration dry runs for databases, object stores, and auth systems to quantify egress times and data loss risks under mandatory Data Act exit rules.",
        "category": "Developer tools & infrastructure",
        "subcategory": "cloud exit & portability testing",
        "tags": ["data-act", "cloud-exit", "portability", "aws", "multi-cloud"],
        "targetCustomer": "CTOs and IT infrastructure heads at mid-market European cloud software operators",
        "problemSolved": "Theoretical cloud exit plans failing during emergency migrations due to hidden service lock-in and checksum mismatches",
        "whatToBuild": "Automated cloud resource snapshot, export, and target-restore validation harness",
        "howItMakesMoney": "€299 single service exit test, €799 full cloud stack exit drill",
        "whyCustomersPay": "Proves genuine cloud portability compliance to enterprise auditors and avoids lock-in traps",
        "startupCostMax": 50,
        "timeToMvp": "5 days",
        "grossMarginEstimate": 80,
        "scores": {
            "problemSeverity": 7.5,
            "frequencyOfNeed": 6.5,
            "willingnessToPay": 7.5,
            "marketDemand": 7.0,
            "speedToFirstRevenue": 7.5,
            "lowStartupCost": 8.5,
            "easeOfMvp": 7.0,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 8.5,
            "compoundingAsset": 8.0
        }
    },
    {
        "name": "EUDI Business-Journey Rejection Lab",
        "oneSentenceConcept": "Identity transaction testing suite simulating user attribute rejections, credential revocations, and cross-border wallet failures for EUDI relying parties.",
        "elevatorPitch": "Banks, hotel chains, and airlines mandated to accept EU Digital Identity Wallets run end-to-end user journey tests to detect edge-case failures when users reject specific attributes or present revoked credentials.",
        "category": "Developer tools & infrastructure",
        "subcategory": "EUDI wallet journey exception testing",
        "tags": ["eudi-wallet", "eidas2", "relying-party", "identity", "exception-testing"],
        "targetCustomer": "IAM product managers and identity engineers at banks, telcos, airlines, and hotel chains",
        "problemSolved": "Failed customer onboarding and privacy non-compliance when relying-party portals mishandle EUDI wallet selective disclosures",
        "whatToBuild": "Interactive identity journey simulator injecting credential revocation, partial disclosure, and cross-wallet variance events",
        "howItMakesMoney": "€249 developer package, €799 enterprise journey suite, €299/month spec update subscription",
        "whyCustomersPay": "Prevents user drop-offs and GDPR violations during mandatory EUDI Wallet customer authentication",
        "startupCostMax": 0,
        "timeToMvp": "4 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 7.5,
            "frequencyOfNeed": 7.0,
            "willingnessToPay": 7.5,
            "marketDemand": 7.5,
            "speedToFirstRevenue": 7.5,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.5,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 9.0,
            "compoundingAsset": 8.0
        }
    },
    {
        "name": "Battery Passport Mutation Gate",
        "oneSentenceConcept": "Digital Product Passport mutation tester verifying public battery QR state survival across upstream supplier changes and second-life transfers.",
        "elevatorPitch": "Industrial battery manufacturers and EV assemblers run passport state update tests to ensure public QR codes resolve accurately after supplier carbon value updates and second-life repurposing events.",
        "category": "EU Marketplace & Compliance",
        "subcategory": "battery passport state integrity testing",
        "tags": ["battery-passport", "dpp", "ev-battery", "circularity", "compliance"],
        "targetCustomer": "Quality managers and digital passport leads at industrial battery manufacturers and EV OEMs",
        "problemSolved": "Public battery QR passports displaying stale carbon footprint data or broken state transitions after supply chain updates",
        "whatToBuild": "Passport resolution and state mutation validator testing public QR endpoints against internal data updates",
        "howItMakesMoney": "€299 per passport series audit or €499/month continuous resolution monitoring",
        "whyCustomersPay": "Avoids market distribution blocks under EU Battery Regulation passport enforcement",
        "startupCostMax": 0,
        "timeToMvp": "4 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 7.5,
            "frequencyOfNeed": 6.5,
            "willingnessToPay": 7.5,
            "marketDemand": 7.0,
            "speedToFirstRevenue": 7.0,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.5,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 9.0,
            "compoundingAsset": 8.0
        }
    },
    {
        "name": "Euro 7 EVP Consistency Gate",
        "oneSentenceConcept": "Vehicle record consistency engine comparing type-approval data against Environmental Vehicle Passport (EVP) outputs.",
        "elevatorPitch": "Automotive OEMs and Tier 1 suppliers compare vehicle type-approval records, certificates of conformity, and on-board sensor specs against public Euro 7 Environmental Vehicle Passport records.",
        "category": "Audit & Financial Forensics",
        "subcategory": "Euro 7 vehicle passport consistency",
        "tags": ["euro-7", "evp", "automotive", "homologation", "compliance"],
        "targetCustomer": "Homologation managers and environmental compliance directors at automotive OEMs",
        "problemSolved": "Discrepancies between physical vehicle configuration and public Euro 7 Environmental Vehicle Passport entries",
        "whatToBuild": "Multi-source vehicle data comparison engine validating homologation parameters against EVP outputs",
        "howItMakesMoney": "€499 per vehicle line audit or €999/month enterprise homologation suite",
        "whyCustomersPay": "Prevents vehicle type-approval suspension and costly homologation re-testing",
        "startupCostMax": 0,
        "timeToMvp": "5 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 7.5,
            "frequencyOfNeed": 6.0,
            "willingnessToPay": 7.5,
            "marketDemand": 6.5,
            "speedToFirstRevenue": 6.5,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.0,
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 8.5,
            "compoundingAsset": 7.5
        }
    },
    {
        "name": "DAC8 Transaction Reconciliation",
        "oneSentenceConcept": "Crypto-asset reporting reconciliation engine detecting missing or duplicated transactions prior to EU DAC8 tax filings.",
        "elevatorPitch": "Crypto-asset service providers (CASPs) and token issuers reconcile internal exchange ledgers against customer residency records to identify reporting discrepancies before annual DAC8 disclosures.",
        "category": "Audit & Financial Forensics",
        "subcategory": "crypto-asset DAC8 tax reconciliation",
        "tags": ["dac8", "casp", "crypto-tax", "reporting", "compliance"],
        "targetCustomer": "Tax directors and compliance officers at European Crypto-Asset Service Providers (CASPs)",
        "problemSolved": "Data mismatches and missing customer tax identification numbers causing inaccurate annual DAC8 filings",
        "whatToBuild": "Exchange transaction to DAC8 XML schema validator and exception reconciler",
        "howItMakesMoney": "€399 per annual filing reconciliation or €699/month continuous reporting audit",
        "whyCustomersPay": "Avoids severe tax authority non-compliance penalties for malformed crypto asset reporting",
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
            "aiAutomationPotential": 8.0,
            "regulatoryTailwind": 8.5,
            "compoundingAsset": 7.0
        }
    },
    {
        "name": "Wastewater EPR Cost Challenge File",
        "oneSentenceConcept": "Pharmaceutical and cosmetics EPR fee allocation auditor identifying contestable cost assumptions in municipal wastewater micropollutant invoices.",
        "elevatorPitch": "Pharma and cosmetics manufacturers analyze assigned quaternary wastewater treatment fee assessments to identify inaccurate biodegradability or market share assumptions before paying regional EPR bills.",
        "category": "Audit & Financial Forensics",
        "subcategory": "urban wastewater EPR fee challenge",
        "tags": ["wastewater-epr", "micropollutants", "pharma", "cosmetics", "fee-audit"],
        "targetCustomer": "EHS directors and corporate legal leads at pharmaceutical and cosmetics manufacturers",
        "problemSolved": "Overpayment on million-Euro municipal wastewater micropollutant removal fee assessments due to crude default allocation formulas",
        "whatToBuild": "Substance biodegradability and local sales volume to EPR invoice challenge generator",
        "howItMakesMoney": "€499 per invoice challenge package + 10-15% of verified EPR fee reduction",
        "whyCustomersPay": "Saves hundreds of thousands of Euros on contested wastewater treatment fee allocations",
        "startupCostMax": 0,
        "timeToMvp": "5 days",
        "grossMarginEstimate": 85,
        "scores": {
            "problemSeverity": 7.0,
            "frequencyOfNeed": 5.5,
            "willingnessToPay": 7.5,
            "marketDemand": 6.0,
            "speedToFirstRevenue": 6.5,
            "lowStartupCost": 9.0,
            "easeOfMvp": 7.0,
            "aiAutomationPotential": 7.5,
            "regulatoryTailwind": 8.0,
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
            "detailedDescription": f"Discovered via Deep Investigation #6 Full Reset. Category: {opp['category']} / {opp['subcategory']}.",
            "category": opp["category"],
            "subcategory": opp["subcategory"],
            "tags": opp["tags"] + ["deep-investigation-6", "autonomous-discovered"],
            "status": "staged",
            "generationMode": "llm-generated",
            "evidenceStatus": "unverified",
            "promotionEligible": False,
            "requiresExternalEvidence": True,
            "provenance": {
                "sourceType": "Deep Investigation #6 — Machine-Customer Failure & External-State Integrity",
                "provider": "deep-investigation-6",
                "researchRound": "round-14",
                "notes": "Ingested from Deep Investigation #6 full reset report"
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
                "mainAdvantage": "External-state integrity testing before mandatory external machine/regulator interactions",
                "mainRisk": "Channel acquisition conversion must be validated early",
                "bestNextValidationStep": "Offer founding preflight audit or chaos drill to targeted engineering/compliance leads."
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
        print(f"\n[SUCCESS] Ingested {added_count} new Investigation #6 opportunities into staging queue. Total staged: {len(queue)}")
    else:
        print("\n[INFO] No new opportunities were added.")

if __name__ == "__main__":
    main()
