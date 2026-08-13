import json
import os
import sys
import tempfile
import unittest


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import va_runtime.semantic_review as semantic_review


class SemanticReviewIssuanceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.old = (
            semantic_review.REVIEWS_PATH, semantic_review.AUTHORITIES_PATH,
            semantic_review.IDEAS_PATH, semantic_review.REVIEW_LOCK_PATH,
        )
        semantic_review.REVIEWS_PATH = os.path.join(self.temp.name, "reviews.json")
        semantic_review.AUTHORITIES_PATH = os.path.join(self.temp.name, "authorities.json")
        semantic_review.IDEAS_PATH = os.path.join(self.temp.name, "ideas.json")
        semantic_review.REVIEW_LOCK_PATH = os.path.join(self.temp.name, "locks", "semantic.lock")
        self.write(semantic_review.REVIEWS_PATH, {"schemaVersion": "1.0.0", "reviews": []})
        self.write(semantic_review.IDEAS_PATH, {"ideas": [{"id": "idea-001", "slug": "one", "name": "One", "oneSentenceConcept": "First"}]})

    def tearDown(self):
        (semantic_review.REVIEWS_PATH, semantic_review.AUTHORITIES_PATH,
         semantic_review.IDEAS_PATH, semantic_review.REVIEW_LOCK_PATH) = self.old
        self.temp.cleanup()

    @staticmethod
    def write(path, value):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as handle:
            json.dump(value, handle)

    @staticmethod
    def candidate():
        return {"id": "candidate-test-12345678", "candidateSlug": "test", "name": "Test", "category": "Test", "oneSentenceConcept": "Test semantic review authority."}

    def test_empty_production_style_allowlist_fails_closed(self):
        self.write(semantic_review.AUTHORITIES_PATH, {"schemaVersion": "1.0.0", "authorities": []})
        with self.assertRaisesRegex(semantic_review.SemanticReviewIssuanceError, "active configured authority"):
            semantic_review.issue_semantic_review(self.candidate(), "invented", "DISTINCT", [])

    def test_active_authority_can_issue_bound_review_once(self):
        self.write(semantic_review.AUTHORITIES_PATH, {"schemaVersion": "1.0.0", "authorities": [
            {"id": "owner", "role": "repository-owner", "active": True}
        ]})
        review = semantic_review.issue_semantic_review(self.candidate(), "owner", "DISTINCT", ["idea-001"])
        self.assertEqual(review["reviewer"], {"id": "owner", "role": "repository-owner"})
        self.assertEqual(review["nearestIdeaIds"], ["idea-001"])
        with self.assertRaisesRegex(semantic_review.SemanticReviewIssuanceError, "already exists"):
            semantic_review.issue_semantic_review(self.candidate(), "owner", "DISTINCT", ["idea-001"])

    def test_unknown_nearest_idea_fails(self):
        self.write(semantic_review.AUTHORITIES_PATH, {"schemaVersion": "1.0.0", "authorities": [
            {"id": "owner", "role": "repository-owner", "active": True}
        ]})
        with self.assertRaisesRegex(semantic_review.SemanticReviewIssuanceError, "do not resolve"):
            semantic_review.issue_semantic_review(self.candidate(), "owner", "DUPLICATE", ["idea-999"])


if __name__ == "__main__":
    unittest.main()
