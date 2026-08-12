import importlib.util
import json
import os
import subprocess
import tempfile
import unittest
from unittest import mock
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("cloud_job_runner", ROOT / "cloud-control-plane" / "job_runner.py")
runner = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(runner)


def git(cwd, *args):
    return subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True, check=True).stdout.strip()


class CloudJobRunnerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.repo = Path(self.temp.name)
        git(self.repo, "init")
        git(self.repo, "config", "user.name", "test")
        git(self.repo, "config", "user.email", "test@example.invalid")
        (self.repo / "data").mkdir()
        (self.repo / "data" / "expected.json").write_text("{}\n", encoding="utf-8")
        (self.repo / "README.md").write_text("baseline\n", encoding="utf-8")
        git(self.repo, "add", ".")
        git(self.repo, "commit", "-m", "baseline")

    def tearDown(self):
        self.temp.cleanup()

    def test_unexpected_path_fails_diff_closure(self):
        (self.repo / "README.md").write_text("changed\n", encoding="utf-8")
        with self.assertRaisesRegex(RuntimeError, "unexpected autonomous diff paths"):
            runner.enforce_diff_closure(str(self.repo), {
                "allowedPaths": ["data/expected.json"], "requiredPaths": [], "forbidDeletions": True
            })

    def test_missing_required_path_fails_diff_closure(self):
        with self.assertRaisesRegex(RuntimeError, "missing expected autonomous diff paths"):
            runner.enforce_diff_closure(str(self.repo), {
                "allowedPaths": ["data/expected.json"], "requiredPaths": ["data/expected.json"], "forbidDeletions": True
            })

    def test_exact_allowed_required_diff_passes(self):
        (self.repo / "data" / "expected.json").write_text('{"changed":true}\n', encoding="utf-8")
        public, private = runner.enforce_diff_closure(str(self.repo), {
            "allowedPaths": ["data/expected.json"], "privatePaths": [],
            "requiredPaths": ["data/expected.json"], "forbidDeletions": True
        })
        self.assertEqual(public, {"data/expected.json"})
        self.assertEqual(private, set())

    def test_private_path_is_separated_from_publishable_diff(self):
        (self.repo / "data" / "expected.json").write_text('{"private":true}\n', encoding="utf-8")
        public, private = runner.enforce_diff_closure(str(self.repo), {
            "allowedPaths": [], "privatePaths": ["data/expected.json"],
            "requiredPaths": [], "forbidDeletions": True
        })
        self.assertEqual(public, set())
        self.assertEqual(private, {"data/expected.json"})

    def test_manifest_cannot_classify_path_as_public_and_private(self):
        with self.assertRaisesRegex(RuntimeError, "both public and private"):
            runner.enforce_diff_closure(str(self.repo), {
                "allowedPaths": ["data/expected.json"], "privatePaths": ["data/expected.json"],
                "requiredPaths": [], "forbidDeletions": True
            })

    def test_deletion_is_rejected(self):
        os.remove(self.repo / "data" / "expected.json")
        with self.assertRaisesRegex(RuntimeError, "deletion is forbidden"):
            runner.enforce_diff_closure(str(self.repo), {
                "allowedPaths": ["data/expected.json"], "requiredPaths": ["data/expected.json"], "forbidDeletions": True
            })

    def test_prestaged_deletion_is_rejected(self):
        os.remove(self.repo / "data" / "expected.json")
        git(self.repo, "add", "-u")
        with self.assertRaisesRegex(RuntimeError, "deletion is forbidden"):
            runner.enforce_diff_closure(str(self.repo), {
                "allowedPaths": ["data/expected.json"], "requiredPaths": ["data/expected.json"], "forbidDeletions": True
            })

    def test_publication_credentials_are_required_when_expected(self):
        old_base = runner.BASE_DIR
        runner.BASE_DIR = str(self.repo)
        try:
            with mock.patch.object(runner, "fetch_gcp_secret", return_value=""), \
                 mock.patch.dict(os.environ, {"VA_PUBLICATION_EXPECTED": "1"}, clear=False):
                with self.assertRaisesRegex(RuntimeError, "GITHUB_TOKEN is required"):
                    runner.push_updates_to_github()
        finally:
            runner.BASE_DIR = old_base


if __name__ == "__main__":
    unittest.main()
