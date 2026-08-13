import importlib
import json
import os
import sys
import tempfile
import unittest
from unittest import mock


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(ROOT, "scripts")
if SCRIPTS not in sys.path:
    sys.path.insert(0, SCRIPTS)

ranker = importlib.import_module("va-ranker")


class TestRankerSemanticHistory(unittest.TestCase):
    def fixture(self):
        return [
            {
                "id": "idea-ineligible", "name": "Ineligible", "category": "Test", "status": "explore",
                "compositeScores": {"compositeHeadline": 100},
                "rankingEligibility": {"eligible": False},
            },
            {
                "id": "idea-eligible", "name": "Eligible", "category": "Test", "status": "explore",
                "compositeScores": {"compositeHeadline": 50},
                "rankingEligibility": {"eligible": True},
            },
        ]

    def test_eligible_universe_excludes_ineligible_high_score(self):
        ideas = self.fixture()
        ranked = ranker.rank_ideas(ideas, eligible_ids={"idea-eligible"})
        with tempfile.TemporaryDirectory() as directory:
            path = os.path.join(directory, "rankings.json")
            with mock.patch.object(ranker, "RANKINGS_PATH", path):
                ranker.update_rankings_json(ranked, ideas, now="2026-01-01T00:00:00+00:00")
                with open(path, encoding="utf-8") as handle:
                    output = json.load(handle)
        self.assertEqual([item["ideaId"] for item in output["universes"]["RESEARCHED"]["items"]], ["idea-eligible"])
        self.assertEqual(output["universes"]["VALIDATED"]["items"], [])

    def test_identical_rerun_is_byte_fixed_point_and_does_not_append_history(self):
        ideas = self.fixture()
        ranked = ranker.rank_ideas(ideas, eligible_ids={"idea-eligible"})
        with tempfile.TemporaryDirectory() as directory:
            path = os.path.join(directory, "rankings.json")
            with mock.patch.object(ranker, "RANKINGS_PATH", path):
                ranker.update_rankings_json(ranked, ideas, now="2026-01-01T00:00:00+00:00")
                with open(path, "rb") as handle:
                    first = handle.read()
                ranker.update_rankings_json(ranked, ideas, now="2026-02-01T00:00:00+00:00")
                with open(path, "rb") as handle:
                    second = handle.read()
                output = json.loads(second)
        self.assertEqual(first, second)
        self.assertEqual(len(output["history"]), 1)


if __name__ == "__main__":
    unittest.main()
