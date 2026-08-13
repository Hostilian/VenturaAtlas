import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from va_runtime.preregistration import preregistration_digest, validate_preregistration, assert_holdout_packet


class TestPreregistration(unittest.TestCase):
    def fixture(self):
        value = {"schemaVersion": "1.0.0", "preregistrationId": "prereg-one", "candidateId": "idea-001", "candidateContentDigest": "a" * 64,
                 "createdAt": "2026-08-12T09:00:00Z", "lockedAt": "2026-08-12T09:01:00Z",
                 "expectations": {"buyer": "buyer", "pain": "pain", "strongestIncumbent": "incumbent", "willingnessToPayMaturity": "UNKNOWN", "biggestRisk": "risk", "verdict": "UNKNOWN"},
                 "author": {"id": "researcher", "role": "research-agent"}, "digestContract": "research-prereg-v1"}
        value["digest"] = preregistration_digest(value)
        return value

    def test_locks_before_research_and_findings_before_unblind(self):
        self.assertEqual(validate_preregistration(self.fixture(), "a" * 64, "2026-08-12T10:00:00Z", "2026-08-12T11:00:00Z", "2026-08-12T11:01:00Z"), [])

    def test_rejects_late_preregistration(self):
        receipt = self.fixture(); receipt["lockedAt"] = "2026-08-12T10:01:00Z"; receipt["digest"] = preregistration_digest(receipt)
        self.assertTrue(validate_preregistration(receipt, "a" * 64, "2026-08-12T10:00:00Z", "2026-08-12T11:00:00Z"))

    def test_holdout_sees_neither_preregistration_nor_prior_verdict(self):
        with self.assertRaises(ValueError):
            assert_holdout_packet({"candidateId": "x", "priorVerdict": "favorite"})


if __name__ == "__main__":
    unittest.main()
