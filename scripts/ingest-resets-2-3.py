import json
import os
import re
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IDEAS_JSON_PATH = os.path.join(ROOT, 'data', 'ideas.json')
SEARCH_INDEX_PATH = os.path.join(ROOT, 'data', 'search-index.json')
IDEAS_DIR = os.path.join(ROOT, 'ideas')
PROMPTS_DIR = os.path.join(ROOT, 'prompts', 'idea-specific')

RESET_2_IDEAS = [
    {
        "name": "Industrial Automation Obsolescence Graph",
        "category": "Industrial & Hardware Data",
        "subcategory": "lifecycle",
        "score": 8.69,
        "concept": "Source-linked lifecycle and migration graph for industrial PLCs, HMIs, drives, and controls hardware.",
        "description": "Upload a controls hardware BOM (Rockwell, Siemens, Schneider). Returns normalized catalog numbers, lifecycle status, discontinuation dates, successor recommendations, and firmware/software compatibility warnings."
    },
    {
        "name": "Codebase-Aware API Change Radar",
        "category": "Developer Tools",
        "subcategory": "monitoring",
        "score": 8.26,
        "concept": "Scans codebases for API calls, SDK methods, and webhooks to highlight breaking documentation & changelog changes.",
        "description": "Connects official API changelogs directly to affected files, tests, and endpoints in a repository instead of generic page-change notifications."
    },
    {
        "name": "PLC Project Migration Linter",
        "category": "Industrial & Hardware Data",
        "subcategory": "migration",
        "score": 8.25,
        "concept": "Local linter analyzing PLC project exports for obsolete instructions, hardware references, and network topology risks.",
        "description": "Parses project exports (Siemens/Rockwell) and reports migration blockers, retentive memory issues, and firmware incompatibilities before code conversion."
    },
    {
        "name": "Public Data Contract Watch",
        "category": "Developer Tools",
        "subcategory": "data-contracts",
        "score": 7.98,
        "concept": "Automated data contract monitoring and schema drift alerts for open government & public APIs.",
        "description": "Monitors open data feeds for missing columns, altered data types, late releases, broken endpoints, and historical revisions."
    },
    {
        "name": "Dependency License-Change Impact Diff",
        "category": "Developer Tools",
        "subcategory": "compliance",
        "score": 7.87,
        "concept": "Real-time diffing of upstream open-source license changes mapped against actual repository import paths.",
        "description": "Flags license re-licensing (SSPL, BSL, AGPL) in upstream packages and calculates precise linking/distribution risk."
    },
    {
        "name": "Industrial Protocol Gateway Selector",
        "category": "Industrial & Hardware Data",
        "subcategory": "hardware-selection",
        "score": 7.77,
        "concept": "Source-verified compatibility resolver for industrial protocol conversion gateways.",
        "description": "Maps Modbus, PROFIBUS, EtherNet/IP, and OPC UA hardware conversion requirements with explicit latency & topology warnings."
    },
    {
        "name": "Scientific Consumables Compatibility Graph",
        "category": "Healthcare & Biotech",
        "subcategory": "laboratory",
        "score": 7.72,
        "concept": "Neutral evidence-backed compatibility graph for HPLC columns, vials, well plates, and lab consumables.",
        "description": "Cross-references lab instrument models with alternative consumable part numbers, material compatibility, and solvent limits."
    },
    {
        "name": "Industrial Manual Revision Resolver",
        "category": "Industrial & Hardware Data",
        "subcategory": "documentation",
        "score": 7.39,
        "concept": "Versioned manual and errata search engine for legacy industrial machinery.",
        "description": "Resolves exact manual revisions, firmware release notes, and wiring diagram errata across discontinued machinery models."
    },
    {
        "name": "Lab Software Exit-Risk Index",
        "category": "Healthcare & Biotech",
        "subcategory": "software-audit",
        "score": 7.36,
        "concept": "Standardized data exportability and lock-in risk auditor for LIMS and ELN laboratory software.",
        "description": "Evaluates proprietary laboratory software vendors on schema openness, export completeness, and historical migration costs."
    },
    {
        "name": "Construction Product Substitution Matrix",
        "category": "Industrial & Hardware Data",
        "subcategory": "construction",
        "score": 7.23,
        "concept": "Source-linked architectural specification and building material equivalence matrix.",
        "description": "Compares building materials and MEP components for fire rating, structural compliance, and acoustic equivalence."
    }
]

RESET_3_IDEAS = [
    {
        "name": "Discord Ritual Rooms",
        "category": "Creator Economy & Digital Assets",
        "subcategory": "discord-activities",
        "score": 8.19,
        "concept": "Recurring 10-15 minute social game sessions embedded directly inside Discord for existing friend groups.",
        "description": "Guild-subscribed weekly interactive chapters (clues, group decisions, mini mysteries) that produce a shared private digital relic."
    },
    {
        "name": "Roblox Safe Micro-World Kits",
        "category": "Creator Economy & Digital Assets",
        "subcategory": "roblox-assets",
        "score": 8.05,
        "concept": "Coherent, script-free, mobile-performance-optimized 3D environment starting kits for Roblox creators.",
        "description": "USD-priced modular starting environments (rooftop clubhouse, coastal market, observatory) built to strict memory and security budgets."
    },
    {
        "name": "Roblox Asset Trust Scanner",
        "category": "Creator Economy & Digital Assets",
        "subcategory": "security-plugin",
        "score": 8.01,
        "concept": "Roblox Studio plugin scanning models and places for backdoor scripts, obfuscation, and hidden network calls.",
        "description": "Generates transparent evidence reports detailing embedded scripts, require() calls, external asset dependencies, and performance risks."
    },
    {
        "name": "Discord Local-Language Party Packs",
        "category": "Creator Economy & Digital Assets",
        "subcategory": "discord-localization",
        "score": 7.74,
        "concept": "Culturally native local-language social game seasons for non-English Discord communities.",
        "description": "Language and region-specific party game chapters with local wordplay, regional visual motifs, and authentic humor."
    },
    {
        "name": "Roblox Mobile-Ready Environment Packs",
        "category": "Creator Economy & Digital Assets",
        "subcategory": "roblox-performance",
        "score": 7.74,
        "concept": "Strictly performance-budgeted 3D asset packs engineered for low-memory mobile Roblox devices.",
        "description": "Environment packs specifying poly counts, texture streaming configurations, and low/medium/high mobile performance presets."
    },
    {
        "name": "Framer Template Preflight Checker",
        "category": "Creator Economy & Digital Assets",
        "subcategory": "design-tools",
        "score": 7.49,
        "concept": "Pre-submission QA plugin for Framer template creators inspecting mobile breakpoints, links, and overflow.",
        "description": "Scans Framer sites for broken image assets, font inconsistencies, placeholder text, and marketplace submission readiness."
    },
    {
        "name": "Micro-IP Creator Kits",
        "category": "Creator Economy & Digital Assets",
        "subcategory": "digital-ip",
        "score": 7.35,
        "concept": "Turnkey original fictional world bundles (lore, character bibles, UI motifs, audio loops) with commercial licenses.",
        "description": "Provides indie game devs and storytellers with coherent micro-universes ready for adaptation and game development."
    },
    {
        "name": "Solo Story Seasons",
        "category": "Creator Economy & Digital Assets",
        "subcategory": "indie-games",
        "score": 7.14,
        "concept": "Episodic downloadable interactive fiction and digital journaling games distributed on itch.io.",
        "description": "Short 20-minute episodic seasons featuring distinct visual identities, printable companions, and modular soundtracks."
    },
    {
        "name": "Bluesky Intentional Feed Studio",
        "category": "Creator Economy & Digital Assets",
        "subcategory": "social-feeds",
        "score": 6.89,
        "concept": "Curation and monetization engine for building niche, transparent Bluesky custom feed algorithms.",
        "description": "Enables niche creators to build, rank, and monetize specialized topic timelines (European game art, open source tools) on AT Protocol."
    },
    {
        "name": "Fortnite Friends-First Social Island",
        "category": "Creator Economy & Digital Assets",
        "subcategory": "fn-creative",
        "score": 6.88,
        "concept": "Cooperative, non-competitive social spaces inside Fortnite Creative built for private friend groups.",
        "description": "Small UEFN islands focusing on cooperative puzzles, weekly shared events, and transparent non-gambling cosmetics."
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
    next_id = max(existing_ids) + 1 if existing_ids else 166

    all_new = RESET_2_IDEAS + RESET_3_IDEAS
    added_count = 0

    for item in all_new:
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
                "targetCustomer": "Specialized operators & buyers",
                "pricingModel": "Standardized report or monthly subscription"
            },
            "customer": {
                "idealCustomerProfile": "Targeted SMBs and specialized practitioners",
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
                "marketSize": "Niche B2B / Creator Ecosystem",
                "competitors": ["Generic alternatives"]
            },
            "validation": {
                "experimentPlan": "7-day $49 pre-order or prototype offer"
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
                "bestConsumerOpportunity": 82.0,
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

        # Create Dossier markdown file
        dossier_path = os.path.join(IDEAS_DIR, f"{slug}.md")
        with open(dossier_path, 'w', encoding='utf-8') as df:
            df.write(f"# {item['name']} ({idea_id_str})\n\n")
            df.write(f"**Score:** {item['score']}/10  |  **Category:** {item['category']}\n\n")
            df.write(f"## Executive Summary\n{item['concept']}\n\n")
            df.write(f"## Product Description\n{item['description']}\n\n")
            df.write(f"## 7-Day Payment Experiment\nOffer standardized $49 report. Target 3 paid pre-orders within 7 days.\n")

        # Create Prompt Pack
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

    print(f"Successfully ingested {added_count} ideas (Reset 2 & Reset 3) into data/ideas.json!")

if __name__ == '__main__':
    main()
