"""
VenturaAtlas OS — Specialized Subagent Roster Installer
========================================================
Creates 12 specialized subagent role definitions (A1 - A12) in .agents/agents/.
"""

import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AGENTS_DIR = os.path.join(ROOT, ".agents", "agents")

SUBAGENTS = {
    "repo-cartographer.md": """---
name: repo-cartographer
description: "A1 — Read-only repository cartographer & architecture mapper"
---

# A1 — Repository Cartographer

- **Primary Mode**: Read-Only Architecture Inspection.
- **Responsibilities**: Map codebase dependencies, active/historical scripts, orphan detection, build/deploy paths.
- **Output**: `research/audits/<run-id>/repo-map.md`.
""",
    "truth-data-integrity-engineer.md": """---
name: truth-data-integrity-engineer
description: "A2 — Truth computation, schema integrity, and metadata engineer"
---

# A2 — Truth & Data Integrity Engineer

- **Ownership**: `scripts/lib/repository-truth.js`, `data/repository-meta.json`, `data/build-manifest.json`, `scripts/validate-data.js`.
- **Responsibilities**: Compute deterministic counts, SHA256 per-file digests, and schema validation gates.
""",
    "staging-canonical-lifecycle-engineer.md": """---
name: staging-canonical-lifecycle-engineer
description: "A3 — Staging queue lifecycle & canonical publisher engineer"
---

# A3 — Staging / Canonical Lifecycle Engineer

- **Ownership**: `scripts/autonomous-idea-generator.py`, `scripts/review-staged-ideas.py`, `scripts/va_runtime/publisher.py`, `data/idea-staging-queue.json`.
- **Responsibilities**: Enforce promotion review gates (`promotionReview`), sequential ID allocation, and transactional publishing.
""",
    "orchestrator-provider-engineer.md": """---
name: orchestrator-provider-engineer
description: "A4 — Multi-provider scheduler, circuit breaker, and orchestrator engineer"
---

# A4 — Orchestrator / Provider Engineer

- **Ownership**: `scripts/va_orchestrator.py`, `scripts/va-massive-orchestrator.py`, `scripts/va_runtime/provider_router.py`.
- **Responsibilities**: Manage provider health, circuit breakers, typed exceptions (`NoEligibleProviderError`), and bounded CLI operations.
""",
    "evidence-research-director.md": """---
name: evidence-research-director
description: "A5 — Sourced evidence director, claim-level graph, and source taxonomy"
---

# A5 — Evidence Research Director

- **Ownership**: `data/sources.json`, `scripts/check-links.js`, evidence claims graph.
- **Responsibilities**: Classify source quality taxonomy, verify external facts, and enforce claim-level support.
""",
    "ranking-decision-science-engineer.md": """---
name: ranking-decision-science-engineer
description: "A6 — Multi-dimensional ranking, sensitivity analysis, and decision science"
---

# A6 — Ranking / Decision Science Engineer

- **Ownership**: `scripts/va-ranker.py`, `data/rankings.json`.
- **Responsibilities**: Compute 4-dimensional scores (Attractiveness, Evidence Confidence, Execution Difficulty, Founder Fit), handle missing data explicitly, and calculate rank volatility.
""",
    "website-product-ux-engineer.md": """---
name: website-product-ux-engineer
description: "A7 — Website layout, decision UX, progressive disclosure, and templates"
---

# A7 — Website / Product UX Engineer

- **Ownership**: `index.html`, `docs/`, `assets/css/`, `assets/js/`.
- **Responsibilities**: Optimize founder decision quality per unit time, progressive disclosure cards, and dynamic UI stats.
""",
    "performance-pwa-engineer.md": """---
name: performance-pwa-engineer
description: "A8 — Service worker, offline PWA, search index, and assets engineer"
---

# A8 — Performance / PWA Engineer

- **Ownership**: `sw.js`, `manifest.webmanifest`, `data/search-index.json`, `scripts/build-search-index.js`.
- **Responsibilities**: Optimize offline PWA caching, compact search indexing, and web vitals performance.
""",
    "ci-security-engineer.md": """---
name: ci-security-engineer
description: "A9 — GitHub Actions CI/CD, supply chain security, and secret scanner"
---

# A9 — CI / Supply-Chain / Security Engineer

- **Ownership**: `.github/workflows/`, `scripts/check_privacy.py`, `scripts/check-public-artifact.js`.
- **Responsibilities**: Secure CI workflows (Node 22), secret scanning, public artifact security gates.
""",
    "factbounty-engineer.md": """---
name: factbounty-engineer
description: "A10 — FactBounty verification application & TypeScript component engineer"
---

# A10 — FactBounty Engineer

- **Ownership**: `apps/factbounty/`.
- **Responsibilities**: FactBounty application features, state management, and component architecture.
""",
    "adversarial-red-team.md": """---
name: adversarial-red-team
description: "A11 — Adversarial QA, fault injection, and safety-drift red team"
---

# A11 — Adversarial Red Team

- **Primary Mode**: Adversarial Testing (Read-only implementation reviewer).
- **Responsibilities**: Subject implementation to HTTP 500 storms, race conditions, secret leaks, and data drift. Find subtle flaws.
""",
    "integration-judge.md": """---
name: integration-judge
description: "A12 — Integration owner, diff reconciler, and final quality gate"
---

# A12 — Integration Judge

- **Ownership**: Final reconciliation & merge decisions.
- **Responsibilities**: Inspect diffs, evaluate evidence, rerun quality test suite, ensure zero semantic conflicts.
"""
}

def create_subagents():
    os.makedirs(AGENTS_DIR, exist_ok=True)
    print("=== Creating 12 Specialized Subagent Roster Definitions ===")
    for fname, content in SUBAGENTS.items():
        fpath = os.path.join(AGENTS_DIR, fname)
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"[OK] Created subagent: .agents/agents/{fname}")

if __name__ == "__main__":
    create_subagents()
