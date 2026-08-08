---
name: va-multiagent-failover
description: Multi-provider orchestration, circuit breaker recovery, and fallback sidecar isolation for VenturaAtlas OS.
---

# Multi-Provider Orchestration & Circuit Breaker Recovery

This skill defines automated provider failover protocols across multi-model tiers (`fcc-claude`, `active-api`, `deepseek-api`, `hermes-ollama`, `own-orch`).

## Failover Discipline

1. **Circuit Breaker Thresholds**:
   - 3 consecutive HTTP 5xx or rate limit failures trigger circuit breaker opening for 180 seconds.
   - Failover automatically routes requests to secondary providers defined in `config/providers.json`.

2. **Degraded Mode Logging**:
   - When running on local/fallback providers (`own-orch`), all runtime scripts must output `[DEGRADED MODE]` warning headers without throwing fatal unhandled exceptions.

3. **State Preservation**:
   - Persist provider health status in `.agent-state/provider-health.json`.
