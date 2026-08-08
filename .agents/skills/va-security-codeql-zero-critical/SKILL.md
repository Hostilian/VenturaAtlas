---
name: va-security-codeql-zero-critical
description: Zero-critical CodeQL security enforcement, taint sink remediation, and OWASP mitigation for VenturaAtlas OS.
---

# Zero-Critical Security Enforcement & Taint Sink Remediation

This skill enforces strict zero-critical security vulnerability guidelines for all VenturaAtlas code and subproducts.

## Security Controls

1. **Taint Sink Remediation**:
   - Never pass unsanitized user inputs or scraped content directly into innerHTML, `eval()`, shell subprocesses, or SQL queries.
   - Sanitize HTML inputs using DOMPurify or textContent node assignment.

2. **Zero Plaintext Secrets**:
   - Verify zero API keys, secrets, or bearer tokens exist in source code or `_site/` static output via `python scripts/check_privacy.py`.

3. **Security Preflight**:
   - Preflight security check prior to merging:
     ```bash
     npm run check:secrets
     ```
