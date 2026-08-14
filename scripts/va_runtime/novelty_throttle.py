"""Deterministic, private novelty-yield throttle for autonomous discovery.

The control state is runtime telemetry. It never enters canonical data or the
public artifact, and provider outages do not count as evidence of low novelty.
"""

from __future__ import annotations

import copy
from typing import Any


def _positive_int(value: Any, default: int) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    return parsed if parsed > 0 else default


def _unit_interval(value: Any, default: float) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return default
    return parsed if 0 <= parsed <= 1 else default


def normalize_control(control: dict[str, Any] | None, *, window_runs: int = 3,
                      minimum_yield: float = 0.20, cooldown_runs: int = 2) -> dict[str, Any]:
    """Return a bounded, schema-stable novelty control object."""
    window_runs = _positive_int(window_runs, 3)
    cooldown_runs = _positive_int(cooldown_runs, 2)
    minimum_yield = _unit_interval(minimum_yield, 0.20)
    source = control if isinstance(control, dict) else {}
    history = []
    for item in source.get("history", []):
        if not isinstance(item, dict):
            continue
        try:
            accepted = max(0, int(item.get("accepted", 0)))
            rejected = max(0, int(item.get("rejected", 0)))
        except (TypeError, ValueError):
            continue
        evaluated = accepted + rejected
        if evaluated == 0:
            continue
        history.append({
            "accepted": accepted,
            "rejected": rejected,
            "evaluated": evaluated,
            "yield": accepted / evaluated,
        })
    remaining = source.get("cooldownRemaining", 0)
    try:
        remaining = max(0, int(remaining))
    except (TypeError, ValueError):
        remaining = 0
    return {
        "contract": "novelty-yield-v1",
        "windowRuns": window_runs,
        "minimumYield": minimum_yield,
        "cooldownRuns": cooldown_runs,
        "cooldownRemaining": min(remaining, cooldown_runs),
        "history": history[-window_runs:],
    }


def is_throttled(control: dict[str, Any] | None, **settings: Any) -> bool:
    return normalize_control(control, **settings)["cooldownRemaining"] > 0


def consume_cooldown(control: dict[str, Any] | None, **settings: Any) -> dict[str, Any]:
    """Consume one skipped discovery run and reset stale evidence at zero."""
    result = normalize_control(control, **settings)
    if result["cooldownRemaining"] > 0:
        result["cooldownRemaining"] -= 1
    if result["cooldownRemaining"] == 0:
        result["history"] = []
    return result


def record_result(control: dict[str, Any] | None, *, accepted: int, rejected: int,
                  failed: int = 0, **settings: Any) -> dict[str, Any]:
    """Record evaluated novelty; provider failures never enter the denominator."""
    result = normalize_control(control, **settings)
    accepted = max(0, int(accepted))
    rejected = max(0, int(rejected))
    failed = max(0, int(failed))
    evaluated = accepted + rejected
    result["lastRun"] = {
        "accepted": accepted,
        "rejected": rejected,
        "failed": failed,
        "evaluated": evaluated,
        "yield": (accepted / evaluated) if evaluated else None,
    }
    if evaluated == 0:
        return result
    result["history"].append({
        "accepted": accepted,
        "rejected": rejected,
        "evaluated": evaluated,
        "yield": accepted / evaluated,
    })
    result["history"] = result["history"][-result["windowRuns"]:]
    if (len(result["history"]) == result["windowRuns"] and
            all(item["yield"] < result["minimumYield"] for item in result["history"])):
        result["cooldownRemaining"] = result["cooldownRuns"]
    return result


def gate_receipt(control: dict[str, Any] | None, **settings: Any) -> dict[str, Any]:
    """Expose a secret-free structured decision for logs and run receipts."""
    normalized = normalize_control(copy.deepcopy(control), **settings)
    return {
        "contract": normalized["contract"],
        "decision": "THROTTLE" if normalized["cooldownRemaining"] > 0 else "ALLOW",
        "cooldownRemaining": normalized["cooldownRemaining"],
        "windowRuns": normalized["windowRuns"],
        "minimumYield": normalized["minimumYield"],
        "observedYields": [item["yield"] for item in normalized["history"]],
    }
