#!/usr/bin/env python3
"""
Venture Atlas OS — Staging Queue Candidate ID Migration (P8, P9, P10, P32)
========================================================================
Ensures all items in data/idea-staging-queue.json use candidate-<uuid4> IDs.
Cleans up own-orch items with fake numeric confidence or fake evidenceQuality.
Idempotent: running twice results in 0 modifications on second run.
"""

import sys
import os
import json
import uuid

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(BASE_DIR, 'scripts'))
from va_runtime.atomic_io import atomic_write_json, read_json_safe

QUEUE_PATH = os.path.join(BASE_DIR, 'data', 'idea-staging-queue.json')

def migrate_queue():
    if not os.path.exists(QUEUE_PATH):
        print("[INFO] Queue file does not exist, nothing to migrate.")
        return 0, 0

    queue = read_json_safe(QUEUE_PATH, default_if_missing=[])
    if not isinstance(queue, list):
        print("[WARN] Queue is not a list, skipping.")
        return 0, 0

    modified_count = 0
    cleaned_confidence_count = 0

    for item in queue:
        old_id = item.get("id", "")
        # P8/P9: Replace idea- style IDs in staging queue with candidate- UUIDs
        if old_id.startswith("idea-"):
            new_id = f"candidate-{uuid.uuid4()}"
            item["id"] = new_id
            item["candidateId"] = new_id
            modified_count += 1

        # Ensure candidateId field is set
        if not item.get("candidateId"):
            item["candidateId"] = item.get("id", f"candidate-{uuid.uuid4()}")
            item["id"] = item["candidateId"]
            modified_count += 1

        # P24/P32: Clean own-orch items with fake numeric confidence or evidenceQuality
        provider = item.get("provenance", {}).get("provider") or item.get("provider")
        if provider == "own-orch" or item.get("generationMode") == "deterministic-fallback":
            # Check scores
            scores = item.get("scores", {})
            for dim, sval in list(scores.items()):
                if isinstance(sval, dict) and isinstance(sval.get("confidence"), (int, float)):
                    sval["confidence"] = "unverified"
                    cleaned_confidence_count += 1

            # Check compositeScores
            comp = item.get("compositeScores", {})
            if isinstance(comp.get("confidence"), (int, float)):
                comp["confidence"] = None
                cleaned_confidence_count += 1

            # Check evidenceQuality without evidenceRefs
            ev_refs = item.get("evidenceRefs", [])
            if comp.get("evidenceQuality") is not None and not ev_refs:
                comp["evidenceQuality"] = None
                cleaned_confidence_count += 1

    if modified_count > 0 or cleaned_confidence_count > 0:
        atomic_write_json(QUEUE_PATH, queue)
        print(f"[SUCCESS] Migrated {modified_count} IDs and cleaned {cleaned_confidence_count} fake confidence entries.")
    else:
        print("[INFO] Queue already clean — 0 modifications made.")

    return modified_count, cleaned_confidence_count

if __name__ == "__main__":
    migrate_queue()
