# OMEGA XIV — Capital Clock P0 implementation

Date: 2026-08-17  
Baseline: `c665bd900f3f6e68dd1fefaf1599713076266854`

## Executive decision

Capital Clock is now a separate, fail-closed research lens. It distinguishes capital programmes, state, clocks, gates, required evidence, and failure consequences. It does not treat headline capital as addressable market, awarded capital as disbursed capital, or a deadline as buyer demand.

The first bounded three-way battle is:

1. **NZIA BidProof** — new, deep research. Control point: non-price bid evidence.
2. **SAFE OriginTrace** — new, deep research. Control point: component-origin and design-control eligibility evidence.
3. **QueueReady** — existing thesis, re-underwritten. Control point: project maturity evidence at the grid-connection queue transition.

The European Commission currently describes grid queues in at least 16 EU countries and recommends transparent maturity criteria and “first-ready first-served” practices. The NZIA page describes mandatory non-price criteria for relevant procurement and auctions. SAFE describes up to €150 billion in loans and a 35% outside-EU/EEA-EFTA/Ukraine component-cost ceiling. These are forcing-function facts, not proof of software purchase demand.

## Implemented P0

- `data/capital-programs.json`: five source-backed programme records with null-first contestable and available amounts.
- `data/capital-clock-ledger.json`: five explicit clocks, including two dated application clocks and three open/unknown clocks.
- `schemas/capital-program.schema.json` and `schemas/capital-clock-ledger.schema.json`.
- `scripts/validate-capital-clock-ledger.js`: validates programme references, source references, state/expiry consistency, duplicate clocks, and fail-closed unknowns.
- Three new private staging hypotheses plus a QueueReady re-underwrite in the staging queue.
- Research receipt `run-res-018-20260817-omega-xiv-capital-clock`.

## Negative evidence and remaining unknowns

RRF rescue and IRIS² terminal readiness are not staged as new ventures because their clocks are too compressed for a founder discovery-to-sale-to-delivery cycle. Generic grant finders, funding dashboards, and generic AI-gigafactory software are rejected as weak control points. The remaining unknowns are buyer access, representative documents, incumbent substitution, budget ownership, and paid artifact behavior.

The existing canonical Capital Clock file remains empty: no idea has earned a commercial verdict from buyer activation, budget, procurement, payment, or renewal evidence.
