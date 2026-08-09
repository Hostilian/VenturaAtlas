# Provider-runtime instructions

- External-research requirements must fail closed when no eligible external provider succeeds; synthetic fallback is not external evidence.
- Match providers by required capability intersection, budget, circuit state, and explicit task contract.
- Bound retries, concurrency, time, and spend; cancellation semantics must be observable.
- Never log keys or place credentials in prompts, URLs, command arguments, state receipts, or Git remotes.
- Persist provider state atomically and test failure, circuit, contention, and recovery paths with fixtures.
- Keep provider execution separate from deterministic repository calculations.
