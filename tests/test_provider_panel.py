import json
import os
import sys
import tempfile
import unittest
from unittest import mock


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

import va_orchestrator
from va_runtime.provider_router import CapabilityProviderScheduler, NoEligibleProviderError


class _PanelScheduler:
    def __init__(self, providers):
        self.providers = providers

    def select_providers_for_task(self, **_kwargs):
        return list(self.providers)


class ProviderPanelTests(unittest.TestCase):
    def test_panel_retries_only_a_missing_reviewer_lane(self):
        providers = ["reviewer-a", "reviewer-b", "reviewer-c"]
        attempts = {provider: 0 for provider in providers}

        def reviewer(provider, *_args):
            attempts[provider] += 1
            if provider == "reviewer-c" and attempts[provider] == 1:
                return None
            return f"review from {provider}", provider

        with mock.patch.dict(os.environ, {"VA_PANEL_RETRIES": "1"}, clear=False), \
             mock.patch.object(va_orchestrator, "get_provider_scheduler", return_value=_PanelScheduler(providers)), \
             mock.patch.object(va_orchestrator, "_load_state", return_value={"providers": {}}), \
             mock.patch.object(va_orchestrator, "_call_single_provider", side_effect=reviewer):
            responses = va_orchestrator.call_llm_panel("review", panel_size=3, minimum_responses=3)

        self.assertEqual([response["provider"] for response in responses], providers)
        self.assertEqual(attempts, {"reviewer-a": 1, "reviewer-b": 1, "reviewer-c": 2})

    def test_panel_waits_for_distinct_provider_responses(self):
        providers = ["reviewer-a", "reviewer-b", "reviewer-c"]
        with mock.patch.object(va_orchestrator, "get_provider_scheduler", return_value=_PanelScheduler(providers)), mock.patch.object(
            va_orchestrator, "_load_state", return_value={"providers": {}}
        ), mock.patch.object(
            va_orchestrator,
            "_call_single_provider",
            side_effect=lambda provider, *_args: (f"review from {provider}", provider),
        ):
            responses = va_orchestrator.call_llm_panel("review", panel_size=3, minimum_responses=3)
        self.assertEqual([response["provider"] for response in responses], providers)
        self.assertEqual(len({response["provider"] for response in responses}), 3)

    def test_panel_fails_closed_on_capacity_shortfall(self):
        with mock.patch.object(va_orchestrator, "get_provider_scheduler", return_value=_PanelScheduler(["reviewer-a"])), mock.patch.object(
            va_orchestrator, "_load_state", return_value={"providers": {}}
        ):
            with self.assertRaisesRegex(NoEligibleProviderError, "PANEL_CAPACITY_SHORTFALL"):
                va_orchestrator.call_llm_panel("review", panel_size=3, minimum_responses=3)

    def test_cloud_scope_excludes_laptop_local_hermes(self):
        with tempfile.TemporaryDirectory() as directory:
            config_path = os.path.join(directory, "providers.json")
            with open(config_path, "w", encoding="utf-8") as handle:
                json.dump({
                    "providers": {
                        "hermes-ollama": {
                            "tier": 1,
                            "requiresApiKey": False,
                            "costClass": 0,
                            "capabilities": ["reasoning"],
                            "executionScopes": ["local-windows", "self-hosted"],
                        },
                        "cloud-reviewer": {
                            "tier": 2,
                            "requiresApiKey": False,
                            "costClass": 1,
                            "capabilities": ["reasoning"],
                            "executionScopes": ["cloud"],
                        },
                    }
                }, handle)
            scheduler = CapabilityProviderScheduler(config_path=config_path, registry_path=os.path.join(directory, "health.json"))
            with mock.patch.dict(os.environ, {"VA_EXECUTION_SCOPE": "cloud"}):
                selected = scheduler.select_providers_for_task(
                    required_capabilities=["reasoning"],
                    max_cost_class=1,
                    allow_own_orch=False,
                )
        self.assertEqual(selected, ["cloud-reviewer"])


if __name__ == "__main__":
    unittest.main()
