# Venture Atlas OS — Autonomous Runtime Architecture

The autonomous runtime manages multi-agent discovery, scoring, deduplication, artifact generation, and serialized publication.

## Key Components
- `scripts/va_runtime/id_allocator.py`: Serialized canonical ID allocation.
- `scripts/va_runtime/atomic_io.py`: Atomic JSON writes to prevent corruption.
- `scripts/va_runtime/publisher.py`: Serialized publication holding thread lock.
- `scripts/va_runtime/provider_health.py`: Per-key health and cooldown tracking.
- `services/ventureatlas-worker/`: Cloud Run task worker HTTP endpoints.
