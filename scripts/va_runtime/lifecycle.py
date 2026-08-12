"""Fail-closed Venture Atlas lifecycle receipt primitives.

The functions in this module deliberately separate canonical identity from
research, ranking, validation, and recommendation. A receipt is a reviewed
decision record, not a cryptographic signature and not proof of market truth.
"""

from __future__ import annotations

import copy
import datetime as dt
import hashlib
import json
import os
import re
import subprocess
from typing import Any, Dict, Iterable, List, Tuple


ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RECEIPTS_PATH = os.path.join(ROOT, "data", "lifecycle-receipts.json")
SOURCES_PATH = os.path.join(ROOT, "data", "sources.json")
RUNS_PATH = os.path.join(ROOT, "data", "research-runs.json")

REVIEWER_ROLES = {"repository-owner", "human-reviewer", "integration-release-agent"}
HIGHER_RESEARCH_MATURITY = {"R4_CLAIM_MAPPED", "R5_ADVERSARIAL", "R6_REVIEWED", "R7_DECISION_INTEGRATED"}
BLIND_SCORE_KEYS = {
    "analystprovisionalopportunityscore", "researchpriorityheuristic", "overallscore",
    "compositeheadline", "score", "rank", "previousrank", "initialverdict",
    "verdict", "priority", "promotionelegible", "rankingeligible",
}


class LifecycleReceiptError(ValueError):
    pass


def _canonical_json(value: Any) -> str:
    """Language-neutral typed encoding for lifecycle digests (contract v2)."""
    if value is None:
        return "n"
    if isinstance(value, bool):
        return "t" if value else "f"
    if isinstance(value, (int, float)):
        number = float(value)
        if not number == number or abs(number) == float("inf"):
            raise LifecycleReceiptError("non-finite numbers cannot be lifecycle-digested")
        if isinstance(value, int) and abs(value) > 9007199254740991:
            raise LifecycleReceiptError("integers outside the JSON safe range cannot be lifecycle-digested")
        if number == 0:
            return "d:0"
        mantissa, exponent = format(number, ".16e").split("e")
        return f"d:{mantissa}e{int(exponent):+d}"
    if isinstance(value, str):
        payload = value.encode("utf-8")
        return f"s{len(payload)}:{value}"
    if isinstance(value, list):
        return "[" + "".join(_canonical_json(item) for item in value) + "]"
    if isinstance(value, dict):
        return "{" + "".join(
            _canonical_json(str(key)) + _canonical_json(value[key])
            for key in sorted(value)
        ) + "}"
    raise LifecycleReceiptError(f"unsupported lifecycle digest type: {type(value).__name__}")


def sha256_json(value: Any) -> str:
    return hashlib.sha256(_canonical_json(value).encode("utf-8")).hexdigest()


def current_git_commit() -> str:
    return subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()


def receipt_subject(candidate: Dict[str, Any]) -> Dict[str, Any]:
    """Return the exact pre-publication subject bound by a CANONICALIZE receipt."""
    result = copy.deepcopy(candidate)
    result.pop("canonicalizationReceipt", None)
    result.pop("lifecycleReceiptRefs", None)
    return result


DERIVED_LIFECYCLE_FIELDS = {
    "lifecycleReceiptRefs", "canonicalState", "researchMaturity", "rankingEligibility",
    "validationMaturity", "decisionStatus", "promotionReview",
}


def idea_content_subject(idea: Dict[str, Any]) -> Dict[str, Any]:
    """Stable substantive projection; later receipt pointers cannot invalidate prior receipts."""
    return {key: copy.deepcopy(value) for key, value in idea.items() if key not in DERIVED_LIFECYCLE_FIELDS}


def idea_content_digest(idea: Dict[str, Any]) -> str:
    return sha256_json(idea_content_subject(idea))


def candidate_digest(candidate: Dict[str, Any]) -> str:
    return sha256_json(receipt_subject(candidate))


def _parse_time(value: str, field: str) -> dt.datetime:
    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            raise ValueError("timezone required")
        return parsed.astimezone(dt.timezone.utc)
    except Exception as exc:
        raise LifecycleReceiptError(f"{field} must be a timezone-aware ISO date-time") from exc


def _basic_receipt_errors(receipt: Dict[str, Any], expected_type: str, subject_id: str,
                          subject_digest: str, baseline_commit: str) -> List[str]:
    errors: List[str] = []
    required = ["schemaVersion", "receiptId", "receiptType", "subjectId", "subjectDigest",
                "baselineCommit", "reviewer", "decision", "decidedAt"]
    for field in required:
        if not receipt.get(field):
            errors.append(f"missing {field}")
    if receipt.get("schemaVersion") != "1.0.0":
        errors.append("unsupported schemaVersion")
    if receipt.get("receiptType") != expected_type:
        errors.append(f"receiptType must be {expected_type}")
    if receipt.get("subjectId") != subject_id:
        errors.append("subjectId mismatch")
    if receipt.get("subjectDigest") != subject_digest:
        errors.append("subjectDigest mismatch")
    if receipt.get("baselineCommit") != baseline_commit:
        errors.append("baselineCommit mismatch")
    if receipt.get("decision") != "APPROVE":
        errors.append("decision is not APPROVE")
    reviewer = receipt.get("reviewer") or {}
    authorities_path = os.environ.get("VA_REVIEWER_AUTHORITIES_PATH", os.path.join(ROOT, "data", "reviewer-authorities.json"))
    try:
        with open(authorities_path, "r", encoding="utf-8") as handle:
            authorities = json.load(handle).get("authorities", [])
    except (OSError, ValueError):
        authorities = []
    authority = next((item for item in authorities if item.get("id") == reviewer.get("id") and item.get("active") is True), None)
    if (not authority or authority.get("role") != reviewer.get("role") or
            reviewer.get("role") not in REVIEWER_ROLES):
        errors.append("reviewer authority is invalid")
    try:
        decided_at = _parse_time(receipt.get("decidedAt", ""), "decidedAt")
        if decided_at > dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=5):
            errors.append("decidedAt is in the future")
    except LifecycleReceiptError as exc:
        errors.append(str(exc))
    if receipt.get("expiresAt"):
        try:
            if _parse_time(receipt["expiresAt"], "expiresAt") <= dt.datetime.now(dt.timezone.utc):
                errors.append("receipt is expired")
        except LifecycleReceiptError as exc:
            errors.append(str(exc))
    if not re.fullmatch(r"receipt-[a-z0-9-]{8,}", str(receipt.get("receiptId", ""))):
        errors.append("receiptId format is invalid")
    return errors


def validate_canonicalization_receipt(candidate: Dict[str, Any], receipt: Dict[str, Any],
                                      baseline_commit: str | None = None) -> Tuple[bool, List[str]]:
    baseline_commit = baseline_commit or current_git_commit()
    subject_id = str(candidate.get("id") or candidate.get("candidateId") or "")
    errors = _basic_receipt_errors(
        receipt, "CANONICALIZE", subject_id, candidate_digest(candidate), baseline_commit
    )
    if (receipt.get("identityReview") or {}).get("status") != "APPROVED":
        errors.append("identityReview is not APPROVED")
    duplicate_review = receipt.get("duplicateReview") or {}
    if duplicate_review.get("status") != "APPROVED" or not duplicate_review.get("semanticReviewId"):
        errors.append("semantic duplicate review receipt is missing or not approved")
    if receipt.get("lineageVerified") is not True:
        errors.append("lineageVerified must be true")
    return not errors, errors


def canonical_projection(candidate: Dict[str, Any], canonical_id: str, receipt_id: str,
                         published_at: str) -> Dict[str, Any]:
    """Project a staged candidate into a truthful canonical hypothesis."""
    result = copy.deepcopy(candidate)
    for key in [
        "candidateId", "legacyCandidateId", "candidateSlug", "promotionEligible",
        "requiresExternalEvidence", "generationMode", "evidenceStatus", "priority",
        "analystProvisionalOpportunityScore", "initialVerdict", "scores", "compositeScores",
        "checklist", "promotionReview",
    ]:
        result.pop(key, None)
    result["id"] = canonical_id
    result["slug"] = str(candidate.get("slug") or candidate.get("candidateSlug") or "").strip()
    result["status"] = "explore"
    result["canonicalState"] = "CANONICAL_HYPOTHESIS"
    result["researchMaturity"] = "R0_DECLARED"
    result["rankingEligibility"] = {"eligible": False, "universe": None, "reason": "receipt_required"}
    result["validationMaturity"] = "NOT_VALIDATED"
    result["decisionStatus"] = "HYPOTHESIS"
    result["publishedAt"] = published_at
    result["lifecycleReceiptRefs"] = {"canonicalization": receipt_id}
    if isinstance(result.get("atAGlance"), dict):
        result["atAGlance"].pop("overallScore", None)
    return result


def blind_packet(candidate: Dict[str, Any]) -> Dict[str, Any]:
    """Create an allowlisted commercial-research packet with no prior anchors."""
    packet = {
        "candidateId": candidate.get("id") or candidate.get("candidateId"),
        "name": candidate.get("name"),
        "concept": candidate.get("oneSentenceConcept"),
        "category": candidate.get("category"),
        "problemHypothesis": candidate.get("problemStatement") or candidate.get("atAGlance", {}).get("problemSolved"),
        "buyerHypothesis": candidate.get("atAGlance", {}).get("targetCustomer") or candidate.get("targetCustomer"),
        "forcingFunctionFacts": candidate.get("forcingFunctionFacts", []),
        "questions": [
            "Who experiences the painful event and how often?",
            "Who controls the broken workflow and budget?",
            "What is spent today on software, labor, consulting, penalties, or delay?",
            "Which direct, incumbent, government, open-source, internal-build, and do-nothing alternatives exist?",
            "What representative data can be accessed before an MVP?",
            "What evidence would kill this thesis?",
        ],
    }
    return packet


def contains_blind_anchor(value: Any) -> bool:
    if isinstance(value, dict):
        for key, nested in value.items():
            normalized = re.sub(r"[^a-z0-9]", "", str(key).lower())
            if normalized in BLIND_SCORE_KEYS or contains_blind_anchor(nested):
                return True
    elif isinstance(value, list):
        return any(contains_blind_anchor(item) for item in value)
    elif isinstance(value, str):
        return bool(re.search(
            r"\b(rank(?:ed)?\s*#?\s*\d+|score\s*[:=]?\s*\d+|prior\s+verdict|"
            r"previous\s+rank|winner|top[- ]?pick|promotion\s+eligible)\b",
            value, flags=re.IGNORECASE,
        ))
    return False


def load_receipts() -> Dict[str, Any]:
    if not os.path.exists(RECEIPTS_PATH):
        return {"schemaVersion": "1.0.0", "receipts": []}
    with open(RECEIPTS_PATH, "r", encoding="utf-8") as handle:
        return json.load(handle)
