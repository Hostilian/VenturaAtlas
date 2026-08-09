# Agent Manifest: `repository-forensics-agent`

## Mission & Scope
Read-only inspection of repository architecture, dependency graphs, generated vs canonical data boundaries, and drift detection.

## Owned File Paths
`docs/REPO_AUDIT_*.md`

## Verification Contract
Requires clean pass on `npm run check-consistency` and `npm run test:unit`.
