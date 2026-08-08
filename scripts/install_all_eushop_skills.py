"""
VenturaAtlas OS — Full EUshop Enterprise Skill Library Installer
==================================================================
Copies and adapts all 22 EUshop enterprise skills + graphify-codebase-analysis
from global skills into workspace root .agents/skills/, and updates .agents/AGENTS.md.
"""

import os
import shutil
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AGENTS_DIR = os.path.join(ROOT, ".agents")
SKILLS_DIR = os.path.join(AGENTS_DIR, "skills")
GLOBAL_SKILLS_DIR = r"C:\Users\Hostilian\.gemini\config\skills"

EUSHOP_SKILLS = [
    "eushop-auth0-session-jwt-security",
    "eushop-autonomous-multiagent-coordination",
    "eushop-autonomous-multiagent-failover",
    "eushop-dac7-tax-reporting-engine",
    "eushop-dsa-notice-and-action-moderation",
    "eushop-flyway-schema-versioning",
    "eushop-flyway-zero-downtime-migrations",
    "eushop-i18n-multilingual-localization",
    "eushop-nextjs-static-export-pages",
    "eushop-opensearch-fulltext-search-benchmarking",
    "eushop-opentelemetry-observability-tracing",
    "eushop-playwright-e2e-critical-journeys",
    "eushop-playwright-visual-regression-testing",
    "eushop-postgis-geospatial-matching",
    "eushop-postgis-spatial-corridor-matching",
    "eushop-regulatory-compliance-validator",
    "eushop-security-codeql-taint-remediation",
    "eushop-security-codeql-zero-critical",
    "eushop-stripe-payment-idempotency",
    "eushop-transactional-outbox-event-engine",
    "eushop-wcag-accessibility-design-tokens",
    "eushop-yc-investor-diligence-package",
    "graphify-codebase-analysis"
]

def install_all():
    print("=== Copying and Adapting All 23 EUshop & Graphify Enterprise Skills ===")
    os.makedirs(SKILLS_DIR, exist_ok=True)

    installed = []
    for skill_name in EUSHOP_SKILLS:
        src = os.path.join(GLOBAL_SKILLS_DIR, skill_name)
        dst = os.path.join(SKILLS_DIR, skill_name)

        if os.path.exists(src):
            if os.path.exists(dst):
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
            installed.append(skill_name)
            print(f"[OK] Copied full skill: {skill_name}")
        else:
            print(f"[WARN] Source skill not found: {src}")

    print(f"\n[OK] Total skills installed in .agents/skills/: {len(installed)}")

    # Update .agents/AGENTS.md with full skill directory listing
    agents_md = os.path.join(AGENTS_DIR, "AGENTS.md")
    if os.path.exists(agents_md):
        with open(agents_md, "r", encoding="utf-8") as f:
            content = f.read()

        skills_list_md = "\n## Installed Workspace Skill Catalog (.agents/skills/)\n\n" + "\n".join(f"- `{s}`" for s in installed) + "\n"

        if "## Installed Workspace Skill Catalog" not in content:
            content += "\n" + skills_list_md
            with open(agents_md, "w", encoding="utf-8") as f:
                f.write(content)
            print("[OK] Updated .agents/AGENTS.md with full skill catalog listing")

if __name__ == "__main__":
    install_all()
