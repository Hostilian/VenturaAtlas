import datetime as dt
import importlib.util
import pathlib
import unittest

PATH = pathlib.Path(__file__).parents[1] / "scripts" / "va-cloud-monitor.py"
SPEC = importlib.util.spec_from_file_location("va_cloud_monitor", PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class CloudMonitorTests(unittest.TestCase):
    def test_two_failures_raise_one_aggregate_alert(self):
        now = dt.datetime(2026, 8, 21, 12, tzinfo=dt.timezone.utc)
        runs = [
            {"status": "completed", "conclusion": "failure", "createdAt": "2026-08-21T11:30:00Z"},
            {"status": "completed", "conclusion": "failure", "createdAt": "2026-08-21T10:30:00Z"},
        ]
        receipt = MODULE.evaluate(runs, now)
        self.assertEqual(receipt["status"], "ALERT")
        self.assertEqual(receipt["reasons"], ["TWO_CONSECUTIVE_FAILURES"])

    def test_recent_success_is_healthy(self):
        now = dt.datetime(2026, 8, 21, 12, tzinfo=dt.timezone.utc)
        receipt = MODULE.evaluate([
            {"status": "completed", "conclusion": "success", "createdAt": "2026-08-21T11:30:00Z"}
        ], now)
        self.assertEqual(receipt["status"], "HEALTHY")

    def test_manual_dispatch_cannot_mask_missing_scheduled_runs(self):
        runs = [
            {
                "event": "workflow_dispatch",
                "status": "completed",
                "conclusion": "success",
                "createdAt": "2026-08-21T11:59:00Z",
            },
            {
                "event": "schedule",
                "status": "completed",
                "conclusion": "failure",
                "createdAt": "2026-08-21T10:00:00Z",
            },
        ]
        filtered = MODULE.scheduled_runs(runs)
        self.assertEqual(len(filtered), 1)
        self.assertEqual(filtered[0]["event"], "schedule")

    def test_dispatch_only_simulations_cover_stale_alert_and_recovery(self):
        now = dt.datetime(2026, 8, 21, 12, tzinfo=dt.timezone.utc)
        stale = MODULE.evaluate(MODULE.simulated_runs("stale", now), now)
        healthy = MODULE.evaluate(MODULE.simulated_runs("healthy", now), now)
        self.assertEqual(stale["status"], "ALERT")
        self.assertEqual(
            stale["reasons"],
            ["LATEST_COMPLETED_RUN_STALE", "TWO_CONSECUTIVE_FAILURES"],
        )
        self.assertEqual(healthy["status"], "HEALTHY")


if __name__ == "__main__":
    unittest.main()
