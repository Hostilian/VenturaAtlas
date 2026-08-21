from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Iterable


@dataclass(frozen=True)
class Finding:
    check_id: str
    passed: bool
    message: str
    source: str


@dataclass(frozen=True)
class Check:
    id: str
    source: str
    evaluate: Callable[[dict[str, Any]], tuple[bool, str]]


class ConformanceEngine:
    def __init__(self, checks: Iterable[Check]) -> None:
        self._checks = tuple(checks)
        ids = [check.id for check in self._checks]
        if len(ids) != len(set(ids)):
            raise ValueError("conformance check IDs must be unique")

    def run(self, payload: dict[str, Any]) -> list[Finding]:
        findings: list[Finding] = []
        for check in self._checks:
            passed, message = check.evaluate(payload)
            findings.append(Finding(check.id, bool(passed), message, check.source))
        return findings

