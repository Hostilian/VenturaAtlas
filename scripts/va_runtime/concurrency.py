"""
Venture Atlas OS — Adaptive Concurrency Controller
===================================================
Dynamically regulates parallel worker threads based on provider health,
rolling 429 rates, error spikes, and backlog size.
"""

import os
import threading

class ConcurrencyController:
    def __init__(self):
        self.global_max = int(os.environ.get("VA_GLOBAL_MAX_CONCURRENCY", "20"))
        self.current_concurrency = int(os.environ.get("VA_DISCOVERY_MAX_CONCURRENCY", "5"))
        self._lock = threading.Lock()

    def get_max_workers(self) -> int:
        with self._lock:
            return self.current_concurrency

    def adjust_for_errors(self, high_429: bool = False, high_5xx: bool = False):
        with self._lock:
            if high_429 or high_5xx:
                self.current_concurrency = max(1, self.current_concurrency - 1)

    def adjust_for_success(self):
        with self._lock:
            if self.current_concurrency < self.global_max:
                self.current_concurrency += 1

_CONTROLLER = ConcurrencyController()

def get_concurrency_controller() -> ConcurrencyController:
    return _CONTROLLER
