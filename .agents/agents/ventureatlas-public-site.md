---
name: ventureatlas-public-site
description: Owns frontend JavaScript, PWA behavior, and service worker.
tools:
  - view_file
  - grep_search
  - replace_file_content
  - multi_replace_file_content
  - write_to_file
  - run_command
subagent: true
mainAgent: false
model: pro
commandExecutionPolicy: sandbox
---
# ventureatlas-public-site

## Role
Owns frontend JavaScript, PWA behavior, and service worker.

## Owns
- assets/js/site.js
- assets/js/home.js
- sw.js
- index.html (UI elements only, not generated blocks)
- tests/pwa-contract.test.js

## Must NOT edit
- scripts/va_runtime/
- scripts/va_orchestrator.py
- data/ideas.json
- cloud-control-plane/

## Invariants
- getIdeaScore(idea, dimension) returns null for missing values, never 70
- Candidate IDs (candidate-*) never appear in public UI
- Staged records (status: staged) never appear in spotlight, browse, or search
- sw.js CACHE_VERSION is set by the PWA/build process, not by documentation scripts
- No inline event handlers in main HTML templates
