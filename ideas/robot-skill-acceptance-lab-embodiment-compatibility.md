# Robot Skill Acceptance Lab — Embodiment Compatibility Cloud

> **STAGED HYPOTHESIS — RESET XIX (2026-08-20)**  
> *This idea is in the validation staging queue and is not yet promoted to canonical rankings.*  
> **Provisional Thesis Score:** 89.0/100 | **Evidence Confidence:** 50/100 | **Market Proof:** 0/100 | **Status:** Watch

> Independent physical acceptance testing and cross-embodiment compatibility verification for learned robotics skills and Vision-Language-Action (VLA) models.

## At a Glance

| Field | Summary |
|---|---|
| Candidate ID | `candidate-reset-xix-robot-skill-acceptance` |
| Target customer | Industrial automation managers, manufacturing systems integrators, robotics-as-a-service (RaaS) fleet operators, skill marketplace vendors |
| Problem | Robot intelligence models (VLAs, learned manipulation policies) claim broad task coverage, but real-world performance degrades drastically across heterogeneous arms, grippers, cameras, compute units, and lighting conditions (cross-embodiment gap). |
| What to build | Independent physical testing lab and automated evaluation harness that executes standardized multi-cycle benchmark runs across real hardware setups, generating certified Embodiment Compatibility Passports. |
| How it makes money | Per-test acceptance suite fees (€500–€10,000 per skill/hardware matrix), ongoing regression monitoring subscriptions, and data licensing for sim-to-real transfer curves. |
| Why customers pay | Manufacturing integrators face €50k–€500k in site re-engineering and downtime costs when an AI skill fails on their specific production cell. |
| Overall opportunity score | 89.0/100 (provisional research hypothesis) |
| Confidence | 5.0/10 |
| Main advantage | Independent verification authority; proprietary physical testing dataset mapping `model × skill × embodiment × environment → real performance`. |
| Main risk | High capital cost of operating physical robot hardware; rapid progress in simulation fidelity closing the sim-to-real gap. |
| Best next validation | Benchmark 3 public VLA skills on 2 cobot setups over 500 physical trials; pitch the resulting compatibility matrix to 10 robotics integrators. |

## Detailed Concept & Problem Statement

The physical AI and robotics industry is undergoing massive capitalization (e.g., Skild AI exceeding $14B valuation, deploying with Foxconn, ABB, and Universal Robots). However, academic research and empirical deployments consistently highlight the **cross-embodiment bottleneck** (arXiv:2605.11564, arXiv:2608.01851, arXiv:2608.13049).

A learned manipulation skill (e.g., "depalletize mixed corrugated boxes") trained in simulation or on a specific testbench arm frequently fails when transferred to a customer's specific production cell due to subtle variations in:
- Kinematics & joint backlash (UR20 vs Fanuc vs ABB)
- End-effector dynamics (Robotiq 2F-85 vs vacuum suction vs OnRobot)
- Sensor noise & optical distortion (Intel RealSense vs Zivid vs Photoneo)
- Edge inference latency (NVIDIA Jetson Orin vs industrial PC)
- Environmental variables (lux levels, surface reflections, cardboard dust)

## Test Run Output (`SkillAcceptanceRun`)

```json
{
  "runId": "run-depal-ur20-20260820",
  "skillId": "adaptive-depalletize-v3.2",
  "skillVersion": "3.2.1",
  "embodimentId": "ur20-robotiq2f85-realsensed435-jetson",
  "taskDescription": "Adaptive depalletize irregular cardboard boxes",
  "trialCount": 500,
  "completionRate": 0.976,
  "unassistedRecoveryRate": 0.830,
  "humanInterventionRate": 0.018,
  "medianCycleTimeSec": 9.7,
  "p95CycleTimeSec": 12.9,
  "requiredSLOSec": 12.0,
  "scenarioResults": [
    { "scenario": "Occluded label", "result": "PASS" },
    { "scenario": "Dark carton in low lux", "result": "FAIL", "notes": "Contrast degradation on RealSense IR" },
    { "scenario": "Reflective packing tape", "result": "FAIL", "notes": "Grasp point depth estimate drifted by 4cm" },
    { "scenario": "14kg heavy payload", "result": "PASS" },
    { "scenario": "17kg payload near limit", "result": "REVIEW", "notes": "Joint 2 torque warning triggered" }
  ],
  "safetyEnvelopePass": true,
  "productionAcceptance": "CONDITIONAL",
  "conditionalRequirements": [
    "Requires minimum 300 lux ambient lighting",
    "Requires non-reflective matte carton tape"
  ]
}
```

## The Defensibility Moat

Rather than competing in the hyper-crowded model layer (robot foundation models) or simulation layer (NVIDIA Isaac / ABB), this business sits downstream as the **independent acceptance and certification authority**:
- After 10,000 standardized physical runs, the company owns the definitive empirical atlas of robot skill transferability.
- Integrators, enterprise buyers, and industrial underwriters rely on the lab's verification before committing capital to production deployments.

## Kill Conditions & 7-Day Falsification Test

- **Kill Condition 1:** OEM captive certification — ABB, Universal Robots, and Fanuc create proprietary closed skill verification walled gardens.
- **Kill Condition 2:** Sim-to-Real obsolescence — Simulation physics engines and digital twins become so accurate that physical hardware testing becomes redundant.
- **Kill Condition 3:** Capital inefficiency — The cost of acquiring and maintaining physical robot cells exceeds customer willingness to pay.
- **Kill Condition 4:** Low commercial adoption of third-party robot skills — Enterprises only buy end-to-end proprietary turnkey automation systems.

### 7-Day Experiment
Run 100 physical cycles on 2 common cobots with 3 open-source VLA models. Create an *Embodiment Compatibility Matrix* highlighting failure points under edge lighting/payload conditions. Present to 10 factory automation integrators.  
**Kill Trigger:** If fewer than 2 of 10 integrators confirm they would pay €500–€10,000 for independent acceptance test reports before production deployment -> **KILL**.

## Nearest Corpus Relations (Dedupe Status)
- `robotchangecontrol-cell-safety-change-graph`: Upstream safety change graph for deployed cells; complementary integration.
- `physical-ai-dataset-quality-exchange`: Dataset verification layer; upstream input.
- `robotwork-neutral-meter`: Telemetry metering for RaaS settlement; downstream billing layer.
