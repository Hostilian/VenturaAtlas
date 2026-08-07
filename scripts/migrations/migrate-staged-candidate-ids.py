#!/usr/bin/env python3
"""
Venture Atlas OS — Staged Candidate ID Migration Script
========================================================
Migrates any remaining permanent-looking idea-XXX IDs in data/idea-staging-queue.json
to candidate-<uuid4> UUIDs. Preserves old ID as legacyCandidateId. Idempotent.
Saves mapping to .agent-state/staged-id-migration.json.
"""

import os
import sys
import json
import uuid

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
QUEUE_PATH = os.path.join(BASE_DIR, "data", "idea-staging-queue.json")
MAPPED_PATH = os.path.join(BASE_DIR, ".agent-state", "staged-id-migration.json")

def load_json(filepath, default=None):
    if not os.path.exists(filepath):
        return default if default is not None else []
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def atomic_write(filepath, data):
    temp_path = filepath + ".tmp"
    with open(temp_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.flush()
        os.fsync(f.fileno())
    os.replace(temp_path, filepath)

def run_migration():
    os.makedirs(os.path.dirname(MAPPED_PATH), exist_ok=True)
    queue = load_json(QUEUE_PATH, [])
    mappings = load_json(MAPPED_PATH, {})

    migrated = 0
    for item in queue:
        old_id = item.get("id", "")
        # If item has an old idea-XXX ID, convert it
        if old_id.startswith("idea-"):
            if old_id not in mappings:
                mappings[old_id] = f"candidate-{uuid.uuid4()}"
            cand_id = mappings[old_id]
            
            item["legacyCandidateId"] = old_id
            item["candidateId"] = cand_id
            item["id"] = cand_id
            
            if "slug" in item and old_id in item["slug"]:
                item["slug"] = item["slug"].replace(old_id, cand_id)
            migrated += 1

    atomic_write(QUEUE_PATH, queue)
    atomic_write(MAPPED_PATH, mappings)

    report = {
        "status": "SUCCESS",
        "totalQueueItems": len(queue),
        "migratedIdeaIds": migrated,
        "mappingsCount": len(mappings)
    }
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    run_migration()
