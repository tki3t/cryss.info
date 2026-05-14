# Agents & Skills Index

Single-page routing guide: **which agent / skill to pick for each situation, and which not to pick**. Keeps Claude Code's auto-routing unambiguous and avoids agent overlap.

---

## Decision Matrix — Implementation

| Situation | Primary agent | Why | Avoid |
|-----------|---------------|-----|-------|
| New backend endpoint / service / migration | `fullstack-developer` | Stack-agnostic backend expert, loads `backend-patterns.md` on demand | Don't use `vite-react-developer` (frontend-only) |
| Vite + React SPA component, hook, route, query, form | `vite-react-developer` | TS + React 18/19 idioms, TanStack Query, RHF+zod | Don't use `fullstack-developer` for React work |
| C / C++ / ObjC / ObjC++ native code; `.dylib` tweak; iOS / macOS hook; overlay menu; ESP | `game-tweak-engineer` | Theos / MonkeyDev / ElleKit / Substrate / Dobby / fishhook / ImGui-Metal | Don't use `fullstack-developer` — wrong toolchain |
| Blade / Twig / Livewire / Inertia / htmx / Vue / Svelte / SSR view | `fullstack-developer` | Covers non-React frontends | — |
| New architectural decision, choice of library, service boundary | `solution-architect` | Produces ADR + rationale | Don't let `fullstack-developer` improvise |
| Requirements analysis, user stories, AC | `business-analyst` | Produces Gherkin + MoSCoW prioritisation | — |
| Writing or improving tests | `qa-engineer` | Owns TDD RED + coverage quality | — |
| UX polish, a11y, design-system conformance | `uiux-designer` | WCAG 2.1 AA + design tokens | — |
| Technical + on-page SEO, meta, JSON-LD, sitemap, hreflang, canonical | `seo-specialist` | Crawlability & SERP visibility | Don't use `uiux-designer` for SEO — overlap is only on semantic HTML |

---

## Decision Matrix — Review

| Situation | Primary agent | Why | Avoid |
|-----------|---------------|-----|-------|
| Pre-commit full review of local diff | `/review-local-changes` skill | Orchestrates the right review agents with impact/confidence scoring | Don't invoke review agents manually one by one |
| PR review posted as inline comments | `/review-pr` skill | Same orchestration, GitHub-aware | — |
| "Is this PR safe from injection / auth flaws?" | `security-auditor` | OWASP-first, attack-vector framing | Don't use `code-quality-reviewer` for security |
| "What caused this bug / outage?" | `bug-hunter` | 5 Whys + Fishbone + defence-in-depth | Don't use `principal-engineer` — too broad |
| "Is the code following DRY / KISS / SOLID / our style?" | `code-quality-reviewer` | Mechanical checklist | Don't use `bug-hunter` — wrong focus |
| "Does the new API / type / schema hold up?" | `contracts-reviewer` | Invariants, encapsulation, breaking changes | — |
| "Are the tests actually useful?" | `test-coverage-reviewer` | Behavioural coverage, not line % | — |
| "Have we hit this problem before?" | `historical-context-reviewer` | Git blame + past PRs | — |
| "Is this page indexable / ranking-ready?" | `seo-specialist` | Technical SEO audit + structured data validation | Don't rely on Lighthouse SEO score alone — it misses hreflang, canonical cross-domain, soft 404 |
| Cross-cutting final verdict, architectural review, incident lead | `principal-engineer` | Synthesises specialist findings, decides merge readiness | Don't ask it to do specialist deep dives |

---

## Delegation Chains

Recommended hand-offs inside a single task:

```
business-analyst ──► solution-architect ──► /explore-codebase
    │                                             │
    └──────────────────────────────────────► /feature-cycle  (one-command orchestrator)
                                                  │
                                                  ├─► qa-engineer (RED tests)
                                                  ├─► fullstack-developer | vite-react-developer (GREEN + REFACTOR)
                                                  ├─► /run-quality-gates --stage post
                                                  ├─► /review-local-changes
                                                  └─► principal-engineer (score ≥ 9.5)
```

The legacy long-form chain is still valid when you want manual control of each step; `/feature-cycle` is the zero-@ path for standard feature work.

Review agents invoked by `/review-local-changes` and `/review-pr`:

```
/review-local-changes
       ├── bug-hunter               (always on code changes)
       ├── security-auditor         (always on code changes)
       ├── code-quality-reviewer    (always on non-cosmetic code)
       ├── contracts-reviewer       (when types/APIs/schemas change)
       ├── test-coverage-reviewer   (when code or tests change)
       └── historical-context-reviewer (deep/hotspot cases)
```

---

## Frontmatter Conventions

All agents MUST have:
- `name:` matching the filename stem (kebab-case)
- `description:` actionable "when to use" sentence (what Claude Code routes on)
- `tools:` minimum required set — reviewers = `Read, Grep, Glob, Bash` (read-only); implementers add `Write, Edit`
- `model:` `sonnet` by default; `opus` only for agents that do heavy multi-hop reasoning (none currently set to opus)

Skills MUST have:
- `name:` in `namespace:command` form (e.g. `code-review:review-pr`)
- `description:` short slash-command intent
- `argument-hint:` bracket-optional form shown in autocomplete

---

## STEP 1 Contract (every agent)

Each agent's body starts with `## STEP 1: Load Project Context` listing:
1. `CLAUDE.md`
2. `.claude/tech-stack.md`
3. `.claude/docs/**`
4. `.claude/plans/**`
5. Stack manifest (`package.json` / `composer.json` / `go.mod` / `Cargo.toml` / `pyproject.toml`)
6. Existing source folder scan before proposing anything new

This is non-negotiable. An agent that starts producing output without loading context is violating CLAUDE.md §15.1.

---

## Scoring Alignment

All skills use the same **Progressive Confidence × Impact Threshold**:

| Impact | Min Confidence |
|--------|----------------|
| 81–100 (Critical) | 50 |
| 61–80 (High) | 65 |
| 41–60 (Medium) | 75 |
| 21–40 (Medium-low) | 85 |
| 0–20 (Low) | 95 |

`--min-impact high` (default) excludes anything below 61. Skills return structured issues with both `impact_score` and `confidence_score` so downstream tooling can re-filter.

---

## When in doubt

1. **Start with `/explore-codebase`** — exploration never hurts.
2. **Run `/run-quality-gates --stage pre`** — a green baseline makes everything downstream trustable.
3. **Write a failing test first** — CLAUDE.md §15.0 is absolute.
4. **Prefer many small tasks over one big task** — CLAUDE.md §15.2.
5. **`/review-local-changes` before every commit** — last line of defence before git history.

---

_Last updated alongside agents v2 refactor. Keep this file in sync whenever you add, remove, or retarget an agent or skill._
