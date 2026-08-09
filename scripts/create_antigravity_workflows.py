import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
wf_dir = os.path.join(ROOT, ".agents", "workflows")

os.makedirs(wf_dir, exist_ok=True)

workflows = {
    "va-baseline.md": """# Workflow: `/va-baseline`

## Purpose
Capture baseline repository commit, uncommitted diffs, environment versions, and data integrity hashes before starting work.

## Execution Steps
1. Execute `git rev-parse HEAD` and `git status --porcelain`.
2. Inspect environment versions (`node --version`, `python --version`).
3. Run `node scripts/build-repository-meta.js --check` to verify baseline truth.
""",

    "va-truth-audit.md": """# Workflow: `/va-truth-audit`

## Purpose
Audit repository statistics, counts, schema compliance, public vs internal source separation, and ranking alignment.

## Execution Steps
1. Run `python scripts/audit_omega5_baseline.py`.
2. Execute `node scripts/deep-frontend-audit.js`.
3. Check `python scripts/validate-schema.py`.
""",

    "va-research-run.md": """# Workflow: `/va-research-run`

## Purpose
Prospective deep research workflow for frontier opportunity discovery with disconfirmation pass.

## Execution Steps
1. Define research question and query plan.
2. Execute search and collect candidate primary sources.
3. Conduct explicit disconfirmation search ("Why this might fail").
4. Log research run via `python scripts/record_research_run.py`.
""",

    "va-promote.md": """# Workflow: `/va-promote`

## Purpose
Promote a staged candidate from `data/idea-staging-queue.json` to canonical `data/ideas.json`.

## Execution Steps
1. Verify candidate has `evidenceStatus: "verified"` and attached external primary sources (`sXX`).
2. Run `python scripts/review-staged-ideas.py`.
3. Re-run `python scripts/va-ranker.py --update` and `node scripts/build-repository-meta.js`.
""",

    "va-cloud-verify.md": """# Workflow: `/va-cloud-verify`

## Purpose
Verify Cloud Control Plane contracts, Cloud Run worker endpoints, fail-closed auth, and Secret Manager access.

## Execution Steps
1. Check `cloud-control-plane/app.py` and `services/ventureatlas-worker/app.py`.
2. Test unauthenticated POST request to verify 401 Unauthorized response.
3. Test authenticated GET `/health` endpoint to verify readiness.
""",

    "va-release-verify.md": """# Workflow: `/va-release-verify`

## Purpose
Full pre-release verification suite for Venture Atlas OS static build and PWA contracts.

## Execution Steps
1. Run `npm run quality`.
2. Verify static build output in `_site/` (HTML files, search index, RSS feed, sitemap).
3. Execute `node scripts/check-public-artifact.js` for security redaction.
""",

    "va-red-team.md": """# Workflow: `/va-red-team`

## Purpose
Adversarial red-team pass inspecting claim support, overengineering, fragile ranking assumptions, and placebo features.

## Execution Steps
1. Run read-only audit across `data/ideas.json` and `ideas/*.md`.
2. Audit score dimension coverage and flag unevidenced assumptions.
3. Output red-team report in `research/audits/`.
"""
}

for filename, content in workflows.items():
    wpath = os.path.join(wf_dir, filename)
    with open(wpath, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"[OK] Created {len(workflows)} native Antigravity reusable workflows in .agents/workflows/.")
