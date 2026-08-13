"""Serialized semantic-review issuance bound to configured reviewer authority."""

from __future__ import annotations

import datetime as dt
import os
import re
import uuid
from typing import Any, Dict, Iterable

from .atomic_io import atomic_write_json, read_json_safe
from .lifecycle import candidate_digest, corpus_revision
from .process_lock import process_file_lock


ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REVIEWS_PATH = os.path.join(ROOT, "data", "semantic-reviews.json")
AUTHORITIES_PATH = os.path.join(ROOT, "data", "reviewer-authorities.json")
IDEAS_PATH = os.path.join(ROOT, "data", "ideas.json")
REVIEW_LOCK_PATH = os.path.join(ROOT, ".agent-state", "locks", "semantic-review.lock")
DECISIONS = {"DISTINCT", "DUPLICATE", "FEATURE_OF_EXISTING", "UNRESOLVED"}


class SemanticReviewIssuanceError(ValueError):
    pass


def _ideas() -> list[dict]:
    raw = read_json_safe(IDEAS_PATH, default_if_missing={"ideas": []})
    return raw.get("ideas", []) if isinstance(raw, dict) else raw


def _active_authority(reviewer_id: str) -> dict:
    document = read_json_safe(AUTHORITIES_PATH, default_if_missing={"authorities": []})
    matches = [item for item in document.get("authorities", []) if item.get("id") == reviewer_id and item.get("active") is True]
    if len(matches) != 1:
        raise SemanticReviewIssuanceError("reviewer is not exactly one active configured authority")
    return {"id": matches[0]["id"], "role": matches[0]["role"]}


def issue_semantic_review(candidate: Dict[str, Any], reviewer_id: str, decision: str,
                          nearest_idea_ids: Iterable[str]) -> Dict[str, Any]:
    if not str(candidate.get("id") or candidate.get("candidateId") or "").startswith("candidate-"):
        raise SemanticReviewIssuanceError("semantic review subject must have a candidate-* identity")
    if decision not in DECISIONS:
        raise SemanticReviewIssuanceError(f"unsupported semantic decision: {decision}")
    nearest = list(dict.fromkeys(nearest_idea_ids))
    if any(not re.fullmatch(r"idea-[0-9]{3}", item) for item in nearest):
        raise SemanticReviewIssuanceError("nearest idea IDs must use canonical idea-NNN form")

    with process_file_lock(REVIEW_LOCK_PATH, timeout_seconds=15):
        authority = _active_authority(reviewer_id)
        ideas = _ideas()
        known = {item.get("id") for item in ideas}
        unknown = sorted(set(nearest) - known)
        if unknown:
            raise SemanticReviewIssuanceError(f"nearest idea IDs do not resolve: {unknown}")
        document = read_json_safe(REVIEWS_PATH, default_if_missing={"schemaVersion": "1.0.0", "reviews": []})
        subject_id = str(candidate.get("id") or candidate.get("candidateId"))
        subject_digest = candidate_digest(candidate)
        revision = corpus_revision(ideas)
        existing = next((item for item in document.get("reviews", [])
                         if item.get("candidateId") == subject_id and item.get("candidateDigest") == subject_digest
                         and item.get("corpusRevision") == revision), None)
        if existing:
            raise SemanticReviewIssuanceError(f"review already exists for this candidate and corpus: {existing.get('semanticReviewId')}")
        review = {
            "semanticReviewId": f"semantic-{uuid.uuid4().hex}",
            "candidateId": subject_id,
            "candidateDigest": subject_digest,
            "corpusRevision": revision,
            "nearestIdeaIds": nearest,
            "decision": decision,
            "reviewer": authority,
            "reviewedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        }
        document.setdefault("reviews", []).append(review)
        atomic_write_json(REVIEWS_PATH, document)
        return review
