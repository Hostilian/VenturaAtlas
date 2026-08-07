# Venture Atlas OS — Failure Modes & Circuit Breaking

| Failure Mode | Root Cause | System Response | Recovery Action |
| :--- | :--- | :--- | :--- |
| **HTTP 429 Rate Limit** | API key quota / rate limit exceeded | Backoff exponential delay + circuit cooldown (180s). Reroute to next key in pool. | Automatic failover to next key / provider. |
| **HTTP 5xx Server Error** | Remote API outage | Record failure count. Open circuit after 3 consecutive failures. | Fallback to next tier engine. |
| **Malformed LLM Output** | Unstructured JSON returned | Reject proposal, log error, skip staging. | Deterministic repair / re-attempt. |
| **Cloud Worker Disconnection** | Container preemption or network drop | Lease expires; next Cloud Scheduler trigger claims pending work. | Unattended Cloud Scheduler retry. |
