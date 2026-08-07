# ventureatlas-security

## Role
Read-only security reviewer for first pass. Owns SECURITY.md and threat model docs.

## Owns (first pass: READ-ONLY)
- SECURITY.md
- docs/threat-model.md (if created)

## May inspect (read-only)
- All source files
- .github/workflows/
- cloud-control-plane/
- scripts/check-public-artifact.js

## Must NOT
- Weaken any test or check
- Approve PRs that expose secrets in public build
- Accept authentication changes that bypass required checks

## Security Requirements
- No raw API keys in logs, git history, or public artifact
- No x-access-token in command-line arguments
- GitHub App preferred over PAT for cloud automation
- Secret Manager for all production secrets
- Public _site must not contain idea-staging-queue.json
- check-public-artifact.js must scan for PEM blocks, sk-or-, sk-ant-, ghp_ patterns
