---
name: explore:codebase
description: Executes CLAUDE.md §15.1 Phase 0 codebase exploration. Produces a concise understanding report covering architecture, similar features, dependencies, testing patterns, and conventions before any implementation work begins.
argument-hint: "[focus-area] [--depth quick|standard|deep]"
---

# Explore Codebase

CLAUDE.md §15.1 mandates codebase exploration before any implementation. This skill executes that phase systematically and produces a reusable report.

**User Input:**

```text
$ARGUMENTS
```

---

## Arguments

| Argument | Format | Default | Description |
|----------|--------|---------|-------------|
| `focus-area` | Free text | None | The feature / module / concern the caller is about to implement (e.g., "user authentication", "order checkout"). Narrows the exploration. |
| `--depth` | `--depth quick\|standard\|deep` | `standard` | `quick` = 5 min, top-level map only. `standard` = full §15.1 checklist. `deep` = adds git history + historical-context-reviewer agent. |

---

## Workflow

### Phase A — Project documentation (mandatory, parallel)

Read in parallel (one Haiku agent per file, return summaries not contents):
- `CLAUDE.md`
- `.claude/tech-stack.md` (if exists)
- `.claude/docs/*`
- `.claude/plans/*`
- `README.md`
- `AGENTS.md` (if exists)
- `constitution.md` (if exists)

### Phase B — Structural map (mandatory)

Run (in order):
```bash
# Root layout
ls -la
# Package / build config
cat package.json composer.json go.mod Cargo.toml pyproject.toml 2>/dev/null | head -n 200
# Top-level source layout
ls -la src/ app/ internal/ packages/ 2>/dev/null
# Route / feature map
find src app -maxdepth 3 -type d 2>/dev/null | head -n 50
```

Identify:
- Monorepo vs single package
- Source folder convention (`src/`, `app/`, `internal/`, `packages/*`)
- Layered vs feature-sliced vs hexagonal layout
- Frontend / backend / shared boundaries

### Phase C — Similar features (mandatory if `focus-area` provided)

For each distinctive token in `focus-area`, grep for existing implementations:
```bash
grep -rn "<token>" src/ app/ --include="*.ts" --include="*.tsx" --include="*.php" --include="*.py" --include="*.go" --include="*.rs" | head -n 40
```

Report up to 5 closest existing features with file paths — the new implementation should mirror their shape.

### Phase D — Dependencies & conventions (mandatory)

- **Naming**: scan 5–10 files, confirm they follow CLAUDE.md §2 naming conventions; flag drift.
- **Testing pattern**: find the nearest test file for the focus area (or a similar feature) and note framework + folder layout.
- **Validation library**: detect (Zod / Pydantic / validator / zod / Valibot / Laravel Validator / Symfony Validator).
- **Error shape**: grep for existing error classes / typed error objects.
- **Logging**: detect logger used (`pino`, `winston`, `logger`, `log`, `Monolog`, `slog`).

### Phase E — Deep depth only: historical context

If `--depth deep`:
- Invoke `historical-context-reviewer` agent on the top 3 files most likely to be touched by the focus area.
- Include its output in the report.

---

## Output Format

```markdown
# Codebase Exploration — <focus-area>

## Architecture Summary
- Layout: <monorepo | single-package>, <feature-sliced | layered | hexagonal>
- Backend stack: <framework> + <ORM> + <validation>
- Frontend stack: <framework> + <state> + <data-layer>
- Test framework: <name>

## Similar Features (follow these patterns)
1. `path/to/file.ext` — <one-line description>
2. ...

## Dependencies That Will Be Touched
- `<module>` — <reason>
- ...

## Conventions to Follow
- Naming: <observed>
- Validation: <library>
- Errors: <typed error shape>
- Logging: <logger + context fields>
- Tests: <framework>, files colocated in `<folder>`

## Risks & Open Questions
- ❓ <question for the user>
- ⚠️ <potential conflict with existing pattern>

## Ready to Implement?
- [ ] I know which folder/file to create
- [ ] I know which tests to write first (TDD)
- [ ] I know which existing module I must not break
- [ ] I have an answer (or a flagged question) for every ambiguous requirement
```

---

## Rules

- **Never** read full file contents unless strictly necessary — prefer summaries and line counts. Context budget is precious.
- **Never** propose new libraries at this stage — exploration is observation, not design.
- **Never** skip Phase A or B even if the user seems in a hurry — those phases prevent the bulk of rework.
- If the focus area maps to zero existing features, say so explicitly — the implementation will be greenfield and requires explicit pattern choice (delegate to `solution-architect`).

---

## Integration with other agents / skills

- Output of this skill feeds directly into `business-analyst` (for AC refinement) and `solution-architect` (for ADR writing).
- Run this skill **before** any `fullstack-developer` / `vite-react-developer` implementation task.
- Run `/run-quality-gates --stage pre` **immediately after** this exploration to confirm the baseline is green before coding.

---

## Remember

CLAUDE.md §15.1: *"Starting implementation without exploration leads to code that doesn't follow project patterns, duplicated functionality, integration issues, wasted review cycles."* Exploration is not optional.
