import importlib
import json
import os
import sys
import tempfile
import unittest
import urllib.error
from unittest import mock


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
orchestrator = importlib.import_module("va_orchestrator")
from va_runtime.provider_router import CapabilityProviderScheduler, NoEligibleProviderError


class ProviderRoutingContractTests(unittest.TestCase):
    def test_nvidia_adversarial_lane_uses_distinct_current_model(self):
        with mock.patch.dict(os.environ, {"NVIDIA_NIM_API_KEYS": "unit-nvidia-key-12345"}, clear=False):
            scheduler = CapabilityProviderScheduler()
        response = {"choices": [{"message": {"content": "review ok"}}]}
        with mock.patch.object(orchestrator, "get_provider_scheduler", return_value=scheduler), \
             mock.patch.object(orchestrator, "_http_post", return_value=response) as post:
            self.assertEqual(orchestrator._call_nvidia_nim_adversarial("review"), "review ok")
        url, headers, body = post.call_args.args[:3]
        self.assertEqual(url, "https://integrate.api.nvidia.com/v1/chat/completions")
        self.assertTrue(headers["Authorization"].startswith("Bearer "))
        self.assertEqual(body["model"], "openai/gpt-oss-20b")

    def test_nvidia_adversarial_lane_accepts_reasoning_content_fallback(self):
        with mock.patch.dict(os.environ, {"NVIDIA_NIM_API_KEYS": "unit-nvidia-key-12345"}, clear=False):
            scheduler = CapabilityProviderScheduler()
        response = {"choices": [{"message": {"content": None, "reasoning_content": "review fallback"}}]}
        with mock.patch.object(orchestrator, "get_provider_scheduler", return_value=scheduler), \
             mock.patch.object(orchestrator, "_http_post", return_value=response):
            self.assertEqual(orchestrator._call_nvidia_nim_adversarial("review"), "review fallback")

    def test_http_401_disables_exact_key_and_next_call_excludes_it(self):
        env = {"NVIDIA_NIM_API_KEYS": "unit-key-invalid-12345,unit-key-valid-67890"}
        with mock.patch.dict(os.environ, env, clear=False):
            scheduler = CapabilityProviderScheduler()

        calls = []

        def fake_http(_url, headers, _body, timeout=60):
            calls.append(headers["Authorization"])
            if headers["Authorization"].endswith("invalid-12345"):
                raise urllib.error.HTTPError(_url, 401, "invalid", {}, None)
            return {"choices": [{"message": {"content": "ok"}}]}

        with mock.patch.object(orchestrator, "get_provider_scheduler", return_value=scheduler), \
             mock.patch.object(orchestrator, "_http_post", side_effect=fake_http):
            self.assertEqual(orchestrator._call_nvidia_nim("probe"), "ok")
            self.assertEqual(orchestrator._call_nvidia_nim("probe again"), "ok")

        self.assertEqual(calls.count("Bearer unit-key-invalid-12345"), 1)
        self.assertTrue(scheduler.key_pools["nvidia-nim"][0].disabled)

    def test_http_429_cools_exact_key_and_next_call_excludes_it(self):
        env = {"DEEPSEEK_API_KEYS": "unit-key-rate-limited-12345"}
        with mock.patch.dict(os.environ, env, clear=False):
            scheduler = CapabilityProviderScheduler()
        error = urllib.error.HTTPError("https://example.invalid", 429, "limited", {"Retry-After": "12"}, None)

        with mock.patch.object(orchestrator, "get_provider_scheduler", return_value=scheduler), \
             mock.patch.object(orchestrator, "_http_post", side_effect=error):
            with self.assertRaises(urllib.error.HTTPError):
                orchestrator._call_deepseek_api("probe")
            with self.assertRaisesRegex(ValueError, "No valid DeepSeek"):
                orchestrator._call_deepseek_api("probe again")

        self.assertGreater(scheduler.key_pools["deepseek-api"][0].cooldown_until, 0)

    def test_shared_anthropic_key_health_applies_to_both_aliases(self):
        env = {"ANTHROPIC_API_KEYS": "unit-shared-anthropic-key-12345"}
        with mock.patch.dict(os.environ, env, clear=False):
            scheduler = CapabilityProviderScheduler()
        scheduler.handle_auth_invalid(scheduler.key_pools["fcc-claude"][0])
        self.assertTrue(scheduler.key_pools["anthropic-full"][0].disabled)

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

    def test_stale_registry_health_is_explicitly_unverified(self):
        config = {"providers": {"remote": {"requiresApiKey": True, "legacyKeyEnv": "VA_TEST_REMOTE_KEY", "costClass": 0, "tier": 1}}}
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as config_handle, \
             tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as registry_handle:
            json.dump(config, config_handle)
            json.dump({"lastHealthCheck": "2020-01-01T00:00:00Z"}, registry_handle)
            config_path, registry_path = config_handle.name, registry_handle.name
        try:
            with mock.patch.dict(os.environ, {"VA_TEST_REMOTE_KEY": "real-test-key-123456"}):
                scheduler = CapabilityProviderScheduler(config_path, registry_path)
            summary = scheduler.get_provider_health_summary(max_stale_hours=24)
            self.assertEqual(summary["remote"]["status"], "STALE_UNVERIFIED")
            self.assertFalse(summary["remote"]["healthy"])
            self.assertEqual(summary["remote"]["healthEvidence"]["status"], "STALE_UNVERIFIED")
        finally:
            os.unlink(config_path)
            os.unlink(registry_path)

    def test_reachability_probe_uses_cheap_get_and_never_completion(self):
        config = {"providers": {"remote": {"requiresApiKey": True, "legacyKeyEnv": "VA_TEST_REMOTE_KEY", "defaultBaseUrl": "https://example.test/v1"}}}
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as config_handle:
            json.dump(config, config_handle)
            config_path = config_handle.name
        try:
            with mock.patch.dict(os.environ, {"VA_TEST_REMOTE_KEY": "real-test-key-123456"}):
                scheduler = CapabilityProviderScheduler(config_path)
            class Response:
                status = 200
                def __enter__(self): return self
                def __exit__(self, *args): return False
                def getcode(self): return self.status
            with mock.patch("va_runtime.provider_router.urllib.request.urlopen", return_value=Response()) as opener:
                result = scheduler.probe_provider_reachability("remote")
            self.assertEqual(result["verificationStatus"], "VERIFIED_REACHABLE")
            request = opener.call_args.args[0]
            self.assertEqual(request.method, "GET")
            self.assertEqual(request.full_url, "https://example.test/v1/models")
        finally:
            os.unlink(config_path)


if __name__ == "__main__":
    unittest.main()
