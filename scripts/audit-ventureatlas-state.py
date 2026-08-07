#!/usr/bin/env python3
"""
Venture Atlas OS — State Audit & Preflight Checker
===================================================
Produces a machine-readable JSON audit of canonical ideas, staged ideas,
duplicate IDs/slugs/names, own-orch fallbacks, and score anomalies.
Saves report to .agent-state/migration-preflight.json.
"""

import os
import sys
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDEAS_PATH = os.path.join(BASE_DIR, "data", "ideas.json")
QUEUE_PATH = os.path.join(BASE_DIR, "data", "idea-staging-queue.json")
REPORT_PATH = os.path.join(BASE_DIR, ".agent-state", "migration-preflight.json")

def load_json(filepath, default=None):
    if not os.path.exists(filepath):
        return default if default is not None else []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {filepath}: {e}", file=sys.stderr)
        return default if default is not None else []

def audit():
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    raw_ideas = load_json(IDEAS_PATH, [])
    canonical_list = raw_ideas.get("ideas", []) if isinstance(raw_ideas, dict) else raw_ideas
    queue_list = load_json(QUEUE_PATH, [])

    staged_in_canonical = [i for i in canonical_list if i.get("status") == "staged"]
    non_staged_canonical = [i for i in canonical_list if i.get("status") != "staged"]

    canonical_ids = [i.get("id") for i in canonical_list if "id" in i]
    queue_ids = [i.get("id") for i in queue_list if "id" in i]

    dup_canonical_ids = list(set([x for x in canonical_ids if canonical_ids.count(x) > 1]))
    dup_queue_ids = list(set([x for x in queue_ids if queue_ids.count(x) > 1]))
    cross_ids = list(set(canonical_ids) & set(queue_ids))

    slugs = [i.get("slug") for i in canonical_list if "slug" in i]
    dup_slugs = list(set([x for x in slugs if slugs.count(x) > 1]))

    names = [i.get("name", "").strip().lower() for i in canonical_list if "name" in i]
    dup_names = list(set([x for x in names if names.count(x) > 1]))

    own_orch_records = [i for i in canonical_list if i.get("provider") == "own-orch" or "own-orch" in i.get("tags", [])]
    own_orch_non_staged = [i for i in own_orch_records if i.get("status") != "staged"]

    # High quality/confidence with 0 refs anomalies
    high_eq_zero_refs = []
    high_conf_zero_refs = []
    for i in canonical_list:
        scores = i.get("scores", {})
        eq = scores.get("evidenceQuality", 0)
        conf = scores.get("confidence", 0)
        refs = i.get("evidenceRefs", [])
        if isinstance(eq, (int, float)) and eq >= 90 and len(refs) == 0:
            high_eq_zero_refs.append(i.get("id"))
        if isinstance(conf, (int, float)) and conf >= 90 and len(refs) == 0:
            high_conf_zero_refs.append(i.get("id"))

    report = {
        "timestamp": os.stat(IDEAS_PATH).st_mtime if os.path.exists(IDEAS_PATH) else 0,
        "ideasJsonTotalRecords": len(canonical_list),
        "stagedRecordsInIdeasJson": len(staged_in_canonical),
        "nonStagedRecordsInIdeasJson": len(non_staged_canonical),
        "stagingQueueTotalRecords": len(queue_list),
        "duplicateCanonicalIds": dup_canonical_ids,
        "duplicateQueueIds": dup_queue_ids,
        "crossOverlappingIds": cross_ids,
        "duplicateSlugs": dup_slugs,
        "duplicateNormalizedNames": dup_names,
        "ownOrchTotalRecords": len(own_orch_records),
        "ownOrchNonStagedRecords": len(own_orch_non_staged),
        "highEvidenceQualityZeroRefs": high_eq_zero_refs,
        "highConfidenceZeroRefs": high_conf_zero_refs,
    }

    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(json.dumps(report, indent=2))
    return report

if __name__ == "__main__":
    audit()
