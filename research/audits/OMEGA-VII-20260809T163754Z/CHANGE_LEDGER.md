# OMEGA VII — Change Ledger

| ID | Area | Before | After / evidence | Status |
|---|---|---|---|---|
| CHG-001 | Instructions | Volatile counts and false metadata authority | Durable `AGENTS.md` invariants; nested scoped overrides | verified |
| CHG-002 | Codex native | No supported project config/hook/rule/agent chain | `.codex/config.toml`, hooks, policy, rules, six agent profiles; strict/sentinel/actual-hook probes | verified; custom spawn partial |
| CHG-003 | Source truth | ID-prefix privacy inference and warning-on-failure projection | Explicit schema fields, deterministic 71 PUBLIC / 12 INTERNAL migration, fail-closed projection | verified |
| CHG-004 | Public artifact | Recursive research/raw source/internal metadata leakage; checker passed it | Allowlist projection, denied private paths, citation closure, all INTERNAL IDs/titles redacted, unproven legacy validation neutralized, volatile ranking history removed | verified |
| CHG-005 | Container | `COPY . .` with no `.dockerignore` and local `.env` | Secret/private/operator paths excluded from build context | verified statically |
| CHG-006 | Schema | Documented schema and permissive runtime schema disagreed | One wrapper-aware `data/ideas.schema.json`; Node/Python use same authority | verified |
| CHG-007 | Generators | Weak length/revision checks; self-referential manifest; timestamp churn | Complete content checks, atomic writes, stable timestamps, no self hash | verified; live writer correctly causes meta failure |
| CHG-008 | UI evidence | Missing checklist rendered as Verified; score/cost/confidence defaults invented | Missing/legacy/provenance-unavailable states explicit; no false Verified claim | verified by unit/browser |
| CHG-009 | Collaboration | Realtime implication over localStorage | Browser-local/no-sync language | verified by unit/browser |
| CHG-010 | Public home | Hard-coded staging/all counts leaked private scope | Published portfolio only; 71-source public metric | verified by unit/browser |
| CHG-011 | Idea details | Undefined `sourcesCount` blanked page | Distinct real citation IDs counted before render | verified by fresh-origin browser |
| CHG-012 | Reproducibility | No exact artifact digest | Sorted per-file SHA-256 receipt and stable tree digest `3c78d100…d8198d8` | verified twice after final boundary regression pass |
| CHG-017 | Citation UX | Idea pages rendered only bare public source IDs | Public titles, publishers, and safe external links resolved from `public-sources.json` | targeted test and exact-tree browser pass |
| CHG-013 | Tests | Headings implied provider HTTP failure injection | Contract names made truthful; public/source/security/cloud/UI regressions added | 27/27 pass; provider HTTP injection still not performed |
| CHG-015 | Cloud source contract | Wrong API/URI, no scheduler invoker, mutable tag, secret mismatch, credential in argv | v2 job URI, dedicated invoker IAM, digest-only image, aligned aliases, environment-backed askpass | static tests pass; deployment unproven |
| CHG-016 | Task graph gate | Claimed path/graph validation without executing it | Owned-path/root/total/cycle checks implemented; zero-edge graph explicitly warns | structural pass with warning |
| CHG-014 | Git reconciliation | Stable frozen HEAD assumed | Three external commits and origin movement recorded without attribution to primary agent | documented blocker |

No live daemon was stopped. No provider key was read or printed. No cloud resource was mutated.
