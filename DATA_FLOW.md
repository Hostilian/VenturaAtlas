# Venture Atlas OS — Data Flow & Single Source of Truth

```text
data/ideas.json (Canonical & Staged Ideas)
   │
   ├──> scripts/build-repository-meta.js ──> data/repository-meta.json
   │                                                 │
   ├──> scripts/build-search-index.js    ──> data/search-index.json
   │                                                 │
   └──> scripts/update-documentation-stats.js ───────┴──> README.md
                                                      ──> PROJECT_STATUS.md
                                                      ──> PROJECT_STATE.md
                                                      ──> index.html (meta tags)
                                                      ──> sw.js (CACHE_VERSION)
```
