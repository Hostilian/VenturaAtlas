import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ideas_file = os.path.join(ROOT, "data", "ideas.json")
queue_file = os.path.join(ROOT, "data", "idea-staging-queue.json")
sources_file = os.path.join(ROOT, "data", "sources.json")
rankings_file = os.path.join(ROOT, "data", "rankings.json")

with open(ideas_file, 'r', encoding='utf-8') as f:
    ideas = json.load(f)
    if isinstance(ideas, dict): ideas = ideas.get('ideas', [])

with open(queue_file, 'r', encoding='utf-8') as f:
    queue = json.load(f)
    if isinstance(queue, dict): queue = queue.get('ideas', queue.get('queue', []))

with open(sources_file, 'r', encoding='utf-8') as f:
    sources = json.load(f)
    if isinstance(sources, dict): sources = sources.get('sources', [])

with open(rankings_file, 'r', encoding='utf-8') as f:
    rankings = json.load(f)
    if isinstance(rankings, dict): rankings = rankings.get('rankings', [])

source_ids = {s['id'] for s in sources}
ext_sources = [s for s in sources if not s['id'].startswith('src-')]
int_sources = [s for s in sources if s['id'].startswith('src-')]

idea_ids = [i['id'] for i in ideas]
canonical_set = set(idea_ids)

# Check artifact coverage
dossiers = set(os.listdir(os.path.join(ROOT, "ideas"))) if os.path.exists(os.path.join(ROOT, "ideas")) else set()
fin_models = set(os.listdir(os.path.join(ROOT, "financial-models"))) if os.path.exists(os.path.join(ROOT, "financial-models")) else set()
val_plans = set(os.listdir(os.path.join(ROOT, "validation-plans"))) if os.path.exists(os.path.join(ROOT, "validation-plans")) else set()

# Check prompt pack directories
prompts_dir = os.path.join(ROOT, "prompts", "idea-specific")
prompt_dirs = set(os.listdir(prompts_dir)) if os.path.exists(prompts_dir) else set()

missing_dossiers = []
missing_fin_models = []
missing_val_plans = []
missing_prompts = []

for i in ideas:
    iid = i['id']
    slug = i['slug']
    if f"{slug}.md" not in dossiers: missing_dossiers.append(iid)
    if f"{slug}.md" not in fin_models: missing_fin_models.append(iid)
    if f"{slug}.md" not in val_plans: missing_val_plans.append(iid)
    if iid not in prompt_dirs: missing_prompts.append(iid)

print("=== VENTURE ATLAS OS OMEGA V FORENSIC AUDIT ===")
print(f"Canonical Ideas Count: {len(ideas)}")
print(f"Staged Queue Candidates Count: {len(queue)}")
print(f"Total Sources Count: {len(sources)} ({len(ext_sources)} External Evidence, {len(int_sources)} Internal Provenance)")
print(f"Missing Dossiers: {len(missing_dossiers)}")
print(f"Missing Financial Models: {len(missing_fin_models)}")
print(f"Missing Validation Plans: {len(missing_val_plans)}")
print(f"Missing Prompt Packs: {len(missing_prompts)}")

# Check Staging Queue evidenceStatus
staged_unverified = sum(1 for q in queue if not q.get('evidenceStatus'))
print(f"Staged Candidates Missing evidenceStatus: {staged_unverified}/{len(queue)}")

# Check Rankings vs Canonical Alignment
if rankings and len(rankings) > 0:
    first_rank_view = rankings[0]
    items = first_rank_view.get('items', [])
    ranked_ids = [it['id'] for it in items]
    orphans = [rid for rid in ranked_ids if rid not in canonical_set]
    unranked = [cid for cid in canonical_set if cid not in set(ranked_ids)]
    print(f"Primary Ranking View Entries: {len(ranked_ids)}")
    print(f"Orphan Ranked IDs (not in canonical): {len(orphans)}")
    print(f"Canonical IDs Missing from Primary Ranking View: {len(unranked)}")
