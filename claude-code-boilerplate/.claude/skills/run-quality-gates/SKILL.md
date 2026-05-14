---
name: quality:run-quality-gates
description: Runs the project's mandatory quality gates (typecheck, lint, test, build) per CLAUDE.md §15 and reports a pass/fail summary. Auto-detects the stack.
argument-hint: "[--fix] [--stage pre|post] [--json]"
---

# Run Quality Gates

Enforces CLAUDE.md §15.0.1 pre/post-implementation checks. **Never bypass.** `--no-verify`, `--skip-ci`, or disabling hooks is prohibited by the project standard.

**User Input:**

```text
$ARGUMENTS
```

---

## Arguments

| Argument | Format | Default | Description |
|----------|--------|---------|-------------|
| `--fix` | Flag | `false` | Apply auto-fixers for lint / format where safe. Does NOT run destructive commands. |
| `--stage` | `--stage pre\|post` | `pre` | `pre` = before implementation (CLAUDE.md §15.0.1 pre-check). `post` = after implementation (§15.0.1 post-check). Identical gates, different label in the report. |
| `--json` | Flag | `false` | Emit a JSON summary instead of markdown. |

---

## Detection

Before running anything, detect the stack by inspecting existing files. Run **only** the commands that match. Never install missing tools — report them as `skipped:unavailable`.

| Indicator | Stack | Typecheck | Lint | Test | Build |
|-----------|-------|-----------|------|------|-------|
| `package.json` + `tsconfig.json` | TypeScript | `pnpm typecheck` / `npm run typecheck` / `tsc --noEmit` | `pnpm lint` | `pnpm test --run` / `pnpm test -- --run` | `pnpm build` |
| `vite.config.*` | TS + Vite | same as TS + `pnpm test --run` (Vitest) | same | Vitest | `vite build` |
| `composer.json` + `phpstan.neon*` | PHP | `vendor/bin/phpstan analyse --no-progress` | `vendor/bin/pint --test` / `vendor/bin/php-cs-fixer fix --dry-run --diff` | `vendor/bin/pest` / `vendor/bin/phpunit` | — |
| `pyproject.toml` / `requirements.txt` | Python | `mypy .` / `pyright` | `ruff check .` | `pytest -q` | — |
| `go.mod` | Go | `go vet ./...` | `golangci-lint run` | `go test ./...` | `go build ./...` |
| `Cargo.toml` | Rust | `cargo check --all-targets` | `cargo clippy -- -D warnings` | `cargo test` | `cargo build --release` |

Pick the package manager actually in use: prefer `pnpm` if `pnpm-lock.yaml` exists, `yarn` if `yarn.lock`, otherwise `npm`. For Python prefer `uv run` / `poetry run` if a lockfile is present.

If `--fix`:
- TS/JS: append `pnpm lint -- --fix` and `pnpm format`
- PHP: `vendor/bin/pint` (without `--test`) and `vendor/bin/php-cs-fixer fix`
- Python: `ruff check --fix` and `ruff format`
- Go: `gofmt -w .` and `golangci-lint run --fix`
- Rust: `cargo clippy --fix --allow-dirty --allow-staged`

---

## Workflow

1. **Read** `CLAUDE.md` quick-scan for any project-specific gate commands that override the defaults. Project-specific commands always win.
2. **Detect** stack per the table above. Build the ordered gate list: `[typecheck, lint, test, build]` — only include gates the stack supports.
3. **Run** gates sequentially. Stop at the first failure unless `--stage post` in which case continue so the user sees the full picture.
4. **Capture** exit code, duration, and the last ~40 lines of output per gate.
5. **Report** per the Output section below.

Never run these gates in parallel — they may share caches or DB connections and flaky-mask each other.

Never run destructive commands (DB migrations, seed scripts, deploy) even when mentioned in `package.json`.

---

## Output

### Markdown (default)

```markdown
# Quality Gates — [stage: pre|post]

| Gate | Status | Duration | Notes |
|------|--------|----------|-------|
| typecheck | ✅ pass | 4.2s | - |
| lint | ❌ fail | 2.1s | 3 errors, see below |
| test | ⏭ skipped | - | previous gate failed |
| build | ⏭ skipped | - | previous gate failed |

**Overall: FAIL**

## Failed gate output (last 40 lines)

```
<captured stderr/stdout tail>
```

## Next actions
- Fix lint errors listed above
- Re-run `/run-quality-gates`
```

### JSON (with `--json`)

```jsonc
{
  "stage": "pre",
  "overall": "fail",          // "pass" | "fail"
  "stack": "typescript-vite",
  "gates": [
    { "name": "typecheck", "status": "pass", "duration_ms": 4200, "exit_code": 0 },
    { "name": "lint", "status": "fail", "duration_ms": 2100, "exit_code": 1, "tail": "..." },
    { "name": "test", "status": "skipped", "reason": "previous gate failed" },
    { "name": "build", "status": "skipped", "reason": "previous gate failed" }
  ]
}
```

---

## Rules

- **Never** use `--no-verify`, `--skip-ci`, `HUSKY=0`, or any bypass flag.
- **Never** modify `CLAUDE.md` §15.0.1 gate list to make gates "pass" by removal.
- Report `skipped:unavailable` (not `pass`) when a tool is missing — the user may need to install it.
- Quote the exact command used in each gate's report so the user can reproduce.
- If the project uses a Makefile / task runner (`just`, `mask`, `make`) with `make typecheck` etc., prefer those — they encode project-specific behaviour.

---

## Remember

Quality gates are the project's contract with future-you. Every `--stage pre` run protects the codebase baseline. Every `--stage post` run confirms zero-impact per CLAUDE.md §15.0.1. No shortcuts.
