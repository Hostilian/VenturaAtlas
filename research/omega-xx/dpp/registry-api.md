# DPP Registry runtime

The Commission says the Registry became operational in July 2026, supports UI and API registration, provides a testing environment, stores identifiers/high-level metadata rather than all detailed passport data, and exposes a free machine-readable semantic repository. Product data remains decentralised with economic operators or service providers.

## Narrow MVP

`register(product)` → validate identifiers/metadata → call Registry adapter → persist proof-of-registration → expose lifecycle/version status. Keep customer UI and detailed product hosting out of scope.

## Gap question

Existing DPP providers advertise end-to-end passport creation and APIs. The only investable gap is proven developer demand for neutral registry abstraction, semantic versioning, and multi-regulation product state. If interviews do not confirm that, kill this track.
