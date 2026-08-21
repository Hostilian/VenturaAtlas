#!/usr/bin/env python3
"""Remove ten manually adjudicated, identity-only duplicate records.

This is intentionally not a fuzzy auto-merge. Every pair below was inspected,
all non-identity fields must be byte-equivalent after JSON normalization, and the
script fails closed if an inbound non-generated data reference exists.
"""

from __future__ import annotations

import datetime as dt
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from va_runtime.atomic_io import atomic_write_json

IDEAS_PATH = os.path.join(ROOT, "data", "ideas.json")
RECEIPT_PATH = os.path.join(ROOT, "data", "idea-taxonomy-adjudications.json")
CATEGORIES_PATH = os.path.join(ROOT, "data", "categories.json")
RANKINGS_PATH = os.path.join(ROOT, "data", "rankings.json")
PAIRS = [(f"idea-{left}", f"idea-{right}") for left, right in (
    (219, 230), (220, 231), (221, 232), (222, 233), (223, 234),
    (224, 235), (225, 236), (226, 237), (227, 238), (228, 239),
)]
IDENTITY_FIELDS = {"id", "slug", "createdAt", "updatedAt"}
GENERATED_REFERENCES = {
    "ideas.json", "search-index.json", "rankings.json", "idea-taxonomy.json", "categories.json",
    "idea-taxonomy-adjudications.json", "validation-summary.json",
}


def normalized(record: dict) -> str:
    return json.dumps({key: value for key, value in record.items() if key not in IDENTITY_FIELDS},
                      ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def prune_generated_references(value, duplicate_ids: set[str]):
    """Remove duplicate records/references while preserving historical values."""
    if isinstance(value, list):
        reconciled = []
        for item in value:
            if isinstance(item, str) and item in duplicate_ids:
                continue
            if isinstance(item, dict) and (
                item.get("ideaId") in duplicate_ids or item.get("id") in duplicate_ids
            ):
                continue
            reconciled.append(prune_generated_references(item, duplicate_ids))
        return reconciled
    if isinstance(value, dict):
        return {key: prune_generated_references(item, duplicate_ids) for key, item in value.items()}
    return value


def main() -> int:
    with open(IDEAS_PATH, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    ideas = payload["ideas"] if isinstance(payload, dict) else payload
    by_id = {idea["id"]: idea for idea in ideas}
    duplicate_ids = {duplicate for _, duplicate in PAIRS}
    already_applied = all(canonical in by_id and duplicate not in by_id for canonical, duplicate in PAIRS)
    for canonical, duplicate in PAIRS:
        if canonical not in by_id or (duplicate not in by_id and not already_applied):
            raise RuntimeError(f"adjudication pair missing: {canonical}/{duplicate}")
        if duplicate in by_id and normalized(by_id[canonical]) != normalized(by_id[duplicate]):
            raise RuntimeError(f"pair differs beyond identity fields: {canonical}/{duplicate}")

    for filename in os.listdir(os.path.join(ROOT, "data")):
        if not filename.endswith(".json") or filename in GENERATED_REFERENCES:
            continue
        path = os.path.join(ROOT, "data", filename)
        with open(path, "r", encoding="utf-8", errors="replace") as handle:
            content = handle.read()
        referenced = sorted(identifier for identifier in duplicate_ids if identifier in content)
        if referenced:
            raise RuntimeError(f"non-generated inbound references in {filename}: {referenced}")

    retained = [idea for idea in ideas if idea.get("id") not in duplicate_ids]
    expected_removed = 0 if already_applied else len(PAIRS)
    if len(ideas) - len(retained) != expected_removed:
        raise RuntimeError("unexpected duplicate removal count")
    output = dict(payload) if isinstance(payload, dict) else retained
    if isinstance(output, dict):
        output["ideas"] = retained
    atomic_write_json(IDEAS_PATH, output)

    with open(CATEGORIES_PATH, "r", encoding="utf-8") as handle:
        categories = json.load(handle)
    for category in categories:
        category["ideaIds"] = [idea_id for idea_id in category.get("ideaIds", []) if idea_id not in duplicate_ids]
        category["count"] = len(category["ideaIds"])
    atomic_write_json(CATEGORIES_PATH, categories)

    with open(RANKINGS_PATH, "r", encoding="utf-8") as handle:
        rankings = json.load(handle)
    atomic_write_json(RANKINGS_PATH, prune_generated_references(rankings, duplicate_ids))

    subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "va-ranker.py"), "--update"],
                   cwd=ROOT, check=True)
    now = dt.datetime.now(dt.timezone.utc).isoformat()
    atomic_write_json(RECEIPT_PATH, {
        "schemaVersion": "1.0.0",
        "adjudicatedAt": now,
        "method": "MANUAL_EXACT_RECORD_REVIEW_WITH_FAIL_CLOSED_MIGRATION",
        "decision": "REMOVE_IDENTITY_ONLY_DUPLICATES_KEEP_LOWER_EXISTING_ID",
        "nonIdentityFieldsRequiredEqual": True,
        "pairs": [{"canonicalId": canonical, "removedDuplicateId": duplicate} for canonical, duplicate in PAIRS],
        "removedCount": len(PAIRS),
    })
    print(json.dumps({"retained": len(retained), "removed": expected_removed,
                      "generatedReferencesReconciled": ["categories.json", "rankings.json"]}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
