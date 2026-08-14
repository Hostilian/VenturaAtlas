#!/usr/bin/env python3
"""Prepare and lock private blind-commercial-research assignments."""

from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from va_runtime.blind_research import lock_findings, prepare_assignment, unblind_assignment

DEFAULT_ROOT = ROOT / ".agent-state" / "blind-research"
PREREG_ROOT = ROOT / "research" / "audits" / "OMEGA-XIII-20260812T174230Z" / "preregistrations"


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


def private_root(value: str) -> Path:
    resolved = Path(value).resolve()
    agent_state = (ROOT / ".agent-state").resolve()
    if resolved != agent_state and agent_state not in resolved.parents:
        raise argparse.ArgumentTypeError("blind research storage must remain under .agent-state/")
    return resolved


def load_idea(idea_id: str) -> dict:
    raw = json.loads((ROOT / "data" / "ideas.json").read_text(encoding="utf-8"))
    ideas = raw if isinstance(raw, list) else raw.get("ideas", [])
    idea = next((item for item in ideas if item.get("id") == idea_id), None)
    if not idea:
        raise SystemExit(f"canonical idea not found: {idea_id}")
    return idea


def load_preregistration(idea_id: str) -> dict:
    path = PREREG_ROOT / f"{idea_id}.json"
    if not path.exists():
        raise SystemExit(f"locked preregistration not found: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=private_root, default=DEFAULT_ROOT)
    sub = parser.add_subparsers(dest="command", required=True)
    prepare = sub.add_parser("prepare")
    prepare.add_argument("idea_id")
    prepare.add_argument("--assignment-id", required=True)
    prepare.add_argument("--investigator-id", required=True)
    lock = sub.add_parser("lock-findings")
    lock.add_argument("--assignment-id", required=True)
    lock.add_argument("--findings", type=Path, required=True)
    unblind = sub.add_parser("unblind")
    unblind.add_argument("idea_id")
    unblind.add_argument("--assignment-id", required=True)
    args = parser.parse_args()
    if args.command == "prepare":
        packet, _ = prepare_assignment(
            args.root, assignment_id=args.assignment_id, idea=load_idea(args.idea_id),
            preregistration=load_preregistration(args.idea_id),
            investigator_id=args.investigator_id, created_at=now(),
        )
        packet_path = args.root / "packets" / f"{args.assignment_id}.json"
        print(json.dumps({"packetPath": str(packet_path), "packetDigestFields": sorted(packet)}, indent=2))
    elif args.command == "lock-findings":
        findings = json.loads(args.findings.read_text(encoding="utf-8"))
        receipt = lock_findings(args.root, assignment_id=args.assignment_id, findings=findings, findings_locked_at=now())
        print(json.dumps({"assignmentId": receipt["assignmentId"], "status": receipt["status"]}, indent=2))
    else:
        comparison = unblind_assignment(
            args.root, assignment_id=args.assignment_id,
            preregistration=load_preregistration(args.idea_id), unblinded_at=now(),
        )
        print(json.dumps(comparison, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
