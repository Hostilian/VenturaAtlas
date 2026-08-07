"""
Venture Atlas OS — Unified Provider Router (P36-P39)
=====================================================
Multi-key rotation, safe alias logging, 429 Retry-After handling,
and fine-grained key disabling for invalid auth.
"""

import os
import sys
import json
import time
import random
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

def mask_key(key: str) -> str:
    if not key or len(key) < 8:
        return "***"
    return f"{key[:4]}...{key[-4:]}"

class ProviderRouter:
    def __init__(self):
        self.key_pools: Dict[str, List[KeyState]] = {}
        self.rr_indices: Dict[str, int] = {}
        self._init_keys()

    def _init_keys(self):
        # OpenRouter keys
        or_raw = os.environ.get("OPENROUTER_API_KEY", "")
        or_keys = [k.strip() for k in or_raw.split(",") if k.strip() and not k.strip().startswith("sk-or-...")]
        self.key_pools["openrouter"] = [KeyState(k, "openrouter", i) for i, k in enumerate(or_keys)]
        self.rr_indices["openrouter"] = 0

        # Anthropic keys
        ant_raw = os.environ.get("ANTHROPIC_API_KEY", "")
        ant_keys = [k.strip() for k in ant_raw.split(",") if k.strip() and not k.strip().startswith("sk-ant-...")]
        self.key_pools["anthropic"] = [KeyState(k, "anthropic", i) for i, k in enumerate(ant_keys)]
        self.rr_indices["anthropic"] = 0

        # DeepSeek keys
        ds_raw = os.environ.get("DEEPSEEK_API_KEY", os.environ.get("ACTIVE_API_KEY", ""))
        ds_keys = [k.strip() for k in ds_raw.split(",") if k.strip() and not k.strip().startswith("sk-ds-...")]
        self.key_pools["deepseek"] = [KeyState(k, "deepseek", i) for i, k in enumerate(ds_keys)]
        self.rr_indices["deepseek"] = 0

    def get_next_key(self, provider: str) -> Optional[KeyState]:
        pool = [ks for ks in self.key_pools.get(provider, []) if not ks.disabled and time.time() >= ks.cooldown_until]
        if not pool:
            return None
        idx = self.rr_indices.get(provider, 0) % len(pool)
        self.rr_indices[provider] = idx + 1
        return pool[idx]

    def handle_rate_limit(self, key_state: KeyState, retry_after_sec: int = 60):
        key_state.cooldown_until = time.time() + max(10, retry_after_sec)
        print(f"[WARN] Rate limit on {key_state.alias} — cooling down for {retry_after_sec}s", file=sys.stderr)

    def handle_auth_invalid(self, key_state: KeyState):
        key_state.disabled = True
        print(f"[ERROR] Auth invalid for {key_state.alias} — key disabled", file=sys.stderr)

_ROUTER = ProviderRouter()

def get_provider_router() -> ProviderRouter:
    return _ROUTER
