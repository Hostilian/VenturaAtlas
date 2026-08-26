# TERRAIN — Problem × Job × Workflow Architecture & Data Model

> **Core Axiom:** *Problem First. Solution Second.*

TERRAIN is the upstream world-modeling layer of **Venture Atlas OS**. It models real-world customer workflows, jobs-to-be-done, operational frictions, and current workarounds before any venture solution is conceived or evaluated.

---

## 1. Domain Ontology

```
REAL-WORLD ACTOR
       │
       ▼
   CONTEXT + TRIGGER
       │
       ▼
  JOB-TO-BE-DONE (JTBD)
       │
       ▼
CURRENT-STATE WORKFLOW
  ├── Steps (1..N) [Order, Actor, Action, Input, Output, System]
  ├── Artifacts & Systems [Official vs. Shadow (e.g. Excel)]
  ├── Handoffs [Cross-organization delays & channels]
  └── Frictions [Uncertainty, Integration, Format, Waiting, Trust]
       │
       ▼
    PROBLEM
  ├── Causal Consequences (Chain of Inaction)
  ├── Current Alternatives & Satisfaction Level
  ├── Desired Outcomes (Solution-neutral metrics)
  ├── Evidence [Strict Epistemic Labels]
  └── Counterevidence [Preserved per §32]
       │
       ▼
PROBLEM↔IDEA RELATION
  ├── Relation Type (ADDRESSES, PARTIALLY_ADDRESSES, etc.)
  ├── Workflow Step Coverage (Which steps the idea touches)
  └── Residual Problem Reality (What remains unsolved)
       │
       ▼
CANONICAL VENTURE IDEAS (data/ideas.json)
```

---

## 2. Schema Entities (`schemas/`)

### 1. `TerrainActor` (`schemas/terrain-actor.schema.json`)
Represents an external job-performer role in a customer workflow.
*Rule (§12):* This is **never** an internal org role (which belongs to CONSTELLATION). It models real people performing work in target markets.
- `actorId`: Pattern `^actor-[a-z0-9-]+$`
- `role`: Specific domain title (e.g. *"Accounts Payable Clerk at a 3PL"*, not *"Business User"*)
- `organizationType`: Type of company/institution (e.g. *"Commercial Building Operator"*)
- `responsibility`: What this actor is held accountable for

### 2. `TerrainJob` (`schemas/terrain-job.schema.json`)
A solution-independent job statement based on Jobs-to-be-Done (JTBD) principles.
*Rule (§21):* Must pass the **5-Alternative Test** — solvable by at least 5 different technologies or operating models.
- `jobId`: Pattern `^job-[a-z0-9-]+$`
- `statement`: Formula: `Verb + Object + Context` (e.g. *"Verify that an installed energy retrofit delivered the contractually agreed performance outcome before releasing final payment"*)
- `desiredOutcomes`: Direction + Metric + Object statements (e.g. *"Minimize the time required to resolve disputes about baseline savings"*)

### 3. `TerrainWorkflow` (`schemas/terrain-workflow.schema.json`)
A current-state workflow map documenting how work is done **today**.
*Rule (§24):* Models pre-solution state only. Never document a future product's workflow here.
- `steps`: Sequential array with `order`, `actor`, `action`, `input`, `output`, `system`, and `isShadowSystem` flags.
- `systems`: Systems of record vs. shadow tools (e.g. unmanaged spreadsheets, email chains).
- `frictions`: Typed operational bottlenecks (`TIME`, `WAITING`, `MANUAL_EFFORT`, `ERROR`, `UNCERTAINTY`, `COORDINATION`, `FORMAT_TRANSFORMATION`, `ACCESS`, `TRUST`, `INTEGRATION`, etc.).
- `workarounds`: What performers actually do when systems fail.
- `asOf`: Date authored (to track workflow decay over time).

### 4. `TerrainProblem` (`schemas/terrain-problem.schema.json`)
The core problem entity.
*Rule (§270):* Must not manufacture problems to justify pre-existing ideas.
- `status`: `HYPOTHESIS` → `WEAK_EVIDENCE` → `OBSERVED` → `REPEATED` → `WELL_SUPPORTED` → `CONTESTED` → `REJECTED` → `STALE`.
- `evidence`: Every item requires an `epistemic` label:
  - `OBSERVED`: Witnessed first-hand in production or primary field research.
  - `DIRECTLY_REPORTED`: Stated directly by a practitioner in an interview.
  - `DOCUMENTED`: Recorded in regulatory filings, court transcripts, or audited reports.
  - `SOURCE_SUPPORTED_INFERENCE`: Inferred directly from published literature or industry whitepapers.
  - `AI_HYPOTHESIS`: Extracted by model from existing idea dossiers (Default for seed data).
- `counterEvidence`: Evidence indicating the problem is weak, solved, or non-existent in certain customer segments (§32).
- `researchGaps`: Explicit open questions requiring direct user discovery (§474).

### 5. `TerrainProblemRelation` (`schemas/terrain-problem-relation.schema.json`)
Explicit semantic edge connecting a problem to a canonical venture idea.
*Rule (§524-§525):* Prevents claiming an idea "solves the problem" when it only touches specific steps.
- `workflowCoverage`: Array of specific workflow step IDs affected by the idea.
- `residualProblem`: Mandatory statement of what remains unsolved after the idea is deployed.
- `newProblems`: Potential new frictions created by the solution (e.g., AI oversight requirements).

---

## 3. Epistemic Rules & Contribution Discipline

1. **No Synthetic Interviews (§475):** Never fabricate synthetic interview quotes as evidence.
2. **Honest Labeling (§270):** Seed problems derived from idea text must be tagged `AI_HYPOTHESIS`. Never promote to `OBSERVED` without citing primary empirical evidence.
3. **No Solution Language in Problem Definitions (§19):** Problem titles and statements must not contain words like *"Need an AI platform"*, *"Need an app"*, or *"Our product"*.
4. **Counterevidence Preservation (§32):** If research reveals that large buyers already have satisfactory workarounds or that regulations simplify the problem, record it under `counterEvidence`. Do not discard inconvenient evidence.
5. **Residual Problem Honesty (§525):** Every idea relation must document what remains unsolved.

---

## 4. Anti-Pattern Checklist (§551)

| Anti-Pattern | Bad Example | Good TERRAIN Practice |
|---|---|---|
| **Solution Masquerading as Problem** | "Mid-size 3PLs lack an AI-powered freight audit dashboard." | "Freight auditors spend 12 hours/week manually matching paper BOLs to carrier invoices." |
| **Generic Pain Adjectives** | "Legacy supply chains suffer from massive inefficiency and friction." | "Warehouse clerks manually copy container IDs between SAP and Excel at shift handover." |
| **One Anecdote Universalized** | "All doctors hate their EHR software." | "Community clinic general practitioners report spending 2.5 hours nightly completing billing codes." |
| **Feature Request as Job** | "User wants a CSV export button." | "User needs to reconcile monthly invoice totals against bank statements in their local accounting tool." |
| **Disappearing Residuals** | "Our tool eliminates 100% of dispute risk." | "Tool provides shared baseline; parties must still negotiate baseline methodology at contract signing." |

---

## 5. Tooling & Automation

- **Validation:** `npm run validate:terrain` (validates schemas, referential integrity, privacy leaks, solution language).
- **Index Generation:** `npm run generate:terrain` (generates `data/terrain-index.json`).
- **Test Suite:** `node --test tests/terrain-contract.test.js` (runs contract tests).
- **Interactive UI:** Open `docs/terrain.html`.
