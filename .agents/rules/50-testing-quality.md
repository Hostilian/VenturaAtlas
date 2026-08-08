---
trigger: model_decision
description: Testing and automated quality assurance rules
---

# Testing & Quality Rules

1. **100% Green Quality Gate**: Changes to core scripts or data must pass `npm run quality` cleanly before committing.
2. **Race Condition Prevention**: ID allocators and publishers must acquire cross-process file locks (`msvcrt`/`fcntl`).
3. **PWA & Offline Contract**: Service worker (`sw.js`) precache files and manifest icons must exist and resolve.
