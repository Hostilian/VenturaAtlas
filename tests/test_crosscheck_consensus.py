import importlib.util
import pathlib
import unittest


PATH = pathlib.Path(__file__).parents[1] / "scripts" / "va-research-crosscheck.py"
SPEC = importlib.util.spec_from_file_location("va_research_crosscheck", PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ConsensusExtractorTests(unittest.TestCase):
    def test_exact_consensus_and_dissent_are_both_preserved(self):
        responses = [
            {"provider": "a", "content": '{"verdict":"kill","fatalErrors":["No buyer"],"unsupportedClaims":["Price"],"missingCrossChecks":[]}'},
            {"provider": "b", "content": '{"verdict":"test","fatalErrors":[" no   buyer "],"unsupportedClaims":[],"missingCrossChecks":[]}'},
            {"provider": "c", "content": '{"verdict":"test","fatalErrors":[],"unsupportedClaims":[],"missingCrossChecks":[]}'},
        ]
        summary = MODULE.extract_panel_summary(responses)
        self.assertTrue(summary["hasVerdictDissent"])
        self.assertEqual(summary["agreement"]["fatalErrors"][0]["providers"], ["a", "b"])
        self.assertEqual(len(summary["verdicts"]), 3)
        self.assertEqual(summary["evidenceStatus"], "MODEL_REVIEW_ONLY_NOT_EXTERNAL_EVIDENCE")


if __name__ == "__main__":
    unittest.main()
