# EUDR transaction state machine

This is a **test model**, not an asserted copy of the official state machine.

```text
DRAFT
  -> VALIDATED_LOCAL
  -> SUBMISSION_PENDING
  -> ACCEPTED | REJECTED | UNKNOWN_EXTERNAL_STATE

REJECTED -> CORRECTED -> SUBMISSION_PENDING
ACCEPTED -> AMENDMENT_PENDING? -> AMENDED?
ACCEPTED -> RETRACTION_PENDING? -> RETRACTED?
UNKNOWN_EXTERNAL_STATE -> RECONCILING -> ACCEPTED | REJECTED | MANUAL_REVIEW
```

## Guards to discover

- Which fields can change after submission?
- Which states permit amendment or retraction?
- Does a retry preserve an external reference?
- How are duplicate payloads treated?
- What happens when a request times out after the government system commits it?
- Which status is authoritative after environment disagreement?

## Reliability invariants

1. Never create a second legal transaction merely because a response timed out.
2. Persist payload hash, schema version, actor, environment, attempt number, and external reference.
3. Treat local timeout as `UNKNOWN_EXTERNAL_STATE`, not `FAILED`.
4. Require reconciliation before resubmission when commit status is unknown.
5. Keep amendment/retraction logic disabled until official transitions are captured.

