import os
import sys
import unittest


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(ROOT, "scripts")
if SCRIPTS not in sys.path:
    sys.path.insert(0, SCRIPTS)

from va_runtime.semantic_utility import classify_iteration, mutation_receipt, semantic_digest


class TestSemanticUtility(unittest.TestCase):
    def test_telemetry_only_change_is_no_op(self):
        before = {"ideas": ["a"], "lastRunAt": "2026-01-01", "totalCalls": 2}
        after = {"ideas": ["a"], "lastRunAt": "2026-02-01", "totalCalls": 99}
        self.assertEqual(semantic_digest(before), semantic_digest(after))
        self.assertEqual(classify_iteration(before, after, []), "NO_OP")

    def test_material_change_requires_semantic_delta(self):
        before = {"ideas": ["a"]}
        after = {"ideas": ["a", "b"]}
        changes = [{"type": "CANDIDATE_ADDED", "id": "b"}]
        self.assertEqual(classify_iteration(before, after, changes), "MATERIAL_CHANGE")

    def test_claimed_material_change_without_delta_is_no_op(self):
        value = {"ideas": ["a"]}
        self.assertEqual(classify_iteration(value, value, [{"type": "CANDIDATE_ADDED"}]), "NO_OP")

    def test_receipt_separates_material_and_telemetry(self):
        receipt = mutation_receipt(
            "run-test", "abc1234", {"ideas": ["a"]}, {"ideas": ["a"]}, [],
            [{"type": "PROVIDER_COUNTER"}], "2026-01-01T00:00:00Z", "2026-01-01T00:00:01Z",
        )
        self.assertEqual(receipt["result"], "NO_OP")
        self.assertEqual(receipt["materialChanges"], [])
        self.assertEqual(len(receipt["telemetryChanges"]), 1)


if __name__ == "__main__":
    unittest.main()
