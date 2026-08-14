import json
import os
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from va_runtime.blind_research import lock_findings, prepare_assignment, unblind_assignment
from va_runtime.lifecycle import idea_content_digest
from va_runtime.preregistration import preregistration_digest


class TestBlindResearch(unittest.TestCase):
    def setUp(self):
        self.idea = {
            "id": "idea-001", "name": "ProofRail", "oneSentenceConcept": "Evidence gate",
            "category": "AI", "problemStatement": "Unverified releases",
            "atAGlance": {"targetCustomer": "Release owner"}, "forcingFunctionFacts": [],
        }
        self.prereg = {
            "schemaVersion": "1.0.0", "preregistrationId": "prereg-idea-001-test",
            "candidateId": "idea-001", "candidateContentDigest": idea_content_digest(self.idea),
            "createdAt": "2026-08-14T09:00:00Z", "lockedAt": "2026-08-14T09:01:00Z",
            "expectations": {"buyer": "owner", "pain": "pain", "strongestIncumbent": "CI",
                             "willingnessToPayMaturity": "ASSUMED", "biggestRisk": "absorbed", "verdict": "LIKELY_WAIT"},
            "author": {"id": "preregistering-agent", "role": "research-agent"},
            "digestContract": "research-prereg-v1",
        }
        self.prereg["digest"] = preregistration_digest(self.prereg)
        self.findings = {
            "buyerEvidence": "No buyer contacted", "painEvidence": "Desk evidence only",
            "budgetEvidence": "No budget evidence", "alternatives": ["CI"],
            "dataAccess": "No protected data", "disconfirmations": ["Incumbent bundle"],
            "verdict": "WAIT", "sourceRefs": ["s284"],
            "claimsNotEarned": ["customer interview", "WTP"],
        }

    def test_prepare_lock_and_unblind_preserve_order_and_packet_blinding(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            packet, receipt = prepare_assignment(
                root, assignment_id="blind-proofrail-001", idea=self.idea,
                preregistration=self.prereg, investigator_id="independent-investigator",
                created_at="2026-08-14T10:00:00Z",
            )
            serialized = json.dumps(packet).lower()
            self.assertNotIn("preregistration", serialized)
            self.assertNotIn("priorverdict", serialized)
            self.assertEqual(receipt["status"], "PREPARED")
            receipt = lock_findings(
                root, assignment_id="blind-proofrail-001", findings=self.findings,
                findings_locked_at="2026-08-14T11:00:00Z",
            )
            self.assertEqual(receipt["status"], "FINDINGS_LOCKED")
            comparison = unblind_assignment(
                root, assignment_id="blind-proofrail-001", preregistration=self.prereg,
                unblinded_at="2026-08-14T11:01:00Z",
            )
            self.assertFalse(comparison["verdictChanged"])
            self.assertEqual(comparison["anchoringMeasurement"], "NOT_MEASURED_SINGLE_BLIND_ASSIGNMENT")

    def test_same_investigator_as_preregistering_author_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaisesRegex(ValueError, "must differ"):
                prepare_assignment(
                    Path(temp), assignment_id="blind-proofrail-002", idea=self.idea,
                    preregistration=self.prereg, investigator_id="preregistering-agent",
                    created_at="2026-08-14T10:00:00Z",
                )

    def test_prior_anchor_in_findings_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            prepare_assignment(
                root, assignment_id="blind-proofrail-003", idea=self.idea,
                preregistration=self.prereg, investigator_id="independent-investigator",
                created_at="2026-08-14T10:00:00Z",
            )
            tainted = dict(self.findings)
            tainted["painEvidence"] = "prior verdict was winner"
            with self.assertRaisesRegex(ValueError, "anchor"):
                lock_findings(
                    root, assignment_id="blind-proofrail-003", findings=tainted,
                    findings_locked_at="2026-08-14T11:00:00Z",
                )

    def test_unblind_before_findings_lock_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            prepare_assignment(
                root, assignment_id="blind-proofrail-004", idea=self.idea,
                preregistration=self.prereg, investigator_id="independent-investigator",
                created_at="2026-08-14T10:00:00Z",
            )
            with self.assertRaisesRegex(ValueError, "locked before"):
                unblind_assignment(
                    root, assignment_id="blind-proofrail-004", preregistration=self.prereg,
                    unblinded_at="2026-08-14T11:01:00Z",
                )

    def test_tampered_findings_cannot_unblind(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            prepare_assignment(
                root, assignment_id="blind-proofrail-005", idea=self.idea,
                preregistration=self.prereg, investigator_id="independent-investigator",
                created_at="2026-08-14T10:00:00Z",
            )
            lock_findings(
                root, assignment_id="blind-proofrail-005", findings=self.findings,
                findings_locked_at="2026-08-14T11:00:00Z",
            )
            findings_path = root / "findings" / "blind-proofrail-005.json"
            record = json.loads(findings_path.read_text(encoding="utf-8"))
            record["findings"]["verdict"] = "CONTINUE"
            findings_path.write_text(json.dumps(record), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "digest mismatch"):
                unblind_assignment(
                    root, assignment_id="blind-proofrail-005", preregistration=self.prereg,
                    unblinded_at="2026-08-14T11:01:00Z",
                )


if __name__ == "__main__":
    unittest.main()
