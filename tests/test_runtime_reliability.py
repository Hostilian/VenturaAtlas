import os
import tempfile
import unittest

from scripts.va_runtime.budget import BudgetExceededError, BudgetManager
from scripts.va_runtime.orchestration.reliability import DispatchRuntime


class PersistentBudgetTests(unittest.TestCase):
    def test_reservations_survive_restart_and_enforce_budget(self):
        with tempfile.TemporaryDirectory() as temp:
            path = os.path.join(temp, "ledger.json")
            first = BudgetManager(path)
            first.daily_budget_usd = first.monthly_budget_usd = 0.02
            call_id = first.start_call("external", estimated_cost_usd=0.02, operation_digest="digest")
            first.finish_call(call_id, "SUCCEEDED")
            restarted = BudgetManager(path)
            restarted.daily_budget_usd = restarted.monthly_budget_usd = 0.02
            with self.assertRaises(BudgetExceededError):
                restarted.start_call("external", estimated_cost_usd=0.01)
            self.assertEqual(restarted.snapshot()["callCount"], 1)

    def test_cancelled_reservation_releases_budget(self):
        with tempfile.TemporaryDirectory() as temp:
            manager = BudgetManager(os.path.join(temp, "ledger.json"))
            manager.daily_budget_usd = manager.monthly_budget_usd = 0.01
            call_id = manager.start_call("external", estimated_cost_usd=0.01)
            manager.finish_call(call_id, "CANCELLED")
            self.assertTrue(manager.can_spend(0.01))


class DispatchReliabilityTests(unittest.TestCase):
    def test_lease_idempotency_and_dead_letter(self):
        with tempfile.TemporaryDirectory() as temp:
            runtime = DispatchRuntime(os.path.join(temp, "dispatch.json"))
            self.assertEqual(runtime.acquire("same", "owner-a"), "ACQUIRED")
            self.assertEqual(runtime.acquire("same", "owner-b"), "LEASE_HELD")
            self.assertTrue(runtime.complete("same", "owner-a", {"status": "ok"}))
            self.assertEqual(runtime.acquire("same", "owner-b"), "ALREADY_COMPLETED")
            for expected in (1, 2, 3):
                self.assertEqual(runtime.acquire("bad", "owner-a"), "ACQUIRED")
                self.assertEqual(runtime.fail("bad", "owner-a", "SyntheticFailure"), expected)
            state = runtime._read()
            self.assertEqual(len(state["deadLetters"]), 1)
            self.assertEqual(state["deadLetters"][0]["attempts"], 3)


if __name__ == "__main__":
    unittest.main()
