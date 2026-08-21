#!/usr/bin/env python3
"""
RESET XIX — Data Transformation Script
2026-08-20

Performs:
1. Null-fill all 319 canonical ideas with new epistemic/competitive fields
2. Apply targeted freeze flags to 6 top-10 ideas + FactBounty + ProofRail + idea-017
3. Bump ideas.json schemaVersion to 2.1.0
4. Append 2 new staged candidates to idea-staging-queue.json

Historical composite scores are NOT modified anywhere.
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).parent.parent
IDEAS_PATH = ROOT / "data" / "ideas.json"
STAGING_PATH = ROOT / "data" / "idea-staging-queue.json"

RESET_DATE = "2026-08-20"

# ─── Default null-fill for all ideas ─────────────────────────────────────────
NULL_DEFAULTS = {
    "freezeStatus": "active",
    "freezeReason": None,
    "evidenceConfidence": None,
    "marketProof": 0,
    "researchSaturationWarning": False,
    "competitionFreshnessDate": None,
    "platformCaptureRisk": None,
    "independentVerifierAdvantage": None,
    "lossDataFlywheel": None,
    "physicalRealityDepth": None,
    "riskTransferability": None,
    "nearestFundedStartup": None,
    "nearestPlatformFeature": None,
    "strongestOSSSubstitute": None,
    "killExperiment": None,
}

# ─── Targeted overrides by idea ID ────────────────────────────────────────────
TARGETED_OVERRIDES = {
    # ── FROZEN — platform absorption risk ──────────────────────────────────────
    "idea-002": {  # Repository Autopilot
        "freezeStatus": "frozen",
        "freezeReason": "GitHub, Cursor, OpenAI, and Anthropic are rapidly absorbing repo-scale autonomous engineering. Re-underwrite against current platform capabilities before spending resources here.",
        "platformCaptureRisk": 8,
        "nearestPlatformFeature": "GitHub Copilot Workspace, Cursor background agents, Anthropic Claude Code, OpenAI Codex agents",
        "nearestFundedStartup": "Augment Code, Cognition/Devin, Poolside, CodeRabbit ($143M)",
        "competitionFreshnessDate": RESET_DATE,
    },
    "idea-010": {  # Autonomous Agent Operating System
        "freezeStatus": "frozen",
        "freezeReason": "Generic agent platform/OS category has hundreds of entrants plus native offerings from Microsoft, Google, OpenAI, and Anthropic. The broad thesis faces existential platform pressure.",
        "platformCaptureRisk": 9,
        "nearestPlatformFeature": "Microsoft Azure AI Agent Service, Google Vertex AI Agents, OpenAI Assistants API, Anthropic Claude Workbench",
        "nearestFundedStartup": "LangChain/LangGraph, CrewAI, AutoGen (Microsoft), numerous Microsoft Build 2026 startups",
        "competitionFreshnessDate": RESET_DATE,
    },
    "idea-005": {  # Prompt Registry & Evaluation Lab
        "freezeStatus": "frozen",
        "freezeReason": "Prompt/eval tooling is embedded inside model platforms, LangSmith, Braintrust, Weights & Biases, and observability vendors. The moat must be much stronger than prompt versioning + evals.",
        "platformCaptureRisk": 8,
        "nearestPlatformFeature": "OpenAI Eval API, Anthropic prompt sandbox, LangSmith, Google Cloud Vertex Eval",
        "nearestFundedStartup": "Braintrust, Weights & Biases, Arize AI, Fiddler AI",
        "competitionFreshnessDate": RESET_DATE,
    },
    "idea-004": {  # AI Model Ranking Observatory
        "freezeStatus": "frozen",
        "freezeReason": "Benchmark categories are proliferating. Frontier AI providers publish extensive evals; independent benchmark organisations exist; users can run open eval frameworks. A general model ranking site needs a much more proprietary data or distribution wedge.",
        "platformCaptureRisk": 7,
        "nearestPlatformFeature": "LMSYS Chatbot Arena, OpenAI Evals, Anthropic model cards, Hugging Face Open LLM Leaderboard",
        "nearestFundedStartup": "Vellum AI (evals), Scale AI HELM, HELM/Stanford",
        "competitionFreshnessDate": RESET_DATE,
    },
    "idea-007": {  # Verified Agent Skill Marketplace
        "freezeStatus": "frozen",
        "freezeReason": "Major ecosystems (OpenAI, Anthropic, Google, MCP ecosystem, Salesforce Agentforce) naturally want their own agent/plugin/skill directories. Without a strong answer to why the marketplace remains independent, the thesis is fragile.",
        "platformCaptureRisk": 8,
        "nearestPlatformFeature": "OpenAI GPT Store, Anthropic tool directory, Salesforce AppExchange agents, MCP server registry",
        "nearestFundedStartup": "Various MCP ecosystem builders, agent-tool platforms",
        "competitionFreshnessDate": RESET_DATE,
    },
    "idea-009": {  # AI Agent Budget & Credit Controller
        "freezeStatus": "frozen",
        "freezeReason": "Agent-payment and commerce infrastructure increasingly includes programmable controls, spending limits, authorisation, and machine transaction primitives from major payment providers and agent platforms. The durable moat cannot simply be 'agent has $100 budget'.",
        "platformCaptureRisk": 7,
        "nearestPlatformFeature": "Stripe agent payments, OpenAI Operator spending controls, Anthropic computer-use budget limits",
        "nearestFundedStartup": "Skyfire (agent payments), various agent commerce startups",
        "competitionFreshnessDate": RESET_DATE,
    },

    # ── ACTIVE — survives, but gets targeted fields ────────────────────────────
    "idea-001": {  # ProofRail
        "freezeStatus": "active",
        "platformCaptureRisk": 4,
        "independentVerifierAdvantage": 8,
        "lossDataFlywheel": 6,
        "physicalRealityDepth": 0,
        "riskTransferability": 5,
        "evidenceConfidence": 65,
        "marketProof": 0,
        "competitionFreshnessDate": RESET_DATE,
        "nearestFundedStartup": "CodeRabbit ($143M), Moderne (automated refactoring)",
        "nearestPlatformFeature": "GitHub CI/CD gates, Anthropic Claude Code acceptance tests",
        "killExperiment": "Take real agent-generated PRs, run ProofRail acceptance gate, measure whether it catches defects that normal CI + code review misses. Ask 10 teams: would you pay for independent acceptance rather than using built-in agent evals?",
    },
    "idea-017": {  # Semantic Multi-Agent Merge Coordinator
        "freezeStatus": "active",
        "platformCaptureRisk": 5,
        "independentVerifierAdvantage": 6,
        "lossDataFlywheel": 5,
        "physicalRealityDepth": 0,
        "riskTransferability": 2,
        "evidenceConfidence": 70,
        "marketProof": 0,
        "competitionFreshnessDate": RESET_DATE,
        "nearestFundedStartup": "CodeRabbit ($143M, $1.5B val), Entire (agent-native VCS), Augment Code",
        "nearestPlatformFeature": "GitHub Copilot multi-agent workflows, OpenAI Codex parallel agents",
        "strongestOSSSubstitute": "Git merge + custom CI linting; LLM-based PR review prompts",
        "killExperiment": "Run 5–10 agents in parallel on a large OSS repo with deliberately overlapping architectural changes. Measure textual conflicts vs semantic conflicts vs test failures vs rework. Introduce intent/contract reservation layer. If <30% improvement in semantic conflict detection rate -> KILL",
    },
    "idea-061": {  # FactBounty
        "freezeStatus": "active",
        "platformCaptureRisk": 4,
        "independentVerifierAdvantage": 9,
        "lossDataFlywheel": 7,
        "physicalRealityDepth": 3,
        "riskTransferability": 2,
        "evidenceConfidence": 45,
        "marketProof": 0,
        "researchSaturationWarning": True,
        "competitionFreshnessDate": RESET_DATE,
        "nearestFundedStartup": "Sourceful (product evidence), InfoSonics/NielsenIQ (retail data)",
        "nearestPlatformFeature": "Amazon Vine, Google Shopping verified reviews",
        "killExperiment": "Post 3 real buyer-funded bounties for product claims. If <2 bounties are funded by real buyers within 30 days -> KILL the buyer-funded model; pivot to subscription.",
    },
}

# ─── Two new staged candidates ────────────────────────────────────────────────
NEW_STAGED_CANDIDATES = [
    {
        "schemaVersion": "2.0.0",
        "id": "candidate-reset-xix-agent-risk-ledger",
        "legacyId": "agent-risk-ledger-underwriting-telemetry",
        "slug": "agent-risk-ledger-autonomous-agent-underwriting-telemetry",
        "name": "Agent Risk Ledger — Autonomous Agent Underwriting Telemetry",
        "oneSentenceConcept": "Trace-level telemetry infrastructure that gives insurance underwriters the data they need to price and monitor autonomous AI agent risk.",
        "elevatorPitch": "As AI agents gain authority to send money, modify production systems, and interact with customers, insurers face a new uncorrelated risk class with no actuarial history. Agent Risk Ledger captures structured per-episode telemetry — authority surface, tool exposure, financial delegation, policy violations, near-misses, and actual losses — and transforms it into insurer-grade exposure reports, risk scores, and cross-portfolio loss datasets. Think of it as telematics for autonomous AI: not 'which LLM do you use?' but 'what could the agent actually touch, and what did it do?'",
        "detailedDescription": (
            "## STAGED HYPOTHESIS — RESET XIX (2026-08-20)\n\n"
            "**Not canonicalized. Provisional thesis score: 90/100. Evidence confidence: 55/100. Market proof: 0.**\n\n"
            "### Problem\n"
            "AI-specific insurance already exists (Munich Re aiSure, Armilla AI) but the industry faces a specific data problem: how do you price autonomous agent risk without historical actuarial data? "
            "Current research (arXiv:2606.16465, arXiv:2607.11999, arXiv:2606.05449) explicitly converges on the need for trace-economic underwriting — evaluating risk at the level of the actual agent task and tool-use trace, not just 'company uses AI'.\n\n"
            "### Product: AgentRiskEpisode Telemetry\n"
            "For every economically meaningful agent episode, capture:\n"
            "- **Authority surface**: principal, model, permissions, financial delegation, counterparty access\n"
            "- **Tool exposure**: what systems could the agent touch\n"
            "- **Governance events**: guardrail fires, policy violations, human interventions\n"
            "- **Outcome**: actions taken, irreversible actions, near-misses, actual losses\n\n"
            "From this derive: Agent Risk Score, Exposure Report, Permission Map, Control Effectiveness, Near-Miss history, Portfolio concentration, Model/provider dependency concentration.\n\n"
            "### The Real Moat\n"
            "Cross-company agent loss experience. After several years: 'procurement agents with unlimited vendor selection above €50k autonomous authority show X loss distribution.' "
            "That is actuarially useful data most observability vendors do not own because they don't see the actual insurance claim.\n\n"
            "### AgentRiskEpisode Schema\n"
            "See `schemas/agent-risk-episode.schema.json` for the full data structure.\n\n"
            "### Nearest Corpus Matches (Dedupe Check)\n"
            "- `agent-loss-exchange-autonomous-agent-claims-data-utility` — close conceptual overlap; research to merge\n"
            "- `agentwarranty-warranty-infrastructure-autonomous-work` — downstream warranty layer; complementary\n"
            "- `agentratings-reliability-roi-ratings` — ratings product, not telemetry infrastructure\n\n"
            "### Kill Conditions\n"
            "1. Insurer internalization — Munich Re/Armilla build their own telemetry standards\n"
            "2. Observability absorption — Fiddler/Datadog absorb the insurer-facing layer\n"
            "3. Privacy refusal — enterprises refuse to share economically sensitive traces\n"
            "4. No claims — without real losses, telemetry -> price remains speculative\n"
            "5. Correlated model risk — one upstream foundation model failure wrecks underwriting assumptions"
        ),
        "category": "AI × Insurance × Telemetry",
        "subcategory": "Risk Infrastructure",
        "tags": ["agent", "insurance", "underwriting", "telemetry", "risk", "AI-safety", "financial-infrastructure"],
        "status": "watch",
        "provenance": {
            "researchRound": "RESET XIX — Adversarial Cross-Sector Zero-Baseline",
            "researchDate": "2026-08-20",
            "sources": [
                "arXiv:2606.16465 (trace-economic underwriting)",
                "arXiv:2607.11999 (agent insurance stack blueprint)",
                "arXiv:2606.05449 (autonomy, delegated authority, permissions as exposure variables)",
                "Munich Re aiSure product (incumbent)",
                "Armilla AI (adjacent)",
                "Fiddler AI insurance vertical (adjacent observability)",
                "Financial Times — July 2026 (hidden AI exposure in conventional policies)"
            ]
        },
        "atAGlance": {
            "problemSolved": "Insurers cannot price autonomous AI agent risk without trace-level data on authority, tool exposure, policy violations, and actual losses.",
            "targetCustomer": "Specialty insurers, MGAs, reinsurers, AI vendors bundling warranties, enterprises negotiating agent coverage",
            "businessModel": "API subscription for risk scoring; data licensing to insurers; portfolio analytics",
            "overallScore": 90
        },
        "scores": {
            "problemSeverity": {"value": 9, "justification": "Insurers explicitly identified as missing data class by multiple 2026 research papers", "confidence": "medium", "basis": "arXiv research + industry commentary"},
            "willingnessToPay": {"value": 7, "justification": "Specialty insurers and MGAs pay for actuarial data; unconfirmed for agent-specific telemetry", "confidence": "low", "basis": "Analyst interpretation — requires buyer interviews"},
            "marketDemand": {"value": 7, "justification": "AI deployment growing rapidly, insurance market nascent but waking up", "confidence": "medium", "basis": "Multiple 2026 research papers and FT reporting"},
        },
        "compositeScores": {
            "overallOpportunity": 90
        },
        "validationChecklist": {
            "whyNow": "AI agents are gaining autonomous financial authority faster than insurers can accumulate conventional loss history",
            "exactBuyer": "Technology underwriters at specialty cyber/E&O insurers, AI-native MGAs (Armilla), reinsurance innovation desks (Munich Re), AI SaaS vendors bundling performance warranties",
            "actualPain": "arXiv:2607.11999 explicitly argues incident data collection is one of the missing pieces needed to build a functioning insurance stack for AI agents",
            "frequency": "Recurring — every deployed agent episode generates a record; insurers need continuous monitoring not one-time audit",
            "economicConsequence": "Without data, insurers either decline coverage (blocking enterprise AI adoption) or under-price correlated systemic risk",
            "incumbent": "Munich Re aiSure (performance coverage), Armilla (AI warranty/insurance), Fiddler (observability for insurers)",
            "platformThreat": "Medium — major AI platforms could add risk export APIs, but cross-company actuarial dataset requires independent positioning",
            "openSourceSubstitute": "OpenTelemetry captures traces but not authority/financial-risk semantics; no OSS agent risk schema exists",
            "humanSubstitute": "Insurance brokers use questionnaires — insufficient for dynamic autonomous systems",
            "distribution": "Direct to specialty insurers and MGAs; API integration with enterprise agent platforms",
            "sevenDayFalsification": "10 insurer/broker/MGA conversations; present AgentRiskEpisode schema; ask if it materially changes coverage decisions",
            "compoundingAsset": "Cross-company agent loss experience dataset — grows more valuable with each insured episode",
        },
        "killCriteria": "If <3 of 10 cyber/MGA brokers confirm that trace-level agent telemetry would materially change coverage decisions or pricing -> KILL and redirect effort",
        "evidenceStatus": "hypothesis",
        "promotionEligible": False,
        "requiresExternalEvidence": True,
        "createdAt": f"{RESET_DATE}T00:00:00Z",
        "updatedAt": f"{RESET_DATE}T00:00:00Z",
        "legacyCandidateId": None,
        "candidateId": "candidate-reset-xix-agent-risk-ledger",
        # Reset XIX specific fields
        "thesisScore": 90,
        "evidenceConfidence": 55,
        "marketProof": 0,
        "freezeStatus": "watch",
        "platformCaptureRisk": 4,
        "independentVerifierAdvantage": 8,
        "lossDataFlywheel": 9,
        "physicalRealityDepth": 2,
        "riskTransferability": 9,
        "competitionFreshnessDate": RESET_DATE,
        "nearestFundedStartup": "Armilla AI (AI warranty/insurance), Munich Re aiSure (AI performance coverage), Fiddler AI (observability for insurers)",
        "nearestPlatformFeature": "Fiddler AI observability insurance vertical, DataRobot MLOps monitoring, WhyLabs model monitoring",
        "strongestOSSSubstitute": "OpenTelemetry (traces without financial-risk semantics), Langfuse (LLM observability without insurance layer)",
        "killExperiment": "Interview 10 cyber/technology insurance brokers or MGA underwriters. Present AgentRiskEpisode schema. Ask: would this telemetry materially change whether you insure the system, the limit you offer, or the premium? If <3/10 say yes -> KILL immediately.",
        "researchSaturationWarning": False,
        "nearestCorpusMatches": [
            {"slug": "agent-loss-exchange-autonomous-agent-claims-data-utility", "relationship": "close-overlap", "action": "merge-research"},
            {"slug": "agentwarranty-warranty-infrastructure-autonomous-work", "relationship": "complementary", "action": "track-separately"},
            {"slug": "agentratings-reliability-roi-ratings", "relationship": "different-product", "action": "track-separately"},
        ],
    },
    {
        "schemaVersion": "2.0.0",
        "id": "candidate-reset-xix-robot-skill-acceptance",
        "legacyId": "robot-skill-acceptance-lab-embodiment-compatibility",
        "slug": "robot-skill-acceptance-lab-embodiment-compatibility-cloud",
        "name": "Robot Skill Acceptance Lab — Embodiment Compatibility Cloud",
        "oneSentenceConcept": "Independent physical acceptance testing infrastructure that proves whether a robot skill or VLA model actually works on a buyer's specific hardware configuration.",
        "elevatorPitch": "Robot intelligence is improving rapidly and becoming economically significant, but cross-embodiment deployment remains genuinely hard. A skill that works in simulation may fail on a specific gripper, camera, or controller combination. The Robot Skill Acceptance Lab runs physical acceptance suites — 100–500 repeated trials on real hardware configurations — and produces a verifiable Embodiment Compatibility Certificate. Think UL + BrowserStack + benchmark network for physical AI.",
        "detailedDescription": (
            "## STAGED HYPOTHESIS — RESET XIX (2026-08-20)\n\n"
            "**Not canonicalized. Provisional thesis score: 89/100. Evidence confidence: 50/100. Market proof: 0.**\n\n"
            "### Problem\n"
            "The robot intelligence layer is getting dramatically better: Skild AI exceeded $14B valuation and is deploying with Foxconn, ABB, and Universal Robots. "
            "But cross-embodiment portability remains visibly unresolved (arXiv:2605.11564, arXiv:2608.01851, arXiv:2608.13049). "
            "ABB and Nvidia explicitly acknowledge that lighting, texture, and vibration differences between simulation and reality cause real robots to behave differently.\n\n"
            "### The Gap\n"
            "When a factory wants 'depalletize irregular cardboard boxes', the skill vendor says 'supported' — but the customer's stack is UR20 + Robotiq 2F-85 + RealSense + Jetson + mixed lighting. "
            "Does it actually work? Nobody currently provides independent verification.\n\n"
            "### Product: EmbodimentCompatibility Certificate\n"
            "Run physical acceptance suites against specific embodiment configurations. Report:\n"
            "- Completion rate / unassisted recovery / human intervention rate\n"
            "- Cycle time distribution (median, p95) vs required SLO\n"
            "- Per-scenario results (dark carton FAIL, reflective tape FAIL, 14kg payload PASS)\n"
            "- Safety envelope pass/fail\n"
            "- Production acceptance verdict: ACCEPTED / CONDITIONAL / REJECTED\n\n"
            "### Data Flywheel (the real moat)\n"
            "After 10,000 acceptance runs: which models work on which arms; which cameras create problems; "
            "which grippers degrade success; which simulator scores predict reality; which do not. "
            "model × skill × embodiment × environment -> actual performance.\n\n"
            "### Schema Files\n"
            "- `schemas/embodiment-descriptor.schema.json` — hardware configuration\n"
            "- `schemas/skill-acceptance-run.schema.json` — test results record\n\n"
            "### Nearest Corpus Matches (Dedupe Check)\n"
            "- `robotchangecontrol-cell-safety-change-graph` — change management, not acceptance testing; complementary\n"
            "- `physical-ai-dataset-quality-exchange` — dataset QA, not cross-embodiment skill benchmarking; related\n"
            "- `robotwork-neutral-meter` — RaaS uptime metering, not skill acceptance; different\n\n"
            "### Kill Conditions\n"
            "1. Hardware labs cost money — capital intensive to scale\n"
            "2. Real robot testing is slow — throughput bottleneck\n"
            "3. OEM proprietary certification — ABB/Fanuc/UR could create captive cert programs\n"
            "4. TÜV and similar already own some safety trust in industrial robots\n"
            "5. Virtual commissioning improving rapidly — ABB/Nvidia close the sim-to-real gap\n"
            "6. Cross-embodiment transfer research may eventually solve the problem"
        ),
        "category": "Robotics × Physical AI × Testing",
        "subcategory": "Acceptance Infrastructure",
        "tags": ["robotics", "physical-AI", "acceptance-testing", "embodiment", "VLA", "certification", "sim-to-real", "manufacturing"],
        "status": "watch",
        "provenance": {
            "researchRound": "RESET XIX — Adversarial Cross-Sector Zero-Baseline",
            "researchDate": "2026-08-20",
            "sources": [
                "arXiv:2605.11564 (RIO — cross-embodiment overhead)",
                "arXiv:2608.01851 (robot skill marketplace survey — unresolved: adaptation, portability, safety, composition)",
                "arXiv:2608.13049 (cross-embodiment transfer benchmarks)",
                "Reuters — Skild AI/Nvidia/ABB deployment (March 2026)",
                "Reuters — ABB/Nvidia simulation realism partnership (March 2026)"
            ]
        },
        "atAGlance": {
            "problemSolved": "Robot buyers cannot verify that a purchased AI skill will actually work on their specific hardware configuration before deployment.",
            "targetCustomer": "Industrial automation buyers, manufacturing system integrators, robotics vendors seeking independent certification, insurers of robot deployments",
            "businessModel": "Per-acceptance-run fees (€500–€10,000); ongoing monitoring subscriptions; data licensing to robot OEMs and insurers",
            "overallScore": 89
        },
        "scores": {
            "problemSeverity": {"value": 8, "justification": "Multiple 2026 papers confirm cross-embodiment transfer is a major unresolved problem; ABB/Nvidia collaboration confirms industry acknowledges it", "confidence": "medium", "basis": "arXiv research + Reuters reporting"},
            "willingnessToPay": {"value": 7, "justification": "Industrial automation buyers pay significant sums for integration certainty; per-run pricing unvalidated", "confidence": "low", "basis": "Analyst interpretation — requires buyer interviews"},
            "marketDemand": {"value": 8, "justification": "Robotics market accelerating rapidly; skill transfer problem growing with adoption", "confidence": "medium", "basis": "Skild/ABB/Nvidia news + research"},
        },
        "compositeScores": {
            "overallOpportunity": 89
        },
        "validationChecklist": {
            "whyNow": "Robot intelligence is becoming commercially deployable at scale while cross-embodiment portability remains visibly unresolved — a widening gap between what vendors promise and what buyers experience",
            "exactBuyer": "Manufacturing system integrators (pay for integration certainty), industrial automation managers at large manufacturers, robotics-as-a-service operators, skill/VLA vendors wanting independent certification",
            "actualPain": "arXiv:2608.01851 lists adaptation, portability, safety verification, and composition as unresolved issues in commercial robot skill marketplaces",
            "frequency": "Every new skill deployment creates an acceptance need; every firmware/hardware update potentially invalidates prior acceptance",
            "economicConsequence": "Failed robot deployment can cost €50k–€500k in integration rework, lost production time, and safety incidents",
            "incumbent": "No independent acceptance lab exists; TÜV/UL own safety certification but not skill-level performance acceptance",
            "platformThreat": "Medium-low — ABB/Nvidia improving virtual commissioning, but independent acceptance has inherent credibility advantage",
            "openSourceSubstitute": "RIO (arXiv:2605.11564) — cross-hardware abstraction open-source, but no acceptance/benchmark layer",
            "humanSubstitute": "Manual integration testing by system integrators — expensive, non-standardised, not transferable between buyers",
            "distribution": "Direct to system integrators; API/portal for skill vendors; data licensing to insurers and OEMs",
            "sevenDayFalsification": "Run 100+ physical trials on 2 cheap cobot configs, 1 task, 3 public VLA implementations. Publish Embodiment Compatibility Matrix. Ask 10 integrators: would you pay €500–€10,000 for this result before integrating?",
            "compoundingAsset": "model × skill × embodiment × environment -> actual performance database. After 10,000 runs: which models work where, which simulators predict reality.",
        },
        "killCriteria": "Run physical pilot on 2 embodiment configs. If <2 of 10 integrators confirm they would pay ≥€500 for independent acceptance result before production deployment -> KILL",
        "evidenceStatus": "hypothesis",
        "promotionEligible": False,
        "requiresExternalEvidence": True,
        "createdAt": f"{RESET_DATE}T00:00:00Z",
        "updatedAt": f"{RESET_DATE}T00:00:00Z",
        "legacyCandidateId": None,
        "candidateId": "candidate-reset-xix-robot-skill-acceptance",
        # Reset XIX specific fields
        "thesisScore": 89,
        "evidenceConfidence": 50,
        "marketProof": 0,
        "freezeStatus": "watch",
        "platformCaptureRisk": 3,
        "independentVerifierAdvantage": 9,
        "lossDataFlywheel": 8,
        "physicalRealityDepth": 10,
        "riskTransferability": 7,
        "competitionFreshnessDate": RESET_DATE,
        "nearestFundedStartup": "Skild AI ($14B+ — robot foundation models; NOT acceptance lab), Machina Labs, Apptronik, Physical Intelligence",
        "nearestPlatformFeature": "ABB/Nvidia virtual commissioning, RIO open-source cross-hardware abstraction, NVIDIA Isaac Sim",
        "strongestOSSSubstitute": "RIO (cross-embodiment open-source framework) — solves code reuse but not acceptance/benchmarking",
        "killExperiment": "Acquire/access 2 cheap cobot configurations. Run 100–500 repeated physical trials each for 1 task × 3 public VLA implementations. Publish Embodiment Compatibility Matrix. Ask 10 integrators: would you pay €500–€10,000 for this? If <2/10 say yes -> KILL",
        "researchSaturationWarning": False,
        "nearestCorpusMatches": [
            {"slug": "robotchangecontrol-cell-safety-change-graph", "relationship": "complementary", "action": "track-separately"},
            {"slug": "physical-ai-dataset-quality-exchange", "relationship": "related", "action": "track-separately"},
            {"slug": "robotwork-neutral-meter", "relationship": "different-product", "action": "track-separately"},
        ],
    }
]


def transform_ideas(ideas):
    """Apply null-fill and targeted overrides to all canonical ideas."""
    for idea in ideas:
        idea_id = idea.get("id", "")
        # 1. Apply null defaults to every idea
        for field, default_val in NULL_DEFAULTS.items():
            if field not in idea:
                idea[field] = default_val
        # 2. Apply targeted overrides
        if idea_id in TARGETED_OVERRIDES:
            overrides = TARGETED_OVERRIDES[idea_id]
            for field, val in overrides.items():
                idea[field] = val
    return ideas


def main():
    print("RESET XIX — Data Transformation Script")
    print("=" * 50)

    # ── Load ideas.json ──────────────────────────────────────────────────────
    print(f"\n[1/4] Loading {IDEAS_PATH}")
    with open(IDEAS_PATH, encoding="utf-8") as f:
        ideas_data = json.load(f)

    original_count = len(ideas_data["ideas"])
    print(f"     Loaded {original_count} canonical ideas (schema v{ideas_data['schemaVersion']})")

    # ── Transform ─────────────────────────────────────────────────────────────
    print("\n[2/4] Applying null-fill and targeted overrides...")
    ideas_data["ideas"] = transform_ideas(ideas_data["ideas"])

    # Count applied overrides
    frozen_count = sum(1 for i in ideas_data["ideas"] if i.get("freezeStatus") == "frozen")
    saturation_count = sum(1 for i in ideas_data["ideas"] if i.get("researchSaturationWarning"))
    print(f"     Ideas with freezeStatus='frozen': {frozen_count}")
    print(f"     Ideas with researchSaturationWarning=True: {saturation_count}")

    # ── Bump schema version ──────────────────────────────────────────────────
    old_version = ideas_data["schemaVersion"]
    ideas_data["schemaVersion"] = "2.1.0"
    print(f"\n[3/4] Schema version bumped: {old_version} -> 2.1.0")

    # ── Write ideas.json ──────────────────────────────────────────────────────
    final_count = len(ideas_data["ideas"])
    assert final_count == original_count, f"Count mismatch! {original_count} -> {final_count}"
    with open(IDEAS_PATH, "w", encoding="utf-8") as f:
        json.dump(ideas_data, f, ensure_ascii=False, indent=2)
    print(f"     Written {final_count} ideas to {IDEAS_PATH}")

    # ── Load and update staging queue ─────────────────────────────────────────
    print(f"\n[4/4] Updating {STAGING_PATH}")
    with open(STAGING_PATH, encoding="utf-8") as f:
        staging = json.load(f)

    original_staging = len(staging)

    # Check for existing IDs to avoid duplicates
    existing_ids = {c.get("id") for c in staging}
    added = 0
    for candidate in NEW_STAGED_CANDIDATES:
        if candidate["id"] in existing_ids:
            print(f"     SKIP (already exists): {candidate['id']}")
        else:
            staging.append(candidate)
            added += 1
            print(f"     ADDED: {candidate['id']}")

    with open(STAGING_PATH, "w", encoding="utf-8") as f:
        json.dump(staging, f, ensure_ascii=False, indent=2)

    print(f"     Staging queue: {original_staging} -> {len(staging)} (+{added} new)")

    print("\n" + "=" * 50)
    print("RESET XIX transformation complete.")
    print(f"  Canonical ideas: {final_count} (unchanged)")
    print(f"  Frozen ideas:    {frozen_count}")
    print(f"  Saturation warnings: {saturation_count}")
    print(f"  New staged candidates: {added}")
    print(f"  Schema version: 2.1.0")
    print("\nNext: run npm run validate:data to confirm schema compliance.")


if __name__ == "__main__":
    main()
