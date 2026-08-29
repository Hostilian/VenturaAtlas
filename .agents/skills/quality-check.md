---
name: quality-check
description: Runs the full deterministic quality completion sequence, linters, duplication gates, and tests.
version: 1.0.0
---

# Quality Check Skill (Deterministic Tooling Suite)

## When to Use
Execute this skill upon completing any feature, bugfix, refactoring, or documentation update before committing code or claiming task completion.

## Mandatory Deterministic Tool Commands

```bash
# 1. Code Quality & Duplication (Fallow, Knip, JSCPD, Wallace)
npx fallow analyze
npm run check:duplicates   # jscpd
npm run check:unused       # knip
npm run check:css-metrics  # wallace

# 2. Linting & Formatting (ESLint 9, StyleLint)
npm run check:eslint
npm run check:stylelint
npm run format:check

# 3. Runtime Error & Telemetry (Sentry, Spotlight)
npm run check:bugs

# 4. Exploratory Browser QA (Agent Browser, Lightpanda)
npm run check:browser
npm run check:smoke

# 5. Task & Backlog Management (Beads, Dex)
node scripts/task.js next
npm run check-task-graph

# 6. Full Completion Gate (The 14-Step Sequence)
npm run quality:gate
```

## Agent Operational Disciplines
1. **Never guess**: Always run deterministic tools (`fallow`, `jscpd`, `knip`, `eslint`, `stylelint`) to produce verified ground truth.
2. **Context7 First**: Query Context7 MCP before writing code against version-sensitive libraries (Stripe 17.7.0, AWS SDK v3 3.1108.0, Playwright 1.62.1, Zod 3.24.2).
3. **No Unverified Deletion**: Review all Knip/Fallow unused findings; never run unverified auto-deletions.
4. **Task Citation Discipline**: Every task annotation must follow the format `// TODO(TASK-ID): explanation`.
5. **Fail-Closed**: Any non-zero exit code is a blocking gate.
