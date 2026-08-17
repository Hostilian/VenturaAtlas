# Venture Atlas OS — Provider API Keys & Runtime Configuration Guide

This document outlines the multi-provider runtime architecture, environment variable specifications, multi-key rotation mechanism, and safety fallbacks for Venture Atlas OS.

---

## 1. Zero-Cost Fallback by Default

Venture Atlas OS operates completely out-of-the-box without any external API keys configured:
- **Tier 0 (`own-orch`)**: Deterministic, local rule-based engine that enforces all schemas, rankings, and verification pipelines at zero financial cost and instant latency.
- When external provider keys are absent, the runtime transparently falls back to `own-orch` without crashing or blocking validation.

---

## 2. Supported Provider Tiers & Configuration

To enable external LLM reasoning, research synthesis, or adversarial reviews, copy `.env.example` to `.env` and configure your API keys:

```bash
cp .env.example .env
```

### 2.1 Tier 1: Hermes via Ollama (Local, Free)
- **Engine**: Local Ollama instance
- **Setup**: Install [Ollama](https://ollama.com) and pull the model:
  ```bash
  ollama pull hermes3
  ```
- **Environment Variables**:
  ```ini
  OLLAMA_BASE_URL=http://localhost:11434
  HERMES_MODEL=hermes3:latest
  OLLAMA_FALLBACK_MODEL=llama3.1:latest
  ```

### 2.2 Tier 2: OmniRoute / OpenRouter (Low Cost / Free Tier)
- **Supports Multi-Key Pools**: Comma-separated keys for automatic round-robin rotation.
- **Environment Variables**:
  ```ini
  OPENROUTER_API_KEYS=sk-or-v1-key1,sk-or-v1-key2
  OPENROUTER_API_KEY=sk-or-...
  OMNIROUTE_BASE_URL=https://openrouter.ai/api/v1
  OMNIROUTE_MODEL=meta-llama/llama-3.1-8b-instruct:free
  ```

### 2.3 Tier 3: FCC Claude (Anthropic Haiku)
- **Environment Variables**:
  ```ini
  ANTHROPIC_API_KEYS=sk-ant-key1,sk-ant-key2
  ANTHROPIC_API_KEY=sk-ant-...
  FCC_CLAUDE_MODEL=claude-haiku-4-5
  ```

### 2.4 Tier 4: Active API (PekPik Gemini 2.5 Flash Proxy)
- **Environment Variables**:
  ```ini
  ACTIVE_API_KEYS=sk-act-key1,sk-act-key2
  ACTIVE_API_KEY=sk-act-...
  ACTIVE_API_BASE_URL=https://aiapiv2.pekpik.com/v1
  ACTIVE_API_MODEL=gemini-2.5-flash
  ```

### 2.5 Tier 5: DeepSeek API
- **Environment Variables**:
  ```ini
  DEEPSEEK_API_KEYS=sk-ds-key1,sk-ds-key2
  DEEPSEEK_API_KEY=sk-ds-...
  DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
  DEEPSEEK_MODEL=deepseek-chat
  ```

### 2.6 Tier 6: Full Anthropic (Sonnet / Opus)
- **Environment Variables**:
  ```ini
  ANTHROPIC_FULL_MODEL=claude-sonnet-4-5
  ```

---

## 3. Security, Key Masking & Safety Invariants

1. **Secret Isolation**:
   - `.env` is git-ignored and never committed.
   - All logging streams (`.agent-state/logs/unattended-runner.log`) mask active keys as `sk-a...bcde`.
   - Never pass raw secret strings in command-line arguments or commit messages.
2. **Circuit Breaker & Automatic Cooldown**:
   - Rate limit (HTTP 429): Key is cooled down for 60 seconds (or Retry-After header duration).
   - Auth invalid (HTTP 401/403): Invalid key is immediately disabled in the active pool and logged.
   - Provider circuit opens after 3 consecutive failures for 180 seconds.
3. **Freshness Guard**:
   - Provider health states older than 24 hours in `.agent-system/provider-registry.json` are automatically flagged as `STALE_UNVERIFIED`.

---

## 4. Verification Commands

Test your provider configuration without consuming production quota:

```bash
# Verify provider routing and key discovery
python scripts/test_providers_mock.py

# Test deterministic engine smoke test
python scripts/va_orchestrator.py --test

# Prove live external provider connectivity
python scripts/live-provider-proof.py --minimum-external 1 --fanout 1 --max-cost 1
```
