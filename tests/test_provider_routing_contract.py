import importlib
import json
import os
import sys
import tempfile
import unittest
from unittest import mock


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
orchestrator = importlib.import_module("va_orchestrator")
from va_runtime.provider_router import CapabilityProviderScheduler, NoEligibleProviderError


class ProviderRoutingContractTests(unittest.TestCase):
    def test_sequential_external_evidence_failure_never_uses_own_orch(self):
        scheduler = mock.Mock()
        scheduler.select_providers_for_task.return_value = ["nvidia-nim"]
        state = {"providers": {"nvidia-nim": {}}}
        with mock.patch.object(orchestrator, "get_provider_scheduler", return_value=scheduler), \
             mock.patch.object(orchestrator, "_load_state", return_value=state), \
             mock.patch.object(orchestrator, "_is_circuit_open", return_value=False), \
             mock.patch.object(orchestrator, "_call_nvidia_nim", side_effect=RuntimeError("outage")), \
             mock.patch.object(orchestrator, "_record_failure"), \
             mock.patch.object(orchestrator, "_call_own_orchestrator", return_value="must-not-run") as own:
            with self.assertRaises(NoEligibleProviderError):
                orchestrator.call_llm(
                    "research", allow_own_orch=True, required_capabilities=["research"],
                    requires_external_evidence=True
                )
            own.assert_not_called()

    def test_disabled_api_key_is_not_provider_eligibility(self):
        config = {
            "providers": {
                "remote": {
                    "requiresApiKey": True, "legacyKeyEnv": "VA_TEST_REMOTE_KEY",
                    "costClass": 0, "tier": 1, "capabilities": ["research"], "webAccess": True
                },
                "own-orch": {
                    "requiresApiKey": False, "costClass": 0, "tier": 99,
                    "capabilities": ["classification"], "webAccess": False
                }
            }
        }
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as handle:
            json.dump(config, handle)
            config_path = handle.name
        try:
            with mock.patch.dict(os.environ, {"VA_TEST_REMOTE_KEY": "real-test-key-123456"}):
                scheduler = CapabilityProviderScheduler(config_path)
            scheduler.key_pools["remote"][0].disabled = True
            with self.assertRaises(NoEligibleProviderError):
                scheduler.select_providers_for_task(
                    ["research"], max_cost_class=0, allow_own_orch=True,
                    requires_external_evidence=True
                )
        finally:
            os.unlink(config_path)


if __name__ == "__main__":
    unittest.main()
