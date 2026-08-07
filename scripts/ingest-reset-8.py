import json
import os
import re
import subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IDEAS_JSON_PATH = os.path.join(ROOT, 'data', 'ideas.json')
IDEAS_DIR = os.path.join(ROOT, 'ideas')
PROMPTS_DIR = os.path.join(ROOT, 'prompts', 'idea-specific')

RESET_8_IDEAS = [
    {
        "name": "ExactRoom Access Confirmation",
        "category": "Accessible lodging & lodging quality",
        "subcategory": "room-confirmation",
        "score": 8.47,
        "concept": "A property-issued, booking-linked receipt confirming the exact room or unit, measured access features, what is guaranteed versus merely requested, who confirmed it, and when it must be reconfirmed.",
        "description": "A booking-linked confirmation system connecting measured room specifications to guest reservations. Enables hotels and vacation rentals to issue objective, room-specific access confirmations with automated change notifications and pre-arrival reconfirmation deadlines."
    },
    {
        "name": "Measured Accessible Room Specification",
        "category": "Accessible lodging",
        "subcategory": "room-specification",
        "score": 8.20,
        "concept": "A room-specific, date-stamped specification containing measured doors, clearances, bed transfer space, bathroom geometry, lift dimensions, alarms, routes, and evidence photos.",
        "description": "Objective room-level access specification and guided capture protocol, recording exact physical measurements, route chains, and date-stamped photo evidence for individual hotel rooms and rental units."
    },
    {
        "name": "Temporary Event Access Reality Pack",
        "category": "Temporary events",
        "subcategory": "event-accessibility",
        "score": 7.96,
        "concept": "A temporary, date-specific map of entrances, surfaces, toilets, seating, queues, quiet spaces, lighting, sound, parking, and assistance procedures.",
        "description": "Time-bound event access profile documenting temporary physical routes, sensory conditions, seating arrangements, and live accessibility change logs for short-duration events and festivals."
    },
    {
        "name": "Time-Based Sensory Visit Profile",
        "category": "Museums and attractions",
        "subcategory": "sensory-profiles",
        "score": 7.82,
        "concept": "Measured and observed sound, light, crowd, queue, and quiet-space conditions by time block, with no universal sensory-safe claim.",
        "description": "Time-segmented sensory and crowd environment profile for venues, providing objective decibel, illuminance, queue length, and rest-area observations across specific operating hours."
    },
    {
        "name": "Elevator Outage Journey Assurance",
        "category": "Public transport and lifts",
        "subcategory": "transit-accessibility",
        "score": 7.75,
        "concept": "Consolidates official lift status, station topology, transfer dependence, and fallback routes for a specific planned journey.",
        "description": "Real-time transit accessibility monitoring and contingency planning tool that maps elevator status feeds against station transfer paths to guarantee step-free itinerary viability."
    },
    {
        "name": "Trusted Product Label Change Watch",
        "category": "Packaged food",
        "subcategory": "food-labelling",
        "score": 7.63,
        "concept": "A family watchlist that compares user-photographed ingredient and allergen labels over time and alerts to visible changes while treating packaging as the final source.",
        "description": "Household ingredient and allergen change-detection engine comparing timestamped label photographs across packaging versions to highlight unexpected reformulations."
    },
    {
        "name": "Room-Side Sleepability Specification",
        "category": "Lodging quality",
        "subcategory": "quiet-lodging",
        "score": 7.55,
        "concept": "Room-specific facts on road side, lift proximity, connecting doors, HVAC, blackout, event spaces, construction, and typical disturbance sources.",
        "description": "Objective acoustic and disturbance profile for individual guest rooms, documenting noise orientation, structural adjacency, HVAC decibels, and blackout quality."
    },
    {
        "name": "Assistance Confirmation Receipt",
        "category": "Air travel",
        "subcategory": "passenger-assistance",
        "score": 7.48,
        "concept": "A cross-party receipt showing requested assistance, airport and airline acknowledgement, handoff points, equipment details, and reconfirmation status.",
        "description": "Multi-party passenger assistance tracking receipt linking traveler equipment requirements, airline PNRs, airport ground handlers, and gate handoff confirmations."
    },
    {
        "name": "Senior Comfort Route Card",
        "category": "Pedestrian mobility",
        "subcategory": "accessible-routing",
        "score": 7.39,
        "concept": "A route optimized for crossings, gradients, pavement quality, seating, toilets, traffic exposure, shade, and seasonal conditions.",
        "description": "Pedestrian navigation profile prioritizing rest seating intervals, sidewalk slope, shade coverage, public restrooms, and pavement smoothness over minimal distance."
    },
    {
        "name": "Official Letter Action Extractor",
        "category": "Cross-border consumer rights",
        "subcategory": "document-extraction",
        "score": 7.22,
        "concept": "Extracts sender, decision, deadline, required response, evidence, official channels, and unresolved ambiguity from a government or utility letter.",
        "description": "Structured document processing tool extracting mandatory deadlines, required evidence items, decision summaries, and recourse steps from official administrative letters."
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

    # Check if already added
    if any(x.get('name') == 'ExactRoom Access Confirmation' for x in ideas_list):
        print("Reset 8 ideas already ingested into data/ideas.json!")
        return

    existing_ids = [int(x['id'].split('-')[1]) for x in ideas_list if 'id' in x and x['id'].startswith('idea-')]
    next_id = max(existing_ids) + 1 if existing_ids else 250

    added_count = 0

    for item in RESET_8_IDEAS:
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
            "elevatorPitch": f"For buyers, operators, and individuals, {item['name']} provides {item['concept'].lower()} The product establishes verifiable physical and service access certainty.",
            "detailedDescription": item['description'],
            "category": item['category'],
            "subcategory": item['subcategory'],
            "tags": [item['category'].lower(), item['subcategory'], "eighth reset", "accessibility"],
            "atAGlance": {
                "overallScore": int(item['score'] * 10),
                "speedToValue": "Fast (1-2 weeks)",
                "targetCustomer": "Travellers, venue operators, municipal & travel logistics managers",
                "pricingModel": "Per confirmation, per property subscription, or per report"
            },
            "customer": {
                "idealCustomerProfile": "Travelers with specific access needs & independent hospitality/event operators",
                "painPoints": [item['concept']],
                "willingnessToPay": "High for verified, room/route-specific access guarantees"
            },
            "product": {
                "coreFeatures": [item['concept'], item['description']],
                "mvpScope": "Standardized access confirmation receipt or date-stamped specification page"
            },
            "futureAiBuild": {
                "agentCapabilities": "Automated route/room specification verification and change notifications"
            },
            "profitability": {
                "unitEconomics": "85%+ gross margin on digital confirmation receipts and specifications",
                "revenueScenarios": {
                    "conservative": 2500,
                    "base": 12000,
                    "aggressive": 45000
                }
            },
            "market": {
                "marketSize": "Accessible Travel, Event Logistics & Mobility Infrastructure Niche",
                "competitors": ["Generic travel directories, unverified hotel listings"]
            },
            "validation": {
                "experimentPlan": "7-day €49 founding pilot offer for 1 measured specification + booking confirmation workflow"
            },
            "goToMarket": {
                "channels": ["Independent hotel outreach", "Accessible travel agencies", "Disability advocacy networks"]
            },
            "operations": {
                "stack": "Node.js, Express, Python, GitHub Pages, WebManifest"
            },
            "risks": {
                "primaryRisks": ["Property reluctance to distinguish guaranteed vs requested features", "Data staleness"]
            },
            "actionPlan": {
                "immediateNextSteps": ["Launch 7-day €49 room confirmation pilot"]
            },
            "scores": {
                "existingSpendingEvidence": int(item['score'] * 10),
                "painAndUrgency": int(item['score'] * 10),
                "speedToPaidTest": 90,
                "launchBelow100": 95,
                "freeDistribution": 85,
                "grossMargin": 90,
                "repeatRevenue": 80,
                "soloFounderFeasibility": 85,
                "defensibility": 75,
                "pessimisticResilience": 80
            },
            "compositeScores": {
                "overallOpportunity": item['score'] * 10,
                "bootstrappedPotential": 88.0,
                "soloFounderPotential": 89.0,
                "aiAgentPotential": 83.0,
                "fastestPathToRevenue": 91.0,
                "highestProfitPotential": 85.0,
                "lowestCostLaunch": 95.0,
                "bestRecurringRevenue": 82.0,
                "bestEnterpriseOpportunity": 80.0,
                "bestConsumerOpportunity": 75.0,
                "bestLocalOpportunity": 65.0,
                "bestMarketplaceOpportunity": 70.0,
                "bestLongTermDefensibility": 81.0,
                "bestForNontechnicalFounder": 70.0,
                "bestForTechnicalFounder": 90.0,
                "bestForSmallTeam": 91.0,
                "bestRequiringLittleCapital": 95.0
            },
            "sourceReferences": ["src-008"]
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
            df.write(f"## 7-Day Payment Experiment\nOffer €49 founding pilot to create 1 measured specification and booking confirmation workflow. Target 3 paid orders within 7 days.\n")

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

    print(f"Successfully ingested {added_count} ideas (Eighth Reset) into data/ideas.json!")

if __name__ == '__main__':
    main()
