import pathlib
import sys
import threading
import time
import unittest
from unittest import mock


ROOT = pathlib.Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

import va_orchestrator as orchestrator


class HermesRuntimeTests(unittest.TestCase):
    def setUp(self):
        orchestrator._hermes_inference_slot = threading.BoundedSemaphore(value=1)

    def test_parallel_local_call_fails_fast_when_slot_is_busy(self):
        entered = threading.Event()
        release = threading.Event()

        def slow_post(*_args, **_kwargs):
            entered.set()
            release.wait(2)
            return {"response": "ok"}

        with mock.patch.object(orchestrator, "_http_post", side_effect=slow_post), mock.patch.object(
            orchestrator, "OLLAMA_SLOT_WAIT_SECONDS", 0.01
        ):
            worker = threading.Thread(target=orchestrator._call_hermes, args=("first",))
            worker.start()
            self.assertTrue(entered.wait(1))
            started = time.monotonic()
            with self.assertRaises(orchestrator.HermesBusyError):
                orchestrator._call_hermes("second")
            self.assertLess(time.monotonic() - started, 0.5)
            release.set()
            worker.join(2)
            self.assertFalse(worker.is_alive())

    def test_missing_fallback_does_not_replace_primary_error_with_404(self):
        primary_error = TimeoutError("primary timed out")
        with mock.patch.object(orchestrator, "_call_hermes", side_effect=primary_error) as call, mock.patch.object(
            orchestrator, "_ollama_has_model", return_value=False
        ), mock.patch.object(orchestrator, "HERMES_MODEL", "hermes3:latest"), mock.patch.object(
            orchestrator, "OLLAMA_FALLBACK", "missing:latest"
        ):
            with self.assertRaisesRegex(TimeoutError, "primary timed out"):
                orchestrator._call_hermes_with_fallback("prompt")
            call.assert_called_once_with("prompt", "hermes3:latest")

    def test_installed_distinct_fallback_is_used(self):
        with mock.patch.object(
            orchestrator, "_call_hermes", side_effect=[TimeoutError("primary timed out"), "fallback-ok"]
        ) as call, mock.patch.object(orchestrator, "_ollama_has_model", return_value=True), mock.patch.object(
            orchestrator, "HERMES_MODEL", "hermes3:latest"
        ), mock.patch.object(orchestrator, "OLLAMA_FALLBACK", "other:latest"):
            self.assertEqual(orchestrator._call_hermes_with_fallback("prompt"), "fallback-ok")
            self.assertEqual(
                call.call_args_list,
                [mock.call("prompt", "hermes3:latest"), mock.call("prompt", "other:latest")],
            )


if __name__ == "__main__":
    unittest.main()
