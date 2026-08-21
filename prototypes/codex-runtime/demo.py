from __future__ import annotations

import json
from datetime import datetime, timezone

from codex_runtime import CanonicalEvent, Receipt, TransactionRuntime
from codex_runtime.adapters import EudrSyntheticAdapter


payload = {
    "commodity": "coffee",
    "geolocation": {"type": "Point", "coordinates": [14.42, 50.08]},
}

event = CanonicalEvent(
    id="evt-demo-001",
    type="regulatory.transaction",
    object="shipment-demo-001",
    jurisdiction="EU",
    regime="EUDR",
    schemaVersion="synthetic-0.1",
    actor="demo-operator",
    evidence=("synthetic-geolocation",),
    createdAt=datetime.now(timezone.utc).isoformat(),
)

findings = EudrSyntheticAdapter().preflight(payload)
runtime = TransactionRuntime("tx-demo-001")
runtime.bind_payload(payload)
runtime.transition("VALIDATED_LOCAL", reason="synthetic checks passed")
runtime.transition("SUBMISSION_PENDING", reason="synthetic submission requested")
runtime.transition("UNKNOWN_EXTERNAL_STATE", reason="simulated timeout")
runtime.transition("RECONCILING", reason="query external state before retry")
runtime.transition("ACCEPTED", reason="simulated reconciliation", external_reference="SYNTHETIC-REF")

receipt = Receipt.issue(
    transaction_id=runtime.transaction_id,
    payload=payload,
    evidence=list(event.evidence),
    input_version=event.schemaVersion,
    regulatory_version="synthetic-only",
    validator_version=EudrSyntheticAdapter.validator_version,
    submitted_at=datetime.now(timezone.utc).isoformat(),
    external_reference=runtime.external_reference,
    result=runtime.state,
)

print(json.dumps({"event": event.to_dict(), "findings": [f.__dict__ for f in findings], "receipt": receipt.to_dict()}, indent=2))

