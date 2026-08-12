import datetime as dt
import json
import os
import sys
import unittest


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from va_runtime.lifecycle import blind_packet, candidate_digest, contains_blind_anchor
from va_runtime.publisher import evaluate_promotion_gates


BASELINE = "8dfb96c691854db431229b0f8f0550b5dabfd482"


def candidate(**updates):
    value = {
        "id": "candidate-test-1234",
        "candidateSlug": "receipt-bound-test",
        "name": "Receipt Bound Test",
        "category": "Testing",
        "oneSentenceConcept": "Tests fail-closed canonical identity admission.",
        "sourceReferences": [],
        "promotionEligible": True,
    }
    value.update(updates)
    return value


def receipt(value):
    return {
        "schemaVersion": "1.0.0",
        "receiptId": "receipt-canonicalize-test-1234",
        "receiptType": "CANONICALIZE",
        "subjectId": value["id"],
        "subjectDigest": candidate_digest(value),
        "baselineCommit": BASELINE,
        "reviewer": {"id": "test-reviewer", "role": "human-reviewer"},
        "decision": "APPROVE",
        "decidedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "identityReview": {"status": "APPROVED"},
        "duplicateReview": {"status": "APPROVED", "semanticReviewId": "semantic-test-1"},
        "lineageVerified": True,
    }


class PublisherAdversarialTests(unittest.TestCase):
    def test_promotion_boolean_is_never_authority(self):
        for promotion_value in (None, False, True):
            value = candidate()
            if promotion_value is None:
                value.pop("promotionEligible")
            else:
                value["promotionEligible"] = promotion_value
            passed, _, notes = evaluate_promotion_gates(value, [], None, BASELINE)
            self.assertFalse(passed)
            self.assertTrue(any("CANONICALIZE receipt" in note for note in notes))

    def test_valid_receipt_allows_canonical_hypothesis_without_sources(self):
        value = candidate(promotionEligible=False)
        passed, _, notes = evaluate_promotion_gates(value, [], receipt(value), BASELINE)
        self.assertTrue(passed, notes)

    def test_fake_source_fails_even_with_valid_receipt(self):
        value = candidate(sourceReferences=["source-does-not-exist"])
        passed, _, notes = evaluate_promotion_gates(value, [], receipt(value), BASELINE)
        self.assertFalse(passed)
        self.assertTrue(any("Unknown source IDs" in note for note in notes))

    def test_tampered_candidate_invalidates_receipt(self):
        value = candidate()
        reviewed = receipt(value)
        value["name"] = "Changed After Review"
        passed, _, notes = evaluate_promotion_gates(value, [], reviewed, BASELINE)
        self.assertFalse(passed)
        self.assertTrue(any("subjectDigest mismatch" in note for note in notes))

    def test_blind_packet_has_no_score_rank_priority_or_verdict(self):
        value = candidate(
            analystProvisionalOpportunityScore=99,
            initialVerdict="WINNER",
            priority="critical",
            atAGlance={"targetCustomer": "buyer", "problemSolved": "pain", "overallScore": 100},
            nested={"rank": 1, "score": 99},
        )
        packet = blind_packet(value)
        self.assertFalse(contains_blind_anchor(packet), json.dumps(packet))
        serialized = json.dumps(packet).lower()
        for forbidden in ("overallscore", "initialverdict", "priority", '"rank"', '"score"'):
            self.assertNotIn(forbidden, serialized)


if __name__ == "__main__":
    unittest.main()
