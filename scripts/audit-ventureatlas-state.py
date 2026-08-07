#!/usr/bin/env python3
"""
Venture Atlas OS — Repository State Audit (P6)
==============================================
Outputs a complete JSON audit of repository state.
Saves result to .agent-state/pre-repair/audit.json.
Does NOT modify any data.
"""

import json
import os
import sys
import re
import subprocess
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, 'scripts'))

DATA_DIR = os.path.join(BASE_DIR, 'data')
SITE_DIR = os.path.join(BASE_DIR, '_site')
AGENT_STATE_DIR = os.path.join(BASE_DIR, '.agent-state')

def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_git_commit():
    try:
        return subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=BASE_DIR).decode().strip()
    except Exception:
        return 'unknown'

def normalize_name(name):
    return re.sub(r'[^a-z0-9]', '', name.lower())

def normalize_slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

def main():
    audit = {}

    # Git commit
    audit['gitCommit'] = get_git_commit()
    audit['auditAt'] = datetime.now(timezone.utc).isoformat()

    # ideas.json
    ideas_path = os.path.join(DATA_DIR, 'ideas.json')
    ideas_raw = load_json(ideas_path)
    if ideas_raw is None:
        ideas_list = []
    elif isinstance(ideas_raw, list):
        ideas_list = ideas_raw
    elif isinstance(ideas_raw, dict):
        ideas_list = ideas_raw.get('ideas', [])
    else:
        ideas_list = []

    audit['ideasJsonRecords'] = len(ideas_list)
    canonical_like = [i for i in ideas_list if str(i.get('id', '')).startswith('idea-')]
    staged_inside = [i for i in ideas_list if i.get('status') == 'staged']
    candidate_ids_inside = [i for i in ideas_list if str(i.get('id', '')).startswith('candidate-')]

    audit['canonicalLikeRecords'] = len(canonical_like)
    audit['stagedRecordsInsideIdeas'] = len(staged_inside)
    audit['candidateIdsInsideIdeas'] = len(candidate_ids_inside)

    # Duplicate canonical IDs
    canonical_ids = [i.get('id') for i in canonical_like]
    dup_canonical_ids = [cid for cid in canonical_ids if canonical_ids.count(cid) > 1]
    audit['duplicateCanonicalIds'] = list(set(dup_canonical_ids))

    # Duplicate canonical slugs
    canonical_slugs = [i.get('slug') for i in canonical_like if i.get('slug')]
    dup_slugs = [s for s in canonical_slugs if canonical_slugs.count(s) > 1]
    audit['duplicateCanonicalSlugs'] = list(set(dup_slugs))

    # Duplicate normalized canonical names
    canonical_norm_names = [normalize_name(i.get('name', '')) for i in canonical_like if i.get('name')]
    dup_norm_names = [n for n in canonical_norm_names if canonical_norm_names.count(n) > 1]
    audit['duplicateNormalizedCanonicalNames'] = list(set(dup_norm_names))

    # Staging queue
    queue_path = os.path.join(DATA_DIR, 'idea-staging-queue.json')
    queue = load_json(queue_path) or []
    audit['stagingQueueRecords'] = len(queue)

    staging_idea_style = [i for i in queue if str(i.get('id', '')).startswith('idea-')]
    staging_candidate_style = [i for i in queue if str(i.get('id', '')).startswith('candidate-')]
    audit['stagingIdeaStyleIds'] = len(staging_idea_style)
    audit['stagingCandidateIds'] = len(staging_candidate_style)

    # Duplicate staging IDs
    staging_ids = [i.get('id') for i in queue]
    dup_staging = [sid for sid in staging_ids if staging_ids.count(sid) > 1]
    audit['duplicateStagingIds'] = list(set(dup_staging))

    # IDs present in both
    canonical_id_set = set(canonical_ids)
    staging_id_set = set(staging_ids)
    audit['idsPresentInBoth'] = list(canonical_id_set & staging_id_set)

    # Duplicate normalized staging names
    staging_norm_names = [normalize_name(i.get('name', '')) for i in queue if i.get('name')]
    dup_staging_names = [n for n in staging_norm_names if staging_norm_names.count(n) > 1]
    audit['duplicateNormalizedStagingNames'] = list(set(dup_staging_names))

    # Own-Orch staging analysis
    own_orch_staging = [i for i in queue if i.get('provenance', {}).get('provider') == 'own-orch']
    audit['ownOrchStagingCount'] = len(own_orch_staging)

    # Own-Orch with numeric confidence (should be null/unverified)
    own_orch_numeric_conf = []
    for i in own_orch_staging:
        conf_val = None
        scores = i.get('scores', {})
        for dim, sv in scores.items():
            if isinstance(sv, dict):
                conf = sv.get('confidence')
                if isinstance(conf, (int, float)):
                    own_orch_numeric_conf.append(i.get('id'))
                    break
            composite = i.get('compositeScores', {})
            if isinstance(composite.get('confidence'), (int, float)):
                own_orch_numeric_conf.append(i.get('id'))
                break
    audit['ownOrchWithNumericConfidence'] = len(own_orch_numeric_conf)

    # Own-Orch with evidenceQuality without evidence refs
    own_orch_fake_eq = []
    for i in own_orch_staging:
        eq = i.get('compositeScores', {}).get('evidenceQuality')
        ev_refs = i.get('evidenceRefs', [])
        if eq is not None and not ev_refs:
            own_orch_fake_eq.append(i.get('id'))
    audit['ownOrchWithEvidenceQualityWithoutEvidence'] = len(own_orch_fake_eq)

    # Rankings
    rankings_path = os.path.join(DATA_DIR, 'rankings.json')
    rankings_raw = load_json(rankings_path)
    ranking_items = []
    if isinstance(rankings_raw, list):
        ranking_items = rankings_raw
    elif isinstance(rankings_raw, dict):
        for v in rankings_raw.values():
            if isinstance(v, list):
                ranking_items.extend(v)

    audit['rankingItemCount'] = len(ranking_items)

    ranking_ids = [r.get('id') or r.get('ideaId') for r in ranking_items if isinstance(r, dict)]
    missing_from_canonical = [rid for rid in ranking_ids if rid and rid not in canonical_id_set and not str(rid).startswith('candidate-')]
    dup_ranking_ids = [rid for rid in ranking_ids if ranking_ids.count(rid) > 1]
    candidate_in_rankings = [rid for rid in ranking_ids if str(rid or '').startswith('candidate-')]

    audit['rankingIdsMissingFromCanonical'] = len(missing_from_canonical)
    audit['duplicateRankingIds'] = len(set(dup_ranking_ids))
    audit['candidateIdsInsideRankings'] = len(candidate_in_rankings)

    # Search index
    search_path = os.path.join(DATA_DIR, 'search-index.json')
    search_raw = load_json(search_path) or []
    audit['searchIndexCount'] = len(search_raw)

    search_ids = [r.get('id') for r in search_raw if isinstance(r, dict)]
    search_missing = [sid for sid in search_ids if sid and sid not in canonical_id_set and not str(sid).startswith('candidate-')]
    candidate_in_search = [sid for sid in search_ids if str(sid or '').startswith('candidate-')]

    audit['searchIdsMissingFromCanonical'] = len(search_missing)
    audit['candidateIdsInsideSearch'] = len(candidate_in_search)

    # Repository meta counts
    meta_path = os.path.join(DATA_DIR, 'repository-meta.json')
    meta = load_json(meta_path)
    audit['repositoryMetaCounts'] = meta.get('counts', {}) if meta else {}

    # Categories, sources, prompts
    cats = load_json(os.path.join(DATA_DIR, 'categories.json')) or []
    sources = load_json(os.path.join(DATA_DIR, 'sources.json')) or []
    prompts_path = os.path.join(DATA_DIR, 'prompts.json')
    prompts = load_json(prompts_path) if os.path.exists(prompts_path) else None

    audit['actualCategoryCount'] = len(cats) if isinstance(cats, list) else len(cats.get('categories', [])) if isinstance(cats, dict) else 0
    audit['actualSourceCount'] = len(sources) if isinstance(sources, list) else 0
    audit['actualPromptCount'] = len(prompts) if isinstance(prompts, list) else (len(prompts.get('prompts', [])) if isinstance(prompts, dict) else 'unknown')

    # Public build checks
    site_queue_path = os.path.join(SITE_DIR, 'data', 'idea-staging-queue.json')
    audit['publicBuildContainsStagingQueue'] = os.path.exists(site_queue_path)

    candidate_in_public = False
    if os.path.exists(os.path.join(SITE_DIR, 'data')):
        for fname in ['ideas.json', 'search-index.json', 'rankings.json', 'repository-meta.json']:
            fpath = os.path.join(SITE_DIR, 'data', fname)
            if os.path.exists(fpath):
                with open(fpath, 'r', encoding='utf-8') as f:
                    content = f.read()
                if '"candidate-' in content:
                    candidate_in_public = True
                    break
    audit['publicBuildContainsCandidateIds'] = candidate_in_public

    # Save audit
    pre_repair_dir = os.path.join(AGENT_STATE_DIR, 'pre-repair')
    os.makedirs(pre_repair_dir, exist_ok=True)
    audit_path = os.path.join(pre_repair_dir, 'audit.json')
    with open(audit_path, 'w', encoding='utf-8') as f:
        json.dump(audit, f, indent=2)

    print(json.dumps(audit, indent=2))
    print(f"\n[OK] Audit saved to {audit_path}", file=sys.stderr)
    return audit

if __name__ == '__main__':
    main()
