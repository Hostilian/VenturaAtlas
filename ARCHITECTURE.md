# Venture Atlas OS — System Architecture Blueprint

## Overview

Venture Atlas OS is an autonomous venture research platform and static business intelligence atlas. It operates as a decoupled two-plane system:

1. **Static Presentation Plane (GitHub Pages / PWA / Edge CDN):**
   - High-performance, zero-cost repository tracking 479 records; the public site serves 294 canonical records and 382 dossier files, plus 4,425 generated prompt files and interactive analysis tools.
   - PWA Service Worker (`sw.js`) providing offline capability with versioned cache invalidation.

2. **Configured Cloud Control Plane (GCP Cloud Run Jobs / Cloud Scheduler / Secret Manager / Firestore):**
   - Source-level infrastructure contract for off-device scheduled work; deployment, IAM reachability, secret versions, and a successful remote execution have not been observed.
   - 9-provider registry (`nvidia-nim`, `cohere-api`, `omniRoute`, `fcc-claude`, `active-api`, `deepseek-api`, `anthropic-full`, `hermes-ollama`, `own-orch`) with key pools and circuit-breaker backoff where configured.

```mermaid
graph TD
    A[Cloud Scheduler] -->|POST Trigger| B[GCP Cloud Run Job]
    B -->|Fetch Keys| C[GCP Secret Manager]
    B -->|Execute Discovery| D[Autonomous Multi-Agent Orchestrator]
    D -->|Bounded Provider Calls| E[Capability and Cost Qualified Provider Pool]
    D -->|Stage Unverified Candidates| F[Private Staging Queue]
    F -->|Reviewed Publication Workflow| G[Canonical JSON and Derived Artifacts]
    G -->|Rebuild Metadata| H[search-index.json & repository-meta.json]
    H -->|Reviewed Commit| I[GitHub Repository]
```

## Core Components

- **Data Store:** Single source of truth in `data/ideas.json`, governed by `data/ideas.schema.json`.
- **Derived Metadata:** `data/repository-meta.json` generated deterministically.
- **Search Engine:** Client-side in-memory index `data/search-index.json` loaded asynchronously by `assets/js/site.js`.
- **Multi-Agent Engine:** Multi-threaded domain discovery in `scripts/autonomous-idea-generator.py` coupled with `scripts/va_orchestrator.py`.
