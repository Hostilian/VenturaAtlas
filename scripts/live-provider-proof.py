#!/usr/bin/env python3
"""Create a secret-free receipt proving real provider calls overlapped in time."""

import argparse
import concurrent.futures
import datetime
import os
import socket
import sys
import time

from va_orchestrator import _call_single_provider, health_check
from va_runtime.atomic_io import atomic_write_json
from va_runtime.provider_router import get_provider_scheduler

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_RECEIPT = os.path.join(BASE_DIR, ".agent-state", "live-provider-proof.json")


def utc_now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def intervals_overlap(items):
    if len(items) < 2:
        return False
    starts = sorted(item["startedMonotonic"] for item in items)
    ends = sorted(item["endedMonotonic"] for item in items)
    return starts[1] < ends[-2]


def main():
    parser = argparse.ArgumentParser(description="Prove live provider fan-out without logging secrets or responses")
    parser.add_argument("--minimum-external", type=int, default=2)
    parser.add_argument("--fanout", type=int, default=int(os.environ.get("VA_PROVIDER_FANOUT", "2")))
    parser.add_argument("--max-cost", type=int, default=int(os.environ.get("VA_MAX_COST_CLASS", "1")))
    parser.add_argument("--receipt", default=DEFAULT_RECEIPT)
    args = parser.parse_args()

    if os.environ.get("VA_CREDIT_SAFE_MODE", "0").lower() in ("1", "true", "yes"):
        receipt = {
            "schemaVersion": "1.0.0",
            "host": socket.gethostname(),
            "startedAt": utc_now(),
            "status": "SKIPPED_CREDIT_SAFE_MODE",
            "reason": "External provider calls disabled to protect monthly credit budget",
            "selectedProviders": [],
            "providers": [],
            "successfulExternalProviders": 0,
            "overlapProven": False,
            "responseContentRecorded": False,
            "secretsRecorded": False,
            "completedAt": utc_now(),
        }
        atomic_write_json(args.receipt, receipt)
        print(receipt["reason"])
        return 0

    health = health_check(probe_external=True)
    scheduler = get_provider_scheduler()
    eligible = scheduler.select_providers_for_task(
        required_capabilities=None,
        max_cost_class=max(0, min(3, args.max_cost)),
        allow_own_orch=False,
        match_mode="all",
        requires_external_evidence=False,
    )
    providers = [p for p in eligible if p != "own-orch" and health.get(p, False)][:max(1, args.fanout)]
    receipt = {
        "schemaVersion": "1.0.0",
        "host": socket.gethostname(),
        "startedAt": utc_now(),
        "requiredExternalProviders": args.minimum_external,
        "selectedProviders": providers,
        "providers": [],
        "responseContentRecorded": False,
        "secretsRecorded": False,
    }

    if len(providers) < args.minimum_external:
        receipt.update({
            "status": "FAILED",
            "reason": f"only {len(providers)} live external providers were eligible; {args.minimum_external} required",
            "completedAt": utc_now(),
            "overlapProven": False,
        })
        atomic_write_json(args.receipt, receipt)
        print(receipt["reason"], file=sys.stderr)
        return 2

    prompt = "Live concurrency probe. Reply with exactly: VENTURE_ATLAS_LIVE_PROBE_OK"

    def invoke(provider):
        started_wall = utc_now()
        started_mono = time.monotonic()
        result = _call_single_provider(provider, prompt, {"probe": True})
        ended_mono = time.monotonic()
        return {
            "provider": provider,
            "startedAt": started_wall,
            "completedAt": utc_now(),
            "startedMonotonic": started_mono,
            "endedMonotonic": ended_mono,
            "durationMs": round((ended_mono - started_mono) * 1000),
            "success": result is not None,
        }

    with concurrent.futures.ThreadPoolExecutor(max_workers=len(providers)) as executor:
        records = list(executor.map(invoke, providers))

    successful = [item for item in records if item["success"]]
    overlap = intervals_overlap(successful)
    passed = len(successful) >= args.minimum_external and overlap
    for item in records:
        item.pop("startedMonotonic", None)
        item.pop("endedMonotonic", None)
    receipt.update({
        "providers": records,
        "successfulExternalProviders": len(successful),
        "overlapProven": overlap,
        "status": "PASSED" if passed else "FAILED",
        "reason": "live external provider calls overlapped" if passed else "required successful overlap was not observed",
        "completedAt": utc_now(),
    })
    atomic_write_json(args.receipt, receipt)
    print(f"{receipt['status']}: {receipt['reason']} ({len(successful)}/{len(providers)} successful)")
    return 0 if passed else 3


if __name__ == "__main__":
    raise SystemExit(main())
