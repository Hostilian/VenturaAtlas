#!/usr/bin/env python3
"""Evaluate recent autonomous cloud runs and emit a machine-readable alert receipt."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from va_runtime.atomic_io import atomic_write_json

DEFAULT_RECEIPT = os.path.join(ROOT, ".agent-state", "cloud-monitor.json")


def simulated_runs(mode: str, now: dt.datetime) -> list[dict]:
    """Return deterministic dispatch-only fixtures for end-to-end alert drills."""
    if mode == "stale":
        return [
            {
                "status": "completed",
                "conclusion": "failure",
                "createdAt": (now - dt.timedelta(hours=3)).isoformat(),
                "event": "synthetic-monitor-proof",
            },
            {
                "status": "completed",
                "conclusion": "failure",
                "createdAt": (now - dt.timedelta(hours=4)).isoformat(),
                "event": "synthetic-monitor-proof",
            },
        ]
    if mode == "healthy":
        return [{
            "status": "completed",
            "conclusion": "success",
            "createdAt": now.isoformat(),
            "event": "synthetic-monitor-proof",
        }]
    return []


def evaluate(runs: list[dict], now: dt.datetime, stale_minutes: int = 120) -> dict:
    ordered = sorted(runs, key=lambda run: str(run.get("createdAt", "")), reverse=True)
    completed = [run for run in ordered if run.get("status") == "completed"]
    reasons = []
    if not completed:
        reasons.append("NO_COMPLETED_RUN")
    else:
        try:
            latest_at = dt.datetime.fromisoformat(str(completed[0]["createdAt"]).replace("Z", "+00:00"))
            if (now - latest_at).total_seconds() > stale_minutes * 60:
                reasons.append("LATEST_COMPLETED_RUN_STALE")
        except (KeyError, ValueError):
            reasons.append("LATEST_RUN_TIMESTAMP_INVALID")
        if len(completed) >= 2 and all(run.get("conclusion") != "success" for run in completed[:2]):
            reasons.append("TWO_CONSECUTIVE_FAILURES")
    return {
        "status": "ALERT" if reasons else "HEALTHY",
        "reasons": reasons,
        "checkedAt": now.isoformat(),
        "latestRuns": ordered[:3],
    }


def scheduled_runs(runs: list[dict]) -> list[dict]:
    """Exclude manual dispatches so they cannot mask a broken scheduler."""
    return [run for run in runs if run.get("event") == "schedule"]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=os.environ.get("GITHUB_REPOSITORY", "Hostilian/VenturaAtlas"))
    parser.add_argument("--workflow", default="research-cycle.yml")
    parser.add_argument("--stale-minutes", type=int, default=120)
    parser.add_argument("--receipt", default=DEFAULT_RECEIPT)
    parser.add_argument("--runs-json", help="Fixture path; skips gh CLI")
    parser.add_argument("--simulation", choices=("live", "stale", "healthy"), default="live")
    args = parser.parse_args()
    now = dt.datetime.now(dt.timezone.utc)
    if args.simulation != "live":
        runs = simulated_runs(args.simulation, now)
    elif args.runs_json:
        with open(args.runs_json, "r", encoding="utf-8") as handle:
            runs = scheduled_runs(json.load(handle))
    else:
        result = subprocess.run([
            "gh", "run", "list", "--repo", args.repo, "--workflow", args.workflow,
            "--limit", "5", "--json", "status,conclusion,createdAt,url,databaseId,event",
        ], capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=30)
        if result.returncode:
            runs = []
        else:
            runs = scheduled_runs(json.loads(result.stdout))
    receipt = evaluate(runs, now, args.stale_minutes)
    receipt["simulation"] = args.simulation
    atomic_write_json(args.receipt, receipt)
    print(json.dumps(receipt, sort_keys=True))
    return 2 if receipt["status"] == "ALERT" else 0


if __name__ == "__main__":
    raise SystemExit(main())
