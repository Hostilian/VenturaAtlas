---
name: eushop-regulatory-compliance-validator
description: "Automated EU Regulatory Compliance Validator for EUshop (FIC 1169 Allergens, DAC7, DSA Art. 30, GDPR, WCAG 2.2 AA)"
---

# EUshop Regulatory Compliance Validator Skill

## Overview

This skill provides mandatory architectural patterns and validation guidelines for EU regulatory compliance across the EUshop codebase.

---

## 1. Single Source of Truth Rules

All regulatory rates, threshold constants, and allergen lists MUST live in `packages/compliance/`:
- **Annex II Allergens (Reg 1169/2011)**: `packages/compliance/src/allergens.ts` (14 regulated allergens).
- **DAC7 Thresholds**: `packages/compliance/src/vat.ts` (`DAC7_THRESHOLDS`: 30 transactions OR €2,000 consideration).
- **OSS Threshold**: `packages/compliance/src/vat.ts` (`OSS_THRESHOLD_EUR`: €10,000 cross-border threshold).

---

## 2. Compliance Verification Checklist

1. **Food Information (FIC 1169)**:
   - Mandatory disclosure of all 14 Annex II allergens before listing publication.
   - Ingredients list with emphasized allergen allergens in bold/highlight.

2. **DSA Article 30 (Trader Traceability)**:
   - Persistent UI element: "Sold by [Seller Name]".
   - Verification gate: Unverified traders CANNOT publish active listings.

3. **GDPR Article 17 (Cascading Erasure)**:
   - Soft-delete flags are INSUFFICIENT. Erasure requests must cascade across database tables, media storage, and subprocessors.

4. **Legal Review Comment Standard**:
   - Always place `// COMPLIANCE-REVIEW: [Jurisdiction / Rule]` comments wherever regulatory logic is implemented.
