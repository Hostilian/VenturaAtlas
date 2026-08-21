"""
Unit tests for Venture Atlas OS Provider Router & Capability Scheduler
"""
import unittest
import json
import os
import sys
import tempfile
import time
from unittest import mock

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

    def test_capability_contract_does_not_use_fallback_as_wildcard(self):
        scheduler = CapabilityProviderScheduler()
        selected = scheduler.select_providers_for_task(
            required_capabilities=["capability-that-does-not-exist"],
            allow_own_orch=True,
            match_mode="all",
        )
        self.assertEqual(selected, [])

    def test_external_model_is_not_external_evidence_without_retrieval(self):
        os.environ["OPENROUTER_API_KEYS"] = "sk-or-v1-9999888877776666555544443333"
        try:
            scheduler = CapabilityProviderScheduler()
            with self.assertRaises(NoEligibleProviderError):
                scheduler.select_providers_for_task(
                    required_capabilities=["research"],
                    requires_external_evidence=True,
                    allow_own_orch=False,
                )
        finally:
            del os.environ["OPENROUTER_API_KEYS"]

    def test_process_lock_rejects_concurrent_owner(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            lock_path = os.path.join(temp_dir, "supervisor.lock")
            with process_file_lock(lock_path, timeout_seconds=0):
                with self.assertRaises(TimeoutError):
                    with process_file_lock(lock_path, timeout_seconds=0):
                        pass

    def test_zero_timeout_lock_retries_after_stale_owner_is_removed(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            lock_path = os.path.join(temp_dir, "supervisor.lock")
            with open(lock_path, "w", encoding="utf-8") as handle:
                json.dump({"pid": os.getpid(), "created": time.time() - 60, "token": "stale"}, handle)
            with process_file_lock(lock_path, timeout_seconds=0, stale_after_seconds=1):
                self.assertTrue(os.path.exists(lock_path))
            self.assertFalse(os.path.exists(lock_path))

    def test_registry_contains_every_orchestrator_provider(self):
        scheduler = CapabilityProviderScheduler()
        expected = {"nvidia-nim", "cohere-api", "hermes-ollama", "omniRoute", "fcc-claude",
                    "active-api", "deepseek-api", "anthropic-full", "nvidia-nim-adversarial", "own-orch"}
        self.assertTrue(expected.issubset(scheduler.registry["providers"]))

    def test_cloud_review_order_prefers_three_intended_model_lanes(self):
        env = {
            "VA_EXECUTION_SCOPE": "cloud",
            "NVIDIA_NIM_API_KEYS": "unit-nvidia-key-12345",
            "COHERE_API_KEYS": "unit-cohere-key-12345",
            "ANTHROPIC_API_KEYS": "unit-anthropic-key-12345",
        }
        with mock.patch.dict(os.environ, env, clear=False):
            scheduler = CapabilityProviderScheduler()
        selected = scheduler.select_providers_for_task(
            ["reasoning", "structured_review", "adversarial_review"],
            max_cost_class=1,
            allow_own_orch=False,
            match_mode="any",
        )
        self.assertEqual(selected[:3], ["nvidia-nim", "cohere-api", "nvidia-nim-adversarial"])

    def test_cloud_hermes_requires_remote_https_and_authentication(self):
        with mock.patch.dict(os.environ, {"VA_EXECUTION_SCOPE": "cloud", "OLLAMA_BASE_URL": "http://localhost:11434"}, clear=False):
            scheduler = CapabilityProviderScheduler()
            self.assertNotIn("hermes-ollama", scheduler.select_providers_for_task(["reasoning"], match_mode="any"))
        with mock.patch.dict(os.environ, {
            "VA_EXECUTION_SCOPE": "cloud", "OLLAMA_BASE_URL": "https://hermes.example.test",
            "OLLAMA_AUTH_TOKEN": "unit-test-token-not-secret",
        }, clear=False):
            scheduler = CapabilityProviderScheduler()
            self.assertIn("hermes-ollama", scheduler.select_providers_for_task(["reasoning"], match_mode="any"))

if __name__ == "__main__":
    unittest.main()
