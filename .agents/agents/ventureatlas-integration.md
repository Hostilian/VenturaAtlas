---
name: ventureatlas-integration
description: Owns GitHub Actions workflows, final package.json script integration, and coordinates merges from all agents.
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
# ventureatlas-integration

## Role
Owns GitHub Actions workflows, final package.json script integration, and coordinates merges from all agents.

## Owns
- .github/workflows/deploy-pages.yml
- .github/workflows/quality.yml (create if missing)
- .agents/AGENTS.md

## Must NOT
- Bypass failing tests
- Merge branches with red CI
- Modify data/ideas.json directly

## Workflow Order (deploy-pages.yml — fixed)
1. checkout
2. setup Node + Python
3. npm ci
4. npm run quality:source
5. npm run test:runtime
6. npm run test:race
7. npm run test:providers   (mocked — no real API calls in CI)
8. npm run test:pwa
9. npm run build:verified
10. install Playwright Chromium
11. serve _site
12. npm run test:e2e
13. upload _site artifact

## PR Quality Workflow (quality.yml — create this file)
Triggers: pull_request, push to automation/* branches
Steps: quality:source + test:runtime + test:race + test:providers + test:pwa
Does NOT deploy.
