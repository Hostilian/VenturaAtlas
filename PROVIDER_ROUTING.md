# Venture Atlas OS — Provider Routing Architecture

## Provider Priority Tiers

1. `hermes-ollama` (Tier 1: Local Ollama, free when machine is ON)
2. `omniRoute` (Tier 2: OpenRouter multi-model key pool)
3. `fcc-claude` (Tier 3: Anthropic Haiku key pool)
4. `active-api` (Tier 4: PekPik Gemini 2.5 Flash Proxy key pool)
5. `deepseek-api` (Tier 5: DeepSeek Chat key pool)
6. `anthropic-full` (Tier 6: Anthropic Sonnet/Opus key pool)
7. `own-orch` (Tier 7: Zero-latency local rule-based fallback, 100% resilient)

## Circuit Breaker Strategy
- 3 consecutive failures trigger a 180s cooldown window.
- UTC ISO 8601 timestamps ensure cross-platform datetime safety.
