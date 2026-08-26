# OMEGA-XVIII Track B Specification: Auditing the Ungoverned New Systems

**Audit Run ID:** `OMEGA-XVIII-20260826T011500Z`  
**Author:** Antigravity / Claude Track B  
**Authority Hierarchy:** `AGENTS.md` -> `.agent-system/MASTER_GOAL.md` -> `.agents/AGENTS.md` -> Track B Prompt  
**Cooperating Track:** Track A (Codex / gpt-5.6) — Sole Authoritative Writer of `.agent-system/state.json`, `.agent-system/backlog.json`, and `.agents/AGENTS.md`  

---

## 1. Mission Context & Executive Intent

Following the OMEGA-XVII content completion run and the rigorous precedent established in `research/mercury/MERCURY_REPORT.md`, multiple major system architectures landed in the repository across recent commits (`3325926` through `d6abdcb`):

1. **RELAY** (`feat(relay)`): Venture operations, fulfillment tracking, quality & CAPA management, capacity modeling, cost-to-serve analytics, supplier risk, and Ops Lab UI.
2. **ORBIT** (`feat(orbit)`): Portfolio exploration, bet sequencing, multi-lens resource envelopes, Pareto frontier optimization, Brier score forecasting accuracy, cross-category attention load modeling, risk concentration, and synergy detection.
3. **CONSTELLATION** (`feat(constellation)`): Organizational capability modeling, decision rights, delegation boundaries, shadow role detection, hiring case ROI, meeting packet verification, and Org Lab UI.
4. **CAPITAL** (`feat(capital)`): Dilution modeling, cap tables, investor pipeline scoring, data room readiness, non-dilutive grant matching, macro regulatory/procurement clock tracking, and Capital Lab UI.

None of these four systems have undergone a rigorous, honest, evidence-grounded audit in the style of `MERCURY_REPORT.md`.

### Core Directive & Epistemic Stance
Track B adopts the strict, skeptical register established by `MERCURY_REPORT.md`:
- **Separate file presence from substantive verification:** 324 files existing on disk does not prove commercial demand, nor do complex schemas prove live organizational or operational execution.
- **Distinguish architecture/scaffolding from live instances:** A browser-local client-side calculator running on synthetic demo fixtures must be clearly identified as software capability, not claimed as live operations, active portfolios, real employees, or committed capital.
- **No simulated evidence:** Never simulate, synthesize, or mock customer discovery, investment decisions, supplier relationships, or personnel actions.
- **Propose governance, do not self-apply:** Track B produces comprehensive scope dispositions, identifies reality vs. scaffolding, checks commercial framing, and prepares structured ownership proposals for Track A to apply.

---

## 2. Authority & Responsibility Boundary

| Domain / Artifact | Track A (Codex / gpt-5.6) | Track B (Claude / Antigravity) |
| :--- | :--- | :--- |
| `.agent-system/state.json` | **Sole Authoritative Writer** | Proposes metrics & status updates |
| `.agent-system/backlog.json` | **Sole Authoritative Writer** | Proposes task status dispositions |
| `.agents/AGENTS.md` (Section 2 Ownership) | **Sole Authoritative Writer** | Proposes non-overlapping ownership rows |
| `data/ideas.json` & canonical schemas | **Sole Authoritative Writer** | Inspects & validates referential integrity |
| OMEGA-XVI / XVII Closeout Papers | Writes `CODEX_*` Closeout Papers | Verified & referenced |
| RELAY, ORBIT, CONSTELLATION, CAPITAL Audit | Reviews & integrates Track B report | **Executes deep technical audit & scope disposition** |
| Commercial Framing & MERCURY Continuation | Reviews & integrates | **Audits repo-wide framing & guards C0 verdict** |

---

## 3. Scope of the Track B Audit

1. **Deep Technical & Epistemic Audit of Four Ungoverned Systems:**
   - **RELAY:** 9 JSON schemas, 2 data files, client store, computation engine (471 lines), Ops Lab UI (`docs/ops-lab.html`), contract & engine test suites.
   - **ORBIT:** Portfolio data structures (`data/portfolios.json`), portfolio engine algorithms (Pareto, Brier, attention load, risk concentration, synergy), contract & engine test suites, UI.
   - **CONSTELLATION:** 8 JSON schemas, 10-item capability ontology, 4 synthetic organizational fixtures, organizational diagnostics engine, Org Lab UI (`docs/org-lab.html`), contract & engine test suites.
   - **CAPITAL:** Regulatory/procurement clocks (`data/capital-clock*.json`), institutional funding/grant datasets, 3 dogfood venture capital plans, dilution modeling engine, Capital Lab UI (`docs/capital-lab.html`), contract & engine test suites.

2. **Scope-Disposition Tables:**
   - For every system, provide an explicit `Implemented` / `Partial` / `Not implemented` table with precise truth boundaries.

3. **Multi-Agent Governance & Role Mapping:**
   - Formulate clean, non-overlapping file-ownership rows for all four systems and their associated labs/schemas for Track A to incorporate into `.agents/AGENTS.md` and `.agent-system/agent-registry.json`.

4. **Commercial Reality & Framing Verification:**
   - Verify that `idea-061` (FactBounty) remains strictly **C0 (Hypothetical Buyer)**.
   - Verify that nowhere in rankings, dashboards, or documentation is "324/324 launch plans complete" quietly restated or conflated with commercial market validation.
