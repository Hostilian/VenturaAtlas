"""Private staged-candidate commercial-research campaign receipts."""

from __future__ import annotations

import copy
import datetime as dt
import hashlib
import json
import re
from pathlib import Path
from typing import Any

from .atomic_io import atomic_write_json
from .blind_research import validate_blind_packet
from .lifecycle import blind_packet, idea_content_digest, sha256_json

CAMPAIGN_ID = re.compile(r"^commercial-[a-z0-9][a-z0-9-]{2,80}$")
PARTICIPANT_ID = re.compile(r"^participant-[a-z0-9][a-z0-9-]{2,80}$")
FINDINGS_KEYS = {
    "lastPainfulEvent", "currentWorkflow", "quantifiedCost", "budgetOwner",
    "budgetRange", "alternatives", "dataAccess", "purchaseProcess",
    "disconfirmations", "wtpEvidence", "claimsNotEarned",
}
WTP_EVIDENCE = {"NONE", "VERBAL_RANGE", "BUDGET_CONFIRMED", "PROCUREMENT_STEP"}


def _parse_time(value: str) -> dt.datetime:
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise ValueError("timestamps must be timezone-aware")
    return parsed


def _campaign_path(root: Path, campaign_id: str) -> Path:
    return root / "campaigns" / f"{campaign_id}.json"


def _packet_path(root: Path, campaign_id: str, candidate_id: str) -> Path:
    return root / "packets" / campaign_id / f"{candidate_id}.json"


def select_priority_candidates(queue: list[dict[str, Any]], limit: int | None = None) -> list[dict[str, Any]]:
    eligible = [
        item for item in queue
        if item.get("status") == "staged"
        and item.get("prioritizedForValidation") is True
        and item.get("requiresExternalEvidence") is True
        and item.get("promotionEligible") is False
    ]
    by_identity: dict[tuple[str, str], dict[str, Any]] = {}
    for item in eligible:
        identity = (
            re.sub(r"[^a-z0-9]", "", str(item.get("name", "")).lower()),
            re.sub(r"[^a-z0-9]", "", str(item.get("oneSentenceConcept", "")).lower()),
        )
        incumbent = by_identity.get(identity)
        if incumbent is None or float(item.get("priority") or 0) > float(incumbent.get("priority") or 0):
            by_identity[identity] = item
    ordered = sorted(
        by_identity.values(),
        key=lambda item: (-float(item.get("priority") or 0), str(item.get("createdAt") or ""), str(item.get("id") or "")),
    )
    if limit is not None:
        if limit < 1:
            raise ValueError("campaign limit must be positive")
        ordered = ordered[:limit]
    return ordered


def prepare_campaign(root: Path, *, campaign_id: str, queue: list[dict[str, Any]],
                     created_at: str, coordinator_id: str, limit: int | None = None) -> dict[str, Any]:
    if not CAMPAIGN_ID.fullmatch(campaign_id):
        raise ValueError("campaignId must match commercial-[a-z0-9-]+")
    if not coordinator_id.strip():
        raise ValueError("coordinator id is required")
    _parse_time(created_at)
    campaign_path = _campaign_path(root, campaign_id)
    if campaign_path.exists():
        raise ValueError("commercial campaign already exists and is immutable at preparation")
    selected = select_priority_candidates(queue, limit)
    if not selected:
        raise ValueError("no eligible private priority candidates")
    candidate_records = []
    for candidate in selected:
        candidate_id = str(candidate.get("candidateId") or candidate.get("id") or "")
        packet = blind_packet(candidate)
        validate_blind_packet(packet)
        packet.update({
            "campaignId": campaign_id,
            "candidateContentDigest": idea_content_digest(candidate),
            "researchStatus": "PLANNED_NOT_CONTACTED",
            "interviewQuestions": [
                "Describe the last concrete occurrence of this problem and its consequence.",
                "Show the current workflow, workaround, or incumbent product used.",
                "Who owns the budget and what purchase or approval step would be required?",
                "What was spent in money, labor, delay, penalties, or lost revenue on the last occurrence?",
                "Which representative data could be shared lawfully for a bounded test?",
                "What result would make this proposed solution irrelevant or unbuyable?",
            ],
            "evidenceBoundary": "Planning is not contact, interview, WTP, design-partner, payment, or validation evidence.",
        })
        packet_digest = sha256_json(packet)
        atomic_write_json(str(_packet_path(root, campaign_id, candidate_id)), packet)
        candidate_records.append({
            "candidateId": candidate_id,
            "candidateContentDigest": idea_content_digest(candidate),
            "packetDigest": packet_digest,
            "priority": candidate.get("priority"),
            "reviewPriority": candidate.get("reviewPriority"),
            "status": "PLANNED_NOT_CONTACTED",
        })
    campaign = {
        "schemaVersion": "1.0.0",
        "contract": "private-commercial-research-v1",
        "campaignId": campaign_id,
        "createdAt": created_at,
        "coordinatorId": coordinator_id,
        "queueDigest": sha256_json(queue),
        "candidateCount": len(candidate_records),
        "candidates": candidate_records,
        "events": [],
        "status": "PLANNED_NOT_CONTACTED",
        "completionClaim": False,
    }
    atomic_write_json(str(campaign_path), campaign)
    return campaign


def _evidence_digest(evidence: bytes) -> str:
    if not evidence:
        raise ValueError("non-empty external evidence bytes are required")
    return hashlib.sha256(evidence).hexdigest()


def _load_campaign(root: Path, campaign_id: str) -> tuple[Path, dict[str, Any]]:
    path = _campaign_path(root, campaign_id)
    return path, json.loads(path.read_text(encoding="utf-8"))


def record_contact(root: Path, *, campaign_id: str, candidate_id: str,
                   channel: str, occurred_at: str, evidence: bytes,
                   evidence_label: str) -> dict[str, Any]:
    path, campaign = _load_campaign(root, campaign_id)
    candidate = next((item for item in campaign["candidates"] if item["candidateId"] == candidate_id), None)
    if not candidate:
        raise ValueError("candidate is outside this campaign")
    if channel not in {"EMAIL", "PHONE", "IN_PERSON", "FORM", "REFERRAL", "OTHER"}:
        raise ValueError("unsupported contact channel")
    occurred = _parse_time(occurred_at)
    if occurred <= _parse_time(campaign["createdAt"]):
        raise ValueError("contact must occur after campaign preparation")
    digest = _evidence_digest(evidence)
    if any(event.get("evidenceDigest") == digest for event in campaign["events"]):
        raise ValueError("external evidence digest has already been used")
    event = {
        "eventId": f"contact-{candidate_id}-{len(campaign['events']) + 1:04d}",
        "eventType": "CONTACT_RECORDED",
        "candidateId": candidate_id,
        "occurredAt": occurred_at,
        "channel": channel,
        "evidenceLabel": evidence_label,
        "evidenceDigest": digest,
        "claim": "CONTACT_ATTEMPT_EVIDENCED_NOT_INTERVIEWED",
    }
    campaign["events"].append(event)
    candidate["status"] = "CONTACT_EVIDENCE_RECORDED"
    campaign["status"] = "IN_PROGRESS"
    atomic_write_json(str(path), campaign)
    return event


def validate_interview_findings(findings: dict[str, Any]) -> None:
    if set(findings) != FINDINGS_KEYS:
        raise ValueError(f"interview findings keys must equal {sorted(FINDINGS_KEYS)}")
    for key in ["lastPainfulEvent", "currentWorkflow", "quantifiedCost", "budgetOwner", "budgetRange", "dataAccess", "purchaseProcess"]:
        if not isinstance(findings[key], str) or not findings[key].strip():
            raise ValueError(f"{key} must be a non-empty string; use UNKNOWN when not established")
    for key in ["alternatives", "disconfirmations", "claimsNotEarned"]:
        if not isinstance(findings[key], list):
            raise ValueError(f"{key} must be a list")
    if findings["wtpEvidence"] not in WTP_EVIDENCE:
        raise ValueError(f"wtpEvidence must be one of {sorted(WTP_EVIDENCE)}")


def record_interview(root: Path, *, campaign_id: str, candidate_id: str,
                     participant_id: str, buyer_role: str, started_at: str,
                     ended_at: str, consent_confirmed: bool,
                     evidence: bytes, evidence_label: str,
                     findings: dict[str, Any]) -> dict[str, Any]:
    path, campaign = _load_campaign(root, campaign_id)
    candidate = next((item for item in campaign["candidates"] if item["candidateId"] == candidate_id), None)
    if not candidate:
        raise ValueError("candidate is outside this campaign")
    if not any(event["candidateId"] == candidate_id and event["eventType"] == "CONTACT_RECORDED" for event in campaign["events"]):
        raise ValueError("a digest-bound contact record is required before interview evidence")
    if not PARTICIPANT_ID.fullmatch(participant_id):
        raise ValueError("participantId must be a non-identifying participant-[a-z0-9-]+ value")
    if not buyer_role.strip() or consent_confirmed is not True:
        raise ValueError("buyer role and confirmed consent are required")
    started, ended = _parse_time(started_at), _parse_time(ended_at)
    if started <= _parse_time(campaign["createdAt"]) or ended <= started:
        raise ValueError("interview timestamps are out of order")
    validate_interview_findings(findings)
    digest = _evidence_digest(evidence)
    if any(event.get("evidenceDigest") == digest for event in campaign["events"]):
        raise ValueError("external evidence digest has already been used")
    record = {
        "eventId": f"interview-{candidate_id}-{len(campaign['events']) + 1:04d}",
        "eventType": "INTERVIEW_EVIDENCE_RECORDED",
        "candidateId": candidate_id,
        "participantId": participant_id,
        "buyerRole": buyer_role,
        "startedAt": started_at,
        "endedAt": ended_at,
        "consentConfirmed": True,
        "evidenceLabel": evidence_label,
        "evidenceDigest": digest,
        "findings": copy.deepcopy(findings),
        "claimsNotEarned": ["paid pilot", "repeat payment", "validated market"],
    }
    record["eventDigest"] = sha256_json(record)
    campaign["events"].append(record)
    candidate["status"] = "INTERVIEW_EVIDENCE_RECORDED"
    campaign["status"] = "EXTERNAL_EVIDENCE_PARTIAL"
    atomic_write_json(str(path), campaign)
    return record


def campaign_summary(campaign: dict[str, Any]) -> dict[str, Any]:
    contacts = [event for event in campaign["events"] if event["eventType"] == "CONTACT_RECORDED"]
    interviews = [event for event in campaign["events"] if event["eventType"] == "INTERVIEW_EVIDENCE_RECORDED"]
    return {
        "candidateCount": campaign["candidateCount"],
        "contactEvidenceCount": len(contacts),
        "interviewEvidenceCount": len(interviews),
        "candidatesWithInterviewEvidence": len({event["candidateId"] for event in interviews}),
        "completionClaim": False,
    }
