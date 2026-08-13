import importlib
import os
import sys
import unittest


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(ROOT, "scripts")
if SCRIPTS not in sys.path:
    sys.path.insert(0, SCRIPTS)

daemon = importlib.import_module("va-daemon-runner")


class TestDaemonSemanticUtility(unittest.TestCase):
    def test_same_content_has_no_material_delta(self):
        snapshot = {"canonicalIdeas": [{"id": "idea-1"}], "stagedIdeas": []}
        self.assertEqual(daemon._material_deltas(snapshot, snapshot), [])

    def test_staged_candidate_is_material(self):
        before = {"canonicalIdeas": [], "stagedIdeas": []}
        after = {"canonicalIdeas": [], "stagedIdeas": [{"id": "staged-1", "name": "New"}]}
        deltas = daemon._material_deltas(before, after)
        self.assertEqual([item["type"] for item in deltas], ["STAGING_CONTENT"])

    def test_telemetry_field_does_not_fake_material_change(self):
        before = {"canonicalIdeas": [], "stagedIdeas": [{"id": "staged-1", "updatedAt": "old"}]}
        after = {"canonicalIdeas": [], "stagedIdeas": [{"id": "staged-1", "updatedAt": "new"}]}
        self.assertEqual(daemon._material_deltas(before, after), [])


if __name__ == "__main__":
    unittest.main()
