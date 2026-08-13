import datetime as dt
import json
import os
import sys
import tempfile
import unittest


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from va_runtime.lifecycle import blind_packet, candidate_digest, contains_blind_anchor, corpus_revision
from va_runtime.publisher import evaluate_promotion_gates
import va_runtime.publisher as publisher


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
        "digestContract": "idea-content-v2",
        "baselineCommit": BASELINE,
        "reviewer": {"id": "test-reviewer", "role": "human-reviewer"},
        "decision": "APPROVE",
        "decidedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "identityReview": {"status": "APPROVED"},
        "duplicateReview": {"status": "APPROVED", "semanticReviewId": "semantic-test-1"},
        "lineageVerified": True,
    }


class PublisherAdversarialTests(unittest.TestCase):
    def setUp(self):
        self.authority_file = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8")
        json.dump({"authorities": [{"id": "test-reviewer", "role": "human-reviewer", "active": True}]}, self.authority_file)
        self.authority_file.close()
        self.old_authority_path = os.environ.get("VA_REVIEWER_AUTHORITIES_PATH")
        os.environ["VA_REVIEWER_AUTHORITIES_PATH"] = self.authority_file.name
        self.semantic_file = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8")
        self.semantic_file.close()
        import va_runtime.lifecycle as lifecycle
        self.old_semantic_path = lifecycle.SEMANTIC_REVIEWS_PATH
        self.old_ideas_path = lifecycle.IDEAS_PATH
        lifecycle.SEMANTIC_REVIEWS_PATH = self.semantic_file.name
        self.ideas_file = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8")
        json.dump({"ideas": []}, self.ideas_file); self.ideas_file.close()
        lifecycle.IDEAS_PATH = self.ideas_file.name

    def tearDown(self):
        if self.old_authority_path is None:
            os.environ.pop("VA_REVIEWER_AUTHORITIES_PATH", None)
        else:
            os.environ["VA_REVIEWER_AUTHORITIES_PATH"] = self.old_authority_path
        os.unlink(self.authority_file.name)
        import va_runtime.lifecycle as lifecycle
        lifecycle.SEMANTIC_REVIEWS_PATH = self.old_semantic_path
        lifecycle.IDEAS_PATH = self.old_ideas_path
        os.unlink(self.semantic_file.name); os.unlink(self.ideas_file.name)

    def bind_semantic_review(self, value):
        with open(self.semantic_file.name, "w", encoding="utf-8") as handle:
            json.dump({"reviews": [{"semanticReviewId": "semantic-test-1", "candidateId": value["id"],
                "candidateDigest": candidate_digest(value), "corpusRevision": corpus_revision([]), "nearestIdeaIds": [],
                "decision": "DISTINCT", "reviewer": {"id": "test-reviewer", "role": "human-reviewer"},
                "reviewedAt": dt.datetime.now(dt.timezone.utc).isoformat()}]}, handle)

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
        self.bind_semantic_review(value)
        passed, _, notes = evaluate_promotion_gates(value, [], receipt(value), BASELINE)
        self.assertTrue(passed, notes)

    def test_fake_source_fails_even_with_valid_receipt(self):
        value = candidate(sourceReferences=["source-does-not-exist"])
        self.bind_semantic_review(value)
        passed, _, notes = evaluate_promotion_gates(value, [], receipt(value), BASELINE)
        self.assertFalse(passed)
        self.assertTrue(any("Unknown source IDs" in note for note in notes))

    def test_tampered_candidate_invalidates_receipt(self):
        value = candidate()
        self.bind_semantic_review(value)
        reviewed = receipt(value)
        value["name"] = "Changed After Review"
        passed, _, notes = evaluate_promotion_gates(value, [], reviewed, BASELINE)
        self.assertFalse(passed)
        self.assertTrue(any("subjectDigest mismatch" in note for note in notes))

    def test_invented_semantic_review_id_fails_closed(self):
        value = candidate()
        passed, _, notes = evaluate_promotion_gates(value, [], receipt(value), BASELINE)
        self.assertFalse(passed)
        self.assertTrue(any("semantic duplicate review" in note for note in notes))

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

    def test_blind_packet_rejects_anchor_language_hidden_in_values(self):
        packet = blind_packet(candidate(name="Prior verdict winner, rank 1, score 99"))
        self.assertTrue(contains_blind_anchor(packet))

    def test_prepared_transaction_journal_recovers_split_authority(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            idea_path = os.path.join(temp_dir, "ideas.json")
            receipt_path = os.path.join(temp_dir, "receipts.json")
            journal_dir = os.path.join(temp_dir, "journal")
            manifest_path = os.path.join(journal_dir, "manifest.json")
            original_idea = b'{"ideas":[]}\n'
            original_receipt = b'{"receipts":[]}\n'
            with open(idea_path, "wb") as handle:
                handle.write(original_idea)
            with open(receipt_path, "wb") as handle:
                handle.write(original_receipt)
            old_dir, old_manifest = publisher.JOURNAL_DIR, publisher.JOURNAL_MANIFEST
            publisher.JOURNAL_DIR, publisher.JOURNAL_MANIFEST = journal_dir, manifest_path
            try:
                publisher._begin_transaction_journal({idea_path: original_idea, receipt_path: original_receipt})
                with open(idea_path, "wb") as handle:
                    handle.write(b'{"ideas":[{"id":"idea-999"}]}\n')
                # Simulate hard termination before the receipt replacement. The next
                # publisher startup must restore both files from PREPARED state.
                self.assertTrue(publisher._recover_transaction_journal())
                with open(idea_path, "rb") as handle:
                    self.assertEqual(handle.read(), original_idea)
                with open(receipt_path, "rb") as handle:
                    self.assertEqual(handle.read(), original_receipt)
                self.assertFalse(os.path.exists(manifest_path))
            finally:
                publisher.JOURNAL_DIR, publisher.JOURNAL_MANIFEST = old_dir, old_manifest


if __name__ == "__main__":
    unittest.main()
