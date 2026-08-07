import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IDEAS_JSON_PATH = os.path.join(ROOT, 'data', 'ideas.json')
IDEAS_DIR = os.path.join(ROOT, 'ideas')
PROMPTS_DIR = os.path.join(ROOT, 'prompts', 'idea-specific')

RESET_7_IDEAS = [
    {
        "name": "Result Lineage Release Gate",
        "category": "Scholarly Research & Lineage",
        "subcategory": "result-provenance",
        "score": 8.58,
        "concept": "Maps every figure, table, in-text numerical result, and major empirical claim to source data, scripts, environment, repository object, and release version.",
        "description": "Cross-object lineage graph and release manifest that verifies empirical results correspond to verifiable source code, data, and environment settings before manuscript release."
    },
    {
        "name": "Data Availability Statement Reality Checker",
        "category": "Scholarly Research & Lineage",
        "subcategory": "data-sharing",
        "score": 8.23,
        "concept": "Compares manuscript data availability statements with actual repository records, access conditions, identifiers, files, and licences.",
        "description": "Automated audit tool that verifies data availability claims match repository accessibility, licence terms, and persistence standards."
    },
    {
        "name": "Anonymous Artifact Leak Scanner",
        "category": "Scholarly Research & Lineage",
        "subcategory": "artifact-security",
        "score": 8.05,
        "concept": "Finds identity leakage in PDFs, metadata, acknowledgements, repository links, filenames, supplements, and browsing paths for double-blind submissions.",
        "description": "Pre-submission scanner that inspects research artifacts and repositories for hidden author identity leaks prior to double-blind peer review."
    },
    {
        "name": "Research Software Citation Pack",
        "category": "Scholarly Research & Lineage",
        "subcategory": "software-citation",
        "score": 7.91,
        "concept": "Generates aligned CITATION.cff, CodeMeta, README citation text, release metadata, DOI instructions, and software-version references.",
        "description": "Standardized generator for research software metadata, ensuring seamless indexing across Zenodo, CodeMeta, CITATION.cff, and paper references."
    },
    {
        "name": "Scientific Figure Accessibility Preflight",
        "category": "Scholarly Research & Lineage",
        "subcategory": "scientific-figures",
        "score": 7.80,
        "concept": "Checks labels, units, text size, colour dependence, contrast, panel order, captions, short alt text, and long descriptions for manuscript figures.",
        "description": "Automated accessibility checker evaluating scientific figures against publisher standards for contrast, alt text, and colourblind-safe palettes."
    },
    {
        "name": "DMS Plan-to-Actual Workflow",
        "category": "Scholarly Research & Lineage",
        "subcategory": "grant-compliance",
        "score": 7.66,
        "concept": "Converts grant data management and sharing plans into dated tasks, repositories, identifiers, privacy decisions, costs, and progress evidence.",
        "description": "Operational tracking system converting static NIH/funder Data Management & Sharing plans into verifiable milestones and deposit evidence."
    },
    {
        "name": "Preprint–Publication Change Ledger",
        "category": "Scholarly Research & Lineage",
        "subcategory": "scholarly-versions",
        "score": 7.52,
        "concept": "Produces a structured account of claims, figures, methods, and conclusions that changed between preprint, accepted, and published version.",
        "description": "Version tracking system highlighting granular claim, data, figure, and methodological changes across preprint and publisher iterations."
    },
    {
        "name": "Research Data Anonymization Red Team",
        "category": "Scholarly Research & Lineage",
        "subcategory": "research-privacy",
        "score": 7.45,
        "concept": "Simulates re-identification attempts against proposed data releases and records residual risks and mitigation decisions.",
        "description": "Adversarial privacy audit tool testing human subject datasets for quasi-identifier linkages before public dataset repository deposit."
    },
    {
        "name": "Review Concern Ledger",
        "category": "Scholarly Research & Lineage",
        "subcategory": "peer-review",
        "score": 7.34,
        "concept": "Decomposes reviews into atomic concerns and links each response to manuscript evidence, planned changes, owner, and completion status.",
        "description": "Structured peer review rebuttal management workspace connecting reviewer critiques directly to manuscript revision diffs and evidence."
    },
    {
        "name": "Retraction-Aware Review Update",
        "category": "Scholarly Research & Lineage",
        "subcategory": "evidence-synthesis",
        "score": 7.21,
        "concept": "Checks included studies in reviews and meta-analyses for retractions and major corrections and generates a human-reviewed impact queue.",
        "description": "Continuous monitoring tool scanning systematic review bibliographies against Retraction Watch and Crossref correction metadata."
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
    next_id = max(existing_ids) + 1 if existing_ids else 240

    added_count = 0

    for item in RESET_7_IDEAS:
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
            "elevatorPitch": f"For researchers, PIs, and institutional research teams, {item['name']} provides {item['concept'].lower()} The product establishes verifiable research result lineage and scholarly release integrity.",
            "detailedDescription": item['description'],
            "category": item['category'],
            "subcategory": item['subcategory'],
            "tags": [item['category'].lower(), item['subcategory']],
            "atAGlance": {
                "overallScore": int(item['score'] * 10),
                "speedToValue": "Fast (1-2 weeks)",
                "targetCustomer": "Researchers, lab managers & research libraries",
                "pricingModel": "Per manuscript, per deposit, or institutional subscription"
            },
            "customer": {
                "idealCustomerProfile": "Empirical labs, computational researchers & academic institutions",
                "painPoints": [item['concept']],
                "willingnessToPay": "High for verified, audit-ready scholarly release packages"
            },
            "product": {
                "coreFeatures": [item['concept'], item['description']],
                "mvpScope": "Standardized lineage audit report or metadata preflight tool"
            },
            "futureAiBuild": {
                "agentCapabilities": "Automated result-to-source mapping and metadata reconciliation"
            },
            "profitability": {
                "unitEconomics": "90%+ gross margin on digital reports and metadata generation",
                "revenueScenarios": {
                    "conservative": 2000,
                    "base": 8000,
                    "aggressive": 35000
                }
            },
            "market": {
                "marketSize": "Scholarly Research Integrity & Open Science Infrastructure Niche",
                "competitors": ["Generic manuscript preflight tools"]
            },
            "validation": {
                "experimentPlan": "7-day €79 pre-submission lineage audit offer"
            },
            "goToMarket": {
                "channels": ["Direct author outreach", "Research libraries", "Scientific societies"]
            },
            "operations": {
                "stack": "Node.js, Express, Python, Crossref/DataCite APIs, GitHub Pages"
            },
            "risks": {
                "primaryRisks": ["Institutional sales cycle length", "Format variation across disciplines"]
            },
            "actionPlan": {
                "immediateNextSteps": ["Launch 7-day pre-submission audit test"]
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
                "bootstrappedPotential": 87.0,
                "soloFounderPotential": 88.0,
                "aiAgentPotential": 82.0,
                "fastestPathToRevenue": 90.0,
                "highestProfitPotential": 86.0,
                "lowestCostLaunch": 95.0,
                "bestRecurringRevenue": 80.0,
                "bestEnterpriseOpportunity": 82.0,
                "bestConsumerOpportunity": 70.0,
                "bestLocalOpportunity": 60.0,
                "bestMarketplaceOpportunity": 65.0,
                "bestLongTermDefensibility": 80.0,
                "bestForNontechnicalFounder": 65.0,
                "bestForTechnicalFounder": 92.0,
                "bestForSmallTeam": 90.0,
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
            df.write(f"## 7-Day Payment Experiment\nOffer €79 founding pre-submission lineage audit. Target 3 paid orders within 7 days.\n")

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

    print(f"Successfully ingested {added_count} ideas (Reset 7) into data/ideas.json!")

if __name__ == '__main__':
    main()
