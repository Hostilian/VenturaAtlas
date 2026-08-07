# Venture Atlas OS — Failure Modes & Recovery Matrix

- **429 Storm:** Key cooling down for 60s; adjacent keys continue processing backlog.
- **500 Server Error:** Bounded exponential backoff + 30s cooldown.
- **Malformed LLM Output:** Rejected safely without corrupting queue or ideas.json.
- **Worker Termination:** Lease expires; next scheduler cycle reclaims job.
