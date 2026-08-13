"""Semantic utility primitives for bounded Venture Atlas autonomy runs."""

from __future__ import annotations

import hashlib
import json
from typing import Any


VOLATILE_KEYS = {
    "generatedAt", "heartbeat", "lastRun", "lastRunAt", "lastUsed", "snapshotAt",
    "updatedAt", "checkedAt", "totalCalls", "successCalls", "failures", "circuitUntil",
}


def semantic_projection(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: semantic_projection(nested) for key, nested in sorted(value.items()) if key not in VOLATILE_KEYS}
    if isinstance(value, list):
        return [semantic_projection(item) for item in value]
    return value


def semantic_digest(value: Any) -> str:
    encoded = json.dumps(semantic_projection(value), sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


def classify_iteration(before: dict, after: dict, material_changes: list[dict] | None = None,
                       failed: bool = False, degraded: bool = False, cancelled: bool = False) -> str:
    if cancelled:
        return "CANCELLED"
    if failed:
        return "FAILED"
    if degraded:
        return "DEGRADED"
    if material_changes and semantic_digest(before) != semantic_digest(after):
        return "MATERIAL_CHANGE"
    return "NO_OP"


def mutation_receipt(run_id: str, baseline_revision: str, before: dict, after: dict,
                     material_changes: list[dict], telemetry_changes: list[dict],
                     started_at: str, ended_at: str, result: str | None = None) -> dict:
    outcome = result or classify_iteration(before, after, material_changes)
    return {
        "schemaVersion": "1.0.0",
        "runId": run_id,
        "baselineRevision": baseline_revision,
        "result": outcome,
        "semanticRevisionBefore": semantic_digest(before),
        "semanticRevisionAfter": semantic_digest(after),
        "materialChanges": material_changes,
        "telemetryChanges": telemetry_changes,
        "decisionDeltas": [item for item in material_changes if item.get("type") == "DECISION"],
        "newEvidence": [item for item in material_changes if item.get("type") == "EVIDENCE"],
        "newCandidates": [item for item in material_changes if item.get("type") == "CANDIDATE_ADDED"],
        "rejectedCandidates": [item for item in material_changes if item.get("type") == "CANDIDATE_REJECTED"],
        "tests": [],
        "startedAt": started_at,
        "endedAt": ended_at,
    }

