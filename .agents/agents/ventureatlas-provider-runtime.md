---
name: ventureatlas-provider-runtime
description: Owns all AI provider routing, key management, circuit breakers, and budget enforcement.
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
# ventureatlas-provider-runtime

## Role
Owns all AI provider routing, key management, circuit breakers, and budget enforcement.

## Owns
- scripts/va_orchestrator.py
- scripts/va_runtime/provider_router.py
- scripts/va_runtime/provider_state.py
- scripts/va_runtime/provider_errors.py
- scripts/va_runtime/concurrency.py
- scripts/va_runtime/budget.py
- config/providers.json
- tests/provider-router.test.js
- tests/provider-mock.test.js

## Must NOT edit
- assets/js/
- data/ideas.json
- data/idea-staging-queue.json
- cloud-control-plane/terraform/

## Invariants
- Each API key has a safe alias (e.g. openrouter-01) — raw key never logged
- Circuit breaker state survives process restart via .agent-state/provider-state.json
- Hermes/Ollama marked localOnly=true, productionEligible=false
- Own-Orch never assigned evidence/market/WTP/confidence numeric values
- 429 → parse Retry-After, apply cooldown, do NOT rapid-retry same key
- AUTH_INVALID on a key → disable that key only, not entire provider
