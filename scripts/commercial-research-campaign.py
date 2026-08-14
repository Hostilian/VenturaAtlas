#!/usr/bin/env python3
"""Prepare and record private staged-candidate commercial research."""

from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from va_runtime.commercial_research import (
    campaign_summary, prepare_campaign, record_contact, record_interview,
)

DEFAULT_ROOT = ROOT / ".agent-state" / "commercial-research"
QUEUE_PATH = ROOT / "data" / "idea-staging-queue.json"


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


def private_root(value: str) -> Path:
    resolved = Path(value).resolve()
    allowed = (ROOT / ".agent-state").resolve()
    if resolved != allowed and allowed not in resolved.parents:
        raise argparse.ArgumentTypeError("commercial research storage must remain under .agent-state/")
    return resolved


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=private_root, default=DEFAULT_ROOT)
    sub = parser.add_subparsers(dest="command", required=True)
    prepare = sub.add_parser("prepare")
    prepare.add_argument("--campaign-id", required=True)
    prepare.add_argument("--coordinator-id", required=True)
    prepare.add_argument("--limit", type=int)
    contact = sub.add_parser("record-contact")
    contact.add_argument("--campaign-id", required=True)
    contact.add_argument("--candidate-id", required=True)
    contact.add_argument("--channel", required=True)
    contact.add_argument("--evidence", type=Path, required=True)
    contact.add_argument("--evidence-label", required=True)
    interview = sub.add_parser("record-interview")
    interview.add_argument("--campaign-id", required=True)
    interview.add_argument("--candidate-id", required=True)
    interview.add_argument("--participant-id", required=True)
    interview.add_argument("--buyer-role", required=True)
    interview.add_argument("--started-at", required=True)
    interview.add_argument("--ended-at", required=True)
    interview.add_argument("--evidence", type=Path, required=True)
    interview.add_argument("--evidence-label", required=True)
    interview.add_argument("--findings", type=Path, required=True)
    interview.add_argument("--consent-confirmed", action="store_true")
    args = parser.parse_args()

    if args.command == "prepare":
        if not QUEUE_PATH.exists():
            raise SystemExit("private staging queue is unavailable; hydrate it before preparing a campaign")
        queue = json.loads(QUEUE_PATH.read_text(encoding="utf-8"))
        campaign = prepare_campaign(
            args.root, campaign_id=args.campaign_id, queue=queue,
            created_at=now(), coordinator_id=args.coordinator_id, limit=args.limit,
        )
        print(json.dumps(campaign_summary(campaign), indent=2))
    elif args.command == "record-contact":
        event = record_contact(
            args.root, campaign_id=args.campaign_id, candidate_id=args.candidate_id,
            channel=args.channel, occurred_at=now(), evidence=args.evidence.read_bytes(),
            evidence_label=args.evidence_label,
        )
        print(json.dumps(event, indent=2))
    else:
        event = record_interview(
            args.root, campaign_id=args.campaign_id, candidate_id=args.candidate_id,
            participant_id=args.participant_id, buyer_role=args.buyer_role,
            started_at=args.started_at, ended_at=args.ended_at,
            consent_confirmed=args.consent_confirmed, evidence=args.evidence.read_bytes(),
            evidence_label=args.evidence_label,
            findings=json.loads(args.findings.read_text(encoding="utf-8")),
        )
        print(json.dumps({"eventId": event["eventId"], "eventDigest": event["eventDigest"]}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
