# Validation Plan: FactBounty — Buyer-Funded Product Proof Exchange

- **Idea ID:** `idea-061`
- **Current Maturity:** `V2_PROBLEM_CORROBORATED` → Target: `V3_HUMAN_EVIDENCE`
- **Experiment ID:** `EXP-2026-001`
- **Pre-Registered Date:** `2026-08-22`
- **External Reality Observed:** `false` (Pre-registration state; awaiting recorded interview responses)

---

## 1. Core Hypothesis & Falsification Conditions

### Primary Value Hypothesis
> High-intent online shoppers purchasing fit-sensitive products (e.g. PC hardware, camera lenses, bespoke furniture, cycling accessories) frequently encounter unlisted or ambiguous physical specifications, and will pay a €3–€5 micro-bounty to receive guaranteed, verified visual proof from an existing verified owner or local retailer before purchasing.

### Refutation & Kill Thresholds (Fail-Closed)
- **KILL THRESHOLD 1 (Free Return Substitution):** If $\ge 4/5$ interviewed shoppers state that generous return policies (e.g. Amazon free returns) make pre-purchase micro-payments unnecessary regardless of return friction.
- **KILL THRESHOLD 2 (Responder Latency):** If simulated responder response times exceed 24 hours, causing shoppers to make buying decisions before proof arrives.
- **KILL THRESHOLD 3 (LLM/Search Sufficiency):** If existing Reddit / specialized forums already provide 100% resolution within 5 minutes for $>80\%$ of sample test queries.

---

## 2. 5-Interview Discovery Protocol (30 Minutes Each)

### Participant Screening Criteria
- Must have made $\ge 3$ online consumer purchases over €50 in the last 60 days.
- Must have initiated at least 1 return or post-purchase exchange due to incorrect physical dimensions, missing ports/brackets, or unstated revision variations.

### Interview Structure

#### Section A: Past Behavior & Purchase Pain (10 Mins)
1. "Think back to the last time you bought a product online where you had a specific question that wasn't answered in the product description. What was the question?"
2. "Where did you look to find the answer? How long did you spend searching?"
3. "Did you buy the item anyway, contact support, or abandon the purchase?"
4. "If you bought it, did it fit/work as expected? What happened next?"

#### Section B: Interactive Concept Walkthrough (10 Mins)
- Show the interactive FactBounty request UI flow (`apps/factbounty/`):
  1. *Buyer posts question: "What is the exact clearance height between the heatsink and the first PCIe slot on the rev 2.0 board?" + €4 bounty.*
  2. *Verified owner receives notification with caliper photo challenge.*
  3. *Reviewer checks checklist compliance.*
  4. *Buyer unlocks verified high-res photo with caliper measurement.*

#### Section C: Economic Willingness-To-Pay & Commitment (10 Mins)
5. "If this service had existed when you were researching that item, would you have paid €3 to get an answer with photo proof in under 4 hours?"
6. "Why or why not?"
7. "What is the maximum amount you would pay for a definitive answer before returning an item becomes more attractive?"
8. "Would you be willing to test a real request today for a live item you are considering?"

---

## 3. Decision Gate Rules

| Observed Outcome | Score Impact | Action |
| :--- | :---: | :--- |
| $\ge 3/5$ confirm WTP $\ge €3$ + provide active pending purchase question | $+15$ pts Confidence | Advance to `V4_REAL_WORKFLOW_DATA` (Concierge MVP pilot) |
| $2/5$ confirm WTP | $0$ pts | Narrow target category to high-ticket used goods / niche hardware |
| $\le 1/5$ confirm WTP | $-25$ pts / KILL | Archive consumer model; pivot to B2B enterprise return prevention |

---

## 4. Evidence Receipt Signature
- **Experiment Status:** `ACTIVE_PRE_REGISTERED`
- **Execution Scope:** `LOCAL_PRODUCTION`
- **Receipt Hash:** `exp-061-v3-prereg-20260822`
