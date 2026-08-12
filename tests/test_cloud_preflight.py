import importlib.util
import json
import unittest
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("cloud_preflight", ROOT / "cloud-control-plane" / "preflight.py")
preflight = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(preflight)


def deployed_job(publication_expected="0"):
    return {
        "name": "venture-atlas-discovery-worker",
        "template": {"template": {
            "serviceAccount": "worker@example.invalid",
            "containers": [{
                "image": "europe/image@sha256:" + ("a" * 64),
                "env": [
                    {"name": "VA_PRIVATE_STAGING_BUCKET", "value": "private-bucket"},
                    {"name": "VA_PUBLICATION_EXPECTED", "value": publication_expected},
                    {"name": "VA_BASELINE_SHA", "value": "b" * 40},
                ],
            }],
        }},
    }


class CloudPreflightTests(unittest.TestCase):
    def test_proof_requires_enabled_scheduler_and_latest_success(self):
        responses = [
            (0, json.dumps(deployed_job()), ""),
            (0, json.dumps({"state": "ENABLED"}), ""),
            (0, json.dumps([{
                "metadata": {"name": "execution-1"},
                "status": {"conditions": [{"type": "Completed", "state": "True"}]},
            }]), ""),
        ]
        with mock.patch.object(preflight, "run", side_effect=responses):
            checks = preflight.inspect_deployment("gcloud", "project", "region")
        self.assertTrue(all(item["passed"] for item in checks), checks)

    def test_capabilities_without_runtime_proof_fail_closed(self):
        responses = [
            (0, json.dumps(deployed_job(publication_expected="1")), ""),
            (0, json.dumps({"state": "PAUSED"}), ""),
            (0, json.dumps([]), ""),
        ]
        with mock.patch.object(preflight, "run", side_effect=responses):
            checks = preflight.inspect_deployment("gcloud", "project", "region")
        status = {item["id"]: item["passed"] for item in checks}
        self.assertFalse(status["private-discovery-config"])
        self.assertFalse(status["cloud-scheduler-enabled"])
        self.assertFalse(status["latest-successful-execution"])


if __name__ == "__main__":
    unittest.main()
