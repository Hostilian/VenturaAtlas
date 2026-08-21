from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any


@dataclass(frozen=True)
class CanonicalEvent:
    id: str
    type: str
    object: str
    jurisdiction: str
    regime: str
    schemaVersion: str
    actor: str
    evidence: tuple[str, ...] = field(default_factory=tuple)
    state: str = "DRAFT"
    createdAt: str = ""
    attributes: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        required = {
            "id": self.id,
            "type": self.type,
            "object": self.object,
            "jurisdiction": self.jurisdiction,
            "regime": self.regime,
            "schemaVersion": self.schemaVersion,
            "actor": self.actor,
        }
        missing = [name for name, value in required.items() if not str(value).strip()]
        if missing:
            raise ValueError(f"missing canonical event fields: {', '.join(missing)}")
        if self.type != "regulatory.transaction":
            raise ValueError("prototype accepts only regulatory.transaction events")
        if self.createdAt:
            datetime.fromisoformat(self.createdAt.replace("Z", "+00:00"))

    def to_dict(self) -> dict[str, Any]:
        result = asdict(self)
        result["evidence"] = list(self.evidence)
        return result

