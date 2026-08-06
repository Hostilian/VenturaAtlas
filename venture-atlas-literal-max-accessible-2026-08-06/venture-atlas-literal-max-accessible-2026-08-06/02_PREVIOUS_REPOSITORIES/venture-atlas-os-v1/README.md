# Venture Atlas OS
A dependency-free GitHub Pages repository containing **50 structured ideas** and **22 reusable prompts**, with full-text search, filters, favorites, three-way comparison, scoring, monetization, risk, next-step, and agent-build views.

## Coverage
This includes all project families recoverable from available conversation context on August 5, 2026. It is not a full verbatim chat export; missing exact prompts are transparently consolidated or reconstructed. See `docs/SOURCE_COVERAGE.md`.

## Run locally
```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

## Publish
Create a repository, push these files to `main`, open **Settings → Pages**, choose **GitHub Actions**, and run the included workflow.

## Key paths
- `data/ideas.json` — canonical idea database
- `data/prompts.json` — prompt index
- `prompts/` — complete reusable prompts
- `docs/` — scoring, coverage, architecture, import, roadmap, and EUshop history
- `.github/workflows/pages.yml` — validation and Pages deployment
- `scripts/validate_data.py` — schema/link checks

## Privacy
Redact chat exports before committing them. Git history retains deleted secrets; rotate any credential accidentally committed.
