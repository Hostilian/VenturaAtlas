---
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
