---
trigger: always_on
description: Security, secret protection, and zero-critical vulnerability standards
---

# Security & Secrets Rules

1. **Zero Secret Exposure**: Never commit API keys, auth tokens, private credentials, or unmasked secrets to git or public artifacts.
2. **Key Masking**: Always mask API keys in telemetry and log outputs (`sk-...1234`).
3. **Fail-Closed Session Security**: Authentication filters and security endpoints must fail closed upon invalid JWTs or missing signatures.
