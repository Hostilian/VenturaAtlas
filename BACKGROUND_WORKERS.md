# Venture Atlas OS — Background Runtime Contract

Venture Atlas uses bounded recurring automation. It does not promise that an AI process is literally running every second.

## Runtime planes

1. **Scheduled GitHub Actions research plane — active cloud recurrence**

   - `.github/workflows/research-cycle.yml` requests one bounded research and review cycle each hour.
   - `.github/workflows/autonomy-monitor.yml` checks scheduled-run receipts every 15 minutes and raises a deduplicated issue when the research schedule is stale or repeatedly failing.
   - GitHub may delay scheduled starts. Only a fresh run receipt proves recent operation; the workflow file itself does not.
   - Private candidate/provider state is retained in a private Actions cache. Public artifacts receive only sanitized receipts.

2. **Windows desktop supervisor — optional development recurrence**

   - The canonical installer is `scripts/Install-VentureAtlas-AutonomyTask.ps1`.
   - It launches `scripts/Start-VentureAtlas-Supervisor.ps1`, which runs `scripts/va-daemon-runner.py` with a single-process lock, bounded concurrency, provider fan-out, and cost-class controls.
   - This plane works only while the host, Windows session, scheduled task, and required local services are available. A registered or enabled task is not proof of a fresh heartbeat.
   - `scripts/Install-VentureAtlas-Autostart.ps1`, `scripts/Install-VentureAtlas-StartupTask.ps1`, and `scripts/Start-VentureAtlas-AutonomousDaemon.ps1` are legacy entry points and are not the canonical installation path.

3. **GCP Cloud Run control plane — optional, externally blocked until deployed**

   - `cloud-control-plane/` contains a deployable design, not proof of a deployed service.
   - Do not describe this plane as running until deployment identity, scheduler/job identity, revision, fresh consecutive execution receipts, provider reachability, and durable state continuity have been verified.

4. **Hermes/Ollama — optional local provider**

   - Hermes is reachable only while Ollama is running and the configured model is available on the host.
   - The deterministic `own-orch` path is a degraded, offline orchestration fallback; it is not external market evidence.

## Health evidence

Current user-facing status is resolved by `assets/js/runtime-status.js` and shown at `docs/live-progress.html`.

- A same-origin `/progress` heartbeat is live only when structurally valid and fresh.
- Static deployments fall back to recent scheduled GitHub Actions receipts.
- Repository metadata, configured credentials, queued work, generated timestamps, and model consensus never become runtime-health proof.
- Missing or stale receipts produce `unknown`, `stale`, or `degraded` states rather than a green default.

## Operating invariants

Every recurring writer must have a cadence, exclusive lease or lock, idempotency key, bounded retry/backoff policy, checkpoint, cost/time/fan-out budget, failure receipt, and explicit degraded/stop condition. Canonical publication remains serialized and gated; background discovery stays in private staging until evidence and lifecycle rules authorize promotion.
