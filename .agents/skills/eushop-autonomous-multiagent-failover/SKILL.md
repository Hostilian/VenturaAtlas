---
name: eushop-autonomous-multiagent-failover
description: "20-Provider Orchestration, Circuit Breaker Recovery & Sidecar Isolation for EUshop"
---

# EUshop Autonomous Multi-Agent Failover Skill

## Overview

This skill defines the multi-agent failover policies, process supervision, circuit breaker reset rules, and parallel sidecar worktree architecture for EUshop.

---

## 1. Provider Failover Tiering (20 Providers)

```text
Tier 1: Free & Primary Wrappers (FCC / NIM)
Tier 2: Subscription AI (Codex ChatGPT Login / Copilot CLI)
Tier 3: Metered API Keys (Codex API, Gemini CLI)
Tier 4: Free API Routers (OpenRouter, Gemini Exp, Groq, Cohere)
Tier 5: Local Offline Models (Ollama)
```

---

## 2. Emergency Recovery Commands

- **One-Line Auto-Recovery**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\scripts\Emergency-Recovery.ps1
  ```
- **Sidecar Worktree Launch**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts\EUshop-MultiAgent-Sidecars.ps1 -Mode Launch
  ```
- **Reset Circuit Breaker Failovers**:
  Reset `.claude/provider-state-v3.json` `failures` count to 0 and `circuitUntil` to empty string.
