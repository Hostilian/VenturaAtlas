# Cross-regulation object-graph research method

Status: **research only; no product and no 30–40% overlap claim**

The ten-product scope table identifies where exact legal applicability must be resolved. It is not sufficient to calculate field overlap. Product-group delegated acts, CN codes, packaging configuration, connected-product status, origin, importer role, and supply-chain facts materially change the result.

## Canonical field families to map

`product_id`, `operator_id`, `facility_id`, `supplier_id`, `material`, `origin`, `geolocation`, `customs_code`, `batch`, `quantity`, `certificate`, `evidence`, `emissions`, `repair_data`, `security_data`, `packaging`, `timestamps`.

## Calculation contract

For each product and regime:

1. cite the exact legal or delegated-act field;
2. map it to one canonical field family;
3. mark cardinality, granularity, authority, update frequency, and access class;
4. count overlap only when two regimes can reuse the same source datum without semantic loss;
5. report both Jaccard overlap and weighted overlap by collection cost;
6. keep `UNKNOWN` out of numerator and denominator, and publish coverage.

The Product Evidence Graph becomes more important only after measured weighted overlap exceeds 30–40% on adequately covered product cases. No such result is recorded yet.

