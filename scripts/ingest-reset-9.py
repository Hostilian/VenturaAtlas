import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IDEAS_JSON_PATH = os.path.join(ROOT, 'data', 'ideas.json')
IDEAS_DIR = os.path.join(ROOT, 'ideas')
PROMPTS_DIR = os.path.join(ROOT, 'prompts', 'idea-specific')

RESET_9_IDEAS = [
    {
        "name": "BorderGraph — EU Product Compliance Control Plane",
        "category": "EU Product Compliance & Customs",
        "subcategory": "product-compliance-engine",
        "score": 9.20,
        "concept": "Upstream compliance control plane for products entering the EU market, building SKU-level compliance twins across HS codes, safety rules, DPP, and customs.",
        "description": "A compliance decision engine mapping product SKUs against EU import rules, mandatory customs identifiers, safety regulations, and Digital Product Passport requirements before shipment."
    },
    {
        "name": "FreightRecover — Automatic Logistics Money Recovery",
        "category": "Logistics & Supply Chain",
        "subcategory": "claims-recovery",
        "score": 9.00,
        "concept": "Automated logistics revenue recovery platform that ingests GPS, POD, emails, and TMS data to discover and collect detention, layover, and demurrage underpayments on contingency.",
        "description": "Success-based revenue recovery engine for freight operators and carriers, automatically identifying unpaid detention, layover, demurrage, and accessorial charges with zero upfront fee."
    },
    {
        "name": "TradePassport — Cross-Border Skilled Worker Infrastructure",
        "category": "Cross-Border Labour & Qualifications",
        "subcategory": "worker-qualification-passport",
        "score": 8.90,
        "concept": "Cross-border qualification, recognition, and compliance engine mapping skilled trade credentials to country-specific legal deployability requirements.",
        "description": "A deployable worker passport for European skilled trades and healthcare professionals, resolving regional qualification equivalencies, insurance, and local regulatory permits."
    },
    {
        "name": "RepairRail — Infrastructure for Europe's Right-to-Repair Economy",
        "category": "Right to Repair & Circular Economy",
        "subcategory": "repair-transaction-network",
        "score": 8.80,
        "concept": "B2B clearing network and API connecting retailers, OEMs, repairers, and parts distributors under EU Right-to-Repair regulations.",
        "description": "An end-to-end repair clearing network enabling retailers and manufacturers to offer instant 1-click device repair, parts routing, and status tracking."
    },
    {
        "name": "TenderFactory — Autonomous Government-Sales Department for SMEs",
        "category": "Public Procurement & Government Sales",
        "subcategory": "autonomous-bidding",
        "score": 8.60,
        "concept": "Autonomous procurement operations platform maintaining structured SME evidence vaults to evaluate win probability, prepare bids, and submit public tenders.",
        "description": "An automated public procurement engine for small and medium enterprises, converting company certificates, project history, and compliance data into win-optimized bid submissions."
    },
    {
        "name": "ProofOfAI — AI Content Provenance Gateway",
        "category": "AI Governance & Compliance",
        "subcategory": "content-provenance",
        "score": 8.50,
        "concept": "API gateway marking, tracking, and preserving machine-readable AI content provenance and Article 50 disclosures across CMS and distribution platforms.",
        "description": "Compliance infrastructure for AI-generated media, embedding persistent watermarks, model lineage, and human-review metadata across publishing workflows."
    },
    {
        "name": "PDF Debt Exchange — Accessibility Remediation Factory",
        "category": "Accessibility & Document Remediation",
        "subcategory": "document-remediation-factory",
        "score": 8.40,
        "concept": "Hybrid AI and specialist document remediation factory converting legacy PDF backlogs into WCAG/PDF-UA compliant accessible documents at scale.",
        "description": "Bulk document accessibility remediation engine combining automated layout tag parsing, alt-text generation, and specialist quality assurance for institutional PDF archives."
    },
    {
        "name": "PayMe — Autonomous B2B Receivables Recovery Network",
        "category": "B2B Receivables & Cash Flow",
        "subcategory": "receivables-recovery",
        "score": 8.30,
        "concept": "Automated accounts-receivable workflow and recovery agent managing overdue B2B payments through progressive reminders, payment plans, and legal bundles.",
        "description": "An autonomous accounts-receivable recovery engine for SMEs, automating overdue invoice follow-up, interest calculation, and contingency-based collections."
    },
    {
        "name": "SiteMesh — Construction Material Exchange Between Worksites",
        "category": "Construction & Trade Operations",
        "subcategory": "material-exchange-network",
        "score": 8.10,
        "concept": "Cross-site material and equipment coordination network turning stranded construction inventory into liquid internal and inter-company supply.",
        "description": "Real-time construction site inventory exchange matching surplus plasterboard, scaffolding, site cabins, and bulk materials across active project sites."
    },
    {
        "name": "Battery Afterlife Exchange",
        "category": "Battery & Energy Storage Infrastructure",
        "subcategory": "second-life-battery-marketplace",
        "score": 8.00,
        "concept": "Second-life battery valuation and auction platform leveraging mandatory Digital Battery Passport data to match used EV packs with stationary storage integrators.",
        "description": "Data-driven battery resale and recycling marketplace converting state-of-health, charge history, and safety data into second-life storage valuations."
    }
]

def slugify(name):
    s = name.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    return re.sub(r'[\s-]+', '-', s).strip('-')

def main():
    with open(IDEAS_JSON_PATH, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    if isinstance(raw_data, list):
        ideas_list = raw_data
        schema_wrapper = False
    else:
        ideas_list = raw_data.get('ideas', [])
        schema_wrapper = True

    if any(x.get('name') == 'BorderGraph — EU Product Compliance Control Plane' for x in ideas_list):
        print("Reset 9 ideas already ingested into data/ideas.json!")
        return

    existing_ids = [int(x['id'].split('-')[1]) for x in ideas_list if 'id' in x and x['id'].startswith('idea-')]
    next_id = max(existing_ids) + 1 if existing_ids else 261

    added_count = 0

    for item in RESET_9_IDEAS:
        idea_id_str = f"idea-{next_id:03d}"
        next_id += 1
        slug = f"{slugify(item['name'])}-{idea_id_str}"

        idea_obj = {
            "schemaVersion": "2.0.0",
            "id": idea_id_str,
            "legacyId": slugify(item['name']),
            "slug": slug,
            "name": item['name'],
            "oneSentenceConcept": item['concept'],
            "elevatorPitch": f"For businesses, operators, and compliance leads, {item['name']} provides {item['concept'].lower()} The product turns regulatory obligations and transactional friction into automated value.",
            "detailedDescription": item['description'],
            "category": item['category'],
            "subcategory": item['subcategory'],
            "tags": [item['category'].lower(), item['subcategory'], "ninth reset", "regulatory-transaction"],
            "status": "priority" if item['score'] >= 8.8 else "explore",
            "atAGlance": {
                "overallScore": int(item['score'] * 10),
                "speedToValue": "Fast (1-2 weeks)",
                "targetCustomer": "Importers, logistics carriers, trade employers, & SME operations",
                "pricingModel": "Success-based percentage, per-SKU API, or enterprise subscription"
            },
            "customer": {
                "idealCustomerProfile": "EU importers, freight operators, cross-border employers, & B2B vendors",
                "painPoints": [item['concept']],
                "willingnessToPay": "High for transactional money recovery & mandatory compliance automation"
            },
            "product": {
                "coreFeatures": [item['concept'], item['description']],
                "mvpScope": "Standardized compliance engine or automated claims recovery workflow"
            },
            "futureAiBuild": {
                "agentCapabilities": "Automated regulatory twin generation, document audit, & claims submission"
            },
            "profitability": {
                "unitEconomics": "85%+ gross margin on digital compliance APIs and recovery contingency fees",
                "revenueScenarios": {
                    "conservative": 3500,
                    "base": 18000,
                    "aggressive": 65000
                }
            },
            "market": {
                "marketSize": "EU Product Compliance, Logistics Claims & Procurement Infrastructure",
                "competitors": ["Manual compliance agencies, traditional law firms, legacy ERPs"]
            },
            "validation": {
                "experimentPlan": "Offer contingency-based recovery or €199 pilot compliance audit to 15 targeted companies within 7 days"
            },
            "goToMarket": {
                "channels": ["Direct 3PL/importer outreach", "Trade associations", "Logistics partner networks"]
            },
            "operations": {
                "stack": "Node.js, Express, Python, GitHub Pages, WebManifest"
            },
            "risks": {
                "primaryRisks": ["Regulatory interpretation variations", "Enterprise integration cycle length"]
            },
            "actionPlan": {
                "immediateNextSteps": ["Launch 7-day pilot offer for targeted compliance/claims audit"]
            },
            "scores": {
                "existingSpendingEvidence": int(item['score'] * 10),
                "painAndUrgency": int(item['score'] * 10),
                "speedToPaidTest": 90,
                "launchBelow100": 95,
                "freeDistribution": 85,
                "grossMargin": 90,
                "repeatRevenue": 85,
                "soloFounderFeasibility": 85,
                "defensibility": 80,
                "pessimisticResilience": 85
            },
            "compositeScores": {
                "overallOpportunity": item['score'] * 10,
                "bootstrappedPotential": 90.0,
                "soloFounderPotential": 91.0,
                "aiAgentPotential": 88.0,
                "fastestPathToRevenue": 92.0,
                "highestProfitPotential": 88.0,
                "lowestCostLaunch": 95.0,
                "bestRecurringRevenue": 86.0,
                "bestEnterpriseOpportunity": 85.0,
                "bestConsumerOpportunity": 65.0,
                "bestLocalOpportunity": 70.0,
                "bestMarketplaceOpportunity": 75.0,
                "bestLongTermDefensibility": 85.0,
                "bestForNontechnicalFounder": 72.0,
                "bestForTechnicalFounder": 93.0,
                "bestForSmallTeam": 92.0,
                "bestRequiringLittleCapital": 95.0
            },
            "sourceReferences": ["src-009"]
        }

        ideas_list.append(idea_obj)
        added_count += 1

        # Dossier markdown file
        dossier_path = os.path.join(IDEAS_DIR, f"{slug}.md")
        with open(dossier_path, 'w', encoding='utf-8') as df:
            df.write(f"# {item['name']} ({idea_id_str})\n\n")
            df.write(f"**Score:** {item['score']}/10  |  **Category:** {item['category']}\n\n")
            df.write(f"## Executive Summary\n{item['concept']}\n\n")
            df.write(f"## Product Description\n{item['description']}\n\n")
            df.write(f"## 7-Day Payment Experiment\nLaunch 7-day pilot or contingency offer for 15 targeted clients. Target 3 paid orders within 7 days.\n")

        # Prompt Pack
        pack_dir = os.path.join(PROMPTS_DIR, idea_id_str)
        os.makedirs(pack_dir, exist_ok=True)
        readme_p = os.path.join(pack_dir, 'README.md')
        with open(readme_p, 'w', encoding='utf-8') as pf:
            pf.write(f"# Prompt Pack for {idea_id_str} — {item['name']}\n\n25-prompt library for research, MVP building, and GTM.\n")

    if schema_wrapper:
        raw_data['ideas'] = ideas_list
        out_data = raw_data
    else:
        out_data = ideas_list

    with open(IDEAS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(out_data, f, indent=2)

    print(f"Successfully ingested {added_count} ideas (Ninth Reset) into data/ideas.json!")

if __name__ == '__main__':
    main()
