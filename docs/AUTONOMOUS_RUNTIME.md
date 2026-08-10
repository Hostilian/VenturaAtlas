# Venture Atlas OS — Autonomous Runtime Architecture

The autonomous runtime manages multi-provider discovery, scoring, deduplication, validation, and ranking.

## Key Components
- `scripts/va_runtime/id_allocator.py`: Serialized canonical ID allocation.
- `scripts/va_runtime/atomic_io.py`: Atomic JSON writes to prevent corruption.
- `scripts/va_runtime/process_lock.py`: Inter-process locks for the supervisor and provider state.
- `scripts/va_runtime/publisher.py`: Serialized publication holding thread lock.
- `scripts/va_runtime/provider_health.py`: Per-key health and cooldown tracking.
- `services/ventureatlas-worker/`: Cloud Run task worker HTTP endpoints.

## Local continuous loop

Run `powershell -File scripts/Install-VentureAtlas-Autostart.ps1` once. It registers the current-user `VentureAtlasAutonomy` scheduled task with restart-on-failure and a login launcher. Windows then starts one hidden `va-daemon-runner.py` supervisor at sign-in. Task Scheduler ignores duplicate task launches, and the runner's process lock provides a second guard (exit code 23). The current state is written to `.agent-state/autonomy-heartbeat.json`.

Each task uses only capability-matched providers with configured keys, a closed circuit, and a cost class at or below `VA_MAX_COST_CLASS`. `VA_PROVIDER_FANOUT` limits redundant calls (default 2), while provider rotation distributes tasks across the eligible pool. Idle time and circuit cooldown are intentional safety controls; the runtime does not burn paid quota merely to keep a key busy.

Hermes/Ollama is laptop-local and is available only while Ollama is running. `own-orch` is the deterministic offline fallback. Remote credentials being configured does not prove a provider will accept a request; live failures are recorded in provider state and logs.

The local loop cannot execute while the computer is powered off. That requirement is handled by the separately deployed Cloud Run Job and Cloud Scheduler control plane.
