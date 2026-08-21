from __future__ import annotations

import unittest

from codex_runtime import CanonicalEvent, InvalidTransition, Receipt, TransactionRuntime
from codex_runtime.adapters import EudrSyntheticAdapter


class RuntimeTests(unittest.TestCase):
    def test_canonical_event_rejects_wrong_type(self):
        with self.assertRaises(ValueError):
            CanonicalEvent("1", "log", "o", "EU", "EUDR", "1", "actor")

    def test_timeout_requires_reconciliation(self):
        runtime = TransactionRuntime("tx-1")
        runtime.bind_payload({"a": 1})
        runtime.transition("VALIDATED_LOCAL", reason="ok")
        runtime.transition("SUBMISSION_PENDING", reason="send")
        runtime.transition("UNKNOWN_EXTERNAL_STATE", reason="timeout")
        with self.assertRaises(InvalidTransition):
            runtime.transition("ACCEPTED", reason="unsafe shortcut")
        runtime.transition("RECONCILING", reason="poll")
        runtime.transition("ACCEPTED", reason="confirmed", external_reference="ref-1")
        self.assertEqual(runtime.external_reference, "ref-1")

    def test_receipt_hashes_are_deterministic(self):
        kwargs = dict(
            transaction_id="tx-1",
            payload={"b": 2, "a": 1},
            evidence=[{"id": "e1"}],
            input_version="1",
            regulatory_version="r1",
            validator_version="v1",
            submitted_at="2026-08-21T00:00:00Z",
            external_reference=None,
            result="ACCEPTED",
        )
        first = Receipt.issue(**kwargs)
        kwargs["payload"] = {"a": 1, "b": 2}
        second = Receipt.issue(**kwargs)
        self.assertEqual(first.objectHash, second.objectHash)

    def test_synthetic_adapter_fails_missing_geometry(self):
        findings = EudrSyntheticAdapter().preflight({"commodity": "coffee"})
        self.assertEqual([f.passed for f in findings], [True, False])


if __name__ == "__main__":
    unittest.main()

