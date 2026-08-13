#!/usr/bin/env python3
"""Issue one authority-bound semantic review for a private staged candidate."""

import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from va_runtime.semantic_review import SemanticReviewIssuanceError, issue_semantic_review


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("candidate_id")
    parser.add_argument("--reviewer-id", required=True)
    parser.add_argument("--decision", required=True, choices=["DISTINCT", "DUPLICATE", "FEATURE_OF_EXISTING", "UNRESOLVED"])
    parser.add_argument("--nearest-idea", action="append", default=[])
    args = parser.parse_args()
    queue_path = ROOT / "data" / "idea-staging-queue.json"
    if not queue_path.exists():
        raise SystemExit("private staging queue is unavailable in this checkout")
    queue = json.loads(queue_path.read_text(encoding="utf-8"))
    candidate = next((item for item in queue if item.get("id") == args.candidate_id), None)
    if not candidate:
        raise SystemExit(f"staged candidate not found: {args.candidate_id}")
    try:
        review = issue_semantic_review(candidate, args.reviewer_id, args.decision, args.nearest_idea)
    except SemanticReviewIssuanceError as exc:
        raise SystemExit(str(exc)) from exc
    print(review["semanticReviewId"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
