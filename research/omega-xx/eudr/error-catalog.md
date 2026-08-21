# EUDR error catalog (fixture taxonomy, not claimed official codes)

| class | example | bridge response |
|---|---|---|
| identity | operator/account not authorised | block and explain onboarding |
| shape | missing commodity/quantity | deterministic field error |
| geography | invalid polygon/coordinates | pre-flight geometry check |
| referential | unknown DDS/reference | reconcile and retry safely |
| duplicate | repeated submission | idempotency lookup |
| availability | timeout/5xx | durable retry queue |
| version | payload/schema mismatch | pin adapter and show diff |

Replace every placeholder with an observed official response before publishing a production error mapping.
