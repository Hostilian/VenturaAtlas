# ADR-0006: Evaluation of TanStack AI Code Mode in Python Multi-LLM Orchestration

**Status:** Evaluated & Documented (No-Migration Policy)  
**Date:** 2026-08-29  
**Decision Makers:** VenturaAtlas Core Engineering / Antigravity Agent  
**Context:** Syntax.fm #998 ("How to Fix Vibe Coding") Phase 8  

---

## 1. Context & Concept Analysis

Syntax #998 introduces **TanStack AI Code Mode** as an alternative to chatty, sequential LLM tool-calling roundtrips.

In traditional tool-calling:
- The LLM calls Tool A -> Waits for response -> Inspects output -> Calls Tool B -> Waits for response -> Returns final completion.
- Each roundtrip incurs latency, token costs, and compounding hallucination risks.

In **Code Mode**:
- The model outputs a complete, executable program (JavaScript/TypeScript in a sandboxed QuickJS/V8/Cloudflare Workers environment) that composes multiple API/tool calls in a single execution pass.
- Returns only the aggregated, final result to the model in one roundtrip.

---

## 2. VenturaAtlas Stack Evaluation & Decision

### Stack Realities
1. The multi-LLM orchestration layer in VenturaAtlas (`scripts/va_orchestrator.py`, `scripts/live-provider-proof.py`, `scripts/va_runtime/`) is built in **Python 3.11**.
2. It manages 7 priority tiers (`hermes-ollama`, `omniRoute`, `fcc-claude`, `active-api`, `deepseek-api`, `anthropic-full`, `own-orch`) with circuit breakers, fanout limits (`--fanout`), minimum external model thresholds (`--minimum-external`), and cost budget caps (`--max-cost`).
3. TanStack AI Code Mode (`@tanstack/ai-code-mode`) is a **TypeScript-only** library requiring a Node.js/QuickJS runtime.

### Architectural Decision: Do Not Port Python Orchestrator
We explicitly **reject porting the Python orchestrator to TypeScript** solely to adopt the TanStack package. Doing so would be a high-risk, disproportionate rewrite that would destabilize the existing multi-provider key pools, circuit breakers, and empirical consensus calculators (`calculate_consensus.py`, `va-ranker.py`).

---

## 3. Conceptual Adoption in Python Orchestration

While we do not import the TypeScript `@tanstack/ai-code-mode` package, we adopt its **core paradigm** inside the Python orchestrator:

1. **Batch Parallel Execution:**
   - `scripts/va_orchestrator.py` dispatches parallel fan-out queries across multiple providers simultaneously rather than chaining sequential serial calls.
2. **Single-Pass Consensus Synthesis:**
   - Outputs are gathered into a single payload and evaluated in one pass by the consensus engine (`scripts/calculate_consensus.py`).
3. **Future Frontend Chat Surface Scope:**
   - If an interactive client-side AI chat UI is built for `apps/factbounty` (which is already TypeScript/Express), `@tanstack/ai-code-mode` will be evaluated at that time for client-side tool execution in the browser sandbox.

---

## 4. Consequences

- The Python orchestration layer remains fast, stable, and native.
- Zero unnecessary Node.js sandboxes or TypeScript bindings bolted onto Python background services.
- Clean architectural documentation of tool batching patterns.
