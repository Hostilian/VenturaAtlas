"""Persistent, cross-process provider-call and spend guardrails.

The ledger reserves estimated spend before an external call starts. A provider
response currently does not expose a normalized billed-cost field, so receipts
label charged values as estimates unless an actual value is supplied. No prompts,
responses, API keys, or key aliases are written to this ledger.
"""

from __future__ import annotations

import datetime as dt
import os
import threading
import uuid
from typing import Any

from .atomic_io import atomic_write_json, read_json_safe
from .process_lock import process_file_lock


ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_LEDGER_PATH = os.path.join(ROOT, ".agent-state", "provider-call-ledger.json")
DEFAULT_LOCK_PATH = os.path.join(ROOT, ".agent-state", "locks", "provider-call-ledger.lock")


def _utcnow() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def _parse_time(value: str) -> dt.datetime:
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))


class BudgetExceededError(RuntimeError):
    """Raised before a provider call when a persistent budget would be exceeded."""


class BudgetManager:
    def __init__(self, ledger_path: str | None = None, lock_path: str | None = None):
        self.daily_budget_usd = float(os.environ.get("VA_DAILY_BUDGET_USD", "10.0"))
        self.monthly_budget_usd = float(os.environ.get("VA_MONTHLY_BUDGET_USD", "100.0"))
        self.default_estimate_usd = float(os.environ.get("VA_ESTIMATED_CALL_USD", "0.01"))
        self.ledger_path = ledger_path or os.environ.get("VA_PROVIDER_LEDGER_PATH", DEFAULT_LEDGER_PATH)
        self.lock_path = lock_path or (self.ledger_path + ".lock" if ledger_path else DEFAULT_LOCK_PATH)
        self._thread_lock = threading.Lock()

    @staticmethod
    def _empty() -> dict[str, Any]:
        return {"schemaVersion": "2.0.0", "calls": []}

    def _read(self) -> dict[str, Any]:
        payload = read_json_safe(self.ledger_path, default_if_missing=self._empty())
        if not isinstance(payload, dict) or not isinstance(payload.get("calls"), list):
            raise ValueError("provider call ledger has an invalid schema")
        return payload

    @staticmethod
    def _charged(call: dict[str, Any]) -> float:
        if call.get("status") == "CANCELLED":
            return 0.0
        return max(0.0, float(call.get("chargedUsd") or call.get("estimatedUsd") or 0.0))

    def _totals(self, calls: list[dict[str, Any]], now: dt.datetime) -> tuple[float, float]:
        day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = day_start.replace(day=1)
        daily = monthly = 0.0
        for call in calls:
            try:
                started = _parse_time(str(call.get("startedAt", "")))
            except (TypeError, ValueError):
                continue
            charged = self._charged(call)
            if started >= month_start:
                monthly += charged
            if started >= day_start:
                daily += charged
        return daily, monthly

    def can_spend(self, estimated_cost_usd: float | None = None) -> bool:
        estimate = self.default_estimate_usd if estimated_cost_usd is None else max(0.0, estimated_cost_usd)
        with self._thread_lock, process_file_lock(self.lock_path):
            ledger = self._read()
            daily, monthly = self._totals(ledger["calls"], _utcnow())
            return daily + estimate <= self.daily_budget_usd and monthly + estimate <= self.monthly_budget_usd

    def start_call(self, provider: str, *, estimated_cost_usd: float | None = None,
                   operation_digest: str | None = None) -> str:
        estimate = 0.0 if provider == "own-orch" else (
            self.default_estimate_usd if estimated_cost_usd is None else max(0.0, estimated_cost_usd)
        )
        now = _utcnow()
        call_id = f"call-{now.strftime('%Y%m%dT%H%M%SZ')}-{uuid.uuid4().hex[:12]}"
        with self._thread_lock, process_file_lock(self.lock_path):
            ledger = self._read()
            daily, monthly = self._totals(ledger["calls"], now)
            if daily + estimate > self.daily_budget_usd or monthly + estimate > self.monthly_budget_usd:
                raise BudgetExceededError(
                    f"provider budget exhausted: daily={daily:.4f}/{self.daily_budget_usd:.4f}, "
                    f"monthly={monthly:.4f}/{self.monthly_budget_usd:.4f}, requested={estimate:.4f}"
                )
            ledger["calls"].append({
                "callId": call_id, "provider": provider, "startedAt": now.isoformat(),
                "endedAt": None, "status": "RESERVED", "estimatedUsd": round(estimate, 6),
                "chargedUsd": round(estimate, 6),
                "costBasis": "ESTIMATE_NOT_PROVIDER_BILLED" if estimate else "FREE_LOCAL",
                "operationDigest": operation_digest,
            })
            ledger["calls"] = ledger["calls"][-5000:]
            ledger["updatedAt"] = now.isoformat()
            atomic_write_json(self.ledger_path, ledger)
        return call_id

    def finish_call(self, call_id: str, status: str, *, actual_cost_usd: float | None = None,
                    error_class: str | None = None) -> None:
        if status not in {"SUCCEEDED", "FAILED", "CANCELLED"}:
            raise ValueError("invalid provider call status")
        with self._thread_lock, process_file_lock(self.lock_path):
            ledger = self._read()
            target = next((call for call in reversed(ledger["calls"]) if call.get("callId") == call_id), None)
            if target is None:
                raise KeyError(f"unknown provider call receipt: {call_id}")
            if target.get("status") != "RESERVED":
                return
            target["status"] = status
            target["endedAt"] = _utcnow().isoformat()
            if actual_cost_usd is not None:
                target["chargedUsd"] = round(max(0.0, actual_cost_usd), 6)
                target["costBasis"] = "PROVIDER_REPORTED"
            elif status == "CANCELLED":
                target["chargedUsd"] = 0.0
            if error_class:
                target["errorClass"] = error_class
            ledger["updatedAt"] = target["endedAt"]
            atomic_write_json(self.ledger_path, ledger)

    def record_spend(self, actual_cost_usd: float):
        call_id = self.start_call("legacy-unspecified", estimated_cost_usd=max(0.0, actual_cost_usd))
        self.finish_call(call_id, "SUCCEEDED", actual_cost_usd=actual_cost_usd)

    def snapshot(self) -> dict[str, Any]:
        with self._thread_lock, process_file_lock(self.lock_path):
            ledger = self._read()
            daily, monthly = self._totals(ledger["calls"], _utcnow())
            return {"dailySpendUsd": round(daily, 6), "monthlySpendUsd": round(monthly, 6),
                    "dailyBudgetUsd": self.daily_budget_usd, "monthlyBudgetUsd": self.monthly_budget_usd,
                    "callCount": len(ledger["calls"])}


_BUDGET_MGR = BudgetManager()


def get_budget_manager() -> BudgetManager:
    return _BUDGET_MGR
