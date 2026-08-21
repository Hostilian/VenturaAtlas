# SmallSoft Gate — Secure Runtime for Tiny Agent-Built Apps

## Metadata
- **Status:** `DUPLICATE_REUNDERWRITING`
- **Canonical relation:** re-underwrite `idea-359` Small-Software Deployment Cloud
- **Reset:** RESET XX (2026-08-21)
- **Score:** 8.0 / 10
- **Category:** Developer Tools / AI Runtime Security
- **Domain:** Small Software / AI Internal Apps / Sandboxed Sharing

## 1. Executive Summary
SmallSoft Gate is the secure runtime and deployment wrapper for "Small Software" — the explosion of single-user or tiny-team apps built by AI agents (Claude, Codex, Gemini). While building apps has become trivial, deploying arbitrary AI-generated code securely with auth, secret isolation, user allowlists, and auto-expiration remains painful. SmallSoft Gate turns `localhost` AI tools into private, hardened web applications via a single CLI command (`smallgate deploy`).

## 2. The Problem
- AI coding tools make bespoke internal apps free to create.
- Some builders keep tools on `localhost` because sharing them can require authentication, secret management, permissions, networking, and infrastructure work. Prevalence has not been measured.
- Untrusted AI-generated code introduces prompt injection, data exfiltration, and credential leak risks if exposed naively.

## 3. Product Architecture (`smallgate deploy`)
- **Zero-Config Auth:** Instant Google Login / Passkey authentication with email allowlists.
- **Secret Isolation:** Secure credential vault with read-only/read-write scoping.
- **Runtime Sandboxing:** Outbound network restrictions and resource limits.
- **Lifecycle Management:** 7-day or 30-day automatic TTL, one-click destroy, and version rollback.
- **Audit Logging:** Track who accessed what data inside AI-generated utilities.

## 4. Validation Playbook
- **Target Customer:** Power users and agency operators with 5–10 AI-generated internal tools currently running on `localhost`.
- **Offer:** "€29 Concierge Deployment — I will turn your local AI script/dashboard into a private, auth-gated team app in 15 minutes."
- **Required comparison:** Replit private deployments plus Vercel, Cloudflare, and Modal sandboxes.
- **Pass Criteria:** 5 paid deployments from 3 builders, 2 repeat deployments, and 3 buyers naming a required control absent from their cheapest substitute.

This is not a fresh candidate. Its surviving contribution is a security-policy wrapper experiment for existing `idea-359`.
