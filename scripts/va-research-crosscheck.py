#!/usr/bin/env python3
"""Independent multi-provider cross-check for newly staged candidates.

The receipt is private runtime state. Provider opinions are never represented as
external evidence and this script never promotes or edits canonical ideas.
"""

from __future__ import annotations

import argparse
import datetime
import difflib
import hashlib
import json
import os
import sys
import uuid


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from va_orchestrator import call_llm_panel
from va_runtime.atomic_io import atomic_write_json, read_json_safe
from va_runtime.provider_router import NoEligibleProviderError
from va_runtime.redaction import redact_secrets


QUEUE_PATH = os.path.join(ROOT, "data", "idea-staging-queue.json")
IDEAS_PATH = os.path.join(ROOT, "data", "ideas.json")
DEFAULT_RECEIPT_DIR = os.path.join(ROOT, ".agent-state", "crosschecks")


def _idea_list(payload) -> list[dict]:
    if isinstance(payload, dict):
        payload = payload.get("ideas", [])
    return payload if isinstance(payload, list) else []


def _nearest_names(candidate_name: str, canonical: list[dict], limit: int = 5) -> list[dict]:
    target = candidate_name.casefold()
    scored = []
    for idea in canonical:
        name = str(idea.get("name", ""))
        if not name:
            continue
        score = difflib.SequenceMatcher(None, target, name.casefold()).ratio()
        scored.append({"id": idea.get("id"), "name": name, "nameSimilarity": round(score, 4)})
    return sorted(scored, key=lambda item: item["nameSimilarity"], reverse=True)[:limit]


def _candidate_prompt(candidate: dict, nearest: list[dict]) -> str:
    compact = {
        key: candidate.get(key)
        for key in (
            "id", "name", "oneSentenceConcept", "elevatorPitch", "targetCustomer",
            "problemSolved", "whatToBuild", "howItMakesMoney", "whyCustomersPay",
            "scores", "validationChecklist", "killCriteria", "source"
        )
        if key in candidate
    }
    return """You are one independent reviewer in a three-model adversarial panel.
Do not agree reflexively. Do not invent web research, customers, prices, laws, or
citations. The supplied nearest-name list is only an internal corpus comparison.

Review the candidate on five separate axes:
1. internal contradictions or unsupported certainty;
2. likely corpus duplication or feature-level adjacency;
3. strongest substitute, do-nothing path, and platform-absorption risk;
4. claims that require primary-source or live buyer verification;
5. the cheapest falsification test and an explicit kill threshold.

Return JSON only with keys: verdict, fatalErrors, duplicateAssessment,
unsupportedClaims, missingCrossChecks, falsificationTest, killThreshold,
confidenceLimitations. A model review is not external evidence.

CANDIDATE:
""" + json.dumps(compact, ensure_ascii=False, sort_keys=True) + "\n\nNEAREST INTERNAL NAMES:\n" + json.dumps(nearest, ensure_ascii=False)


def _receipt_path(receipt_dir: str, run_id: str) -> str:
    return os.path.join(receipt_dir, f"{run_id}.json")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run an independent provider cross-check panel")
    parser.add_argument("--limit", type=int, default=2, help="Most recent staged candidates to review")
    parser.add_argument("--panel-size", type=int, default=3, help="Distinct providers requested per candidate")
    parser.add_argument("--minimum-responses", type=int, default=3, help="Minimum successful distinct responses")
    parser.add_argument("--max-cost", type=int, default=1, help="Maximum provider cost class")
    parser.add_argument("--strict", action="store_true", help="Fail when a full panel cannot be assembled")
    parser.add_argument("--receipt-dir", default=DEFAULT_RECEIPT_DIR)
    args = parser.parse_args()

    started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    run_id = f"crosscheck-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')}-{uuid.uuid4().hex[:8]}"
    queue = _idea_list(read_json_safe(QUEUE_PATH, default_if_missing=[]))
    canonical = _idea_list(read_json_safe(IDEAS_PATH, default_if_missing={"ideas": []}))
    selected = queue[-max(0, args.limit):] if args.limit > 0 else []

    receipt = {
        "schemaVersion": "1.0.0",
        "runId": run_id,
        "startedAt": started_at,
        "endedAt": None,
        "status": "NO_OP" if not selected else "RUNNING",
        "evidenceStatus": "MODEL_REVIEW_ONLY_NOT_EXTERNAL_EVIDENCE",
        "panelContract": {
            "requestedDistinctProviders": args.panel_size,
            "minimumResponses": args.minimum_responses,
            "maxCostClass": args.max_cost,
            "strict": args.strict,
        },
        "reviews": [],
        "failures": [],
    }

    for candidate in selected:
        candidate_id = str(candidate.get("id", "unknown"))
        nearest = _nearest_names(str(candidate.get("name", "")), canonical)
        prompt = _candidate_prompt(candidate, nearest)
        try:
            responses = call_llm_panel(
                prompt,
                {"category": candidate.get("category"), "candidateId": candidate_id},
                panel_size=args.panel_size,
                minimum_responses=args.minimum_responses,
                required_capabilities=["reasoning", "structured_review", "adversarial_review"],
                match_mode="any",
                max_cost_class=args.max_cost,
                include_own_orch=False,
            )
        except NoEligibleProviderError as exc:
            receipt["failures"].append({"candidateId": candidate_id, "error": str(exc)})
            continue

        safe_responses = []
        for response in responses:
            content = redact_secrets(str(response["content"]))[:16000]
            safe_responses.append({
                "provider": response["provider"],
                "contentSha256": hashlib.sha256(content.encode("utf-8")).hexdigest(),
                "content": content,
            })
        receipt["reviews"].append({
            "candidateId": candidate_id,
            "candidateName": candidate.get("name"),
            "nearestInternalNames": nearest,
            "distinctProviders": [item["provider"] for item in safe_responses],
            "responses": safe_responses,
        })

    if selected:
        receipt["status"] = "SUCCEEDED" if len(receipt["reviews"]) == len(selected) else "DEGRADED"
    receipt["endedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    atomic_write_json(_receipt_path(args.receipt_dir, run_id), receipt)
    atomic_write_json(os.path.join(args.receipt_dir, "latest.json"), receipt)
    print(json.dumps({
        "runId": run_id,
        "status": receipt["status"],
        "candidatesRequested": len(selected),
        "candidatesReviewed": len(receipt["reviews"]),
        "failures": len(receipt["failures"]),
    }, sort_keys=True))
    return 1 if args.strict and receipt["status"] == "DEGRADED" else 0


if __name__ == "__main__":
    raise SystemExit(main())
