# Agent Risk Ledger — Autonomous Agent Underwriting Telemetry

> **STAGED HYPOTHESIS — RESET XIX (2026-08-20)**  
> *This idea is in the validation staging queue and is not yet promoted to canonical rankings.*  
> **Provisional Thesis Score:** 90.0/100 | **Evidence Confidence:** 55/100 | **Market Proof:** 0/100 | **Status:** Watch

> Telematics and trace-level underwriting infrastructure for autonomous AI agent risk transfer and insurance.

## At a Glance

| Field | Summary |
|---|---|
| Candidate ID | `candidate-reset-xix-agent-risk-ledger` |
| Target customer | Specialty cyber/E&O insurers, AI-native MGAs, reinsurance innovation desks, AI vendors bundling performance warranties |
| Problem | Insurers cannot accurately price or monitor autonomous AI agent risk without trace-level data on delegated authority, tool exposure, policy violations, and actual economic loss events. |
| What to build | Structured telemetry collection pipeline and exposure scoring engine (`AgentRiskEpisode`) that captures authority boundaries, financial limits, tool permissions, and near-misses, translating trace data into actuarial underwriting reports. |
| How it makes money | Per-episode telemetry ingestion fees, annual insurer underwriting API subscriptions, and data licensing for cross-company loss benchmarks. |
| Why customers pay | Underwriters cannot issue affirmative coverage without empirical exposure telemetry, while AI vendors need insured warranties to close high-value enterprise deals. |
| Overall opportunity score | 90.0/100 (provisional research hypothesis) |
| Confidence | 5.5/10 |
| Main advantage | Cross-company agent loss experience dataset; independent verifier positioning between AI vendors and risk carriers. |
| Main risk | Insurers building internal telemetry standards or observability platforms absorbing the underwriting layer. |
| Best next validation | Conduct 10 structured interviews with cyber/technology insurance brokers and MGA underwriters using a mock `AgentRiskEpisode` fixture. |

## Detailed Concept & Problem Statement

Autonomous agents are transitioning from conversational assistants to economically consequential actors capable of executing payments, reconfiguring cloud infrastructure, modifying customer databases, and issuing contractual commitments. 

Conventional insurance policies either exclude AI risks or embed unpriced exposure. Specialized products like Munich Re *aiSure* and Armilla AI exist, but underwriting remains bottlenecked by the absence of historical actuarial tables.

Recent research (arXiv:2606.16465, arXiv:2607.11999, arXiv:2606.05449) establishes that AI agent risk is determined not by the base foundation model name, but by **trace-economic parameters**:
- Delegated financial authority and transactional thresholds
- Tool permissions and blast radius
- Deterministic guardrail boundaries and human approval policies
- Runtime exception frequency, near-miss events, and recovery trajectories

## Telemetry Record Structure (`AgentRiskEpisode`)

For every economically significant agent workflow, the platform records:
```json
{
  "episodeId": "ep-94821a-20260820",
  "principal": "Enterprise Corp",
  "agentModel": "claude-3-5-sonnet",
  "agentRole": "Procurement Agent",
  "task": "Execute purchase order batch under master vendor agreement",
  "maximumValueAtRisk": 50000.00,
  "currency": "EUR",
  "toolsAvailable": ["erp_read", "erp_po_create", "vendor_catalog_api", "email_send"],
  "financialAuthority": {
    "autonomousLimitAmount": 10000.00,
    "humanApprovalThreshold": 10000.00,
    "approvedCounterparties": ["VendorA", "VendorB"],
    "paymentAccessLevel": "conditional"
  },
  "humanApprovalPolicy": "threshold-based",
  "actionsTaken": 42,
  "irreversibleActions": 3,
  "policyViolations": 1,
  "guardrailEvents": 2,
  "nearMiss": true,
  "nearMissDescription": "Agent attempted vendor creation outside approved catalog; blocked by deterministic gate",
  "actualLoss": 0.00,
  "recovery": "automatic"
}
```

## Defensibility & The Data Flywheel

The long-term asset is the **cross-company agent loss dataset**:
1. Single observability vendors capture logs for debugging, not underwriting claims.
2. Individual insurers lack sufficient cross-ecosystem sample volume.
3. As claims and near-misses accumulate across millions of episodes, the platform establishes empirical loss distribution curves for specific authority topologies (e.g., "Procurement agents with browser access above €10k threshold exhibit 3.4x higher severity in tail loss events").

## Kill Conditions & 7-Day Falsification Test

- **Kill Condition 1:** Insurer internalization — Munich Re, Armilla, or global carriers enforce proprietary closed telemetry formats.
- **Kill Condition 2:** Observability platform absorption — Datadog, Fiddler, or Dynatrace ship native underwriting connectors that capture the workflow.
- **Kill Condition 3:** Enterprise privacy refusal — Enterprises refuse to transmit trace metadata even under zero-knowledge/anonymized aggregation.
- **Kill Condition 4:** Absence of material losses — AI agent operations remain low-stakes or indemnified by foundation model providers directly.

### 7-Day Experiment
Create `agent-risk.json` schema fixture and generate a simulated underwriting risk report for 1,000 procurement agent runs. Pitch 10 cyber insurance brokers and MGA underwriters.  
**Kill Trigger:** If fewer than 3 of 10 confirm that trace-level telemetry would materially alter limits, pricing, or insurability decisions -> **KILL**.

## Nearest Corpus Relations (Dedupe Status)
- `agent-loss-exchange-autonomous-agent-claims-data-utility`: Close overlap; historical notes merged into this hypothesis.
- `agentwarranty-warranty-infrastructure-autonomous-work`: Downstream financial guarantee layer; complementary partner.
- `agentratings-reliability-roi-ratings`: Upstream performance rating tool; distinct buyer persona.
