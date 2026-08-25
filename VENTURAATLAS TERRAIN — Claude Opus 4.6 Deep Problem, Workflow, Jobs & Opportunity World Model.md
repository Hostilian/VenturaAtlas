# VENTURAATLAS — TERRAIN

# PROBLEM × JOB × WORKFLOW × FRICTION × DESIRED-OUTCOME × CURRENT-STATE × OPPORTUNITY WORLD MODEL

## MASSIVE INDEPENDENT MISSION

## For Google Antigravity using Claude Opus 4.6 (Thinking)

---

# 0. YOUR EXECUTION IDENTITY

You are operating inside Google Antigravity.

Preferred model:

```text
Claude Opus 4.6 (Thinking)
```

Do not behave like a chat assistant.

Behave like:

```text
SENIOR RESEARCH ARCHITECT
+
PRODUCT DISCOVERY LEAD
+
DOMAIN MODELER
+
DATA ARCHITECT
+
REPOSITORY ENGINEER
+
ADVERSARIAL REVIEWER
```

Your task is not merely to produce analysis.

Your task is to inspect the current VenturaAtlas repository, discover what already exists, deeply research the missing domain, design the minimum coherent architecture, implement it, test it, integrate it, dogfood it, attack your own conclusions, and leave the repository materially better.

---

# 1. VERY IMPORTANT: CURRENT HEAD OVERRIDES THIS PROMPT

This prompt may sit in a queue.

Other agents may modify VenturaAtlas before you execute.

Therefore this prompt is NOT authoritative about the exact repository state.

The repository at execution time is authoritative.

Begin with:

```bash
git status --short
git branch --show-current
git log --oneline --decorate -60
git diff --stat
git diff
git ls-files
```

Inspect recent commits.

Inspect recently added directories.

Inspect current `PROJECT_STATE.md`.

Inspect current `PROJECT_STATUS.md`.

Inspect current schemas.

Inspect current data.

Inspect current tests.

Inspect current public-site surfaces.

Inspect active decisions.

Inspect active experiments.

Inspect active venture state.

Never assume historical counts or structures remain current.

---

# 2. DO NOT START CODING IMMEDIATELY

First understand.

The required order is:

```text
OBSERVE
↓
MAP
↓
SEARCH
↓
CLASSIFY
↓
FIND GAPS
↓
FORM DOMAIN MODEL
↓
ATTACK DOMAIN MODEL
↓
DOGFOOD MODEL ON REAL DATA
↓
SIMPLIFY
↓
IMPLEMENT
↓
TEST
↓
DOGFOOD IMPLEMENTATION
↓
ADVERSARIAL REVIEW
↓
INTEGRATE
↓
DOCUMENT
```

Do not reverse this.

---

# 3. MISSION NAME

This mission is:

# TERRAIN

Its purpose is to build the **problem-world underneath the idea-world**.

VenturaAtlas should no longer know only:

```text
WHAT COULD WE BUILD?
```

It should increasingly know:

```text
WHAT ARE PEOPLE ACTUALLY TRYING TO ACCOMPLISH?

WHAT HAPPENS TODAY?

WHERE DOES WORK BREAK?

WHERE DOES TIME DISAPPEAR?

WHERE DOES MONEY DISAPPEAR?

WHERE DOES RISK ACCUMULATE?

WHERE DO PEOPLE COPY DATA BETWEEN SYSTEMS?

WHERE DO THEY WAIT?

WHERE DO THEY RECONCILE?

WHERE DO THEY VERIFY?

WHERE DO THEY CALL SOMEONE?

WHERE DO THEY CREATE A SPREADSHEET?

WHERE DO THEY MAKE EXCEPTIONS?

WHERE DO THEY WORK AROUND THE OFFICIAL PROCESS?

WHY DOES THE PROBLEM OCCUR?

WHO EXPERIENCES IT?

WHO CAUSES IT?

WHO MUST APPROVE IT?

WHAT TRIGGERS IT?

HOW OFTEN?

HOW BADLY?

WHAT DO THEY DO TODAY?

WHAT OUTCOME DO THEY ACTUALLY WANT?

AND WHICH VENTURE IDEAS, IF ANY, ADDRESS THAT REALITY?
```

---

# 4. CORE TRANSFORMATION

VenturaAtlas currently centers heavily on:

```text
IDEA
→ RESEARCH
→ SCORE
→ RANK
→ COMPARE
→ VALIDATE
→ BUILD
→ SELL
```

TERRAIN introduces the missing upstream layer:

```text
REAL-WORLD ACTOR
↓
CONTEXT
↓
TRIGGER
↓
JOB / GOAL
↓
CURRENT WORKFLOW
↓
STEPS
↓
TOOLS / SYSTEMS / DOCUMENTS
↓
HANDOFFS
↓
DECISIONS
↓
FRICTIONS
↓
FAILURES
↓
DELAYS
↓
WORKAROUNDS
↓
COST
↓
RISK
↓
DESIRED OUTCOME
↓
PROBLEM
↓
OPPORTUNITY ZONE
↓
POSSIBLE INTERVENTIONS
↓
VENTURE IDEAS
```

The key inversion is:

# PROBLEM FIRST. SOLUTION SECOND.

---

# 5. ABSOLUTE NON-OVERLAP CONTRACT

Many other missions already exist or may already have executed.

Do NOT recreate their domains.

---

# 6. OMEGA OWNS

OMEGA owns:

- repository truth;
- false-green prevention;
- projection correctness;
- identity integrity;
- CI;
- deployment;
- cloud;
- provider state;
- autonomous runtime;
- security;
- privacy infrastructure;
- repository-wide proof;
- evidence provenance infrastructure;
- source freshness machinery.

TERRAIN reuses these systems.

TERRAIN does not rebuild them.

---

# 7. ORBIT OWNS

ORBIT owns:

- venture portfolio allocation;
- real options;
- venture sequencing;
- resource envelopes;
- portfolio correlation;
- scenario allocation;
- forecasts;
- calibration;
- strategic assets.

TERRAIN does NOT decide how many ventures to fund.

It supplies a better map of the problem-world ORBIT can reason over.

---

# 8. MERCURY OWNS

MERCURY owns:

- actual commercial segments;
- prospecting;
- sales;
- economic buyers;
- pricing;
- messages;
- channels;
- CRM;
- objections;
- pipeline;
- revenue;
- retention.

TERRAIN owns the **solution-independent job and current workflow**.

Mercury owns the **commercial buying process around a proposed solution**.

Keep that distinction.

---

# 9. FORGE OWNS

FORGE owns:

- product thesis;
- requirements;
- product flows;
- prototypes;
- releases;
- telemetry;
- product learning.

TERRAIN maps:

```text
CURRENT WORLD
```

FORGE designs:

```text
FUTURE PRODUCT INTERVENTION
```

Do not merge them.

---

# 10. JURIS OWNS

JURIS owns:

- legal interpretation;
- contracts;
- licenses;
- regulatory obligations;
- IP.

TERRAIN may observe:

```text
workflow includes compliance review
```

or:

```text
regulation causes additional work
```

but legal interpretation belongs to JURIS.

---

# 11. CAPITAL OWNS

CAPITAL owns financing.

TERRAIN may discover:

```text
current process costs €X
```

if supported by problem evidence.

It does not decide fundraising.

---

# 12. CONSTELLATION OWNS

CONSTELLATION owns:

- internal team structure;
- people;
- roles inside our venture;
- hiring;
- delegation;
- organizational authority.

TERRAIN may model **external real-world roles participating in a customer workflow**.

That is different.

Example:

```text
CUSTOMER WORKFLOW ROLE:
Accounts Payable Clerk
```

does not mean:

```text
OUR TEAM ROLE:
Accounts Payable Clerk
```

---

# 13. RELAY OWNS

RELAY owns:

- our venture's fulfillment;
- delivery;
- support operations;
- capacity;
- quality;
- suppliers;
- operational costs.

TERRAIN maps how the **problem-holder operates before our solution exists**.

---

# 14. CHESSBOARD OWNS

CHESSBOARD owns:

- competitors;
- market structure;
- control points;
- platforms;
- market power;
- incumbent response;
- moats;
- commoditization.

TERRAIN maps the **job/workflow/problem**.

CHESSBOARD maps the **strategic battlefield around solutions**.

---

# 15. TERRAIN OWNS

TERRAIN owns:

# THE REAL-WORLD PROBLEM LANDSCAPE.

Specifically:

- job performers;
- jobs;
- desired outcomes;
- current workflows;
- workflow steps;
- triggers;
- contexts;
- artifacts;
- tools;
- systems;
- decisions;
- handoffs;
- queues;
- delays;
- failures;
- frictions;
- workarounds;
- compensating behaviors;
- current-state effort;
- current-state cost;
- current-state risk;
- problem statements;
- problem causality;
- problem families;
- problem evidence;
- opportunity zones;
- problem-to-idea mappings;
- cross-sector workflow analogies.

---

# 16. WHY THIS MATTERS

A repository can contain 1,000 clever startup ideas and still suffer from:

# SOLUTION BIAS.

The process becomes:

```text
invent solution
↓
search for reasons people might need it
↓
find supporting market statistics
↓
score idea
```

TERRAIN must enable:

```text
observe real work
↓
find recurring friction
↓
understand desired outcome
↓
understand current alternatives
↓
understand cause
↓
understand importance
↓
only then consider interventions
```

---

# 17. TERRAIN'S PRIME DIRECTIVE

Never create a problem merely to justify an existing idea.

---

# 18. SOLUTION CONTAMINATION

A statement like:

```text
Companies need an AI compliance assistant.
```

is NOT a clean problem statement.

It contains the proposed solution.

Rewrite toward reality:

```text
Compliance teams repeatedly collect evidence from multiple systems,
manually verify completeness,
and chase missing evidence before audit deadlines.
```

That describes work.

---

# 19. ANOTHER BAD PROBLEM

Bad:

```text
Users need blockchain verification.
```

Better:

```text
Counterparties cannot cheaply verify whether a submitted record
has been altered since issuance.
```

---

# 20. ANOTHER BAD PROBLEM

Bad:

```text
Developers need an AI code-quality platform.
```

Better:

```text
Engineering teams cannot consistently determine whether
agent-generated changes satisfy repository-specific behavioral
constraints before merge.
```

---

# 21. SOLUTION-NEUTRAL TEST

Before accepting a problem statement ask:

> Could five completely different technologies or business models plausibly address this?

If no:

the statement may be too solution-contaminated.

---

# 22. PROBLEM ≠ FEATURE REQUEST

Customer says:

```text
I need an Excel export.
```

This is not necessarily the underlying problem.

Possible underlying job:

```text
I need to transfer the analysis into the finance workflow
used by people who do not have access to this product.
```

TERRAIN captures both:

```text
OBSERVED REQUEST
```

and:

```text
INFERRED UNDERLYING JOB
```

separately.

---

# 23. PROBLEM ≠ PRODUCT CATEGORY

```text
Need better CRM
```

is not enough.

Ask what work fails.

---

# 24. PROBLEM ≠ PAIN ADJECTIVE

```text
Billing is frustrating.
```

is weak.

Ask:

```text
What exactly happened?

When?

What were you trying to do?

Which step failed?

What did you do next?

How long did it take?

What consequence followed?
```

---

# 25. OBSERVED BEHAVIOR > OPINION

Prefer:

```text
Last Tuesday I copied 146 invoice lines from the warehouse report
into Excel because the billing system grouped activities differently.
```

over:

```text
Our billing process could be more efficient.
```

---

# 26. PAST BEHAVIOR > HYPOTHETICAL INTENT

Prefer:

```text
Tell me about the last time.
```

over:

```text
Would you use a tool that...?
```

---

# 27. EPISODE-LEVEL EVIDENCE

Where possible, represent real problem episodes.

Conceptually:

```json
{
  "episodeId": "...",
  "actor": "...",
  "context": "...",
  "trigger": "...",
  "job": "...",
  "workflow": "...",
  "frictions": [],
  "workarounds": [],
  "consequences": [],
  "source": "...",
  "occurredAt": "..."
}
```

---

# 28. EPISTEMIC CONTRACT

Every TERRAIN assertion must be typed.

Use existing repository provenance if available.

At minimum distinguish:

```text
OBSERVED

DIRECTLY_REPORTED

DOCUMENTED

SOURCE_SUPPORTED_INFERENCE

ANALYST_INFERENCE

AI_HYPOTHESIS

USER_HYPOTHESIS

UNKNOWN
```

---

# 29. UNKNOWN IS VALID

Never turn:

```text
UNKNOWN
```

into:

```text
probably yes
```

because the UI looks nicer.

---

# 30. CLAUDE-SPECIFIC FAILURE MODE

Claude Opus can produce extremely coherent explanations.

Coherence is not evidence.

Never allow:

```text
beautiful explanation
```

to substitute for:

```text
observed fact
```

---

# 31. CLAIM FALSIFIABILITY

For major inferred problems ask:

```text
What evidence would show this problem is not important?
```

---

# 32. COUNTEREVIDENCE

Store evidence against problem hypotheses.

Example:

```text
3 interviewees say reconciliation takes hours.

2 others say their ERP already automates it fully.
```

Do not discard the latter.

---

# 33. PROBLEM OBJECT

Design a coherent problem entity.

Conceptually:

```json
{
  "problemId": "problem-...",
  "title": "...",
  "description": "...",
  "jobIds": [],
  "actorIds": [],
  "workflowStepIds": [],
  "contexts": [],
  "triggers": [],
  "frictions": [],
  "consequences": [],
  "currentWorkarounds": [],
  "desiredOutcomeIds": [],
  "evidence": [],
  "status": "...",
  "asOf": "..."
}
```

Adapt to current architecture.

---

# 34. PROBLEM IDENTITY

Problems need stable identities.

Do not assign identity solely based on wording.

These may be the same problem:

```text
Reconciling invoice activity
```

and:

```text
Matching warehouse activity to customer invoices
```

Use semantic identity carefully.

---

# 35. PROBLEM DEDUPLICATION

Create deterministic + semantic assistance.

Potential criteria:

```text
same actor?

same job?

same workflow location?

same cause?

same consequence?

same desired outcome?
```

---

# 36. DO NOT OVER-MERGE

Two similar symptoms may have different causes.

Example:

```text
Invoice delayed because data missing
```

versus:

```text
Invoice delayed because approval queue slow.
```

---

# 37. DO NOT OVER-SPLIT

Minor wording differences should not create hundreds of duplicate problems.

---

# 38. PROBLEM FAMILY

Support families.

Example:

```text
EVIDENCE COLLECTION
├── collecting evidence
├── checking completeness
├── validating provenance
└── chasing missing evidence
```

---

# 39. PARENT / CHILD PROBLEMS

A broad problem may contain narrower subproblems.

---

# 40. SYMPTOM VS ROOT PROBLEM

Explicitly distinguish.

Example:

```text
SYMPTOM:
invoice sent late

CAUSE:
warehouse activity cannot be reconciled automatically

UPSTREAM CAUSE:
activity identifiers differ across systems
```

---

# 41. CAUSAL GRAPH

Where justified, represent:

```text
A CONTRIBUTES_TO B
```

Do not claim hard causality from correlation.

---

# 42. CAUSAL EDGE STATES

Possible:

```text
OBSERVED_SEQUENCE

PLAUSIBLE_CAUSE

REPORTED_CAUSE

CONFIRMED_CAUSE

UNKNOWN
```

---

# 43. ROOT-CAUSE HUMILITY

Do not endlessly run "five whys" until you invent philosophy.

Stop where evidence stops.

---

# 44. JOB PERFORMER

Create first-class external job performers.

Conceptually:

```text
ROLE:
Warehouse Billing Coordinator
```

not vague:

```text
business user
```

---

# 45. JOB-PERFORMER OBJECT

Potential fields:

```text
role
organizationType
responsibility
context
authority
inputs
outputs
relatedRoles
```

---

# 46. PERSONA ≠ JOB PERFORMER

Do not invent demographic personas unless relevant.

Often:

```text
Head of Compliance at a 200-person manufacturer
```

is more useful than:

```text
Sophie, 34, likes coffee.
```

---

# 47. ROLE CONTEXT

Same title may perform different jobs in different organizations.

---

# 48. JOB

A Job is what a performer is trying to accomplish.

It should generally be solution-independent.

---

# 49. JOB OBJECT

Conceptually:

```json
{
  "jobId": "...",
  "performerIds": [],
  "statement": "...",
  "contexts": [],
  "triggers": [],
  "desiredOutcomes": [],
  "steps": [],
  "relatedProblems": [],
  "evidence": []
}
```

---

# 50. JOB STATEMENT QUALITY

Prefer:

```text
Reconcile chargeable warehouse activity before issuing a customer invoice.
```

over:

```text
Use software to reconcile warehouse activity.
```

---

# 51. JOB GRANULARITY

Too broad:

```text
Run my company.
```

Too narrow:

```text
Click the export button.
```

Seek meaningful work units.

---

# 52. NESTED JOBS

Support:

```text
CORE JOB
RELATED JOB
SUPPORTING JOB
```

without forcing one JTBD school's terminology universally.

---

# 53. FUNCTIONAL JOB

The work to accomplish.

---

# 54. EMOTIONAL JOB

Where evidence supports:

```text
feel confident the audit will not reveal missing evidence
```

Do not fabricate emotional needs.

---

# 55. SOCIAL JOB

Where evidence supports:

```text
demonstrate reliability to customer
```

Again, do not infer casually.

---

# 56. DESIRED OUTCOME

Separate:

```text
what user wants to accomplish
```

from:

```text
how our product accomplishes it.
```

---

# 57. OUTCOME OBJECT

Conceptually:

```text
actor
job
direction
metric/quality
object
context
evidence
```

---

# 58. OUTCOME EXAMPLE

```text
Minimize the time required to verify that all mandatory evidence
has been collected before submission.
```

---

# 59. OUTCOME ≠ FEATURE

Bad:

```text
Automatically generate a dashboard.
```

---

# 60. OUTCOME METRIC

Where real users measure success, capture it.

Examples:

```text
time
error
delay
cost
completeness
risk
effort
confidence
```

---

# 61. DO NOT INVENT IMPORTANCE SCORES

Do not assign:

```text
importance = 9.2
```

without data.

---

# 62. OBSERVED IMPORTANCE SIGNALS

Potential signals:

```text
money spent

staff assigned

deadline

executive attention

manual workaround

repeated escalation

penalties

lost revenue

customer complaint

overtime

regulatory consequence
```

---

# 63. CURRENT WORKFLOW

This is one of TERRAIN's core objects.

Model what actually happens today.

---

# 64. WORKFLOW OBJECT

Conceptually:

```json
{
  "workflowId": "...",
  "name": "...",
  "actorIds": [],
  "trigger": "...",
  "goal": "...",
  "steps": [],
  "artifacts": [],
  "systems": [],
  "handoffs": [],
  "decisions": [],
  "failurePoints": [],
  "endState": "...",
  "evidence": []
}
```

---

# 65. CURRENT-STATE ONLY

Default workflow map describes:

```text
HOW WORK IS DONE NOW
```

not:

```text
HOW OUR PRODUCT COULD DO IT
```

---

# 66. FUTURE STATE BOUNDARY

FORGE/RELAY can create future-state process after solution selection.

TERRAIN stays current-state unless explicitly comparing.

---

# 67. WORKFLOW STEP

Each step may include:

```text
actor
action
input
output
system
artifact
duration
wait
decision
handoff
friction
```

---

# 68. STEP OBJECT

Create only if valuable.

Do not over-normalize trivial steps into unusable schema complexity.

---

# 69. START TRIGGER

What initiates the workflow?

Examples:

```text
customer places order
audit date approaches
employee joins
invoice arrives
shipment received
incident occurs
manager requests report
```

---

# 70. END CONDITION

How does performer know job is done?

---

# 71. HAPPY PATH ≠ REAL PATH

Document exceptions.

---

# 72. EXCEPTION PATHS

Many opportunities live in exceptions.

---

# 73. EXCEPTION WORK

Examples:

```text
record missing
invoice mismatch
approval rejected
shipment incomplete
identity cannot be verified
data format invalid
customer changes requirement
```

---

# 74. EXCEPTION DENSITY

A workflow with frequent exceptions may contain strong opportunity.

Do not infer value without evidence.

---

# 75. HIDDEN LABOR

Look for work absent from official SOP.

Examples:

```text
personal spreadsheets

Slack messages

email reminders

manual copy/paste

private notes

phone calls

calendar reminders

shadow databases
```

---

# 76. SHADOW SYSTEM

First-class concept.

A shadow system is an unofficial tool/process used because official system does not support actual work.

---

# 77. SHADOW SYSTEM EXAMPLES

```text
Excel

Google Sheets

email folder

WhatsApp

Notion table

personal script

paper notebook
```

---

# 78. SHADOW SYSTEM ≠ AUTOMATIC PROBLEM

Sometimes spreadsheets are excellent.

Ask why they are used.

---

# 79. COMPENSATING BEHAVIOR

A workaround that compensates for workflow deficiency.

---

# 80. WORKAROUND OBJECT

Potential fields:

```text
problem
actor
method
frequency
cost
limitations
reasonUsed
```

---

# 81. WORKAROUND EVIDENCE

A person paying for or repeatedly maintaining a workaround can be meaningful evidence.

---

# 82. NONCONSUMPTION

Sometimes people simply do not perform the desired job because current alternatives are too difficult/expensive.

Represent.

---

# 83. DO NOTHING

Valid current alternative.

---

# 84. MANUAL LABOR

Valid current alternative.

---

# 85. INTERNAL BUILD

Valid current alternative.

---

# 86. CONSULTANT

Valid current alternative.

---

# 87. OFFICIAL SOFTWARE

Valid current alternative.

CHESSBOARD later handles competitors structurally.

---

# 88. ARTIFACT

Create first-class work artifacts where valuable.

Examples:

```text
invoice

PDF

spreadsheet

audit packet

ticket

email

contract

CSV

form

image

report

API response

purchase order

certificate
```

---

# 89. ARTIFACT OBJECT

Conceptually:

```text
artifactType
createdBy
consumedBy
createdAtStep
usedAtSteps
format
manualTransformations
problems
```

---

# 90. ARTIFACT TRANSFORMATION

Strong opportunity often appears where an artifact repeatedly changes format.

Example:

```text
PDF
→ manually read
→ spreadsheet
→ email
→ ERP
```

---

# 91. DATA RE-ENTRY

Explicit problem archetype.

---

# 92. DUPLICATE ENTRY

Track where same information is entered multiple times.

---

# 93. RECONCILIATION

Explicit archetype.

```text
system A says X
system B says Y
human must reconcile
```

---

# 94. VERIFICATION

Explicit archetype.

```text
someone must verify that a claim/document/result is correct
```

---

# 95. EVIDENCE COLLECTION

Explicit archetype.

---

# 96. APPROVAL

Explicit archetype.

---

# 97. QUEUE TRIAGE

Explicit archetype.

---

# 98. ROUTING

Explicit archetype.

---

# 99. MATCHING

Explicit archetype.

---

# 100. SCHEDULING

Explicit archetype.

---

# 101. EXCEPTION HANDLING

Explicit archetype.

---

# 102. REPORTING

Explicit archetype.

---

# 103. COMPLIANCE DOCUMENTATION

Explicit archetype.

---

# 104. AUDIT PREPARATION

Explicit archetype.

---

# 105. IDENTITY / AUTHENTICATION WORK

Explicit archetype when user workflow relevant.

---

# 106. MIGRATION

Explicit archetype.

---

# 107. COORDINATION

Explicit archetype.

---

# 108. HANDOFF

Explicit archetype.

---

# 109. SEARCH / DISCOVERY

Explicit archetype.

---

# 110. CLASSIFICATION

Explicit archetype.

---

# 111. REVIEW

Explicit archetype.

---

# 112. MONITORING

Explicit archetype.

---

# 113. REMEDIATION

Explicit archetype.

---

# 114. CALCULATION

Explicit archetype.

---

# 115. NEGOTIATION

Explicit archetype where workflow evidence shows it.

---

# 116. PAYMENT / COLLECTION

Explicit archetype.

---

# 117. SETTLEMENT

Explicit archetype.

---

# 118. DOCUMENT GENERATION

Explicit archetype.

---

# 119. EXTRACTION

Explicit archetype.

---

# 120. TRANSLATION

Explicit archetype.

---

# 121. PROCESS ARCHETYPE REGISTRY

Do not invent hundreds.

Start small based on actual recurring patterns found in canonical ideas/research.

---

# 122. WHY ARCHETYPES MATTER

They enable cross-sector analogy.

Example:

```text
medical prior authorization
```

and:

```text
insurance claims approval
```

may share:

```text
evidence collection
→ review
→ exception
→ approval
```

despite different industries.

---

# 123. CROSS-SECTOR ANALOGY

This should become a major TERRAIN capability.

Ask:

> Where else does structurally similar work occur?

---

# 124. ANALOGY ≠ SAME MARKET

Do not merge industries merely because workflows resemble.

Store:

```text
structural similarity
```

separately from:

```text
market similarity.
```

---

# 125. ANALOGY OBJECT

Potential:

```text
workflow A
workflow B
shared pattern
important differences
transferable mechanism
```

---

# 126. ANALOGICAL DISCOVERY

If one sector solved a workflow efficiently and another has not:

that can inspire research.

Do not automatically create venture.

---

# 127. HANDOFF

First-class relationship.

---

# 128. HANDOFF OBJECT

Potential:

```text
fromActor

toActor

artifact

condition

channel

delay

failure

clarificationFrequency
```

---

# 129. HANDOFF FRICTION

Strong examples:

```text
information incomplete

format mismatch

ownership unclear

receiver does not trust sender

context lost

duplicate review

waiting
```

---

# 130. ORGANIZATIONAL BOUNDARY

Cross-company handoffs may be especially frictional.

---

# 131. DEPARTMENT BOUNDARY

Likewise.

---

# 132. SYSTEM BOUNDARY

Likewise.

---

# 133. DECISION

Model important decisions inside workflow.

---

# 134. DECISION OBJECT

Potential:

```text
decision
actor
inputs
rules
ambiguity
consequence
reversibility
```

---

# 135. DECISION FRICTION

Examples:

```text
missing information

unclear rule

subjective judgment

approval bottleneck

risk aversion

conflicting goals
```

---

# 136. AUTOMATION TEMPTATION

Do not immediately label decision friction:

```text
AI opportunity
```

First understand whether judgment is necessary.

---

# 137. FRICTION

Create a friction model.

---

# 138. FRICTION TYPES

Possible:

```text
TIME

WAITING

MANUAL EFFORT

ERROR

REWORK

UNCERTAINTY

COORDINATION

SEARCH

DATA ENTRY

FORMAT TRANSFORMATION

APPROVAL

ACCESS

TRUST

RISK

COST

INTERRUPTION

CONTEXT SWITCH

DUPLICATION

INTEGRATION

EXCEPTION

TRAINING

MEMORY
```

---

# 139. FRICTION OBJECT

Conceptually:

```text
where
who
type
description
frequency
severity evidence
consequence
workaround
source
```

---

# 140. NO FRICTION SCORE WITHOUT DATA

Do not turn every friction into 8/10.

---

# 141. FREQUENCY

Possible evidence:

```text
per transaction

daily

weekly

monthly

quarterly

event-driven

rare
```

---

# 142. RARE BUT CRITICAL

Do not dismiss low-frequency events.

Example:

```text
annual audit failure
```

may be extremely costly.

---

# 143. SEVERITY

Represent through evidence:

```text
time lost

money lost

revenue delayed

risk

penalty

customer harm

work stopped
```

---

# 144. CONSEQUENCE

First-class.

---

# 145. CONSEQUENCE CHAIN

Example:

```text
missing evidence
→ reviewer waits
→ approval delayed
→ shipment blocked
→ customer payment delayed
```

---

# 146. DIRECT VS DOWNSTREAM CONSEQUENCE

Distinguish.

---

# 147. COST

Where evidence exists, capture:

```text
labor cost

external spend

delay cost

penalty

lost revenue

rework

inventory carrying

opportunity cost
```

Do not invent currency values.

---

# 148. CURRENT SPEND

Current spend can indicate problem seriousness.

Examples:

```text
software subscription

consultants

outsourcing

staff

insurance

compliance services
```

---

# 149. SPEND ≠ WILLINGNESS TO PAY US

Mercury determines willingness to pay for our offer.

TERRAIN only records current cost/spend.

---

# 150. RISK

Current-state risk may be:

```text
financial

operational

legal

reputational

safety

customer

data
```

Do not make legal conclusions.

---

# 151. RISK EVIDENCE

Prefer actual incidents, requirements or documented concern.

---

# 152. CONTEXT

Jobs occur in circumstances.

Example:

```text
normal daily processing
```

versus:

```text
month-end close
```

may create entirely different problem intensity.

---

# 153. CONTEXT OBJECT

Could include:

```text
timing

volume

geography

organization size

technology environment

deadline

event
```

---

# 154. TRIGGER

A trigger starts a job or changes its urgency.

---

# 155. TRIGGER TYPES

Potential:

```text
EVENT

DEADLINE

TRANSACTION

INCIDENT

REQUEST

REGULATORY CHANGE

LIFECYCLE CHANGE

CAPACITY CHANGE

NEW CUSTOMER

NEW EMPLOYEE

NEW CONTRACT
```

---

# 156. TRIGGER OBSERVABILITY

Mercury may later use observable triggers commercially.

TERRAIN only models how trigger relates to work.

---

# 157. JOB TIMELINE

For relevant jobs capture:

```text
before trigger

trigger

preparation

execution

verification

completion

follow-up
```

---

# 158. SWITCHING TIMELINE

Mercury owns buying/switching to our solution.

TERRAIN can capture when people abandon an old process based on actual research.

---

# 159. JOURNEY

Journey is actor-centric chronological experience.

---

# 160. WORKFLOW VS JOURNEY

Workflow:

```text
how work moves
```

Journey:

```text
how actor experiences sequence
```

Keep distinct.

---

# 161. JOURNEY OBJECT

Use only where useful.

Possible:

```text
actor
scenario
goal
phases
actions
touchpoints
frictions
outcomes
```

---

# 162. EMOTION IN JOURNEY

Only from actual user evidence.

Never have Claude invent:

```text
😟 anxious
```

because a UX template expects emotion.

---

# 163. SERVICE BLUEPRINT BOUNDARY

A service blueprint can help understand current service.

But RELAY owns our future service-delivery operation.

Use service blueprint only as current-state research representation.

---

# 164. FRONTSTAGE

What actor sees.

---

# 165. BACKSTAGE

What organization currently does behind the interaction.

---

# 166. SUPPORT SYSTEM

Existing systems supporting current workflow.

---

# 167. PHYSICAL EVIDENCE

Where relevant:

```text
document

package

screen

receipt

form

certificate
```

---

# 168. SYSTEM OBJECT

External/current-workflow systems can be represented.

Examples:

```text
SAP

Excel

email

government portal

internal tool

paper form
```

---

# 169. SYSTEM ROLE

Ask:

```text
system of record?

system of engagement?

calculation?

storage?

workflow?

communication?
```

CHESSBOARD owns strategic market implications.

---

# 170. SYSTEM FRICTION

Examples:

```text
no integration

poor search

export missing

permissions

data stale

different identifiers
```

---

# 171. IDENTIFIER MISMATCH

A recurring valuable pattern.

Example:

```text
warehouse job ID
≠
billing line ID
```

forcing reconciliation.

---

# 172. SEMANTIC MISMATCH

Different teams define same concept differently.

---

# 173. FORMAT MISMATCH

PDF vs CSV vs API.

---

# 174. TIMING MISMATCH

System A updates daily.

System B needs real time.

---

# 175. OWNERSHIP MISMATCH

No one clearly responsible for data/step.

This describes external workflow.

CONSTELLATION handles our organization.

---

# 176. CURRENT ALTERNATIVES

Map what people currently use.

Do not call them competitors automatically.

---

# 177. CURRENT ALTERNATIVE OBJECT

Could include:

```text
alternativeType

workflowCoverage

effort

cost

limitations

whyChosen
```

---

# 178. SATISFIED ALTERNATIVE

If current process works extremely well:

record it.

Do not manufacture dissatisfaction.

---

# 179. OVER-SERVED PROBLEM

Some markets already have more solution than need.

Surface.

---

# 180. UNDER-SERVED PROBLEM

Needs evidence such as:

```text
important outcome

low current satisfaction

repeated workarounds

cost

failure
```

Do not assign label casually.

---

# 181. UNSERVED PROBLEM

No viable current solution.

Again, verify.

---

# 182. MIS-SERVED PROBLEM

Solution exists but optimizes wrong outcome.

Useful concept when evidence supports.

---

# 183. PROBLEM MATURITY

Possible state model:

```text
HYPOTHESIS

WEAK_EVIDENCE

OBSERVED

REPEATED

WELL_SUPPORTED

CONTESTED

REJECTED

STALE
```

Adapt.

---

# 184. EVIDENCE LADDER

Potential:

```text
E0 — AI/analyst hypothesis

E1 — public anecdote

E2 — multiple independent anecdotes

E3 — documented workflow evidence

E4 — direct user observation/interview

E5 — repeated observed behavior

E6 — quantified internal/external evidence

E7 — real economic/workaround commitment
```

Do not blindly use exact numbering if repository already has evidence taxonomy.

---

# 185. PROBLEM VALIDATION ≠ IDEA VALIDATION

A problem can be real while our solution fails.

Keep separate.

---

# 186. PROBLEM REJECTION

If research shows:

```text
rare

already solved

no meaningful consequence

artifact of bad assumption
```

mark appropriately.

---

# 187. PROBLEM CONTRADICTION

Surface:

```text
Some firms experience this.
Others do not.
```

Then look for segmentation/context.

---

# 188. CONTEXT SPLIT

Problem may only exist under:

```text
company size

specific tech stack

regulatory regime

high volume

specific geography
```

---

# 189. SEGMENT BOUNDARY

TERRAIN can describe problem contexts.

Mercury owns commercial target-segment operations.

---

# 190. PROBLEM EPIDEMIOLOGY

Do not use medical terminology in UI unnecessarily.

But conceptually ask:

```text
who experiences it?

under what conditions?

how frequently?

```

---

# 191. PREVALENCE

Estimate only from reliable data.

---

# 192. SAMPLE SIZE

All quantified user research requires n.

---

# 193. SOURCE SELECTION BIAS

Examples:

```text
support forums overrepresent failures

vendor testimonials overrepresent success

Reddit may skew toward vocal users

job postings reveal hiring needs but not full workflow
```

Record limitations.

---

# 194. SEARCH WEB BROADLY BUT PURPOSEFULLY

Use external research to discover problem evidence.

Search for:

```text
workflow documentation

SOPs

training manuals

procurement documents

RFPs

job descriptions

industry guidance

regulator reports

user forums

software reviews

implementation guides

support discussions

professional associations

public audits

incident reports

government forms

PDF templates
```

---

# 195. PRIMARY SOURCES

Prefer:

```text
government

regulator

standards body

official workflow documentation

company documentation

procurement document

actual form

actual process guide
```

for process facts.

---

# 196. SECONDARY SOURCES

Useful for discovering:

```text
pain language

workarounds

user complaints

industry practice
```

but label appropriately.

---

# 197. JOB POSTINGS

Can reveal:

```text
responsibilities

systems used

manual tasks

cross-team handoffs

required expertise
```

Do not infer whole workflow from one posting.

---

# 198. RFPs / PROCUREMENT

Can reveal:

```text
requirements

current gaps

desired outcomes

integration needs

buyer language
```

Very valuable.

---

# 199. PUBLIC FORMS

Often reveal actual workflow.

---

# 200. TEMPLATES

A downloadable spreadsheet/template can expose hidden data model and manual process.

---

# 201. USER REVIEWS

Useful for:

```text
workarounds

failure modes

desired outcomes

switching reasons
```

Not representative by default.

---

# 202. COMMUNITY POSTS

Use with context.

---

# 203. REDDIT

Useful for lived experience.

Do not treat as authoritative population statistics.

---

# 204. SUPPORT FORUMS

Especially valuable for:

```text
exceptions

failure paths

integration problems
```

---

# 205. YOUTUBE / DEMOS

May reveal workflow visually.

If browser/video analysis available, use selectively.

---

# 206. SCREENSHOTS

Can reveal tools/artifacts but avoid private/sensitive information.

---

# 207. PDFs

Use native multimodal/document understanding if Antigravity supplies it.

Avoid crude OCR unless needed.

---

# 208. INTERVIEW INGESTION

If user research transcripts exist:

preserve raw source.

Derived TERRAIN objects must link back.

---

# 209. QUOTES

Never fabricate.

---

# 210. INTERVIEW QUESTION QUALITY

Focus on:

```text
last occurrence

what happened

what happened before

what happened after

who was involved

what tools were used

what failed

how it was fixed

how long

how much

what happened if unresolved
```

---

# 211. AVOID LEADING QUESTIONS

Bad:

```text
Would AI automation save you time?
```

Better:

```text
Walk me through the last time you performed this process.
```

---

# 212. CONTEXTUAL INQUIRY

Where authorized, observing actual workflow can outperform recall.

---

# 213. SHADOWING

Not required to implement.

But TERRAIN data model should support observation evidence.

---

# 214. PRIVACY

Do not publish personal interview data.

Reuse existing private/public architecture.

---

# 215. DE-IDENTIFICATION

Where public aggregate insight is useful:

remove identifying details appropriately.

---

# 216. CUSTOMER/EMPLOYEE SENSITIVE DATA

Do not collect unnecessary sensitive data.

---

# 217. PROBLEM LANGUAGE CORPUS

Build a corpus of real language only when sourced.

Potential use:

```text
how users describe job

how they describe pain

terms they use for artifacts

terms they use for errors
```

Mercury can later consume this.

---

# 218. INTERNAL JARGON WARNING

If idea uses terminology users never use:

surface.

---

# 219. PROBLEM SEARCH

Users should eventually search:

```text
"reconcile invoices"

"collect audit evidence"

"compare supplier quotes"

"verify AI-generated code"
```

and discover:

```text
problems

jobs

workflows

ideas
```

---

# 220. DUAL ATLAS

Create conceptually:

```text
IDEA ATLAS
+
PROBLEM ATLAS
```

with explicit linkage.

---

# 221. ONE PROBLEM → MANY IDEAS

Important.

Example:

```text
problem-042
→ idea-011
→ idea-092
→ idea-201
```

---

# 222. ONE IDEA → MANY PROBLEMS

Also possible.

---

# 223. PROBLEM–IDEA EDGE

Create explicit relationship.

Potential types:

```text
ADDRESSES

PARTIALLY_ADDRESSES

DEPENDS_ON

CREATES

REDUCES

SHIFTS

UNKNOWN
```

---

# 224. EDGE EVIDENCE

Do not let Claude create:

```text
idea-123 solves problem-456
```

without reasoning.

---

# 225. COVERAGE

Ask:

```text
Which workflow steps would this idea change?
```

FORGE later defines exact product behavior.

---

# 226. ORPHAN IDEA

An idea with no defensible problem linkage.

Flag for research.

Do not auto-delete.

---

# 227. OVER-SOLUTIONIZED IDEA

Idea has dozens of features but unclear core problem.

Flag.

---

# 228. PROBLEM WITHOUT IDEA

This is a valuable white space.

---

# 229. WHITE SPACE

Definition:

```text
supported problem
+
important unresolved outcome
+
weak current alternatives
+
no strong existing VenturaAtlas intervention
```

Still not automatically a venture.

---

# 230. SOLUTION DENSITY

How many ideas target the same problem/workflow?

---

# 231. PROBLEM EVIDENCE VS SOLUTION DENSITY

Interesting matrix:

```text
HIGH evidence + LOW solution density
HIGH evidence + HIGH solution density
LOW evidence + HIGH solution density
LOW evidence + LOW solution density
```

Do not turn into automatic ranking.

---

# 232. LOW-EVIDENCE HIGH-SOLUTION-DENSITY

Potential:

# IDEA BUBBLE.

The repository may have invented many variations around an unproven problem.

Surface.

---

# 233. HIGH-EVIDENCE LOW-SOLUTION-DENSITY

Potential research priority.

---

# 234. IDEA CLUSTER BY PROBLEM

Current categories may cluster by solution/market.

Add problem-based clustering.

---

# 235. IDEA CLUSTER BY JOB

Likewise.

---

# 236. IDEA CLUSTER BY WORKFLOW STEP

Likewise.

---

# 237. IDEA CLUSTER BY FRICTION ARCHETYPE

Likewise.

---

# 238. CROSS-CATEGORY DUPLICATES

Two ideas in different industries may be same intervention pattern.

TERRAIN helps reveal this.

---

# 239. STRUCTURAL VENTURE PATTERN

Example:

```text
collect fragmented evidence
→ normalize
→ verify
→ package for reviewer
```

may occur across:

```text
compliance

insurance

finance

healthcare

procurement
```

---

# 240. VENTURE PATTERN ≠ PROBLEM

Keep separate.

---

# 241. PROBLEM GRAPH

Build an additive graph model.

Nodes may include:

```text
ACTOR

JOB

WORKFLOW

STEP

TRIGGER

ARTIFACT

SYSTEM

DECISION

HANDOFF

FRICTION

PROBLEM

OUTCOME

WORKAROUND

CONSEQUENCE

IDEA
```

---

# 242. GRAPH EDGES

Potential:

```text
PERFORMS

TRIGGERS

CONTAINS

PRECEDES

PRODUCES

CONSUMES

USES

HANDS_TO

DECIDES

BLOCKS

CAUSES

CONTRIBUTES_TO

EXPERIENCES

WORKS_AROUND

DESIRES

ADDRESSES
```

---

# 243. DO NOT INTRODUCE GRAPH DATABASE BY DEFAULT

A JSON/node-edge representation may be enough.

---

# 244. STATIC-FIRST

Respect VenturaAtlas's static-first architecture.

---

# 245. GRAPH INDEX

Generate deterministic indexes for browsing.

---

# 246. QUERY EXAMPLE

TERRAIN should eventually support questions like:

```text
Show all problems involving manual reconciliation
between two systems
for finance-related roles
where a spreadsheet workaround is observed.
```

---

# 247. QUERY EXAMPLE

```text
Show all jobs involving evidence collection
with an external review handoff.
```

---

# 248. QUERY EXAMPLE

```text
Show all canonical ideas that address
approval bottlenecks caused by missing information.
```

---

# 249. QUERY EXAMPLE

```text
Show problem areas with strong evidence
but no active validation plan.
```

---

# 250. QUERY EXAMPLE

```text
Show all workflows where users copy data
from PDF to spreadsheet.
```

---

# 251. QUERY ENGINE

Keep deterministic and simple.

Do not build general Cypher clone.

---

# 252. SEARCH INDEX

Extend existing search architecture where appropriate.

Do not rebuild search from scratch.

---

# 253. FACETS

Possible problem-atlas filters:

```text
actor

job

industry

workflow archetype

friction

artifact

system

context

evidence maturity

problem status
```

---

# 254. PROBLEM ATLAS UI

Create a first-class:

# PROBLEMS

or:

# TERRAIN

surface.

---

# 255. PROBLEM CARD

Potential:

```text
Problem

Who experiences it

Job

Where in workflow

Evidence status

Observed workaround

Consequence

Linked ideas
```

---

# 256. PROBLEM PAGE

Should answer:

```text
WHAT IS HAPPENING?

WHO?

WHEN?

WHY?

CURRENT WORKFLOW?

WHERE DOES IT BREAK?

CURRENT WORKAROUND?

WHAT DOES IT COST?

WHAT OUTCOME IS DESIRED?

WHAT EVIDENCE EXISTS?

WHAT EVIDENCE CONTRADICTS?

WHICH IDEAS ADDRESS IT?

WHAT IS UNKNOWN?
```

---

# 257. JOB PAGE

Show:

```text
performers

contexts

desired outcomes

workflow

problems

current alternatives

linked ideas
```

---

# 258. WORKFLOW PAGE

Show chronological steps.

---

# 259. WORKFLOW VISUALIZATION

Keep understandable.

Possible:

```text
trigger
→ step
→ step
→ handoff
→ decision
→ step
→ outcome
```

---

# 260. FRICTION OVERLAY

Highlight where friction occurs.

---

# 261. ARTIFACT OVERLAY

Show which files/data objects move.

---

# 262. ACTOR SWIMLANES

Useful for multi-role workflows.

---

# 263. NO VISUALIZATION FOR ITS OWN SAKE

If table communicates better:

use table.

---

# 264. CROSS-SECTOR ANALOGY VIEW

Potential valuable page:

```text
Same workflow pattern in:
- logistics
- compliance
- healthcare
- finance
```

---

# 265. ANALOGY DETAIL

Show:

```text
what is structurally similar

what differs

what prior solution pattern exists
```

---

# 266. PROBLEM-FIRST BROWSING

Main Atlas should eventually support:

```text
I am a [role]
trying to [job]
and struggling with [friction].
```

---

# 267. NOT A CHATBOT REQUIREMENT

Can be implemented with filters/search first.

---

# 268. PROBLEM DISCOVERY FROM EXISTING IDEAS

Current 324+ idea corpus can seed TERRAIN.

But this must be done carefully.

---

# 269. EXTRACTION RULE

Existing idea text is NOT evidence that problem exists.

It can generate:

```text
PROBLEM HYPOTHESIS
```

only.

---

# 270. HYPOTHESIS EXTRACTION

For each sampled active/high-value idea extract:

```text
claimed actor

claimed job

claimed problem

claimed workflow

claimed outcome
```

and mark source:

```text
IDEA_DERIVED_HYPOTHESIS
```

---

# 271. DO NOT MASS-PROMOTE

Do not convert all idea claims into observed problems.

---

# 272. SAMPLE FIRST

Start with:

```text
selected venture

shortlist

top clusters

high-duplication clusters

high-research clusters
```

---

# 273. BACKFILL STRATEGY

After dogfooding:

decide whether broad problem extraction is useful.

---

# 274. NO 324-PROBLEM BOILERPLATE GENERATION

This would defeat mission.

---

# 275. PROBLEM DISCOVERY FROM RESEARCH

Existing dossiers/research may contain stronger evidence.

Extract with citation.

---

# 276. SOURCE FACT EXTRACTION

Look for language describing:

```text
manual process

delay

cost

failure

requirement

workflow

complaint

workaround
```

---

# 277. AI EXTRACTION CONFIDENCE

Claude can propose mappings.

Deterministic validation checks references/schema.

---

# 278. SEMANTIC REVIEW

Human/strong-model review required for important merges.

---

# 279. TEMPORALITY

Problems change over time.

---

# 280. AS-OF DATE

Problem evidence must preserve temporal context.

---

# 281. PROBLEM DECAY

A problem may disappear because:

```text
platform added feature

regulation changed

workflow standardized

AI automated task

cost dropped

company process changed
```

---

# 282. STALE PROBLEM

Do not keep historical frustration as current fact.

---

# 283. PROBLEM HISTORY

Preserve:

```text
what the workflow looked like then
```

when useful.

---

# 284. MARKET EVENT INTEGRATION

CHESSBOARD may supply structural events.

TERRAIN can update affected workflow hypotheses.

---

# 285. REGULATION INTEGRATION

JURIS may supply confirmed requirements.

TERRAIN can represent workflow consequence.

---

# 286. TECHNOLOGY CHANGE

FORGE/CHESSBOARD can reveal capabilities that remove old friction.

---

# 287. GEOGRAPHY

Same job may differ across geography.

---

# 288. JURISDICTION CONTEXT

Especially regulated workflows.

---

# 289. ORGANIZATION SIZE

Workflow may differ dramatically:

```text
10-person business
vs
10,000-person enterprise.
```

---

# 290. TECH STACK CONTEXT

Likewise.

---

# 291. MATURITY CONTEXT

Manual startup workflow vs mature enterprise workflow.

---

# 292. VOLUME CONTEXT

A process okay at 20 transactions may collapse at 20,000.

---

# 293. COMPLEXITY CONTEXT

High exception volume.

---

# 294. DESIRED OUTCOME CONFLICT

Different actors may want conflicting outcomes.

Example:

```text
employee:
fast approval

compliance:
more verification
```

Represent.

---

# 295. STAKEHOLDER MAP

Not strategic market structure.

This is job/workflow stakeholder map.

---

# 296. STAKEHOLDER ROLES

Potential:

```text
PERFORMER

REQUESTER

REVIEWER

APPROVER

RECIPIENT

BLOCKER

DATA PROVIDER
```

---

# 297. USER ≠ BENEFICIARY

One person operates workflow.

Another benefits.

---

# 298. USER ≠ PAYER

Mercury owns payer commercially.

TERRAIN can record role distinction as workflow fact.

---

# 299. MULTI-ACTOR PROBLEM

Some problems exist only because actors need coordination.

---

# 300. LOCAL OPTIMUM

One department may optimize itself and create downstream work.

---

# 301. SHIFTED WORK

A "solution" may merely transfer work to another actor.

TERRAIN should reveal.

---

# 302. AUTOMATION DISPLACEMENT

Example:

```text
customer saves 5 minutes
but support team spends 20 minutes fixing exceptions.
```

Future product evaluation can use this.

---

# 303. END-TO-END OUTCOME

Prefer whole workflow result over local step efficiency.

---

# 304. PROBLEM VALUE CHAIN

Not CHESSBOARD's market value chain.

Here map:

```text
where time/cost/risk accumulates across workflow.
```

---

# 305. TIME MAP

For sampled workflow:

```text
active work

waiting

handoff delay

rework
```

if evidence exists.

---

# 306. MONEY MAP

Where spend occurs.

---

# 307. RISK MAP

Where failure matters.

---

# 308. FRICTION DENSITY

Could show number/types of frictions per step.

Do not equate count with importance.

---

# 309. PAIN CLUSTER

Multiple symptoms may share cause.

---

# 310. OPPORTUNITY ZONE

Create a solution-neutral opportunity object.

---

# 311. OPPORTUNITY ZONE DEFINITION

A region of workflow where:

```text
important desired outcomes
+
observable friction
+
poor current satisfaction/workaround
```

suggest intervention may be valuable.

---

# 312. OPPORTUNITY ZONE ≠ VENTURE

It is upstream.

---

# 313. OPPORTUNITY OBJECT

Conceptually:

```text
job

workflowSteps

desiredOutcomes

problems

evidence

constraints

unknowns
```

No solution required.

---

# 314. NO IDEA GENERATION IN FIRST PASS

Understand opportunity before inventing intervention.

---

# 315. INTERVENTION SPACE

After problem map is strong, possible intervention categories:

```text
REMOVE STEP

AUTOMATE STEP

REDUCE WAIT

REDUCE ERROR

STANDARDIZE

INTEGRATE

VERIFY

ROUTE

MATCH

PREDICT

DELEGATE

SELF-SERVICE

CHANGE INCENTIVE

CHANGE INFORMATION
```

Do not immediately create startup.

---

# 316. SOLUTION DIVERGENCE

For one opportunity generate multiple intervention forms.

Example:

```text
software
service
API
marketplace
data product
process redesign
insurance
outsourcing
```

---

# 317. IDEA CREATION BOUNDARY

If genuinely novel promising intervention emerges:

route to existing idea-staging system.

Do not bypass canonical promotion rules.

---

# 318. PROBLEM-FIRST RESEARCH LOOP

```text
OBSERVE WORK
↓
MAP WORKFLOW
↓
IDENTIFY FRICTION
↓
IDENTIFY DESIRED OUTCOME
↓
LOCATE CAUSE
↓
FIND EVIDENCE
↓
FIND CONTRADICTION
↓
DEFINE OPPORTUNITY
↓
ONLY THEN CONSIDER IDEA
```

---

# 319. RESEARCH SATURATION

VenturaAtlas already contains large research volume.

TERRAIN should not create another giant general-web ideation cycle.

Focus on converting research into better problem understanding.

---

# 320. RESEARCH QUESTION QUALITY

Good:

```text
How do mid-size 3PLs reconcile warehouse activity
with billable customer charges before invoicing?
```

Weak:

```text
What are logistics startup opportunities?
```

---

# 321. SEARCH FOR WORKFLOW

Search:

```text
how to
process
workflow
procedure
checklist
template
form
spreadsheet
job description
SOP
```

alongside domain.

---

# 322. SEARCH FOR FAILURE

```text
error

manual

delay

reconcile

missing

exception

complaint

workaround

audit finding
```

---

# 323. SEARCH FOR SPEND

```text
consultant

outsourcing

software fee

processing cost

labor hours
```

---

# 324. SEARCH FOR CURRENT ALTERNATIVE

```text
template

Excel

software

service provider

manual process
```

---

# 325. SEARCH FOR ACTOR LANGUAGE

Professional forums/job ads can reveal terminology.

---

# 326. NEGATIVE RESEARCH

Search for evidence problem is already solved.

---

# 327. SOLVED-PROBLEM TEST

Find modern products/workflows that eliminate pain.

---

# 328. NON-PROBLEM TEST

Find practitioners saying:

```text
this is not actually difficult
```

---

# 329. CONTEXT DEPENDENCY TEST

Find where pain appears/disappears.

---

# 330. CLAUDE SUBAGENT ARCHITECTURE

If Antigravity supports parallel agents, use them.

But:

# ONE CENTRAL WRITER.

Subagents default to read-only investigation.

---

# 331. REPOSITORY SCOUT

Agent A:

```text
Map current repo structures related to:
problem
workflow
actor
job
outcome
research
relationships
search
schemas
```

Output structured findings.

No writes.

---

# 332. DOMAIN-MODEL SCOUT

Agent B:

Research problem/JTBD/workflow modeling methods.

Output reusable concepts.

No writes.

---

# 333. EVIDENCE SCOUT

Agent C:

Inspect current canonical research for real workflow/problem evidence.

No writes.

---

# 334. ACTIVE-VENTURE SCOUT

Agent D:

Resolve current active/selected ventures and map their implied problems.

No writes.

---

# 335. UX / INFORMATION-ARCHITECTURE SCOUT

Agent E:

Inspect current docs/site architecture.

Recommend smallest additive Problem Atlas UI.

No writes.

---

# 336. ADVERSARIAL SCOUT

Agent F:

Try to prove TERRAIN is redundant with existing systems.

Identify overlap risks.

No writes.

---

# 337. CROSS-SECTOR SCOUT

Agent G:

Identify recurring workflow archetypes across current idea corpus.

No writes.

---

# 338. EXTERNAL-RESEARCH SCOUT

Agent H:

Deep current-web research for dogfood problem domain.

No writes.

---

# 339. SUBAGENT LIMIT

Do not spawn agents for trivial subtasks.

Parallelism must reduce uncertainty.

---

# 340. NO WRITE RACES

Subagents do not edit overlapping files.

Central Claude integrates.

---

# 341. SYNTHESIS CHECKPOINT

Before implementation consolidate:

```text
existing systems

proposed domain objects

overlap analysis

dogfood evidence

minimal architecture

rejected alternatives
```

---

# 342. DO NOT IMPLEMENT FULL ONTOLOGY YET

Dogfood conceptual model first.

---

# 343. DOGFOOD BEFORE SCHEMA FREEZE

Use one current real venture/problem.

---

# 344. DOGFOOD REQUIREMENT

Resolve current active venture from repository authority.

Do NOT blindly use historical winner.

---

# 345. ACTIVE VENTURE → PROBLEM

For current venture answer:

```text
Who experiences the underlying problem?

What are they trying to do?

What triggers it?

What does current workflow look like?

Where exactly does it break?

What do they use now?

What workaround exists?

What does failure cost?

What outcome do they want?

Which evidence directly supports each claim?

```

---

# 346. FIND THREE PROBLEM LEVELS

For dogfood:

```text
surface symptom

workflow problem

underlying structural cause
```

if evidence allows.

---

# 347. FIND COUNTEREVIDENCE

Required.

---

# 348. FIND A CONTEXT WHERE PROBLEM DOES NOT EXIST

Required if possible.

This tests boundaries.

---

# 349. FIND CURRENT ALTERNATIVE

Required.

---

# 350. MAP ACTUAL ARTIFACTS

Required where applicable.

---

# 351. MAP HANDOFFS

Required where applicable.

---

# 352. MAP DECISIONS

Required where applicable.

---

# 353. MAP DESIRED OUTCOMES

Required.

---

# 354. MAP LINKED IDEAS

After problem map is stable.

---

# 355. SECOND DOGFOOD

Choose a completely different current venture archetype.

Example difference:

```text
B2B workflow software
vs
consumer marketplace
```

or best available.

Ensure ontology generalizes.

---

# 356. THIRD DOGFOOD

Use a service/physical/regulatory idea if available.

Prevent SaaS-only schema.

---

# 357. MODEL SIMPLIFICATION

After three dogfoods:

remove fields never used.

---

# 358. DO NOT DESIGN FOR EVERYTHING

A smaller ontology that models real cases well is superior to 80 abstract entity types.

---

# 359. MINIMUM VIABLE TERRAIN

Likely core:

```text
ACTOR

JOB

OUTCOME

WORKFLOW

STEP

PROBLEM

FRICTION

WORKAROUND

EVIDENCE

PROBLEM↔IDEA RELATION
```

Everything else optional.

---

# 360. SCHEMA LOCATION

Inspect current architecture.

Do not automatically create:

```text
terrain/
problems/
jobs/
workflows/
```

all separately.

Choose coherent layout.

---

# 361. DOMAIN DIRECTORY

A single:

```text
terrain/
```

or equivalent may be cleaner.

But follow repository conventions.

---

# 362. DATA FILES

Possible:

```text
data/problems.json
data/jobs.json
data/workflows.json
data/problem-relations.json
```

only if consistent.

---

# 363. NORMALIZATION

Balance:

```text
clean relationships
```

against:

```text
unusable fragmentation.
```

---

# 364. ID STRATEGY

Use stable IDs.

Follow existing conventions.

---

# 365. REFERENTIAL INTEGRITY

Reuse OMEGA/current validators.

---

# 366. SCHEMA VERSIONING

Follow current schema versioning conventions.

---

# 367. MIGRATION

Do not break existing ideas.

TERRAIN must be additive.

---

# 368. OPTIONAL LINKAGE

Initial idea records should not require all problems immediately if that would invalidate corpus.

---

# 369. PROGRESSIVE BACKFILL

Support:

```text
idea has zero problem links
```

as valid transitional state.

---

# 370. UNKNOWN LINKAGE

Do not manufacture linkage to reach 100% completeness.

---

# 371. COMPLETENESS METRICS

Examples:

```text
ideas with problem linkage

problems with direct evidence

workflows with steps

problems with counterevidence considered
```

But never optimize blindly for percentage.

---

# 372. COVERAGE THEATER

324/324 linked ideas is BAD if links are invented.

---

# 373. QUALITY > COVERAGE

Deep accurate maps for selected ventures first.

---

# 374. PROBLEM SEARCH INDEX

Integrate with current search index.

---

# 375. PUBLIC BUILD

Public problem evidence can be browsed.

Private interviews remain private.

---

# 376. PRIVATE EVIDENCE

Store:

```text
interview transcripts

private company workflow

personal names

confidential spend
```

outside public output.

---

# 377. SANITIZED PUBLIC SUMMARY

Can expose:

```text
anonymized pattern

aggregate observations

public sources
```

where appropriate.

---

# 378. USER NOTES

Existing notes/collaboration may attach to problems.

Reuse rather than duplicate.

---

# 379. FAVORITES

If architecture allows:

users may save problems as well as ideas.

Do not rebuild favorites engine.

---

# 380. COMPARE

Potential later:

```text
compare problems
```

but do not overbuild first version.

---

# 381. PROBLEM COMPARE

Could compare:

```text
actors

jobs

workflow

evidence

current alternatives

unknowns
```

No arbitrary winner.

---

# 382. RELATIONSHIP VIEW

Extend current relationships if appropriate.

---

# 383. PROBLEM–IDEA BIPARTITE GRAPH

Very valuable:

```text
PROBLEMS
↔
IDEAS
```

---

# 384. SOLUTION CROWDING VIEW

One problem targeted by 15 ideas.

---

# 385. PROBLEM WHITE-SPACE VIEW

Supported problems with zero ideas.

---

# 386. RESEARCH PRIORITY VIEW

Problems with important unknowns.

---

# 387. EVIDENCE VIEW

Show evidence/counterevidence.

---

# 388. WORKFLOW VIEW

Show chronological current state.

---

# 389. ARTIFACT VIEW

Show how documents/data move.

---

# 390. FRICTION VIEW

Show where manual effort accumulates.

---

# 391. ROLE VIEW

Show external actor's jobs/workflows.

---

# 392. PROBLEM FAMILY VIEW

Show parent/child/related.

---

# 393. ANALOGY VIEW

Show structurally similar workflows across markets.

---

# 394. PROBLEM-FIRST HOME ENTRY

Eventually site can offer:

```text
Explore opportunities by problem
```

alongside:

```text
Explore ideas.
```

---

# 395. FRIEND EXPERIENCE

Friends should be able to say:

```text
This problem is real.

I have seen this workflow.

This step is wrong.

This workaround exists.

This pain is overstated.
```

rather than only voting idea scores.

---

# 396. PROBLEM ANNOTATION

Reuse comments/notes.

---

# 397. EVIDENCE CONTRIBUTION

Friends can attach public evidence.

Use current review/promotion mechanisms.

---

# 398. NO WIKIPEDIA CHAOS

User-added claims remain claims until reviewed.

---

# 399. PROBLEM REVIEW

Possible review dimensions:

```text
statement clarity

solution neutrality

actor clarity

workflow location

evidence

counterevidence

context
```

---

# 400. PROBLEM QUALITY CHECKER

Implement deterministic checks where possible.

Examples:

```text
problem lacks actor

problem lacks job

problem text contains proposed brand/product

evidence refs invalid

linked idea missing
```

---

# 401. SOLUTION-LANGUAGE LINTER

Useful heuristic.

Flag problem statements containing:

```text
platform

AI assistant

app

marketplace

API

dashboard
```

when used as proposed solution.

Do NOT blindly reject—some may be current systems.

Human/semantic review.

---

# 402. PROBLEM GRANULARITY LINTER

Flag:

```text
too broad
too implementation-specific
```

as review suggestions.

Not deterministic truth.

---

# 403. DUPLICATE DETECTOR

Reuse similarity architecture where possible.

---

# 404. WORKFLOW CONSISTENCY CHECK

Ensure:

```text
step order

actors

artifacts

edges
```

valid.

---

# 405. ORPHAN STEP

Workflow step with no workflow.

Invalid.

---

# 406. ORPHAN PROBLEM EDGE

Reject.

---

# 407. INVALID EVIDENCE

Reject broken source refs.

---

# 408. PRIVATE LEAK TEST

Required.

---

# 409. SEARCH TEST

Problem must be findable by real language.

---

# 410. FILTER TEST

Facets work.

---

# 411. NO-JS TEST

If current project supports no-JS path:

provide sensible problem fallback.

---

# 412. ACCESSIBILITY

Reuse current UI principles.

Do not redo global accessibility mission.

---

# 413. MOBILE

Problem/workflow pages should remain usable.

Do not redo full responsive audit.

---

# 414. PERFORMANCE

Do not ship giant graph data to every page if unnecessary.

---

# 415. STATIC GENERATION

Precompute indexes where appropriate.

---

# 416. DEPENDENCY LIGHT

Avoid large graph frameworks.

---

# 417. DATA SIZE

Plan for thousands of problems/workflow nodes eventually.

But do not optimize prematurely for billions.

---

# 418. HUMAN-READABLE FILES

Keep data reviewable.

---

# 419. MACHINE-READABLE FILES

Other missions need deterministic consumption.

---

# 420. API-LIKE INTERNAL INTERFACE

Provide functions such as:

```text
getProblemsForIdea()

getIdeasForProblem()

getWorkflow()

getProblemsForActor()

getProblemsForJob()

getProblemsByFriction()
```

Names depend current architecture.

---

# 421. NO HTML SCRAPING BETWEEN SUBSYSTEMS

Use structured data.

---

# 422. MERCURY INTEGRATION

Mercury can attach:

```text
commercial conversations
```

to:

```text
problem/job
```

where useful.

---

# 423. MERCURY LEARNING

If actual buyer says:

```text
that isn't our problem
```

TERRAIN evidence should be updateable through proper review.

---

# 424. FORGE INTEGRATION

Product requirement can reference:

```text
problemId

jobId

workflowStepId

desiredOutcomeId
```

This creates:

```text
WHY ARE WE BUILDING THIS?
```

traceability.

---

# 425. FEATURE WITHOUT PROBLEM

FORGE may flag feature not linked to supported problem/outcome.

---

# 426. RELAY INTEGRATION

Future solution delivery may alter workflow.

RELAY handles operation.

TERRAIN retains before-state.

---

# 427. BEFORE / AFTER COMPARISON

Once solution exists:

```text
TERRAIN current-state baseline
vs
FORGE/RELAY future/observed state
```

can reveal actual improvement.

---

# 428. CHESSBOARD INTEGRATION

CHESSBOARD competitors can map onto:

```text
which jobs

which workflow steps

which outcomes
```

they address.

---

# 429. SUBSTITUTE COVERAGE

This improves competition analysis.

---

# 430. ORBIT INTEGRATION

ORBIT can compare ventures sharing same problem.

Avoid double-allocation to near-identical interventions.

---

# 431. JURIS INTEGRATION

Regulatory requirement can become:

```text
workflow constraint
```

without TERRAIN interpreting law.

---

# 432. CAPITAL INTEGRATION

Observed current-process economic burden can improve venture economics assumptions.

---

# 433. CONSTELLATION INTEGRATION

If selected venture requires domain expertise:

TERRAIN identifies customer-domain actors/workflows.

CONSTELLATION decides our capability needs.

---

# 434. OMEGA INTEGRATION

Reuse:

```text
provenance

IDs

verification

public/private boundaries

receipts
```

---

# 435. RESEARCH PIPELINE INTEGRATION

TERRAIN produces specific research questions.

Do not create another autonomous scheduler.

---

# 436. PROBLEM RESEARCH TASK

Example:

```text
Find primary evidence describing how mid-size EU freight forwarders
currently validate customs-document completeness before submission.
```

---

# 437. NOT:

```text
Research logistics.
```

---

# 438. RESEARCH OUTPUT CONTRACT

Every problem research result must return:

```text
QUESTION

FINDINGS

EVIDENCE

COUNTEREVIDENCE

WORKFLOW IMPLICATION

UNKNOWN

NEXT QUESTION
```

---

# 439. RESEARCH TERMINATION RULE

Stop when:

```text
decision-relevant question answered adequately
```

or:

```text
additional search repeats same evidence
```

or:

```text
evidence unavailable
```

Do not browse forever.

---

# 440. CLAUDE OVERTHINKING CONTROL

Opus 4.6 can reason for too long.

Use explicit phase exits.

---

# 441. DISCOVERY EXIT

Proceed when you can clearly state:

```text
existing TERRAIN-like systems

true gap

non-overlap

dogfood candidate

minimum ontology
```

---

# 442. DOMAIN EXIT

Proceed when three dogfood cases fit without major structural hacks.

---

# 443. IMPLEMENTATION EXIT

Proceed to UI only after deterministic core/tests exist.

---

# 444. RESEARCH EXIT

Stop web research when remaining uncertainty requires real user research rather than more browsing.

---

# 445. NO RESEARCH THEATER

50 sources are not better than 8 decisive sources.

---

# 446. CLAUDE LONG-CONTEXT USE

Use context for cross-file synthesis.

Do NOT fill context with thousands of near-identical generated prompt files.

---

# 447. CONTEXT PRIORITY

Load:

```text
architecture
schemas
idea data model
research model
relationship model
search model
active venture artifacts
recent commits
relevant dogfood dossiers
```

---

# 448. CONTEXT COMPACTION

If harness compacts context:

preserve explicit mission state.

---

# 449. MISSION LEDGER

Maintain a scratch mission ledger outside canonical user-facing truth if appropriate.

Include:

```text
decisions

findings

open questions

files touched

tests run

rejected approaches
```

Do not accidentally publish scratch garbage.

---

# 450. AGENT HANDOFF CONTRACT

Subagent output must be structured enough central agent can integrate.

---

# 451. SUBAGENT OUTPUT

Require:

```text
FINDING

EVIDENCE

FILE/SOURCE

CONFIDENCE

CONTRADICTIONS

RECOMMENDATION

NO-WRITE CONFIRMATION
```

---

# 452. ADVERSARIAL AGENT

Before implementation ask agent specifically:

> Why should TERRAIN NOT be built?

---

# 453. REDUNDANCY TEST

If existing repo already contains mature problem/job/workflow model:

do not duplicate.

Instead strengthen missing gaps.

---

# 454. COMPLEXITY TEST

Ask:

> Would simple problem↔idea links solve 80%?

If yes:

do that first.

---

# 455. GRAPH DATABASE TEST

Ask:

> Does actual required query exceed what JSON/indexes can handle?

If no:

do not add database.

---

# 456. UI TEST

Ask:

> Does this UI help choose/research ventures?

If not:

do not ship.

---

# 457. ONTOLOGY TEST

Ask:

> Did this entity appear in at least two real dogfoods?

If not:

consider removing/defer.

---

# 458. OUTPUT TEST

Ask:

> Can a friend understand this problem page in 60 seconds?

---

# 459. EVIDENCE TEST

Ask:

> Can they see why we believe it?

---

# 460. CONTRADICTION TEST

Ask:

> Can they see reasons it may not be universal?

---

# 461. SOLUTION-BIAS TEST

Ask:

> Would this problem still make sense if our idea did not exist?

---

# 462. ROOT-CAUSE TEST

Ask:

> Are we targeting a symptom produced by an upstream problem?

---

# 463. WORKAROUND TEST

Ask:

> What do people actually do now?

---

# 464. CONSEQUENCE TEST

Ask:

> What happens if they do nothing?

---

# 465. ECONOMIC TEST

Ask:

> Is there observable time/money/risk burden?

---

# 466. FREQUENCY TEST

Ask:

> How often does it occur?

---

# 467. ACTOR TEST

Ask:

> Who personally experiences the workflow?

---

# 468. JOB TEST

Ask:

> What are they trying to accomplish?

---

# 469. END-STATE TEST

Ask:

> How do they know the job is complete?

---

# 470. CONTEXT TEST

Ask:

> Under what circumstances does it become painful?

---

# 471. NEGATIVE-CONTEXT TEST

Ask:

> When is this NOT a problem?

---

# 472. ALTERNATIVE TEST

Ask:

> What existing method solves enough of it?

---

# 473. USER-RESEARCH TEST

Ask:

> Which key claim cannot be answered from desk research?

---

# 474. RESEARCH GAP

Explicitly create:

```text
NEEDS DIRECT USER EVIDENCE
```

where appropriate.

---

# 475. DO NOT FAKE INTERVIEWS

Never generate synthetic interview quotations as evidence.

---

# 476. SYNTHETIC FIXTURE DATA

Allowed for software tests only.

Clearly label:

```text
FIXTURE
```

---

# 477. FIXTURE 1 — RECONCILIATION

Actor manually reconciles two systems.

Test:

```text
workflow

artifact transformation

friction

problem

workaround
```

---

# 478. FIXTURE 2 — APPROVAL

Multiple reviewers.

Missing information causes queue.

---

# 479. FIXTURE 3 — RARE CRITICAL EVENT

Annual audit.

Low frequency, high consequence.

Ensure model does not dismiss.

---

# 480. FIXTURE 4 — SATISFIED CURRENT PROCESS

Current spreadsheet works well.

Ensure system does not manufacture opportunity.

---

# 481. FIXTURE 5 — SAME SYMPTOM DIFFERENT CAUSE

Prevent incorrect deduplication.

---

# 482. FIXTURE 6 — SAME PROBLEM DIFFERENT WORDING

Ensure deduplication assistance.

---

# 483. FIXTURE 7 — SOLUTION-CONTAMINATED STATEMENT

```text
Need AI dashboard.
```

Flag.

---

# 484. FIXTURE 8 — MULTI-ACTOR CONFLICT

Operations wants speed.

Risk wants review.

---

# 485. FIXTURE 9 — NONCONSUMPTION

Actor skips task because existing method too hard.

---

# 486. FIXTURE 10 — CROSS-SECTOR ANALOGY

Two industries share exception-routing pattern.

Do not merge markets.

---

# 487. FIXTURE 11 — ORPHAN IDEA

Idea has no problem link.

System surfaces.

---

# 488. FIXTURE 12 — WHITE SPACE

Supported problem with no idea.

---

# 489. FIXTURE 13 — STALE PROBLEM

Old problem resolved by recent platform update.

---

# 490. FIXTURE 14 — PRIVATE INTERVIEW

Ensure no public leak.

---

# 491. FIXTURE 15 — CONTRADICTORY EVIDENCE

Keep both.

---

# 492. FIXTURE 16 — CURRENT ALTERNATIVE GOOD

Problem importance lowered/contested.

Do not force opportunity.

---

# 493. FIXTURE 17 — FEATURE REQUEST

Map observed request separately from inferred job.

---

# 494. FIXTURE 18 — WORK SHIFTING

Local automation saves one actor but adds work downstream.

Expose.

---

# 495. FIXTURE 19 — SHADOW WORKFLOW

Official process differs from actual spreadsheet/email process.

---

# 496. FIXTURE 20 — UNKNOWN

Missing evidence remains UNKNOWN.

---

# 497. TEST PROBLEM SCHEMA

Invalid actor reference → fail.

---

# 498. TEST WORKFLOW

Cycle/order invalid where prohibited → fail.

---

# 499. TEST EVIDENCE

Broken source ref → fail.

---

# 500. TEST PRIVACY

Private text absent from public build.

---

# 501. TEST LINKAGE

Problem↔idea edges refer to valid IDs.

---

# 502. TEST DUPLICATE

Semantic duplicate is surfaced.

---

# 503. TEST SEARCH

Actor/job/problem text searchable.

---

# 504. TEST STATIC BUILD

Problem pages build deterministically.

---

# 505. TEST NO-JS

If current architecture promises it.

---

# 506. TEST ACCESSIBILITY

Core TERRAIN-specific surface.

---

# 507. TEST PERFORMANCE

Problem graph/index does not drastically inflate every page.

---

# 508. TEST BACKWARD COMPATIBILITY

Existing idea pages remain.

---

# 509. TEST EMPTY STATE

No problems yet should not break UI.

---

# 510. TEST PARTIAL BACKFILL

Only 3 ideas linked should still work.

---

# 511. NO MASS MIGRATION REQUIREMENT

Ship useful incremental system.

---

# 512. FIRST IMPLEMENTATION SLICE

Target:

```text
problem schema

job schema or embedded job model

workflow model

problem↔idea edges

deterministic loaders/indexes

Problem Atlas list

Problem detail page

one dogfood dataset

tests
```

---

# 513. SECOND SLICE

Add:

```text
workflow visualization

problem family

friction filters

actor/job browsing
```

only if first slice works.

---

# 514. THIRD SLICE

Add:

```text
cross-sector analogies

white-space discovery

solution-density views
```

after real data supports.

---

# 515. DO NOT IMPLEMENT EVERYTHING AT ONCE

This prompt is comprehensive specification.

It is not permission to add every optional feature.

---

# 516. VERTICAL SLICE PRINCIPLE

One working end-to-end problem:

```text
source evidence
→ problem
→ job
→ workflow
→ linked idea
→ public page
→ search
```

beats 20 unused schemas.

---

# 517. DOGFOOD PROBLEM BRIEF

For real current case produce:

```text
PROBLEM:
...

PERFORMER:
...

JOB:
...

CONTEXT:
...

TRIGGER:
...

CURRENT WORKFLOW:
1.
2.
3.

FRICTION:
...

WORKAROUND:
...

CONSEQUENCE:
...

DESIRED OUTCOME:
...

EVIDENCE:
...

COUNTEREVIDENCE:
...

CURRENT ALTERNATIVES:
...

LINKED IDEAS:
...

UNKNOWN:
...

NEXT RESEARCH QUESTION:
...
```

---

# 518. DOGFOOD WORKFLOW MAP

Provide:

```text
TRIGGER

↓

STEP 1
actor
input
system
output

↓

HANDOFF

↓

STEP 2

↓

DECISION

↓

EXCEPTION

↓

END STATE
```

---

# 519. DOGFOOD TIME MAP

Only with evidence.

---

# 520. DOGFOOD COST MAP

Only with evidence.

---

# 521. DOGFOOD ARTIFACT MAP

Real artifacts where known.

---

# 522. DOGFOOD SYSTEM MAP

Real current systems.

---

# 523. DOGFOOD LINK TO IDEA

Explain exactly which problem portion idea addresses.

---

# 524. SOLUTION COVERAGE

Maybe idea addresses:

```text
steps 4–6
```

not entire problem.

Show.

---

# 525. RESIDUAL PROBLEM

What remains after proposed solution?

Important.

---

# 526. NEW PROBLEM CREATION

Could proposed solution create new work?

Example:

```text
AI automation
→ human review requirement
```

Record hypothesis.

---

# 527. PROBLEM TRADEOFF

Every intervention can move friction.

TERRAIN should support later before/after analysis.

---

# 528. PROBLEM LANDSCAPE METRICS

Possible aggregate:

```text
number of supported problems

problem families

problem↔idea links

orphan ideas

white-space problems

workflow archetypes
```

These are inventory metrics, not success metrics.

---

# 529. REAL SUCCESS METRIC

TERRAIN succeeds if it changes decisions.

Examples:

```text
idea rejected because underlying problem weak

two ideas merged because same problem/intervention

new research prioritized around high-evidence problem

feature removed because not linked to job

new venture hypothesis discovered from repeated workflow friction
```

---

# 530. DECISION TRACE

When TERRAIN affects decision, link evidence.

---

# 531. NOT A SCORE FACTORY

Do not add:

```text
problemScore = 87
```

as center.

---

# 532. MULTIDIMENSIONAL PROBLEM PROFILE

If comparison needed, show:

```text
evidence maturity

frequency evidence

consequence evidence

current workaround

alternative satisfaction

workflow centrality

unknowns
```

without arbitrary combined number.

---

# 533. SCORING FUTURE

If later score genuinely useful:

follow repository scoring governance.

Not part of minimum mission.

---

# 534. IMPORTANCE / SATISFACTION SURVEYS

Do not fabricate.

Can support actual future survey data.

---

# 535. ODI-LIKE OUTCOME ANALYSIS

May inspire structure.

Do not adopt proprietary methodology blindly or claim compliance with branded methods.

---

# 536. JTBD SCHOOLS

Jobs-to-be-Done terminology varies.

Do not become dogmatic.

Use practical common denominator:

```text
performer

circumstance

progress/job

desired outcome

current alternative
```

---

# 537. NO FRAMEWORK RELIGION

TERRAIN is for better decisions, not proving a methodology.

---

# 538. JOURNEY MAPPING

Use when chronological user experience matters.

---

# 539. SERVICE BLUEPRINT

Use when frontstage/backstage/handoff matters.

---

# 540. PROCESS MAP

Use when operational sequence matters.

---

# 541. JOB MAP

Use when job steps generalize.

---

# 542. CAUSAL MAP

Use when symptoms and causes matter.

---

# 543. CHOOSE REPRESENTATION BASED ON QUESTION

Do not make every problem produce all five diagrams.

---

# 544. DOCUMENTATION

Create concise architecture documentation.

---

# 545. DATA MODEL DOC

Explain:

```text
problem

job

workflow

friction

link to idea
```

---

# 546. CONTRIBUTION GUIDE

How to add problem evidence.

---

# 547. CONTRIBUTION RULE

Never submit unsourced AI-generated problem as observed fact.

---

# 548. REVIEW GUIDE

How to evaluate:

```text
solution neutrality

evidence

duplicate identity

context
```

---

# 549. USER GUIDE

How friends explore:

```text
role → job → problem → ideas
```

---

# 550. RESEARCH GUIDE

How to perform problem-first research.

---

# 551. ANTI-PATTERN GUIDE

Examples:

```text
solution masquerading as problem

generic pain adjectives

fake personas

made-up statistics

feature request treated as job

one anecdote universalized

outdated workflow

duplicate problems
```

---

# 552. CLAUDE IMPLEMENTATION STYLE

Make narrow commits if possible.

---

# 553. VERIFY AFTER EACH LOGICAL CHANGE

Run relevant tests.

---

# 554. DO NOT WAIT UNTIL END

Catch regressions early.

---

# 555. USE CURRENT TEST COMMANDS

Inspect `package.json`.

Do not assume historical names.

---

# 556. NO FAKE PASS

Execute.

---

# 557. RECORD EXACT COMMANDS

Final report.

---

# 558. FAILED TEST

Investigate root cause.

Do not disable test casually.

---

# 559. EXISTING FAILURE

If failure predates work:

prove it.

Do not claim caused by someone else without evidence.

---

# 560. NEW DEPENDENCY

Require justification.

---

# 561. DELETE UNUSED CODE

Before completion.

---

# 562. DEAD FILE

Do not leave abandoned implementation.

---

# 563. GENERATED ARTIFACT

Follow current generation architecture.

---

# 564. CHECK MODE

Do not make validators mutate state.

OMEGA may already enforce.

---

# 565. BUILD DETERMINISM

Respect existing rules.

---

# 566. PUBLIC SITE

Do not break GitHub Pages/static deployment.

---

# 567. URLs

Stable where feasible.

---

# 568. SEARCH LINKS

Shareable where current system supports.

---

# 569. EXPORT

If easy, include TERRAIN data in structured export.

Do not redesign export system.

---

# 570. API CONSUMERS

Document structured interfaces for other missions.

---

# 571. VERSIONING

Changes to problem schema should be versioned.

---

# 572. FUTURE IMPORTS

Allow later:

```text
interview notes

CSV process maps

external problem research
```

without schema rewrite.

---

# 573. DO NOT INGEST PII BY DEFAULT

---

# 574. EVIDENCE GRANULARITY

Evidence may support:

```text
whole problem
```

or only:

```text
one friction
```

Represent correctly.

---

# 575. CLAIM-SCOPE MATCH

Source saying:

```text
approval delays are common
```

does not prove:

```text
they cost €2B.
```

---

# 576. QUANTIFICATION DISCIPLINE

Every number needs:

```text
unit

population

time period

source
```

---

# 577. RANGE

Prefer ranges when data uncertain.

---

# 578. EXTRAPOLATION

Explicitly label.

---

# 579. MARKET-SIZE BOUNDARY

TERRAIN does not redo market sizing.

It may provide denominator inputs.

---

# 580. PROBLEM POPULATION

If known:

```text
number of actors/transactions
```

can be stored as evidence.

But financial sizing belongs existing systems.

---

# 581. PROBLEM FREQUENCY × POPULATION

Useful raw signal.

Not automatic TAM.

---

# 582. VALUE OF TIME

Do not monetize labor without wage assumptions.

---

# 583. REGULATORY PENALTY

Only from official/JURIS-confirmed sources.

---

# 584. FAILURE COST

May be highly skewed.

Capture distributions/ranges if known.

---

# 585. USER FRUSTRATION

Qualitative evidence acceptable.

Do not pretend monetary.

---

# 586. PROBLEM PERSISTENCE

Some problems are temporary migration pain.

Others recurring.

Distinguish.

---

# 587. ONE-TIME JOB

Valid.

---

# 588. RECURRING JOB

Valid.

---

# 589. CONTINUOUS JOB

Valid.

---

# 590. LATENT JOB

Only arises under event.

---

# 591. URGENT JOB

Deadline/incident driven.

---

# 592. OPTIONAL JOB

Lower stakes.

---

# 593. JOB COMPETITION

Actors have limited attention.

A problem can be real but deprioritized.

Mercury later tests buying/action.

---

# 594. "IMPORTANT BUT IGNORED"

Possible.

Do not assume monetization.

---

# 595. MOTIVATION

Record actual evidence for why actor cares.

---

# 596. HABIT

Current process may persist because familiarity.

Mercury handles switching commercially.

---

# 597. ANXIETY

Do not invent.

---

# 598. TRUST

Problem may be inability to trust output.

Map if evidence exists.

---

# 599. VERIFICATION COST

Important AI-era problem archetype.

---

# 600. HUMAN REVIEW

Can itself be job/friction.

---

# 601. AI-ERA WORKFLOW CHANGE

Research how generative AI creates:

```text
new review

new verification

new provenance

new coordination

new exception
```

work.

---

# 602. AUTOMATION PARADOX

Automation can reduce core labor but increase oversight.

TERRAIN should capture both.

---

# 603. NEW WORK CREATED BY AI

Potential source of opportunities.

---

# 604. AGENT-HANDOFF PROBLEMS

Human ↔ agent.

Agent ↔ agent.

System ↔ agent.

Only if observed/current research supports.

---

# 605. AI OUTPUT AUDIT

Job:

```text
determine whether AI output can be trusted
```

may recur across sectors.

---

# 606. AGENT PERMISSION / APPROVAL

Another workflow archetype.

---

# 607. AI COST RECONCILIATION

Another possible pattern.

But don't force AI theme.

---

# 608. NON-AI PROBLEMS

TERRAIN must remain technology-neutral.

---

# 609. MANUAL INDUSTRIES

Search them.

---

# 610. PHYSICAL WORKFLOWS

Support.

---

# 611. FIELD WORK

Support.

---

# 612. GOVERNMENT WORKFLOWS

Support.

---

# 613. HEALTHCARE WORKFLOWS

Support without unsafe conclusions.

---

# 614. FINANCE WORKFLOWS

Support.

---

# 615. LOGISTICS WORKFLOWS

Support.

---

# 616. PROFESSIONAL SERVICES

Support.

---

# 617. CONSUMER JOBS

Support.

---

# 618. MARKETPLACE JOBS

Both sides may have different jobs.

---

# 619. TWO-SIDED PROBLEM MAP

Do not merge buyer/seller jobs.

---

# 620. B2B MULTI-STAKEHOLDER MAP

User/reviewer/approver may differ.

---

# 621. PROBLEM CONFLICT

Solution helping one actor may harm another.

Expose.

---

# 622. INCENTIVE MISALIGNMENT

Workflow friction may exist because actors optimize different things.

---

# 623. INFORMATION ASYMMETRY

Problem archetype where one actor lacks information another has.

---

# 624. TRUST GAP

Problem archetype.

---

# 625. COORDINATION FAILURE

Problem archetype.

---

# 626. PRINCIPAL–AGENT-LIKE ISSUES

Can be modeled descriptively.

Do not force economic theory labels.

---

# 627. BUDGET / AUTHORITY

Mercury owns actual buying.

TERRAIN may note workflow authority constraints.

---

# 628. POLICY AS WORKFLOW

Rules can create steps.

JURIS owns legal meaning.

---

# 629. FORM AS INTERFACE

Government/enterprise forms reveal data requirements.

---

# 630. FORM DIFF

If different jurisdictions/forms request different fields:

context-specific workflow.

---

# 631. DEADLINE MAP

Deadlines often create urgency.

---

# 632. CALENDAR-DRIVEN JOB

Examples:

```text
month-end

quarter-end

renewal

audit
```

---

# 633. EVENT-DRIVEN JOB

Examples:

```text
incident

shipment

new hire

contract
```

---

# 634. VOLUME-DRIVEN BREAKPOINT

A workflow may become painful only above threshold.

---

# 635. COMPLEXITY-DRIVEN BREAKPOINT

Likewise.

---

# 636. LEGACY-SYSTEM BREAKPOINT

Likewise.

---

# 637. CROSS-BORDER BREAKPOINT

Likewise.

---

# 638. PROBLEM ONSET

When does pain begin?

---

# 639. PROBLEM ESCALATION

What makes it worse?

---

# 640. PROBLEM RESOLUTION TODAY

How is it eventually resolved?

---

# 641. RESOLUTION QUALITY

Current workaround may produce acceptable result slowly.

---

# 642. TIME vs QUALITY TRADEOFF

Capture.

---

# 643. COST vs RISK TRADEOFF

Capture.

---

# 644. SPEED vs CONTROL TRADEOFF

Capture.

---

# 645. DESIRED OUTCOME TRADEOFF

Different desired outcomes can conflict.

---

# 646. OPPORTUNITY SHOULD RESPECT TRADEOFF

Do not optimize one dimension blindly.

---

# 647. PROBLEM-FIRST COMPARISON

When evaluating linked ideas later, ask:

```text
which part of job?

which outcome?

which friction?

what tradeoff?
```

---

# 648. REDUNDANT IDEAS

If 5 ideas solve same step similarly:

surface.

---

# 649. COMPLEMENTARY IDEAS

If different steps:

surface.

---

# 650. MISSING STEP

Workflow step with no solution but major friction.

Research.

---

# 651. OVER-AUTOMATED STEP

Many ideas target easy visible step while hard downstream step ignored.

Surface.

---

# 652. WORKFLOW BOTTLENECK

The most painful stage may not be where ideas cluster.

---

# 653. UPSTREAM LEVER

Fixing upstream cause may eliminate multiple downstream problems.

---

# 654. ROOT-CAUSE OPPORTUNITY

Potentially stronger than symptom tool.

But requires evidence/feasibility later.

---

# 655. DOWNSTREAM WEDGE

Sometimes symptom is easier commercial entry.

Do not automatically reject.

---

# 656. TERRAIN DOES NOT CHOOSE STRATEGY

It makes structure visible.

ORBIT/CHESSBOARD/MERCURY decide later.

---

# 657. ACTIVE RESEARCH PACKET

For each deep problem:

```text
Problem statement

Actor

Job

Workflow

Evidence

Counterevidence

Current alternatives

Unknowns

Research questions
```

---

# 658. FRIEND REVIEW PACKET

Ask reviewers:

```text
Have you seen this?

What step is wrong?

What is missing?

What do people actually do?

What is the consequence?

```

---

# 659. NO "DO YOU LIKE THIS IDEA?"

Problem review happens before idea preference.

---

# 660. DATA MODEL STABILITY

Use dogfood evidence to stabilize.

---

# 661. CHANGELOG

Record TERRAIN architecture introduction.

---

# 662. MIGRATION DOC

Only if needed.

---

# 663. PUBLIC METHODOLOGY

Explain problem-first approach.

---

# 664. METHODOLOGY DISCLAIMER

Public problem maps are research artifacts, not universal truth.

---

# 665. EVIDENCE LIMITATION

Include source limitations.

---

# 666. TIME SENSITIVITY

Include as-of.

---

# 667. RESEARCH ETHICS

No deceptive interviews.

No scraping private systems.

No unnecessary PII.

No fabricated quotes.

---

# 668. EXTERNAL TOOL AUTHORITY

Do not contact real people automatically unless explicitly authorized by current policy/user.

---

# 669. BROWSER ACTIONS

Research only.

Do not submit forms/sign up/purchase unless explicitly authorized.

---

# 670. CLAUDE AUTONOMY BOUNDARY

You may autonomously:

```text
read

search

analyze

code

test

refactor relevant code

generate fixture data

update documentation
```

within repository task.

---

# 671. DO NOT AUTONOMOUSLY

```text
email people

post publicly

purchase anything

sign legal agreements

contact prospects

change external production accounts
```

unless explicit current authorization exists.

---

# 672. CODE REVIEW PASS

Use Opus 4.6's review capability.

Review all changed files.

---

# 673. REVIEW FOR WRONG ABSTRACTION

Especially.

---

# 674. REVIEW FOR OVERLAP

Ensure not duplicated by queued missions.

---

# 675. REVIEW FOR UNSOURCED PROBLEM CLAIMS

Critical.

---

# 676. REVIEW FOR SOLUTION CONTAMINATION

Critical.

---

# 677. REVIEW FOR PRIVATE LEAKAGE

Critical.

---

# 678. REVIEW FOR MASS-GENERATED LOW-QUALITY DATA

Critical.

---

# 679. REVIEW FOR DEAD CODE

---

# 680. REVIEW FOR BROKEN LINKS

---

# 681. REVIEW FOR SCHEMA DRIFT

---

# 682. REVIEW FOR PERFORMANCE

---

# 683. REVIEW FOR ACCESSIBILITY

TERRAIN-specific.

---

# 684. REVIEW FOR MOBILE

TERRAIN-specific.

---

# 685. REVIEW FOR NO-JS

If promised.

---

# 686. ADVERSARIAL FINAL REVIEW

Spawn independent reviewer if Antigravity subagents available.

Give it only:

```text
mission goal

diff

tests

dogfood artifacts
```

Ask it to find:

```text
unsupported assumptions

overlap

overengineering

schema mistakes

evidence inflation

privacy leaks

UX confusion

solution bias
```

---

# 687. DO NOT DEFEND YOUR WORK

Fix valid criticism.

---

# 688. SECOND ADVERSARIAL REVIEW

Ask:

> If TERRAIN disappeared tomorrow, what capability would actually be lost?

If answer is:

```text
some extra Markdown pages
```

mission failed.

---

# 689. REAL CAPABILITY LOSS SHOULD BE

```text
we would lose structured knowledge of
problems/jobs/workflows and their evidence,
and ideas could no longer be traced back
to problem reality.
```

---

# 690. THIRD REVIEW

Ask:

> Has this system made it harder or easier to understand one venture?

If harder:

simplify.

---

# 691. FOURTH REVIEW

Ask:

> Can it reveal that an idea has no real supported problem?

If not:

mission failed.

---

# 692. FIFTH REVIEW

Ask:

> Can it reveal a strong problem with no current idea?

If not:

mission incomplete.

---

# 693. SIXTH REVIEW

Ask:

> Can it show multiple ideas solving the same problem?

---

# 694. SEVENTH REVIEW

Ask:

> Can it show where in workflow an idea intervenes?

---

# 695. EIGHTH REVIEW

Ask:

> Can it distinguish fact from hypothesis?

---

# 696. NINTH REVIEW

Ask:

> Can it preserve counterevidence?

---

# 697. TENTH REVIEW

Ask:

> Can it represent UNKNOWN honestly?

---

# 698. SUCCESS DEFINITION

TERRAIN is successful when VenturaAtlas can answer:

# WHO?

Who performs this work?

# WHAT?

What are they trying to accomplish?

# WHEN?

What context/trigger causes the job?

# HOW?

How is the work currently done?

# WITH WHAT?

Which systems/documents/tools?

# WHERE?

Where does friction occur?

# WHY?

What causes the problem?

# HOW OFTEN?

How frequently?

# SO WHAT?

What consequence follows?

# WHAT NOW?

What workaround/current alternative exists?

# WHAT DO THEY WANT?

What outcome matters?

# EVIDENCE?

Why do we believe this?

# CONTRADICTION?

Why might it not hold universally?

# IDEAS?

Which VenturaAtlas interventions address it?

# WHITE SPACE?

Which supported problems have no intervention?

---

# 699. A POWERFUL TARGET EXPERIENCE

A user should eventually open a problem page and see:

```text
PROBLEM

Warehouse billing teams cannot reliably convert
operational activity records into complete
customer invoices without manual reconciliation.

ACTOR

Billing coordinator at multi-client 3PL.

JOB

Issue a complete, defensible invoice for all
chargeable customer activity.

TRIGGER

Billing cycle / customer invoice deadline.

CURRENT WORKFLOW

1. Export activity from WMS.
2. Export customer rate schedule.
3. Normalize identifiers.
4. Match activities to rate rules.
5. Investigate unmatched rows.
6. Ask operations for clarification.
7. Build invoice support.
8. Enter/import invoice.

MAIN FRICTION

Identifier mismatch and exception reconciliation.

CURRENT WORKAROUND

Spreadsheet + manual review.

CONSEQUENCE

Delayed invoice / missed charge / staff time.

EVIDENCE

[actual cited sources]

COUNTEREVIDENCE

Some modern WMS/billing suites automate large portions.

CONTEXT

Most severe in multi-client,
high-exception environments.

DESIRED OUTCOME

Issue complete invoice with minimal manual reconciliation.

LINKED VENTURAATLAS IDEAS

idea-X
idea-Y

UNRESOLVED

How frequently do unmatched activities occur?

WHAT WOULD FALSIFY THE OPPORTUNITY

Modern target firms already achieve near-zero
manual reconciliation with existing systems.
```

That is substantially more useful than:

```text
Logistics SaaS
Score: 82
Market demand: 8
```

---

# 700. ANOTHER TARGET EXPERIENCE

Browse:

```text
ROLE:
Compliance Manager

JOB:
Prepare evidence for audit

FRICTION:
Missing/fragmented evidence

ARTIFACT:
PDF + screenshot + ticket

WORKAROUND:
Manual evidence packet

RELATED PROBLEMS:
17

RELATED IDEAS:
9
```

---

# 701. ANOTHER TARGET EXPERIENCE

Search:

```text
"copy data from PDF to spreadsheet"
```

Return problems across:

```text
insurance

logistics

government

finance

healthcare
```

with evidence and linked ideas.

---

# 702. THIS ENABLES BETTER DISCOVERY

Instead of:

```text
Generate 50 startup ideas.
```

Future research can ask:

```text
Find high-evidence workflows where:
- information crosses organizational boundaries,
- repeated manual verification occurs,
- current workaround is spreadsheet/email,
- consequence is economically meaningful,
- existing solutions remain incomplete.
```

This is a fundamentally stronger discovery engine.

---

# 703. BUT DO NOT TURN TERRAIN INTO IDEA GENERATOR YET

Build the problem world first.

---

# 704. FINAL DELIVERABLES

When complete, return a final mission report containing:

## A. CURRENT-STATE REPOSITORY DISCOVERY

What exists now.

## B. GAP CONFIRMATION

Why TERRAIN is distinct.

## C. OVERLAP ANALYSIS

OMEGA / ORBIT / MERCURY / FORGE / JURIS / CAPITAL / CONSTELLATION / RELAY / CHESSBOARD.

## D. DOMAIN MODEL

Exact entities retained.

## E. ENTITIES REJECTED

And why.

## F. PROBLEM SCHEMA

Implementation.

## G. JOB / OUTCOME MODEL

Implementation.

## H. WORKFLOW MODEL

Implementation.

## I. FRICTION / WORKAROUND MODEL

Implementation.

## J. PROBLEM↔IDEA RELATIONSHIPS

Implementation.

## K. EVIDENCE MODEL

How provenance/current repo system is reused.

## L. SEARCH / INDEX

Implementation.

## M. PROBLEM ATLAS UX

Implementation.

## N. REAL DOGFOOD #1

Full problem/workflow map.

## O. REAL DOGFOOD #2

Different archetype.

## P. REAL DOGFOOD #3

Different archetype.

## Q. EXTERNAL CURRENT RESEARCH

Sources and exact findings.

## R. COUNTEREVIDENCE

For dogfood cases.

## S. ORPHAN IDEA FINDINGS

If any.

## T. WHITE-SPACE PROBLEM FINDINGS

If any.

## U. CROSS-SECTOR ANALOGIES

Supported examples.

## V. PRIVATE/PUBLIC BOUNDARY

Proof.

## W. TESTS RUN

Exact commands/results.

## X. FILES CHANGED

Concise.

## Y. REJECTED IMPLEMENTATION IDEAS

What you deliberately did not build.

## Z. NEXT HIGHEST-VALUE HUMAN RESEARCH ACTION

One or a very small number of concrete actions.

---

# 705. COMPLETION IS FORBIDDEN IF

Do not say complete if:

```text
no real current venture was dogfooded

no external evidence was inspected

no counterevidence was sought

problem statements remain solution-contaminated

AI-generated hypotheses appear as facts

private interviews leak public

no workflow representation exists

no idea↔problem relationship exists

no tests ran

UI exists without structured data

structured data exists without usable UX

all 324 ideas were mechanically backfilled with low-quality claims

duplicate problems are rampant

UNKNOWN fields were filled by speculation

TERRAIN duplicates MERCURY/FORGE/CHESSBOARD
```

---

# 706. NON-NEGOTIABLE FINAL RULES

NO PROBLEM WITHOUT AN ACTOR.

NO ACTOR WITHOUT A JOB OR GOAL.

NO JOB WITHOUT A CONTEXT WHERE RELEVANT.

NO WORKFLOW WITHOUT A TRIGGER AND END CONDITION.

NO FRICTION WITHOUT A LOCATION IN WORK.

NO PAIN CLAIM WITHOUT EVIDENCE TYPE.

NO UNIVERSAL CLAIM FROM ONE ANECDOTE.

NO COST CLAIM WITHOUT SOURCE/ASSUMPTION.

NO FREQUENCY CLAIM WITHOUT BASIS.

NO EMOTION CLAIM WITHOUT USER EVIDENCE.

NO QUOTE WITHOUT REAL SOURCE.

NO PROBLEM STATEMENT THAT SECRETLY NAMES OUR SOLUTION.

NO IDEA TREATED AS PROOF THAT ITS PROBLEM EXISTS.

NO CURRENT ALTERNATIVE IGNORED.

NO COUNTEREVIDENCE HIDDEN.

NO UNKNOWN REPLACED WITH CLAUDE'S BEST GUESS.

NO WHITE SPACE AUTOMATICALLY PROMOTED TO STARTUP.

NO PROBLEM SCORE USED TO MASK WEAK EVIDENCE.

NO MASS BACKFILL FOR COMPLETENESS THEATER.

NO GRAPH DATABASE WITHOUT NEED.

NO NEW MAJOR DEPENDENCY WITHOUT NEED.

NO MULTI-AGENT WRITE RACES.

NO FINAL "DONE" WITHOUT EXECUTED TESTS.

---

# 707. DEEPER FINAL PRINCIPLE

VenturaAtlas must stop treating this:

```text
IDEA
```

as the fundamental atom of opportunity.

The more fundamental structure is:

```text
PERSON / ROLE
↓
TRYING TO MAKE PROGRESS
↓
IN A PARTICULAR CONTEXT
↓
USING A CURRENT WORKFLOW
↓
THROUGH TOOLS, PEOPLE AND ARTIFACTS
↓
ENCOUNTERING FRICTION
↓
CREATING WORKAROUNDS
↓
SUFFERING CONSEQUENCES
↓
SEEKING BETTER OUTCOMES
```

An idea is merely:

# ONE POSSIBLE INTERVENTION IN THAT TERRAIN.

---

# 708. FINAL TRANSFORMATION

Before TERRAIN:

```text
We found 324 startup ideas.
```

After TERRAIN:

```text
We understand which real jobs those ideas claim to serve.

We understand the current workflows.

We know where evidence exists.

We know where evidence is weak.

We know where different ideas attack the same underlying problem.

We know where a solution targets only a symptom.

We know where current alternatives already work.

We know which workarounds reveal unmet need.

We know which frictions recur across industries.

We can browse by problem instead of only solution.

We can find supported problems with no intervention.

We can identify ideas with no credible problem linkage.

We can trace product requirements back to the real-world job.

We can distinguish the problem from the thing we hope to sell.
```

---

# 709. THE MOST IMPORTANT QUESTION

For every venture, TERRAIN should force VenturaAtlas to answer:

# IF WE DELETE THE STARTUP IDEA FROM OUR MINDS, DOES THE UNDERLYING PROBLEM STILL CLEARLY EXIST?

If the answer is:

```text
NO
```

or:

```text
UNKNOWN
```

that fact is strategically important.

---

# 710. SECOND MOST IMPORTANT QUESTION

# CAN WE DESCRIBE WHAT THE PERSON DOES TODAY WITHOUT MENTIONING OUR PRODUCT?

If no:

research is too solution-biased.

---

# 711. THIRD MOST IMPORTANT QUESTION

# CAN WE POINT TO THE EXACT STEP WHERE THE FRICTION OCCURS?

If no:

problem may be too vague.

---

# 712. FOURTH MOST IMPORTANT QUESTION

# WHAT DO THEY DO INSTEAD?

If no answer:

we do not understand current reality.

---

# 713. FIFTH MOST IMPORTANT QUESTION

# WHAT HAPPENS IF THEY DO NOTHING?

If:

```text
almost nothing
```

importance may be weak.

---

# 714. SIXTH MOST IMPORTANT QUESTION

# WHAT WOULD PROVE US WRONG?

If no answer:

the hypothesis is unfalsifiable storytelling.

---

# 715. SEVENTH MOST IMPORTANT QUESTION

# WHICH PART OF THIS IS OBSERVED, AND WHICH PART DID CLAUDE INFER?

Always visible.

---

# 716. FINAL CLAUDE SELF-AUDIT

Before finishing, reread the complete diff and explicitly challenge yourself:

```text
Did I fall in love with the ontology?

Did I add entities because they sound academically complete?

Did I mistake an idea's description for problem evidence?

Did I invent user emotions?

Did I invent frequency?

Did I invent current spend?

Did I infer workflow without source?

Did I hide contradictory evidence?

Did I overgeneralize one industry?

Did I force everything into SaaS?

Did I build another CRM?

Did I build another product-requirements system?

Did I build another competitive-intelligence system?

Did I build another operations system?

Did I create a giant knowledge graph nobody needs?

Did I generate data merely to make dashboards look populated?

Did I optimize completeness rather than truth?

Did I leave UNKNOWN where evidence truly ends?

Did I make one real problem dramatically easier to understand?
```

Correct every significant failure before completion.

---

# 717. STARTING COMMAND

Your first intellectual action is:

```text
DO NOT ASK:
"What should we build?"

ASK:
"What is happening in the world today?"
```

Then inspect the repository.

Then investigate the work.

Then model the terrain.

Then—and only then—connect ideas to it.

# BEGIN NOW.