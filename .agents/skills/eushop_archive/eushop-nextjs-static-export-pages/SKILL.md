---
name: eushop-nextjs-static-export-pages
description: "Next.js Pages Router Static Export Pre-rendering & GitHub Pages Deployment Skill for EUshop"
---

# EUshop Next.js Static Export & GitHub Pages Skill

## Overview

This skill establishes pre-rendering guidelines for Next.js in `apps/web/` targeting static export for GitHub Pages under `basePath: ''`.

---

## 1. Static Export Rules

- **Base Path**: `next.config.js` sets `basePath: ''`, `assetPrefix: ''`, `trailingSlash: true`.
- **Pre-rendered Routes**: All 26 static routes must pre-render cleanly without SSR runtime dependencies.
- **Truthful Demo Fallbacks**: When backend APIs (port 3001) are unreachable, frontend components render isolated demo data labeled as `[DEMO MODE]`.
