# `idea-359` Small-Software Deployment Cloud — Security Wrapper Re-underwriting

**Disposition:** Merge into existing canonical `idea-359`; do not validate or promote SmallSoft Gate as a separate idea.

## 1. Core Falsification Hypothesis
**Hypothesis:** AI power users and internal operators building bespoke 1-to-10 user tools with Claude/Codex/Gemini will pay €29/app to securely deploy and share their local scripts with colleagues with instant auth, user allowlists, and auto-destroy TTLs.

**Kill Trigger:** Kill if Replit private deployments or existing Vercel, Cloudflare, or Modal sandbox primitives solve the workflow at lower total cost, buyers will not provide an app, or no buyer pays after 30 qualified offers.

## 2. Target Audience (Sample Size: 30)
- AI-forward operators and consultants sharing custom automation scripts
- Internal tooling leads at tech-forward agencies
- Founders with multiple local AI dashboards

## 3. Concierge Validation Offer (€29)
- "Send your local Python/Node script or repository."
- We wrap it with:
  - Google Workspace / Passkey login
  - Read/write secret vault
  - Outbound domain whitelisting
  - 14-day auto-destroy TTL
- Live private URL delivered within 30 minutes.

Before handling customer code, define the data-retention, secret-handling, dependency-scanning, outbound-network, deletion, and incident-response boundaries. Do not promise a 30-minute delivery until one full deployment has been timed.

## 4. Success Criteria
- 5 paid deployments from 3 builders within 10 days.
- 2 repeat deployments.
- 3 buyers identify a required control absent from their cheapest substitute.
