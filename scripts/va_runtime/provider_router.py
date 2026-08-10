"""
Venture Atlas OS — Capability-Aware Provider Scheduler & Health Manager
=======================================================================
Reads non-secret config/providers.json. Selects providers based on:
1. Required task capabilities (e.g., classification, reasoning, research, adversarial_review)
2. Provider health & circuit breaker state
3. Cost class & latency preference
4. Key pool availability (round-robin with key masking & error tracking)
5. Graceful fallback to own-orch (tier 0 rule-based engine)
"""

import os
import sys
import json
import time
import datetime
import urllib.request
import urllib.error
from typing import Tuple, Dict, Any, List, Optional
from .atomic_io import atomic_write_json, read_json_safe

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONFIG_PATH = os.path.join(ROOT, "config", "providers.json")

class KeyState:
    def __init__(self, key: str, provider: str, index: int):
        self.key = key
        self.alias = f"{provider}-{index+1:02d}"
        self.disabled = False
        self.cooldown_until = 0.0

KNOWN_PLACEHOLDERS = {
    "changeme", "your-key-here", "example", "test-key", "placeholder",
    "sk-or-...", "sk-ant-...", "sk-act-...", "sk-ds-...", "sk-...", "***"
}

def is_placeholder_key(key: str) -> bool:
    if not key or len(key) < 8:
        return True
    k_lower = key.strip().lower()
    if k_lower in KNOWN_PLACEHOLDERS:
        return True
    if k_lower.endswith("...") or "your_key" in k_lower:
        return True
    return False

def mask_key(key: str) -> str:
    if not key or len(key) < 8:
        return "***"
    return f"{key[:4]}...{key[-4:]}"

class NoEligibleProviderError(RuntimeError):
    """Raised when no provider satisfies task capability or availability constraints."""
    pass

class CapabilityProviderScheduler:
    def __init__(self, config_path: str = CONFIG_PATH):
        self.config_path = config_path
        self.registry: Dict[str, Any] = {}
        self.key_pools: Dict[str, List[KeyState]] = {}
        self.rr_indices: Dict[str, int] = {}
        self._load_config()
        self._init_keys()

    def _load_config(self):
        if os.path.exists(self.config_path):
            try:
                self.registry = read_json_safe(self.config_path, default_if_missing={})
            except Exception:
                self.registry = {}
        if "providers" not in self.registry:
            self.registry["providers"] = {}

    def _init_keys(self):
        providers = self.registry.get("providers", {})
        for p_id, p_cfg in providers.items():
            if not p_cfg.get("requiresApiKey", False):
                continue
            key_pool_env = p_cfg.get("keyPoolEnv", "")
            legacy_key_env = p_cfg.get("legacyKeyEnv", "")
            raw_keys = ""
            if key_pool_env and os.environ.get(key_pool_env):
                raw_keys = os.environ.get(key_pool_env, "")
            elif legacy_key_env and os.environ.get(legacy_key_env):
                raw_keys = os.environ.get(legacy_key_env, "")
            
            keys = [k.strip() for k in raw_keys.split(",") if k.strip() and not is_placeholder_key(k.strip())]
            self.key_pools[p_id] = [KeyState(k, p_id, i) for i, k in enumerate(keys)]
            self.rr_indices[p_id] = 0

    def get_next_key(self, provider_id: str) -> Optional[KeyState]:
        pool = [ks for ks in self.key_pools.get(provider_id, []) if not ks.disabled and time.time() >= ks.cooldown_until]
        if not pool:
            return None
        idx = self.rr_indices.get(provider_id, 0) % len(pool)
        self.rr_indices[provider_id] = idx + 1
        return pool[idx]

    def select_providers_for_task(self, required_capabilities: List[str] = None, max_cost_class: int = 3, allow_own_orch: bool = True, match_mode: str = "all", requires_external_evidence: bool = False) -> List[str]:
        """
        Select ordered list of provider IDs matching task capabilities, sorted by cost class and health.
        match_mode: 'any' (anyOf) or 'all' (allOf)
        """
        self._load_config()
        providers = self.registry.get("providers", {})
        candidates = []
        req_caps = set(required_capabilities or [])

        for p_id, p_cfg in providers.items():
            if p_id == "own-orch" and (not allow_own_orch or requires_external_evidence):
                continue
            if p_cfg.get("requiresApiKey", False) and len(self.key_pools.get(p_id, [])) == 0:
                continue
            p_cost = p_cfg.get("costClass", 0)
            if p_cost > max_cost_class:
                continue

            p_caps = set(p_cfg.get("capabilities", []))
            if requires_external_evidence and not p_cfg.get("webAccess", False):
                continue
            if req_caps:
                if match_mode == "all":
                    if not req_caps.issubset(p_caps):
                        continue
                else:
                    if not req_caps.intersection(p_caps):
                        continue

            candidates.append((p_cost, p_cfg.get("tier", 99), p_id))

        # Sort by cost class ascending, then tier ascending
        candidates.sort(key=lambda x: (x[0], x[1]))
        sorted_ids = [c[2] for c in candidates]

        own_caps = set(providers.get("own-orch", {}).get("capabilities", []))
        own_matches = not req_caps or (req_caps.issubset(own_caps) if match_mode == "all" else bool(req_caps.intersection(own_caps)))
        if allow_own_orch and not requires_external_evidence and own_matches and "own-orch" not in sorted_ids:
            sorted_ids.append("own-orch")

        if requires_external_evidence and not sorted_ids:
            raise NoEligibleProviderError("BLOCKED_NO_ELIGIBLE_RESEARCH_PROVIDER: Task requires external evidence but no eligible external LLM provider key is active.")

        # Emit degraded mode warning if only own-orch is active
        has_external_keys = any(len(pool) > 0 for p_id, pool in self.key_pools.items() if p_id != "own-orch")
        if not has_external_keys and allow_own_orch and not requires_external_evidence:
            print("[DEGRADED MODE] No external LLM keys configured. Pipeline is operating in deterministic rule engine mode (own-orch).", file=sys.stderr)

        return sorted_ids

    def handle_rate_limit(self, key_state: KeyState, retry_after_sec: int = 60):
        key_state.cooldown_until = time.time() + max(10, retry_after_sec)
        print(f"[WARN] Rate limit on {key_state.alias} — cooling down for {retry_after_sec}s", file=sys.stderr)

    def handle_auth_invalid(self, key_state: KeyState):
        key_state.disabled = True
        print(f"[ERROR] Auth invalid for {key_state.alias} — key disabled", file=sys.stderr)

_SCHEDULER = CapabilityProviderScheduler()

def get_provider_scheduler() -> CapabilityProviderScheduler:
    return _SCHEDULER

def get_provider_router():
    return _SCHEDULER
