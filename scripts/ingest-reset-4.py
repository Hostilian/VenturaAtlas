import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IDEAS_JSON_PATH = os.path.join(ROOT, 'data', 'ideas.json')
SEARCH_INDEX_PATH = os.path.join(ROOT, 'data', 'search-index.json')
IDEAS_DIR = os.path.join(ROOT, 'ideas')
PROMPTS_DIR = os.path.join(ROOT, 'prompts', 'idea-specific')

RESET_4_IDEAS = [
    {
        "name": "Renter Deposit Evidence Capsule",
        "category": "Consumer-Owned Proof & Evidence",
        "subcategory": "tenancy-evidence",
        "score": 8.34,
        "concept": "Tenant-owned mobile web product guiding renters through room-by-room move-in and move-out condition capturing.",
        "description": "Produces a timestamped chronological PDF report and ZIP package containing original evidence, hashes, and inventory comparison independent of landlord accounts."
    },
    {
        "name": "Second-Life Product Passport",
        "category": "Consumer-Owned Proof & Evidence",
        "subcategory": "product-passports",
        "score": 8.08,
        "concept": "Consumer-owned transferable history and repair record for durable goods lacking native manufacturer passports.",
        "description": "Records model, serial numbers, ownership proof, service events, battery health, and warranty status for e-bikes, camera gear, and high-value equipment."
    },
    {
        "name": "Family Archive Survivability Kit",
        "category": "Consumer-Owned Proof & Evidence",
        "subcategory": "digital-preservation",
        "score": 7.96,
        "concept": "Privacy-first desktop software transforming disorganized family archives into durable, open-format long-term collections.",
        "description": "Generates open-access file copies, SHA-256 manifests, sidecar metadata, and a printable archive map ensuring long-term accessibility across generations."
    },
    {
        "name": "Camera Gear Claim Pack",
        "category": "Consumer-Owned Proof & Evidence",
        "subcategory": "asset-documentation",
        "score": 7.84,
        "concept": "Specialized claim-readiness and ownership proof pack for professional photographers and filmmakers.",
        "description": "Organizes serial numbers, purchase receipts, dated condition photos, and replacement values into an immediate insurer-ready theft and damage report."
    },
    {
        "name": "Committee Handover Capsule",
        "category": "Consumer-Owned Proof & Evidence",
        "subcategory": "organizational-continuity",
        "score": 7.71,
        "concept": "Guided annual leadership transition and account continuity package for non-profit clubs and associations.",
        "description": "Freezes account ownership, bank signatories, recurring deadlines, venue contracts, key asset inventories, and first-30-day successor checklists."
    },
    {
        "name": "Used E-Bike Life Passport",
        "category": "Consumer-Owned Proof & Evidence",
        "subcategory": "mobility-passports",
        "score": 7.66,
        "concept": "Verified service, battery condition, and ownership history log for pre-owned electric bicycles.",
        "description": "Tracks battery health cycles, official service notes, motor repairs, and ownership transfers to preserve resale value and buyer trust."
    },
    {
        "name": "Renter Repair Evidence Trail",
        "category": "Consumer-Owned Proof & Evidence",
        "subcategory": "tenant-rights",
        "score": 7.52,
        "concept": "One-time structured case documentation builder for renters dealing with unresolved maintenance issues.",
        "description": "Compiles timestamped photos, temperature readings, landlord communications, and formal notice timelines into an organized dispute package."
    },
    {
        "name": "Collectible Insurance Schedule Builder",
        "category": "Consumer-Owned Proof & Evidence",
        "subcategory": "specialty-insurance",
        "score": 7.38,
        "concept": "Annual inventory and appraisal schedule builder for high-value niche collectibles.",
        "description": "Creates insurer-compliant schedules with high-resolution condition images, provenance notes, and market valuation references."
    },
    {
        "name": "Pet Adoption Handover Passport",
        "category": "Consumer-Owned Proof & Evidence",
        "subcategory": "pet-care-records",
        "score": 7.13,
        "concept": "Transferable medical, dietary, and behavioral history passport for adopted and fostered animals.",
        "description": "Consolidates vaccination records, dietary requirements, microchip IDs, and behavioral notes into a single portable digital binder."
    },
    {
        "name": "Moving Box Evidence Passport",
        "category": "Consumer-Owned Proof & Evidence",
        "subcategory": "relocation-proof",
        "score": 6.96,
        "concept": "Box-by-box photographic inventory and carrier claim manifest for high-distance residential moves.",
        "description": "Generates QR-coded box manifests with sealed condition photos, high-value item declarations, and carrier loss claim documentation."
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

    existing_ids = [int(x['id'].split('-')[1]) for x in ideas_list if 'id' in x and x['id'].startswith('idea-')]
    next_id = max(existing_ids) + 1 if existing_ids else 186

    added_count = 0

    for item in RESET_4_IDEAS:
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
            "elevatorPitch": f"For targeted operational users, {item['name']} provides {item['concept'].lower()} The product addresses critical pain through structured evidence.",
            "detailedDescription": item['description'],
            "category": item['category'],
            "subcategory": item['subcategory'],
            "tags": [item['category'].lower(), item['subcategory']],
            "atAGlance": {
                "overallScore": int(item['score'] * 10),
                "speedToValue": "Fast (1-2 weeks)",
                "targetCustomer": "Specialized consumers & buyers",
                "pricingModel": "One-time purchase or annual subscription"
            },
            "customer": {
                "idealCustomerProfile": "Targeted consumer & specialty groups",
                "painPoints": [item['concept']],
                "willingnessToPay": "High for verified decision-support evidence"
            },
            "product": {
                "coreFeatures": [item['concept'], item['description']],
                "mvpScope": "Standardized paid report or lightweight extension"
            },
            "futureAiBuild": {
                "agentCapabilities": "Automated cross-referencing and verification"
            },
            "profitability": {
                "unitEconomics": "90%+ gross margin on digital delivery",
                "revenueScenarios": {
                    "conservative": 1000,
                    "base": 4500,
                    "aggressive": 12000
                }
            },
            "market": {
                "marketSize": "Consumer Proof & Evidence Niche",
                "competitors": ["Generic alternatives"]
            },
            "validation": {
                "experimentPlan": "7-day $15-$49 pre-order or prototype offer"
            },
            "goToMarket": {
                "channels": ["Direct outbound", "Community hubs"]
            },
            "operations": {
                "stack": "Node.js, Express, SQLite, GitHub Pages"
            },
            "risks": {
                "primaryRisks": ["Data sourcing", "Willingness to pay"]
            },
            "actionPlan": {
                "immediateNextSteps": ["Launch 7-day payment test"]
            },
            "scores": {
                "existingSpendingEvidence": int(item['score'] * 10),
                "painAndUrgency": int(item['score'] * 10),
                "speedToPaidTest": 90,
                "launchBelow100": 95,
                "freeDistribution": 85,
                "grossMargin": 90,
                "repeatRevenue": 75,
                "soloFounderFeasibility": 85,
                "defensibility": 70,
                "pessimisticResilience": 80
            },
            "compositeScores": {
                "overallOpportunity": item['score'] * 10,
                "bootstrappedPotential": 85.0,
                "soloFounderPotential": 88.0,
                "aiAgentPotential": 80.0,
                "fastestPathToRevenue": 92.0,
                "highestProfitPotential": 85.0,
                "lowestCostLaunch": 95.0,
                "bestRecurringRevenue": 78.0,
                "bestEnterpriseOpportunity": 70.0,
                "bestConsumerOpportunity": 88.0,
                "bestLocalOpportunity": 60.0,
                "bestMarketplaceOpportunity": 75.0,
                "bestLongTermDefensibility": 72.0,
                "bestForNontechnicalFounder": 65.0,
                "bestForTechnicalFounder": 90.0,
                "bestForSmallTeam": 88.0,
                "bestRequiringLittleCapital": 95.0
            },
            "sourceReferences": ["src-001"]
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
            df.write(f"## 7-Day Payment Experiment\nOffer standardized $15-$49 report/package. Target 3 paid pre-orders within 7 days.\n")

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

    print(f"Successfully ingested {added_count} ideas (Reset 4) into data/ideas.json!")

if __name__ == '__main__':
    main()
