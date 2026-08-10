"""
Unit tests for Venture Atlas OS Provider Router & Capability Scheduler
"""
import unittest
import os
import sys
import tempfile

# Ensure scripts directory is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS_DIR = os.path.join(BASE_DIR, "scripts")
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

from va_runtime.provider_router import (
    is_placeholder_key,
    CapabilityProviderScheduler,
    NoEligibleProviderError,
)
from va_runtime.process_lock import process_file_lock

class TestProviderRouter(unittest.TestCase):
    def test_is_placeholder_key(self):
        # Known placeholders should be rejected
        self.assertTrue(is_placeholder_key("changeme"))
        self.assertTrue(is_placeholder_key("your-key-here"))
        self.assertTrue(is_placeholder_key("sk-ant-..."))
        self.assertTrue(is_placeholder_key("sk-or-..."))
        self.assertTrue(is_placeholder_key("short"))

        # Real-format non-secret test keys should be accepted
        self.assertFalse(is_placeholder_key("sk-ant-FAKE-UNIT-TEST-NOT-SECRET-12345"))
        self.assertFalse(is_placeholder_key("sk-or-v1-9999888877776666555544443333"))

    def test_key_pool_initialization(self):
        # Set fake unit test key in environment
        os.environ["ANTHROPIC_API_KEYS"] = "sk-ant-FAKE-UNIT-TEST-NOT-SECRET-12345"
        scheduler = CapabilityProviderScheduler()
        self.assertIn("fcc-claude", scheduler.key_pools)
        pool = scheduler.key_pools["fcc-claude"]
        self.assertEqual(len(pool), 1)
        self.assertEqual(pool[0].key, "sk-ant-FAKE-UNIT-TEST-NOT-SECRET-12345")
        # Clean up env
        del os.environ["ANTHROPIC_API_KEYS"]

    def test_requires_external_evidence_fail_closed(self):
        scheduler = CapabilityProviderScheduler()
        # With no external keys set, requires_external_evidence must raise NoEligibleProviderError
        with self.assertRaises(NoEligibleProviderError):
            scheduler.select_providers_for_task(
                required_capabilities=["research"],
                requires_external_evidence=True,
                allow_own_orch=True
            )

    def test_process_lock_rejects_concurrent_owner(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            lock_path = os.path.join(temp_dir, "supervisor.lock")
            with process_file_lock(lock_path, timeout_seconds=0):
                with self.assertRaises(TimeoutError):
                    with process_file_lock(lock_path, timeout_seconds=0):
                        pass

    def test_registry_contains_every_orchestrator_provider(self):
        scheduler = CapabilityProviderScheduler()
        expected = {"nvidia-nim", "cohere-api", "hermes-ollama", "omniRoute", "fcc-claude",
                    "active-api", "deepseek-api", "anthropic-full", "own-orch"}
        self.assertTrue(expected.issubset(scheduler.registry["providers"]))

if __name__ == "__main__":
    unittest.main()
