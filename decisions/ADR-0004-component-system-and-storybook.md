# ADR-0004: Component System & Storybook Staging Architecture

**Status:** Accepted  
**Date:** 2026-08-29  
**Decision Makers:** VenturaAtlas Core Engineering / Antigravity Agent  
**Context:** Syntax.fm #998 ("How to Fix Vibe Coding") Phase 5  

---

## 1. Context & Problem Statement

Syntax #998 highlights the importance of component discovery tools (such as Storybook AI and `@storybook/addon-mcp`) to prevent AI agents from inventing redundant UI markup, buttons, and filter bars.

However, VenturaAtlas is intentionally a **static, dependency-light GitHub Pages application** with vanilla HTML/CSS/JavaScript and zero React/Vue/Svelte runtime frontend frameworks. Bolting on a heavyweight compilation framework solely to host Storybook would violate the repository's core durable invariants (zero new runtime dependencies, dependency-light deployment).

---

## 2. Decision & Implementation

We have implemented a **native static component catalog and discovery engine** that delivers the benefits of Storybook AI without imposing framework dependencies:

1. **Automated Component Discovery (`scripts/discover-components.js` & `scripts/build-component-inventory.js`):**
   - AST scanner that discovers UI components, containers, and shared helper utilities across `assets/js/` and all 7 lab pages.
   - Emits structured metadata into `data/component-inventory.json` (25 component structures, 273 known utilities).

2. **Living Component Showcase & Test Harness (`docs/components.html`):**
   - A standalone, framework-agnostic interactive component harness.
   - Visualizes registered components (Command Palette, Metric Cards, Status Badges, Lab Controls, View Switchers) in isolation.

3. **ESLint AST Duplication Prevention (`eslint.rules/no-inline-duplicate-util.js`):**
   - Automatically cross-references code against `data/component-inventory.json` to prevent agents from re-inventing shared utilities.

4. **Storybook Full Web Component Staging Boundary:**
   - Full `@storybook/addon-mcp` is documented and staged for when the 7 labs complete migration to native Custom Elements / Web Components (`<va-lab-header>`, `<va-metric-card>`).
   - For this release cycle, `data/component-inventory.json` + `docs/components.html` provide the ground truth for agent inspection.

---

## 3. Consequences

- Zero runtime dependencies added to production static builds.
- Agents can query `npm run check:inventory` to verify component registry validity.
- Clean separation between lightweight static HTML/CSS/JS and future Web Component migrations.
