import importlib
import os
import sys
import unittest
from unittest import mock


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(ROOT, "scripts")
if SCRIPTS not in sys.path:
    sys.path.insert(0, SCRIPTS)


generator = importlib.import_module("autonomous-idea-generator")
daemon = importlib.import_module("va-daemon-runner")


class TestCriticalStageFailures(unittest.TestCase):
    def test_provider_exception_is_worker_failure_not_zero_new(self):
        domain = generator.SEARCH_DOMAINS[0]
        with mock.patch.object(generator, "call_llm", side_effect=RuntimeError("injected provider failure")):
            status, idea = generator.process_single_domain(0, [], [], [], 0)
        self.assertEqual(status, "failed")
        self.assertIsNone(idea)

    def test_daemon_marks_generator_failure_and_never_logs_run_success(self):
        calls = [(0, "health ok"), (17, "injected generator failure")]
        events = []

        def fake_run(*_args, **_kwargs):
            return calls.pop(0)

        with mock.patch.object(daemon, "_run_script", side_effect=fake_run), \
             mock.patch.object(daemon, "_heartbeat", side_effect=lambda *a, **k: events.append(("heartbeat", a))), \
             mock.patch.object(daemon, "_log", side_effect=lambda level, message, **k: events.append((level, message))), \
             mock.patch.object(sys, "argv", ["va-daemon-runner.py", "--iterations", "1", "--interval", "1"]):
            with self.assertRaises(RuntimeError):
                daemon.main()

        self.assertTrue(any(e[0] == "heartbeat" and e[1][0] == "failed" for e in events))
        self.assertFalse(any(e[0] == "SUCCESS" and "Run #1 complete" in e[1] for e in events))


if __name__ == "__main__":
    unittest.main()
