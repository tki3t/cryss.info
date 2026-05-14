---
name: workflow:feature-cycle
description: End-to-end TDD feature cycle — orchestrates qa-engineer (RED) → implementer (GREEN+REFACTOR) → quality gates → review-local-changes → principal-engineer sign-off, looping until score ≥ 9.5. One command replaces steps 5–10 of CLAUDE.md §15.3.
argument-hint: "<feature-description> [--stack php|vite-react|auto] [--skip-architect] [--min-score 9.5] [--max-iterations 5]"
---

# Feature Cycle

Single-entry orchestrator for the **implement → verify → review → sign-off** loop. Implements CLAUDE.md §15.3 steps 5–14 end-to-end so the user types **one command** instead of `@`-mentioning five agents in sequence.

**User Input:**

```text
$ARGUMENTS
```

---

## Arguments

| Argument | Format | Default | Description |
|----------|--------|---------|-------------|
| `feature-description` | Free text | **required** | What to build, tied to the story in `.claude/plans/<feature>.md` if present |
| `--stack` | `php \| vite-react \| auto` | `auto` | Picks the implementer agent. `auto` detects from `.claude/tech-stack.md` + manifests |
| `--skip-architect` | Flag | `false` | If set, skips any architect consultation for trivial features |
| `--min-score` | Number | `9.5` | Minimum average review score to mark APPROVED (per CLAUDE.md §15.4) |
| `--max-iterations` | Integer | `5` | Hard cap on fix-review loops to prevent infinite spin |

---

## Prerequisites

Refuse to start when any of the following is false. Print a clear reason and abort:

- `CLAUDE.md` exists and §15 is intact
- `.claude/tech-stack.md` exists and has a `Backend` or `Frontend` section filled in
- Git working tree is **not dirty outside the current feature branch**
- A feature branch is already checked out (skill does NOT create branches — that's step 2 of §15.3, user's call)
- If `feature-description` references a plan file, that file exists

---

## Stack Detection (when `--stack auto`)

Read files in order, pick the first rule that matches:

1. `.claude/tech-stack.md` explicit `Primary language: PHP` → `php`
2. `composer.json` exists at repo root → `php`
3. `vite.config.*` + `package.json` with `react` in dependencies → `vite-react`
4. `package.json` with `next` or `remix` → `vite-react` agent **is wrong** — abort with message: *"This stack has a dedicated specialist other than vite-react-developer. Re-run with `@fullstack-developer` manually or add a new specialist agent."*
5. Otherwise → `php` is NOT assumed; abort with: *"Cannot auto-detect stack. Pass `--stack php` or `--stack vite-react`."*

Map:

| Stack | Implementer agent |
|-------|-------------------|
| `php` | `fullstack-developer` |
| `vite-react` | `vite-react-developer` |

---

## Workflow

### Phase 0 — Baseline guard

Invoke skill `/run-quality-gates --stage pre` first. If it returns `overall: fail`, **stop immediately** and report. The user must fix the baseline before starting a feature.

### Phase 1 — TDD RED (write failing tests)

Spawn `qa-engineer` with this prompt template:

```
Feature under development: <feature-description>

Relevant plan: <path to .claude/plans/<slug>.md if found, else "none">

Write FAILING tests that express the acceptance criteria from the plan.
Place tests in the project's conventional test folder (inspect existing tests first).
Run the tests and CONFIRM they fail for the RIGHT reason (missing implementation),
not due to compile/import errors.

Return:
- Paths of added/modified test files
- Command used to run them
- Failure output proving the tests fail for the correct reason
```

If `qa-engineer` reports test errors unrelated to missing implementation, surface those to the user and stop — the test setup itself is broken.

### Phase 2 — TDD GREEN (minimum implementation)

Spawn the implementer (`fullstack-developer` or `vite-react-developer` per stack detection) with:

```
Feature: <feature-description>

The qa-engineer has written failing tests at: <list of test paths>
Last failure output: <tail from Phase 1>

Write the MINIMUM code to make those tests pass.
- Do NOT add functionality outside the tests.
- Follow existing project patterns (load .claude/docs/backend-patterns.md for your section only).
- Use the project's configured validation / ORM / error shape from .claude/tech-stack.md.
- Run the tests after writing code and confirm they pass.

Return:
- List of source files created / modified
- Confirmation that all Phase 1 tests now pass
- Any new dependencies added (must be approved — flag them)
```

If implementer adds new dependencies, pause and ask the user to approve before continuing.

### Phase 3 — REFACTOR (clean without breaking)

Same implementer, follow-up prompt:

```
Tests are green. Now refactor for:
- DRY / KISS / SOLID
- Naming per CLAUDE.md §2
- Correct error shape per tech-stack.md
- No debugging artifacts

Constraint: ALL tests must remain green. Re-run after refactor to confirm.
Return the refactor diff summary and the final test-pass confirmation.
```

### Phase 4 — Quality gates (post)

Invoke `/run-quality-gates --stage post`. If `overall: fail`:
- If failure is in the feature code → return to Phase 3 with the failing gate output as instruction.
- If failure appears pre-existing (unrelated files) → stop and surface to the user.

### Phase 5 — Multi-agent review

Invoke `/review-local-changes --min-impact high --json`. Parse the JSON:
- Collect all `critical` and `high` issues.
- If any exist, proceed to Phase 6 (fix loop).
- Otherwise, proceed to Phase 7 (sign-off).

### Phase 6 — Fix loop

Spawn the implementer again with:

```
Review found the following issues that block merge:

<list of issues from /review-local-changes JSON, with file:line and fix suggestions>

Fix ALL of them. After fixing:
- Re-run the feature tests
- Re-run the full test suite
- Ensure quality gates still pass

Return: list of fixes applied, test-pass confirmation.
```

Then loop: Phase 4 → Phase 5 → Phase 6 until either:
- No critical/high issues remain, OR
- `--max-iterations` is reached → stop with FAIL verdict.

### Phase 7 — Principal sign-off

Spawn `principal-engineer` with:

```
Feature: <feature-description>
Diff summary: <git diff --stat output>
Review findings after fixes: <summary from final Phase 5>
Test-pass evidence: <from Phase 3/6>
Quality gate results: <from Phase 4>

Per CLAUDE.md §15.4, produce:
1. A score from 1 to 10 for each of these dimensions:
   - Correctness (tests + behaviour)
   - Design (architecture, naming, patterns)
   - Robustness (error handling, edge cases)
   - Security
   - Test quality (not coverage %, but coverage value)
2. An overall average.
3. A verdict: APPROVED (≥ MIN_SCORE) or BLOCKED (< MIN_SCORE) with specific reasons.
4. If BLOCKED, list the exact changes required to reach MIN_SCORE.
```

If BLOCKED and iterations remain, feed the principal's required-changes list back into Phase 6 and loop.

### Phase 8 — Final report

Emit markdown (or JSON if `--json` flag added in a future version):

```markdown
# Feature Cycle Report

**Feature:** <description>
**Stack:** <php | vite-react>
**Iterations:** <n of max>
**Final verdict:** APPROVED / BLOCKED

## Score (principal-engineer)
| Dimension | Score |
|-----------|-------|
| Correctness | 9.7 |
| Design | 9.4 |
| Robustness | 9.6 |
| Security | 10.0 |
| Test quality | 9.5 |
| **Average** | **9.64** |

## Files changed
<git diff --stat>

## Remaining follow-ups (if any)
- <items principal flagged as non-blocking nits>

## Next actions (for user)
- Commit + push
- Open PR
- Run `/review-pr` on the PR for inline GitHub review
```

---

## Rules

- **Never** bypass any phase. If the user wants a shorter flow, they should invoke individual agents, not use this skill.
- **Never** auto-commit or auto-push. User owns git history.
- **Never** create a feature branch. User must have one checked out.
- **Never** install new dependencies without explicit user approval (pause + ask).
- **Never** modify `CLAUDE.md` / `.claude/tech-stack.md` to make anything pass — those are project truth.
- Respect `--max-iterations`; infinite loops are worse than a clear BLOCKED verdict.
- All child agents inherit the main agent's working directory — no `cd` inside prompts.
- Skill outputs a single consolidated report at the end; individual agent outputs may be streamed but the final report is the source of truth.

---

## When NOT to use this skill

- **Trivial changes** (typo, doc tweak, config bump) — overkill. Just commit and run `/review-local-changes`.
- **Exploration / spike** — use direct `@fullstack-developer` or `@vite-react-developer` without TDD.
- **Bug investigation** — use `@bug-hunter` first; then optionally run this skill for the fix.
- **Architecture decisions** — use `@solution-architect` and write an ADR first.

---

## Remember

This skill compresses CLAUDE.md §15.3 steps 5–14 into one invocation. It trades speed (one command) for rigidity (no phase-skipping). For day-to-day feature work that rigidity is a feature, not a bug.
