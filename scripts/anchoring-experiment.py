#!/usr/bin/env python3
"""Run private paired blind-versus-informed anchoring experiments."""

from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path
import secrets
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from va_runtime.anchoring_experiment import finalize_experiment, lock_response, prepare_experiment
from va_runtime.atomic_io import atomic_write_bytes

DEFAULT_ROOT = ROOT / ".agent-state" / "anchoring-experiments"
PREREG_ROOT = ROOT / "research" / "audits" / "OMEGA-XIII-20260812T174230Z" / "preregistrations"


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


def private_root(value: str) -> Path:
    resolved = Path(value).resolve()
    allowed = (ROOT / ".agent-state").resolve()
    if resolved != allowed and allowed not in resolved.parents:
        raise argparse.ArgumentTypeError("anchoring experiment storage must remain under .agent-state/")
    return resolved


def load_subjects(candidate_ids: list[str]):
    raw = json.loads((ROOT / "data" / "ideas.json").read_text(encoding="utf-8"))
    ideas = raw if isinstance(raw, list) else raw.get("ideas", [])
    by_id = {item.get("id"): item for item in ideas}
    subjects = []
    for candidate_id in candidate_ids:
        if candidate_id not in by_id:
            raise SystemExit(f"canonical candidate not found: {candidate_id}")
        prereg_path = PREREG_ROOT / f"{candidate_id}.json"
        if not prereg_path.exists():
            raise SystemExit(f"locked preregistration not found: {prereg_path}")
        subjects.append((by_id[candidate_id], json.loads(prereg_path.read_text(encoding="utf-8"))))
    return subjects


def seed_path(root: Path, experiment_id: str) -> Path:
    return root / "secrets" / f"{experiment_id}.seed"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=private_root, default=DEFAULT_ROOT)
    sub = parser.add_subparsers(dest="command", required=True)
    prepare = sub.add_parser("prepare")
    prepare.add_argument("--experiment-id", required=True)
    prepare.add_argument("--candidate-ids", required=True, help="comma-separated canonical idea IDs")
    prepare.add_argument("--reviewer-roster", type=Path, required=True, help='JSON: {"reviewerIds": [...]}')
    prepare.add_argument("--minimum-pairs", type=int, default=10)
    response = sub.add_parser("lock-response")
    response.add_argument("--experiment-id", required=True)
    response.add_argument("--assignment-id", required=True)
    response.add_argument("--reviewer-id", required=True)
    response.add_argument("--response", type=Path, required=True)
    finalize = sub.add_parser("finalize")
    finalize.add_argument("--experiment-id", required=True)
    args = parser.parse_args()

    if args.command == "prepare":
        candidate_ids = [item.strip() for item in args.candidate_ids.split(",") if item.strip()]
        roster = json.loads(args.reviewer_roster.read_text(encoding="utf-8"))
        reviewer_ids = roster.get("reviewerIds") if isinstance(roster, dict) else None
        if not isinstance(reviewer_ids, list):
            raise SystemExit("reviewer roster must contain reviewerIds array")
        secret_path = seed_path(args.root, args.experiment_id)
        plan_path = args.root / "experiments" / f"{args.experiment_id}.json"
        if secret_path.exists() and plan_path.exists():
            raise SystemExit("anchoring experiment already exists")
        if secret_path.exists():
            secret = secret_path.read_text(encoding="utf-8")
        else:
            secret = secrets.token_urlsafe(32)
            atomic_write_bytes(str(secret_path), secret.encode("utf-8"))
        plan = prepare_experiment(
            args.root, experiment_id=args.experiment_id,
            subjects=load_subjects(candidate_ids), reviewer_ids=reviewer_ids,
            seed=secret, created_at=now(), minimum_pairs=args.minimum_pairs,
        )
        print(json.dumps({
            "experimentId": plan["experimentId"], "pairCount": plan["pairCount"],
            "assignmentCount": len(plan["assignments"]), "status": plan["status"],
            "seedDisclosure": "Private seed stored under .agent-state; reveal only at finalization.",
        }, indent=2))
    elif args.command == "lock-response":
        record = lock_response(
            args.root, experiment_id=args.experiment_id, assignment_id=args.assignment_id,
            reviewer_id=args.reviewer_id,
            response=json.loads(args.response.read_text(encoding="utf-8")), locked_at=now(),
        )
        print(json.dumps({"assignmentId": record["assignmentId"], "responseDigest": record["responseDigest"]}, indent=2))
    else:
        secret = seed_path(args.root, args.experiment_id).read_text(encoding="utf-8")
        result = finalize_experiment(
            args.root, experiment_id=args.experiment_id, seed=secret,
            finalized_at=now(),
        )
        print(json.dumps({
            "experimentId": result["experimentId"], "pairCount": result["pairCount"],
            "measurementStatus": result["measurementStatus"],
            "anchoringDelta": result["anchoringDelta"],
            "resultDigest": result["resultDigest"],
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
