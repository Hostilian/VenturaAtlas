import importlib.util
import os
import sys
import unittest
from unittest import mock

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from va_runtime.novelty_throttle import record_result


def load_generator_module():
    path = os.path.join(ROOT, "scripts", "autonomous-idea-generator.py")
    spec = importlib.util.spec_from_file_location("autonomous_idea_generator_test", path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class TestAutonomousGeneratorThrottle(unittest.TestCase):
    def test_low_novelty_cooldown_skips_every_discovery_worker(self):
        module = load_generator_module()
        control = None
        for _ in range(3):
            control = record_result(control, accepted=0, rejected=3)
        state = {"noveltyControl": control}
        saved = []
        worker = mock.Mock(side_effect=AssertionError("provider-backed worker must not run"))
        with (
            mock.patch.object(sys, "argv", ["autonomous-idea-generator.py", "--once"]),
            mock.patch.object(module, "_load_state", return_value=state),
            mock.patch.object(module, "_save_state", side_effect=lambda value: saved.append(value)),
            mock.patch.object(module, "load_existing_ideas", return_value=[]),
            mock.patch.object(module, "load_staging_queue", return_value=[]),
            mock.patch.object(module, "process_single_domain", worker),
        ):
            self.assertEqual(module.main(), 0)
        worker.assert_not_called()
        self.assertEqual(len(saved), 1)
        self.assertEqual(saved[0]["noveltyControl"]["cooldownRemaining"], 1)


if __name__ == "__main__":
    unittest.main()
