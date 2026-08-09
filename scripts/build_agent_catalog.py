import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
agents_md = os.path.join(ROOT, ".agents", "AGENTS.md")
agents_dir = os.path.join(ROOT, ".agents", "agents")

os.makedirs(agents_dir, exist_ok=True)

# Define core 15 specialist agents matching AGENTS.md
ROSTER = [
    ("repository-forensics-agent", "Read-only inspection of repository architecture, dependency graphs, generated vs canonical data boundaries, and drift detection.", "docs/REPO_AUDIT_*.md"),
    ("data-integrity-agent", "Schema enforcement, ID allocation, dataset completeness, metadata generation, and referential integrity.", "data/ideas.json, data/ideas.schema.json, data/repository-meta.json"),
    ("research-intelligence-agent", "Market evidence discovery, competitor mapping, trend analysis, regulatory tracking, and research gap identification.", "research/, ideas/, data/idea-staging-queue.json"),
    ("evidence-provenance-agent", "Claim-to-source mapping, citation integrity, source quality scoring, verification timestamps, and disconfirming evidence tracking.", "schemas/provenance.schema.json, data/sources.json"),
    ("opportunity-economics-agent", "Financial model templates, gross margin calculations, CAC/LTV assumptions, startup cost caps, and sensitivity modeling.", "financial-models/, docs/calculator.html"),
    ("ranking-and-fit-agent", "Multi-lens opportunity ranking, Founder Constraint & Fit Engine, and ranking sensitivity analysis.", "rankings/, data/rankings.json, scripts/va-ranker.py, docs/matcher.html"),
    ("product-ux-architect", "Information architecture, progressive disclosure, navigation, visual design system tokens, and mobile UX.", "index.html, docs/, assets/css/"),
    ("frontend-platform-agent", "Dependency-light static application development, PWA service worker, accessible interaction, and local state persistence.", "assets/js/, sw.js, manifest.webmanifest"),
    ("search-discovery-agent", "Client-side search index generation, Ctrl+K command palette, faceted query filtering, and related opportunity graph matching.", "data/search-index.json, scripts/build-search-index.js"),
    ("autonomous-orchestration-agent", "Task graph scheduling, bounded execution CLI control, and worktree lifecycle management.", "data/agent-task-graph.json, scripts/va_runtime/orchestration/"),
    ("provider-router-agent", "Multi-provider registry, capability-aware model scheduling, key pool rotation, and circuit breaker health management.", "config/providers.json, scripts/va_orchestrator.py"),
    ("security-privacy-agent", "Secret isolation verification, prompt injection boundaries, public vs private data separation, and GDPR/privacy checks.", "THREAT_MODEL.md, scripts/check-public-artifact.js, scripts/check_privacy.py"),
    ("test-quality-agent", "Unit testing, PWA contract testing, accessibility audits, race condition verification, and E2E user journeys.", "tests/, TEST_PLAN.md"),
    ("red-team-critic-agent", "Adversarial review of research claims, 'Why this might fail' analysis, assumption testing, overengineering detection, and fragile ranking audits.", "scripts/va_runtime/adversarial_pass.py"),
    ("integration-release-agent", "Final serial gatekeeper. Executes quality checks across worktree diffs, verifies build integrity, and merges validated branches.", "package.json, _site/, walkthrough.md, PROJECT_STATUS.md, README.md")
]

for name, desc, owned_paths in ROSTER:
    content = f"""# Agent Manifest: `{name}`

## Mission & Scope
{desc}

## Owned File Paths
`{owned_paths}`

## Verification Contract
Requires clean pass on `npm run check-consistency` and `npm run test:unit`.
"""
    fpath = os.path.join(agents_dir, f"{name}.md")
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"[OK] Generated {len(ROSTER)} specialist agent manifests in .agents/agents/ matching .agents/AGENTS.md.")
