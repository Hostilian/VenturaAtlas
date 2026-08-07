"""
Venture Atlas OS — Per-Key Health Manager
===========================================
Manages health states, cooldowns, and weighted capacity scoring across credential aliases.
"""

import os
import time
import datetime
import threading
from typing import Dict, List, Optional
from .provider_models import KeyState
from .provider_errors import ErrorCategory, classify_error
from .atomic_io import atomic_write_json, read_json_safe

_HEALTH_LOCK = threading.Lock()
_KEY_STATES: Dict[str, KeyState] = {}
STATE_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.agent-state', 'key-health-state.json')

def register_key_alias(alias: str, provider: str, max_concurrent: int = 3, daily_budget_usd: float = 50.0) -> KeyState:
    """Register or retrieve a KeyState by alias."""
    with _HEALTH_LOCK:
        if alias not in _KEY_STATES:
            _KEY_STATES[alias] = KeyState(
                alias=alias,
                provider=provider,
                max_concurrent=max_concurrent,
                daily_budget_usd=daily_budget_usd
            )
        return _KEY_STATES[alias]

def record_key_success(alias: str, latency_ms: float = 200.0) -> None:
    """Record a successful request on a key alias."""
    with _HEALTH_LOCK:
        ks = _KEY_STATES.get(alias)
        if ks:
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            ks.last_success_at = now_iso
            ks.last_used_at = now_iso
            ks.healthy = True
            ks.rolling_latency_ms = round(ks.rolling_latency_ms * 0.8 + latency_ms * 0.2, 2)
            ks.rolling_429_rate = round(ks.rolling_429_rate * 0.9, 3)
            ks.rolling_5xx_rate = round(ks.rolling_5xx_rate * 0.9, 3)

def record_key_error(alias: str, err_category: ErrorCategory, cooldown_seconds: int = 60) -> None:
    """Record a key error and trigger cooldown or disablement as appropriate."""
    with _HEALTH_LOCK:
        ks = _KEY_STATES.get(alias)
        if not ks:
            return
        now = datetime.datetime.now(datetime.timezone.utc)
        ks.last_error_at = now.isoformat()
        
        if err_category == ErrorCategory.AUTH_INVALID:
            ks.enabled = False
            ks.healthy = False
        elif err_category in (ErrorCategory.RATE_LIMITED, ErrorCategory.QUOTA_EXHAUSTED):
            ks.cooldown_until = (now + datetime.timedelta(seconds=cooldown_seconds)).isoformat()
            ks.rolling_429_rate = min(1.0, ks.rolling_429_rate + 0.2)
        elif err_category == ErrorCategory.PROVIDER_5XX:
            ks.cooldown_until = (now + datetime.timedelta(seconds=30)).isoformat()
            ks.rolling_5xx_rate = min(1.0, ks.rolling_5xx_rate + 0.2)

def select_best_key(provider: str) -> Optional[str]:
    """Select the best eligible key alias for a given provider based on capacity & latency."""
    with _HEALTH_LOCK:
        eligible = [ks for ks in _KEY_STATES.values() if ks.provider == provider and ks.is_eligible()]
        if not eligible:
            return None
        # Sort by active requests asc, then rolling latency asc
        eligible.sort(key=lambda k: (k.active_requests, k.rolling_latency_ms))
        return eligible[0].alias
