# CodexRuntime prototype

An architectural experiment for shared regulatory transaction primitives. It is not marketed, production-ready, certified, or a legal-compliance engine.

The requested monorepo boundaries are represented under `apps`, `services`, `packages`, `adapters`, and `testpacks`. Executable prototype code lives in one `codex_runtime` package to prove reuse before splitting services.

## Demonstrated

- canonical regulatory event validation;
- deterministic object/evidence hashes;
- versioned receipts;
- guarded transaction transitions;
- uncertain-commit reconciliation state;
- deterministic conformance findings;
- adapter boundary that never claims legal compliance.

## Run

```powershell
python demo.py
python -m unittest discover -s tests -v
```

No network call is made. The EUDR behavior is a synthetic fixture, not an official API implementation.

