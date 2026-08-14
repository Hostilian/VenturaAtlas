import copy
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from va_runtime.anchoring_experiment import finalize_experiment, lock_response, prepare_experiment
from va_runtime.lifecycle import idea_content_digest
from va_runtime.preregistration import preregistration_digest


def subject(number, expected="LIKELY_WAIT"):
    idea = {
        "id": f"idea-{number:03d}", "name": f"Candidate {number}",
        "oneSentenceConcept": "Bounded evidence workflow", "category": "AI",
        "problemStatement": "Unverified decision", "atAGlance": {"targetCustomer": "Owner"},
        "forcingFunctionFacts": [],
    }
    prereg = {
        "schemaVersion": "1.0.0", "preregistrationId": f"prereg-{number}",
        "candidateId": idea["id"], "candidateContentDigest": idea_content_digest(idea),
        "createdAt": "2026-08-14T08:00:00Z", "lockedAt": "2026-08-14T08:01:00Z",
        "expectations": {"verdict": expected},
        "author": {"id": "preregistering-agent", "role": "research-agent"},
        "digestContract": "research-prereg-v1",
    }
    prereg["digest"] = preregistration_digest(prereg)
    return idea, prereg


def response(verdict, probability):
    return {
        "verdict": verdict, "proceedProbability": probability,
        "buyerEvidence": "No buyer claim beyond supplied evidence",
        "budgetEvidence": "No budget claim beyond supplied evidence",
        "disconfirmations": ["Incumbent alternative"], "sourceRefs": ["s284"],
        "claimsNotEarned": ["causal anchoring", "customer validation"],
    }


class TestAnchoringExperiment(unittest.TestCase):
    def test_paired_randomization_locks_and_measures_without_causal_claim(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            subjects = [subject(1), subject(2)]
            reviewers = ["reviewer-a", "reviewer-b", "reviewer-c", "reviewer-d"]
            plan = prepare_experiment(
                root, experiment_id="anchor-paired-001", subjects=subjects,
                reviewer_ids=reviewers, seed="correct-horse-battery-staple",
                created_at="2026-08-14T09:00:00Z", minimum_pairs=2,
            )
            self.assertEqual({item["arm"] for item in plan["assignments"]}, {"BLIND", "INFORMED"})
            for assignment in plan["assignments"]:
                packet = (root / "packets" / "anchor-paired-001" / f"{assignment['assignmentId']}.json").read_text(encoding="utf-8")
                if assignment["arm"] == "BLIND":
                    self.assertNotIn("priorEvaluation", packet)
                else:
                    self.assertIn("priorEvaluation", packet)
                verdict = "WAIT" if assignment["arm"] == "INFORMED" else "KILL"
                lock_response(
                    root, experiment_id="anchor-paired-001", assignment_id=assignment["assignmentId"],
                    reviewer_id=assignment["reviewerId"], response=response(verdict, 50),
                    locked_at="2026-08-14T10:00:00Z",
                )
            result = finalize_experiment(
                root, experiment_id="anchor-paired-001", seed="correct-horse-battery-staple",
                finalized_at="2026-08-14T11:00:00Z",
            )
            self.assertEqual(result["measurementStatus"], "MEASURED_DESCRIPTIVE")
            self.assertGreater(result["anchoringDelta"], 0)
            self.assertIn("not causal proof", result["interpretation"])

    def test_wrong_seed_missing_response_and_duplicate_reviewer_fail_closed(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            with self.assertRaisesRegex(ValueError, "unique reviewers"):
                prepare_experiment(
                    root, experiment_id="anchor-bad-roster", subjects=[subject(1)],
                    reviewer_ids=["same", "same"], seed="correct-horse-battery-staple",
                    created_at="2026-08-14T09:00:00Z", minimum_pairs=2,
                )
            prepare_experiment(
                root, experiment_id="anchor-missing-response", subjects=[subject(1)],
                reviewer_ids=["reviewer-a", "reviewer-b"], seed="correct-horse-battery-staple",
                created_at="2026-08-14T09:00:00Z", minimum_pairs=2,
            )
            with self.assertRaisesRegex(ValueError, "seed does not match"):
                finalize_experiment(
                    root, experiment_id="anchor-missing-response", seed="wrong-seed-is-long-enough",
                    finalized_at="2026-08-14T11:00:00Z",
                )
            with self.assertRaisesRegex(ValueError, "missing locked response"):
                finalize_experiment(
                    root, experiment_id="anchor-missing-response", seed="correct-horse-battery-staple",
                    finalized_at="2026-08-14T11:00:00Z",
                )

    def test_tampered_packet_or_response_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            plan = prepare_experiment(
                root, experiment_id="anchor-tamper-001", subjects=[subject(1)],
                reviewer_ids=["reviewer-a", "reviewer-b"], seed="correct-horse-battery-staple",
                created_at="2026-08-14T09:00:00Z", minimum_pairs=2,
            )
            assignment = plan["assignments"][0]
            packet_path = root / "packets" / "anchor-tamper-001" / f"{assignment['assignmentId']}.json"
            original = packet_path.read_text(encoding="utf-8")
            packet_path.write_text(original.replace("Candidate 1", "Tampered"), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "packet digest mismatch"):
                lock_response(
                    root, experiment_id="anchor-tamper-001", assignment_id=assignment["assignmentId"],
                    reviewer_id=assignment["reviewerId"], response=response("WAIT", 50),
                    locked_at="2026-08-14T10:00:00Z",
                )

    def test_preregistering_author_cannot_be_reviewer(self):
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaisesRegex(ValueError, "independent"):
                prepare_experiment(
                    Path(temp), experiment_id="anchor-author-001", subjects=[subject(1)],
                    reviewer_ids=["preregistering-agent", "reviewer-b"],
                    seed="correct-horse-battery-staple", created_at="2026-08-14T09:00:00Z",
                    minimum_pairs=2,
                )

    def test_duplicate_candidate_and_tampered_plan_fail_closed(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            with self.assertRaisesRegex(ValueError, "unique"):
                prepare_experiment(
                    root, experiment_id="anchor-duplicate-001", subjects=[subject(1), subject(1)],
                    reviewer_ids=["reviewer-a", "reviewer-b", "reviewer-c", "reviewer-d"],
                    seed="correct-horse-battery-staple", created_at="2026-08-14T09:00:00Z",
                    minimum_pairs=2,
                )
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            plan = prepare_experiment(
                root, experiment_id="anchor-plan-tamper", subjects=[subject(1)],
                reviewer_ids=["reviewer-a", "reviewer-b"], seed="correct-horse-battery-staple",
                created_at="2026-08-14T09:00:00Z", minimum_pairs=2,
            )
            plan_path = root / "experiments" / "anchor-plan-tamper.json"
            tampered = json.loads(plan_path.read_text(encoding="utf-8"))
            tampered["assignments"][0]["arm"] = "INFORMED"
            plan_path.write_text(json.dumps(tampered), encoding="utf-8")
            assignment = plan["assignments"][0]
            with self.assertRaisesRegex(ValueError, "plan digest mismatch"):
                lock_response(
                    root, experiment_id="anchor-plan-tamper", assignment_id=assignment["assignmentId"],
                    reviewer_id=assignment["reviewerId"], response=response("WAIT", 50),
                    locked_at="2026-08-14T10:00:00Z",
                )


if __name__ == "__main__":
    unittest.main()
