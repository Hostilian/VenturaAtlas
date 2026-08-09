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
9. [Browsing by Category](#browsing-by-category)
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
- **Category** — e.g. `AI Tools`, `Food & Beverage`

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

- Use **multiple words** — results are ANDed (all words must appear)
- Search is **case-insensitive**
- Combine search with a **category filter** for narrower results
- Press **Esc** to clear the search bar

---

## Filter Strategies

### By Category
Use the **Category** dropdown to browse a specific sector:
- `AI / Autonomous Agents` — pure AI/ML product businesses
- `EU Compliance & Regulation` — EU-law based services
- `Food & Beverage` — food tech, knowledge graphs, evidence registries
- `Developer Tools` — APIs, SDKs, CLI tools
- `Marketplace` — two-sided markets, trust layers, seller tools
- `Education` — language learning, Erasmus tools, course matching

### By Status
- **Priority** — top-ranked ideas from research sessions; most complete data
- **Researched** — fully documented with financial models and validation plans
- **Explore** — early-stage ideas worth investigating
- **Archived** — ideas deprioritized but preserved for reference

### Combining Filters
Filters stack. Example: `Category = AI Tools` + `Status = Priority` + `Sort = Lowest Cost` gives you the cheapest high-priority AI ideas.

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
Visual cards with name, category, customer, scores, tags, and action buttons. Best for discovery and browsing.

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

## Browsing by Category

The **📂 Browse by Category** section at the bottom of the homepage shows every category with idea counts. Click any category card to filter the directory instantly.

Deep-dive into a category at `categories/` — each category folder contains a dedicated index with all ideas in that space.

---

## Comparing Ideas

### Compare selected
1. In Cards or Table view, select 2–4 ideas using their checkboxes
2. Click **Compare selected** in the viewbar
3. A side-by-side comparison view opens at `docs/compare.html`

### Direct comparison
Navigate to `docs/compare.html` and use the dropdowns to pick any ideas manually.

The compare view shows: scores, customer types, startup costs, revenue speed, evidence labels, tags, and links to full dossiers.

---

## Working with Data Offline (JSON/CSV)

### Download options
- **↓ JSON** → `data/ideas.json` — full structured data, all fields, all 294+ ideas
- **↓ CSV** → `data/ideas.csv` — flat spreadsheet format, all key fields

### Use cases
- Import into Google Sheets or Excel for custom analysis
- Feed into an AI assistant (see `prompts/MASTER_SEARCH_PROMPT.md`)
- Build your own visualizations
- Run custom scoring with custom weights

### Key data files
| File | Contents |
|------|----------|
| `data/ideas.json` | Full canonical idea dataset (all fields) |
| `data/ideas.csv` | Flat CSV of all ideas |
| `data/rankings.json` | 30 ranking views with scoring |
| `data/prompts.json` | All 25-per-idea prompts |
| `data/sources.json` | All citations and source records |
| `data/categories.json` | Category definitions |
| `data/tags.json` | All tags with descriptions |
| `data/relationships.json` | Idea-to-idea relationship graph |
| `data/sensitivity-analysis.json` | Score sensitivity to input changes |
| `data/research-runs.json` | Research session history |
| `data/decisions.json` | Formal collaborative decisions |
| `data/pairwise-votes.json` | Pairwise voting data |

---

## Using the Prompt Library

Every canonical idea has **25 prompts** organized by use case:
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
