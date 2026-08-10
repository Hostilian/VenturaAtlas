import importlib
import os
import sys
import unittest


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(ROOT, "scripts")
if SCRIPTS not in sys.path:
    sys.path.insert(0, SCRIPTS)


generator = importlib.import_module("autonomous-idea-generator")
validator = importlib.import_module("va-validator")
ranker = importlib.import_module("va-ranker")
cohorts = importlib.import_module("migrate-epistemic-cohorts")


class TestEpistemicGates(unittest.TestCase):
    def test_model_claims_do_not_pass_discovery_checklist(self):
        result = generator.run_checklist({
            "startupCostMax": 0,
            "howItMakesMoney": "paid pilot before costs",
            "scores": {"problemSeverity": 10, "willingnessToPay": 10},
        })
        self.assertIsNone(result["scorePercentage"])
        self.assertEqual(result["passedCount"], 0)
        self.assertEqual(result["unknownCount"], 8)

    def test_model_scores_are_quarantined(self):
        result = generator.compute_composite_score(
            {"scores": {"problemSeverity": 10, "willingnessToPay": 10}},
            {"unknownCount": 0, "scorePercentage": 100},
        )
        self.assertIsNone(result["compositeHeadline"])
        self.assertEqual(result["scoreStatus"], "insufficient_evidence")

    def test_empty_candidate_is_blocked_not_validated(self):
        result = validator.validate_idea({"id": "candidate-empty", "name": "Empty"})
        self.assertEqual(result["verdict"], "BLOCKED")
        self.assertEqual(result["assessmentStatus"], "INSUFFICIENT_EVIDENCE")
        self.assertNotIn("validatedAt", result)
        self.assertIsNone(result["headlineScore"])

    def test_reference_count_does_not_promote_record_truth(self):
        idea = {"sourceReferences": ["src-public-1", "src-public-2"]}
        self.assertEqual(cohorts.assign_epistemic_truth_class(idea), "T4_UNKNOWN")

    def test_composite_headline_does_not_imply_full_coverage(self):
        score, coverage = ranker.compute_headline({
            "compositeScores": {"compositeHeadline": 92},
            "scores": {},
        })
        self.assertEqual(score, 92)
        self.assertEqual(coverage, 0)

    def test_urls_do_not_create_evidence_confidence(self):
        self.assertEqual(ranker.compute_evidence_confidence({
            "sourceReferences": ["https://example.test/a", "https://example.test/b"]
        }), 0)


if __name__ == "__main__":
    unittest.main()
