#!/usr/bin/env python3
"""Build an executable task schedule with bounded priority aging."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from va_runtime.atomic_io import atomic_write_json, read_json_safe

BACKLOG = os.path.join(ROOT, ".agent-system", "backlog.json")
OUTPUT = os.path.join(ROOT, ".agent-state", "task-schedule.json")
DONE = {"COMPLETE", "LANDED", "VERIFIED", "CANCELLED"}
BLOCKED = {
    "REQUIRES_HUMAN_OR_EXTERNAL_AUTHORITY", "REQUIRES_INFRASTRUCTURE_DECISION",
    "REQUIRES_DEPLOYMENT_AUTHORITY", "BLOCKED_NO_BILLED_GCP_PROJECT",
    "BLOCKED_NO_ALWAYS_ON_PRIVATE_RUNTIME",
}


def schedule(payload: dict, now: dt.datetime) -> list[dict]:
    tasks = payload.get("tasks", [])
    completed = {task.get("id") for task in tasks if task.get("status") in DONE}
    try:
        baseline = dt.datetime.fromisoformat(str(payload.get("lastUpdated", "")).replace("Z", "+00:00"))
    except ValueError:
        baseline = now
    age_days = max(0.0, (now - baseline).total_seconds() / 86400)
    result = []
    for task in tasks:
        if task.get("status") in DONE | BLOCKED:
            continue
        unmet = [dep for dep in task.get("dependencies", []) if dep not in completed]
        if unmet:
            continue
        # One point/day, capped at 25, means old low-priority work eventually rises
        # without rewriting the authoritative base priority.
        aging = min(25.0, age_days)
        result.append({
            "id": task.get("id"), "basePriority": float(task.get("priorityScore", 0)),
            "agingBoost": round(aging, 3),
            "effectivePriority": round(float(task.get("priorityScore", 0)) + aging, 3),
            "status": task.get("status"), "assignedAgent": task.get("assignedAgent"),
        })
    return sorted(result, key=lambda item: (-item["effectivePriority"], str(item["id"])))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=OUTPUT)
    args = parser.parse_args()
    now = dt.datetime.now(dt.timezone.utc)
    items = schedule(read_json_safe(BACKLOG, default_if_missing={}), now)
    atomic_write_json(args.output, {"schemaVersion": "1.0.0", "generatedAt": now.isoformat(), "items": items})
    print(json.dumps({"scheduled": len(items), "next": items[0]["id"] if items else None}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
