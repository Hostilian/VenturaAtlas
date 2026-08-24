# 🔑 REQUESTED API KEYS — ACTION REQUIRED

> **Created:** 2026-08-24
> **Requested by:** Antigravity AI agent (background AI is BLOCKED without these)
> **Priority:** HIGH — without these keys, premium AI providers are offline

---

## Keys Needed to Unblock Full Background AI Operation

### 1. ANTHROPIC_API_KEY
- **Unlocks:** `fcc-claude` + `anthropic-full` — premium reasoning, adversarial review
- **Current status:** `OPEN` circuit — "No ANTHROPIC_API_KEY configured"
- **Impact:** Without this, the 3-model adversarial panel cannot use Claude; research quality drops
- **Where to get it:** https://console.anthropic.com/settings/keys
- **Where to add it:** `.env` file in the repo root → `ANTHROPIC_API_KEY=sk-ant-...`
- **Cost:** Pay-per-use; ~$3–15/million tokens depending on model

### 2. OPENROUTER_API_KEY
- **Unlocks:** `omniRoute` multi-provider router — fallback routing across 50+ models
- **Current status:** `OPEN` circuit — "No OPENROUTER_API_KEY configured"
- **Impact:** Without this, provider failover routing is broken; single-provider dependency
- **Where to get it:** https://openrouter.ai/keys
- **Where to add it:** `.env` file → `OPENROUTER_API_KEY=sk-or-...`
- **Cost:** Pay-per-use; often cheaper than direct APIs; $5 minimum top-up

### 3. Ollama / Hermes Local Runtime
- **Unlocks:** `hermes-ollama` — free local AI for simple operations, 24/7 no-cost
- **Current status:** `OPEN` circuit — "Connection refused on localhost:11434"
- **Impact:** Without this, there's no free tier — all AI work costs money
- **How to fix (Option A — Local):** Install Ollama → `winget install Ollama.Ollama` → `ollama pull hermes3`
- **How to fix (Option B — Always-on):** Deploy Ollama on a VPS (Hetzner CX22, ~€4/mo) so it runs 24/7 even when laptop is off
- **Configuration:** No key needed — just needs to be running on port 11434

---

## What Unlocks After Adding These

| Key Added | What Starts Working |
|-----------|-------------------|
| ANTHROPIC_API_KEY | Premium research cross-check, adversarial red-team review |
| OPENROUTER_API_KEY | Multi-provider routing, fallback if primary provider fails |
| Ollama running | Free-tier local model for simple tasks; 24/7 daemon operation |

---

## Current Provider Health Snapshot (2026-08-24)

| Provider | Status | Circuit |
|----------|--------|---------|
| nvidia-nim | ✅ available | CLOSED |
| cohere-api | ✅ available | CLOSED |
| own-orch | ✅ available | CLOSED |
| hermes-ollama | ❌ unavailable | OPEN — Ollama not running |
| fcc-claude | ❌ unconfigured | OPEN — no ANTHROPIC_API_KEY |
| anthropic-full | ❌ unconfigured | OPEN — no ANTHROPIC_API_KEY |
| omniRoute | ❌ unconfigured | OPEN — no OPENROUTER_API_KEY |

---

## Instructions for Human

1. Go to https://console.anthropic.com/settings/keys and create a new key
2. Go to https://openrouter.ai/keys and create a new key
3. Open `.env` file in the repo root
4. Add the lines:
   ```
   ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
   OPENROUTER_API_KEY=sk-or-YOUR_KEY_HERE
   ```
5. **DO NOT commit `.env` to Git** — it is in `.gitignore` and must stay private
6. After adding keys, run: `python scripts/va_orchestrator.py --test`
7. Confirm all circuits show `CLOSED` in the output

---

*This file was placed here by the agent because you asked it to remind you about keys.*
*You can delete this file once the keys are added.*
