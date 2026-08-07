import json
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IDEAS_JSON_PATH = os.path.join(ROOT, 'data', 'ideas.json')
IDEAS_DIR = os.path.join(ROOT, 'ideas')
PROMPTS_DIR = os.path.join(ROOT, 'prompts', 'idea-specific')

with open(IDEAS_JSON_PATH, 'r', encoding='utf-8') as f:
    raw = json.load(f)

ideas = raw if isinstance(raw, list) else raw.get('ideas', [])

created_dossiers = 0
created_packs = 0

for item in ideas:
    slug = item.get('slug')
    id_str = item.get('id')
    name = item.get('name', 'Idea')
    score = item.get('atAGlance', {}).get('overallScore') or item.get('compositeScores', {}).get('overallOpportunity') or 80
    category = item.get('category', 'General')
    concept = item.get('oneSentenceConcept') or item.get('elevatorPitch') or ''
    description = item.get('detailedDescription') or item.get('elevatorPitch') or ''

    if slug:
        md_path = os.path.join(IDEAS_DIR, f"{slug}.md")
        if not os.path.exists(md_path):
            with open(md_path, 'w', encoding='utf-8') as df:
                df.write(f"# {name} ({id_str})\n\n")
                df.write(f"**Score:** {score}/100  |  **Category:** {category}\n\n")
                df.write(f"## Executive Summary\n{concept}\n\n")
                df.write(f"## Detailed Concept\n{description}\n\n")
                df.write(f"## 7-Day Payment Experiment\nLaunch structured pre-order or prototype offer to validate customer willingness to pay within 7 days.\n")
            created_dossiers += 1

    if id_str:
        pack_dir = os.path.join(PROMPTS_DIR, id_str)
        if not os.path.exists(pack_dir):
            os.makedirs(pack_dir, exist_ok=True)
            readme_p = os.path.join(pack_dir, 'README.md')
            with open(readme_p, 'w', encoding='utf-8') as pf:
                pf.write(f"# Prompt Pack for {id_str} — {name}\n\n25-prompt library for research, MVP building, and GTM.\n")
            created_packs += 1

print(f"Successfully generated {created_dossiers} missing dossiers and {created_packs} missing prompt packs.")
