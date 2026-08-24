# Venture Atlas OS — Search & Discovery Guide

> **How to find, filter, evaluate, and act on business ideas in Venture Atlas OS.**
> Plain-text version available at: `SEARCH_AND_DISCOVERY_GUIDE.txt`

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Using the Search Bar](#using-the-search-bar)
3. [Filter Strategies](#filter-strategies)
4. [Quick-Filter Chips](#quick-filter-chips)
5. [Sorting by Goal](#sorting-by-goal)
6. [Venture Matcher Wizard](#venture-matcher-wizard)
7. [View Modes](#view-modes)
8. [Idea Spotlight & Random](#idea-spotlight--random)
9. [Browsing by Market Family](#browsing-by-market-family)
10. [Comparing Ideas](#comparing-ideas)
11. [Working with Data Offline (JSON/CSV)](#working-with-data-offline-jsoncsv)
12. [Using the Prompt Library](#using-the-prompt-library)
13. [Finding New Ideas to Add](#finding-new-ideas-to-add)
14. [Validating an Idea](#validating-an-idea)
15. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Quick Start

**Five things you can do right now:**

| Goal | Action |
|------|--------|
| Find the highest-rated ideas | Sort by **Overall score** on the main directory |
| Find something you can start today with no money | Use chip filter **💸 $0 Start** |
| Find your best fit based on your skills & budget | Use the **⚡ Venture Matcher** wizard |
| Get a random idea to explore | Click **Random** in the viewbar |
| Download everything to work offline | Click **↓ JSON** or **↓ CSV** |

---

## Using the Search Bar

The search bar (`/` keyboard shortcut to focus) searches across:

- **Idea name** — the canonical title
- **Problem statement** — what pain the idea solves
- **Customer description** — who the target user is
- **Tags** — e.g. `ai`, `eu`, `saas`, `marketplace`
- **Normalized market family and idea type** — e.g. `Healthcare & Life Sciences`, `Compliance Gate & Preflight`
- **Detailed source category** — the original category retained for provenance

### Search Examples

| Query | What you'll find |
|-------|-----------------|
| `compliance eu` | EU regulatory compliance tools |
| `ai agent` | Autonomous AI agent products |
| `marketplace trust` | Trust/verification marketplace ideas |
| `food knowledge graph` | Food data & knowledge systems |
| `zero cost bootstrap` | Zero-capital startup ideas |
| `game language` | Language learning through gaming |
| `repair sustainability` | Product repair / circular economy ideas |
| `research automation` | AI-automated research tools |

### Tips

- Search for a phrase or distinctive term; normalized family, idea type, buyer, category, tags, customer, and problem text are all indexed
- Search is **case-insensitive**
- Combine search with a **category filter** for narrower results
- Press **Esc** to clear the search bar

---

## Filter Strategies

### By Market Family and Idea Type
Use **Market family** for the broad sector and **Idea type** for the business mechanic. For example, selecting `Healthcare & Life Sciences` plus `Compliance Gate & Preflight` keeps related health-compliance ideas together. Use **Detailed category** only when you need the original, more granular source label.

The two dimensions are independent: two compliance gates can share an idea type while serving different markets, and two healthcare ideas can share a market family while using different product mechanics.

### By Status
- **Priority** — top-ranked ideas from research sessions; most complete data
- **Researched** — fully documented with financial models and validation plans
- **Explore** — early-stage ideas worth investigating
- **Archived** — ideas deprioritized but preserved for reference

### Combining Filters
Filters stack. Example: `Market family = Software, AI & Developer Systems` + `Status = Priority` + `Sort = Lowest Cost` gives you the cheapest high-priority software ideas.

---

## Quick-Filter Chips

The chip bar on the home page lets you one-click filter by common tags:

| Chip | What it filters |
|------|----------------|
| 🤖 AI/ML | Ideas using AI, ML, or autonomous agents |
| 🇪🇺 EU Market | Ideas targeting European markets or EU regulation |
| 💸 $0 Start | Zero-dollar bootstrapped ideas (no startup capital needed) |
| 🪙 Low Cost | Ideas startable with $100–$1,000 |
| ⚡ Fast Revenue | Ideas that can generate revenue within 2 weeks |
| 🔥 Priority | Top-priority ideas from tournament ranking |
| ☁️ SaaS | Software-as-a-Service business models |
| 🏪 Marketplace | Two-sided marketplace or platform ideas |
| 🎮 Gaming | Game-related products and tools |
| 🍽️ Food | Food tech, food data, culinary tools |
| 📊 Data | Data products, analytics, intelligence platforms |
| ⚖️ Compliance | Legal, regulatory, compliance automation |

Chips can be **combined** for AND-filtering. Use **✕ Clear** to reset all chips.

---

## Sorting by Goal

Choose your sort based on your primary objective:

| If your goal is… | Sort by |
|-----------------|---------|
| Find the objectively best ideas | **Overall score** |
| Maximize money-making potential | **Profit potential** |
| Spend as little as possible to start | **Lowest startup cost** |
| Get to revenue fast | **Speed to revenue** |
| Use the most research-backed ideas | **Confidence** |
| Scan related ideas together | **Market family & idea type** |
| Put the tightest similarity groups together | **Closest idea clusters** |
| Find ideas least similar to anything else in the portfolio | **Most differentiated** |
| Browse alphabetically | **Name (A–Z)** |
| See what was added most recently | **Recently updated** |

---

## Venture Matcher Wizard

The Venture Matcher (quick version on the homepage, full version at `docs/matcher.html`) helps you find ideas that match your specific situation.

**Three quick questions:**
1. **What is your budget?** — From $0 to $5,000+
2. **How fast do you need revenue?** — Days, weeks, or months
3. **What is your founder strength?** — Solo, Technical, Non-Technical, AI Specialist

**Full Matcher at `docs/matcher.html`** adds:
- Risk tolerance preference
- Hours per week available
- Technical skill level
- Geographic focus (EU / Global)
- Target customer type (B2B / B2C / B2B2C)

The Matcher produces a filtered, ranked list tuned to your profile.

---

## View Modes

Three views are available via the viewbar buttons:

### Cards (Default)
Visual cards with market family, idea type, detailed category, customer, scores, and nearest-neighbor distinctions. Exact normalized-name matches receive a potential-duplicate warning.

### Table
Spreadsheet-style comparison across key dimensions. Best for data-driven selection and exporting to a spreadsheet for further analysis.

### Compact
Dense list with name and key stats only. Best for quickly scanning many ideas.

---

## Idea Spotlight & Random

### Spotlight
The **✨ Idea Spotlight** section on the homepage shows a randomly selected idea with its full score breakdown. Click **Shuffle ↻** to see a different idea. Good for inspiration and exploration.

### Random
The **Random** button in the viewbar opens a randomly selected idea directly. Use this when you're open to surprises — it often surfaces gems that filtering would miss.

---

## Browsing by Market Family

The **📂 Browse by Normalized Market Family** section shows the stable cross-round market families with idea counts. Click a family to filter the directory instantly.

The original detailed category remains visible on every card and detail page. This preserves source terminology without forcing users to browse more than one hundred overlapping labels.

---

## Comparing Ideas

### Compare selected
1. In Cards or Table view, select 2–4 ideas using their checkboxes
2. Click **Compare selected** in the viewbar
3. A side-by-side comparison view opens at `docs/compare.html`

### Direct comparison
Navigate to `docs/compare.html` and use the dropdowns to pick any ideas manually.

The compare view shows market family, idea type, detailed category, buyer segment, target customer, problem, core deliverable, closest alternative, economics, risk, and validation step.

---

## Working with Public Data Offline (JSON)

### Download options
- **↓ JSON** → `data/ideas.json` — sanitized canonical idea projection used by the public site

The source repository may contain additional internal fields and files that are deliberately excluded from the public artifact.

### Use cases
- Import into Google Sheets or Excel for custom analysis
- Feed into an AI assistant (see `prompts/MASTER_SEARCH_PROMPT.md`)
- Build your own visualizations
- Run custom scoring with custom weights

### Key data files
| File | Contents |
|------|----------|
| `data/ideas.json` | Sanitized canonical idea projection used by the site |
| `data/rankings.json` | Published ranking projections with maturity labels |
| `data/prompts.json` | Published prompt records; idea coverage is partial |
| `data/public-sources.json` | Sanitized public citation records |
| `data/categories.json` | Category definitions |
| `data/idea-taxonomy.json` | Normalized families, venture patterns, positioning fields, similarity groups, and nearest neighbors |
| `data/relationships.json` | Idea-to-idea relationship graph |
| `data/repository-meta.json` | Current public inventory counts and projection metadata |
| `data/validation-summary.json` | Sanitized validation-eligibility summary |

---

## Using the Prompt Library

The public prompt projection covers a subset of canonical ideas. Available records are organized by use case:
- Research & validation prompts
- Customer discovery prompts
- Financial modeling prompts
- Technical implementation prompts
- Marketing & sales prompts
- Launch planning prompts

Browse prompts at `docs/prompts.html` or download `data/prompts.json`.

### Master prompt library
| File | Use case |
|------|----------|
| `prompts/research-prompts.md` | Deep research and market analysis |
| `prompts/validation-prompts.md` | Customer discovery and hypothesis testing |
| `prompts/financial-modeling-prompts.md` | Revenue modeling and cost analysis |
| `prompts/marketing-prompts.md` | Go-to-market and growth |
| `prompts/coding-prompts.md` | Technical build and architecture |
| `prompts/sales-prompts.md` | Sales scripts and outreach |
| `prompts/operations-prompts.md` | Process and team building |
| `prompts/product-design-prompts.md` | UX and product specification |
| `prompts/IDEA_LIFECYCLE_PROMPTS.md` | Full lifecycle prompt toolkit |
| `prompts/MASTER_SEARCH_PROMPT.md` | Mega-prompt for AI idea discovery |

---

## Finding New Ideas to Add

### Process for discovering new ideas

1. **Start with a problem** — what pain exists in a market you understand?
2. **Check if it's already here** — search the directory for keywords related to the problem space
3. **Validate the gap** — if not here, is it genuinely novel or a variant of an existing idea?
4. **Use the Master Search Prompt** — feed `prompts/MASTER_SEARCH_PROMPT.md` into an AI to systematically generate new opportunities
5. **Score it** — use the scoring methodology at `docs/methodology.html`
6. **Submit it** — follow `docs/ADDING_AN_IDEA.md` to add it to the repository

### Sources for new ideas
- ChatGPT / Claude / Gemini: "What underserved markets have appeared in the last 12 months?"
- Reddit communities: r/SaaS, r/startups, r/Entrepreneur
- Product Hunt trends
- EU regulatory calendar — new regulations always create compliance tool opportunities
- GitHub Trending — developer pain points become developer tools
- Job boards — industries with mass hiring for painful manual tasks are prime automation targets

---

## Validating an Idea

### Fast validation framework (48 hours)

**Day 1 — Evidence gathering:**
1. Open the idea dossier (`ideas/[idea-slug].md`)
2. Read the validation plan (`validation-plans/[idea-slug].md`)
3. Run the validation prompts from `docs/prompts.html`
4. Google the problem: find 5 people complaining about it in public forums

**Day 2 — Market check:**
1. Find 3 existing competitors or partial solutions
2. Identify 1 differentiating angle this idea has vs. competitors
3. Calculate a realistic revenue scenario using `docs/calculator.html`
4. Write down 3 assumptions you're making that could be wrong

### Validation checklist
- [ ] Problem is real (found 5+ public complaints)
- [ ] Customer is specific and reachable
- [ ] Existing solutions are inadequate (price, UX, or coverage gap)
- [ ] Revenue model is clear (who pays, how much, when)
- [ ] Startup cost is within budget
- [ ] First customer acquisition path is identified
- [ ] You have a founder-edge (skill, network, or insight others lack)

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus the search bar |
| `D` | Toggle dark / light mode |
| `Esc` | Close modals / clear search |

---

*Venture Atlas OS — open research repository. All scores are decision-support tools. Revenue ranges are illustrative scenarios, not forecasts.*
