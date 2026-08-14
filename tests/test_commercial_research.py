import json
import os
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from va_runtime.commercial_research import (
    campaign_summary, prepare_campaign, record_contact, record_interview,
    select_priority_candidates,
)


def candidate(number, priority=100, *, prioritized=True):
    return {
        "schemaVersion": "2.0.0",
        "id": f"candidate-00000000-0000-0000-0000-{number:012d}",
        "candidateId": f"candidate-00000000-0000-0000-0000-{number:012d}",
        "name": f"Candidate {number}", "oneSentenceConcept": f"Evidence workflow {number}",
        "category": "AI", "status": "staged", "prioritizedForValidation": prioritized,
        "requiresExternalEvidence": True, "promotionEligible": False,
        "priority": priority, "reviewPriority": "high",
        "createdAt": f"2026-08-0{number}T08:00:00Z",
        "atAGlance": {"targetCustomer": "Operations owner", "problemSolved": "Broken workflow"},
    }


def findings(wtp="NONE"):
    return {
        "lastPainfulEvent": "UNKNOWN", "currentWorkflow": "Spreadsheet and email",
        "quantifiedCost": "UNKNOWN", "budgetOwner": "Operations director",
        "budgetRange": "UNKNOWN", "alternatives": ["Do nothing"],
        "dataAccess": "Representative sample requires buyer approval",
        "purchaseProcess": "Security and procurement review",
        "disconfirmations": ["Low event frequency"], "wtpEvidence": wtp,
        "claimsNotEarned": ["paid pilot", "validated market"],
    }


class TestCommercialResearch(unittest.TestCase):
    def test_selection_and_preparation_are_priority_bounded_and_claim_nothing(self):
        queue = [candidate(1, 90), candidate(2, 100), candidate(3, 95, prioritized=False)]
        selected = select_priority_candidates(queue)
        self.assertEqual([item["name"] for item in selected], ["Candidate 2", "Candidate 1"])
        with tempfile.TemporaryDirectory() as temp:
            campaign = prepare_campaign(
                Path(temp), campaign_id="commercial-priority-001", queue=queue,
                created_at="2026-08-14T09:00:00Z", coordinator_id="owner",
            )
            summary = campaign_summary(campaign)
            self.assertEqual(summary["candidateCount"], 2)
            self.assertEqual(summary["contactEvidenceCount"], 0)
            self.assertEqual(summary["interviewEvidenceCount"], 0)
            self.assertFalse(summary["completionClaim"])
            packet = json.loads(next((Path(temp) / "packets" / "commercial-priority-001").glob("*.json")).read_text(encoding="utf-8"))
            self.assertEqual(packet["researchStatus"], "PLANNED_NOT_CONTACTED")
            self.assertNotIn("priority", packet)
            self.assertNotIn("reviewPriority", packet)

    def test_digest_bound_contact_then_interview_records_real_evidence_boundary(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            item = candidate(1)
            prepare_campaign(
                root, campaign_id="commercial-evidence-001", queue=[item],
                created_at="2026-08-14T09:00:00Z", coordinator_id="owner",
            )
            contact = record_contact(
                root, campaign_id="commercial-evidence-001", candidate_id=item["id"],
                channel="EMAIL", occurred_at="2026-08-14T10:00:00Z",
                evidence=b"delivery export", evidence_label="redacted delivery receipt",
            )
            self.assertEqual(contact["claim"], "CONTACT_ATTEMPT_EVIDENCED_NOT_INTERVIEWED")
            interview = record_interview(
                root, campaign_id="commercial-evidence-001", candidate_id=item["id"],
                participant_id="participant-buyer-001", buyer_role="Operations director",
                started_at="2026-08-14T11:00:00Z", ended_at="2026-08-14T11:30:00Z",
                consent_confirmed=True, evidence=b"redacted interview notes",
                evidence_label="consented redacted notes", findings=findings("VERBAL_RANGE"),
            )
            self.assertEqual(interview["findings"]["wtpEvidence"], "VERBAL_RANGE")
            campaign = json.loads((root / "campaigns" / "commercial-evidence-001.json").read_text(encoding="utf-8"))
            self.assertEqual(campaign_summary(campaign)["interviewEvidenceCount"], 1)
            self.assertIn("validated market", interview["claimsNotEarned"])

    def test_interview_without_contact_consent_or_evidence_fails_closed(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            item = candidate(1)
            prepare_campaign(
                root, campaign_id="commercial-fail-001", queue=[item],
                created_at="2026-08-14T09:00:00Z", coordinator_id="owner",
            )
            with self.assertRaisesRegex(ValueError, "contact record"):
                record_interview(
                    root, campaign_id="commercial-fail-001", candidate_id=item["id"],
                    participant_id="participant-buyer-001", buyer_role="Owner",
                    started_at="2026-08-14T11:00:00Z", ended_at="2026-08-14T11:30:00Z",
                    consent_confirmed=True, evidence=b"notes", evidence_label="notes",
                    findings=findings(),
                )
            with self.assertRaisesRegex(ValueError, "non-empty external evidence"):
                record_contact(
                    root, campaign_id="commercial-fail-001", candidate_id=item["id"],
                    channel="EMAIL", occurred_at="2026-08-14T10:00:00Z",
                    evidence=b"", evidence_label="missing",
                )

    def test_evidence_digest_replay_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            item = candidate(1)
            prepare_campaign(
                root, campaign_id="commercial-replay-001", queue=[item],
                created_at="2026-08-14T09:00:00Z", coordinator_id="owner",
            )
            record_contact(
                root, campaign_id="commercial-replay-001", candidate_id=item["id"],
                channel="EMAIL", occurred_at="2026-08-14T10:00:00Z",
                evidence=b"same evidence", evidence_label="receipt",
            )
            with self.assertRaisesRegex(ValueError, "already been used"):
                record_contact(
                    root, campaign_id="commercial-replay-001", candidate_id=item["id"],
                    channel="EMAIL", occurred_at="2026-08-14T10:01:00Z",
                    evidence=b"same evidence", evidence_label="replay",
                )


if __name__ == "__main__":
    unittest.main()
