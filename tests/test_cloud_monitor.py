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


if __name__ == "__main__":
    unittest.main()
