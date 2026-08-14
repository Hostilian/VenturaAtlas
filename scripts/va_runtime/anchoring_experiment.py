"""Private randomized blind-versus-informed anchoring experiment contract."""

from __future__ import annotations

import copy
import datetime as dt
import hashlib
import hmac
import json
import random
import re
from pathlib import Path
from typing import Any

from .atomic_io import atomic_write_json
from .blind_research import validate_blind_packet
from .lifecycle import blind_packet, idea_content_digest, sha256_json
from .preregistration import preregistration_digest

EXPERIMENT_ID = re.compile(r"^anchor-[a-z0-9][a-z0-9-]{2,80}$")
VERDICT_SCALE = {"KILL": 0, "WAIT": 1, "CONTINUE": 2}
RESPONSE_KEYS = {
    "verdict", "proceedProbability", "buyerEvidence", "budgetEvidence",
    "disconfirmations", "sourceRefs", "claimsNotEarned",
}


def _parse_time(value: str) -> dt.datetime:
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise ValueError("timestamps must be timezone-aware")
    return parsed


def _experiment_path(root: Path, experiment_id: str) -> Path:
    return root / "experiments" / f"{experiment_id}.json"


def _packet_path(root: Path, experiment_id: str, assignment_id: str) -> Path:
    return root / "packets" / experiment_id / f"{assignment_id}.json"


def _response_path(root: Path, experiment_id: str, assignment_id: str) -> Path:
    return root / "responses" / experiment_id / f"{assignment_id}.json"


def _result_path(root: Path, experiment_id: str) -> Path:
    return root / "results" / f"{experiment_id}.json"


def _verify_plan_digest(plan: dict[str, Any]) -> None:
    subject = copy.deepcopy(plan)
    digest = subject.pop("planDigest", None)
    if digest != sha256_json(subject):
        raise ValueError("anchoring experiment plan digest mismatch")


def _expected_verdict(preregistration: dict[str, Any]) -> str:
    raw = str((preregistration.get("expectations") or {}).get("verdict", ""))
    verdict = raw.replace("LIKELY_", "")
    if verdict not in VERDICT_SCALE:
        raise ValueError("preregistered verdict must resolve to KILL, WAIT, or CONTINUE")
    return verdict


def _assignment_order(seed: str, reviewers: list[str]) -> list[str]:
    ordered = list(reviewers)
    seed_number = int(hashlib.sha256(seed.encode("utf-8")).hexdigest(), 16)
    random.Random(seed_number).shuffle(ordered)
    return ordered


def _arm_order(seed: str, candidate_id: str) -> list[str]:
    bit = hmac.new(seed.encode("utf-8"), candidate_id.encode("utf-8"), hashlib.sha256).digest()[0] & 1
    return ["BLIND", "INFORMED"] if bit == 0 else ["INFORMED", "BLIND"]


def prepare_experiment(root: Path, *, experiment_id: str,
                       subjects: list[tuple[dict[str, Any], dict[str, Any]]],
                       reviewer_ids: list[str], seed: str, created_at: str,
                       minimum_pairs: int = 10) -> dict[str, Any]:
    if not EXPERIMENT_ID.fullmatch(experiment_id):
        raise ValueError("experimentId must match anchor-[a-z0-9-]+")
    if not seed or len(seed) < 16:
        raise ValueError("randomization seed must contain at least 16 characters")
    if not subjects:
        raise ValueError("at least one candidate pair is required")
    if len(reviewer_ids) != len(subjects) * 2 or len(set(reviewer_ids)) != len(reviewer_ids):
        raise ValueError("exactly two unique reviewers are required per candidate")
    if minimum_pairs < 2:
        raise ValueError("minimumPairs must be at least 2")
    _parse_time(created_at)
    plan_path = _experiment_path(root, experiment_id)
    if plan_path.exists() or _result_path(root, experiment_id).exists():
        raise ValueError("anchoring experiment already exists and is immutable")

    prereg_authors = {str(prereg.get("author", {}).get("id")) for _, prereg in subjects}
    if any(not reviewer.strip() or reviewer in prereg_authors for reviewer in reviewer_ids):
        raise ValueError("reviewers must be non-empty and independent of preregistration authors")
    shuffled = _assignment_order(seed, reviewer_ids)
    assignments: list[dict[str, Any]] = []
    seen_candidates: set[str] = set()
    for index, (idea, prereg) in enumerate(subjects):
        candidate_id = str(idea.get("id") or idea.get("candidateId") or "")
        if not candidate_id or candidate_id in seen_candidates:
            raise ValueError("anchoring experiment candidate IDs must be non-empty and unique")
        seen_candidates.add(candidate_id)
        content_digest = idea_content_digest(idea)
        if prereg.get("candidateId") != candidate_id or prereg.get("candidateContentDigest") != content_digest:
            raise ValueError(f"{candidate_id or '<unknown>'} preregistration subject mismatch")
        if prereg.get("digest") != preregistration_digest(prereg):
            raise ValueError(f"{candidate_id} preregistration digest mismatch")
        if _parse_time(prereg["lockedAt"]) >= _parse_time(created_at):
            raise ValueError(f"{candidate_id} preregistration must lock before experiment")
        base_packet = blind_packet(idea)
        validate_blind_packet(base_packet)
        pair_reviewers = shuffled[index * 2:index * 2 + 2]
        for arm, reviewer_id in zip(_arm_order(seed, candidate_id), pair_reviewers):
            assignment_id = f"{experiment_id}-{index + 1:03d}-{arm.lower()}"
            packet = copy.deepcopy(base_packet)
            packet["experimentAssignmentId"] = assignment_id
            packet["responseFields"] = sorted(RESPONSE_KEYS)
            if arm == "INFORMED":
                packet["armDisclosure"] = "INFORMED"
                packet["priorEvaluation"] = {"expectedVerdict": _expected_verdict(prereg)}
            else:
                validate_blind_packet(base_packet)
            packet_digest = sha256_json(packet)
            atomic_write_json(str(_packet_path(root, experiment_id, assignment_id)), packet)
            assignments.append({
                "assignmentId": assignment_id,
                "candidateId": candidate_id,
                "candidateContentDigest": content_digest,
                "preregistrationDigest": prereg["digest"],
                "expectedVerdict": _expected_verdict(prereg),
                "reviewerId": reviewer_id,
                "arm": arm,
                "packetDigest": packet_digest,
            })
    plan = {
        "schemaVersion": "1.0.0",
        "contract": "paired-anchoring-experiment-v1",
        "experimentId": experiment_id,
        "createdAt": created_at,
        "status": "PREPARED",
        "seedCommitment": hashlib.sha256(seed.encode("utf-8")).hexdigest(),
        "minimumPairs": minimum_pairs,
        "pairCount": len(subjects),
        "primaryMetric": "mean paired informed-minus-blind anchor-alignment on ordinal verdict scale",
        "assignments": assignments,
    }
    plan["planDigest"] = sha256_json(plan)
    atomic_write_json(str(plan_path), plan)
    return plan


def validate_response(response: dict[str, Any]) -> None:
    if set(response) != RESPONSE_KEYS:
        raise ValueError(f"response keys must equal {sorted(RESPONSE_KEYS)}")
    if response["verdict"] not in VERDICT_SCALE:
        raise ValueError("response verdict must be KILL, WAIT, or CONTINUE")
    probability = response["proceedProbability"]
    if isinstance(probability, bool) or not isinstance(probability, (int, float)) or not 0 <= probability <= 100:
        raise ValueError("proceedProbability must be a number from 0 to 100")
    for key in ["buyerEvidence", "budgetEvidence"]:
        if not isinstance(response[key], str) or not response[key].strip():
            raise ValueError(f"{key} must be a non-empty string")
    for key in ["disconfirmations", "sourceRefs", "claimsNotEarned"]:
        if not isinstance(response[key], list):
            raise ValueError(f"{key} must be a list")


def lock_response(root: Path, *, experiment_id: str, assignment_id: str,
                  reviewer_id: str, response: dict[str, Any], locked_at: str) -> dict[str, Any]:
    plan = json.loads(_experiment_path(root, experiment_id).read_text(encoding="utf-8"))
    _verify_plan_digest(plan)
    if plan.get("status") != "PREPARED":
        raise ValueError("experiment is not accepting responses")
    assignment = next((item for item in plan["assignments"] if item["assignmentId"] == assignment_id), None)
    if not assignment or assignment["reviewerId"] != reviewer_id:
        raise ValueError("assignment reviewer mismatch")
    response_path = _response_path(root, experiment_id, assignment_id)
    if response_path.exists():
        raise ValueError("response is already locked and immutable")
    packet = json.loads(_packet_path(root, experiment_id, assignment_id).read_text(encoding="utf-8"))
    if sha256_json(packet) != assignment["packetDigest"]:
        raise ValueError("experiment packet digest mismatch")
    if _parse_time(locked_at) <= _parse_time(plan["createdAt"]):
        raise ValueError("response must lock after experiment creation")
    validate_response(response)
    record = {
        "schemaVersion": "1.0.0",
        "experimentId": experiment_id,
        "assignmentId": assignment_id,
        "candidateId": assignment["candidateId"],
        "reviewerId": reviewer_id,
        "packetDigest": assignment["packetDigest"],
        "lockedAt": locked_at,
        "response": copy.deepcopy(response),
    }
    record["responseDigest"] = sha256_json(record)
    atomic_write_json(str(response_path), record)
    return record


def finalize_experiment(root: Path, *, experiment_id: str, seed: str,
                        finalized_at: str) -> dict[str, Any]:
    plan_path = _experiment_path(root, experiment_id)
    plan = json.loads(plan_path.read_text(encoding="utf-8"))
    _verify_plan_digest(plan)
    if plan.get("status") != "PREPARED":
        raise ValueError("experiment is not ready for finalization")
    if hashlib.sha256(seed.encode("utf-8")).hexdigest() != plan["seedCommitment"]:
        raise ValueError("randomization seed does not match commitment")
    if _parse_time(finalized_at) <= _parse_time(plan["createdAt"]):
        raise ValueError("finalization must occur after experiment creation")
    responses: dict[str, dict[str, Any]] = {}
    for assignment in plan["assignments"]:
        path = _response_path(root, experiment_id, assignment["assignmentId"])
        if not path.exists():
            raise ValueError(f"missing locked response: {assignment['assignmentId']}")
        record = json.loads(path.read_text(encoding="utf-8"))
        digest = record.pop("responseDigest", None)
        if digest != sha256_json(record):
            raise ValueError(f"locked response digest mismatch: {assignment['assignmentId']}")
        record["responseDigest"] = digest
        responses[assignment["assignmentId"]] = record
    pairs: list[dict[str, Any]] = []
    for candidate_id in sorted({item["candidateId"] for item in plan["assignments"]}):
        assigned = [item for item in plan["assignments"] if item["candidateId"] == candidate_id]
        blind = next(item for item in assigned if item["arm"] == "BLIND")
        informed = next(item for item in assigned if item["arm"] == "INFORMED")
        expected = VERDICT_SCALE[blind["expectedVerdict"]]
        blind_value = VERDICT_SCALE[responses[blind["assignmentId"]]["response"]["verdict"]]
        informed_value = VERDICT_SCALE[responses[informed["assignmentId"]]["response"]["verdict"]]
        blind_alignment = 1 - abs(blind_value - expected) / 2
        informed_alignment = 1 - abs(informed_value - expected) / 2
        pairs.append({
            "candidateId": candidate_id,
            "expectedVerdict": blind["expectedVerdict"],
            "blindVerdict": responses[blind["assignmentId"]]["response"]["verdict"],
            "informedVerdict": responses[informed["assignmentId"]]["response"]["verdict"],
            "alignmentDelta": informed_alignment - blind_alignment,
            "proceedProbabilityDelta": (
                responses[informed["assignmentId"]]["response"]["proceedProbability"]
                - responses[blind["assignmentId"]]["response"]["proceedProbability"]
            ),
        })
    anchoring_delta = sum(item["alignmentDelta"] for item in pairs) / len(pairs)
    result = {
        "schemaVersion": "1.0.0",
        "contract": "paired-anchoring-result-v1",
        "experimentId": experiment_id,
        "finalizedAt": finalized_at,
        "seedRevealed": seed,
        "pairCount": len(pairs),
        "minimumPairs": plan["minimumPairs"],
        "measurementStatus": "MEASURED_DESCRIPTIVE" if len(pairs) >= plan["minimumPairs"] else "MEASURED_UNDERPOWERED",
        "anchoringDelta": anchoring_delta,
        "meanProceedProbabilityDelta": sum(item["proceedProbabilityDelta"] for item in pairs) / len(pairs),
        "interpretation": "Positive anchoringDelta means informed verdicts aligned more closely with preregistered expectations; this descriptive result is not causal proof.",
        "pairs": pairs,
    }
    result["resultDigest"] = sha256_json(result)
    atomic_write_json(str(_result_path(root, experiment_id)), result)
    plan["status"] = "FINALIZED"
    plan["resultDigest"] = result["resultDigest"]
    plan.pop("planDigest", None)
    plan["planDigest"] = sha256_json(plan)
    atomic_write_json(str(plan_path), plan)
    return result
