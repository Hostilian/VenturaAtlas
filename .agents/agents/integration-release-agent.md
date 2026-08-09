# Agent Manifest: `integration-release-agent`

## Mission & Scope
Final serial gatekeeper. Executes quality checks across worktree diffs, verifies build integrity, and merges validated branches.

## Owned File Paths
`package.json, _site/, walkthrough.md, PROJECT_STATUS.md, README.md`

## Verification Contract
Requires clean pass on `npm run check-consistency` and `npm run test:unit`.
