# Venture Atlas OS — Security Threat Model

## Security Boundaries & Controls

1. **Secret Isolation:**
   - Secrets (`OPENROUTER_API_KEYS`, `ANTHROPIC_API_KEYS`, `GITHUB_TOKEN`) are strictly prohibited in `_site/` public artifacts or browser client bundles.
   - Verified automatically via `scripts/check-public-artifact.js`.

2. **Untrusted Data Boundaries:**
   - External LLM completions and scraped market research are classified as untrusted data.
   - AI outputs must be validated against `data/ideas.schema.json` before promotion.

3. **ToS Compliance & Quota Protection:**
   - Round-robin key rotation operates within provider-allowed concurrency and rate limits.
   - Key rotation is NEVER used to evade provider bans, billing restrictions, or abuse detection.

4. **Telemetry Egress & PII Scrubbing:**
   - Error monitoring events (Sentry/Spotlight) pass through fail-closed sanitization.
   - Stripe credentials, JWT tokens, user email addresses, and auth headers are stripped prior to egress.

