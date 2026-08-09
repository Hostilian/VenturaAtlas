# RegDiff / ProductIdentity CI — Continuous Regulatory Change Impact Engine Dossier

> **Frontier Research Tier Opportunity** (Score: 95.5 / 100)  
> **Category:** Developer Tools & Infrastructure  
> **Status:** Frontier Opportunity / Deep Validation  

---

## Key Research Question

> <span style="color:red;font-weight:bold;font-size:1.2rem">When software continuously changes a regulated physical/digital product, when does it stop being the same product?</span>

---

## Executive Summary & Core Insight

Traditional compliance software generates static CE risk assessment PDFs during initial product manufacturing.  
Modern industrial equipment operates under **continuous deployment**:  
> **A machine v4.7 receives PLC firmware v3.18, vision model v8.0, and cloud telemetry v12.2 via over-the-air updates.**

When an engineer pushes a commit modifying maximum robot arm velocity or vision model detection thresholds:
1. **Engineering asks:** Does this pass unit and regression tests?
2. **Safety asks:** Does this change the safety case or invalidate risk assessment H-42?
3. **Legal asks:** Does this constitute a *"substantial modification"* under EU Machinery Regulation Article 18, forcing us to re-certify as a new manufacturer?

**RegDiff** turns regulatory conformity into a **continuous CI/CD release gate**.

---

## Legislative & Market Catalysts (2026–2027)

1. **EU Machinery Regulation (20 January 2027)**: Article 18 explicitly dictates that any physical or digital update causing a *"substantial modification"* turns the modifier into the legal manufacturer responsible for full CE conformity.
2. **Revised EU Product Liability Directive (8 December 2026)**: Establishes strict manufacturer liability for post-sale software, updates, AI models, and cybersecurity vulnerabilities remaining under manufacturer control.
3. **Cyber Resilience Act & AI Act**: Requires continuous lifecycle conformity and auditable identity tracking for self-evolving machine learning behavior.

---

## RegDiff CI/CD Pull-Request Output

```text
RELEASE 8.0.0 — REGULATORY IMPACT ANALYSIS
───────────────────────────────────────────────────────────────────

Changed Subsystems:
  ✓ PLC Firmware: motor_controller.c (+42 / -12 lines)
  ✓ Vision Model: human_detector_v8.onnx (weights updated)
  ✓ Speed Envelope: max_velocity raised from 1.4 m/s to 1.8 m/s

Affected Regulatory Requirements:
  ⚠ EU Machinery Regulation Annex III 1.1.2 (Inherently safe design)
  ⚠ EU Machinery Regulation Annex III 1.2.6 (Control software failure)
  ⚠ Cyber Resilience Act Essential Requirement 2.1 (Attack surface)

Invalidated Safety Assumptions:
  ✗ Hazard H-19: Stopping distance under 300ms (INVALID — requires re-test)
  ✗ Hazard H-42: Operator separation zone geometry (INVALID — speed increased)

Required Action Items:
  [ ] Re-run speed-zone optical stopping validation suite
  [ ] Submit updated human detection false-negative benchmark
  [ ] Signoff required by Designated Machinery Safety Officer

Conformity Status:
  🚫 RELEASE BLOCKED — Substantial Modification Risk HIGH
```

---

## Competitive Moat & Strategic Positioning

- **Why Not Existing CE Tools (Prekam, CEM4, Riskera)?** Existing tools are static document generators used during initial design. RegDiff is **DevOps infrastructure** connected to Git commits, PLC code, and model registries.
- **Why Not Generic AI Compliance SaaS?** Generic compliance SaaS provides policy checklists. RegDiff constructs a **semantic graph connecting code diffs to physical safety case assumptions**.
- **Defensibility**: Graph of engineering commits → safety case invalidations → regulatory requirement mappings → verified human signoff decisions.

---

## Phase 0 Developer API Protocol

```text
POST /v1/release-diff
POST /v1/safety-graph/evaluate
POST /v1/evidence-link
POST /v1/conformity-gate
```

RegDiff integrates directly into GitHub Actions, GitLab CI, Jira, and PLM repositories, starting with industrial robot OEMs before expanding to medical device software and autonomous vehicles.
