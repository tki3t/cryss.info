# Claude Code Boilerplate

Universal coding standards, agent configurations, and slash-command skills for Claude Code projects. Optimised for multi-language stacks (TypeScript, PHP, Python, Go, Rust) with first-class support for **Vite + React** and **Laravel / Symfony** frontends.

---

## What's Included

| Asset | Location | Purpose |
|-------|----------|---------|
| Coding standards | `CLAUDE.md` | Universal conventions + TDD-first + Zero-Impact workflow |
| Tech-stack declaration | `.claude/tech-stack.md` | Single source of truth agents read first |
| Backend patterns | `.claude/docs/backend-patterns.md` | Language-specific backend snippets, loaded on demand |
| Agents (15) | `.claude/agents/*.md` | Specialist roles invoked automatically by Claude Code |
| Skills (5) | `.claude/skills/*/SKILL.md` | Slash commands: `/review-local-changes`, `/review-pr`, `/run-quality-gates`, `/explore-codebase`, `/feature-cycle` |
| Agent/skill map | `.claude/AGENTS_INDEX.md` | When-to-use decision tables |
| PHP preset | `PHP_DEV_AGENTS_SKILLS.md` | Vietnamese onboarding doc for PHP teams |
| Vite + React preset | `VITE_REACT_DEV_AGENTS_SKILLS.md` | Vietnamese onboarding doc for Vite + React teams |

---

## Quick Start

1. **Copy this repo's contents** into your project root (or cherry-pick the pieces you want).
2. **Fill in** `.claude/tech-stack.md` — agents trust this file more than anything else.
3. **Fill in** `CLAUDE.md` placeholders (`{{PROJECT_NAME}}`, language, framework, etc.).
4. **Delete** sections in `CLAUDE.md` and `.claude/docs/backend-patterns.md` that don't apply to your stack.
5. **Verify** by running `/explore-codebase` — the skill prints a baseline map and flags missing config.
6. **Enforce baseline** with `/run-quality-gates --stage pre` before any implementation work.

---

## Agents at a glance

| # | Agent | One-liner | When to invoke |
|---|-------|-----------|----------------|
| 1 | `business-analyst` | Requirements → user stories + AC | Start of every feature |
| 2 | `solution-architect` | Architecture & ADRs | Before non-trivial changes |
| 3 | `uiux-designer` | UX, a11y, design-system fit | Any UI change |
| 4 | `seo-specialist` | Technical + on-page SEO, meta, JSON-LD, sitemap, hreflang | SEO audits & implementation on public pages |
| 5 | `fullstack-developer` | Backend / BFF / non-React frontends | Default implementer |
| 6 | `vite-react-developer` | Vite + React + TS SPAs | Frontend work on Vite-React projects |
| 6b | `game-tweak-engineer` | C / C++ / ObjC / ObjC++ → `.dylib` tweaks, iOS/macOS hooks, overlay UIs, ESP | iOS tweaks, macOS injected libs, game modding |
| 7 | `qa-engineer` | Tests, coverage, edge cases | TDD + after implementation |
| 8 | `principal-engineer` | Holistic review + incident lead | Final review / outages |
| 9 | `bug-hunter` | Deep RCA, defence-in-depth | Specific bug investigation |
| 10 | `security-auditor` | OWASP / CVE / auth review | Before merge on sensitive code |
| 11 | `contracts-reviewer` | APIs, types, schemas, DTOs | On contract changes |
| 12 | `code-quality-reviewer` | DRY / KISS / SOLID / PSR / guideline checks | After commits |
| 13 | `test-coverage-reviewer` | Coverage *quality*, not %, edge cases | When tests added/changed |
| 14 | `historical-context-reviewer` | Git history + past PR patterns | Hotspots, recurring bugs |

See `.claude/AGENTS_INDEX.md` for the full decision matrix (which agent for which situation, boundary rules, delegation chains).

---

## Skills (slash commands)

| Command | Purpose |
|---------|---------|
| `/explore-codebase [focus-area] [--depth quick\|standard\|deep]` | CLAUDE.md §15.1 Phase 0 exploration report |
| `/run-quality-gates [--fix] [--stage pre\|post] [--json]` | Typecheck + lint + test + build with pass/fail report |
| `/feature-cycle <desc> [--stack php\|vite-react] [--min-score 9.5]` | **End-to-end TDD loop**: qa-engineer → implementer → gates → review → principal sign-off |
| `/review-local-changes [aspects] [--min-impact LEVEL] [--json]` | Pre-commit multi-agent review of uncommitted diff |
| `/review-pr [aspects] [--min-impact LEVEL] [--json]` | Inline PR review (GitHub) or JSON for CI |

The two review skills share the same confidence × impact progressive threshold so their findings are comparable; `/feature-cycle` consumes that threshold via its internal call to `/review-local-changes`.

---

## Workflow at a glance

```
Requirement
   │
   ▼ business-analyst  ──  user story + AC
   │
   ▼ solution-architect ── ADR (only if architectural impact)
   │
   ▼ /explore-codebase  ── Phase 0 report
   │
   ▼ /run-quality-gates --stage pre ── baseline must be GREEN
   │
   ▼ qa-engineer         ── FAILING test (TDD RED)
   │
   ▼ fullstack-developer / vite-react-developer ── minimum code to pass (TDD GREEN → REFACTOR)
   │
   ▼ /run-quality-gates --stage post ── zero-impact check
   │
   ▼ /review-local-changes ── pre-commit gate
   │
   ▼ git push → PR
   │
   ▼ /review-pr ── inline review / JSON for CI
   │
   ▼ principal-engineer  ── holistic sign-off
```

See `CLAUDE.md` §15 for the canonical "No Code, No Problem" workflow with TDD-first, Zero-Impact, and Score ≥ 9.5 rules.

---

## License

MIT — see `LICENSE`.
