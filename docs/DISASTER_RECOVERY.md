# Venture Atlas OS — Disaster Recovery & Backup Plan

- **Canonical Data Backup:** Prior to canonical publication, `data/ideas.json` is preserved in version control and atomic temporary backups.
- **Rollback Procedure:** In event of invalid publication, git revert `main` branch; GitHub Actions automatically redeploys last-known good build.
