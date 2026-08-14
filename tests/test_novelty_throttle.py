import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from va_runtime.novelty_throttle import consume_cooldown, gate_receipt, is_throttled, record_result


class TestNoveltyThrottle(unittest.TestCase):
    def test_three_low_yield_runs_trigger_two_run_cooldown(self):
        control = None
        for _ in range(3):
            control = record_result(control, accepted=0, rejected=3, failed=0)
        self.assertTrue(is_throttled(control))
        self.assertEqual(gate_receipt(control)["decision"], "THROTTLE")
        self.assertEqual(control["cooldownRemaining"], 2)

    def test_provider_outage_does_not_count_as_low_novelty(self):
        control = record_result(None, accepted=0, rejected=0, failed=3)
        self.assertFalse(is_throttled(control))
        self.assertEqual(control["history"], [])
        self.assertIsNone(control["lastRun"]["yield"])

    def test_acceptable_yield_breaks_low_yield_window(self):
        control = record_result(None, accepted=0, rejected=3)
        control = record_result(control, accepted=1, rejected=2)
        control = record_result(control, accepted=0, rejected=3)
        self.assertFalse(is_throttled(control))

    def test_cooldown_consumption_resets_stale_history(self):
        control = None
        for _ in range(3):
            control = record_result(control, accepted=0, rejected=2)
        first = consume_cooldown(control)
        self.assertEqual(first["cooldownRemaining"], 1)
        self.assertEqual(len(first["history"]), 3)
        second = consume_cooldown(first)
        self.assertEqual(second["cooldownRemaining"], 0)
        self.assertEqual(second["history"], [])

    def test_history_is_bounded_to_configured_window(self):
        control = None
        for _ in range(10):
            control = record_result(control, accepted=1, rejected=1, window_runs=4)
        self.assertEqual(len(control["history"]), 4)


if __name__ == "__main__":
    unittest.main()
