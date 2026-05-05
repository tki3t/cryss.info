# Tech Stack

> **How to use this file**: Copy into your project's `.claude/tech-stack.md` and fill in the sections that match your stack. Delete sections that don't apply. Every agent reads this file in STEP 1 before acting — keep it accurate and current.
>
> **Single source of truth**: When `CLAUDE.md`, `package.json`, and this file disagree, this file wins. Update all three together.

---

## Project Identity

| Key | Value |
|-----|-------|
| Name | `{{PROJECT_NAME}}` |
| Primary language | `{{LANGUAGE}}` |
| Architecture | `{{monolith \| modular-monolith \| microservices \| serverless}}` |
| Runtime target | `{{node 20 \| php 8.2 \| python 3.12 \| go 1.22 \| rust 1.78 \| browser}}` |
| Deployment | `{{docker \| vercel \| cloudflare-workers \| k8s \| bare-metal}}` |

---

## Backend

Delete if the project has no backend.

| Concern | Chosen | Notes |
|---------|--------|-------|
| Framework | `{{Hono \| Elysia \| Express \| Fastify \| FastAPI \| Laravel \| Symfony \| Gin \| Axum}}` | |
| Validation | `{{Zod \| Valibot \| Pydantic \| Laravel Validator \| Symfony Validator \| go-playground/validator}}` | Schema-first at every public boundary |
| ORM / DB | `{{Drizzle \| Prisma \| SQLAlchemy 2 \| Eloquent \| Doctrine \| GORM \| SeaORM}}` | |
| Database | `{{PostgreSQL \| MySQL \| SQLite \| MongoDB}}` + version | |
| Cache | `{{Redis \| Memcached \| none}}` | |
| Queue / jobs | `{{BullMQ \| Laravel Queue \| Celery \| Faktory \| none}}` | |
| Auth | `{{cookie-session \| JWT+refresh \| Sanctum \| Passport}}` | HttpOnly+Secure+SameSite |
| Error shape | `{ code: string, message: string, details?: unknown, request_id?: string }` | Always typed |
| Logging | `{{pino \| winston \| Monolog \| slog \| structlog}}` | Include `request_id`, `user_id` |
| Observability | `{{Sentry \| OpenTelemetry \| Datadog}}` | |
| API style | `{{REST \| GraphQL \| gRPC}}` + versioning scheme | |

---

## Frontend

Delete if server-only.

| Concern | Chosen | Notes |
|---------|--------|-------|
| Build tool | `{{Vite \| Next \| Remix \| Astro \| Nuxt \| SvelteKit \| Blade/Twig}}` | |
| UI framework | `{{React 18/19 \| Vue 3 \| Svelte 5 \| Solid \| none}}` | |
| Router | `{{react-router-dom v7 \| TanStack Router \| file-based}}` | |
| Data layer | `{{TanStack Query \| SWR \| RTK Query \| Apollo \| fetch}}` | Do not mirror server state into a client store |
| Client state | `{{Zustand \| Jotai \| Redux Toolkit \| Pinia \| none}}` | |
| Forms | `{{react-hook-form+zod \| Formik \| TanStack Form \| native}}` | |
| Styling | `{{Tailwind \| CSS Modules \| vanilla-extract \| styled-components}}` | One choice; do not mix |
| UI kit | `{{shadcn/ui \| Radix \| Mantine \| MUI \| Ant Design \| Chakra}}` | |
| Icons | `{{lucide-react \| Heroicons \| Phosphor}}` | |
| i18n | `{{react-i18next \| lingui \| formatjs \| none}}` | |
| a11y lint | `eslint-plugin-jsx-a11y` + `@axe-core/react` (dev) | Required |

---

## Testing

| Concern | Chosen |
|---------|--------|
| Unit / component | `{{Vitest \| Jest \| pytest \| go test \| cargo test \| PHPUnit \| Pest}}` |
| Component (web) | `@testing-library/*` + `user-event` |
| Network mock | `{{MSW \| nock \| responses \| Http::fake}}` |
| E2E | `{{Playwright \| Cypress \| Laravel Dusk}}` |
| Coverage provider | `{{v8 \| c8 \| coverage.py \| go -cover \| tarpaulin \| xdebug/pcov}}` |
| Coverage threshold | Statements ≥ 80%, Branches ≥ 75%, Lines ≥ 80% |
| Mutation (optional) | `{{Stryker \| mutmut \| Infection}}` |

---

## Quality Tooling

| Concern | Chosen | Command |
|---------|--------|---------|
| Typecheck | `{{tsc \| mypy \| pyright \| phpstan \| psalm \| go vet \| cargo check}}` | `{{pnpm typecheck \| vendor/bin/phpstan analyse \| ...}}` |
| Lint | `{{ESLint flat \| Biome \| ruff \| phpcs \| pint \| golangci-lint \| clippy}}` | `{{pnpm lint \| ...}}` |
| Format | `{{Prettier \| Biome \| ruff format \| PHP-CS-Fixer \| gofmt \| rustfmt}}` | `{{pnpm format \| ...}}` |
| Package manager | `{{pnpm \| bun \| npm \| yarn \| composer \| uv \| poetry \| cargo \| go mod}}` | |

All four quality gates (typecheck + lint + test + build) are invoked by `/run-quality-gates`.

---

## Security

| Control | Implementation |
|---------|---------------|
| Secret storage | Env vars via `{{.env \| 1Password \| Vault \| SSM}}` — never committed |
| Dependency audit | `{{pnpm audit \| composer audit \| pip-audit \| govulncheck \| cargo audit}}` in CI |
| SAST | `{{Snyk \| Semgrep \| GitHub Code Scanning}}` |
| CSP | `{{strict-dynamic + nonce \| hash-based \| not applicable}}` |
| Session cookie | `HttpOnly; Secure; SameSite=Lax` (or `Strict` for admin) |
| Password hashing | `{{argon2id \| bcrypt 12+}}` |

---

## CI/CD

| Stage | Commands |
|-------|----------|
| Install | `{{pnpm install --frozen-lockfile \| composer install --no-dev \| ...}}` |
| Gate 1 — Typecheck | `{{pnpm typecheck \| vendor/bin/phpstan analyse \| ...}}` |
| Gate 2 — Lint | `{{pnpm lint \| vendor/bin/pint --test \| ...}}` |
| Gate 3 — Test + coverage | `{{pnpm test -- --coverage \| vendor/bin/pest --coverage \| ...}}` |
| Gate 4 — Build | `{{pnpm build \| go build ./... \| cargo build --release \| ...}}` |
| Gate 5 — Audit | `{{pnpm audit \| composer audit \| ...}}` |
| Deploy | `{{vercel deploy \| docker push \| ...}}` |

No stage may be skipped. See CLAUDE.md §15.0.1 for the bypass-prohibition rule.

---

## Agent-specific notes

Use this section to record anything the agents should treat as project-specific context:

- Public API version: `v1`
- Route prefix: `/api`
- Breaking changes policy: additive by default, deprecate for ≥ 1 minor release before removal
- Known hotspots (from `historical-context-reviewer`): `<list of files>`
- Perf budget: LCP < 2.5s, INP < 200ms, CLS < 0.1 on `/` and `/dashboard`

---

## References (do not inline, load on demand)

- Language patterns: `.claude/docs/backend-patterns.md`
- PHP preset: `PHP_DEV_AGENTS_SKILLS.md` (root)
- Vite + React preset: `VITE_REACT_DEV_AGENTS_SKILLS.md` (root)

---

**Last updated:** `{{YYYY-MM-DD}}` — keep this current, agents trust it.
