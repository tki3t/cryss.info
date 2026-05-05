# Vite + React Dev — Tổng hợp Agents & Skills

Tài liệu này tổng hợp toàn bộ agents trong `.claude/agents/` và skills trong `.claude/skills/` của boilerplate, **đã được viết lại / chú thích lại cho ngữ cảnh Vite + React + TypeScript** (React 18/19, TanStack Query, react-router, Zustand/Jotai, react-hook-form + zod, Tailwind/shadcn, Vitest + React Testing Library + MSW, Playwright, ESLint flat config, pnpm). Giữ nguyên trách nhiệm và checklist của agent gốc, chỉ ánh xạ lệnh/công cụ/ví dụ sang hệ sinh thái frontend hiện đại.

---

## Mục lục

- [1. Tech Stack Vite + React mặc định](#1-tech-stack-vite--react-mặc-định)
- [2. Danh sách Agents (15 — 14 áp dụng cho Vite + React web)](#2-danh-sách-agents-15)
- [3. Chi tiết từng Agent](#3-chi-tiết-từng-agent)
  - [3.1 business-analyst](#31-business-analyst)
  - [3.2 solution-architect](#32-solution-architect)
  - [3.3 uiux-designer](#33-uiux-designer)
  - [3.4 vite-react-developer](#34-vite-react-developer)
  - [3.5 fullstack-developer (BFF / API)](#35-fullstack-developer-bff--api)
  - [3.6 qa-engineer (Vitest + RTL + Playwright)](#36-qa-engineer-vitest--rtl--playwright)
  - [3.7 principal-engineer](#37-principal-engineer)
  - [3.8 bug-hunter](#38-bug-hunter)
  - [3.9 security-auditor (frontend threat model)](#39-security-auditor-frontend-threat-model)
  - [3.10 contracts-reviewer](#310-contracts-reviewer)
  - [3.11 code-quality-reviewer](#311-code-quality-reviewer)
  - [3.12 test-coverage-reviewer](#312-test-coverage-reviewer)
  - [3.13 historical-context-reviewer](#313-historical-context-reviewer)
  - [3.14 seo-specialist](#314-seo-specialist)
- [4. Skills (5)](#4-skills-5)
  - [4.1 review-local-changes](#41-review-local-changes)
  - [4.2 review-pr](#42-review-pr)
  - [4.3 run-quality-gates](#43-run-quality-gates)
  - [4.4 explore-codebase](#44-explore-codebase)
  - [4.5 feature-cycle](#45-feature-cycle)
- [5. Luồng làm việc đề xuất cho dự án Vite + React](#5-luồng-làm-việc-đề-xuất-cho-dự-án-vite--react)
- [6. Bảng ánh xạ lệnh sang Vite + React](#6-bảng-ánh-xạ-lệnh-sang-vite--react)

---

## 1. Tech Stack Vite + React mặc định

Các agent mặc định đọc `CLAUDE.md`, `.claude/tech-stack.md`, `.claude/docs/`, `vite.config.ts`, `tsconfig.json`, `package.json`, `eslint.config.*`, `.prettierrc*` trước khi làm việc. Stack tham chiếu khuyến nghị:

- **Build tool**: Vite 5/6 + `@vitejs/plugin-react-swc` + `vite-tsconfig-paths`.
- **Ngôn ngữ**: TypeScript 5+, `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- **Framework**: React 18/19 (hooks only, function components, có thể bật React Compiler nếu dùng v19).
- **Router**: `react-router-dom` v6/v7 hoặc TanStack Router.
- **Data layer**: TanStack Query v5 (+ `@tanstack/query-devtools`) hoặc SWR. Không dùng Redux cho server state.
- **Client state**: Zustand / Jotai / Redux Toolkit (tùy dự án) — giữ store nhỏ, scope theo feature.
- **Forms**: `react-hook-form` + `@hookform/resolvers/zod` + `zod`.
- **Styling**: Tailwind CSS + CSS Modules / vanilla-extract / styled-components (chọn 1, không trộn).
- **UI kit**: shadcn/ui + Radix Primitives, Mantine, MUI, Ant Design, hoặc Chakra.
- **Icons**: `lucide-react`.
- **Validation runtime**: `zod` ở mọi ranh giới I/O (API response, localStorage, URL params).
- **Testing**:
  - Unit/component: **Vitest** + **React Testing Library** + `@testing-library/jest-dom` + `@testing-library/user-event`.
  - Network mock: **MSW** (v2).
  - E2E: **Playwright** (`@playwright/test`).
  - A11y: `@axe-core/react` (dev) + `eslint-plugin-jsx-a11y` (CI).
  - Mutation: Stryker (tùy chọn).
- **Lint/format**: ESLint flat config + `@typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-jsx-a11y` + `eslint-plugin-import`; Prettier.
- **Package manager**: pnpm (khuyến nghị) / npm / yarn, có `lockfile` commit.
- **Bundle analysis**: `rollup-plugin-visualizer` + Lighthouse CI.
- **Quan sát**: Sentry browser SDK, Web Vitals reporter.
- **CI**: GitHub Actions chạy `pnpm typecheck && pnpm lint && pnpm test -- --coverage && pnpm build`.

---

## 2. Danh sách Agents (15)

Tổng repo có 15 agents. Dự án Vite + React web dùng 14 agents bên dưới; `game-tweak-engineer` là agent native Apple-platform (`.dylib` tweaks cho iOS/macOS), không áp dụng cho web — bỏ qua trong dự án web thông thường.

| # | Tên agent | Vai trò ngắn | Khi dùng |
|---|-----------|--------------|----------|
| 1 | `business-analyst` | Phân tích yêu cầu, user story, AC | Giai đoạn tiếp nhận yêu cầu |
| 2 | `solution-architect` | Thiết kế kiến trúc FE, ADR, chọn lib | Trước khi code tính năng lớn |
| 3 | `uiux-designer` | Review UI/UX, WCAG 2.1 AA, design system | Mọi thay đổi UI |
| 4 | `seo-specialist` | SEO kỹ thuật + on-page, meta, JSON-LD, sitemap, hreflang, `SeoHead` component | Trang marketing / blog / product của SPA (thường cần prerender hoặc SSR) |
| 5 | `vite-react-developer` | Implement SPA Vite + React + TS | Mọi task frontend |
| 6 | `fullstack-developer` | BFF, API client, server action | Khi cần đụng tới backend / edge function |
| 7 | `qa-engineer` | Vitest + RTL + Playwright + MSW, coverage | Sau khi code xong hoặc TDD |
| 8 | `principal-engineer` | Review toàn diện + điều tra sự cố + sign-off merge | Review chuyên sâu, debug perf, vấn đề liên module |
| 9 | `bug-hunter` | RCA, defense-in-depth | Sau khi hoàn thành 1 mảng code |
| 10 | `security-auditor` | XSS, CSP, token storage, supply-chain | Trước merge, code nhạy cảm |
| 11 | `contracts-reviewer` | Props API, zod schema, DTO, route contract | Thay đổi type/API/schema |
| 12 | `code-quality-reviewer` | DRY/KISS/SOLID + React idioms | Sau mỗi commit/PR |
| 13 | `test-coverage-reviewer` | Đánh giá chất lượng & độ phủ test | Sau khi có test |
| 14 | `historical-context-reviewer` | Đào git history, PR cũ | File thường xuyên bị sửa, hotspot |
| — | `game-tweak-engineer` | C/C++/ObjC++ → `.dylib` tweaks, iOS/macOS hooks | Không áp dụng cho Vite + React web |

---

## 3. Chi tiết từng Agent

> Quy ước: mỗi agent đều có **STEP 1 bắt buộc**: đọc `CLAUDE.md`, `.claude/tech-stack.md`, `.claude/docs/`, `vite.config.ts`, `tsconfig.json`, `package.json`, `eslint.config.*`, `.prettierrc*` để phát hiện router / data layer / state / styling / UI kit / testing / forms đã có — **không ép thư viện mới** nếu dự án đã có tương đương.

### 3.1 business-analyst

**Trách nhiệm**: phân tích yêu cầu, user story, AC, NFR, gap analysis, traceability matrix.

**Quy trình**:
1. Thu thập yêu cầu → làm rõ ẩn ý → phát hiện mâu thuẫn.
2. Ưu tiên theo **MoSCoW**.
3. Với FE, luôn hỏi rõ: route path, breakpoint responsive, empty state, error state, loading state, a11y expectation, i18n.

**Output — User Story + AC**:

```text
As a <user>
I want to <action>
So that <benefit>

AC (Gherkin):
  Given <context>
  When <action>
  Then <expected outcome>
```

**Output — Requirements Document**: Executive Summary · Business Objectives · Functional Req · Non-Functional Req (perf, a11y, i18n, SEO) · Constraints · Dependencies · Success Metrics (LCP/INP/CLS mục tiêu, conversion).

---

### 3.2 solution-architect

**Trách nhiệm**: thiết kế kiến trúc FE, ADR, data flow, chọn lib.

**Quyết định điển hình cho SPA Vite + React**:
- **Routing**: file-based (TanStack Router) vs code-based (`createBrowserRouter`).
- **Rendering**: SPA thuần, hay SSR/SSG (chuyển sang Next/Remix), hay hybrid (Vite SSR + `vite-plugin-ssr`/`vike`).
- **Data**: TanStack Query vs RTK Query vs Apollo (GraphQL).
- **State**: Zustand vs Jotai vs Redux Toolkit. Server state **luôn** ở Query, không mirror.
- **Monorepo**: pnpm workspaces + Turborepo / Nx nếu có nhiều app.
- **Module federation / micro-frontend**: cân nhắc khi có nhiều team.
- **Auth**: cookie HttpOnly do backend set (ưu tiên) vs token trong memory + refresh rotate.
- **i18n**: `react-i18next` / `lingui` / `formatjs`.
- **Error tracking**: Sentry + source map upload qua CI.

**Deliverables**:
- System Architecture Document: sitemap, route tree, data flow, component hierarchy, design token, bundle strategy, deploy target (CDN/Edge).
- **ADR** cho mỗi quyết định: Context · Decision · Rationale · Consequences · Alternatives.

**Nguyên tắc**: component boundary = data boundary · loose coupling · API-first (OpenAPI/GraphQL codegen) · progressive enhancement · perf budget.

---

### 3.3 uiux-designer

**Trách nhiệm**: review UI/UX, consistency, WCAG 2.1 AA, visual hierarchy, responsive.

**Áp dụng cho React**: React + Tailwind/shadcn, Radix Primitives, Storybook cho component catalog.

**Tiêu chí**:
- **Visual**: consistency, hierarchy, typography (body ≥ 16px), contrast (4.5:1 text, 3:1 large), grid 4/8px, whitespace.
- **UX**: clarity, feedback (hover/active/focus/loading), error message hữu ích, skeleton thay vì spinner rỗng, navigation, form label + inline validation, CTA nổi bật, undo.
- **Accessibility**:
  - Semantic HTML trước, ARIA chỉ khi cần.
  - Keyboard nav + visible focus ring (không `outline: none` trần).
  - `label` gắn `for`/`id` hoặc `aria-label`.
  - `alt` mô tả (ảnh nội dung) / `alt=""` (decorative).
  - Live region `aria-live="polite"` cho status async.
  - Respect `prefers-reduced-motion`, `prefers-color-scheme`.
  - Dialog dùng Radix/Headless UI có focus trap, `Esc` đóng, trả focus sau khi đóng.
- **Responsive**: mobile-first, target ≥ 44×44px, không horizontal scroll, breakpoint theo design token.
- **Design system**: token-based (color/spacing/typography/radius/shadow), Storybook documented variants, không magic value trong JSX.

**Công cụ**: `@axe-core/react`, Lighthouse, Storybook + `@storybook/addon-a11y`, Chromatic visual regression.

**Ưu tiên issue**: Critical (chặn task / vi phạm a11y) · High · Medium · Low.

---

### 3.4 vite-react-developer

Agent **chính** cho mọi task frontend. Chi tiết đầy đủ xem `.claude/agents/vite-react-developer.md`. Tóm tắt:

#### Vite config baseline

```ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react(), tsconfigPaths()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    server: {
      port: 5173,
      proxy: { '/api': { target: env.VITE_API_URL, changeOrigin: true } },
    },
    build: {
      target: 'es2022',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: true,
      coverage: { provider: 'v8', reporter: ['text', 'html', 'lcov'] },
    },
  };
});
```

#### File layout

```
src/
  app/              # providers (QueryClient, Router, Theme, ErrorBoundary)
  pages/ or routes/ # route-level, lazy-loaded
  features/<name>/
    components/
    hooks/
    api.ts
    types.ts
    schema.ts       # zod
  components/       # shared presentational
  lib/              # framework-agnostic helpers
  hooks/            # shared hooks
  test/             # setup + utilities + MSW handlers
```

#### Data fetching — TanStack Query

```tsx
export const resourcesKeys = {
  all: ['resources'] as const,
  detail: (id: string) => ['resources', id] as const,
};

export function useResources() {
  return useQuery({
    queryKey: resourcesKeys.all,
    queryFn: ({ signal }) => fetchResources(signal),
    staleTime: 60_000,
  });
}

export function ResourcesPage() {
  const { data, isPending, isError, error, refetch } = useResources();
  if (isPending) return <ResourcesSkeleton />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (data.length === 0) return <EmptyState />;
  return <ResourcesList items={data} />;
}
```

Rules:
- Luôn xử lý **pending + error + empty + success**.
- Query key tập trung ở `*Keys`, không stringly-typed rải rác.
- Truyền `signal` cho cancellation.
- Ghi dữ liệu: `useMutation` + `invalidateQueries` (hoặc `setQueryData` cho optimistic).

#### Forms — RHF + zod

```tsx
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});
type FormValues = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors, isSubmitting } } =
  useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onBlur' });
```

#### Routing + code split

```tsx
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));

const router = createBrowserRouter([{
  path: '/',
  element: <AppLayout />,
  errorElement: <RootErrorBoundary />,
  children: [
    { index: true, element: <HomePage /> },
    { path: 'dashboard', element: (
      <Suspense fallback={<PageSkeleton />}><DashboardPage /></Suspense>
    ) },
  ],
}]);
```

Split theo **route**, không theo component. Mỗi lazy boundary có `Suspense` + skeleton có nghĩa.

#### State phân lớp

- **Server state** → TanStack Query. Không mirror sang Redux/Zustand.
- **URL state** (filter, page, tab) → `useSearchParams`.
- **Local UI** → `useState` / `useReducer`.
- **Shared client** → Zustand / Jotai, scope theo feature.
- **Context** chỉ cho giá trị ít thay đổi (theme, auth user).

#### Env

- Chỉ `import.meta.env.VITE_*`, không bao giờ `process.env` ở client.
- Type trong `src/env.d.ts` + validate `zod` khi boot.

#### Checklist implement

- [ ] Strict TS, không `any`, không `@ts-ignore` không lý do.
- [ ] Đầy đủ pending/error/empty/success.
- [ ] Không prop drilling > 2 cấp.
- [ ] Không component định nghĩa lồng trong component khác.
- [ ] Không inline object/array làm prop cho `React.memo` child.
- [ ] Key trong list ổn định, không phải index.
- [ ] `react-hooks/exhaustive-deps` xanh.
- [ ] A11y: role, label, focus, keyboard.
- [ ] Không `localStorage` cho auth token nếu app có XSS risk.
- [ ] Runtime validate mọi response bằng zod trước khi tin.

#### Lệnh

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm test            # vitest
pnpm test -- --coverage
pnpm test:e2e        # playwright
pnpm build && pnpm preview
pnpm dlx @next/bundle-analyzer   # hoặc rollup-plugin-visualizer
```

---

### 3.5 fullstack-developer (BFF / API)

Trong bối cảnh Vite + React, `fullstack-developer` phụ trách:
- BFF / edge function (Hono, Elysia, Express, Fastify, Vercel/Cloudflare Workers).
- API client sinh từ OpenAPI (`openapi-typescript` + `openapi-fetch`) hoặc GraphQL codegen (`graphql-codegen`).
- Auth flow (cookie HttpOnly, refresh rotate, CSRF token nếu dùng cookie).
- Webhook, background job, queue.

**Nguyên tắc giao diện với FE**:
- Trả lỗi dạng typed: `{ code: string, message: string, details?: unknown }`.
- Luôn trả status code chuẩn (200/201/204/400/401/403/404/409/422/429/500).
- Idempotent cho PUT/DELETE + `Idempotency-Key` cho POST thanh toán.
- Rate limit login / password reset / OTP.
- CORS chính xác, không `*` với credentials.
- Gắn `Cache-Control` đúng; hỗ trợ ETag cho GET tĩnh.

**Handoff sang `vite-react-developer`**: cung cấp OpenAPI spec / GraphQL schema để FE codegen type + client, không copy-paste type thủ công.

---

### 3.6 qa-engineer (Vitest + RTL + Playwright)

**Quy trình**: phân tích yêu cầu → đo coverage hiện tại → viết test theo **AAA**.

**Coverage mục tiêu**: Statements/Functions/Lines ≥ 80% (target 90%), Branches ≥ 75% (target 85%). Đo bằng `vitest --coverage` (v8 provider).

#### Mẫu test — Vitest + RTL

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('CreateForm', () => {
  let onSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => { onSubmit = vi.fn(); });

  it('submits with valid data', async () => {
    render(<CreateForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/name/i), 'Alice');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.com', name: 'Alice' });
  });

  it('shows error for invalid email', async () => {
    render(<CreateForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/email/i), 'invalid');
    await userEvent.tab();
    expect(await screen.findByRole('alert')).toHaveTextContent(/email/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

Rules:
- Query theo **role + accessible name** trước, rồi `label`, rồi `text`. `getByTestId` là phương án cuối.
- Test **hành vi**, không test implementation (không shallow, không probe state nội bộ).
- Mock network ở ranh giới qua **MSW**:

```ts
// src/test/handlers.ts
export const handlers = [
  http.get('/api/resources', () => HttpResponse.json([{ id: '1', name: 'A' }])),
];

// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### Mẫu test — Playwright

```ts
import { test, expect } from '@playwright/test';

test('user can create resource', async ({ page }) => {
  await page.goto('/resources');
  await page.getByRole('button', { name: /new/i }).click();
  await page.getByLabel(/name/i).fill('Widget');
  await page.getByRole('button', { name: /save/i }).click();
  await expect(page.getByRole('row', { name: /widget/i })).toBeVisible();
});
```

Cấu hình: parallel + retry trên CI, trace `on-first-retry`, project riêng cho mobile viewport.

#### Edge cases bắt buộc test

- Input: empty, null, chuỗi rất dài, unicode, XSS payload (`<script>`), RTL text.
- Số: 0, âm, rất lớn, float precision, `NaN`, `Infinity`.
- Collection: rỗng, 1 phần tử, rất lớn (virtualization), trùng lặp.
- Date/Time: timezone, DST, năm nhuận, locale format.
- Async: loading race, cancel khi unmount, lỗi mạng, 429, 401 → redirect login.
- Routing: deep link, back/forward, 404, unauthorized route.
- A11y: keyboard-only flow, screen reader announce.

#### Lệnh

```bash
pnpm test -- --coverage --coverage.thresholds.lines=80
pnpm test:e2e
pnpm exec playwright test --ui        # debug UI
pnpm exec stryker run                 # mutation (tùy chọn)
```

---

### 3.7 principal-engineer

Senior engineer 15+ năm, phụ trách **review toàn diện + điều tra sự cố (RCA)** trong bối cảnh FE.

#### Quy trình điều tra

1. **Thu thập**: triệu chứng, cách tái hiện, browser + version, devtools console/network, Sentry event, Web Vitals snapshot.
2. **Tái hiện**: chạy `pnpm dev` + devtools, React Profiler, Performance panel.
3. **Phân tích**: so `git log` gần đây, check bundle diff, kiểm tra cache/storage.

```bash
git log --oneline --since="3 days ago"
grep -rn "useEffect" src/features/<feature>
pnpm exec tsc --noEmit
```

#### Anti-pattern React hay gặp

**Derived state trong `useEffect`** (thay vì tính khi render):

```tsx
// ❌
const [full, setFull] = useState('');
useEffect(() => { setFull(`${first} ${last}`); }, [first, last]);

// ✅
const full = `${first} ${last}`;
```

**Fetch trong `useEffect` không cancel**:

```tsx
// ❌
useEffect(() => { fetch('/api').then(r => r.json()).then(setData); }, []);

// ✅ dùng TanStack Query hoặc AbortController
useEffect(() => {
  const ac = new AbortController();
  fetch('/api', { signal: ac.signal }).then(...);
  return () => ac.abort();
}, []);
```

**Mutate state**:

```tsx
// ❌
state.push(item); setState(state);
// ✅
setState(prev => [...prev, item]);
```

**Index làm key cho list có thể đổi thứ tự** → lỗi `key` → React không reconcile đúng → bug UI tinh vi.

**Inline object làm prop cho `React.memo` child** → memo vô nghĩa, re-render mỗi lần.

**`useLayoutEffect` khắp nơi** → block paint, LCP xấu.

**`JSON.stringify(obj)` làm dep của hook** → so sánh chuỗi rất đắt, vẫn có thể sai thứ tự key.

**Memory leak**:
- Timer/listener không clear (window `resize`, `scroll`).
- Subscription (WebSocket, EventSource) không close.
- Store global giữ reference cũ sau logout.

#### Report format

```markdown
# Investigation Report: <title>
- Date · Severity · Status · Browser/Env
## Issue · Root Cause · Evidence (trace, profiler, Sentry) · Solution · Prevention
```

#### Checklist review FE bổ sung

- [ ] TS `strict` + `noUncheckedIndexedAccess`.
- [ ] Không `any`, không `@ts-ignore` không comment lý do.
- [ ] Không `console.log` còn sót.
- [ ] Không `eslint-disable` không giải thích.
- [ ] Lazy route + Suspense có skeleton.
- [ ] `manualChunks` cho vendor nặng (chart, editor, pdf).
- [ ] Bundle size diff hợp lý (`pnpm build` + visualizer).
- [ ] Web Vitals không regress (LCP/INP/CLS).
- [ ] A11y lint xanh.

#### Delegation

- Fix bug logic UI → `vite-react-developer`
- Viết test → `qa-engineer`
- Đổi kiến trúc → `solution-architect`
- Visual/UX → `uiux-designer`
- Backend/API → `fullstack-developer`

---

### 3.8 bug-hunter

Chuyên gia RCA, tìm **nguyên nhân gốc hệ thống**, không dừng ở triệu chứng.

**5 nguyên tắc** + **5 phase** + **5 Whys** + **Fishbone** (giống bản gốc).

#### Critical paths cho SPA

- Auth/token refresh + logout (invalidate query cache, reset stores).
- Routing guard (redirect khi 401/403, preserve intent URL).
- Form submit (idempotency, double-click protect, optimistic rollback).
- File upload (progress, cancel, size/mime validate).
- WebSocket / SSE (reconnect, backoff, dedupe message).
- IndexedDB / localStorage (quota, schema migration).
- Hydration/SSR mismatch (nếu có SSR).
- i18n fallback + RTL layout.
- Error boundary + Suspense boundary coverage.

#### Output mẫu Critical

```markdown
## 🚨 Critical: <mô tả>
**Location:** `src/features/auth/useAuth.ts:88-102`
**Symptom:** session đã logout vẫn thấy dữ liệu user cũ
**Root Cause Trace:**
1. Symptom: UI hiển thị user.name sau logout
2. ← Immediate: zustand store không reset
3. ← Called by: `logout()` chỉ xóa token, không gọi `queryClient.clear()`
4. ← Originates: thiếu hook tập trung lifecycle logout
5. ← Systemic: không có "logout pipeline" rõ ràng, mỗi feature tự xử lý
**Impact:** data leak giữa tài khoản trên cùng máy (kiosk/shared PC).
**Defense-in-depth:**
1. `useLogout()` tập trung: clear token → `queryClient.clear()` → reset stores → navigate `/login`
2. Interceptor 401: gọi `useLogout()` tự động
3. Thêm e2e test: login A → logout → login B → không thấy dữ liệu A
4. Sentry breadcrumb cho mỗi bước logout
```

---

### 3.9 security-auditor (frontend threat model)

**6 nguyên tắc** (Defense in Depth, Least Privilege, Fail Securely, No Security by Obscurity, Input Validation, Sensitive Data Protection) — ánh xạ FE:

#### Checklist

- [ ] **XSS**: không `dangerouslySetInnerHTML` với dữ liệu chưa sanitize (DOMPurify). Không render HTML từ markdown chưa lọc.
- [ ] **Token storage**: ưu tiên cookie **HttpOnly; Secure; SameSite=Lax/Strict** do backend set. Nếu buộc dùng JS-accessible, giữ **trong memory**, không `localStorage`/`sessionStorage`.
- [ ] **CSRF**: nếu dùng cookie session → backend dùng `SameSite=Strict` hoặc double-submit token. FE gửi `X-CSRF-Token` lấy từ endpoint riêng.
- [ ] **Auth state**: reset toàn bộ (`queryClient.clear()`, stores, caches) khi logout/401.
- [ ] **CSP**: script/style hash hoặc nonce; tránh `'unsafe-inline'`, `'unsafe-eval'`. Vite sinh asset có hash, thuận lợi CSP.
- [ ] **Subresource Integrity**: script từ CDN bên thứ 3 phải có `integrity`.
- [ ] **Supply chain**: `pnpm audit`, `npm audit`, Snyk, Dependabot. Pin phiên bản. Review dep mới có ít star/mới ra.
- [ ] **Runtime validation**: `zod.parse` mọi response — không tin type OpenAPI lúc runtime.
- [ ] **URL / redirect**: whitelist domain khi redirect sau login (chống open redirect).
- [ ] **Clipboard / postMessage**: validate `event.origin`, không `*`.
- [ ] **iframe**: `sandbox` attribute, `referrerpolicy`.
- [ ] **Sensitive data in logs**: không log token, PII ra console; Sentry scrub.
- [ ] **Source map prod**: không public, hoặc upload lên Sentry và strip khỏi asset public.
- [ ] **Rate limit UX**: UI disable + countdown khi nhận 429.
- [ ] **Env leak**: không đặt secret trong `VITE_*` (client nhìn thấy). Chỉ public key.
- [ ] **File upload**: validate mime/size phía FE (UX) + bắt buộc validate lại ở BE.
- [ ] **Drag & drop, paste**: sanitize HTML / markdown / file.
- [ ] **Dependency install**: bật `pnpm`'s `--ignore-scripts` nếu không cần, hoặc `corepack` pin.

**Severity**: Critical (RCE/data exfil) · High · Medium · Low.

Output dạng bảng: | Severity | File | Line | Vuln Type | Attack Scenario | Fix |.

---

### 3.10 contracts-reviewer

Review **props API · zod schema · DTO · route contract · event contract**.

**Nguyên tắc**: Make Illegal States Unrepresentable · Strong Encapsulation · Clear Invariants · Contract Stability · Minimal & Complete · Validation at Boundaries.

#### Checklist

- [ ] **Illegal states unrepresentable**: discriminated union cho variant props.
  ```ts
  type ButtonProps =
    | { variant: 'link'; href: string }
    | { variant: 'button'; onClick: () => void };
  ```
- [ ] **No primitive obsession**: branded type cho `UserId`, `Email`, `Money`.
  ```ts
  type UserId = string & { readonly __brand: 'UserId' };
  ```
- [ ] **Validated boundaries**: `zod.parse` ở API client, localStorage read, URL params, `postMessage`.
- [ ] **Immutability**: `readonly` trên prop, `ReadonlyArray<T>`; Immer hoặc spread khi update state.
- [ ] **Explicit nullability**: `string | null` rõ ràng, không mặc định `undefined` ngầm.
- [ ] **No anemic model**: helper method đi kèm domain type (`Money.add`, `DateRange.overlaps`).
- [ ] **Props API tối thiểu**: không truyền object lớn chỉ để dùng 1 field. Truyền đúng cái cần.
- [ ] **No `any`**, hạn chế `unknown` không narrow.
- [ ] **Consistent naming**: component `PascalCase`, hook `useXxx`, handler `handleXxx` / `onXxx`.
- [ ] **Self-documenting**: type kể câu chuyện; JSDoc cho public API của lib nội bộ.
- [ ] **API versioning**: `/api/v1`, hoặc header. FE có client version riêng cho v1/v2 song hành khi migrate.
- [ ] **Backward compat**: thêm optional field trước, deprecate có lộ trình.
- [ ] **Typed error**: `HttpError { status, code, message }` thay vì throw string.
- [ ] **No leaky abstraction**: không expose Eloquent/Prisma shape ra UI; luôn qua DTO/Resource.
- [ ] **Generics có constraint**: `function pick<T, K extends keyof T>...`.
- [ ] **Schema ↔ type**: dùng `z.infer<typeof schema>` làm single source. Không duplicate interface.
- [ ] **No optional overuse**: nếu luôn có giá trị thì bỏ `?`.
- [ ] **Discriminated union** cho state machine (`idle | loading | success | error`).
- [ ] **No boolean blindness**: enum/union literal thay vì nhiều `bool` (`status: 'active'|'pending'|'closed'`).
- [ ] **Event contract**: custom event/callback đặt tên rõ (`onResourceCreated(resource: Resource)` thay vì `onChange(data: any)`).

**Breaking change table**: Change Type · File · Line · Impact · Migration Path (codemod bằng `jscodeshift`/`ts-morph` nếu cần).

---

### 3.11 code-quality-reviewer

Review tuân thủ guidelines dự án + Clean Code + SOLID + React idioms.

#### Checklist tổng hợp

**Clean Code**
- [ ] DRY, KISS, YAGNI.
- [ ] Early return.
- [ ] Function ≤ 80 dòng, file ≤ 300 dòng (component file).
- [ ] ≤ 3 tham số (dùng object prop nếu >3).
- [ ] Cyclomatic complexity ≤ 10.
- [ ] Không magic number (hoisted constants, enum-like `as const`).
- [ ] Không dead code, comment-out code, `console.log`.

**SOLID (React flavor)**
- [ ] SRP: mỗi component 1 trách nhiệm (Container vs Presentational khi cần).
- [ ] Open/Closed: mở rộng qua composition + `children`/render prop, không sửa component cũ.
- [ ] LSP: biến thể component giữ nguyên contract props.
- [ ] ISP: prop interface nhỏ gọn, không "God props".
- [ ] DIP: inject service qua context/prop, không import singleton cứng trong component nghiệp vụ.

**Naming**
- [ ] Biến đầy đủ nghĩa (trừ counter `i`, `j`).
- [ ] Function = verb (`fetchUser`, `calculateTotal`).
- [ ] Component = noun PascalCase (`UserCard`).
- [ ] Hook = `useXxx`.
- [ ] Event handler = `handleXxx` (local) hoặc `onXxx` (prop).
- [ ] Boolean: `is/has/can/should/will`.
- [ ] Constant `UPPER_SNAKE_CASE` hoặc `camelCase as const`.
- [ ] Collection số nhiều (`users`).

**Architecture**
- [ ] Layer: `pages` → `features` → `components/lib/hooks`. Không import ngược.
- [ ] Feature isolation: `features/a` không import `features/b/internal`.
- [ ] Không circular import.
- [ ] External access qua adapter (`lib/api-client`, `lib/storage`).
- [ ] Pattern nhất quán (không trộn TanStack Query với fetch trần trong cùng feature).

**React specific**
- [ ] Function components + hooks only.
- [ ] Không component định nghĩa lồng trong component.
- [ ] Không render function trong body component — tách thành component con.
- [ ] Const/helper unreactive đặt ngoài component.
- [ ] `key` ổn định, không phải index.
- [ ] Không inline object/array làm prop cho `React.memo` child.
- [ ] `useMemo`/`useCallback` chỉ khi có lý do đo được (hoặc bật React Compiler).
- [ ] `useEffect` chỉ cho side effect thật (subscribe, DOM imperative, sync bên ngoài). Không dùng để derive state.
- [ ] Cleanup trong effect (`return () => ...`).
- [ ] `react-hooks/exhaustive-deps` xanh.
- [ ] Suspense + ErrorBoundary phủ mọi lazy boundary.

**Styling**
- [ ] Không inline style trừ value thật sự động.
- [ ] Token design system, không hardcode color/spacing.
- [ ] Tailwind: extract class dài lặp thành component hoặc `cva`/`tailwind-variants`.

**Error handling**
- [ ] Không `try { } catch { }` rỗng.
- [ ] Catch cụ thể, log có context.
- [ ] User-facing message thân thiện, không stack trace.
- [ ] Error boundary root + per-section.

**Performance**
- [ ] Route-level code splitting.
- [ ] Virtualize list > 200 item.
- [ ] Image: `loading="lazy"`, `decoding="async"`, `width/height`, AVIF/WebP, `srcset`.
- [ ] Font: `font-display: swap`, preload critical subset.
- [ ] Không layout thrash.
- [ ] Debounce/throttle input-driven expensive work.
- [ ] Bundle size diff review sau khi thêm dep.

Output: **Quality Score X/Y** + suggestions cụ thể kèm file:line.

---

### 3.12 test-coverage-reviewer

Đánh giá **chất lượng** coverage, không chạy theo 100% line.

**Checklist**:
- [ ] Mọi component public (export) có ít nhất 1 test.
- [ ] Mọi hook có test riêng (`renderHook`).
- [ ] Happy path có test riêng.
- [ ] Error path có test (network fail, 4xx/5xx, invalid data).
- [ ] Empty state có test.
- [ ] Boundary: min/max/empty collection, locale date edge.
- [ ] Null/optional param có test.
- [ ] A11y snapshot: `axe` không violation.
- [ ] External service mock bằng MSW (không mock `fetch` thô mỗi chỗ).
- [ ] Test độc lập, chạy thứ tự bất kỳ (reset server handlers, cleanup).
- [ ] Assertion có nghĩa (`toHaveTextContent`, `toBeInTheDocument`), không `toBeTruthy` rỗng.
- [ ] Tên test mô tả scenario + outcome (`shows error when email invalid`).
- [ ] Không hardcode test data magic — dùng factory (`@faker-js/faker`, object mother).
- [ ] Mock ranh giới external, không mock module nội bộ đang test.
- [ ] E2E phủ happy path critical (login, checkout, create/update/delete chính).

**Criticality**: Critical / Important / Medium / Low / Optional.

**Output**: bảng Missing Critical Coverage + Test Quality Issues + Score.

---

### 3.13 historical-context-reviewer

Đào git history + PR cũ để hiểu lý do code hiện tại, tránh lặp lỗi, giữ nhất quán quyết định.

**Lệnh**:

```bash
git log --follow -p -- src/features/auth/useAuth.ts
git blame src/features/auth/useAuth.ts
gh pr list --search "path:src/features/auth/useAuth.ts"
```

**Phát hiện**:
- Hotspot (10+ lần sửa / 6 tháng).
- Recurring bug (cùng một loại re-render / race).
- Breaking API đã xảy ra.
- Test thường xuyên vỡ khi đổi file này.
- Refactoring churn (đổi state lib 3 lần trong năm → cân nhắc kỹ).

**Output**: File Change History Summary + Historical Issues + PR Comments liên quan + Architectural Decisions đã có.

---

### 3.14 seo-specialist

Chuyên SEO kỹ thuật + on-page cho web app. **Lưu ý quan trọng với Vite + React SPA**: CSR-only tự thân không tốt cho SEO — agent sẽ đề xuất **prerender** (`vite-plugin-ssr`, `@prerenderer/rollup-plugin`) hoặc **migrate sang SSR/SSG** (Next/Remix/Astro) tuỳ trang.

**Khi nào gọi**:
- Trang public (Home, Category, Article, Product, static)
- Thay đổi `<head>` management, routing, canonical, hreflang
- Sitemap / robots / JSON-LD
- Thiết kế admin override SEO + Google SERP / Facebook / Zalo preview

**Output chính**: `SeoData` contract (TS), `SeoHead` component (props + sanitiser + `react-helmet-async` hoặc `@unhead/react`), default SEO generation rules, JSON-LD templates (WebSite/Article/Product), `robots.txt` + sitemap generator, CMS integration spec.

**Yêu cầu cài đặt điển hình**:
```bash
pnpm add react-helmet-async
# hoặc
pnpm add @unhead/react
```

Bọc root bằng `<HelmetProvider>` (hoặc `createHead()`); mọi page gọi `<SeoHead />` với props đồng nhất.

**Delegation**: perf (LCP/INP/CLS, preload hero image, code-split) → `vite-react-developer`; a11y → `uiux-designer`; migrate rendering mode → `solution-architect` (ADR bắt buộc).

File gốc: `.claude/agents/seo-specialist.md` (đầy đủ 21 section, rules, DoD).

---

## 4. Skills (5)

Skills trigger qua slash command trong Cascade, nằm ở `.claude/skills/<name>/SKILL.md`. Boilerplate có **5 skills**: 2 skill review + 3 skill workflow.

### 4.1 review-local-changes

**Slash**: `/review-local-changes [review-aspects] [--min-impact critical|high|medium|medium-low|low] [--json]`

**Mặc định**: `--min-impact high`, markdown.

**Quy trình 3 phase** (tóm tắt):

1. **Preparation**:
   - `git status --short`, `git diff --stat`, `git diff --cached --stat`.
   - Phân biệt staged vs unstaged, review cả hai.
   - Launch tối đa 6 Haiku agents song song: 1 quét `CLAUDE.md`/`AGENTS.md`/`constitution.md`/`README.md`, còn lại chia file theo LoC để tóm tắt thay đổi.

2. **Searching for Issues**: chạy song song review agents phù hợp:
   - `security-auditor` (mọi thay đổi code/config)
   - `bug-hunter`
   - `code-quality-reviewer` (+ gợi ý cải thiện)
   - `contracts-reviewer` (khi đổi props/type/zod/schema)
   - `test-coverage-reviewer` (khi có code/test thay đổi)
   - `historical-context-reviewer` (thay đổi phức tạp)

3. **Confidence & Impact Scoring**:
   - Mỗi issue chấm **Confidence 0–100** và **Impact 0–100**.
   - Lọc qua **Progressive Threshold**:

     | Impact | Min Confidence |
     |--------|---------------|
     | 81–100 Critical | 50 |
     | 61–80 High | 65 |
     | 41–60 Medium | 75 |
     | 21–40 Medium-low | 85 |
     | 0–20 Low | 95 |

   - Áp `MIN_IMPACT_SCORE` trước (`critical=81, high=61, medium=41, medium-low=21, low=0`), rồi confidence threshold.

**Output**: Markdown report (hoặc JSON nếu `--json`) với **Quality Gate: PASS/FAIL**, Issues phân theo severity, Improvements từ `code-quality-reviewer`.

**Format inline comment**:

```
L<line>: <problem>. <fix>.
🔴 bug: / 🟡 risk: / 🔵 nit: / ❓ q:
```

Ví dụ:

```
src/features/auth/useAuth.ts:L42: 🔴 bug: queryClient không được clear khi logout. Thêm queryClient.clear() trong useLogout trước navigate('/login').
src/components/UserList.tsx:L88: 🟡 risk: dùng index làm key cho list sortable. Dùng user.id.
src/pages/DashboardPage.tsx:L12: 🔵 nit: không có Suspense fallback skeleton. Bọc lazy() trong <Suspense fallback={<PageSkeleton />}>.
```

**Bỏ qua**: nitpick linter/ESLint/tsc đã bắt; pre-existing issue ở code không đổi; `spec/`, `reports/`.

### 4.2 review-pr

**Slash**: `/review-pr [review-aspects] [--min-impact ...]`

Giống `review-local-changes` về rules, scoring, filter — **khác ở output**:
- **Chỉ post inline comment**, không có overall report.
- Mỗi comment phải gắn với dòng cụ thể, mang giá trị rõ ràng.
- Bỏ comment khen tổng quát.

Áp dụng cho PR GitHub/GitLab: dùng `gh pr view`, `gh pr diff`, `gh pr review --comment`.

### 4.3 run-quality-gates

**Slash**: `/run-quality-gates [--fix] [--stage pre|post] [--json]`

Chạy tự động 4 công chất lượng bắt buộc theo CLAUDE.md §15.0.1. Với dự án Vite + React:

- **typecheck**: `pnpm typecheck` (hoặc `tsc --noEmit`)
- **lint**: `pnpm lint` (ESLint flat config, `--fix` nếu có flag)
- **test**: `pnpm test -- --run` (Vitest non-watch)
- **build**: `pnpm build` (Vite production build)

Chạy `--stage pre` trước khi bắt đầu feature (baseline phải xanh) và `--stage post` sau khi implement (zero-impact). Skill auto-detect package manager từ lockfile (`pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, else npm).

### 4.4 explore-codebase

**Slash**: `/explore-codebase [focus-area] [--depth quick|standard|deep]`

Thực thi Phase 0 của CLAUDE.md §15.1: đọc docs, map routes (`src/routes/**`), tìm component/hook tương tự, nhận diện design token, data layer (TanStack Query / SWR), form library (RHF+zod), test pattern. Chạy trước khi implement feature mới để hiểu tình trạng component và lệch idiom.

### 4.5 feature-cycle

**Slash**: `/feature-cycle <mô tả feature> [--stack vite-react] [--min-score 9.5] [--max-iterations 5]`

Orchestrator gọi tuần tự CLAUDE.md §15.3 steps 5–14 vào **1 lệnh**:

1. Baseline guard qua `/run-quality-gates --stage pre`
2. `qa-engineer` viết failing test (Vitest + RTL hoặc Playwright, TDD RED)
3. `vite-react-developer` implement minimum code (TDD GREEN)
4. `vite-react-developer` refactor cho test xanh
5. `/run-quality-gates --stage post`
6. `/review-local-changes --json` → fix loop nếu có issue critical/high
7. `principal-engineer` chẩm định, phải ≥ 9.5 mới APPROVED

Thay cho việc gõ `@` 5 agent liên tiếp. Dùng cho feature scope trung bình trở lên; tác vụ nhỏ (sửa style, bump version) dùng flow tay.

---

## 5. Luồng làm việc đề xuất cho dự án Vite + React

```
[Yêu cầu mới]
      │
      ▼
 business-analyst ── user story + AC + state matrix
      │
      ▼
 solution-architect ── ADR (router / data / state / auth), route tree, perf budget
      │
      ▼
 uiux-designer ── design token, Storybook spec, a11y criteria
      │
      ▼
 vite-react-developer ── implement (component + hook + query + route)
      │          ├── fullstack-developer (BFF/API nếu cần)
      │          └── qa-engineer (Vitest + RTL + Playwright, TDD song song)
      ▼
 /review-local-changes ── trước khi commit
      │   (bug-hunter, security-auditor, code-quality-reviewer,
      │    contracts-reviewer, test-coverage-reviewer,
      │    historical-context-reviewer)
      ▼
 principal-engineer ── review tổng + investigate nếu có perf/logic issue
      │
      ▼
 git commit → push → PR
      │
      ▼
 /review-pr ── inline comments
      │
      ▼
 CI: pnpm audit · typecheck · lint · test --coverage · build · playwright · Lighthouse CI
      │
      ▼
 Merge → deploy preview → smoke test → promote
```

**Gate bắt buộc trước merge**:
- `pnpm typecheck` xanh, không `any` mới.
- `pnpm lint` xanh (bao gồm `jsx-a11y`, `react-hooks/exhaustive-deps`).
- `pnpm test -- --coverage` đạt ngưỡng (≥ 80%).
- `pnpm build` thành công, bundle diff trong budget.
- Playwright suite critical xanh.
- `pnpm audit` không có advisory critical/high.
- `security-auditor` không còn issue Critical/High.
- `contracts-reviewer` đã ghi nhận breaking props/schema kèm migration path.
- Lighthouse CI: LCP < 2.5s, INP < 200ms, CLS < 0.1 (trên trang chính).

---

## 6. Bảng ánh xạ lệnh sang Vite + React

| Mục đích | Lệnh |
|----------|------|
| Install deps | `pnpm install` (`--frozen-lockfile` trên CI) |
| Dev server | `pnpm dev` |
| Typecheck | `pnpm typecheck` → `tsc --noEmit` |
| Lint | `pnpm lint` → `eslint .` |
| Format | `pnpm format` → `prettier --write .` |
| Test (unit/component) | `pnpm test` → `vitest` |
| Test watch | `pnpm test -- --watch` |
| Coverage | `pnpm test -- --coverage` |
| E2E | `pnpm test:e2e` → `playwright test` |
| E2E UI debug | `pnpm exec playwright test --ui` |
| Build | `pnpm build` → `vite build` |
| Preview build | `pnpm preview` → `vite preview` |
| Bundle analyze | `pnpm exec vite-bundle-visualizer` hoặc plugin `rollup-plugin-visualizer` |
| Audit deps | `pnpm audit --prod` |
| Storybook | `pnpm storybook` / `pnpm build-storybook` |
| Lighthouse CI | `pnpm exec lhci autorun` |
| Mutation test | `pnpm exec stryker run` |
| Upgrade deps | `pnpm up -iL` (interactive, latest) |

---

## Ghi chú

- Các agent **chỉ review** (không sửa code) trừ `vite-react-developer`, `fullstack-developer`, `qa-engineer`.
- **Không** commit `.env*` thật; chỉ commit `.env.example`. Biến khách hàng thấy được phải có prefix `VITE_` và **không** chứa secret.
- `CLAUDE.md` ở gốc repo là single source of truth cho coding standards — mọi agent đọc trước khi hành động.
- Khi bật **React Compiler** (React 19+), giảm mạnh nhu cầu `useMemo`/`useCallback` thủ công — `code-quality-reviewer` cần tham chiếu cấu hình dự án trước khi flag.

_Tham chiếu nguồn gốc:_ `.claude/agents/*.md`, `.claude/skills/review-local-changes/SKILL.md`, `.claude/skills/review-pr/SKILL.md`, `.claude/agents/vite-react-developer.md`.
