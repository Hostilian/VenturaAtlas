import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IDEAS_JSON_PATH = os.path.join(ROOT, 'data', 'ideas.json')
IDEAS_DIR = os.path.join(ROOT, 'ideas')
PROMPTS_DIR = os.path.join(ROOT, 'prompts', 'idea-specific')

RESET_6_IDEAS = [
    {
        "name": "Fit-First Parametric Repair Studio",
        "category": "Fit-First Repair & Fabrication",
        "subcategory": "parametric-repair",
        "score": 8.42,
        "concept": "Guided measurement, safety classification, tiny test-fit coupon, printer calibration, and final editable STL/STEP for low-risk broken plastic parts.",
        "description": "Reduces expensive custom design by using measured fit coupons and parametric templates before final printing."
    },
    {
        "name": "Printer-Specific Fit Profile",
        "category": "Fit-First Repair & Fabrication",
        "subcategory": "printer-calibration",
        "score": 8.08,
        "concept": "Calibration coupon and stored compensation profile for 3D printers, materials, nozzles, and fit types.",
        "description": "Turns printer and material dimensional variability into reusable compensation profiles for print shops and makers."
    },
    {
        "name": "Repair Café Parametric Intake System",
        "category": "Fit-First Repair & Fabrication",
        "subcategory": "community-repair",
        "score": 7.92,
        "concept": "Structured repair intake system with part archetype selection, measurement cards, safety exclusions, and fit-coupon generation.",
        "description": "Directly addresses missing-part and inconsistent-information problems for community repair groups."
    },
    {
        "name": "Appliance Control-Knob Generator",
        "category": "Fit-First Repair & Fabrication",
        "subcategory": "appliance-repair",
        "score": 7.76,
        "concept": "Parametric round, splined, D-shaft, and set-screw control knobs with fit coupons and orientation marks.",
        "description": "Configurable replacement knobs for household appliances with customizable shaft dimensions and indicator styles."
    },
    {
        "name": "Furniture Foot and End-Cap Generator",
        "category": "Fit-First Repair & Fabrication",
        "subcategory": "furniture-repair",
        "score": 7.68,
        "concept": "Custom feet, tube caps, glides, and non-structural protective end caps based on measured profiles.",
        "description": "Custom parametric end caps and protective feet for chairs, tables, and tubing based on exact measured geometry."
    },
    {
        "name": "Print-Shop Measurement Intake Portal",
        "category": "Fit-First Repair & Fabrication",
        "subcategory": "3d-print-services",
        "score": 7.54,
        "concept": "Guided customer intake portal collecting photo references, scale measurements, mating-point dimensions, and environment notes.",
        "description": "Streamlines custom replacement part requests for 3D print shops by preventing incomplete customer inputs."
    },
    {
        "name": "Custom Drill-Alignment Guide",
        "category": "Fit-First Repair & Fabrication",
        "subcategory": "workshop-tooling",
        "score": 7.31,
        "concept": "Hole-spacing and perpendicular-alignment drill jigs generated for specific fasteners and materials.",
        "description": "Parametric disposable or reusable drill alignment guides sized to custom hardware and joint configurations."
    },
    {
        "name": "Damage-Shaped Mending Pattern Studio",
        "category": "Fit-First Repair & Fabrication",
        "subcategory": "garment-repair",
        "score": 7.18,
        "concept": "Printable and projector-ready garment mending patch patterns generated from damage photo outlines.",
        "description": "Calculates patch geometry, fabric stretch compensation, and stitch reinforcement from damaged clothing photos."
    },
    {
        "name": "Heatwave Window-Insert Pattern Studio",
        "category": "Fit-First Repair & Fabrication",
        "subcategory": "climate-adaptation",
        "score": 6.97,
        "concept": "Measured cut patterns for removable reflective, insulating, or blackout window inserts.",
        "description": "Generates room-specific window insert templates with explicit ventilation and emergency egress warnings."
    },
    {
        "name": "Board-Game Insert Generator",
        "category": "Fit-First Repair & Fabrication",
        "subcategory": "tabletop-organizers",
        "score": 6.83,
        "concept": "Parametric trays and box organizers generated from component counts and inner box dimensions.",
        "description": "Produces custom box inserts, card deck holders, and token trays for board game storage."
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
    next_id = max(existing_ids) + 1 if existing_ids else 195

    added_count = 0

    for item in RESET_6_IDEAS:
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
            "elevatorPitch": f"For makers, repairers, and operational users, {item['name']} provides {item['concept'].lower()} The product addresses physical repair and fitting challenges through parametric digital templates.",
            "detailedDescription": item['description'],
            "category": item['category'],
            "subcategory": item['subcategory'],
            "tags": [item['category'].lower(), item['subcategory']],
            "atAGlance": {
                "overallScore": int(item['score'] * 10),
                "speedToValue": "Fast (1-2 weeks)",
                "targetCustomer": "Makers, repairers & print services",
                "pricingModel": "Per file, per pattern, or shop subscription"
            },
            "customer": {
                "idealCustomerProfile": "3D printer owners, repair cafes, and print shops",
                "painPoints": [item['concept']],
                "willingnessToPay": "High for verified, fitting repair geometry"
            },
            "product": {
                "coreFeatures": [item['concept'], item['description']],
                "mvpScope": "Standardized parametric template or fit coupon generator"
            },
            "futureAiBuild": {
                "agentCapabilities": "Automated part classification and measurement guidance"
            },
            "profitability": {
                "unitEconomics": "90%+ gross margin on digital delivery",
                "revenueScenarios": {
                    "conservative": 1500,
                    "base": 5500,
                    "aggressive": 25000
                }
            },
            "market": {
                "marketSize": "Fit-First Repair & Digital Fabrication Niche",
                "competitors": ["Generic static STL repositories"]
            },
            "validation": {
                "experimentPlan": "7-day $12-$24 pre-order or prototype offer"
            },
            "goToMarket": {
                "channels": ["Direct search", "Makerspaces", "Repair communities"]
            },
            "operations": {
                "stack": "Node.js, Express, OpenSCAD, GitHub Pages"
            },
            "risks": {
                "primaryRisks": ["Measurement accuracy", "Material selection"]
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
                "bestEnterpriseOpportunity": 75.0,
                "bestConsumerOpportunity": 85.0,
                "bestLocalOpportunity": 65.0,
                "bestMarketplaceOpportunity": 70.0,
                "bestLongTermDefensibility": 75.0,
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
            df.write(f"## 7-Day Payment Experiment\nOffer $12-$24 founding repair file or fit coupon. Target 5 paid orders within 7 days.\n")

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

    print(f"Successfully ingested {added_count} ideas (Reset 6) into data/ideas.json!")

if __name__ == '__main__':
    main()
