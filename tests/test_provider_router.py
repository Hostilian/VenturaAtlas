"""
Unit tests for Venture Atlas OS Provider Router & Capability Scheduler
"""
import unittest
import os
import sys

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

if __name__ == "__main__":
    unittest.main()
