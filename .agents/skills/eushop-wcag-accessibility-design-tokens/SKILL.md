---
name: eushop-wcag-accessibility-design-tokens
description: "WCAG 2.2 AA Accessibility & Unified Design System Tokens for EUshop"
---

# EUshop WCAG 2.2 AA Accessibility & Design Tokens Skill

## Overview

This skill provides design token standards and WCAG 2.2 AA accessibility requirements for all React components in `apps/web/`.

---

## 1. Accessibility Engineering Floor

- **Semantic HTML**: Mandatory single `<h1>` per page, correct `<nav>`, `<main>`, `<header>`, `<footer>` landmarks.
- **Keyboard Navigation**: All interactive elements must have visible focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-500`).
- **Contrast Ratios**: Normal text contrast ratio ≥ 4.5:1; large text ≥ 3:1.
- **Screen Readers**: Interactive controls must have unique `id`, `aria-label`, or associated `<label>`.

---

## 2. Design System Token Palette

- **Primary Brand**: Deep Emerald (`#059669` / `emerald-600`)
- **Accent Gold**: PDO/PGI Gold (`#D97706` / `amber-600`)
- **Backgrounds**: Slate Dark Mode (`#0F172A` / `slate-900`) & Pure White (`#FFFFFF`)
