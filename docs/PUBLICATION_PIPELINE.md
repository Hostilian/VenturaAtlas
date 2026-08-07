# Venture Atlas OS — Serialized Publication Pipeline

1. Candidate passed validation and red-team checks.
2. Publisher acquires thread/process lock (`locks/canonical-publisher`).
3. Allocates next canonical `idea-XXX` ID using `va_runtime.id_allocator`.
4. Appends candidate to `data/ideas.json` atomically using `atomic_write_json`.
5. Rebuilds `repository-meta.json` and `search-index.json`.
