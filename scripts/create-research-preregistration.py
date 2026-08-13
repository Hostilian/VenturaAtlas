#!/usr/bin/env python3
"""Create one locked private prospective-research expectation receipt."""

from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path
import sys
import uuid

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from va_runtime.atomic_io import atomic_write_json
from va_runtime.lifecycle import idea_content_digest
from va_runtime.preregistration import preregistration_digest


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("idea_id")
    parser.add_argument("--run-dir", required=True)
    parser.add_argument("--buyer", required=True)
    parser.add_argument("--pain", required=True)
    parser.add_argument("--incumbent", required=True)
    parser.add_argument("--wtp", choices=["UNKNOWN", "ASSUMED", "REPORTED", "BEHAVIORAL", "TRANSACTIONAL"], required=True)
    parser.add_argument("--risk", required=True)
    parser.add_argument("--verdict", choices=["LIKELY_KILL", "LIKELY_WAIT", "LIKELY_CONTINUE", "UNKNOWN"], required=True)
    args = parser.parse_args()
    run_dir = Path(args.run_dir).resolve()
    audits_root = (ROOT / "research" / "audits").resolve()
    if audits_root not in run_dir.parents or not run_dir.is_dir():
        raise SystemExit("--run-dir must be an existing private research/audits/<RUN_ID> directory")
    ideas_raw = json.loads((ROOT / "data" / "ideas.json").read_text(encoding="utf-8"))
    ideas = ideas_raw if isinstance(ideas_raw, list) else ideas_raw.get("ideas", [])
    idea = next((item for item in ideas if item.get("id") == args.idea_id), None)
    if not idea:
        raise SystemExit(f"canonical idea not found: {args.idea_id}")
    now = dt.datetime.now(dt.timezone.utc).isoformat()
    receipt = {
        "schemaVersion": "1.0.0", "preregistrationId": f"prereg-{args.idea_id}-{uuid.uuid4().hex[:12]}",
        "candidateId": args.idea_id, "candidateContentDigest": idea_content_digest(idea), "createdAt": now, "lockedAt": now,
        "expectations": {"buyer": args.buyer, "pain": args.pain, "strongestIncumbent": args.incumbent,
                         "willingnessToPayMaturity": args.wtp, "biggestRisk": args.risk, "verdict": args.verdict},
        "author": {"id": "codex-phaseshift", "role": "research-agent"}, "digestContract": "research-prereg-v1"
    }
    receipt["digest"] = preregistration_digest(receipt)
    output = run_dir / "preregistrations" / f"{args.idea_id}.json"
    if output.exists():
        raise SystemExit(f"preregistration already exists and is immutable: {output}")
    atomic_write_json(str(output), receipt)
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
