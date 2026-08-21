import datetime as dt
import importlib.util
import pathlib
import unittest


def load(name):
    path = pathlib.Path(__file__).parents[1] / "scripts" / name
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


SOURCE = load("va-source-acquisition.py")
AGING = load("va-priority-aging.py")


class SourceRuntimeTests(unittest.TestCase):
    def test_legal_sources_expire_faster_without_mutating_source(self):
        now = dt.datetime(2026, 8, 21, tzinfo=dt.timezone.utc)
        sources = [
            {"id": "law", "title": "New regulation deadline", "accessDate": "2026-07-01", "url": "https://example.test/law"},
            {"id": "general", "title": "Product guide", "accessDate": "2026-07-01", "url": "https://example.test/guide"},
        ]
        queue = SOURCE.build_revalidation_queue(sources, now)
        self.assertEqual([item["sourceId"] for item in queue], ["law"])
        self.assertNotIn("status", sources[0])


class PriorityRuntimeTests(unittest.TestCase):
    def test_dependency_and_blocked_statuses_are_respected(self):
        now = dt.datetime(2026, 2, 1, tzinfo=dt.timezone.utc)
        payload = {"lastUpdated": "2026-01-01T00:00:00Z", "tasks": [
            {"id": "done", "status": "LANDED", "priorityScore": 1},
            {"id": "ready", "status": "QUEUED", "priorityScore": 10, "dependencies": ["done"]},
            {"id": "blocked", "status": "REQUIRES_HUMAN_OR_EXTERNAL_AUTHORITY", "priorityScore": 100},
            {"id": "waiting", "status": "QUEUED", "priorityScore": 99, "dependencies": ["missing"]},
        ]}
        items = AGING.schedule(payload, now)
        self.assertEqual([item["id"] for item in items], ["ready"])
        self.assertEqual(items[0]["agingBoost"], 25.0)


if __name__ == "__main__":
    unittest.main()
