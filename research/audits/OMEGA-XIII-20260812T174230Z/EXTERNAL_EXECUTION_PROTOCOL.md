# OMEGA XIII external execution protocol

Status: prepared, not executed
Privacy boundary: every live assignment, contact receipt, interview note, randomization seed, and participant pseudonym remains under ignored `.agent-state/` storage.

This protocol closes the operational boundary around completion conditions 18 and 19. It does not close either condition by itself. Only real independent reviewer responses and real buyer evidence can do that.

## A. Reviewer-anchoring experiment

The experiment is paired by candidate. Each candidate receives one blind reviewer and one informed reviewer; reviewer IDs must be unique and cannot equal a preregistration author. A private random seed is committed before packets are issued. Blind packets exclude the preregistered verdict. Informed packets disclose it. Responses are immutable after lock.

Primary metric: mean paired informed-minus-blind alignment with the preregistered verdict on the ordinal `KILL → WAIT → CONTINUE` scale. Positive values mean the informed arm aligned more closely. The result is descriptive and never labeled causal proof.

Roster format:

```json
{
  "reviewerIds": [
    "independent-reviewer-001",
    "independent-reviewer-002"
  ]
}
```

There must be exactly two reviewers per candidate. The default prespecified minimum is ten candidate pairs.

Prepare:

```powershell
python scripts/anchoring-experiment.py prepare `
  --experiment-id anchor-omega13-independent-001 `
  --candidate-ids idea-001,idea-002,idea-003,idea-004,idea-005,idea-006,idea-007,idea-008,idea-009,idea-010 `
  --reviewer-roster .agent-state/anchoring-roster.json `
  --minimum-pairs 10
```

Each reviewer response must have exactly these fields:

```json
{
  "verdict": "WAIT",
  "proceedProbability": 45,
  "buyerEvidence": "No buyer contact in this reviewer assignment.",
  "budgetEvidence": "No budget evidence in this reviewer assignment.",
  "disconfirmations": ["Incumbent alternative"],
  "sourceRefs": ["s284"],
  "claimsNotEarned": ["customer validation", "causal anchoring"]
}
```

Lock and finalize:

```powershell
python scripts/anchoring-experiment.py lock-response `
  --experiment-id anchor-omega13-independent-001 `
  --assignment-id <assignment-id> `
  --reviewer-id <assigned-reviewer-id> `
  --response <private-response.json>

python scripts/anchoring-experiment.py finalize `
  --experiment-id anchor-omega13-independent-001
```

Condition 18 remains `MISSING_EXTERNAL` until all assignments are independently completed, locked, and finalized. A synthetic fixture or Codex-authored response cannot close it.

## B. Current staged-candidate commercial campaign

The private current-state campaign was prepared as `commercial-current-priority-20260814`. It contains 36 digest-bound packets—one for every staged candidate carrying all four required gates: `prioritizedForValidation=true`, `requiresExternalEvidence=true`, `promotionEligible=false`, and `status=staged`.

Current receipt counts are deliberately zero contacts and zero interviews. Preparing packets is not contacting buyers.

To prepare a future refreshed campaign from the then-current private queue:

```powershell
python scripts/commercial-research-campaign.py prepare `
  --campaign-id commercial-current-priority-<date> `
  --coordinator-id <operator-id>
```

A contact event requires non-empty delivery evidence. The command hashes the private evidence and stores only the label and digest in the campaign record:

```powershell
python scripts/commercial-research-campaign.py record-contact `
  --campaign-id commercial-current-priority-20260814 `
  --candidate-id <private-candidate-id> `
  --channel EMAIL `
  --evidence <private-delivery-export> `
  --evidence-label "redacted delivery receipt"
```

An interview cannot be recorded before a contact receipt. It requires a pseudonymous participant ID, buyer role, ordered timestamps, confirmed consent, separate evidence bytes, and exact findings. WTP maturity is restricted to `NONE`, `VERBAL_RANGE`, `BUDGET_CONFIRMED`, or `PROCUREMENT_STEP`; an interview cannot claim payment.

```json
{
  "lastPainfulEvent": "UNKNOWN",
  "currentWorkflow": "Describe the observed current workflow.",
  "quantifiedCost": "UNKNOWN",
  "budgetOwner": "Observed or UNKNOWN",
  "budgetRange": "Observed or UNKNOWN",
  "alternatives": ["Observed incumbent or workaround"],
  "dataAccess": "Observed lawful access boundary",
  "purchaseProcess": "Observed approval path",
  "disconfirmations": ["Negative evidence"],
  "wtpEvidence": "NONE",
  "claimsNotEarned": ["paid pilot", "repeat payment", "validated market"]
}
```

Condition 19 remains `MISSING_EXTERNAL` until real buyer contacts and interviews cover the current high-priority set with digest-bound evidence. Staged candidate IDs remain private; they do not enter the public canonical validation funnel until an authorized identity decision creates canonical lineage.

## C. Non-negotiable claim boundary

- A plan is not contact evidence.
- A delivery receipt is not an interview.
- An interview is not WTP unless the buyer actually provides budget evidence.
- Verbal WTP is not procurement action.
- Procurement action is not payment.
- One payment is not repeat payment or a validated market.
- No private participant identity or raw evidence belongs in Git or the public build.
