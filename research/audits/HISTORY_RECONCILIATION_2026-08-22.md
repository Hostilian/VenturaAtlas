# Full-History Idea Reconciliation

Date: 2026-08-22  
Scope: all 53 pasted-text packets available under `.codex/attachments/` plus repository Git history.

## Authority Rule

`data/ideas.json` is the canonical catalog. A historical packet's word "promote" is not, by itself, a canonical-write receipt: the later Omega rules require an evidence-backed lifecycle transition and duplicate check. Historical candidates that were merged, renamed, rejected, or kept as features are recorded below rather than silently counted as new canonical ideas.

## Findings

- Canonical catalog after reconciliation: **324** records.
- Highest assigned canonical ID: **`idea-446`**.
- Public staged count: **0**. Private staging remains withheld by design.
- The only confirmed canonical omission was the five-record August 22 promotion block: `idea-432` through `idea-436`. Those records are now present in `data/ideas.json`, with their paired dossiers, validation plans, and technical blueprints.
- Git history contains no deletion of `data/ideas.json`; no prior canonical record was removed and lost during this pass.
- The only numeric ID referenced by the pasted packets but absent from the current catalog is `idea-123`. It appears as an old research-task reference in OMEGA XIX, not as a new idea proposed for ingestion, so no synthetic record was created.

## Explicitly Reconciled New Block

| ID | Idea | Placement |
| --- | --- | --- |
| `idea-432` | BatteryDuty -- V2G Battery-Use Rights & Wear Clearinghouse | Canonical, deep validation |
| `idea-433` | HeatProof -- Retrofit Outcome Clearinghouse | Canonical, validate now |
| `idea-434` | FlexCovenant -- Industrial Flexibility Performance Contract OS | Canonical, deep validation |
| `idea-435` | WaterSpec -- Quality-Adjusted Reclaimed-Water Settlement | Canonical, deep research |
| `idea-436` | AltLine Drill -- Pharmaceutical Manufacturing Escape Route | Canonical, deep research |

## Historical Names Preserved Without Duplicate Canonical Records

These names were found in the older expansion and Omega packets and were checked against the current catalog, dossier directory, and later decision rules. Where a durable equivalent already exists, the existing record remains authoritative; where the packet later says feature, merge, watch, kill, or research-only, no second canonical record is fabricated.

- Existing-family or merge checks: `CRA Incident Compiler`, `AI Provenance Gateway`, `GreenClaim CI`, `Credential Firewall`, `DPP Bridge`, `Agent Action Flight Recorder`, `Cloud Exit Drill / ExitOps`, `Energy Sharing Settlement Router`, `MicroFee`, `BidProof`, `ReclaimRight`, `PartGate`, `AgeProof Lab`, `EHDS EHR Preflight CI`, `Micropollutant EPR Ledger`, `ICS2 Cargo Data Repair Gateway`, `Battery Passport Underwriting API`, `EUDR Plot Identity Repair`, `DAC8 Data Repair Engine`, `EHDS Study Permit Compiler`, and `NZIA Resilience BOM Compiler`.
- Historical candidate names with no unambiguous current canonical identity: `PackGate`, `EudaMirror`, `ChargeTruth`, `ESAP Relay`, `InvoiceRouteTruth`, `WalletMatrix`, `ShortageGraph`, `FuelChain Replay`, `MicroMass`, `FINTRAC ShadowTest`, `PortCall Replay`, `SprayReality`, `CarrierDecision Replay`, `Cyber Assurance Continuity OS`, `Medical Countermeasure Readiness OS`, `Critical Materials Offtake Bankability Engine`, `Talent Pool Hire-to-Arrival OS`, `Critical Materials Treasury`, `Strategic Project Permit Graph`, `Digital Euro Conformance CI`, `GovInterop CI`, and `Industrial Permit Diff Engine`.
- Intentionally non-canonical placements from the packets: `DataCenterTruth`, `FlexLoad Ledger`, `TapTruth`, `PFAS Archaeology Ledger`, `NAMFit Ledger`, `MandateMesh`, `NonFirm Replay`, `TrustList Sentry`, and the OMEGA XX proposals that the repository's later reset audit classified as duplicates, adjacent features, or research-only wedges.

This preserves the full historical idea surface for review without overstating canonical validation, ranking eligibility, or market proof. The live count surfaces now all agree with `data/repository-meta.json`.
