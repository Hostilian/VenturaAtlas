import importlib
import os
import sys
import unittest
import tempfile
import time
from unittest import mock


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

        results, final_status, _ = orchestrator.execute_iteration(self.specs(), runner=runner)
        self.assertEqual(final_status, "FAILED")
        self.assertEqual([result.status for result in results], ["failed", "skipped", "skipped", "skipped"])

    def test_migration_failure_is_telemetry_and_blocks_ranking(self):
        def runner(name, command, **kwargs):
            status = "failed" if name == "migration" else "succeeded"
            return orchestrator.StepResult(name, status, 1 if status == "failed" else 0, 1, "", "migration failed")

        results, final_status, _ = orchestrator.execute_iteration(self.specs(), runner=runner)
        self.assertEqual(final_status, "FAILED")
        self.assertEqual(results[0].status, "succeeded")
        self.assertEqual(results[1].status, "failed")
        self.assertEqual(results[2].status, "skipped")
        self.assertEqual(results[3].status, "skipped")

    def test_all_required_steps_succeed(self):
        def runner(name, command, **kwargs):
            return orchestrator.StepResult(name, "succeeded", 0, 1, "ok", "")

        _, final_status, _ = orchestrator.execute_iteration(self.specs(), runner=runner)
        self.assertEqual(final_status, "SUCCEEDED_USEFUL")

    def test_no_op_discovery_skips_semantic_descendants(self):
        snapshot = {"canonicalIdeas": [], "stagedIdeas": []}
        def runner(name, command, **kwargs):
            return orchestrator.StepResult(name, "succeeded", 0, 1, "generated=0 staged=0", "")
        results, final_status, utility = orchestrator.execute_iteration(self.specs(), runner=runner, content_probe=lambda: snapshot)
        self.assertEqual(final_status, "SUCCEEDED_NO_OP")
        self.assertEqual([result.status for result in results], ["succeeded", "succeeded", "skipped", "skipped"])
        self.assertEqual(utility["outcome"], "NO_OP")

    def test_receipt_text_redacts_token_shapes(self):
        redacted = orchestrator.redact_runtime_text("failed with sk-abcdefghijklmnopqrstuvwxyz123456 and ghp_abcdefghijklmnopqrstuvwxyz")
        self.assertNotIn("abcdefghijklmnopqrstuvwxyz", redacted)
        self.assertIn("[REDACTED]", redacted)

    def test_zero_budget_emits_failed_receipt_and_nonzero_exit(self):
        with tempfile.TemporaryDirectory() as receipt_dir, mock.patch.object(
            sys, "argv", ["orchestrator", "--once", "--max-runtime-minutes", "0", "--receipt-dir", receipt_dir]
        ):
            self.assertEqual(orchestrator.main(), 1)
            receipts = os.listdir(receipt_dir)
            self.assertEqual(len(receipts), 1)
            with open(os.path.join(receipt_dir, receipts[0]), "r", encoding="utf-8") as handle:
                payload = __import__("json").load(handle)
            self.assertEqual(payload["finalStatus"], "FAILED")
            self.assertIn("BUDGET_EXHAUSTED", payload["steps"][0]["stderrTail"])

    def test_iteration_passes_only_remaining_budget_to_stage(self):
        observed_timeouts = []

        def runner(name, command, **kwargs):
            observed_timeouts.append(kwargs["timeout_seconds"])
            return orchestrator.StepResult(name, "succeeded", 0, 1, "ok", "")

        deadline = time.monotonic() + 0.2
        _, status, _ = orchestrator.execute_iteration(
            [orchestrator.StepSpec("discovery", ["discover"], "REQUIRED", timeout_seconds=900)],
            runner=runner,
            deadline_monotonic=deadline,
        )
        self.assertEqual(status, "SUCCEEDED_USEFUL")
        self.assertGreater(observed_timeouts[0], 0)
        self.assertLessEqual(observed_timeouts[0], 0.21)

    def test_exhausted_deadline_fails_stage_without_invoking_runner(self):
        runner = mock.Mock()
        results, status, _ = orchestrator.execute_iteration(
            [orchestrator.StepSpec("discovery", ["discover"], "REQUIRED")],
            runner=runner,
            deadline_monotonic=time.monotonic() - 1,
        )
        runner.assert_not_called()
        self.assertEqual(status, "FAILED")
        self.assertIn("BUDGET_EXHAUSTED", results[0].stderr_tail)

    def test_windows_startup_targets_bounded_entrypoint_and_checks_native_exit(self):
        startup_path = os.path.join(ROOT, "scripts", "automation", "startup.ps1")
        with open(startup_path, "r", encoding="utf-8") as handle:
            source = handle.read()
        self.assertIn("scripts/va-massive-orchestrator.py --once", source)
        self.assertIn("if ($LASTEXITCODE -ne 0)", source)
        self.assertNotIn("va_orchestrator.py --bounded", source)


if __name__ == "__main__":
    unittest.main()
