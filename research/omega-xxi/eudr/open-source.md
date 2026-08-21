# EUDR open-source compression audit

Status values are capability-level research states, not product quality ratings.

| Capability | Status | Why |
|---|---|---|
| basic schema types | OPEN_SOURCE likely | trivial once schema is public; exact maintained package inventory pending |
| basic JSON/XML validation | FREE | commodity tooling can validate syntax/schema |
| GeoJSON parsing/topology checks | OPEN_SOURCE | mature geospatial libraries exist |
| official geolocation compatibility test | FREE | Commission-provided |
| API client generation | OPEN_SOURCE | commodity from machine-readable contracts |
| LIVE/ACCEPTANCE credential onboarding | UNCLEAR | official process, not a code moat |
| idempotent submission ledger | MISSING/UNCLEAR | requires product-by-product review |
| timeout reconciliation | MISSING/UNCLEAR | operational rather than SDK feature |
| multi-version regression corpus | MISSING/UNCLEAR | needs current and historical fixtures |
| managed SLA and incident response | PAID | service operation, not library |
| cross-customer failure corpus | MISSING | cannot be inferred from GitHub code |

Conclusion: parsers and clients are compressed. The only defensible wedge would be managed state, evidence, change maintenance, production reconciliation, and distribution—not “an EUDR SDK.”

