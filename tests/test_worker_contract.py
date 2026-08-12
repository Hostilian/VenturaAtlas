import importlib.util
import os
import subprocess
import sys
import unittest
from pathlib import Path
from unittest import mock

from fastapi import HTTPException


ROOT = Path(__file__).resolve().parents[1]


def load_isolated(name, path, local_modules):
    saved = {module: sys.modules.pop(module, None) for module in local_modules}
    sys.path.insert(0, str(path.parent))
    try:
        spec = importlib.util.spec_from_file_location(name, path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    finally:
        sys.path.pop(0)
        for module in local_modules:
            sys.modules.pop(module, None)
            if saved[module] is not None:
                sys.modules[module] = saved[module]


control_plane = load_isolated(
    "ventureatlas_control_plane",
    ROOT / "cloud-control-plane" / "app.py",
    ("config", "auth"),
)
worker = load_isolated(
    "ventureatlas_worker_service",
    ROOT / "services" / "ventureatlas-worker" / "app.py",
    ("config",),
)
jobs = load_isolated(
    "ventureatlas_cloud_jobs",
    ROOT / "cloud-control-plane" / "jobs.py",
    (),
)


class WorkerContractTests(unittest.TestCase):
    def test_control_plane_readiness_fails_without_auth_or_node(self):
        with mock.patch.dict(os.environ, {
            "ENVIRONMENT": "production", "WORKER_AUTH_TOKEN": "placeholder",
        }, clear=False), mock.patch.object(control_plane.shutil, "which", return_value=None):
            with self.assertRaises(HTTPException) as raised:
                control_plane.readiness_check()
        self.assertEqual(raised.exception.status_code, 503)

    def test_control_plane_readiness_passes_with_dependencies(self):
        with mock.patch.dict(os.environ, {
            "ENVIRONMENT": "production", "WORKER_AUTH_TOKEN": "configured-token",
        }, clear=False), mock.patch.object(control_plane.shutil, "which", return_value="node"):
            result = control_plane.readiness_check()
        self.assertEqual(result["status"], "ready")

    def test_control_plane_rejects_concurrent_writer(self):
        control_plane.TASK_LOCK.acquire()
        try:
            with self.assertRaises(HTTPException) as raised:
                control_plane.execute_task("redteam")
        finally:
            control_plane.TASK_LOCK.release()
        self.assertEqual(raised.exception.status_code, 409)

    def test_worker_readiness_is_not_liveness(self):
        with mock.patch.dict(os.environ, {
            "ENVIRONMENT": "production", "WORKER_AUTH_TOKEN": "placeholder",
        }, clear=False), mock.patch.object(worker.shutil, "which", return_value=None):
            failures = worker.readiness_failures()
        self.assertIn("worker authentication is not configured", failures)
        self.assertIn("missing executable: node", failures)

    def test_every_placeholder_token_fails_authentication(self):
        for placeholder in worker.PLACEHOLDER_TOKENS:
            self.assertFalse(worker.authentication_valid(placeholder, placeholder, False))
        self.assertTrue(worker.authentication_valid("configured-token", "configured-token", False))

    def test_discovery_import_wrapper_propagates_child_failure(self):
        failed = subprocess.CompletedProcess([], 7, stdout="", stderr="boom")
        with mock.patch("subprocess.run", return_value=failed):
            with self.assertRaisesRegex(RuntimeError, "return code 7"):
                jobs.execute_discovery_run()


if __name__ == "__main__":
    unittest.main()
