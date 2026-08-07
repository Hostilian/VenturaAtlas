# Security Policy — Venture Atlas OS

## 1. Security Overview
Venture Atlas OS is an open-source static venture research platform and automated discovery engine.
We enforce zero-trust public distribution: internal state, raw provider responses, and staging queues are strictly excluded from the public site build (`_site`).

## 2. API Key Protection
- **No Secrets in Public Build**: The public GitHub Pages artifact (`_site`) strictly allows only canonical, allowlisted JSON files (`ideas.json`, `categories.json`, `rankings.json`, etc.).
- **Secret Manager**: Production API keys are stored in Google Cloud Secret Manager.
- **Provider Masking**: All local runtime logs use provider key aliases (e.g. `openrouter-01`) and masked key prefixes. Raw API keys are never printed to stdout, stderr, or log files.

## 3. Reporting Vulnerabilities
If you discover a potential security vulnerability, please report it via private disclosure:
- Email: security@ventureatlas.os (or open a GitHub Security Advisory)
- Please do not disclose vulnerabilities publicly until they have been remediated.

## 4. Public Data Allowlist Enforcement
The build script (`scripts/build-public-artifact.js`) and security scanner (`scripts/check-public-artifact.js`) automatically inspect all files in `_site` for:
- Private RSA/EC PEM key blocks
- OpenRouter / Anthropic / GitHub secret key patterns (`sk-or-`, `sk-ant-`, `ghp_`)
- Forbidden internal state files (`idea-staging-queue.json`, `.agent-state/`)
