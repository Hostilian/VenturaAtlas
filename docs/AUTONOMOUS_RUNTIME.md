# Venture Atlas OS — Autonomous Runtime Architecture

The runtime performs bounded discovery, scoring, deduplication, review, validation checks, and private staging. “Autonomous” means scheduled and resumable within explicit limits; it does not mean perpetual availability or permission to publish unverified material.

## Current planes

- **GitHub Actions:** `research-cycle.yml` requests an hourly bounded cycle; `autonomy-monitor.yml` evaluates scheduled receipts. This is the currently evidenced off-machine recurrence.
- **Windows desktop:** optional development supervisor installed with `scripts/Install-VentureAtlas-AutonomyTask.ps1`. It operates only while the host and scheduled task are available.
- **GCP Cloud Run:** deployable code exists under `cloud-control-plane/`, but configuration is not deployment proof.
- **Hermes/Ollama:** optional laptop-local provider. It is unavailable when Ollama or the model is unavailable.

See [`../BACKGROUND_WORKERS.md`](../BACKGROUND_WORKERS.md) for the plane-by-plane truth contract and [`live-progress.html`](live-progress.html) for current public receipts.

## Safety components

- `scripts/va_runtime/id_allocator.py`: serialized canonical ID allocation.
- `scripts/va_runtime/atomic_io.py`: atomic JSON writes.
- `scripts/va_runtime/process_lock.py`: inter-process supervisor and provider-state locks.
- `scripts/va_runtime/publisher.py`: serialized lifecycle-gated publication.
- `scripts/va_runtime/provider_health.py`: per-key health, failure, and cooldown tracking.
- `scripts/va-daemon-runner.py`: bounded local recurrence and checkpointing.
- `services/ventureatlas-worker/`: cloud worker endpoints.

## Local setup

Run the following only when you want optional local recurrence:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/Install-VentureAtlas-AutonomyTask.ps1 -StartNow
```

The task launches the canonical supervisor with bounded concurrency, provider fan-out, and cost class. Task Scheduler ignores duplicate starts and the runner lock provides a second guard. Health is written to private `.agent-state` receipts. Inspect the scheduled task and heartbeat separately; installation alone does not prove it is running.

Remote credentials being configured does not prove a provider will accept a request. Provider failures, cooldowns, budget exhaustion, and unavailable local models are expected degraded states and must be recorded rather than concealed.

## Publication boundary

Discovery and model review remain private hypotheses. They may not become canonical or public solely because several models agree. Promotion requires the repository lifecycle, source, authority, and publisher gates. Failed or interrupted runs must leave canonical data unchanged and produce a resumable private receipt.
