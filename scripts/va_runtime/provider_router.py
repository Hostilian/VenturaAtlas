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
AGENT_SYSTEM_PROVIDER_REGISTRY_PATH = os.path.join(ROOT, ".agent-system", "provider-registry.json")

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
    def __init__(self, config_path: str = CONFIG_PATH, registry_path: str = AGENT_SYSTEM_PROVIDER_REGISTRY_PATH):
        self.config_path = config_path
        self.registry_path = registry_path
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
        execution_scope = os.environ.get(
            "VA_EXECUTION_SCOPE",
            "local-windows" if os.name == "nt" else "self-hosted",
        ).strip()

        for p_id, p_cfg in providers.items():
            if p_id == "own-orch" and (not allow_own_orch or requires_external_evidence):
                continue
            if p_cfg.get("requiresApiKey", False):
                eligible_keys = [
                    key_state for key_state in self.key_pools.get(p_id, [])
                    if not key_state.disabled and time.time() >= key_state.cooldown_until
                ]
                if not eligible_keys:
                    continue
            p_cost = p_cfg.get("costClass", 0)
            if p_cost > max_cost_class:
                continue
            allowed_scopes = set(p_cfg.get("executionScopes", []))
            if allowed_scopes and execution_scope not in allowed_scopes:
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
        has_external_keys = any(
            any(not key_state.disabled and time.time() >= key_state.cooldown_until for key_state in pool)
            for p_id, pool in self.key_pools.items()
            if p_id != "own-orch"
        )
        if not has_external_keys and allow_own_orch and not requires_external_evidence:
            print("[DEGRADED MODE] No external LLM keys configured. Pipeline is operating in deterministic rule engine mode (own-orch).", file=sys.stderr)

        return sorted_ids

    def handle_rate_limit(self, key_state: KeyState, retry_after_sec: int = 60):
        cooldown_until = time.time() + max(10, retry_after_sec)
        for pool in self.key_pools.values():
            for candidate in pool:
                if candidate.key == key_state.key:
                    candidate.cooldown_until = cooldown_until
        print(f"[WARN] Rate limit on {key_state.alias} — cooling down for {retry_after_sec}s", file=sys.stderr)

    def handle_auth_invalid(self, key_state: KeyState):
        for pool in self.key_pools.values():
            for candidate in pool:
                if candidate.key == key_state.key:
                    candidate.disabled = True
        print(f"[ERROR] Auth invalid for {key_state.alias} — key disabled", file=sys.stderr)

    def check_health_freshness(self, timestamp_iso: str, max_age_hours: float = 24.0) -> Tuple[bool, str]:
        """Verify that a recorded health check timestamp is not stale."""
        if not timestamp_iso:
            return False, "MISSING_TIMESTAMP"
        try:
            ts = datetime.datetime.fromisoformat(timestamp_iso.replace("Z", "+00:00"))
            now = datetime.datetime.now(datetime.timezone.utc)
            age_hours = (now - ts).total_seconds() / 3600.0
            if age_hours > max_age_hours:
                return False, f"STALE_{age_hours:.1f}H_OLD"
            return True, "FRESH"
        except Exception as e:
            return False, f"INVALID_FORMAT_{e}"

    def _registry_health(self, max_stale_hours: float) -> Dict[str, Any]:
        """Read live health receipts and expose stale state explicitly."""
        if not os.path.exists(self.registry_path):
            return {"status": "MISSING_UNVERIFIED", "checkedAt": None, "ageHours": None}
        try:
            registry = read_json_safe(self.registry_path, default_if_missing={})
            checked_at = registry.get("lastHealthCheck")
            fresh, reason = self.check_health_freshness(checked_at, max_stale_hours)
            age_hours = None
            if checked_at:
                ts = datetime.datetime.fromisoformat(checked_at.replace("Z", "+00:00"))
                age_hours = round((datetime.datetime.now(datetime.timezone.utc) - ts).total_seconds() / 3600.0, 2)
            return {"status": "FRESH" if fresh else "STALE_UNVERIFIED", "reason": reason, "checkedAt": checked_at, "ageHours": age_hours, "providers": registry.get("providers", {})}
        except Exception as exc:
            return {"status": "INVALID_UNVERIFIED", "reason": str(exc), "checkedAt": None, "ageHours": None, "providers": {}}

    def get_provider_health_summary(self, max_stale_hours: float = 24.0) -> Dict[str, Any]:
        """Return comprehensive status of providers with explicit freshness flagging."""
        self._load_config()
        providers = self.registry.get("providers", {})
        registry_health = self._registry_health(max_stale_hours)
        summary = {}
        for p_id, p_cfg in providers.items():
            if p_id == "own-orch":
                summary[p_id] = {
                    "tier": 0,
                    "status": "HEALTHY_DETERMINISTIC",
                    "healthy": True,
                    "healthEvidence": registry_health,
                    "cost": "free",
                    "reasoning": "rule-based"
                }
                continue
            pool = self.key_pools.get(p_id, [])
            active_keys = [ks for ks in pool if not ks.disabled and time.time() >= ks.cooldown_until]
            is_configured = len(active_keys) > 0
            evidence = registry_health.get("providers", {}).get(p_id, {})
            health_verified = (
                registry_health["status"] == "FRESH"
                and evidence.get("healthy") is True
                and evidence.get("verificationStatus", "").startswith("VERIFIED_")
            )
            summary[p_id] = {
                "tier": p_cfg.get("tier", 99),
                "configured": is_configured,
                "healthy": is_configured and health_verified,
                "status": ("ACTIVE_KEYS_AVAILABLE" if health_verified else evidence.get("verificationStatus", registry_health["status"])) if is_configured else "UNCONFIGURED_OR_NO_KEYS",
                "activeKeyCount": len(active_keys),
                "healthEvidence": registry_health,
                "cost": p_cfg.get("cost", "variable"),
                "reasoning": p_cfg.get("reasoning", "")
            }
        return summary

    def probe_provider_reachability(self, provider_id: str, timeout_seconds: float = 4.0) -> Dict[str, Any]:
        """Perform one cheap authenticated reachability probe, never a completion request.

        Configuration presence remains a fast pre-filter. The probe only runs for a
        configured provider (or the local Ollama service) and returns a secret-free
        receipt suitable for the registry writer.
        """
        self._load_config()
        cfg = self.registry.get("providers", {}).get(provider_id)
        if not cfg:
            return {"provider": provider_id, "verificationStatus": "UNKNOWN_PROVIDER", "healthy": False}
        if cfg.get("requiresApiKey", False) and not self.get_next_key(provider_id):
            return {"provider": provider_id, "verificationStatus": "UNCONFIGURED_OR_NO_KEYS", "healthy": False}
        base = os.environ.get(cfg.get("baseUrlEnv", ""), cfg.get("defaultBaseUrl", ""))
        if not base:
            if provider_id in {"fcc-claude", "anthropic-full"}:
                base = "https://api.anthropic.com"
            else:
                return {"provider": provider_id, "verificationStatus": "NO_PROBE_ENDPOINT", "healthy": False}
        if provider_id == "hermes-ollama":
            endpoint = base.rstrip("/") + "/api/tags"
        else:
            endpoint = base.rstrip("/") + ("/models" if base.rstrip("/").endswith("/v1") else "/v1/models")
        headers = {"User-Agent": "VentureAtlas-health-probe/1.0"}
        key_state = self.get_next_key(provider_id)
        if key_state:
            if provider_id in {"fcc-claude", "anthropic-full"}:
                headers["x-api-key"] = key_state.key
                headers["anthropic-version"] = "2023-06-01"
            else:
                headers["Authorization"] = f"Bearer {key_state.key}"
        request = urllib.request.Request(endpoint, headers=headers, method="GET")
        started = time.monotonic()
        try:
            with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
                status = getattr(response, "status", response.getcode())
                reachable = 200 <= int(status) < 500
                return {"provider": provider_id, "verificationStatus": "VERIFIED_REACHABLE" if reachable else "VERIFIED_UNREACHABLE", "healthy": reachable, "httpStatus": int(status), "durationMs": round((time.monotonic() - started) * 1000)}
        except urllib.error.HTTPError as exc:
            # 401/403 prove the endpoint is reachable but credentials are not usable.
            return {"provider": provider_id, "verificationStatus": "VERIFIED_REACHABLE_AUTH_FAILED" if exc.code in (401, 403) else "VERIFIED_UNREACHABLE", "healthy": False, "httpStatus": exc.code, "durationMs": round((time.monotonic() - started) * 1000)}
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            return {"provider": provider_id, "verificationStatus": "VERIFIED_UNREACHABLE", "healthy": False, "errorClass": type(exc).__name__, "durationMs": round((time.monotonic() - started) * 1000)}

    def probe_configured_providers(self, timeout_seconds: float = 4.0) -> Dict[str, Dict[str, Any]]:
        """Probe configured providers once; unconfigured providers are not contacted."""
        return {
            provider_id: self.probe_provider_reachability(provider_id, timeout_seconds)
            for provider_id, cfg in self.registry.get("providers", {}).items()
            if provider_id != "own-orch" and (not cfg.get("requiresApiKey", False) or self.key_pools.get(provider_id))
        }

_SCHEDULER = CapabilityProviderScheduler()

def get_provider_scheduler() -> CapabilityProviderScheduler:
    return _SCHEDULER

def get_provider_router():
    return _SCHEDULER
