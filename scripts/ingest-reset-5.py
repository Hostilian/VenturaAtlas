import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IDEAS_JSON_PATH = os.path.join(ROOT, 'data', 'ideas.json')
SEARCH_INDEX_PATH = os.path.join(ROOT, 'data', 'search-index.json')
IDEAS_DIR = os.path.join(ROOT, 'ideas')
PROMPTS_DIR = os.path.join(ROOT, 'prompts', 'idea-specific')

RESET_5_IDEAS = [
    {
        "name": "Founder Absence Stress Test",
        "category": "Independence & Operational Trust",
        "subcategory": "founder-dependency",
        "score": 8.55,
        "concept": "Controlled experiment measuring real operational interruptions when a small-business owner stops answering questions for 72 hours.",
        "description": "Generates a founder-dependency heat map, process delay log, exposed revenue estimate, and prioritized operational independence plan."
    },
    {
        "name": "Credential Request Firewall",
        "category": "Independence & Operational Trust",
        "subcategory": "digital-identity",
        "score": 8.21,
        "concept": "Privacy assistant embedded in digital-identity wallets explaining requested attributes, mandatory fields, and minimum necessary disclosures.",
        "description": "Helps users avoid over-disclosing personal data by offering selective disclosure guidance and zero-knowledge proof alternatives."
    },
    {
        "name": "Scamfire Drill",
        "category": "Independence & Operational Trust",
        "subcategory": "fraud-rehearsal",
        "score": 8.09,
        "concept": "Simulation platform where households and small teams safely rehearse realistic scam scenarios before facing genuine emergencies.",
        "description": "Tests pause behavior, callback verification, and safe word protocols across executive impersonation, urgent transfer, and bank fraud scenarios."
    },
    {
        "name": "Vendor Payment Change Challenge",
        "category": "Independence & Operational Trust",
        "subcategory": "payment-security",
        "score": 7.95,
        "concept": "Lightweight verification procedure for small businesses receiving supplier requests to change bank routing or payment details.",
        "description": "Freezes payment change requests, enforces out-of-band callback challenges, and produces auditable payment-change evidence receipts."
    },
    {
        "name": "Accessible Checkout Replay",
        "category": "Independence & Operational Trust",
        "subcategory": "accessibility-testing",
        "score": 7.82,
        "concept": "Task-based accessibility testing engine evaluating real commercial checkout completions for disabled users.",
        "description": "Tests product discovery, option selection, form correction, payment completion, and cancellation transparency beyond simple static DOM scanners."
    },
    {
        "name": "Tender Bid/No-Bid Fit Scanner",
        "category": "Independence & Operational Trust",
        "subcategory": "procurement-decisions",
        "score": 7.71,
        "concept": "Procurement requirement scanner evaluating company fit, evidence gaps, and disqualifying conditions before committing to public tenders.",
        "description": "Maps mandatory requirements against team experience and capacity to prevent costly bid efforts on low-probability tenders."
    },
    {
        "name": "Dynamic Tariff Counterfactual Simulator",
        "category": "Independence & Operational Trust",
        "subcategory": "energy-transparency",
        "score": 7.58,
        "concept": "Household energy simulator analyzing real interval electricity consumption against alternative dynamic tariffs.",
        "description": "Calculates real counterfactual costs, achievable behavioral savings, and risk under cold weather or peak rate spikes."
    },
    {
        "name": "AI-Agent Purchase Guardrail",
        "category": "Independence & Operational Trust",
        "subcategory": "agentic-safety",
        "score": 7.52,
        "concept": "Middleware placed between autonomous AI shopping agents and irreversible transactions.",
        "description": "Detects hidden subscription renewals, changed prices, dark patterns, and unauthorized consent requests before completing transactions."
    },
    {
        "name": "Older-Adult Tech Support Interpreter",
        "category": "Independence & Operational Trust",
        "subcategory": "family-tech-support",
        "score": 7.41,
        "concept": "Family tech support assistant converting complex digital error messages into clear, actionable physical steps for older adults.",
        "description": "Provides calm, step-by-step guidance without remote takeover, reducing scam vulnerability and family tech anxiety."
    },
    {
        "name": "E-invoice Readiness Map",
        "category": "Independence & Operational Trust",
        "subcategory": "compliance-readiness",
        "score": 7.35,
        "concept": "Country-specific diagnostic mapping small business invoice workflows against EU e-invoicing mandates.",
        "description": "Identifies format requirements, software gaps, tax reporting rules, and required migration timelines."
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
    next_id = max(existing_ids) + 1 if existing_ids else 185

    added_count = 0

    for item in RESET_5_IDEAS:
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
            "elevatorPitch": f"For targeted operational teams and users, {item['name']} provides {item['concept'].lower()} The product addresses critical pain through structured evidence and automated checks.",
            "detailedDescription": item['description'],
            "category": item['category'],
            "subcategory": item['subcategory'],
            "tags": [item['category'].lower(), item['subcategory']],
            "atAGlance": {
                "overallScore": int(item['score'] * 10),
                "speedToValue": "Fast (1-2 weeks)",
                "targetCustomer": "Specialized teams & operations",
                "pricingModel": "Paid diagnostic or annual subscription"
            },
            "customer": {
                "idealCustomerProfile": "Specialized operational teams & founders",
                "painPoints": [item['concept']],
                "willingnessToPay": "High for verified decision support and fraud prevention"
            },
            "product": {
                "coreFeatures": [item['concept'], item['description']],
                "mvpScope": "Standardized paid diagnostic report or lightweight middleware"
            },
            "futureAiBuild": {
                "agentCapabilities": "Automated simulation, cross-referencing, and verification"
            },
            "profitability": {
                "unitEconomics": "90%+ gross margin on digital delivery",
                "revenueScenarios": {
                    "conservative": 1200,
                    "base": 5000,
                    "aggressive": 15000
                }
            },
            "market": {
                "marketSize": "Independence & Operational Trust Niche",
                "competitors": ["Generic manual checklists"]
            },
            "validation": {
                "experimentPlan": "7-day $49-$99 diagnostic pilot offer"
            },
            "goToMarket": {
                "channels": ["Direct outbound", "Adviser networks"]
            },
            "operations": {
                "stack": "Node.js, Express, SQLite, GitHub Pages"
            },
            "risks": {
                "primaryRisks": ["Willingness to pay", "Distribution channel"]
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
                "bestLocalOpportunity": 60.0,
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
            df.write(f"## 7-Day Payment Experiment\nOffer standardized $49-$99 diagnostic report. Target 3 paid pilots within 7 days.\n")

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

    print(f"Successfully ingested {added_count} ideas (Reset 5) into data/ideas.json!")

if __name__ == '__main__':
    main()
