"""Durable dispatch leases, idempotency receipts, dead letters, and heartbeats."""

from __future__ import annotations

import datetime as dt
import os
from typing import Any

from ..atomic_io import atomic_write_json, read_json_safe
from ..process_lock import process_file_lock


ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DEFAULT_PATH = os.path.join(ROOT, ".agent-state", "dispatch-runtime.json")


def _now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def _parse(value: str | None) -> dt.datetime | None:
    if not value:
        return None
    try:
        return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return None


class DispatchRuntime:
    def __init__(self, path: str = DEFAULT_PATH):
        self.path = path
        self.lock_path = path + ".lock"

    @staticmethod
    def _empty() -> dict[str, Any]:
        return {"schemaVersion": "1.0.0", "leases": {}, "completions": {}, "failures": {}, "deadLetters": []}

    def _read(self) -> dict[str, Any]:
        state = read_json_safe(self.path, default_if_missing=self._empty())
        if not isinstance(state, dict):
            raise ValueError("dispatch runtime state must be an object")
        for key, default in self._empty().items():
            state.setdefault(key, default.copy() if isinstance(default, dict) else list(default) if isinstance(default, list) else default)
        return state

    def acquire(self, key: str, owner: str, *, ttl_seconds: int = 3900) -> str:
        now = _now()
        with process_file_lock(self.lock_path):
            state = self._read()
            if key in state["completions"]:
                return "ALREADY_COMPLETED"
            lease = state["leases"].get(key)
            expires = _parse(lease.get("expiresAt")) if isinstance(lease, dict) else None
            if expires and expires > now and lease.get("owner") != owner:
                return "LEASE_HELD"
            state["leases"][key] = {"owner": owner, "acquiredAt": now.isoformat(),
                "heartbeatAt": now.isoformat(), "expiresAt": (now + dt.timedelta(seconds=max(1, ttl_seconds))).isoformat()}
            state["updatedAt"] = now.isoformat()
            atomic_write_json(self.path, state)
        return "ACQUIRED"

    def heartbeat(self, key: str, owner: str, *, ttl_seconds: int = 3900) -> bool:
        now = _now()
        with process_file_lock(self.lock_path):
            state = self._read()
            lease = state["leases"].get(key)
            if not isinstance(lease, dict) or lease.get("owner") != owner:
                return False
            lease["heartbeatAt"] = now.isoformat()
            lease["expiresAt"] = (now + dt.timedelta(seconds=max(1, ttl_seconds))).isoformat()
            state["updatedAt"] = now.isoformat()
            atomic_write_json(self.path, state)
        return True

    def complete(self, key: str, owner: str, receipt: dict[str, Any] | None = None) -> bool:
        now = _now()
        with process_file_lock(self.lock_path):
            state = self._read()
            lease = state["leases"].get(key)
            if not isinstance(lease, dict) or lease.get("owner") != owner:
                return False
            state["leases"].pop(key, None)
            state["failures"].pop(key, None)
            state["completions"][key] = {"completedAt": now.isoformat(), "owner": owner, "receipt": receipt or {}}
            state["completions"] = dict(list(state["completions"].items())[-1000:])
            state["updatedAt"] = now.isoformat()
            atomic_write_json(self.path, state)
        return True

    def fail(self, key: str, owner: str, error_class: str, *, max_attempts: int = 3) -> int:
        now = _now()
        with process_file_lock(self.lock_path):
            state = self._read()
            lease = state["leases"].get(key)
            if not isinstance(lease, dict) or lease.get("owner") != owner:
                return 0
            state["leases"].pop(key, None)
            failure = state["failures"].setdefault(key, {"attempts": 0})
            failure["attempts"] = int(failure.get("attempts", 0)) + 1
            failure["lastFailedAt"] = now.isoformat()
            failure["errorClass"] = error_class
            attempts = failure["attempts"]
            if attempts >= max(1, max_attempts):
                state["deadLetters"].append({"key": key, **failure})
                state["deadLetters"] = state["deadLetters"][-1000:]
                state["failures"].pop(key, None)
            state["updatedAt"] = now.isoformat()
            atomic_write_json(self.path, state)
            return attempts

    def stale_leases(self, *, stale_after_seconds: int = 4500) -> list[dict[str, Any]]:
        cutoff = _now() - dt.timedelta(seconds=max(1, stale_after_seconds))
        with process_file_lock(self.lock_path):
            state = self._read()
        stale = []
        for key, lease in state["leases"].items():
            heartbeat = _parse(lease.get("heartbeatAt")) if isinstance(lease, dict) else None
            if heartbeat is None or heartbeat < cutoff:
                stale.append({"key": key, **(lease if isinstance(lease, dict) else {})})
        return stale
