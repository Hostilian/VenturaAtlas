#!/usr/bin/env python3
"""Parallel, read-only preflight checks for autonomous pipeline iterations."""

from __future__ import annotations

import argparse
import concurrent.futures
import datetime
import json
import os
import subprocess
import sys
import time
import uuid


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from va_runtime.atomic_io import atomic_write_json
from va_runtime.redaction import redact_secrets


def _run(name: str, command: list[str], timeout: int) -> dict:
    started = time.monotonic()
    try:
        result = subprocess.run(
            command,
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
        )
        output = redact_secrets((result.stdout or "") + (result.stderr or ""))
        return {
            "name": name,
            "status": "succeeded" if result.returncode == 0 else "failed",
            "returncode": result.returncode,
            "durationMs": round((time.monotonic() - started) * 1000),
            "outputTail": output[-1000:],
        }
    except subprocess.TimeoutExpired:
        return {
            "name": name,
            "status": "failed",
            "returncode": -1,
            "durationMs": round((time.monotonic() - started) * 1000),
            "outputTail": f"BUDGET_EXHAUSTED after {timeout}s",
        }
    except Exception as exc:
        return {
            "name": name,
            "status": "failed",
            "returncode": -1,
            "durationMs": round((time.monotonic() - started) * 1000),
            "outputTail": f"{type(exc).__name__}: {exc}",
        }


def main() -> int:
    parser = argparse.ArgumentParser(description="Run parallel autonomous-pipeline preflight checks")
    parser.add_argument("--timeout-seconds", type=int, default=300)
    parser.add_argument(
        "--receipt",
        default=os.path.join(ROOT, ".agent-state", "pipeline-preflight", "latest.json"),
    )
    args = parser.parse_args()

    checks = [
        ("canonical-data", ["node", "scripts/validate-data.js", "--strict", "--check"]),
        ("schema", [sys.executable, "scripts/validate-schema.py"]),
        ("links", ["node", "scripts/check-links.js"]),
        ("repository-consistency", ["node", "scripts/check-repository-consistency.js"]),
        ("task-graph", ["node", "scripts/check-task-graph.js"]),
    ]
    started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(checks)) as executor:
        futures = {
            executor.submit(_run, name, command, max(1, args.timeout_seconds)): name
            for name, command in checks
        }
        results = [future.result() for future in concurrent.futures.as_completed(futures)]
    order = {name: index for index, (name, _) in enumerate(checks)}
    results.sort(key=lambda item: order[item["name"]])
    status = "SUCCEEDED" if all(item["status"] == "succeeded" for item in results) else "FAILED"
    receipt = {
        "schemaVersion": "1.0.0",
        "runId": f"preflight-{uuid.uuid4().hex[:12]}",
        "startedAt": started_at,
        "endedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "status": status,
        "execution": "parallel-read-only",
        "checks": results,
    }
    atomic_write_json(args.receipt, receipt)
    print(json.dumps({
        "status": status,
        "checks": {item["name"]: item["status"] for item in results},
        "receipt": args.receipt,
    }, sort_keys=True))
    return 0 if status == "SUCCEEDED" else 1


if __name__ == "__main__":
    raise SystemExit(main())
