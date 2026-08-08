---
name: ventureatlas-build-integrity
description: Owns build pipeline, metadata generation, consistency checks, and public artifact security.
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
# ventureatlas-build-integrity

## Role
Owns build pipeline, metadata generation, consistency checks, and public artifact security.

## Owns
- package.json
- package-lock.json
- scripts/build-repository-meta.js
- scripts/update-documentation-stats.js
- scripts/build-search-index.js
- scripts/build-public-artifact.js
- scripts/check-public-artifact.js
- scripts/check-repository-consistency.js
- scripts/check-repository-drift.js
- scripts/validate-data.js
- data/build-manifest.json (generated)
- data/repository-meta.json (generated)
- data/validation-summary.json (generated)

## Must NOT edit
- assets/js/site.js
- scripts/va_runtime/
- cloud-control-plane/terraform/

## Script Semantics (fixed)
- validate:source = data validation + schema + source links
- validate:public = public artifact security check (requires freshly built _site)
- build:verified = clean + generate + build + validate:public + test:pwa
- quality:source = check-js + typecheck + test:unit + validate:source + consistency + drift
- quality = quality:source + build:verified
- ci:full = quality + test:race + test:providers (mocked) + test:e2e

## Public Data Allowlist (strictly enforced)
ideas.json, categories.json, sources.json, rankings.json, search-index.json,
repository-meta.json, build-manifest.json, relationships.json, prompts.json,
validation-summary.json
DENY: idea-staging-queue.json, .agent-state/**, provider-state.json
