# RESET XVIII — Zero-Baseline
## Research date: 18 August 2026
**Round type:** HARD EPISTEMIC RESET
**Classification:** RESET — all old champion labels discarded
**New scoring system:** 8-Gate Binary (Reality / Buyer / Frequency / Failure Cost / Access / Substitute / Experimentability / Expansion)
**Ideas ingested:** idea-421, idea-422, idea-423, idea-424
**Research run ID:** run-res-reset-xviii-20260818-zero-baseline

---

## Reset Rules

```
Old score = ignored
Old champion label = ignored
Our earlier thesis = allowed to lose
Regulatory importance ≠ startup attractiveness
LLM consensus = not validation
Government deadline ≠ customer pain
Large TAM ≠ good wedge
```

An idea may re-enter the top tier only after:
1. Fresh current-law check
2. Competitor search
3. Official/free-tool search
4. Buyer identification
5. A credible experiment that could falsify it

---

## Why Reset

VenturaAtlas had 294 canonical ideas, 382 dossier files, 4,425 idea-specific prompts, and **zero active experiments recorded**. Its last validation explicitly did not validate market/evidence truth. The reset optimizes for finding what the previous research framing systematically missed.

---

## Most Important Negative Finding

Governments and standards bodies increasingly provide:
- Official APIs
- Test environments
- Validators
- Reference implementations
- Sandboxes
- Conformance suites

The DPP Registry launched July 2026 with an API and free machine-readable semantic infrastructure. The Commission provides an e-invoice validation Test Bed. Poland provides a KSeF integration environment. ICS2 has formal conformance testing.

**Simple conformance is becoming infrastructure, not a startup.**

Remaining value moves toward: cross-system behavior, production replay, state reconciliation, real customer workflow, historical failures, multi-vendor interoperability, actual remediation.

---

## 8-Gate Scoring System

| Gate | Question |
|------|----------|
| **Reality** | Does the problem exist today? |
| **Buyer** | Can we name the exact payer? |
| **Frequency** | Does it recur? |
| **Failure cost** | Is being wrong expensive? |
| **Access** | Can a startup technically reach/test it? |
| **Substitute** | Is there already a cheap/free solution? |
| **Experimentability** | Can we test demand quickly? |
| **Expansion** | Does solving the wedge lead somewhere larger? |

Each gate: 🟢 GREEN / 🟡 YELLOW / 🔴 RED
No decimal pseudo-precision initially. Numeric score restored only after evidence.

---

## Zero-Baseline Candidate Board

| Candidate | Reality | Buyer | Freq | Access | Substitute | Score |
|-----------|---------|-------|------|--------|------------|-------|
| Invoice Replay Cloud | 🟢 | 🟢 | 🟢 | 🟢 | 🟡/🔴 | 88 |
| ICS2 SourceData Gate | 🟢 | 🟢 | 🟢 | 🟢 | 🟡/🔴 | 85 |
| Euro 7 Evidence Drift | 🟡 | 🟢 | 🟢 | 🔴 | 🟡 | 79 |
| EHDS EHR Chaos Lab | 🟡 | 🟢 | 🟢 | 🟡 | 🟡 | 74/WATCH |
| Generic EUDR API validator | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | **KILL** |
| Generic e-invoice XML validator | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | **KILL** |
| Generic KSeF/France gateway | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | **KILL** |
| Generic ICS2 filing platform | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | **KILL** |

No new overall champion declared. Invoice Replay Cloud and ICS2 SourceData Gate are promising enough to investigate, but neither has earned the right to displace ProofRail, DataAccess, AgentGate, CATCHFlow or other previous finalists until buyer/substitute research actually demonstrates it.

**That is exactly what a reset should do: remove confidence before removing evidence.**

---

## New Ideas

### idea-421 — Invoice Replay Cloud (88/100, priority)

**Kills first:** Generic e-invoice APIs, XML validators, Peppol gateways, AI invoice compliance checkers.

**Residual thesis:** `schema valid ≠ business transaction works`. A syntactically perfect invoice can fail because of routing, tax treatment, lifecycle handling, recipient lookup, duplicate behavior, credit-note logic, rounding, or downstream ingestion.

Falsification question: Do multinational ERP/tax teams still build substantial internal regression suites despite paying an e-invoicing network? If no: kill. If yes: potentially very interesting.

Poland KSeF 2.0 mandatory Feb/Apr 2026. France receiver-capability obligation Sep 1, 2026. EU ViDA cross-border Jul 2030.

### idea-422 — ICS2 SourceData Gate (85/100, priority)

**Kills first:** ICS2 filing SaaS, ICS2 conformance test suites.

**Residual thesis:** The wedge is upstream of the ENS. Commercial invoice, packing list, shipper record, consignee, booking, HS/product master, house/master transport data → tested for whether they contain enough specific, coherent information to generate a high-quality ENS before filing. Stop-word list updated Aug 3, 2026.

Bear case: existing freight/customs platforms increasingly validate this themselves; iCustoms markets pre-filing validation.

Survival condition: persistent shipper → forwarder → carrier data-quality gap not solved by the filing application.

### idea-423 — Euro 7 Vehicle Evidence Drift (79/100, watch)

Euro 7 application Nov 29, 2026. Environmental Vehicle Passport concept. Configuration drift: type approval ↔ vehicle configuration ↔ battery durability ↔ software/calibration ↔ environmental data ↔ passport.

**NOT priority** because: automotive compliance dominated by sophisticated OEM engineering stacks, homologation specialists, very long procurement cycles. Bootstrap accessibility poor.

Lesson: A perfect regulation does not compensate for an unreachable buyer.

### idea-424 — EHDS EHR Chaos Lab (74/100, watch)

European Health Data Space building single-market framework for EHR interoperability/security. Cross-vendor EHR interoperability regression cloud — conceptually attractive but timing weak vs 2026 transaction systems.

**WATCH, don't build.** Earlier research sometimes over-promoted because the long-run policy vision looked large. Reset prevents this.

---

## Graveyard Batch (RESET XVIII)

| Idea | Kill Reason |
|------|-------------|
| Generic EUDR API validator | Commission provides test environments, manuals, training; Sep 2026 sessions scheduled |
| Generic e-invoice XML validator | Commission eInvoice Test Bed (REST/SOAP); ecosio, multiple open-source validators free |
| Generic KSeF/France Peppol gateway | Tradeshift, Pagero/Thomson Reuters, Iopole, Storecove etc. already in market; KSeF test env free |
| Generic ICS2 filing platform | SAP, Descartes, Thomson Reuters, E2open, CargoWise/iCustoms-class providers established |

---

## Watch List (RESET XVIII)

| Idea | Reason |
|------|--------|
| EHDS EHR Chaos Lab | Policy vision real but timing weak — watch for interoperability enforcement deadlines |
| DWT ReceiptDiff CI | UK Digital Waste Tracking — need to verify official Bruno fixtures before anything else |
| Building Safety Levy LevyBlock | UK Oct 2026 — need incumbent absorption check before canonical |

---

## New Research Arena Proposal

Reverse the culture: new research lives in staging arena much longer. Canonicalization becomes prestigious.

Pipeline: discovery → competitor search → official/free-substitute search → legal/current-fact verification → exact buyer → one falsification test → only then canonical consideration.

---

## Two-Tournament Structure (from now)

### Tournament A — Structural/Regulatory
Mandatory interfaces. Registries. Compliance. Industrial systems.

### Tournament B — Unconstrained Market
AI. Developer tooling. Consumer. Marketplaces. Fintech. Robotics. Health. Space. Productivity. New behaviors. Infrastructure.

Compare winners only after both searches complete. Do not allow regulatory-wedge success to become tunnel vision.

---

## Next Research Threads

1. Cross-country tax/e-invoice production failures (Poland KSeF live; France Sep 1)
2. ICS2 upstream commercial-data quality (all EU-bound consignments inside system)
3. Euro 7 environmental-passport/configuration integrity (only if OEM/supplier interviews reveal accessible wedge)
4. National machine-reporting systems generally (France/Poland illustrate national tax infrastructure creates real problems years before ViDA)
5. Non-regulatory ideas deliberately — developer tools, enterprise operations, new AI workflows, industrial software, consumer behavior, marketplaces, infrastructure

---

## Agent Role Redesign (OMEGA XIX proposal)

| Agent | Mission |
|-------|---------|
| Scout | Find the opportunity |
| Killer | Prove it should not exist |
| Official Substitute Agent | Check if regulator/standards body gives it away free |
| Incumbent Agent | Find strongest commercial implementation |
| Buyer Agent | Find actual person/business workflow |
| Experiment Agent | Falsify cheaply |
| Capital Agent | Ask if technically worse idea is commercially easier |
| Historian | Check if VenturaAtlas already found it under another name |

**Rule:** Promotion agent gets NO authority to suppress Killer Agent findings.

**New rule:** Do not search for reasons an idea is good until after recording at least three reasons it may be bad.

---

## Dossiers

- ideas/invoicereplay-cross-country-einvoice-production-regression.md (idea-421)
- ideas/ics2sourcegate-ens-upstream-data-quality-gate.md (idea-422)
- ideas/euro7evidencedrift-vehicle-config-evidence-gate.md (idea-423)
- ideas/ehds-ehrinterop-chaos-lab.md (idea-424)
