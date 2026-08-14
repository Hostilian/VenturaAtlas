"""Private blind-commercial-research assignment and lock-order state machine."""

from __future__ import annotations

import copy
import datetime as dt
import json
import re
from pathlib import Path
from typing import Any

from .atomic_io import atomic_write_json
from .lifecycle import blind_packet, contains_blind_anchor, idea_content_digest, sha256_json
from .preregistration import assert_holdout_packet, preregistration_digest

ASSIGNMENT_ID = re.compile(r"^blind-[a-z0-9][a-z0-9-]{2,80}$")
VERDICTS = {"KILL", "WAIT", "CONTINUE", "UNKNOWN"}
REQUIRED_FINDINGS = {
    "buyerEvidence", "painEvidence", "budgetEvidence", "alternatives",
    "dataAccess", "disconfirmations", "verdict", "sourceRefs", "claimsNotEarned",
}


def _parse_time(value: str) -> dt.datetime:
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise ValueError("timestamps must be timezone-aware")
    return parsed


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _paths(root: Path, assignment_id: str) -> dict[str, Path]:
    return {
        "packet": root / "packets" / f"{assignment_id}.json",
        "receipt": root / "receipts" / f"{assignment_id}.json",
        "findings": root / "findings" / f"{assignment_id}.json",
        "comparison": root / "comparisons" / f"{assignment_id}.json",
    }


def validate_blind_packet(packet: dict[str, Any]) -> None:
    assert_holdout_packet(packet)
    if contains_blind_anchor(packet):
        raise ValueError("blind packet contains score, rank, verdict, or promotion anchor")
    allowed = {
        "candidateId", "name", "concept", "category", "problemHypothesis",
        "buyerHypothesis", "forcingFunctionFacts", "questions",
    }
    unexpected = set(packet) - allowed
    if unexpected:
        raise ValueError(f"blind packet contains unexpected keys: {sorted(unexpected)}")


def validate_findings(findings: dict[str, Any]) -> None:
    if not isinstance(findings, dict):
        raise ValueError("findings must be an object")
    missing = REQUIRED_FINDINGS - set(findings)
    unexpected = set(findings) - REQUIRED_FINDINGS
    if missing or unexpected:
        raise ValueError(f"findings keys invalid; missing={sorted(missing)} unexpected={sorted(unexpected)}")
    assert_holdout_packet(findings)
    # The investigator's newly formed verdict is required; only prior-evaluation
    # anchors elsewhere in the findings are forbidden.
    anchor_surface = {key: value for key, value in findings.items() if key != "verdict"}
    if contains_blind_anchor(anchor_surface):
        raise ValueError("findings contain prior-evaluation anchor language")
    if findings.get("verdict") not in VERDICTS:
        raise ValueError("findings verdict must be KILL, WAIT, CONTINUE, or UNKNOWN")
    for key in ["buyerEvidence", "painEvidence", "budgetEvidence", "dataAccess"]:
        if not isinstance(findings.get(key), str) or not findings[key].strip():
            raise ValueError(f"findings.{key} must be a non-empty string")
    for key in ["alternatives", "disconfirmations", "sourceRefs", "claimsNotEarned"]:
        if not isinstance(findings.get(key), list):
            raise ValueError(f"findings.{key} must be a list")


def prepare_assignment(root: Path, *, assignment_id: str, idea: dict[str, Any],
                       preregistration: dict[str, Any], investigator_id: str,
                       created_at: str) -> tuple[dict[str, Any], dict[str, Any]]:
    if not ASSIGNMENT_ID.fullmatch(assignment_id):
        raise ValueError("assignmentId must match blind-[a-z0-9-]+")
    if not investigator_id.strip():
        raise ValueError("investigator id is required")
    if investigator_id == preregistration.get("author", {}).get("id"):
        raise ValueError("blind investigator must differ from preregistration author")
    candidate_id = idea.get("id") or idea.get("candidateId")
    digest = idea_content_digest(idea)
    if preregistration.get("candidateId") != candidate_id:
        raise ValueError("preregistration candidate mismatch")
    if preregistration.get("candidateContentDigest") != digest:
        raise ValueError("preregistration content digest mismatch")
    if preregistration.get("digest") != preregistration_digest(preregistration):
        raise ValueError("preregistration digest mismatch")
    created = _parse_time(created_at)
    if _parse_time(preregistration["lockedAt"]) >= created:
        raise ValueError("preregistration must lock before blind assignment")
    paths = _paths(root, assignment_id)
    if any(path.exists() for path in paths.values()):
        raise ValueError("blind assignment already exists and is immutable")
    packet = blind_packet(idea)
    validate_blind_packet(packet)
    packet_digest = sha256_json(packet)
    receipt = {
        "schemaVersion": "1.0.0",
        "assignmentId": assignment_id,
        "candidateId": candidate_id,
        "candidateContentDigest": digest,
        "investigatorId": investigator_id,
        "preregistrationDigest": preregistration["digest"],
        "packetDigest": packet_digest,
        "createdAt": created_at,
        "status": "PREPARED",
        "findingsDigest": None,
        "findingsLockedAt": None,
        "unblindedAt": None,
        "receiptContract": "blind-commercial-research-v1",
    }
    atomic_write_json(str(paths["packet"]), packet)
    atomic_write_json(str(paths["receipt"]), receipt)
    return packet, receipt


def lock_findings(root: Path, *, assignment_id: str, findings: dict[str, Any],
                  findings_locked_at: str) -> dict[str, Any]:
    paths = _paths(root, assignment_id)
    receipt = _read_json(paths["receipt"])
    packet = _read_json(paths["packet"])
    if receipt.get("status") != "PREPARED":
        raise ValueError("assignment is not awaiting findings")
    if sha256_json(packet) != receipt.get("packetDigest"):
        raise ValueError("blind packet digest mismatch")
    validate_blind_packet(packet)
    validate_findings(findings)
    locked = _parse_time(findings_locked_at)
    if locked <= _parse_time(receipt["createdAt"]):
        raise ValueError("findings must lock after assignment creation")
    findings_record = {
        "schemaVersion": "1.0.0",
        "assignmentId": assignment_id,
        "candidateId": receipt["candidateId"],
        "investigatorId": receipt["investigatorId"],
        "packetDigest": receipt["packetDigest"],
        "findingsLockedAt": findings_locked_at,
        "findings": copy.deepcopy(findings),
    }
    findings_digest = sha256_json(findings_record)
    atomic_write_json(str(paths["findings"]), findings_record)
    receipt["status"] = "FINDINGS_LOCKED"
    receipt["findingsDigest"] = findings_digest
    receipt["findingsLockedAt"] = findings_locked_at
    atomic_write_json(str(paths["receipt"]), receipt)
    return receipt


def unblind_assignment(root: Path, *, assignment_id: str,
                       preregistration: dict[str, Any], unblinded_at: str) -> dict[str, Any]:
    paths = _paths(root, assignment_id)
    receipt = _read_json(paths["receipt"])
    if receipt.get("status") != "FINDINGS_LOCKED":
        raise ValueError("findings must be locked before unblinding")
    findings_record = _read_json(paths["findings"])
    if sha256_json(findings_record) != receipt.get("findingsDigest"):
        raise ValueError("locked findings digest mismatch")
    if preregistration.get("digest") != receipt.get("preregistrationDigest"):
        raise ValueError("unblind preregistration does not match assignment")
    if preregistration.get("digest") != preregistration_digest(preregistration):
        raise ValueError("unblind preregistration digest mismatch")
    unblinded = _parse_time(unblinded_at)
    if unblinded <= _parse_time(receipt["findingsLockedAt"]):
        raise ValueError("unblinding must occur after findings lock")
    blind_verdict = findings_record["findings"]["verdict"]
    expected = preregistration["expectations"]["verdict"].replace("LIKELY_", "")
    comparison = {
        "schemaVersion": "1.0.0",
        "assignmentId": assignment_id,
        "candidateId": receipt["candidateId"],
        "findingsDigest": receipt["findingsDigest"],
        "preregistrationDigest": receipt["preregistrationDigest"],
        "blindVerdict": blind_verdict,
        "preregisteredVerdict": expected,
        "verdictChanged": blind_verdict != expected,
        "unblindedAt": unblinded_at,
        "anchoringMeasurement": "NOT_MEASURED_SINGLE_BLIND_ASSIGNMENT",
    }
    atomic_write_json(str(paths["comparison"]), comparison)
    receipt["status"] = "UNBLINDED"
    receipt["unblindedAt"] = unblinded_at
    atomic_write_json(str(paths["receipt"]), receipt)
    return comparison
