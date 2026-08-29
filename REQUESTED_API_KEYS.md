# 🔑 REQUESTED API KEYS & RUNTIME STATUS

> **Updated:** 2026-08-27 (OMEGA-XIX Integrity & Autonomy Reconciled)
> **Requested by:** Antigravity AI agent / OMEGA-XIX Codex
> **Priority:** MEDIUM — Local/offline autonomy is active (Hermes 3 + Cohere + Own-Orch); premium reasoning providers require funded keys.

---

## Current Provider Health Snapshot (2026-08-27 Live Probe)

| Provider | Type | Cost | Status | Circuit | Notes |
|----------|------|------|--------|---------|-------|
| `hermes-ollama` | Local Ollama (`hermes3:latest`) | **FREE** | ✅ AVAILABLE | 🟢 CLOSED | Local offline runner on port 11434 |
| `own-orch` | Rule-based Deterministic | **FREE** | ✅ AVAILABLE | 🟢 CLOSED | Zero-dependency internal fallback engine |
| `cohere-api` | Cohere API | Configured / Free Tier | ✅ AVAILABLE | 🟢 CLOSED | Active response verified |
| `nvidia-nim-adversarial` | OpenAI GPT-OSS 20B (NVIDIA NIM) | Configured | ✅ AVAILABLE | 🟢 CLOSED | Adversarial review lane active |
| `nvidia-nim` | NVIDIA NIM Primary (`llama-3.1-8b`) | Free Tier | ❌ UNAVAILABLE | 🔴 OPEN | HTTP 410 Gone (upstream endpoint update required) |
| `fcc-claude` | Anthropic Haiku | **PAID** (~$3–5/M tokens) | ❌ UNAVAILABLE | 🔴 OPEN | No valid `ANTHROPIC_API_KEY` configured |
| `anthropic-full` | Anthropic Sonnet / Opus | **PAID** (~$15/M tokens) | ❌ UNAVAILABLE | 🔴 OPEN | No valid `ANTHROPIC_API_KEY` configured |
| `omniRoute` | OpenRouter Marketplace | **PAID** ($5 min top-up) | ❌ UNAVAILABLE | 🔴 OPEN | No valid `OPENROUTER_API_KEY` configured |
| `active-api` | PekPik Gemini Proxy | Third-Party | ❌ UNAVAILABLE | 🔴 OPEN | HTTP 403 Forbidden (proxy key disabled) |
| `deepseek-api` | DeepSeek API | Third-Party | ❌ UNAVAILABLE | 🔴 OPEN | HTTP 401 Unauthorized (key disabled) |

---

## Keys Needed for Premium Reasoning & Panel Synthesis

### 1. ANTHROPIC_API_KEY
- **Unlocks:** `fcc-claude` + `anthropic-full` — multi-turn adversarial panel, top-tier critique
- **Current status:** `OPEN` circuit — "No ANTHROPIC_API_KEY configured" (401 Unauthorized)
- **Impact:** 3-model adversarial panel gracefully falls back to available models; deep red-team critique requires manual key addition
- **Where to get it:** https://console.anthropic.com/settings/keys
- **Where to add it:** `.env` file in the repo root → `ANTHROPIC_API_KEY=sk-ant-...`
- **Cost:** Paid per use (real money, ~$3–15/million tokens depending on model)

### 2. OPENROUTER_API_KEY
- **Unlocks:** `omniRoute` multi-provider marketplace — automated routing across 50+ frontier models
- **Current status:** `OPEN` circuit — "No OPENROUTER_API_KEY configured" (401 Unauthorized)
- **Impact:** Provider router deprioritizes OmniRoute and routes across Cohere + Hermes + Own-Orch
- **Where to get it:** https://openrouter.ai/keys
- **Where to add it:** `.env` file → `OPENROUTER_API_KEY=sk-or-...`
- **Cost:** Paid per use ($5 minimum top-up)

---

## Local Autonomy & Background Recurrence Verification

- **Windows Desktop Supervisor:** Scheduled Task `VentureAtlasAutonomy` is **REGISTERED and RUNNING**. It continuously triggers `scripts/Start-VentureAtlas-Supervisor.ps1` with single-process locking.
- **Local Provider:** Ollama is running locally on port 11434 with `hermes3:latest` and circuit is `CLOSED`.
- **Offline / Degraded Loop:** When external API keys are unavailable, the runtime operates cleanly on `hermes-ollama` + `cohere-api` + `own-orch` without crashing or throwing unhandled exceptions.
- **Scheduled GitHub Actions:** `.github/workflows/autonomy-monitor.yml` and `.github/workflows/research-cycle.yml` are configured with private caching and bounded timeouts.
