# Venture Atlas OS — Background Workers Specification

## Worker Plane Options

1. **Unattended GCP Cloud Control Plane (Production):**
   - Executed via `cloud-control-plane/job_runner.py` in GCP Cloud Run Jobs.
   - Operates 24/7 independently of local developer laptop or open IDE sessions.

2. **Windows Desktop Background Daemon (Development):**
   - Executed via `scripts/Start-VentureAtlas-AutonomousDaemon.ps1`.
   - Autostarted via `VentureAtlas-Always-On.cmd` in Windows Startup directory with `:LOOP` auto-restart resilience.
