import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IDEAS_JSON_PATH = os.path.join(ROOT, 'data', 'ideas.json')
IDEAS_DIR = os.path.join(ROOT, 'ideas')
PROMPTS_DIR = os.path.join(ROOT, 'prompts', 'idea-specific')

RESET_10_IDEAS = [
    {
        "name": "PowerPlot — Electrical Grid Capacity Intelligence & Site Exchange",
        "category": "Energy & Electrical Grid Infrastructure",
        "subcategory": "grid-capacity-intelligence",
        "score": 9.40,
        "concept": "Marketplace and intelligence layer for land with usable electrical grid connection capacity, matching data centers, battery developers, and factories with grid-ready sites.",
        "description": "Real estate and grid capacity intelligence platform aggregating substation data, connection queues, voltage feeders, and transformer availability to map and monetize power-ready industrial land."
    },
    {
        "name": "ColdBattery — Virtual Thermal Refrigeration Battery Network",
        "category": "Energy Storage & Demand Response",
        "subcategory": "virtual-power-plant",
        "score": 9.30,
        "concept": "Turns supermarket, warehouse, and food processing refrigeration systems into a distributed virtual thermal battery for grid demand response and flexibility markets.",
        "description": "Demand response and thermal storage optimization platform operating commercial refrigeration compressors collectively as a dispatchable virtual battery without violating temperature constraints."
    },
    {
        "name": "DeadPart — Obsolete Industrial Component Reproduction Network",
        "category": "Industrial Machinery & Equipment Repair",
        "subcategory": "obsolete-part-manufacturing",
        "score": 9.20,
        "concept": "On-demand reproduction and sourcing network for certified replacement components of discontinued industrial machinery.",
        "description": "A specialized reverse-engineering and spare part creation network finding, scanning, 3D-printing, or CNC-milling obsolete machinery parts to prevent multi-million euro factory downtime."
    },
    {
        "name": "MachineKey — Unified Industrial Machine Telemetry API",
        "category": "Industrial Automation & Maintenance",
        "subcategory": "machine-telemetry-api",
        "score": 9.00,
        "concept": "Unified telemetry API and cross-brand machine ontology aggregating data across multi-vendor industrial equipment under the EU Data Act.",
        "description": "A cross-manufacturer equipment telemetry gateway providing independent maintenance teams and factory operators with unified runtime, cycle, error, and wear data across multi-brand machines."
    },
    {
        "name": "LabGrid — Remote Scientific Equipment & Sample Routing API",
        "category": "Scientific Research Infrastructure",
        "subcategory": "scientific-equipment-routing",
        "score": 8.90,
        "concept": "AWS-style sample routing network dispatching scientific samples into idle NMR, TEM, XPS, and LC-MS equipment across European universities and labs.",
        "description": "An automated scientific sample routing platform matching lab analysis requests with available instrument capacity, handling logistics, chain-of-custody, protocol normalization, and QA."
    },
    {
        "name": "ExitReady — SME Acquisition Readiness & Succession Engine",
        "category": "SME M&A & Business Succession",
        "subcategory": "succession-readiness",
        "score": 8.80,
        "concept": "Continuous SME transferability auditor providing retiring owners with a multi-year program to systematicize operations, reduce concentration, and maximize exit valuation.",
        "description": "A succession preparation workspace integrating accounting, CRM, and payroll data to highlight transferability risks, eliminate key-person dependency, and manage acquisition deals."
    },
    {
        "name": "RobotOps — Teleoperated Human-in-the-Loop Robot Operations",
        "category": "Robotics & Automation Operations",
        "subcategory": "teleoperated-robotics",
        "score": 8.70,
        "concept": "Remote human operator workforce intervening in robotic edge cases while generating demonstration training data for autonomous models.",
        "description": "A human-in-the-loop teleoperation network for commercial robots in specialized niches like laundry, greenhouses, and night-shift shelf handling, building training data while solving edge cases."
    },
    {
        "name": "Fireproof — Climate Resilience & Property Risk Passports",
        "category": "Climate Resilience & Insurance Tech",
        "subcategory": "property-resilience-passport",
        "score": 8.60,
        "concept": "Verifiable property resilience passports documenting owner risk mitigation measures to unlock insurance discounts and lower climate risk exposure.",
        "description": "A verified property resilience platform recording vegetation clearance, flood barriers, roof materials, and water storage to bridge the climate insurance protection gap."
    },
    {
        "name": "CalibraRisk — Risk-Based Industrial Equipment Calibration Optimizer",
        "category": "Industrial Metrology & Compliance",
        "subcategory": "predictive-calibration",
        "score": 8.40,
        "concept": "Replaces fixed 12-month equipment calibration cycles with statistical risk-based interval optimization to reduce factory downtime and calibration expenditure.",
        "description": "A metrology optimization engine analyzing historical instrument drift, usage intensity, and measurement uncertainty to safely extend calibration intervals on non-critical sensors."
    },
    {
        "name": "HeatExpert Cloud — Remote Expert Supervision for Heat Pump Technicians",
        "category": "Clean Energy & HVAC Operations",
        "subcategory": "remote-expert-supervision",
        "score": 8.30,
        "concept": "Remote expert supervision platform allowing senior HVAC engineers to guide junior heat-pump technicians through diagnostic video streams and AI-assisted troubleshooting.",
        "description": "A workforce multiplication platform for heat pump installations, connecting on-site junior technicians with master engineers via live telemetry, schematics, and video guidance."
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

    if any(x.get('name') == 'PowerPlot — Electrical Grid Capacity Intelligence & Site Exchange' for x in ideas_list):
        print("Reset 10 ideas already ingested into data/ideas.json!")
        return

    existing_ids = [int(x['id'].split('-')[1]) for x in ideas_list if 'id' in x and x['id'].startswith('idea-')]
    next_id = max(existing_ids) + 1 if existing_ids else 271

    added_count = 0

    for item in RESET_10_IDEAS:
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
            "elevatorPitch": f"For grid developers, industrial operators, and facility managers, {item['name']} provides {item['concept'].lower()} The product unlocks trapped capacity, equipment data, and specialized human expertise.",
            "detailedDescription": item['description'],
            "category": item['category'],
            "subcategory": item['subcategory'],
            "tags": [item['category'].lower(), item['subcategory'], "tenth reset", "capacity-unlock"],
            "status": "priority" if item['score'] >= 8.8 else "explore",
            "atAGlance": {
                "overallScore": int(item['score'] * 10),
                "speedToValue": "Fast (1-2 weeks)",
                "targetCustomer": "Grid developers, cold storage operators, factory leads, & scientific labs",
                "pricingModel": "Data subscription, transaction commission, percentage of expenditure saved, or per-job fee"
            },
            "customer": {
                "idealCustomerProfile": "Data center developers, industrial facility managers, research labs, & HVAC contractors",
                "painPoints": [item['concept']],
                "willingnessToPay": "High for unlocking scarce grid capacity, obsolete parts, and operational savings"
            },
            "product": {
                "coreFeatures": [item['concept'], item['description']],
                "mvpScope": "Standardized capacity intelligence map or on-demand part/sample routing workflow"
            },
            "futureAiBuild": {
                "agentCapabilities": "Automated grid feeder mapping, telemetry normalization, & remote expert assistance"
            },
            "profitability": {
                "unitEconomics": "88%+ gross margin on digital capacity intelligence, telemetry APIs, and transaction commissions",
                "revenueScenarios": {
                    "conservative": 5000,
                    "base": 25000,
                    "aggressive": 85000
                }
            },
            "market": {
                "marketSize": "Energy Grid Infrastructure, Industrial Maintenance & Scientific Instrumentation",
                "competitors": ["Legacy real estate brokers, proprietary OEM clouds, fragmented local brokers"]
            },
            "validation": {
                "experimentPlan": "Offer grid capacity search or component reproduction intake to 10 targeted enterprise prospects within 7 days"
            },
            "goToMarket": {
                "channels": ["Direct energy & industrial developer outreach", "Engineering associations", "Utility partners"]
            },
            "operations": {
                "stack": "Node.js, Express, Python, GitHub Pages, WebManifest"
            },
            "risks": {
                "primaryRisks": ["Grid data latency", "Complex hardware/OEM integration timelines"]
            },
            "actionPlan": {
                "immediateNextSteps": ["Launch 7-day capacity search or component reproduction pilot"]
            },
            "scores": {
                "existingSpendingEvidence": int(item['score'] * 10),
                "painAndUrgency": int(item['score'] * 10),
                "speedToPaidTest": 92,
                "launchBelow100": 95,
                "freeDistribution": 88,
                "grossMargin": 92,
                "repeatRevenue": 88,
                "soloFounderFeasibility": 85,
                "defensibility": 85,
                "pessimisticResilience": 88
            },
            "compositeScores": {
                "overallOpportunity": item['score'] * 10,
                "bootstrappedPotential": 92.0,
                "soloFounderPotential": 90.0,
                "aiAgentPotential": 90.0,
                "fastestPathToRevenue": 93.0,
                "highestProfitPotential": 90.0,
                "lowestCostLaunch": 95.0,
                "bestRecurringRevenue": 88.0,
                "bestEnterpriseOpportunity": 88.0,
                "bestConsumerOpportunity": 60.0,
                "bestLocalOpportunity": 72.0,
                "bestMarketplaceOpportunity": 80.0,
                "bestLongTermDefensibility": 88.0,
                "bestForNontechnicalFounder": 70.0,
                "bestForTechnicalFounder": 95.0,
                "bestForSmallTeam": 93.0,
                "bestRequiringLittleCapital": 95.0
            },
            "sourceReferences": ["src-010"]
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
            df.write(f"## 7-Day Payment Experiment\nOffer capacity intelligence report or component sourcing pilot to 10 enterprise prospects. Target 2 paid orders within 7 days.\n")

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

    print(f"Successfully ingested {added_count} ideas (Tenth Reset) into data/ideas.json!")

if __name__ == '__main__':
    main()
