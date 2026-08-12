#!/usr/bin/env python3
"""Generate a private, score-blind research packet for one staged candidate."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from va_runtime.atomic_io import atomic_write_json
from va_runtime.lifecycle import blind_packet, contains_blind_anchor


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("candidate_id")
    parser.add_argument("--run-dir", required=True, help="Existing research/audits/<RUN_ID> directory")
    args = parser.parse_args()

    run_dir = Path(args.run_dir).resolve()
    audits_root = (ROOT / "research" / "audits").resolve()
    if audits_root not in run_dir.parents or not run_dir.is_dir():
        raise SystemExit("--run-dir must be an existing private research/audits/<RUN_ID> directory")

    queue = json.loads((ROOT / "data" / "idea-staging-queue.json").read_text(encoding="utf-8"))
    candidate = next((item for item in queue if args.candidate_id in {
        item.get("id"), item.get("candidateId"), item.get("legacyCandidateId")
    }), None)
    if not candidate:
        raise SystemExit(f"candidate not found: {args.candidate_id}")

    packet = blind_packet(candidate)
    if contains_blind_anchor(packet):
        raise SystemExit("blind packet contains a prohibited score/rank/verdict anchor")
    output = run_dir / "blind-packets" / f"{args.candidate_id}.json"
    atomic_write_json(str(output), packet)
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
