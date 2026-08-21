from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .hashing import sha256_object


class InvalidTransition(ValueError):
    pass


ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "DRAFT": {"VALIDATED_LOCAL"},
    "VALIDATED_LOCAL": {"SUBMISSION_PENDING"},
    "SUBMISSION_PENDING": {"ACCEPTED", "REJECTED", "UNKNOWN_EXTERNAL_STATE"},
    "REJECTED": {"CORRECTED"},
    "CORRECTED": {"VALIDATED_LOCAL"},
    "UNKNOWN_EXTERNAL_STATE": {"RECONCILING"},
    "RECONCILING": {"ACCEPTED", "REJECTED", "MANUAL_REVIEW"},
    "ACCEPTED": set(),
    "MANUAL_REVIEW": set(),
}


@dataclass
class TransactionRuntime:
    transaction_id: str
    state: str = "DRAFT"
    payload_hash: str | None = None
    external_reference: str | None = None
    history: list[dict[str, Any]] = field(default_factory=list)

    def bind_payload(self, payload: dict[str, Any]) -> str:
        digest = sha256_object(payload)
        if self.payload_hash and self.payload_hash != digest and self.state not in {"DRAFT", "CORRECTED"}:
            raise ValueError("payload cannot change after submission starts")
        self.payload_hash = digest
        return digest

    def transition(self, next_state: str, *, reason: str, external_reference: str | None = None) -> None:
        if next_state not in ALLOWED_TRANSITIONS.get(self.state, set()):
            raise InvalidTransition(f"{self.state} -> {next_state} is not allowed")
        previous = self.state
        self.state = next_state
        if external_reference:
            self.external_reference = external_reference
        self.history.append(
            {
                "from": previous,
                "to": next_state,
                "reason": reason,
                "externalReference": external_reference,
            }
        )

    @property
    def may_retry_submission(self) -> bool:
        return self.state in {"REJECTED", "CORRECTED", "VALIDATED_LOCAL"}

