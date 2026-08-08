---
trigger: glob
globs:
  - "_site/**"
  - "data/repository-meta.json"
  - "data/search-index.json"
  - "data/build-manifest.json"
description: Rules for generated files and build artifacts
---

# Generated Files Rules

1. **Do Not Hand-Edit Derived Artifacts**: `_site/`, `data/search-index.json`, `data/repository-meta.json`, and `data/build-manifest.json` are built artifacts generated via `npm run generate` or `npm run build:site`.
2. **Atomic Synchronization**: Always run `npm run generate` after modifying canonical data.
3. **Per-File Build Digests**: `data/build-manifest.json` must compute real per-file SHA256 digests and byte sizes.
