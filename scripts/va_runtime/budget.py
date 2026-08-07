"""
Venture Atlas OS — Budget Guardrails
=====================================
Enforces daily and monthly cost limits before executing paid LLM provider calls.
"""

import os
import threading

class BudgetManager:
    def __init__(self):
        self.daily_budget_usd = float(os.environ.get("VA_DAILY_BUDGET_USD", "100.0"))
        self.monthly_budget_usd = float(os.environ.get("VA_MONTHLY_BUDGET_USD", "2000.0"))
        self.daily_spend_usd = 0.0
        self.monthly_spend_usd = 0.0
        self._lock = threading.Lock()

    def can_spend(self, estimated_cost_usd: float = 0.01) -> bool:
        with self._lock:
            return (
                (self.daily_spend_usd + estimated_cost_usd <= self.daily_budget_usd)
                and (self.monthly_spend_usd + estimated_cost_usd <= self.monthly_budget_usd)
            )

    def record_spend(self, actual_cost_usd: float):
        with self._lock:
            self.daily_spend_usd += actual_cost_usd
            self.monthly_spend_usd += actual_cost_usd

_BUDGET_MGR = BudgetManager()

def get_budget_manager() -> BudgetManager:
    return _BUDGET_MGR
