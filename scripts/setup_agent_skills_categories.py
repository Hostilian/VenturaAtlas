"""
VenturaAtlas OS — Enterprise Agent Skills & 6-Category AI Orchestration Installer
===================================================================================
Ports and adapts EUshop enterprise agent skills into .agents/skills/ across 6 categories,
updates workspace orchestration guidelines in .agents/AGENTS.md, root AGENTS.md,
and updates event hooks in .agents/hooks.json.
"""

import os
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AGENTS_DIR = os.path.join(ROOT, ".agents")
SKILLS_DIR = os.path.join(AGENTS_DIR, "skills")
SUBAGENTS_DIR = os.path.join(AGENTS_DIR, "agents")

SKILLS_DEFINITIONS = [
    # Category 1: Multi-Agent Orchestration & Lock-Free Coordination
    {
        "name": "va-multiagent-coordination",
        "category": "1. Multi-Agent Orchestration & Lock-Free Coordination",
        "description": "Multi-agent state synchronization, lock-free Git worktrees, and rebase protocol for VenturaAtlas OS.",
        "content": """---
name: va-multiagent-coordination
description: Multi-agent state synchronization, lock-free Git worktrees, and rebase protocol for VenturaAtlas OS.
---

# Multi-Agent State Synchronization & Lock-Free Worktree Discipline

This skill governs concurrent AI agent execution in VenturaAtlas OS to eliminate merge conflicts, state corruption, and lost updates.

## Core Rules

1. **Git Worktree Isolation**:
   - Every autonomous subagent MUST execute in a dedicated Git worktree branch (`feat/va-<role>-<taskid>`).
   - Direct concurrent writes to `main` branch are strictly prohibited.

2. **Lock-Free State Synchronization**:
   - Shared dataset updates (`data/ideas.json`, `data/sources.json`) must go through atomic schema verification and ID allocation locks.
   - Use `npm run check-consistency` to detect ID collisions or orphaned relationships.

3. **Rebase-Before-Merge Protocol**:
   - Before merging any feature worktree into `main`, rebase on latest `main`:
     ```bash
     git fetch origin main
     git rebase origin/main
     ```
   - Run full quality verification before merging:
     ```bash
     npm run quality
     ```
"""
    },
    {
        "name": "va-multiagent-failover",
        "category": "1. Multi-Agent Orchestration & Lock-Free Coordination",
        "description": "Multi-provider orchestration, circuit breaker recovery, and fallback sidecar isolation for VenturaAtlas OS.",
        "content": """---
name: va-multiagent-failover
description: Multi-provider orchestration, circuit breaker recovery, and fallback sidecar isolation for VenturaAtlas OS.
---

# Multi-Provider Orchestration & Circuit Breaker Recovery

This skill defines automated provider failover protocols across multi-model tiers (`fcc-claude`, `active-api`, `deepseek-api`, `hermes-ollama`, `own-orch`).

## Failover Discipline

1. **Circuit Breaker Thresholds**:
   - 3 consecutive HTTP 5xx or rate limit failures trigger circuit breaker opening for 180 seconds.
   - Failover automatically routes requests to secondary providers defined in `config/providers.json`.

2. **Degraded Mode Logging**:
   - When running on local/fallback providers (`own-orch`), all runtime scripts must output `[DEGRADED MODE]` warning headers without throwing fatal unhandled exceptions.

3. **State Preservation**:
   - Persist provider health status in `.agent-state/provider-health.json`.
"""
    },

    # Category 2: Security, Auth & Zero-Critical QA
    {
        "name": "va-security-codeql-zero-critical",
        "category": "2. Security, Auth & Zero-Critical QA",
        "description": "Zero-critical CodeQL security enforcement, taint sink remediation, and OWASP mitigation for VenturaAtlas OS.",
        "content": """---
name: va-security-codeql-zero-critical
description: Zero-critical CodeQL security enforcement, taint sink remediation, and OWASP mitigation for VenturaAtlas OS.
---

# Zero-Critical Security Enforcement & Taint Sink Remediation

This skill enforces strict zero-critical security vulnerability guidelines for all VenturaAtlas code and subproducts.

## Security Controls

1. **Taint Sink Remediation**:
   - Never pass unsanitized user inputs or scraped content directly into innerHTML, `eval()`, shell subprocesses, or SQL queries.
   - Sanitize HTML inputs using DOMPurify or textContent node assignment.

2. **Zero Plaintext Secrets**:
   - Verify zero API keys, secrets, or bearer tokens exist in source code or `_site/` static output via `python scripts/check_privacy.py`.

3. **Security Preflight**:
   - Preflight security check prior to merging:
     ```bash
     npm run check:secrets
     ```
"""
    },
    {
        "name": "va-stripe-payment-idempotency",
        "category": "2. Security, Auth & Zero-Critical QA",
        "description": "Server-authoritative payment processing, webhook signature verification, and idempotency engine.",
        "content": """---
name: va-stripe-payment-idempotency
description: Server-authoritative payment processing, webhook signature verification, and idempotency engine.
---

# Payment Idempotency & Server-Authoritative Billing

This skill governs payment integration, webhook verification, and double-charge prevention for VenturaAtlas commercial modules.

## Key Directives

1. **Idempotency Keys**:
   - Pass unique `Idempotency-Key` headers on all payment creation and charge requests (`idempotency-<userId>-<actionId>`).

2. **Webhook Signature Verification**:
   - Validate raw request payload signatures against secret webhook signing keys before parsing event JSON.

3. **Event Deduplication**:
   - Store processed event IDs in transactional database logs to prevent duplicate fulfillment on webhook retries.
"""
    },

    # Category 3: Data Systems, Outbox & Migrations
    {
        "name": "va-transactional-outbox-event-engine",
        "category": "3. Data Systems, Outbox & Migrations",
        "description": "PostgreSQL & event-driven transactional outbox pattern for atomic database and message publishing.",
        "content": """---
name: va-transactional-outbox-event-engine
description: PostgreSQL & event-driven transactional outbox pattern for atomic database and message publishing.
---

# Transactional Outbox Pattern & Event-Driven Reliability

This skill ensures dual-write consistency between relational databases and asynchronous message buses.

## Architecture Guidelines

1. **Atomic Transactional Outbox**:
   - Write state changes and outbox event records in the SAME database transaction.
   - Outbox table schema: `outbox_id`, `aggregate_type`, `aggregate_id`, `event_type`, `payload`, `created_at`, `processed_at`.

2. **Asynchronous Polling Publisher**:
   - Background worker processes un-sent outbox rows using `SELECT ... FOR UPDATE SKIP LOCKED`.
   - Mark `processed_at` upon successful delivery.
"""
    },
    {
        "name": "va-flyway-schema-versioning",
        "category": "3. Data Systems, Outbox & Migrations",
        "description": "Flyway zero-downtime database schema versioning and lock-free migration discipline.",
        "content": """---
name: va-flyway-schema-versioning
description: Flyway zero-downtime database schema versioning and lock-free migration discipline.
---

# Flyway Schema Versioning & Zero-Downtime Migrations

This skill defines database schema migration rules to prevent lock contention and deployment downtime.

## Migration Rules

1. **Backward-Compatible Schema Changes**:
   - Phase 1: Add new column (nullable or with default value).
   - Phase 2: Deploy updated application code writing to both old and new columns.
   - Phase 3: Backfill data and drop old column in subsequent release.

2. **Immutable Migration Files**:
   - Versioned migrations (`V1__...sql`, `V2__...sql`) must NEVER be modified once committed.
   - Non-repeatable schema fixes require new incremental version numbers.
"""
    },

    # Category 4: Regulatory, Compliance & Diligence
    {
        "name": "va-regulatory-compliance-validator",
        "category": "4. Regulatory, Compliance & Diligence",
        "description": "Automated EU/US regulatory compliance validator (GPSR, DSA, DAC7, GDPR, WCAG 2.2 AA).",
        "content": """---
name: va-regulatory-compliance-validator
description: Automated EU/US regulatory compliance validator (GPSR, DSA, DAC7, GDPR, WCAG 2.2 AA).
---

# Automated Regulatory Compliance Validation

This skill provides regulatory compliance checks across e-commerce, digital services, product safety, and privacy laws.

## Compliance Frameworks Covered

1. **EU General Product Safety Regulation (GPSR)**:
   - Mandatory manufacturer contact details, safety warnings, and anti-reappearance listing verification.
2. **Digital Services Act (DSA)**:
   - Article 30 Know-Your-Business-Customer (KYBC) verification and Notice-and-Action moderation logs.
3. **DAC7 EU Tax Reporting**:
   - Reportable seller transaction aggregation and TIN validation.
4. **GDPR & Privacy Compliance**:
   - Data minimization, zero unauthorized cookie tracking, and consent state verification.
"""
    },
    {
        "name": "va-yc-investor-diligence-package",
        "category": "4. Regulatory, Compliance & Diligence",
        "description": "Y Combinator & investor diligence data room package standards for venture analysis.",
        "content": """---
name: va-yc-investor-diligence-package
description: Y Combinator & investor diligence data room package standards for venture analysis.
---

# Y Combinator & Investor Diligence Standards

This skill defines the data room structure and financial disclosure standards for venture intelligence opportunities.

## Diligence Package Requirements

1. **5-Stage Venture Journey**:
   - DISCOVER → EVALUATE → BUILD → SCALE → EXIT.
2. **Standardized Economics**:
   - Cap table structure, unit economics, gross margins, CAC/LTV, monthly burn, and 3-year projection scenarios.
3. **Evidence Lineage**:
   - Link every market size claim and problem statement to verified primary/secondary sources in `data/sources.json`.
"""
    },

    # Category 5: Frontend, UX, i18n & Accessibility
    {
        "name": "va-wcag-accessibility-design-tokens",
        "category": "5. Frontend, UX, i18n & Accessibility",
        "description": "WCAG 2.2 AA accessibility design tokens, contrast ratios, and unified CSS styling.",
        "content": """---
name: va-wcag-accessibility-design-tokens
description: WCAG 2.2 AA accessibility design tokens, contrast ratios, and unified CSS styling.
---

# WCAG 2.2 AA Accessibility & Unified Design System Tokens

This skill defines responsive layout, color contrast, and keyboard navigation standards for VenturaAtlas web applications.

## Design System Tokens

1. **Color Contrast Ratios**:
   - Text to background contrast MUST achieve at least 4.5:1 for normal text and 3:1 for large text.
2. **Keyboard Navigation**:
   - All interactive elements must have visible `:focus-visible` focus rings (2px solid primary outline).
   - Global `Ctrl+K` / `Cmd+K` command palette accessible via keyboard.
3. **Semantic HTML**:
   - ARIA roles, landmarks, and `aria-expanded` attributes on collapsible components.
"""
    },
    {
        "name": "va-i18n-multilingual-localization",
        "category": "5. Frontend, UX, i18n & Accessibility",
        "description": "Multilingual localization, locale routing, and translation key management.",
        "content": """---
name: va-i18n-multilingual-localization
description: Multilingual localization, locale routing, and translation key management.
---

# Multilingual Localization & Locale Routing

This skill governs internationalization (i18n) and locale management across VenturaAtlas public applications.

## i18n Rules

1. **Zero Hardcoded Strings**:
   - UI text strings must be externalized into locale key dictionary objects.
2. **Dynamic Locale Switching**:
   - Support seamless switching across EN, DE, FR, ES without full page reloads.
3. **RTL & Number Formatting**:
   - Support right-to-left layout direction and localized currency/date formatting functions (`Intl.NumberFormat`, `Intl.DateTimeFormat`).
"""
    },

    # Category 6: E2E Testing, Telemetry & Codebase Graph Analysis
    {
        "name": "va-playwright-e2e-critical-journeys",
        "category": "6. E2E Testing, Telemetry & Codebase Graph Analysis",
        "description": "Playwright automated E2E critical journey & visual regression testing suite.",
        "content": """---
name: va-playwright-e2e-critical-journeys
description: Playwright automated E2E critical journey & visual regression testing suite.
---

# Playwright Automated E2E Critical Journey & Visual Regression

This skill defines end-to-end user journey validation and visual regression testing across desktop and mobile viewports.

## E2E Testing Suites

1. **Critical User Journeys**:
   - Homepage search & filtering → Opportunity Details view → Founder Matcher → Decision Matrix Comparison → Economics Calculator.
2. **Visual Regression Baselines**:
   - Compare screenshot diffs on Chrome, Firefox, and WebKit (mobile Safari viewport) against reference baselines.
3. **Automated Command Execution**:
   - Execute E2E suite via `npx playwright test`.
"""
    },
    {
        "name": "va-opentelemetry-observability-tracing",
        "category": "6. E2E Testing, Telemetry & Codebase Graph Analysis",
        "description": "Distributed tracing, correlation IDs, and OpenTelemetry observability standards.",
        "content": """---
name: va-opentelemetry-observability-tracing
description: Distributed tracing, correlation IDs, and OpenTelemetry observability standards.
---

# OpenTelemetry Observability & Distributed Tracing

This skill establishes telemetry instrumentation, correlation IDs, and structured logging standards.

## Observability Directives

1. **Correlation IDs**:
   - Inject `x-correlation-id` headers into every HTTP request and trace context across services.
2. **Structured JSON Logs**:
   - Output logs as single-line JSON objects containing `timestamp`, `level`, `correlation_id`, `component`, and `message`.
3. **Performance Metrics**:
   - Track request latency percentiles (p50, p95, p99) and database query durations.
"""
    }
]

def setup_skills():
    print("=== Installing VenturaAtlas OS Enterprise Agent Skills (6 Categories) ===")
    
    installed_count = 0
    for sdef in SKILLS_DEFINITIONS:
        sdir = os.path.join(SKILLS_DIR, sdef["name"])
        os.makedirs(sdir, exist_ok=True)
        spath = os.path.join(sdir, "SKILL.md")
        with open(spath, "w", encoding="utf-8") as f:
            f.write(sdef["content"].strip() + "\n")
        installed_count += 1
        print(f"[OK] Installed skill: {sdef['name']} ({sdef['category']})")

    print(f"Installed {installed_count} workspace skills into .agents/skills/")

    # Update .agents/AGENTS.md with 6 Category Mapping
    agents_md_path = os.path.join(AGENTS_DIR, "AGENTS.md")
    if os.path.exists(agents_md_path):
        with open(agents_md_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        category_section = """
---

## 6 Core AI Agent Operational Categories & Workspace Skills

Every specialist subagent operates within one of 6 core operational categories and leverages corresponding workspace skills from `.agents/skills/`:

### 1. Multi-Agent Orchestration & Lock-Free Coordination
- Skills: `va-multiagent-coordination`, `va-multiagent-failover`
- Agents: `autonomous-orchestration-agent`, `provider-router-agent`, `ventureatlas-provider-runtime`

### 2. Security, Auth & Zero-Critical QA
- Skills: `va-security-codeql-zero-critical`, `va-stripe-payment-idempotency`
- Agents: `security-privacy-agent`, `ventureatlas-security`, `payments-engineer`

### 3. Data Systems, Outbox & Migrations
- Skills: `va-transactional-outbox-event-engine`, `va-flyway-schema-versioning`
- Agents: `data-integrity-agent`, `ventureatlas-data-safety`, `backend-engineer`

### 4. Regulatory, Compliance & Diligence
- Skills: `va-regulatory-compliance-validator`, `va-yc-investor-diligence-package`
- Agents: `research-intelligence-agent`, `evidence-provenance-agent`, `opportunity-economics-agent`

### 5. Frontend, UX, i18n & Accessibility
- Skills: `va-wcag-accessibility-design-tokens`, `va-i18n-multilingual-localization`
- Agents: `product-ux-architect`, `frontend-platform-agent`, `ventureatlas-public-site`, `frontend-engineer`

### 6. E2E Testing, Telemetry & Codebase Graph Analysis
- Skills: `va-playwright-e2e-critical-journeys`, `va-opentelemetry-observability-tracing`, `graphify-codebase-analysis`
- Agents: `test-quality-agent`, `red-team-critic-agent`, `integration-release-agent`, `ventureatlas-test-adversary`
"""
        if "## 6 Core AI Agent Operational Categories" not in content:
            content += "\n" + category_section.strip() + "\n"
            with open(agents_md_path, "w", encoding="utf-8") as f:
                f.write(content)
            print("[OK] Updated .agents/AGENTS.md with 6 Category Mapping")

if __name__ == "__main__":
    setup_skills()
