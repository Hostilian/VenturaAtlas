# EUDR error taxonomy

This taxonomy is deliberately vendor-neutral. No identifier below is represented as an official EUDR error code.

| Class | Example | Retry? | Required evidence |
|---|---|---:|---|
| `LOCAL_SCHEMA_INVALID` | missing required field | no | validator output, schema version |
| `GEOMETRY_INVALID` | malformed or unsupported geometry | no | input file, geometry diagnostics |
| `AUTHENTICATION_FAILED` | rejected credential | no until repaired | principal, environment, response |
| `AUTHORIZATION_FAILED` | principal lacks role | no until repaired | role/delegation snapshot |
| `REMOTE_VALIDATION_REJECTED` | payload rejected | no until corrected | exact response, payload hash |
| `RATE_LIMITED` | service throttles request | yes, policy bound | attempt and backoff history |
| `REMOTE_UNAVAILABLE` | outage/5xx/connectivity | yes | timestamps and health evidence |
| `TIMEOUT_COMMIT_UNKNOWN` | no response after possible commit | reconcile first | request ID, payload hash |
| `VERSION_MISMATCH` | schema/protocol incompatible | no until migrated | client/server versions |
| `STATE_CONFLICT` | operation illegal in remote state | no | local and remote state snapshots |
| `DUPLICATE_OR_IDEMPOTENCY_CONFLICT` | replay collision | reconcile | idempotency material |
| `UNKNOWN_REMOTE_ERROR` | unmapped response | manual review | raw redacted response |

Promotion rule: add an official-code mapping only with a current official specification or reproducible ACCEPTANCE fixture.

