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
- Open a private security advisory via GitHub Security Advisories: https://github.com/Hostilian/VenturaAtlas/security/advisories/new
- Please do not disclose vulnerabilities publicly in public issues or discussions until they have been remediated.

## 4. Public Data Allowlist Enforcement
The build script (`scripts/build-public-artifact.js`) and security scanner (`scripts/check-public-artifact.js`) automatically inspect all files in `_site` for:
- Private RSA/EC PEM key blocks
- OpenRouter / Anthropic / GitHub secret key patterns (`sk-or-`, `sk-ant-`, `ghp_`)
- Forbidden internal state files (`idea-staging-queue.json`, `.agent-state/`)

## 5. CRA Pre-Release Gate

Before any software, client, extension, package, firmware, or connected product is distributed commercially in the EU, the release owner must record:

- the product boundary and whether any remote data processing is necessary for a product function;
- the distribution mode, data connection, commercial-activity basis, and applicable exclusion analysis;
- the economic-operator role and Article 14(7) reporting endpoint;
- the responsible vulnerability-intake and legal-decision owners;
- the evidence source for awareness time, affected products and versions, exploitation status, mitigation, and affected-user notice;
- readiness for the 24-hour early warning, 72-hour notification, and applicable final report; and
- one timed tabletop exercise using a synthetic actively exploited vulnerability and a separate severe-incident scenario.

The current public static site, public source repository, and local FactBounty prototype have not been classified as in-scope CRA products. That preliminary repository screen is not a legal opinion and must be repeated if distribution or monetisation changes.

## 6. Telemetry & Error Monitoring Data Sanitization

When error monitoring (Sentry / Spotlight) is activated:
- All telemetry payloads pass through a mandatory `beforeSend` data scrubber (`services/sentry-config.js`).
- Stripe secret/restricted keys, JWT bearer tokens, credit card numbers, passwords, authorization headers, and customer email addresses are redacted before leaving the execution environment.
- Local dev debugging uses Spotlight sidecar (`npx @spotlightjs/spotlight`) requiring zero external network credentials.

