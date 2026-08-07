#!/usr/bin/env python3
"""
Venture Atlas OS — Staged Extraction Migration Script
======================================================
Extracts records with status == "staged" out of data/ideas.json
and moves them into data/idea-staging-queue.json with candidate UUIDs.
Leaves data/ideas.json containing 100% public canonical ideas only.
"""

import os
import sys
import json
import uuid

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IDEAS_PATH = os.path.join(BASE_DIR, "data", "ideas.json")
QUEUE_PATH = os.path.join(BASE_DIR, "data", "idea-staging-queue.json")
MIGRATION_LOG = os.path.join(BASE_DIR, ".agent-state", "extract-staged-migration-report.json")

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
    os.makedirs(os.path.dirname(MIGRATION_LOG), exist_ok=True)
    raw_ideas = load_json(IDEAS_PATH, [])
    ideas_list = raw_ideas.get("ideas", []) if isinstance(raw_ideas, dict) else raw_ideas
    queue_list = load_json(QUEUE_PATH, [])

    canonical_only = []
    staged_extracted = []

    for item in ideas_list:
        if item.get("status") == "staged":
            staged_extracted.append(item)
        else:
            canonical_only.append(item)

    print(f"[MIGRATION] Original ideas.json records: {len(ideas_list)}")
    print(f"[MIGRATION] Canonical (non-staged) records: {len(canonical_only)}")
    print(f"[MIGRATION] Staged records extracted: {len(staged_extracted)}")

    # Existing queue names for deduplication
    existing_queue_names = {i.get("name", "").strip().lower(): i for i in queue_list if "name" in i}

    migrated_staged_count = 0
    for st_item in staged_extracted:
        name_key = st_item.get("name", "").strip().lower()
        old_id = st_item.get("id", "")
        
        # Prepare candidate object
        st_item["legacyCandidateId"] = old_id
        if not st_item.get("candidateId"):
            st_item["candidateId"] = f"candidate-{uuid.uuid4()}"
        st_item["id"] = st_item["candidateId"]
        
        # If slug contains old idea-XXX, update slug
        if "slug" in st_item and old_id.startswith("idea-") and old_id in st_item["slug"]:
            st_item["slug"] = st_item["slug"].replace(old_id, st_item["candidateId"])

        if name_key not in existing_queue_names:
            queue_list.append(st_item)
            existing_queue_names[name_key] = st_item
            migrated_staged_count += 1

    # Save canonical ideas.json containing non-staged records ONLY
    atomic_write(IDEAS_PATH, {"schemaVersion": "2.0.0", "ideas": canonical_only})
    
    # Save staging queue
    atomic_write(QUEUE_PATH, queue_list)

    report = {
        "status": "SUCCESS",
        "canonicalCountAfter": len(canonical_only),
        "stagedExtractedCount": len(staged_extracted),
        "stagingQueueTotalAfter": len(queue_list),
        "newItemsAddedToQueue": migrated_staged_count
    }

    atomic_write(MIGRATION_LOG, report)
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    run_migration()
