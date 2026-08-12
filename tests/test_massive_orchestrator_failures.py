import importlib
import os
import sys
import unittest


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
orchestrator = importlib.import_module("va-massive-orchestrator")


class MassiveOrchestratorFailureTests(unittest.TestCase):
    def specs(self):
        return [
            orchestrator.StepSpec("discovery", ["discover"], "REQUIRED"),
            orchestrator.StepSpec("migration", ["migrate"], "REQUIRED", ("discovery",)),
            orchestrator.StepSpec("ranking", ["rank"], "REQUIRED", ("migration",)),
            orchestrator.StepSpec("quality", ["quality"], "REQUIRED", ("ranking",)),
        ]

    def test_required_failure_skips_descendants_and_fails_run(self):
        def runner(name, command, **kwargs):
            status = "failed" if name == "discovery" else "succeeded"
            return orchestrator.StepResult(name, status, 1 if status == "failed" else 0, 1, "", "boom")

        results, final_status = orchestrator.execute_iteration(self.specs(), runner=runner)
        self.assertEqual(final_status, "FAILED")
        self.assertEqual([result.status for result in results], ["failed", "skipped", "skipped", "skipped"])

    def test_migration_failure_is_telemetry_and_blocks_ranking(self):
        def runner(name, command, **kwargs):
            status = "failed" if name == "migration" else "succeeded"
            return orchestrator.StepResult(name, status, 1 if status == "failed" else 0, 1, "", "migration failed")

        results, final_status = orchestrator.execute_iteration(self.specs(), runner=runner)
        self.assertEqual(final_status, "FAILED")
        self.assertEqual(results[0].status, "succeeded")
        self.assertEqual(results[1].status, "failed")
        self.assertEqual(results[2].status, "skipped")
        self.assertEqual(results[3].status, "skipped")

    def test_all_required_steps_succeed(self):
        def runner(name, command, **kwargs):
            return orchestrator.StepResult(name, "succeeded", 0, 1, "ok", "")

        _, final_status = orchestrator.execute_iteration(self.specs(), runner=runner)
        self.assertEqual(final_status, "SUCCEEDED")


if __name__ == "__main__":
    unittest.main()
