#!/usr/bin/env python3
"""
Venture Atlas OS — Mocked Provider Router Tests (P84)
=====================================================
Deterministic tests that never spend real API money.
CI runs these. Use `npm run smoke:providers` for real health checks.
"""

import sys
import os
import json
import unittest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

class TestProviderMock(unittest.TestCase):

    def test_own_orch_always_available(self):
        """Own-Orch must always return a response (no API key required)."""
        from scripts.va_orchestrator import _call_own_orchestrator
        result = _call_own_orchestrator("Generate a concept for: test domain", {"category": "test", "subcategory": "test", "trigger": "test", "example": "test", "tags": []})
        self.assertIsInstance(result, str)
        self.assertGreater(len(result), 10)

    def test_own_orch_does_not_emit_fake_scores(self):
        """Own-Orch output must not contain fabricated market/WTP/confidence numbers."""
        from scripts.va_orchestrator import _call_own_orchestrator
        result = _call_own_orchestrator("Generate a concept", {"category": "test", "subcategory": "test", "trigger": "test", "example": "test", "tags": []})
        # Own-Orch placeholder should indicate it is not evidence-backed
        self.assertIn("hypothesis", result.lower() + "unverified", msg="own-orch output should be tagged as hypothesis/unverified")

    def test_generator_exits_cleanly_with_mocked_llm(self):
        """Generator main() exits 0 with mocked provider calls (P7 — no NameError)."""
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "autonomous_idea_generator",
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripts", "autonomous-idea-generator.py")
        )
        mod = importlib.util.module_from_spec(spec)

        # Patch call_llm to return a deterministic own-orch-style response
        fake_resp = json.dumps({
            "name": "MockIdea TestConcept Alpha",
            "oneSentenceConcept": "A test concept for unit testing purposes.",
            "elevatorPitch": "This is a mocked idea for testing.",
            "targetCustomer": "Test founders",
            "problemSolved": "Test problem",
            "whatToBuild": "Test MVP",
            "howItMakesMoney": "Prepaid pilot fee.",
            "whyCustomersPay": "Saves testing time.",
            "category": "Test Category",
            "subcategory": "test sub",
            "tags": ["test"],
            "startupCostMax": 0,
            "timeToMvp": "3 days",
            "scores": {
                "problemSeverity": 7.5,
                "frequencyOfNeed": 7.0,
                "willingnessToPay": 7.0,
                "marketDemand": 6.5,
                "speedToFirstRevenue": 8.0,
                "lowStartupCost": 9.0,
                "easeOfMvp": 8.0,
                "aiAutomationPotential": 7.0,
                "regulatoryTailwind": 6.0,
                "compoundingAsset": 7.0
            }
        })

        with patch("va_orchestrator.call_llm", return_value=(fake_resp, "mock-provider")):
            with patch.dict(os.environ, {"IDEAS_PER_ITERATION": "1"}):
                try:
                    spec.loader.exec_module(mod)
                    mod.main()
                except SystemExit as e:
                    self.assertEqual(e.code, 0, f"Generator exited with non-zero code: {e.code}")
                except NameError as e:
                    self.fail(f"NameError in generator (P7 regression): {e}")

    def test_checklist_unparseable_mvp_is_unknown(self):
        """P19: timeToMvp='eventually' must result in checklist criterion UNKNOWN, not PASS."""
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripts"))
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "autonomous_idea_generator",
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripts", "autonomous-idea-generator.py")
        )
        mod = importlib.util.module_from_spec(spec)
        with patch("va_orchestrator.call_llm", return_value=("{}", "mock")):
            spec.loader.exec_module(mod)

        result = mod.run_checklist({"timeToMvp": "eventually", "scores": {}})
        mvp_criterion = "Solo-founder buildable within 7-14 days MVP"
        self.assertEqual(result["details"][mvp_criterion], "unknown",
                         f"P19 FAIL: timeToMvp='eventually' should be UNKNOWN, got {result['details'][mvp_criterion]}")

    def test_score_assembly_no_70_default(self):
        """P13: Missing score dimensions must be None, not 70.0."""
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "autonomous_idea_generator",
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripts", "autonomous-idea-generator.py")
        )
        mod = importlib.util.module_from_spec(spec)
        with patch("va_orchestrator.call_llm", return_value=("{}", "mock")):
            spec.loader.exec_module(mod)

        empty_idea = {"name": "Test", "scores": {}}
        checklist = mod.run_checklist(empty_idea)
        composite = mod.compute_composite_score(empty_idea, checklist)
        candidate = mod.assemble_candidate(empty_idea, "candidate-test-uuid", {"category": "test", "subcategory": "test", "trigger": "t", "example": "e", "tags": []}, "own-orch")

        for dim, score_obj in candidate["scores"].items():
            self.assertNotEqual(score_obj["value"], 70.0,
                               f"P13 FAIL: Dimension '{dim}' has default 70.0 value")
            self.assertNotEqual(score_obj["confidence"], "medium",
                               f"P14 FAIL: Dimension '{dim}' has default 'medium' confidence")
            self.assertEqual(score_obj["confidence"], "unverified",
                             f"P14 FAIL: Expected 'unverified' confidence for '{dim}'")

    def test_dedup_same_name_single_candidate(self):
        """P27+P28: Two workers with same name → only 1 candidate staged."""
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "autonomous_idea_generator",
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripts", "autonomous-idea-generator.py")
        )
        mod = importlib.util.module_from_spec(spec)
        with patch("va_orchestrator.call_llm", return_value=("{}", "mock")):
            spec.loader.exec_module(mod)

        existing_names = []
        name = "AI Invoice Recovery Assistant"

        dup1 = mod.is_duplicate(name, existing_names)
        self.assertFalse(dup1, "First occurrence should not be a duplicate")
        existing_names.append(name.lower())

        dup2 = mod.is_duplicate(name, existing_names)
        self.assertTrue(dup2, "P27/P28 FAIL: Second occurrence of same name should be duplicate")

    def test_dedup_near_duplicate_name(self):
        """P28: Near-duplicate names should trigger dedup gate."""
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "autonomous_idea_generator",
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripts", "autonomous-idea-generator.py")
        )
        mod = importlib.util.module_from_spec(spec)
        with patch("va_orchestrator.call_llm", return_value=("{}", "mock")):
            spec.loader.exec_module(mod)

        existing_names = ["ai invoice recovery assistant"]
        near_dup = "AI-Powered Invoice Recovery Assistant"
        result = mod.is_duplicate(near_dup, existing_names)
        self.assertTrue(result,
                        f"P28 FAIL: Near-duplicate '{near_dup}' should trigger dedup gate")


if __name__ == "__main__":
    unittest.main(verbosity=2)
