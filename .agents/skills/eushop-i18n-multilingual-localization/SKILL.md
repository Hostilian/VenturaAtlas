---
name: eushop-i18n-multilingual-localization
description: "Next.js i18n Multilingual Localization & Locale Routing Skill for EUshop"
---

# EUshop i18n Multilingual Localization Skill

## Overview

This skill establishes multilingual translation dictionaries, locale routing (`en`, `de`, `fr`, `it`, `es`), and locale-aware number/currency formatting across `apps/web/`.

---

## 1. Multilingual Routing Standard

- Target official EU languages: English (`en`), German (`de`), French (`fr`), Italian (`it`), Spanish (`es`).
- Currency formatting: Use `Intl.NumberFormat` with EUR currency symbol (`€`) and locale-specific decimal separators.
