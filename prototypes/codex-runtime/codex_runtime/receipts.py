from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from .hashing import sha256_object


@dataclass(frozen=True)
class Receipt:
    transactionId: str
    objectHash: str
    inputVersion: str
    regulatoryVersion: str
    validatorVersion: str
    submittedAt: str
    externalReference: str | None
    result: str
    evidenceHash: str

    @classmethod
    def issue(
        cls,
        *,
        transaction_id: str,
        payload: dict[str, Any],
        evidence: list[Any],
        input_version: str,
        regulatory_version: str,
        validator_version: str,
        submitted_at: str,
        external_reference: str | None,
        result: str,
    ) -> "Receipt":
        return cls(
            transactionId=transaction_id,
            objectHash=sha256_object(payload),
            inputVersion=input_version,
            regulatoryVersion=regulatory_version,
            validatorVersion=validator_version,
            submittedAt=submitted_at,
            externalReference=external_reference,
            result=result,
            evidenceHash=sha256_object(evidence),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

