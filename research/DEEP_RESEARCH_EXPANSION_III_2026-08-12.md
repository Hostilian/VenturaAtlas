# VenturaAtlas Deep Research Expansion III - 12 August 2026

## Outcome

Expansion III was read in full, checked against current primary sources, and resolved against 294 canonical ideas and 231 pre-existing private staged candidates. Of its 24 ranked proposals, 10 are distinct enough to stage privately. The other 14 are existing ideas, existing private candidates, family enrichments, subordinate features, or policy-dependent watch items.

No supplied score or S/S+ label changes the canonical ranking. The scores remain analyst comparisons stored only as `provisional_not_ranking_eligible`. No private candidate is published.

## Material corrections and verified windows

- Energy-sharing and multiple-supplier rules apply from 17 July 2026, but settlement remains nationally fragmented.
- DAC8 collection began on 1 January 2026; the first reporting year is 2026 and exchanges are due by 30 September 2027.
- Digital-euro rulebook v0.91 was published on 2 July 2026 with testing and technical annexes, but remains a draft and issuance depends on legislation.
- Imported-energy methane MRV equivalence begins on 1 January 2027; Russian LNG is scheduled to be phased out by end-2026 and pipeline gas by 30 November 2027.
- EHDS implementing acts are due by March 2027, while major application dates begin in 2029. Official EHR test environments are planned and manufacturers must use them before placing covered systems on the market.
- NZIA non-price auction criteria cover resilience, sustainability, cybersecurity, responsible conduct, and delivery for specified auction volume.
- Pharmaceuticals and cosmetics producers must cover at least 80% of relevant wastewater micropollutant-removal costs.
- Interoperability assessments became mandatory for relevant cross-border public-service requirements on 12 January 2025.
- ICS2 became fully mandatory across transport modes on **1 September 2025**. The attachment's 1 June 2026 date is a Commission status announcement, not the legal start date.
- SoHO rules apply from 7 August 2027, with later application for specified provisions.
- The Customs Data Hub is phased future architecture; records do not assume a fixed final interface beyond verified milestones.

## Semantic resolution

| Rank | Proposal | Resolution | Target |
|---:|---|---|---|
| 1 | Molecule Passport / Gas Provenance Graph | Stage distinct commingled-provenance layer | New candidate adjacent to `idea-399` and `idea-400` |
| 2 | Energy Sharing Settlement Router | Existing exact family | `idea-392` EnergyShare Auditor |
| 3 | NZIA Resilience BOM Compiler | Exact duplicate | `idea-373` BidTwin / AuctionProof |
| 4 | DAC8 Data Repair Engine | Exact private duplicate | DAC8 Transaction Reconciliation |
| 5 | EHDS Study Permit Compiler | Exact duplicate | `idea-379` CohortPreflight Europe |
| 6 | Micropollutant EPR Ledger | Existing family | `idea-293`, `idea-378`, `idea-384` |
| 7 | EHDS EHR Preflight CI | Stage distinct | New candidate |
| 8 | Digital Euro Conformance CI | Stage draft-sensitive | New candidate |
| 9 | GovInterop CI | Stage distinct | New candidate |
| 10 | Industrial Permit Diff Engine | Stage distinct | New candidate |
| 11 | ICS2 Cargo Data Repair Gateway | Exact private duplicate | ENS Guarantee |
| 12 | Duct & Civil Works Router | Exact duplicate | `idea-287` DuctExchange |
| 13 | SoHO Supply Continuity Router | Stage distinct, safety constrained | New candidate |
| 14 | Industrial Water Dependency Graph | Stage distinct underwriting hypothesis | New candidate |
| 15 | SAFE Procurement Eligibility Graph | Stage distinct specialist hypothesis | New candidate |
| 16 | Customs Product Identity Compiler | Stage distinct identity layer | New candidate |
| 17 | Robot Safety-Case CI | Duplicate existing family | `idea-299`, `idea-367` |
| 18 | Refrigerant Lifecycle Ledger | Duplicate existing family | `idea-400` and Refrigerant Reclaim Yield Ledger |
| 19 | Data-Centre Rating Digital Twin | Exact duplicate | `idea-389` |
| 20 | Grid-Responsive Compute Broker | Stage only the narrow cross-cloud broker | New candidate adjacent to `idea-396` |
| 21 | Biotech SandboxOps | Watch only | Policy-dependent; not staged |
| 22 | Agent-Commerce Mandate Reconciler | Merge into machine-authority family | Agent Purchase Guardrail, EntityMandate, Agent Action Flight Recorder |
| 23 | Shortage-Aware SoHO Logistics API | Feature | SoHO Supply Continuity Router |
| 24 | Water-Smart Factory Optimizer | Feature | Industrial Water Dependency Graph |

## Private staged cohort

- Molecule Passport - Gas Provenance Graph
- EHDS EHR Preflight CI
- Digital Euro Conformance CI
- GovInterop CI
- Industrial Permit Diff Engine
- SoHO Supply Continuity Router
- Industrial Water Dependency Graph
- SAFE Procurement Eligibility Graph
- Customs Product Identity Compiler
- Grid-Responsive Compute Broker

Each record has null canonical scores, explicit evidence, `promotionEligible: false`, a concrete validation gate, failure boundaries, and kill criteria.

## Validation and experiments

The requested 11-item full-validation set is preserved as machine-readable targets. Exact duplicates point to their existing records rather than creating competing candidates.

The five immediate falsification experiments are:

1. Molecule Passport - synthetic commingled US-LNG cargo with unknown origin, expired verification, and missing contract evidence.
2. EnergyShare Auditor - one Member State, one 20-unit building, two suppliers, 15-minute readings, and four allocation rules.
3. BidTwin / AuctionProof - one solar BOM, one auction rule set, and supplier substitution economics.
4. DAC8 Transaction Reconciliation - 100,000-user data-debt fixture with identity, residency, asset, and transaction defects.
5. CohortPreflight Europe - one Czech-German-Portuguese study compiled into dataset feasibility and access requirements without patient data.

## Research-engine additions

Three branches are added:

- `commingled_asset_ledgers`
- `continuous_regulatory_conformance`
- `regulatory_data_debt_windows`

Five portfolio families are retained:

- machine authority
- regulated attribute infrastructure
- European rail adapters
- continuous conformance
- scarcity intelligence

Three scoring dimensions are added as quantities to measure rather than free score boosts:

- **Economic coupling:** does a wrong attribute change eligibility, cash, price, or capital allocation?
- **Involuntary frequency:** how often does an external event force repeated use?
- **Evidence gravity:** does operation accumulate history that is costly to recreate elsewhere?

The eight future search passes are new obligation, official rail, regulated attribute, data debt, preflight, physical bottleneck, forbidden old workflow, and machine consequence.

## Machine-readable receipt

The complete decisions, sources, staged IDs, experiments, scoring dimensions, research branches, and validation queue are recorded under `run-res-005-20260812-expansion-iii` in `data/research-runs.json`.

The idempotent writer is `scripts/ingest_deepresearch_expansion_iii_20260812.py`.
