"""
VenturaAtlas OS — Workspace Agent Rules Installer
=================================================
Creates focused, high-precision agent rules in .agents/rules/ following Antigravity 2.0 architecture standards.
"""

import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RULES_DIR = os.path.join(ROOT, ".agents", "rules")

RULES = {
    "00-venture-atlas-constitution.md": """---
trigger: always_on
description: Mandatory core constitution rules for all AI agents in VenturaAtlas OS
---

# VenturaAtlas OS — Constitution Rule

1. **Preserve Ground Truth**: Never manufacture fake data, false timestamps, or unverified claims.
2. **Deterministic Computation**: Always calculate statistics, metrics, and revisions with code.
3. **Single Source of Truth**: `data/ideas.json`, `data/sources.json`, `data/categories.json`, and `data/repository-meta.json` are the authoritative data inputs.
4. **No Destructive Overwrites**: Never perform destructive bulk edits on canonical data without explicit review and verification.
""",
    "10-data-integrity.md": """---
trigger: glob
globs:
  - "data/**/*.json"
  - "schemas/**/*.json"
description: Data integrity and schema validation rules for VenturaAtlas OS JSON data structures
---

# Data Integrity & Schema Rules

1. **ID Allocation**: Canonical IDs must follow `idea-XXX` zero-padded format and be allocated strictly sequentially via `allocate_next_canonical_id()`.
2. **Schema Gate**: All canonical idea objects must validate 100% against `schemas/idea.schema.json`.
3. **Source Reference Resolution**: Every entry in `sourceReferences` must resolve to a valid ID in `data/sources.json` or documented legacy namespace.
4. **Validation Summaries**: `data/validation-summary.json` must be written directly from `scripts/validate-data.js` findings.
""",
    "20-research-evidence.md": """---
trigger: model_decision
description: Rules for evidence classification, source quality, and claims research
---

# Research & Evidence Rules

1. **Distinguish 4 Truth Classes**:
   - Class A: Deterministic Repository Fact (code computed)
   - Class B: Externally Verified Fact (sourced evidence)
   - Class C: Reasoned Inference (labeled analysis)
   - Class D: Hypothesis / Unknown (explicitly marked unknown)
2. **No Model Enthusiasm as Evidence**: Unverified LLM outputs must be stored as `evidenceStatus: "unverified"` and `promotionEligible: false`.
3. **Source Quality Taxonomy**: Classify sources by official regulators, statutes, official pricing, company filings, academic papers, direct customer evidence, or community posts.
""",
    "30-generated-files.md": """---
trigger: glob
globs:
  - "_site/**"
  - "data/repository-meta.json"
  - "data/search-index.json"
  - "data/build-manifest.json"
description: Rules for generated files and build artifacts
---

# Generated Files Rules

1. **Do Not Hand-Edit Derived Artifacts**: `_site/`, `data/search-index.json`, `data/repository-meta.json`, and `data/build-manifest.json` are built artifacts generated via `npm run generate` or `npm run build:site`.
2. **Atomic Synchronization**: Always run `npm run generate` after modifying canonical data.
3. **Per-File Build Digests**: `data/build-manifest.json` must compute real per-file SHA256 digests and byte sizes.
""",
    "40-security-secrets.md": """---
trigger: always_on
description: Security, secret protection, and zero-critical vulnerability standards
---

# Security & Secrets Rules

1. **Zero Secret Exposure**: Never commit API keys, auth tokens, private credentials, or unmasked secrets to git or public artifacts.
2. **Key Masking**: Always mask API keys in telemetry and log outputs (`sk-...1234`).
3. **Fail-Closed Session Security**: Authentication filters and security endpoints must fail closed upon invalid JWTs or missing signatures.
""",
    "50-testing-quality.md": """---
trigger: model_decision
description: Testing and automated quality assurance rules
---

# Testing & Quality Rules

1. **100% Green Quality Gate**: Changes to core scripts or data must pass `npm run quality` cleanly before committing.
2. **Race Condition Prevention**: ID allocators and publishers must acquire cross-process file locks (`msvcrt`/`fcntl`).
3. **PWA & Offline Contract**: Service worker (`sw.js`) precache files and manifest icons must exist and resolve.
""",
    "60-agent-ownership.md": """---
trigger: always_on
description: Agent role boundaries, ownership, and coordination guidelines
---

# Agent Ownership & Worktree Rules

1. **Worktree Isolation**: Sidecar agents operate in dedicated worktrees (`.agent-worktrees/`).
2. **Single Canonical Writer**: Only `scripts/va_runtime/publisher.py` is authorized to publish canonical `idea-XXX` items to `data/ideas.json`.
3. **Lock-Free Coordination**: Agents must log state updates to `.agent-state/logs/` and rebase onto `main` before submitting pull requests.
"""
}

def create_rules():
    os.makedirs(RULES_DIR, exist_ok=True)
    print("=== Creating 7 Focused Antigravity Workspace Rules ===")
    for fname, content in RULES.items():
        fpath = os.path.join(RULES_DIR, fname)
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"[OK] Created rule: .agents/rules/{fname}")

if __name__ == "__main__":
    create_rules()
