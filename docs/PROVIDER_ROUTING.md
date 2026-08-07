# Venture Atlas OS — Provider Routing & Key Scheduling

## Per-Key Isolation
Each credential key operates under distinct health, active request counters, and rolling 429/5xx error tracking.

- `AUTH_INVALID` (401): Key disabled immediately.
- `RATE_LIMITED` (429): Key cools down for 60s without disabling sister keys.
- `PROVIDER_5XX`: 30s cooldown before retry.
