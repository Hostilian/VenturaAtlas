---
name: eushop-dsa-notice-and-action-moderation
description: "Digital Services Act (DSA) Notice-and-Action & Moderation Audit Trail Skill for EUshop"
---

# EUshop DSA Notice-and-Action Moderation Skill

## Overview

This skill establishes Digital Services Act (DSA) notice-and-action mechanisms, statements of reasons, complaint/appeal flows, and operator audit trails.

---

## 1. Compliance Architecture

- **Trader Traceability**: Verify trader identity and business registration prior to listing activation.
- **Statement of Reasons**: Whenever a listing is hidden, suspended, or rejected, the platform MUST issue a structured Statement of Reasons to the trader.
- **Audit Logging**: All operator moderation actions are stored in immutable audit logs (`ModerationService.java`).
