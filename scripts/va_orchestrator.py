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
import ssl

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# ── Path Config ────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATE_PATH = os.path.join(BASE_DIR, '.agent-state', 'provider-state.json')
STATE_LOCK_PATH = os.path.join(BASE_DIR, '.agent-state', 'locks', 'provider-state.lock')
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
OLLAMA_TIMEOUT_SECONDS = max(30, int(os.environ.get('OLLAMA_TIMEOUT_SECONDS', '180')))
OLLAMA_NUM_PREDICT = max(64, int(os.environ.get('OLLAMA_NUM_PREDICT', '512')))
OLLAMA_SLOT_WAIT_SECONDS = max(0.0, float(os.environ.get('OLLAMA_SLOT_WAIT_SECONDS', '1')))

from va_runtime.provider_router import (
    NoEligibleProviderError,
    get_provider_scheduler,
)

def _eligible_key_count(provider_id: str) -> int:
    """Return call-path eligible keys, not merely configured keys."""
    scheduler = get_provider_scheduler()
    now = time.time()
    return sum(
        1 for key_state in scheduler.key_pools.get(provider_id, [])
        if not key_state.disabled and now >= key_state.cooldown_until
    )


def _get_next_provider_key(provider_id: str):
    key_state = get_provider_scheduler().get_next_key(provider_id)
    if key_state is None:
        raise ValueError(f"No eligible API key available for {provider_id}")
    return key_state


def _handle_key_http_failure(key_state, error: Exception) -> None:
    """Update the exact key used when the provider reports auth/rate failures."""
    if not isinstance(error, urllib.error.HTTPError):
        return
    scheduler = get_provider_scheduler()
    if error.code in (401, 403):
        scheduler.handle_auth_invalid(key_state)
    elif error.code == 429:
        retry_after = 60
        try:
            retry_after = int(error.headers.get("Retry-After", retry_after))
        except (AttributeError, TypeError, ValueError):
            pass
        scheduler.handle_rate_limit(key_state, retry_after)

OMNIROUTE_URL        = os.environ.get('OMNIROUTE_BASE_URL', 'https://openrouter.ai/api/v1')
OMNIROUTE_MODEL      = os.environ.get('OMNIROUTE_MODEL', 'openrouter/free')
FCC_MODEL            = os.environ.get('FCC_CLAUDE_MODEL', 'claude-haiku-4-5')
ANTHROPIC_FULL_MDL   = os.environ.get('ANTHROPIC_FULL_MODEL', 'claude-sonnet-4-5')
ACTIVE_API_BASE_URL  = os.environ.get('ACTIVE_API_BASE_URL', 'https://aiapiv2.pekpik.com/v1')
ACTIVE_API_MDL       = os.environ.get('ACTIVE_API_MODEL', 'gemini-2.5-flash')
DEEPSEEK_BASE_URL    = os.environ.get('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1')
DEEPSEEK_MDL         = os.environ.get('DEEPSEEK_MODEL', 'deepseek-chat')
NVIDIA_NIM_URL       = os.environ.get('NVIDIA_NIM_BASE_URL', 'https://integrate.api.nvidia.com/v1')
NVIDIA_NIM_MDL       = os.environ.get('NVIDIA_NIM_MODEL', 'meta/llama-3.1-8b-instruct')
COHERE_URL           = os.environ.get('COHERE_BASE_URL', 'https://api.cohere.com/v1')
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
    "nvidia-nim":     {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "cohere-api":     {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "hermes-ollama":  {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "omniRoute":      {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "fcc-claude":     {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "active-api":     {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "deepseek-api":   {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "own-orch":       {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
    "anthropic-full": {"failures": 0, "circuitUntil": "", "lastUsed": "", "totalCalls": 0, "successCalls": 0},
}

def _get_ssl_context():
    """Return a certificate-verifying TLS context. Never silently disable TLS."""
    return ssl.create_default_context()

from va_runtime.atomic_io import atomic_write_json, read_json_safe
from va_runtime.process_lock import process_file_lock

import threading
_state_lock = threading.Lock()
_hermes_inference_slot = threading.BoundedSemaphore(value=1)


class HermesBusyError(RuntimeError):
    """Raised when the single laptop-local inference slot is already occupied."""

def _load_state() -> dict:
    with _state_lock:
        os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
        if os.path.exists(STATE_PATH):
            try:
                data = read_json_safe(STATE_PATH, default_if_missing={})
                for k, v in PROVIDER_DEFAULTS.items():
                    if k not in data.get("providers", {}):
                        data.setdefault("providers", {})[k] = dict(v)
                return data
            except Exception as e:
                ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d_%H%M%S")
                bak_path = f"{STATE_PATH}.corrupt.{ts}"
                try:
                    os.replace(STATE_PATH, bak_path)
                    log_warn(f"Corrupt provider state detected; backed up to '{bak_path}': {e}")
                except Exception as bak_err:
                    log_error(f"Failed to back up corrupt provider state: {bak_err}")
        return {
            "providers": {k: dict(v) for k, v in PROVIDER_DEFAULTS.items()},
            "lastRun": "",
            "totalIdeasGenerated": 0,
            "totalIdeasPromoted": 0,
            "schemaVersion": "1.0.0",
        }

def _save_state(state: dict):
    with _state_lock:
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
    try:
        with process_file_lock(STATE_LOCK_PATH, timeout_seconds=5):
            current = _load_state()
            ps = current["providers"][provider]
            ps["failures"] = ps.get("failures", 0) + 1
            ps["totalCalls"] = ps.get("totalCalls", 0) + 1
            if ps["failures"] >= CIRCUIT_THRESHOLD:
                until = (datetime.datetime.now(datetime.timezone.utc) +
                         datetime.timedelta(seconds=CIRCUIT_COOLDOWN)).isoformat()
                ps["circuitUntil"] = until
                log_warn(f"Circuit OPEN for {provider} until {until}", provider=provider)
            _save_state(current)
    except TimeoutError:
        log_warn(f"Provider-state telemetry lock busy after failure for {provider}; call outcome preserved")

def _record_success(state: dict, provider: str):
    try:
        with process_file_lock(STATE_LOCK_PATH, timeout_seconds=5):
            current = _load_state()
            ps = current["providers"][provider]
            ps["failures"] = 0
            ps["circuitUntil"] = ""
            ps["totalCalls"] = ps.get("totalCalls", 0) + 1
            ps["successCalls"] = ps.get("successCalls", 0) + 1
            ps["lastUsed"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            _save_state(current)
    except TimeoutError:
        log_warn(f"Provider-state telemetry lock busy after success for {provider}; response preserved")


# ── HTTP Helper ────────────────────────────────────────────────────────────────
def _http_post(url: str, headers: dict, body: dict, timeout: int = 60) -> dict:
    data = json.dumps(body).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    ctx = _get_ssl_context()
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
        return json.loads(resp.read().decode('utf-8'))


# ── Tier 0: NVIDIA NIM ─────────────────────────────────────────────────────────
def _call_nvidia_nim(prompt: str) -> str:
    attempts = _eligible_key_count("nvidia-nim")
    if not attempts:
        raise ValueError("No valid NVIDIA NIM API key configured in key pool")
    last_err = None
    for _ in range(attempts):
        key_state = _get_next_provider_key("nvidia-nim")
        try:
            url = f"{NVIDIA_NIM_URL.rstrip('/')}/chat/completions"
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {key_state.key}"}
            body = {
                "model": NVIDIA_NIM_MDL,
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
            _handle_key_http_failure(key_state, e)
            last_err = e
            log_debug(f"NVIDIA NIM key call failed: {e}")
    raise last_err or ValueError("All NVIDIA NIM API keys in pool failed")


# ── Tier 0.5: Cohere API ───────────────────────────────────────────────────────
def _call_cohere_api(prompt: str) -> str:
    attempts = _eligible_key_count("cohere-api")
    if not attempts:
        raise ValueError("No valid Cohere API key configured in key pool")
    last_err = None
    for _ in range(attempts):
        key_state = _get_next_provider_key("cohere-api")
        try:
            url = f"{COHERE_URL.rstrip('/')}/chat"
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {key_state.key}"}
            body = {"message": prompt}
            result = _http_post(url, headers, body, timeout=60)
            return result.get("text", "").strip()
        except Exception as e:
            _handle_key_http_failure(key_state, e)
            last_err = e
            log_debug(f"Cohere API key call failed: {e}")
    raise last_err or ValueError("All Cohere API keys in pool failed")


# ── Tier 1: Hermes via Ollama ─────────────────────────────────────────────────
def _call_hermes(prompt: str, model: str = None) -> str:
    model = model or HERMES_MODEL
    acquired = _hermes_inference_slot.acquire(timeout=OLLAMA_SLOT_WAIT_SECONDS)
    if not acquired:
        raise HermesBusyError("Hermes local inference slot is busy")
    try:
        url = f"{OLLAMA_BASE_URL}/api/generate"
        body = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.7, "num_predict": OLLAMA_NUM_PREDICT},
        }
        headers = {"Content-Type": "application/json"}
        result = _http_post(url, headers, body, timeout=OLLAMA_TIMEOUT_SECONDS)
        return result.get("response", "").strip()
    finally:
        _hermes_inference_slot.release()


def _ollama_has_model(model: str) -> bool:
    """Return true only when the requested Ollama model is locally installed."""
    url = f"{OLLAMA_BASE_URL}/api/tags"
    req = urllib.request.Request(url, method='GET')
    with urllib.request.urlopen(req, timeout=3) as response:
        payload = json.loads(response.read().decode('utf-8'))
    return model in {entry.get("name") for entry in payload.get("models", [])}


def _call_hermes_with_fallback(prompt: str) -> str:
    """Call Hermes and retry only when a distinct fallback model is installed."""
    try:
        return _call_hermes(prompt, HERMES_MODEL)
    except HermesBusyError:
        # Other parallel workers degrade immediately rather than queueing several
        # long CPU-bound generations against one laptop-local model.
        raise
    except Exception as primary_error:
        if not OLLAMA_FALLBACK or OLLAMA_FALLBACK == HERMES_MODEL:
            raise
        try:
            fallback_available = _ollama_has_model(OLLAMA_FALLBACK)
        except Exception:
            fallback_available = False
        if not fallback_available:
            log_warn(
                f"Hermes primary call failed; configured fallback model "
                f"'{OLLAMA_FALLBACK}' is not installed"
            )
            raise primary_error
        return _call_hermes(prompt, OLLAMA_FALLBACK)


# ── Tier 2: OmniRoute → OpenRouter ────────────────────────────────────────────
def _call_omniRoute(prompt: str) -> str:
    attempts = _eligible_key_count("omniRoute")
    if not attempts:
        raise ValueError("No valid OpenRouter API key configured in key pool")
    last_err = None
    endpoints = [OMNIROUTE_URL, "https://openrouter.ai/api/v1"]
    for base_url in endpoints:
        for _ in range(attempts):
            key_state = _get_next_provider_key("omniRoute")
            try:
                url = f"{base_url.rstrip('/')}/chat/completions"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {key_state.key}",
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
                _handle_key_http_failure(key_state, e)
                last_err = e
                log_debug(f"OpenRouter key call failed on {base_url}: {e}")
    raise last_err or ValueError("All OpenRouter API keys in pool failed")


# ── Tier 3: FCC Claude (Anthropic Haiku) ──────────────────────────────────────
def _call_fcc_claude(prompt: str) -> str:
    attempts = _eligible_key_count("fcc-claude")
    if not attempts:
        raise ValueError("No valid Anthropic API key configured in key pool")
    last_err = None
    for _ in range(attempts):
        key_state = _get_next_provider_key("fcc-claude")
        try:
            url = "https://api.anthropic.com/v1/messages"
            headers = {
                "Content-Type": "application/json",
                "x-api-key": key_state.key,
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
            _handle_key_http_failure(key_state, e)
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
        "hypothesesNote": "deterministic-fallback hypothesis unverified",
        "scores": {},
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
    attempts = _eligible_key_count("anthropic-full")
    if not attempts:
        raise ValueError("No valid Anthropic API key configured in key pool")
    last_err = None
    for _ in range(attempts):
        key_state = _get_next_provider_key("anthropic-full")
        try:
            url = "https://api.anthropic.com/v1/messages"
            headers = {
                "Content-Type": "application/json",
                "x-api-key": key_state.key,
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
            _handle_key_http_failure(key_state, e)
            last_err = e
            log_debug(f"Anthropic Full key call failed, trying next key: {e}")
    raise last_err or ValueError("All Anthropic API keys in pool failed")


# ── Tier 6: Active API (PekPik / Gemini proxy) ────────────────────────────────
def _call_active_api(prompt: str) -> str:
    attempts = _eligible_key_count("active-api")
    if not attempts:
        raise ValueError("No valid Active API key configured in key pool")
    last_err = None
    for _ in range(attempts):
        key_state = _get_next_provider_key("active-api")
        try:
            url = f"{ACTIVE_API_BASE_URL.rstrip('/')}/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {key_state.key}",
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
            _handle_key_http_failure(key_state, e)
            last_err = e
            log_debug(f"Active API key call failed, trying next key: {e}")
    raise last_err or ValueError("All Active API keys in pool failed")


# ── Tier 7: DeepSeek API ──────────────────────────────────────────────────────
def _call_deepseek_api(prompt: str) -> str:
    attempts = _eligible_key_count("deepseek-api")
    if not attempts:
        raise ValueError("No valid DeepSeek API key configured in key pool")
    last_err = None
    for _ in range(attempts):
        key_state = _get_next_provider_key("deepseek-api")
        try:
            url = f"{DEEPSEEK_BASE_URL.rstrip('/')}/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {key_state.key}",
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
            _handle_key_http_failure(key_state, e)
            last_err = e
            log_debug(f"DeepSeek API key call failed, trying next key: {e}")
    raise last_err or ValueError("All DeepSeek API keys in pool failed")


# ── Provider Health Check ──────────────────────────────────────────────────────
def health_check(probe_external: bool = False) -> dict:
    """Check providers; remote providers are healthy only after a real probe."""
    results = {}
    external_providers = ["nvidia-nim", "cohere-api", "omniRoute", "fcc-claude", "active-api", "deepseek-api", "anthropic-full"]
    for provider in external_providers:
        configured = _eligible_key_count(provider) > 0
        if not configured:
            results[provider] = False
        elif not probe_external:
            results[provider] = False
            log_warn(f"{provider} has eligible keys but is UNVERIFIED until a real probe is requested")
        else:
            results[provider] = _call_single_provider(provider, "Health probe. Reply with OK.") is not None
    # Hermes/Ollama
    try:
        results["hermes-ollama"] = _ollama_has_model(HERMES_MODEL)
        if not results["hermes-ollama"]:
            log_warn(f"Ollama is reachable but required model '{HERMES_MODEL}' is not installed")
    except Exception as e:
        results["hermes-ollama"] = False
        log_warn(f"Ollama not available: {e}")
    # Own Orch always available
    results["own-orch"] = True
    results["healthProbe"] = probe_external
    log_info("Provider health check complete", results=results,
             nvidia_eligible_keys=_eligible_key_count("nvidia-nim"),
             cohere_eligible_keys=_eligible_key_count("cohere-api"),
             openrouter_eligible_keys=_eligible_key_count("omniRoute"),
             fcc_eligible_keys=_eligible_key_count("fcc-claude"),
             anthropic_full_eligible_keys=_eligible_key_count("anthropic-full"),
             active_eligible_keys=_eligible_key_count("active-api"),
             deepseek_eligible_keys=_eligible_key_count("deepseek-api"))
    return results


# ── Core Orchestration Call ────────────────────────────────────────────────────
DEFAULT_PROVIDER_ORDER = ["nvidia-nim", "cohere-api", "hermes-ollama", "omniRoute", "fcc-claude", "active-api", "deepseek-api", "anthropic-full", "own-orch"]

from concurrent.futures import ThreadPoolExecutor, as_completed

def _call_single_provider(provider: str, prompt: str, domain_hint: dict = None) -> tuple[str, str] | None:
    """Execute a single provider call with exception tracking."""
    state = _load_state()
    ps = state["providers"].get(provider, {})
    if _is_circuit_open(ps):
        return None
    try:
        if provider == "nvidia-nim":
            resp = _call_nvidia_nim(prompt)
        elif provider == "cohere-api":
            resp = _call_cohere_api(prompt)
        elif provider == "hermes-ollama":
            resp = _call_hermes_with_fallback(prompt)
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
            return None
        _record_success(state, provider)
        log_success(f"[PARALLEL AI] Provider '{provider}' responded OK ({len(resp)} chars)")
        return resp, provider
    except HermesBusyError as e:
        # Local capacity contention is not a provider outage and must not open the
        # Hermes circuit. This worker can safely use the deterministic fallback.
        log_debug(f"[PARALLEL AI] Provider '{provider}' deferred: {e}")
        return None
    except Exception as e:
        log_debug(f"[PARALLEL AI] Provider '{provider}' attempt failed: {e}")
        _record_failure(state, provider)
        return None

def call_llm_parallel(prompt: str, domain_hint: dict = None, allow_own_orch: bool = True,
                      required_capabilities: list[str] = None, max_cost_class: int = 1,
                      match_mode: str = "all", requires_external_evidence: bool = False) -> tuple[str, str]:
    """
    Query a bounded, capability/key/cost-qualified provider fanout. Candidate order is
    rotated between tasks so configured providers share useful work without redundant,
    unbounded paid calls.
    """
    credit_safe = os.environ.get("VA_CREDIT_SAFE_MODE", "0").lower() in ("1", "true", "yes")
    if credit_safe:
        max_cost_class = 0
    state = _load_state()
    scheduler = get_provider_scheduler()
    providers_to_try = scheduler.select_providers_for_task(
        required_capabilities=required_capabilities,
        max_cost_class=max_cost_class,
        allow_own_orch=allow_own_orch,
        match_mode=match_mode,
        requires_external_evidence=requires_external_evidence,
    )
    providers_to_try = [p for p in providers_to_try if not _is_circuit_open(state["providers"].get(p, {}))]
    external = [p for p in providers_to_try if p != "own-orch"]
    if external:
        # Stable prompt sharding survives the generator's bounded child processes and
        # spreads distinct tasks through the full eligible provider pool.
        offset = int(hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:8], 16) % len(external)
        external = external[offset:] + external[:offset]
    fanout = 1 if credit_safe else max(1, int(os.environ.get("VA_PROVIDER_FANOUT", "2")))
    providers_to_try = external[:fanout]
    if allow_own_orch and not providers_to_try and not required_capabilities and not requires_external_evidence:
        providers_to_try.append("own-orch")

    if not providers_to_try:
        raise NoEligibleProviderError(f"No provider satisfies capabilities {required_capabilities or []}")

    log_info(f"[BOUNDED PARALLEL AI] Launching {len(providers_to_try)} eligible providers: {', '.join(providers_to_try)}")

    executor = ThreadPoolExecutor(max_workers=len(providers_to_try))
    futures = {}
    try:
        futures = {executor.submit(_call_single_provider, p, prompt, domain_hint): p for p in providers_to_try}
        for future in as_completed(futures):
            res = future.result()
            if res:
                for pending in futures:
                    if pending is not future:
                        pending.cancel()
                return res
    finally:
        # A valid fast response must not wait for unrelated slow providers. Running
        # HTTP calls are allowed to finish in their worker threads, but no longer
        # delay this task's decision path.
        executor.shutdown(wait=False, cancel_futures=True)

    if not allow_own_orch or required_capabilities or requires_external_evidence:
        raise NoEligibleProviderError("All eligible parallel AI calls failed; fallback cannot satisfy the declared contract")

    log_warn("[PARALLEL AI ENGINE] All parallel calls failed, invoking own-orch fallback")
    resp = _call_own_orchestrator(prompt, domain_hint)
    _record_success(state, "own-orch")
    return resp, "own-orch"

def call_llm(prompt: str, domain_hint: dict = None, allow_own_orch: bool = True,
             required_capabilities: list[str] = None, max_cost_class: int = 3,
             match_mode: str = "all", requires_external_evidence: bool = False) -> tuple[str, str]:
    """
    Try providers matched by capabilities and cost budget, respecting circuit breakers.
    If PARALLEL_AI_ORCHESTRATION=1 is set, queries all providers simultaneously.
    """
    if os.environ.get('VA_CREDIT_SAFE_MODE', '0').lower() in ('1', 'true', 'yes'):
        max_cost_class = 0
    if os.environ.get('PARALLEL_AI_ORCHESTRATION', '0') in ('1', 'true', 'True'):
        return call_llm_parallel(prompt, domain_hint, allow_own_orch, required_capabilities,
                                 max_cost_class, match_mode, requires_external_evidence)

    state = _load_state()
    scheduler = get_provider_scheduler()
    candidate_providers = scheduler.select_providers_for_task(
        required_capabilities=required_capabilities,
        max_cost_class=max_cost_class,
        allow_own_orch=allow_own_orch,
        match_mode=match_mode,
        requires_external_evidence=requires_external_evidence,
    )
    if not candidate_providers:
        raise NoEligibleProviderError(f"No provider matched capabilities {required_capabilities or []}")

    for provider in candidate_providers:
        if provider == "own-orch" and not allow_own_orch:
            continue
        ps = state["providers"].get(provider, {})
        if _is_circuit_open(ps):
            log_debug(f"Circuit open for {provider}, skipping")
            continue
        try:
            log_info(f"Trying provider: {provider}")
            if provider == "nvidia-nim":
                resp = _call_nvidia_nim(prompt)
            elif provider == "cohere-api":
                resp = _call_cohere_api(prompt)
            elif provider == "hermes-ollama":
                resp = _call_hermes_with_fallback(prompt)
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
        except HermesBusyError as e:
            log_debug(f"Provider {provider} deferred without circuit penalty: {e}")
            continue
        except Exception as e:
            log_warn(f"Provider {provider} failed: {e}", provider=provider)
            _record_failure(state, provider)

    if not allow_own_orch or required_capabilities or requires_external_evidence:
        raise NoEligibleProviderError(
            "All eligible providers failed; deterministic fallback cannot satisfy "
            f"capabilities={required_capabilities or []}, external_evidence={requires_external_evidence}"
        )

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
        results = health_check(probe_external=True)
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
        
        # Test NoEligibleProviderError when allow_own_orch is False and no external keys exist
        try:
            call_llm("test prompt", allow_own_orch=False, required_capabilities=["non_existent_capability_12345"])
            print("[FAIL] Expected NoEligibleProviderError when allow_own_orch=False and no matching provider exists")
            sys.exit(1)
        except NoEligibleProviderError:
            print("\n── Unit Tests ──")
            print("  NoEligibleProviderError Gate ✅ PASSED")
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
