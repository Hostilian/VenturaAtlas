"""Fail-closed private research pre-registration and unblinding gates."""

from __future__ import annotations

import copy
import datetime as dt
from typing import Any

from .lifecycle import sha256_json


def preregistration_subject(receipt: dict[str, Any]) -> dict[str, Any]:
    result = copy.deepcopy(receipt)
    result.pop("digest", None)
    return result


def preregistration_digest(receipt: dict[str, Any]) -> str:
    return sha256_json(preregistration_subject(receipt))


def validate_preregistration(receipt: dict[str, Any], candidate_digest: str,
                             research_started_at: str, findings_locked_at: str,
                             unblinded_at: str | None = None) -> list[str]:
    errors = []
    if receipt.get("candidateContentDigest") != candidate_digest:
        errors.append("candidate content digest mismatch")
    if receipt.get("digest") != preregistration_digest(receipt):
        errors.append("preregistration digest mismatch")
    try:
        locked = dt.datetime.fromisoformat(receipt["lockedAt"].replace("Z", "+00:00"))
        started = dt.datetime.fromisoformat(research_started_at.replace("Z", "+00:00"))
        findings = dt.datetime.fromisoformat(findings_locked_at.replace("Z", "+00:00"))
        if locked >= started:
            errors.append("preregistration must lock before research starts")
        if findings < started:
            errors.append("findings cannot lock before research starts")
        if unblinded_at:
            unblinded = dt.datetime.fromisoformat(unblinded_at.replace("Z", "+00:00"))
            if findings >= unblinded:
                errors.append("findings must lock before unblinding")
    except (KeyError, TypeError, ValueError):
        errors.append("research gate timestamps must be timezone-aware ISO date-times")
    return errors


def assert_holdout_packet(packet: dict[str, Any]) -> None:
    forbidden = {"preregistration", "preregistrationDigest", "priorScore", "priorRank", "priorVerdict", "initialVerdict"}
    if any(key in packet for key in forbidden):
        raise ValueError("holdout packet contains internal expectation or prior-evaluation data")
