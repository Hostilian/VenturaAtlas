# DPP identifier model

Identifiers must be modelled as typed, issuer-bound, versioned references rather than free strings.

```json
{
  "type": "product|operator|facility|passport|provider",
  "value": "...",
  "scheme": "...",
  "issuer": "...",
  "jurisdiction": "EU",
  "validFrom": "...",
  "validTo": null,
  "sourceVersion": "..."
}
```

Open questions: mandatory schemes by product group, granularity (model/batch/item), resolvability, reassignment, aliases, mergers, facility closure, and how registry references bind to independently served backup copies.

