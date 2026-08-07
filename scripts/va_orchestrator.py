#!/usr/bin/env python3
"""
Venture Atlas OS — Multi-Provider AI Orchestrator
==================================================
Providers (tiered failover, circuit breaker):
  Tier 1 — Hermes via Ollama (local, free)
  Tier 2 — OmniRoute → OpenRouter free models
  Tier 3 — FCC Claude (Anthropic Haiku, cheapest paid)
  Tier 4 — Own Orchestrator (rule-based, always available)
  Tier 5 — Anthropic Full (Claude Sonnet/Opus)

Pattern mirrors EUshop provider-state-v3.json circuit breaker.
"""

import json
import os
import sys
import time
import datetime
import hashlib
import urllib.request
import urllib.error
import urllib.parse
import random
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# ── Path Config ────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATE_PATH = os.path.join(BASE_DIR, '.agent-state', 'provider-state.json')
LOG_PATH = os.path.join(BASE_DIR, '.agent-state', 'logs', 'unattended-runner.log')

# ── Load .env if present ───────────────────────────────────────────────────────
_env_path = os.path.join(BASE_DIR, '.env')
if os.path.exists(_env_path):
    with open(_env_path, 'r', encoding='utf-8') as _ef:
        for _line in _ef:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _k, _v = _line.split('=', 1)
                if _k.strip() and _v.strip() and not os.environ.get(_k.strip()):
                    os.environ[_k.strip()] = _v.strip()

# ── Provider Defaults (from env or fallbacks) ──────────────────────────────────
OLLAMA_BASE_URL    = os.environ.get('OLLAMA_BASE_URL', 'http://localhost:11434')
HERMES_MODEL       = os.environ.get('HERMES_MODEL', 'hermes3:latest')
OLLAMA_FALLBACK    = os.environ.get('OLLAMA_FALLBACK_MODEL', 'llama3.1:latest')

# Round-robin key pool parser for OpenRouter, Anthropic, Active API, and DeepSeek
_raw_openrouter_keys = [k.strip() for k in os.environ.get('OPENROUTER_API_KEYS', os.environ.get('OPENROUTER_API_KEY', '')).split(',') if k.strip() and not k.strip().startswith('sk-or-...')]
_raw_anthropic_keys  = [k.strip() for k in os.environ.get('ANTHROPIC_API_KEYS', os.environ.get('ANTHROPIC_API_KEY', '')).split(',') if k.strip() and not k.strip().startswith('sk-ant-...')]
_raw_active_keys     = [k.strip() for k in os.environ.get('ACTIVE_API_KEYS', os.environ.get('ACTIVE_API_KEY', '')).split(',') if k.strip() and not k.strip().startswith('sk-act-...')]
_raw_deepseek_keys   = [k.strip() for k in os.environ.get('DEEPSEEK_API_KEYS', os.environ.get('DEEPSEEK_API_KEY', '')).split(',') if k.strip() and not k.strip().startswith('sk-ds-...')]

_openrouter_key_idx = 0
_anthropic_key_idx  = 0
_active_key_idx     = 0
_deepseek_key_idx   = 0

def _get_next_openrouter_key() -> str:
    global _openrouter_key_idx
    if not _raw_openrouter_keys:
        return ''
    key = _raw_openrouter_keys[_openrouter_key_idx % len(_raw_openrouter_keys)]
    _openrouter_key_idx += 1
    return key

def _get_next_anthropic_key() -> str:
    global _anthropic_key_idx
    if not _raw_anthropic_keys:
        return ''
    key = _raw_anthropic_keys[_anthropic_key_idx % len(_raw_anthropic_keys)]
    _anthropic_key_idx += 1
    return key

def _get_next_active_key() -> str:
    global _active_key_idx
    if not _raw_active_keys:
        return ''
    key = _raw_active_keys[_active_key_idx % len(_raw_active_keys)]
    _active_key_idx += 1
    return key

def _get_next_deepseek_key() -> str:
    global _deepseek_key_idx
    if not _raw_deepseek_keys:
        return ''
    key = _raw_deepseek_keys[_deepseek_key_idx % len(_raw_deepseek_keys)]
    _deepseek_key_idx += 1
    return key

OMNIROUTE_URL        = os.environ.get('OMNIROUTE_BASE_URL', 'https://openrouter.ai/api/v1')
OMNIROUTE_MODEL      = os.environ.get('OMNIROUTE_MODEL', 'meta-llama/llama-3.1-8b-instruct:free')
FCC_MODEL            = os.environ.get('FCC_CLAUDE_MODEL', 'claude-haiku-4-5')
ANTHROPIC_FULL_MDL   = os.environ.get('ANTHROPIC_FULL_MODEL', 'claude-sonnet-4-5')
ACTIVE_API_BASE_URL  = os.environ.get('ACTIVE_API_BASE_URL', 'https://aiapiv2.pekpik.com/v1')
ACTIVE_API_MDL       = os.environ.get('ACTIVE_API_MODEL', 'gemini-2.5-flash')
DEEPSEEK_BASE_URL    = os.environ.get('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1')
DEEPSEEK_MDL         = os.environ.get('DEEPSEEK_MODEL', 'deepseek-chat')
CIRCUIT_THRESHOLD    = 3       # failures before circuit opens
CIRCUIT_COOLDOWN     = 180     # reduced cooldown (seconds) before retry after circuit open


# ── Structured Logging ─────────────────────────────────────────────────────────
os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)

def _log_json(level: str, msg: str, extra: dict = None):
    """Write a JSON-line log entry (EUshop unattended-runner.log standard)."""
    entry = {
        "ts": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "level": level,
        "component": "va-orchestrator",
        "msg": msg,
    }
    if extra:
        entry.update(extra)
    line = json.dumps(entry, ensure_ascii=False)
    with open(LOG_PATH, 'a', encoding='utf-8') as f:
        f.write(line + '\n')
    colour = {"INFO": "\033[0m", "WARN": "\033[93m", "ERROR": "\033[91m",
              "SUCCESS": "\033[92m", "DEBUG": "\033[90m"}.get(level, "\033[0m")
    print(f"{colour}[{level}] {msg}\033[0m")


def log_info(msg, **kw):    _log_json("INFO", msg, kw or None)
def log_warn(msg, **kw):    _log_json("WARN", msg, kw or None)
def log_error(msg, **kw):   _log_json("ERROR", msg, kw or None)
def log_success(msg, **kw): _log_json("SUCCESS", msg, kw or None)
def log_debug(msg, **kw):   _log_json("DEBUG", msg, kw or None)


# ── Provider State (circuit breaker) ──────────────────────────────────────────
PROVIDER_DEFAULTS = {
    "hermes-ollama":  {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "omniRoute":      {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "fcc-claude":     {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "active-api":     {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "deepseek-api":   {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "own-orch":       {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "anthropic-full": {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
}

from va_runtime.atomic_io import atomic_write_json, read_json_safe

def _load_state() -> dict:
    os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
    if os.path.exists(STATE_PATH):
        try:
            data = read_json_safe(STATE_PATH, default_if_missing={})
            for k, v in PROVIDER_DEFAULTS.items():
                if k not in data.get("providers", {}):
                    data.setdefault("providers", {})[k] = dict(v)
            return data
        except Exception as e:
            log_warn(f"Failed to load provider state: {e}")
    return {
        "providers": {k: dict(v) for k, v in PROVIDER_DEFAULTS.items()},
        "lastRun": "",
        "totalIdeasGenerated": 0,
        "totalIdeasPromoted": 0,
        "schemaVersion": "1.0.0",
    }

def _save_state(state: dict):
    state["lastRun"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    atomic_write_json(STATE_PATH, state)

def _is_circuit_open(p_state: dict) -> bool:
    cu = p_state.get("circuitUntil", "")
    if not cu:
        return False
    try:
        until = datetime.datetime.fromisoformat(cu)
        if until.tzinfo is None:
            until = until.replace(tzinfo=datetime.timezone.utc)
        return datetime.datetime.now(datetime.timezone.utc) < until
    except Exception:
        return False

def _record_failure(state: dict, provider: str):
    ps = state["providers"][provider]
    ps["failures"] = ps.get("failures", 0) + 1
    ps["totalCalls"] = ps.get("totalCalls", 0) + 1
    if ps["failures"] >= CIRCUIT_THRESHOLD:
        until = (datetime.datetime.now(datetime.timezone.utc) +
                 datetime.timedelta(seconds=CIRCUIT_COOLDOWN)).isoformat()
        ps["circuitUntil"] = until
        log_warn(f"Circuit OPEN for {provider} until {until}", provider=provider)
    _save_state(state)

def _record_success(state: dict, provider: str):
    ps = state["providers"][provider]
    ps["failures"] = 0
    ps["circuitUntil"] = ""
    ps["totalCalls"] = ps.get("totalCalls", 0) + 1
    ps["successCalls"] = ps.get("successCalls", 0) + 1
    ps["lastUsed"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    _save_state(state)


# ── HTTP Helper ────────────────────────────────────────────────────────────────
def _http_post(url: str, headers: dict, body: dict, timeout: int = 60) -> dict:
    data = json.dumps(body).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode('utf-8'))


# ── Tier 1: Hermes via Ollama ─────────────────────────────────────────────────
def _call_hermes(prompt: str, model: str = None) -> str:
    model = model or HERMES_MODEL
    url = f"{OLLAMA_BASE_URL}/api/generate"
    body = {"model": model, "prompt": prompt, "stream": False, "options": {"temperature": 0.7, "num_predict": 1200}}
    headers = {"Content-Type": "application/json"}
    result = _http_post(url, headers, body, timeout=90)
    return result.get("response", "").strip()


# ── Tier 2: OmniRoute → OpenRouter ────────────────────────────────────────────
def _call_omniRoute(prompt: str) -> str:
    if not _raw_openrouter_keys:
        raise ValueError("No valid OpenRouter API key configured in key pool")
    last_err = None
    for _ in range(len(_raw_openrouter_keys)):
        key = _get_next_openrouter_key()
        try:
            url = f"{OMNIROUTE_URL}/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {key}",
                "HTTP-Referer": "https://venture-atlas-os.github.io",
                "X-Title": "Venture Atlas OS",
            }
            body = {
                "model": OMNIROUTE_MODEL,
                "messages": [
                    {"role": "system", "content": "You are a rigorous startup analyst finding zero-capital business ideas."},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": 1200,
                "temperature": 0.7,
            }
            result = _http_post(url, headers, body, timeout=60)
            return result["choices"][0]["message"]["content"].strip()
        except Exception as e:
            last_err = e
            log_debug(f"OpenRouter key call failed, trying next key: {e}")
    raise last_err or ValueError("All OpenRouter API keys in pool failed")


# ── Tier 3: FCC Claude (Anthropic Haiku) ──────────────────────────────────────
def _call_fcc_claude(prompt: str) -> str:
    if not _raw_anthropic_keys:
        raise ValueError("No valid Anthropic API key configured in key pool")
    last_err = None
    for _ in range(len(_raw_anthropic_keys)):
        key = _get_next_anthropic_key()
        try:
            url = "https://api.anthropic.com/v1/messages"
            headers = {
                "Content-Type": "application/json",
                "x-api-key": key,
                "anthropic-version": "2023-06-01",
            }
            body = {
                "model": FCC_MODEL,
                "max_tokens": 1200,
                "messages": [{"role": "user", "content": prompt}],
                "system": "You are a rigorous startup analyst specialising in zero-capital, solo-founder business ideas.",
            }
            result = _http_post(url, headers, body, timeout=60)
            return result["content"][0]["text"].strip()
        except Exception as e:
            last_err = e
            log_debug(f"Anthropic Haiku key call failed, trying next key: {e}")
    raise last_err or ValueError("All Anthropic API keys in pool failed")


# ── Tier 4: Own Orchestrator (rule-based, always available) ───────────────────
_OWN_ORCH_VERTICALS = [
    # (category, subcategory, trigger, example, tags)
    ("SaaS shutdown & data portability", "export & migration tools",
     "Cloud service retirements, export format friction, and data loss risk",
     "Single-app local viewers for shut-down CRM, project management, or workflow tools",
     ["saas", "data-portability", "export"]),
    ("Product verification & evidence", "agentic commerce data",
     "Incomplete e-commerce specs and fake reviews causing high return rates",
     "Buyer-funded physical dimension, clearance, or device compatibility proof",
     ["ecommerce", "verification", "proof"]),
    ("AI evaluation & launch gates", "agent testing",
     "Unvalidated AI agents causing production failures and hallucination risks",
     "Domain-specific regression packs and citation verification suites",
     ["ai", "testing", "evaluation"]),
    ("Developer tools & infrastructure", "repository automation",
     "Repetitive maintenance, security remediation, and compliance boilerplate",
     "Automated code remediation gates and multi-agent merge coordinators",
     ["devtools", "automation", "infrastructure"]),
    ("EU Marketplace & Compliance", "regulatory automation",
     "EU Digital Product Passport, DAC7 tax reporting, and DSA notice-and-action rules",
     "Self-serve compliance verification for SME merchants and platforms",
     ["eu", "compliance", "regulation"]),
    ("Local-first software", "offline-capable tools",
     "Privacy, latency, and cost concerns driving local-run SaaS replacements",
     "Offline-first invoice management with cloud sync for freelancers",
     ["local-first", "privacy", "offline"]),
    ("Micro-SaaS niche tooling", "vertical-specific automation",
     "Generic tools missing critical niche-specific workflows",
     "Domain-specific report generators for architects, surveyors, or surveyors",
     ["micro-saas", "niche", "vertical"]),
    ("No-code / low-code automation", "workflow builders",
     "Non-technical users needing custom integrations without developers",
     "Drag-and-drop webhook pipeline builders for Shopify+Notion+Stripe",
     ["nocode", "automation", "integration"]),
    ("Research & knowledge tools", "evidence management",
     "Manual citation management and fact-checking overhead in research workflows",
     "LLM-powered citation validator and source credibility scorer",
     ["research", "knowledge", "evidence"]),
    ("Physical-digital bridge", "IoT & device automation",
     "Physical-world events that need digital tracking without custom hardware",
     "QR+NFC label systems for asset tracking in small warehouses",
     ["iot", "physical", "digital"]),
    ("B2B niche marketplaces", "matching & discovery",
     "Fragmented supplier discovery and poor matching in niche industries",
     "Verified supplier discovery for specialty food ingredients or bio materials",
     ["marketplace", "b2b", "matching"]),
    ("API wrapper & integration", "data connector",
     "Enterprise data locked in proprietary systems with no modern APIs",
     "Read-only API layer over legacy ERP exports for dashboard consumption",
     ["api", "integration", "data"]),
    ("Solo founder toolkits", "productivity automation",
     "Cognitive overload from tool-switching and manual status tracking",
     "Single-command morning briefings pulling from GitHub, email, and calendar",
     ["productivity", "solo-founder", "automation"]),
    ("Agentic commerce", "shopping agent infrastructure",
     "AI shopping agents needing structured product data beyond raw web pages",
     "Vendor-certified product spec APIs for agent-driven purchasing decisions",
     ["agentic", "commerce", "ai"]),
    ("Creator economy tooling", "monetisation & analytics",
     "Creators lacking structured revenue data across platform fragmentation",
     "Unified revenue and audience analytics dashboard for multi-platform creators",
     ["creator", "monetisation", "analytics"]),
    ("Event Operations & Marketplaces", "local replacement network",
     "Last-minute vendor, referee, or staff cancellations leaving empty slots and forfeited fees",
     "Short-notice performance-fee standby network with instant WhatsApp/SMS dispatch",
     ["event-operations", "standby-network", "performance-fee"]),
    ("Audit & Financial Forensics", "productized audit service",
     "High spending on lead sources, ad channels, or software subscriptions without ROI visibility",
     "Productized CSV/export log audit calculating true qualified lead CAC and conversion rates",
     ["audit", "financial-forensics", "lead-roi"]),
    ("Appointment & Scheduling Services", "performance revenue recovery",
     "Unfilled late cancellations creating empty appointment slots and lost income",
     "Zero-risk performance-fee waitlist activation service for appointment businesses",
     ["appointment-recovery", "waitlist", "revenue-share"]),
    ("Consumer Advocacy & Transparency", "quote normalization concierge",
     "Opaque, uncomparable estimates and legal dispute hurdles during high-stress transactions",
     "Standardized itemised quote comparison tables and EU dispute evidence dossiers",
     ["consumer-advocacy", "quote-normalizer", "transparency"]),
]

def _call_own_orchestrator(prompt: str, domain_hint: dict = None) -> str:
    """Rule-based own orchestrator — generates a structured JSON idea without external LLM."""
    if not domain_hint:
        domain_hint = random.choice(_OWN_ORCH_VERTICALS)
        domain_hint = {
            "category": domain_hint[0], "subcategory": domain_hint[1],
            "trigger": domain_hint[2], "example": domain_hint[3], "tags": domain_hint[4],
        }
    cat   = domain_hint["category"]
    subcat = domain_hint["subcategory"]
    trigger = domain_hint["trigger"]
    example = domain_hint["example"]
    adjectives = ["Lightweight", "Verified", "Automated", "Smart", "Bounded", "Rapid", "Zero-Setup"]
    nouns = ["Gate", "Engine", "Layer", "Suite", "Kit", "Toolkit", "Hub"]
    adj = random.choice(adjectives)
    noun = random.choice(nouns)
    name = f"{adj} {subcat.title()} {noun}"
    concept = (f"A self-serve, zero-capital tool that automates {trigger.lower()} "
               f"for {cat.lower()} workflows.")
    pitch = (f"When {trigger.lower()}, founders and operators lose time and money. "
             f"{name} automates {example.lower()} into a standardised deliverable "
             f"with no upfront cost and no inventory.")
    # Return as JSON string matching the LLM response format expected by the parser
    idea_struct = {
        "name": name,
        "oneSentenceConcept": concept,
        "elevatorPitch": pitch,
        "category": cat,
        "subcategory": subcat,
        "targetCustomer": "Technical founders, operators, or compliance teams",
        "problemSolved": trigger,
        "whatToBuild": example,
        "howItMakesMoney": "Fixed-scope prepaid deliverable, subscription, or unlock fee.",
        "whyCustomersPay": "Saves time, prevents loss, and provides verified, auditable evidence.",
        "startupCostMax": 50,
        "timeToMvp": "3-7 days",
        "grossMarginEstimate": 80,
        "scores": {
            "problemSeverity": 5.0,
            "frequencyOfNeed": 5.0,
            "willingnessToPay": 5.0,
            "marketDemand": 5.0,
            "speedToFirstRevenue": 5.0,
            "lowStartupCost": 5.0,
            "easeOfMvp": 5.0,
            "aiAutomationPotential": 5.0,
            "regulatoryTailwind": 5.0,
            "compoundingAsset": 5.0,
        },
        "generationMode": "deterministic-fallback",
        "evidenceStatus": "unverified",
        "promotionEligible": False,
        "requiresExternalEvidence": True,
        "tags": domain_hint.get("tags", []) + ["own-orch", "autonomous-discovered"],
        "provider": "own-orch",
    }
    return json.dumps(idea_struct)


# ── Tier 5: Anthropic Full ────────────────────────────────────────────────────
def _call_anthropic_full(prompt: str) -> str:
    if not _raw_anthropic_keys:
        raise ValueError("No valid Anthropic API key configured in key pool")
    last_err = None
    for _ in range(len(_raw_anthropic_keys)):
        key = _get_next_anthropic_key()
        try:
            url = "https://api.anthropic.com/v1/messages"
            headers = {
                "Content-Type": "application/json",
                "x-api-key": key,
                "anthropic-version": "2023-06-01",
            }
            body = {
                "model": ANTHROPIC_FULL_MDL,
                "max_tokens": 1600,
                "messages": [{"role": "user", "content": prompt}],
                "system": "You are a rigorous startup analyst specialising in zero-capital, solo-founder business ideas.",
            }
            result = _http_post(url, headers, body, timeout=90)
            return result["content"][0]["text"].strip()
        except Exception as e:
            last_err = e
            log_debug(f"Anthropic Full key call failed, trying next key: {e}")
    raise last_err or ValueError("All Anthropic API keys in pool failed")


# ── Tier 6: Active API (PekPik / Gemini proxy) ────────────────────────────────
def _call_active_api(prompt: str) -> str:
    if not _raw_active_keys:
        raise ValueError("No valid Active API key configured in key pool")
    last_err = None
    for _ in range(len(_raw_active_keys)):
        key = _get_next_active_key()
        try:
            url = f"{ACTIVE_API_BASE_URL.rstrip('/')}/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {key}",
            }
            body = {
                "model": ACTIVE_API_MDL,
                "messages": [
                    {"role": "system", "content": "You are a rigorous startup analyst finding zero-capital business ideas."},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": 1200,
                "temperature": 0.7,
            }
            result = _http_post(url, headers, body, timeout=60)
            return result["choices"][0]["message"]["content"].strip()
        except Exception as e:
            last_err = e
            log_debug(f"Active API key call failed, trying next key: {e}")
    raise last_err or ValueError("All Active API keys in pool failed")


# ── Tier 7: DeepSeek API ──────────────────────────────────────────────────────
def _call_deepseek_api(prompt: str) -> str:
    if not _raw_deepseek_keys:
        raise ValueError("No valid DeepSeek API key configured in key pool")
    last_err = None
    for _ in range(len(_raw_deepseek_keys)):
        key = _get_next_deepseek_key()
        try:
            url = f"{DEEPSEEK_BASE_URL.rstrip('/')}/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {key}",
            }
            body = {
                "model": DEEPSEEK_MDL,
                "messages": [
                    {"role": "system", "content": "You are a rigorous startup analyst finding zero-capital business ideas."},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": 1200,
                "temperature": 0.7,
            }
            result = _http_post(url, headers, body, timeout=60)
            return result["choices"][0]["message"]["content"].strip()
        except Exception as e:
            last_err = e
            log_debug(f"DeepSeek API key call failed, trying next key: {e}")
    raise last_err or ValueError("All DeepSeek API keys in pool failed")


# ── Provider Health Check ──────────────────────────────────────────────────────
def health_check() -> dict:
    """Check which providers are available. Returns dict of provider → bool."""
    results = {}
    # Hermes/Ollama
    try:
        url = f"{OLLAMA_BASE_URL}/api/tags"
        req = urllib.request.Request(url, method='GET')
        with urllib.request.urlopen(req, timeout=5) as r:
            tags = json.loads(r.read())
        model_names = [m.get("name", "") for m in tags.get("models", [])]
        results["hermes-ollama"] = any(
            HERMES_MODEL.split(":")[0] in n or OLLAMA_FALLBACK.split(":")[0] in n
            for n in model_names
        )
        log_info("Ollama available", models=model_names[:5])
    except Exception as e:
        results["hermes-ollama"] = False
        log_warn(f"Ollama not available: {e}")
    # OmniRoute
    results["omniRoute"] = len(_raw_openrouter_keys) > 0
    # FCC Claude
    results["fcc-claude"] = len(_raw_anthropic_keys) > 0
    # Active API
    results["active-api"] = len(_raw_active_keys) > 0
    # DeepSeek API
    results["deepseek-api"] = len(_raw_deepseek_keys) > 0
    # Own Orch always available
    results["own-orch"] = True
    # Anthropic Full
    results["anthropic-full"] = len(_raw_anthropic_keys) > 0
    log_info("Provider health check complete", results=results,
             openrouter_keys=len(_raw_openrouter_keys),
             anthropic_keys=len(_raw_anthropic_keys),
             active_keys=len(_raw_active_keys),
             deepseek_keys=len(_raw_deepseek_keys))
    return results


# ── Core Orchestration Call ────────────────────────────────────────────────────
PROVIDER_ORDER = ["hermes-ollama", "omniRoute", "fcc-claude", "active-api", "deepseek-api", "anthropic-full", "own-orch"]

def call_llm(prompt: str, domain_hint: dict = None, allow_own_orch: bool = True) -> tuple[str, str]:
    """
    Try each provider in tier order, respecting circuit breakers.
    Returns (response_text, provider_name_used).
    Own orchestrator is last resort and always succeeds.
    """
    state = _load_state()
    for provider in PROVIDER_ORDER:
        if provider == "own-orch" and not allow_own_orch:
            continue
        ps = state["providers"].get(provider, {})
        if _is_circuit_open(ps):
            log_debug(f"Circuit open for {provider}, skipping")
            continue
        try:
            log_info(f"Trying provider: {provider}")
            if provider == "hermes-ollama":
                try:
                    resp = _call_hermes(prompt, HERMES_MODEL)
                except Exception:
                    resp = _call_hermes(prompt, OLLAMA_FALLBACK)
            elif provider == "omniRoute":
                resp = _call_omniRoute(prompt)
            elif provider == "fcc-claude":
                resp = _call_fcc_claude(prompt)
            elif provider == "active-api":
                resp = _call_active_api(prompt)
            elif provider == "deepseek-api":
                resp = _call_deepseek_api(prompt)
            elif provider == "anthropic-full":
                resp = _call_anthropic_full(prompt)
            elif provider == "own-orch":
                resp = _call_own_orchestrator(prompt, domain_hint)
            else:
                continue
            _record_success(state, provider)
            log_success(f"Provider {provider} responded OK ({len(resp)} chars)")
            return resp, provider
        except Exception as e:
            log_warn(f"Provider {provider} failed: {e}", provider=provider)
            _record_failure(state, provider)
    # If own-orch was disabled and everything failed, enable it as absolute fallback
    log_warn("All providers failed, using own-orch as absolute fallback")
    resp = _call_own_orchestrator(prompt, domain_hint)
    _record_success(state, "own-orch")
    return resp, "own-orch"


# ── Idea Discovery Prompt Builder ──────────────────────────────────────────────
def build_idea_prompt(domain: dict, existing_names: list[str]) -> str:
    existing_sample = ", ".join(existing_names[-15:]) if existing_names else "none yet"
    return f"""You are a rigorous startup analyst. Generate ONE novel business idea for this domain:

CATEGORY: {domain['category']}
SUBCATEGORY: {domain['subcategory']}
TRIGGER: {domain['trigger']}
EXAMPLE APPROACH: {domain['example']}

CONSTRAINTS (must satisfy ALL):
- Startup cost $0-$100 maximum
- Payment received BEFORE founder expenses
- Solo-founder buildable MVP in 3-14 days
- Gross margin potential > 65%
- NOT a consulting or hourly service
- Data or workflow asset that compounds over time

EXISTING IDEAS (do NOT duplicate these): {existing_sample}

Respond ONLY with valid JSON in this exact format:
{{
  "name": "Catchy, specific product name (3-6 words)",
  "oneSentenceConcept": "One clear sentence explaining what it does",
  "elevatorPitch": "2-3 sentence pitch explaining problem + solution + why customers pay",
  "category": "{domain['category']}",
  "subcategory": "{domain['subcategory']}",
  "targetCustomer": "Specific customer description",
  "problemSolved": "The specific problem this solves",
  "whatToBuild": "Exactly what to build for MVP",
  "howItMakesMoney": "Specific revenue mechanism",
  "whyCustomersPay": "Specific reason customers pay",
  "startupCostMax": 50,
  "timeToMvp": "X-Y days",
  "grossMarginEstimate": 80,
  "scores": {{
    "problemSeverity": 8.0,
    "frequencyOfNeed": 7.5,
    "willingnessToPay": 7.8,
    "marketDemand": 8.2,
    "speedToFirstRevenue": 9.0,
    "lowStartupCost": 9.5,
    "easeOfMvp": 8.0,
    "aiAutomationPotential": 8.5,
    "regulatoryTailwind": 6.0,
    "compoundingAsset": 7.5
  }},
  "tags": ["tag1", "tag2", "tag3"],
  "provider": "llm"
}}

Return ONLY the JSON object, no other text."""


# ── JSON Extraction from LLM Response ─────────────────────────────────────────
def extract_json(text: str) -> dict | None:
    """Extract the first JSON object from LLM response text."""
    # Try direct parse first
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass
    # Try extracting JSON block
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group())
        except Exception:
            pass
    return None


# ── Standalone test ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Venture Atlas Multi-Provider Orchestrator')
    parser.add_argument('--test', action='store_true', help='Run provider health check')
    parser.add_argument('--provider', help='Force a specific provider for testing')
    args = parser.parse_args()

    if args.test:
        log_info("=== Venture Atlas Orchestrator — Provider Health Check ===")
        results = health_check()
        print("\n── Provider Availability ──")
        for p, ok in results.items():
            status = "✅ AVAILABLE" if ok else "❌ UNAVAILABLE"
            print(f"  {p:<20} {status}")
        state = _load_state()
        print("\n── Circuit Breaker Status ──")
        for p, ps in state["providers"].items():
            open_ = "🔴 OPEN" if _is_circuit_open(ps) else "🟢 CLOSED"
            print(f"  {p:<20} {open_}  failures={ps.get('failures',0)}")
        print("\n── Usage Stats ──")
        for p, ps in state["providers"].items():
            print(f"  {p:<20} total={ps.get('totalCalls',0)} success={ps.get('successCalls',0)}")
    else:
        log_info("Testing orchestration with a sample prompt...")
        test_domain = {
            "category": "Developer tools & infrastructure",
            "subcategory": "repository automation",
            "trigger": "Repetitive compliance boilerplate across many repositories",
            "example": "Automated policy enforcement gate as a GitHub App",
            "tags": ["devtools", "automation"],
        }
        prompt = build_idea_prompt(test_domain, ["Existing Tool Alpha", "Existing Tool Beta"])
        resp, provider = call_llm(prompt, test_domain)
        print(f"\n[Provider used: {provider}]\n{resp}")
