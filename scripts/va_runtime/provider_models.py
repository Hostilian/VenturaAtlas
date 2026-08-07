"""
Venture Atlas OS — Per-Key & Provider State Models
===================================================
Models runtime key health, concurrency limits, and cooldown tracking per credential alias.
"""

import time
import datetime
from dataclasses import dataclass, field
from typing import Dict, List, Optional

@dataclass
class KeyState:
    alias: str
    provider: str
    enabled: bool = True
    healthy: bool = True
    active_requests: int = 0
    max_concurrent: int = 3
    cooldown_until: Optional[str] = None
    last_used_at: Optional[str] = None
    last_success_at: Optional[str] = None
    last_error_at: Optional[str] = None
    rolling_latency_ms: float = 500.0
    rolling_429_rate: float = 0.0
    rolling_5xx_rate: float = 0.0
    daily_spend_usd: float = 0.0
    daily_budget_usd: float = 50.0

    def is_cooling_down(self) -> bool:
        if not self.cooldown_until:
            return False
        try:
            until = datetime.datetime.fromisoformat(self.cooldown_until)
            now = datetime.datetime.now(datetime.timezone.utc)
            return now < until
        except Exception:
            return False

    def is_eligible(self) -> bool:
        return (
            self.enabled
            and self.healthy
            and not self.is_cooling_down()
            and self.active_requests < self.max_concurrent
            and self.daily_spend_usd < self.daily_budget_usd
        )
