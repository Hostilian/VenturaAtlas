# Scoring Methodology

Each idea receives 25 scores from 0–10. Higher always means more attractive: **competitive advantage** is used instead of raw competition; **regulatory simplicity** instead of burden; **operational simplicity** instead of complexity. Every score includes a justification, confidence, and basis. Composite views are weighted averages multiplied by 10.

## Profiles

```json
{
  "overallOpportunity": {
    "problemSeverity": 7,
    "willingnessToPay": 7,
    "marketDemand": 6,
    "revenuePotential": 7,
    "grossMarginPotential": 5,
    "defensibility": 6,
    "scalability": 5,
    "easeOfDistribution": 5,
    "evidenceQuality": 6,
    "overallConfidence": 5
  },
  "bootstrapPotential": {
    "speedToFirstRevenue": 8,
    "lowStartupCost": 8,
    "easeOfMvp": 7,
    "grossMarginPotential": 7,
    "founderAccessibility": 6,
    "operationalSimplicity": 6,
    "willingnessToPay": 6
  },
  "soloFounderPotential": {
    "lowStartupCost": 8,
    "easeOfMvp": 8,
    "aiAutomationPotential": 8,
    "operationalSimplicity": 8,
    "founderAccessibility": 8,
    "easeOfDistribution": 5
  },
  "aiAgentPotential": {
    "aiAutomationPotential": 12,
    "easeOfMvp": 5,
    "scalability": 5,
    "dataAdvantagePotential": 5,
    "defensibility": 4
  },
  "fastestRevenue": {
    "speedToFirstRevenue": 16,
    "easeOfDistribution": 8,
    "lowStartupCost": 8,
    "easeOfMvp": 7,
    "willingnessToPay": 6
  },
  "highestProfitPotential": {
    "revenuePotential": 12,
    "grossMarginPotential": 10,
    "scalability": 9,
    "recurringRevenuePotential": 8,
    "defensibility": 7
  },
  "lowestCostLaunch": {
    "lowStartupCost": 20,
    "easeOfMvp": 8,
    "founderAccessibility": 5
  },
  "recurringRevenue": {
    "recurringRevenuePotential": 18,
    "retentionPotential": 10,
    "frequencyOfNeed": 8,
    "willingnessToPay": 5
  },
  "enterpriseOpportunity": {
    "willingnessToPay": 10,
    "revenuePotential": 12,
    "defensibility": 8,
    "dataAdvantagePotential": 6,
    "retentionPotential": 6
  },
  "consumerOpportunity": {
    "marketDemand": 10,
    "easeOfDistribution": 9,
    "globalPotential": 8,
    "lowStartupCost": 5,
    "frequencyOfNeed": 5
  },
  "localBusinessOpportunity": {
    "speedToFirstRevenue": 10,
    "easeOfDistribution": 8,
    "willingnessToPay": 8,
    "operationalSimplicity": 5
  },
  "marketplaceOpportunity": {
    "scalability": 10,
    "dataAdvantagePotential": 10,
    "defensibility": 8,
    "marketDemand": 7,
    "globalPotential": 7
  },
  "longTermDefensibility": {
    "defensibility": 18,
    "dataAdvantagePotential": 12,
    "competitiveAdvantage": 9,
    "retentionPotential": 6
  },
  "nontechnicalFounder": {
    "easeOfMvp": 10,
    "founderAccessibility": 12,
    "operationalSimplicity": 10,
    "lowStartupCost": 8,
    "regulatorySimplicity": 6
  },
  "technicalFounder": {
    "aiAutomationPotential": 9,
    "easeOfMvp": 6,
    "defensibility": 8,
    "dataAdvantagePotential": 8,
    "scalability": 7
  },
  "smallTeam": {
    "easeOfMvp": 7,
    "operationalSimplicity": 7,
    "scalability": 7,
    "easeOfDistribution": 6,
    "retentionPotential": 5
  },
  "littleCapital": {
    "lowStartupCost": 18,
    "speedToFirstRevenue": 8,
    "easeOfMvp": 7,
    "grossMarginPotential": 6
  },
  "highCapitalAvailable": {
    "marketDemand": 7,
    "revenuePotential": 12,
    "scalability": 12,
    "defensibility": 9,
    "globalPotential": 8
  }
}
```

## Sensitivity

See [`data/sensitivity-analysis.json`](../data/sensitivity-analysis.json). Rankings change when priorities change and must not be treated as objective truth.

## Experimental research dimensions — operational chokepoints

The August 2026 research pass adds three pre-ranking dimensions. They are not yet backfilled across the corpus and therefore must not be silently inserted into existing composite scores.

- **Operational Choke-Point**: Is there a specific moment—ship, dispatch, publish, approve, register, pay, release, sign, suspend, or import—where the workflow cannot safely continue until the failure is resolved?
- **Machine-Checkability**: Can the blocking condition be evaluated from deterministic state such as identifiers, dates, versions, schema fields, expiry, evidence presence, or cross-system diffs?
- **Evidence Compounding**: Does repeated use create a defensible dataset of failures, transformations, supplier reliability, external-state history, or process timing?

Candidates may record these dimensions as qualitative research observations. Weighting them requires a versioned scoring-method change, a corpus-wide backfill with explicit unknowns, sensitivity analysis, and regenerated rankings. Until then, any 0–100 score supplied by a research pass is an analyst-provisional score and is not ranking-eligible.

## Experimental research dimensions — production-failure markets (OMEGA XVII-B)

Added by the 18 August 2026 research pass (Regulatory Handshake / Production-Failure Markets). Not yet backfilled. Same backfill-before-ranking rules apply as the operational chokepoints above.

- **Transaction Blocking Power (TBP)** 0–10: How severely does a system failure block a real transaction? 0 = nice-to-have analysis; 4 = audit burden; 6 = release delayed; 8 = customer shipment blocked; 10 = legally impossible to proceed.
- **Preflight Advantage (PFA)**: How much cheaper is detecting the failure before committing the transaction vs. after? Consider: port storage costs, rework cost, customs penalty, shipment re-routing, deadline impact.
- **Government Fix Risk (GFR)** 0–10: 10 = startup is a workaround for one missing government UI button (disappears in a patch); 0 = underlying cross-company coordination problem persists regardless of official tooling improvements.
- **Interface Accessibility (IFA)** 0–10: 10 = public API + sandbox + docs; 7 = certified partner / test environment; 5 = accessible through customer systems; 3 = national implementation / agreements required; 0 = government-only inaccessible system.
- **Preflight Fidelity (PFF)** 0–10: How accurately does the pre-submission test environment predict real production behavior? Low fidelity = low product value even if the gate concept is sound.
- **Transaction Value at Risk (TVR)** 0–10: Order-of-magnitude financial value blocked by a single failure event. 2 = €100 API call; 5 = €5,000 SME order; 7 = €50,000 shipment; 9 = €500,000+ industrial transaction. Affects willingness-to-pay.
- **Production Pain Evidence (PPE)**: Enum describing the strongest source of evidence that operators currently experience the problem. Values: `none` | `inferred` | `consultant_reports` | `industry_association` | `named_company` | `multiple_companies` | `government_acknowledged` | `measured_transactions` | `paid_remediation`.

### Catalyst Type (upgrade from previous passes)

| Type | Meaning |
|------|---------|
| A | Speculative — proposal stage |
| B | Adopted — future law |
| C | Imminent — < 180 days |
| D | Applicable — requirement currently exists |
| E | Observable production failure — operators currently experiencing and reporting the pain |

Type E carries a strong problem-reality signal but does NOT automatically imply a high opportunity score. Temporary system bugs carry high Government Fix Risk and may disappear quickly.

### Research Saturation Rule (OMEGA XVII-B process guideline)

When `canonical_ideas > 250` and `active_experiments = 0`, autonomous research agents should allocate no more than ~30% of compute to new idea discovery. The remainder must go to: deduplication, fact refresh, competitive falsification, experiments, prototype outreach, and customer evidence collection.

### Promotion Tax (required before adding any new canonical idea)

The proposing agent must supply all of the following before a new canonical ID is allocated:
1. Nearest three existing ideas and why this is not a variant of any of them
2. Strongest named competitor
3. Available free substitute
4. Exact buyer persona
5. Exact mandatory interface the buyer must connect to
6. Exact failure mode (not hypothetical — sourced)
7. Why the failure is recurring (not a one-time bug)
8. Why the official system will not simply fix it within 12 months
9. Proposed 7-day falsification test with a PASS and KILL condition



---

## RESET XVIII � Zero-Baseline Methodology (2026-08-18)

### Purpose of the Reset

After 294+ canonical ideas with zero active experiments, the reset removes confidence before removing evidence. All old champion labels are discarded. All provisional scores are frozen pending revalidation.

### 8-Gate Binary Scoring System

Replaces decimal pseudo-precision during initial discovery. Each gate returns:
- GREEN � condition clearly satisfied
- YELLOW � uncertain or partially satisfied
- RED � condition fails or blocks

| Gate | Question |
|------|----------|
| Reality | Does the problem exist today, in production, with documented evidence? |
| Buyer | Can we name the exact payer, role, and trigger? |
| Frequency | Does the problem recur on each transaction/cycle? |
| Failure Cost | Is being wrong expensive in money, time, or liability? |
| Access | Can a startup technically reach and test the problem? |
| Substitute | Is there already a cheap or free solution (official or commercial)? |
| Experimentability | Can demand be tested cheaply in 7 days? |
| Expansion | Does solving the wedge lead to a larger addressable surface? |

A numeric score (0-100) is added ONLY after at least one gate check is backed by primary evidence.
Score type must be declared: reset-zero-baseline-provisional until upgraded by experiment.

### Free-Official-Tool Test (mandatory before recommending regulatory SaaS)

Before recommending any regulatory compliance product, first answer: Does the regulator already provide a portal, API, calculator, reference client, SDK, test harness, spreadsheet, validation tool, or free dataset? If yes, find what meaningfully remains painful. If nothing meaningful remains: KILL.

### Adversarial-First Research Rule

Do not search for reasons an idea is good until after recording at least three reasons it may be bad. This is mandatory before any promotion.

### Candidate Maturity Ladder

DISCOVERED -> DESK_RESEARCHED -> DESK_RESEARCHED_CURRENT -> SOURCE_CORROBORATED -> EXPERIMENT_DESIGNED -> EXPERIMENT_EXECUTED -> CUSTOMER_EVIDENCE -> WTP_EVIDENCE -> PAID_PILOT -> REPEATED_USAGE

Forbidden: Do not call any idea VALIDATED at maturity below EXPERIMENT_EXECUTED.

### Two-Tournament Structure

Tournament A (Structural/Regulatory): Mandatory interfaces, registries, compliance systems, government machine-to-machine transactions.
Tournament B (Unconstrained Market): AI, developer tooling, consumer, marketplaces, fintech, robotics, health, space, productivity, new behaviors, infrastructure.
Compare winners only after both searches are complete.

### Score Type Vocabulary

| Score Type | Meaning |
|-----------|---------|
| model-prior | LLM estimate only; no external evidence |
| reset-zero-baseline-provisional | RESET XVIII pass; 8-gate only; no experiment yet |
| analyst-provisional | Desk research; competitor/official-tool check done |
| source-corroborated | Primary sources confirm core claims |
| experiment-informed | At least one executed experiment informs the score |
| decision-grade | All promotion-tax requirements met; experiment executed |

### Reset Status Vocabulary

| Status | Meaning |
|--------|---------|
| FROZEN_PENDING_REVALIDATION | Old score; not currently revalidated; awaiting fresh evidence |
| DESK_RESEARCHED_CURRENT | Minimum threshold for re-entry into decision-grade ranking |
| ACTIVE_EXPERIMENT | Kill criteria pre-registered; test currently running |
| REVALIDATED | Passes current-law check + competitor search + buyer ID + experiment |
