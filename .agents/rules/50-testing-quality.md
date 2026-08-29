---
trigger: model_decision
description: Testing and automated quality assurance rules
---

# Testing & Quality Rules

1. **100% Green Quality Gate**: Changes to core scripts or data must pass `npm run quality:gate` cleanly before committing.
2. **Version-Accurate Documentation (Context7)**: Look up unfamiliar or version-sensitive library APIs via Context7 MCP before writing code, especially for Stripe 17.7.0, AWS SDK v3 3.1108.0, Playwright 1.62.1, and Zod 3.24.2.
3. **Race Condition Prevention**: ID allocators and publishers must acquire cross-process file locks (`msvcrt`/`fcntl`).
4. **PWA & Offline Contract**: Service worker (`sw.js`) precache files and manifest icons must exist and resolve.

