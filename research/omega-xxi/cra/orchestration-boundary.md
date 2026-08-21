# CRA evidence-orchestration boundary

Do not rebuild the SRP. A possible private layer would prepare evidence, run clocks, maintain approvals, and preserve submission receipts while a human submits through the official interface unless and until an official API permits automation.

```text
AWARENESS_RECORDED
 -> 24H_EARLY_WARNING_DUE
 -> EARLY_WARNING_SUBMITTED
 -> 72H_FULL_NOTIFICATION_DUE
 -> FULL_NOTIFICATION_SUBMITTED
 -> CORRECTIVE_MEASURE_AVAILABLE? -> 14D_FINAL_DUE
 -> SEVERE_INCIDENT? -> 1M_FINAL_DUE
 -> FINAL_SUBMITTED
 -> CLOSED
```

Critical controls: legal-scope review, event classification, immutable awareness timestamp, product/market evidence, responsible human approval, deadline clock, redaction, official submission reference, update history, and final receipt.

No field set is claimed complete until ENISA's current notification guidance is transcribed and versioned.

