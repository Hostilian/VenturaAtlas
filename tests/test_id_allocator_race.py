#!/usr/bin/env python3
"""
Python Test Helper for Candidate UUID & Publisher Race Conditions
"""

import os
import sys
import shutil
import tempfile
import concurrent.futures
import datetime
from unittest import mock

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "scripts"))

import importlib
aig = importlib.import_module("autonomous-idea-generator")
generate_candidate_id = aig.generate_candidate_id

from va_runtime.id_allocator import allocate_next_canonical_id
import va_runtime.publisher as pub
from va_runtime.lifecycle import candidate_digest, current_git_commit

def test_20_candidates_unique_uuids():
    def worker_task(idx):
        return generate_candidate_id()

    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(worker_task, i) for i in range(20)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    assert len(results) == 20, f"Expected 20 results, got {len(results)}"
    assert len(set(results)) == 20, f"Expected 20 unique candidate UUIDs, got {len(set(results))}"
    for cid in results:
        assert cid.startswith("candidate-"), f"Expected candidate- prefix, got {cid}"
        assert not cid.startswith("idea-"), f"Parallel worker allocated permanent idea-XXX ID: {cid}"
    print("PASS: 20 concurrent candidates received 20 unique candidate UUIDs")

def test_simultaneous_publishers_unique_ids():
    temp_dir = tempfile.mkdtemp()
    temp_ideas = os.path.join(temp_dir, "ideas.json")
    shutil.copyfile(pub.IDEAS_PATH, temp_ideas)

    orig_ideas_path = pub.IDEAS_PATH
    orig_receipts_path = pub.RECEIPTS_PATH
    pub.IDEAS_PATH = temp_ideas
    pub.RECEIPTS_PATH = os.path.join(temp_dir, "lifecycle-receipts.json")
    authority_path = os.path.join(temp_dir, "reviewer-authorities.json")
    old_authority_path = os.environ.get("VA_REVIEWER_AUTHORITIES_PATH")
    os.environ["VA_REVIEWER_AUTHORITIES_PATH"] = authority_path
    with open(authority_path, "w", encoding="utf-8") as handle:
        handle.write('{"authorities":[{"id":"race-test","role":"human-reviewer","active":true}]}\n')
    with open(pub.RECEIPTS_PATH, "w", encoding="utf-8") as handle:
        handle.write('{"schemaVersion":"1.0.0","receipts":[]}\n')

    try:
        def publisher_task(idx):
            cand = {
                "id": f"candidate-race-{idx:04d}",
                "candidateSlug": f"unique-test-idea-{idx}",
                "name": f"Unique Test Idea {idx}",
                "category": "Testing",
                "oneSentenceConcept": "A schema-valid race-condition publication fixture.",
                "sourceReferences": [],
            }
            receipt = {
                "schemaVersion": "1.0.0",
                "receiptId": f"receipt-canonicalize-race-{idx:04d}",
                "receiptType": "CANONICALIZE",
                "subjectId": cand["id"],
                "subjectDigest": candidate_digest(cand),
                "digestContract": "idea-content-v2",
                "baselineCommit": current_git_commit(),
                "reviewer": {"id": "race-test", "role": "human-reviewer"},
                "decision": "APPROVE",
                "decidedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "identityReview": {"status": "APPROVED"},
                "duplicateReview": {"status": "APPROVED", "semanticReviewId": f"semantic-race-{idx}"},
                "lineageVerified": True,
            }
            ok, msg, cid = pub.publish_candidate(cand, receipt)
            return ok, cid

        successful = mock.Mock(returncode=0, stdout="ok", stderr="")
        with mock.patch.object(pub.subprocess, "run", return_value=successful):
            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                futures = [executor.submit(publisher_task, i) for i in range(5)]
                results = [f.result() for f in concurrent.futures.as_completed(futures)]

        allocated_ids = [cid for ok, cid in results if ok and cid]
        assert len(allocated_ids) == 5, f"Expected exactly 5 successful publications, got {results}"
        assert len(allocated_ids) == len(set(allocated_ids)), "Duplicate canonical IDs detected!"
        print(f"PASS: Simultaneous publishers allocated {len(allocated_ids)} unique canonical IDs")
    finally:
        if old_authority_path is None:
            os.environ.pop("VA_REVIEWER_AUTHORITIES_PATH", None)
        else:
            os.environ["VA_REVIEWER_AUTHORITIES_PATH"] = old_authority_path
        pub.IDEAS_PATH = orig_ideas_path
        pub.RECEIPTS_PATH = orig_receipts_path
        shutil.rmtree(temp_dir)

if __name__ == "__main__":
    test_20_candidates_unique_uuids()
    test_simultaneous_publishers_unique_ids()
