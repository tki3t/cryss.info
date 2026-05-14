# PHP Dev — Tổng hợp Agents & Skills

Tài liệu này tổng hợp toàn bộ agents trong `.claude/agents/` và skills trong `.claude/skills/` của boilerplate, **đã được viết lại / chú thích lại cho ngữ cảnh PHP** (Laravel, Symfony, CodeIgniter, WordPress, Composer, PHPUnit, Pest, PHPStan, Psalm, PHP-CS-Fixer, Rector, Xdebug…). Nội dung giữ nguyên bản chất (trách nhiệm, checklist, quy trình) của các agent gốc, chỉ ánh xạ lệnh/công cụ/ví dụ sang hệ sinh thái PHP.

---

## Mục lục

- [1. Tech Stack PHP mặc định](#1-tech-stack-php-mặc-định)
- [2. Danh sách Agents (15 — 14 áp dụng cho PHP web)](#2-danh-sách-agents-15)
- [3. Chi tiết từng Agent](#3-chi-tiết-từng-agent)
  - [3.1 business-analyst](#31-business-analyst)
  - [3.2 solution-architect](#32-solution-architect)
  - [3.3 uiux-designer](#33-uiux-designer)
  - [3.4 fullstack-developer (PHP)](#34-fullstack-developer-php)
  - [3.5 qa-engineer (PHPUnit / Pest)](#35-qa-engineer-phpunit--pest)
  - [3.6 principal-engineer](#36-principal-engineer)
  - [3.7 bug-hunter](#37-bug-hunter)
  - [3.8 security-auditor (OWASP + PHP)](#38-security-auditor-owasp--php)
  - [3.9 contracts-reviewer](#39-contracts-reviewer)
  - [3.10 code-quality-reviewer](#310-code-quality-reviewer)
  - [3.11 test-coverage-reviewer](#311-test-coverage-reviewer)
  - [3.12 historical-context-reviewer](#312-historical-context-reviewer)
  - [3.13 seo-specialist](#313-seo-specialist)
- [4. Skills (5)](#4-skills)
  - [4.1 review-local-changes](#41-review-local-changes)
  - [4.2 review-pr](#42-review-pr)
  - [4.3 run-quality-gates](#43-run-quality-gates)
  - [4.4 explore-codebase](#44-explore-codebase)
  - [4.5 feature-cycle](#45-feature-cycle)
- [5. Luồng làm việc đề xuất cho dự án PHP](#5-luồng-làm-việc-đề-xuất-cho-dự-án-php)
- [6. Bảng ánh xạ lệnh JS/Python → PHP](#6-bảng-ánh-xạ-lệnh-jspython--php)

---

## 1. Tech Stack PHP mặc định

Các agent mặc định sẽ đọc `CLAUDE.md`, `.claude/tech-stack.md`, `.claude/docs/` trước khi làm việc. Với dự án PHP, stack tham chiếu khuyến nghị:

- **Ngôn ngữ**: PHP 8.2+ (strict types, readonly, enums, `never`, first-class callable).
- **Framework**: Laravel 11 / Symfony 7 / (tùy chọn) WordPress, Slim, CodeIgniter 4.
- **Quản lý gói**: Composer (`composer.json`, `composer.lock`).
- **ORM / DB**: Eloquent, Doctrine ORM, `PDO` (parameterized queries bắt buộc).
- **Validation**: `illuminate/validation`, `symfony/validator`, `respect/validation`, Form Requests, DTO + attributes.
- **Test**: PHPUnit 10+, Pest 2+, Mockery, Prophecy, Infection (mutation testing), Laravel Dusk / Codeception / Playwright-PHP cho E2E.
- **Static analysis**: PHPStan (level 8+), Psalm, Rector.
- **Code style**: PHP-CS-Fixer, PHP_CodeSniffer (PSR-12), Laravel Pint.
- **Debug / profiling**: Xdebug, Blackfire, Clockwork, Laravel Telescope, Symfony Profiler.
- **CI**: GitHub Actions / GitLab CI chạy `composer install`, `vendor/bin/phpstan`, `vendor/bin/pest --coverage`.

---

## 2. Danh sách Agents (15)

Tổng repo có 15 agents. Dự án PHP web dùng 14 agents bên dưới; `game-tweak-engineer` là agent native Apple-platform (`.dylib` tweaks), không áp dụng cho web — bỏ qua trong PHP project.

| # | Tên agent | Vai trò ngắn | Khi dùng |
|---|-----------|--------------|----------|
| 1 | `business-analyst` | Phân tích yêu cầu, viết user story, AC | Giai đoạn tiếp nhận yêu cầu |
| 2 | `solution-architect` | Thiết kế kiến trúc, ADR, chọn stack | Trước khi code tính năng lớn |
| 3 | `uiux-designer` | Review UI/UX, accessibility (WCAG 2.1 AA) | Frontend Blade/Twig/Livewire/Inertia |
| 4 | `seo-specialist` | SEO kỹ thuật + on-page, meta, JSON-LD, sitemap, hreflang, canonical | Trang marketing / blog / product của Laravel/WordPress |
| 5 | `fullstack-developer` | Hiện thực backend + frontend SSR | Mọi task implement backend / Blade / Livewire / Inertia |
| 6 | `qa-engineer` | Viết & chạy test, coverage | Sau khi code xong hoặc TDD |
| 7 | `principal-engineer` | Review toàn diện + điều tra sự cố + sign-off merge | Review chuyên sâu, debug, vấn đề liên phòng ban |
| 8 | `bug-hunter` | Phân tích nguyên nhân gốc (RCA), defense-in-depth | Sau khi hoàn thành 1 mảng code |
| 9 | `security-auditor` | Audit bảo mật (OWASP Top 10) | Trước merge, code nhạy cảm |
| 10 | `contracts-reviewer` | Review API / data model / type | Thay đổi schema, endpoint, DTO |
| 11 | `code-quality-reviewer` | Review DRY/KISS/SOLID, PSR | Sau mỗi lần commit/PR |
| 12 | `test-coverage-reviewer` | Đánh giá chất lượng & độ phủ test | Sau khi có test |
| 13 | `historical-context-reviewer` | Đào git history, PR cũ | File thường xuyên bị sửa, hotspot |
| 14 | `vite-react-developer` | Frontend Vite + React (TS, TanStack Query, RHF, Vitest, Playwright) | Khi frontend là SPA Vite+React tách khỏi backend PHP (Inertia React / API + SPA) |
| — | `game-tweak-engineer` | C/C++/ObjC++ → `.dylib` tweaks, iOS/macOS hooks | Không áp dụng cho PHP web |

---

## 3. Chi tiết từng Agent

> Quy ước: mỗi agent đều có **STEP 1 bắt buộc**: đọc `CLAUDE.md`, `.claude/tech-stack.md`, `.claude/docs/`, `composer.json`, `phpunit.xml`, `phpstan.neon`, `.php-cs-fixer.dist.php` để hiểu chuẩn dự án trước khi thao tác.

### 3.1 business-analyst

**Trách nhiệm**: phân tích yêu cầu, user story, AC, NFR, gap analysis, traceability matrix.

**Quy trình**:
1. Thu thập yêu cầu → làm rõ ẩn ý → phát hiện mâu thuẫn.
2. Ưu tiên theo **MoSCoW** (Must/Should/Could/Won't).
3. Định nghĩa success criteria rõ ràng.

**Output — User Story**:

```text
As a <user type>
I want to <action>
So that <benefit>

Acceptance Criteria (Gherkin):
  Given <context>
  When <action>
  Then <expected outcome>
```

**Output — Requirements Document**: Executive Summary · Business Objectives · Functional Req · Non-Functional Req (perf, security, scalability) · Constraints · Dependencies · Success Metrics.

---

### 3.2 solution-architect

**Trách nhiệm**: thiết kế hệ thống, ADR, data model, chọn pattern/stack, API contract, security/performance plan.

**Deliverables**:
- System Architecture Document (overview, component diagram, data flow, ER diagram, API spec, security, deployment, scalability, DR).
- **ADR** cho mỗi quyết định: Context · Decision · Rationale · Consequences · Alternatives.

**PHP-specific pattern cần cân nhắc**:
- Monolith modular (Laravel Modules, Symfony bundles) vs microservices.
- **Hexagonal / Ports & Adapters** rất hợp PHP (Symfony messenger, Laravel queues).
- **CQRS + Event Sourcing** (`spatie/laravel-event-sourcing`, `broadway/broadway`).
- **Repository pattern + DTO** thay vì truyền Eloquent model xuyên layer.
- API Gateway: Laravel Sanctum/Passport, API Platform (Symfony).

**Nguyên tắc**: SOLID · design-for-failure (circuit breaker, retry, fallback) · loose coupling · API-first · security by design · cost-effective.

---

### 3.3 uiux-designer

**Trách nhiệm**: review UI/UX, đảm bảo consistency, WCAG 2.1 AA, visual hierarchy, responsive.

**Áp dụng cho PHP**: Blade, Twig, Livewire, Inertia + Vue/React, Filament, Nova, WordPress theme.

**Tiêu chí**:
- **Visual**: consistency, hierarchy, typography (body ≥ 16px), contrast (4.5:1 text, 3:1 large), grid 4/8px, whitespace.
- **UX**: clarity, feedback (hover/active/loading), error message hữu ích, skeleton/progress, navigation, form label + inline validation, CTA nổi bật.
- **Accessibility**: keyboard nav, focus indicator, ARIA, alt text, skip links, form label liên kết `for`/`id`.
- **Responsive**: mobile-first, target ≥ 44×44px, không horizontal scroll.
- **Design system**: token-based color/spacing/typography, component library tái sử dụng.

**Ưu tiên issue**: Critical (chặn task / vi phạm a11y) · High · Medium · Low.

---

### 3.4 fullstack-developer (PHP)

**STEP 1**: đọc `CLAUDE.md`, `.claude/tech-stack.md`, `composer.json`, cấu trúc dự án.

#### Backend patterns

**Laravel — Controller + FormRequest + Service**:

```php
// routes/api.php
Route::apiResource('resources', ResourceController::class);

// app/Http/Requests/CreateResourceRequest.php
final class CreateResourceRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'  => ['required', 'string', 'min:1', 'max:100'],
            'email' => ['required', 'email'],
            'age'   => ['nullable', 'integer', 'min:1'],
        ];
    }
}

// app/Http/Controllers/ResourceController.php
final class ResourceController extends Controller
{
    public function __construct(private readonly ResourceService $service) {}

    public function store(CreateResourceRequest $request): JsonResponse
    {
        $dto = CreateResourceData::from($request->validated());
        $resource = $this->service->create($dto);

        return response()->json($resource, Response::HTTP_CREATED);
    }
}
```

**Symfony — Controller + DTO + Validator**:

```php
#[Route('/api/resources', methods: ['POST'])]
public function create(
    #[MapRequestPayload] CreateResourceDto $dto,
    ResourceService $service,
): JsonResponse {
    return $this->json($service->create($dto), Response::HTTP_CREATED);
}
```

#### ORM patterns

**Eloquent**:

```php
// Schema
Schema::create('resources', function (Blueprint $t) {
    $t->uuid('id')->primary();
    $t->string('name');
    $t->timestamps();
    $t->index('name');
});

// Query (tránh N+1)
$posts = Post::with('author')->paginate(20); // eager load
```

**Doctrine**:

```php
#[ORM\Entity]
class Resource
{
    #[ORM\Id, ORM\Column(type: 'uuid')]
    private Uuid $id;

    #[ORM\Column(length: 100)]
    private string $name;
}
```

#### Validation

- Laravel: Form Request / `Validator::make`.
- Symfony: `symfony/validator` + attributes (`#[Assert\NotBlank]`, `#[Assert\Email]`).
- DTO: `spatie/laravel-data`, readonly classes + constructor promotion.

#### Checklist implement

**Backend**
- [ ] Strict types (`declare(strict_types=1);`) đầu file.
- [ ] Validate mọi input (FormRequest / Validator / DTO).
- [ ] Parameterized query (Eloquent/Doctrine/PDO prepared) — **không concat SQL**.
- [ ] Transaction (`DB::transaction` / `$em->wrapInTransaction`) cho thao tác multi-step.
- [ ] HTTP status code đúng chuẩn.
- [ ] Log có context (`Log::info('...', ['user_id' => $id])`).
- [ ] Không để `dd()`, `var_dump`, `dump()`.

**Frontend (Blade/Twig/Livewire)**
- [ ] Loading / error states.
- [ ] Escape output `{{ $var }}` (Blade tự escape) — cảnh giác `{!! !!}`.
- [ ] CSRF token (`@csrf`) trên form POST.
- [ ] Responsive, a11y cơ bản.

#### Chạy test & build

```bash
composer install
vendor/bin/phpstan analyse --level=8
vendor/bin/php-cs-fixer fix --dry-run --diff
vendor/bin/pest --coverage
php artisan test        # Laravel
bin/phpunit             # Symfony
```

---

### 3.5 qa-engineer (PHPUnit / Pest)

**Quy trình**: phân tích yêu cầu → đo coverage hiện tại → viết test theo **AAA (Arrange-Act-Assert)**.

**Coverage mục tiêu**: Statements/Functions/Lines ≥ 80% (target 90%), Branches ≥ 75% (target 85%).

#### Mẫu test — Pest

```php
<?php
use App\Services\UserService;

beforeEach(function (): void {
    $this->db = Mockery::mock(UserRepository::class);
    $this->service = new UserService($this->db);
});

it('creates user with valid data', function (): void {
    // Arrange
    $data = ['email' => 'test@test.com', 'name' => 'Test'];
    $this->db->shouldReceive('create')->once()->andReturn(new User(id: '1', ...$data));

    // Act
    $user = $this->service->createUser($data);

    // Assert
    expect($user)->not->toBeNull()
        ->and($user->email)->toBe('test@test.com');
});

it('throws on invalid email', function (): void {
    expect(fn () => $this->service->createUser(['email' => 'invalid', 'name' => 'T']))
        ->toThrow(InvalidArgumentException::class, 'Invalid email');
});
```

#### Mẫu test — PHPUnit

```php
final class UserServiceTest extends TestCase
{
    private UserService $service;
    private UserRepository&MockObject $db;

    protected function setUp(): void
    {
        $this->db = $this->createMock(UserRepository::class);
        $this->service = new UserService($this->db);
    }

    public function test_create_user_with_valid_data(): void
    {
        $this->db->method('create')->willReturn(new User('1', 'test@test.com', 'Test'));

        $user = $this->service->createUser(['email' => 'test@test.com', 'name' => 'Test']);

        self::assertSame('test@test.com', $user->email);
    }

    #[DataProvider('invalidEmailProvider')]
    public function test_rejects_invalid_email(string $email): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->service->createUser(['email' => $email, 'name' => 'T']);
    }

    public static function invalidEmailProvider(): iterable
    {
        yield 'no @'   => ['testtest.com'];
        yield 'empty'  => [''];
        yield 'spaces' => ['a b@c.com'];
    }
}
```

#### Edge cases bắt buộc test

- Input: empty, null, chuỗi rất dài, unicode, SQL-injection payload (`' OR 1=1--`), XSS payload (`<script>`).
- Số: 0, âm, rất lớn, float precision, `NAN`, `INF`.
- Collection: rỗng, 1 phần tử, rất lớn, trùng lặp.
- Date/Time: timezone, DST, năm nhuận, ngày không hợp lệ.
- Async/queue: timeout, network fail, race condition, job retry.
- Error: DB mất kết nối, external API fail, permission denied, transaction rollback.

#### Lệnh chạy

```bash
vendor/bin/pest --coverage --min=80
vendor/bin/phpunit --coverage-html coverage/
vendor/bin/infection --min-msi=70      # mutation testing
php artisan dusk                        # Laravel E2E
```

---

### 3.6 principal-engineer

Senior engineer 15+ năm, phụ trách **review toàn diện + điều tra sự cố (RCA)**.

#### Quy trình điều tra

1. **Thu thập**: triệu chứng, thời điểm phát sinh, cách tái hiện, stack trace, environment.
2. **Tái hiện**: chạy test liên quan, chạy app local.
3. **Phân tích**: kiểm tra endpoint, query, middleware, config.

```bash
git log --oneline --since="3 days ago"
grep -rn "error message" app/ src/
grep -rn "SELECT\|INSERT\|UPDATE" app/ src/
```

#### Anti-pattern PHP hay gặp

**N+1 query (Eloquent)**:

```php
// ❌
foreach (User::all() as $user) {
    echo $user->posts->count();
}

// ✅
User::withCount('posts')->get();
// hoặc
User::with('posts')->get();
```

**Nuốt exception**:

```php
// ❌
try { riskyCall(); } catch (Throwable) {}

// ✅
try {
    riskyCall();
} catch (HttpException $e) {
    Log::warning('upstream failed', ['ex' => $e]);
    throw $e;
}
```

**Race condition trên counter**:

```php
// ❌
$user->credits += 10;
$user->save();

// ✅ atomic
DB::table('users')->where('id', $id)->increment('credits', 10);
```

**Memory leak trong long-running (queue worker, Octane)**: không clear static cache, event listeners tích tụ → OOM.

#### Report format

```markdown
# Investigation Report: <title>
- Date · Severity · Status
## Issue · Root Cause · Evidence · Solution · Prevention
```

#### Checklist review PHP bổ sung

- [ ] `declare(strict_types=1);` ở mọi file.
- [ ] Không `any`-like: tránh `mixed` nếu có thể, type-hint đầy đủ (`array<string, User>` qua PHPDoc).
- [ ] PSR-12 + PSR-4 autoload.
- [ ] `composer.lock` commit.
- [ ] PHPStan level ≥ 8 pass.
- [ ] Không `eval`, `extract`, `create_function`.

#### Delegation

- Fix bug → `fullstack-developer`
- Viết test → `qa-engineer`
- Đổi kiến trúc → `solution-architect`
- UI → `uiux-designer`

---

### 3.7 bug-hunter

Chuyên gia RCA, tìm **nguyên nhân gốc hệ thống**, không dừng ở triệu chứng.

**5 nguyên tắc**:
1. Trace ngược về nguồn dữ liệu sai.
2. Phân tích đa chiều (Technology · Methods · Process · Environment · Materials · People).
3. Defense-in-depth: fix tại nguồn **và** thêm validation ở từng layer.
4. Ưu tiên lỗi hệ thống hơn lỗi cá biệt.
5. Ưu tiên critical (data loss, security, silent failure, outage).

#### 5 Phase

1. **Deep scan critical paths**: auth/authz, persistence, external API, error handling, business logic tài chính, input validation, concurrency.
2. **Root cause tracing**: symptom → immediate cause → call chain → original trigger → systemic enabler.
3. **Fishbone multi-dimensional**.
4. **5 Whys** cho issue severity ≥ 8.
5. **Prioritize**: P1 critical (data loss, security, silent failure), P2 high, P3 medium pattern, bỏ P-low.

#### PHP-specific critical paths

- Middleware auth (`auth:sanctum`, Symfony Security).
- Mass assignment (`$fillable` / `$guarded`, `#[Groups]`).
- Deserialization (`unserialize`, `Symfony\Serializer`) — tránh `unserialize` trên input.
- File upload (`UploadedFile::move`, validate mimetype + size + tên).
- Queue job idempotency (retry không nhân đôi tác dụng phụ).
- Session fixation / regenerate sau login (`session()->regenerate()`).

#### Output mẫu Critical

```markdown
## 🚨 Critical: <mô tả>
**Location:** `app/Services/OrderService.php:88-102`
**Symptom:** ...
**Root Cause Trace:**
1. Symptom: ...
2. ← Immediate: ...
3. ← Called by: ...
4. ← Originates: ...
5. ← Systemic: thiếu validation ở boundary API
**Fishbone:** Technology/Methods/Process...
**Impact:** data loss? security? silent? outage?
**Defense-in-depth:**
1. Fix tại nguồn
2. Layer 1: FormRequest
3. Layer 2: DTO validation
4. Layer 3: DB constraint + unique index
5. Monitoring: Sentry alert rule
```

---

### 3.8 security-auditor (OWASP + PHP)

**6 nguyên tắc**: Defense in Depth · Least Privilege · Fail Securely · No Security by Obscurity · Input Validation · Sensitive Data Protection.

#### Checklist (ánh xạ PHP)

- [ ] **SQL Injection**: Eloquent/Doctrine/PDO prepared, **không** `DB::raw($userInput)`, không `"... WHERE id=$id"`.
- [ ] **XSS**: Blade `{{ }}` tự escape; cảnh giác `{!! !!}`, `Html::raw`, `e()`; sanitize HTML với `HTMLPurifier`.
- [ ] **CSRF**: `@csrf` / Symfony CSRF token trên mọi form state-changing.
- [ ] **Authentication**: mọi route bảo vệ qua middleware `auth`; password `Hash::make` (bcrypt/argon2id).
- [ ] **Authorization**: Policy/Gate (Laravel), Voter (Symfony) — không check `Auth::user()->is_admin` rải rác controller.
- [ ] **No Hardcoded Secrets**: `.env` + `config/*.php`; đừng commit `.env`.
- [ ] **Input Validation**: FormRequest/DTO/Validator, whitelist thay vì blacklist.
- [ ] **Output Encoding**: theo context (HTML, URL `urlencode`, JS `json_encode(..., JSON_HEX_TAG|JSON_HEX_AMP)`, SQL).
- [ ] **Dependencies**: `composer audit`, Snyk, Dependabot — không dùng package có CVE.
- [ ] **HTTPS Only**: `URL::forceScheme('https')`, `Strict-Transport-Security`.
- [ ] **Session**: regenerate sau login, invalidate khi logout, cookie `Secure; HttpOnly; SameSite=Lax/Strict`.
- [ ] **Rate limit**: `throttle:10,1` cho login, password reset, OTP.
- [ ] **File upload**: validate mime (`mimetypes`, không chỉ extension), size, random filename, lưu ngoài webroot.
- [ ] **No stack trace in prod**: `APP_DEBUG=false`, custom error page.
- [ ] **No sensitive logs**: không log password, token, PAN, CCV, SSN.
- [ ] **Path traversal**: `realpath()` + kiểm tra prefix, không nhận `../`.
- [ ] **Command injection**: không `exec/shell_exec/passthru/system` với user input; dùng `escapeshellarg/escapeshellcmd`.
- [ ] **XXE**: `libxml_disable_entity_loader(true)` (PHP < 8) / không bật `LIBXML_NOENT`.
- [ ] **Deserialization**: không `unserialize` dữ liệu untrusted; dùng JSON.
- [ ] **Security headers**: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy (Laravel Secure Headers, Symfony SecurityBundle).

**Severity**: Critical (RCE, full data access) · High (unauthorized access) · Medium (edge-case) · Low (best-practice).

Output dạng bảng: | Severity | File | Line | Vuln Type | Risk | Fix |.

---

### 3.9 contracts-reviewer

Review **API · data model · type design**.

**Nguyên tắc**: Make Illegal States Unrepresentable · Strong Encapsulation · Clear Invariants · Contract Stability · Minimal & Complete · Validation at Boundaries.

#### Checklist PHP

- [ ] **Illegal states unrepresentable**: dùng `enum` (PHP 8.1+) thay vì string; dùng `readonly` property + constructor validation.
- [ ] **No primitive obsession**: `EmailAddress`, `Money`, `UserId` value object thay vì `string`/`int`.
- [ ] **Validated construction**: mọi factory/constructor validate invariants.
- [ ] **Immutability**: `readonly class` (PHP 8.2+) cho DTO/value object.
- [ ] **Explicit nullability**: `?string` rõ ràng, tránh nullable ngầm.
- [ ] **No anemic model**: model chứa behavior (method domain), không chỉ getter/setter.
- [ ] **Encapsulation**: không `public` property, dùng method; tránh `__get/__set` magic.
- [ ] **Single Responsibility** mỗi class/DTO.
- [ ] **Consistent naming**: PSR-12, domain-driven.
- [ ] **Self-documenting types** qua PHPDoc generics (`@template`, `Collection<int, User>`).
- [ ] **API versioning**: `/api/v1`, `/api/v2` hoặc header.
- [ ] **Backward compatibility**: deprecate có đường di chuyển, tránh breaking change âm thầm.
- [ ] **Typed error objects**: custom Exception + code + message hành động được.
- [ ] **No leaky abstraction**: đừng expose Eloquent model ra JSON trực tiếp → dùng API Resource / Symfony Serializer Groups.
- [ ] **Generics**: PHPStan generics, template constraints.
- [ ] **Schema ↔ ORM**: migration khớp với entity, có unique/foreign key constraint.
- [ ] **No optional overuse**: optional phải là thực sự optional.
- [ ] **Discriminated unions**: enum backed + polymorphism cho variants.
- [ ] **No boolean blindness**: enum `Status::Active|Pending|Closed` thay vì `bool $isActive`.
- [ ] **Relationship integrity**: FK + cascade đúng, index trên FK.

**Breaking change table**: Change Type · File · Line · Impact · Migration Path.

---

### 3.10 code-quality-reviewer

Review tuân thủ guidelines dự án (PSR, CLAUDE.md) + Clean Code + SOLID.

#### Checklist tổng hợp (PHP)

**Clean Code**
- [ ] DRY, KISS, YAGNI
- [ ] Early return
- [ ] Function ≤ 80 dòng, file ≤ 200 dòng
- [ ] ≤ 3 tham số (dùng DTO/object nếu >3)
- [ ] Cyclomatic complexity ≤ 10 (`phpmd`/`phpstan`)
- [ ] Không magic number (constants, enums)
- [ ] Không dead code, không comment-out code

**SOLID**
- [ ] SRP class & function
- [ ] Open/Closed (interface + strategy)
- [ ] LSP (subclass không phá contract)
- [ ] ISP (interface nhỏ, tập trung)
- [ ] DIP (inject interface, không `new` service trong class nghiệp vụ)

**Naming (PSR-12)**
- [ ] Biến đầy đủ nghĩa (trừ counter `$i`,`$j`)
- [ ] Function = verb (`calculateTotal`, `fetchUser`)
- [ ] Class = noun PascalCase (`UserAccount`)
- [ ] Boolean: `is/has/can/should/will`
- [ ] Constants `UPPER_SNAKE_CASE`
- [ ] Collection số nhiều (`$users`)
- [ ] Không trộn camelCase / snake_case ngoài cấu hình framework

**Architecture**
- [ ] Layer boundary: Controller không query trực tiếp DB, Domain không biết HTTP.
- [ ] Dependency chiều trong: UI → Application → Domain → Infrastructure.
- [ ] Không circular dependency giữa module.
- [ ] External access qua interface/repository.
- [ ] Pattern nhất quán (toàn MVC hay toàn Hex, không trộn).

**Error handling**
- [ ] Không `catch (Throwable) {}` rỗng.
- [ ] Catch cụ thể (custom Exception).
- [ ] Thông điệp user-facing thân thiện, không stack trace.
- [ ] Exception typed, không `throw new Exception('string')` chung chung.

**Performance**
- [ ] Không N+1 (eager load, `with`, `fetchJoin`).
- [ ] Resource cleanup (`fclose`, `unset` cho dataset lớn).
- [ ] Query có index.
- [ ] Pagination (cursor hoặc keyset, tránh `offset` lớn).
- [ ] Cache phù hợp (Redis tag, HTTP cache).
- [ ] Không chạy blocking I/O trong request (dùng queue).

**Backend API**
- [ ] RESTful: GET đọc, POST tạo, PUT/PATCH sửa, DELETE xóa.
- [ ] Status code đúng (200/201/204/400/401/403/404/409/422/500).
- [ ] Idempotent cho PUT/DELETE.
- [ ] Request validation ở FormRequest/Validator, không trong controller.
- [ ] Business logic ở Service/Domain, không trong Controller.
- [ ] Transaction cho multi-step.
- [ ] Versioning rõ (`/v1`).

**Database**
- [ ] Migration declarative (`Schema::create`, Doctrine migrations).
- [ ] Không SQL thô trộn user input.
- [ ] Parameterized.
- [ ] Index ở WHERE/JOIN.
- [ ] Batch insert `insert([...])` thay vì loop `save()`.
- [ ] Connection pooling (PgBouncer, ProxySQL) khi cần.
- [ ] Migration backwards compatible / có rollback.

Output: **Quality Score X/Y** + suggestions cụ thể.

---

### 3.11 test-coverage-reviewer

Đánh giá **chất lượng** coverage, không chạy theo 100% line.

**Checklist**:
- [ ] Mọi public method có ít nhất 1 test.
- [ ] Happy path có test riêng.
- [ ] Error path có test riêng.
- [ ] Boundary: min/max/empty.
- [ ] Null/optional param có test.
- [ ] External service có integration test (HTTP mock với `Http::fake`, `MockWebServer`).
- [ ] Test độc lập, chạy thứ tự bất kỳ.
- [ ] Assertion có nghĩa, không `assertNotNull` rỗng.
- [ ] Tên test mô tả scenario + outcome (`test_it_returns_404_when_user_missing`).
- [ ] Không hardcode test data (factory, `Model::factory()`, ObjectMother).
- [ ] Mock ranh giới external, không mock logic nội bộ.

**Criticality**: Critical / Important / Medium / Low / Optional.

**Output**: bảng Missing Critical Coverage + Test Quality Issues + Score.

---

### 3.12 historical-context-reviewer

Đào git history + PR cũ để:
- Hiểu lý do code hiện tại.
- Tránh lặp lỗi cũ.
- Nhất quán với quyết định kiến trúc trước đây.

**Lệnh**:

```bash
git log --follow -p -- app/Services/OrderService.php
git blame app/Services/OrderService.php
gh pr list --search "path:app/Services/OrderService.php"
```

**Phát hiện**:
- Hotspot (file sửa 10+ lần / 6 tháng).
- Recurring bug / breaking change / perf regression / security.
- Refactoring churn.
- Test thường xuyên vỡ khi đổi file này.

**Output**: bảng File Change History Summary + Historical Issues + PR Review Comments liên quan + Architectural Decisions đã có.

---

### 3.13 seo-specialist

Chuyên SEO kỹ thuật + on-page cho website PHP (Laravel/Symfony/WordPress). Khi nào gọi:
- Thêm/sửa trang marketing, blog, category, product detail
- Thay đổi routing, canonical host, i18n/hreflang
- Thiết kế admin/CMS form cho phép editor override SEO

**Output chính**: `SeoData` contract, quy tắc sinh SEO mặc định theo loại trang, meta + OG + Twitter + JSON-LD templates, `robots.txt` + `sitemap.xml` (hoặc generator qua `spatie/laravel-sitemap`), Google SERP preview spec cho admin.

**Với Laravel**: dùng `@section('seo')` trong layout chính; `spatie/schema-org` cho JSON-LD; `spatie/laravel-sitemap` cho sitemap động.

**Với WordPress**: Yoast/Rank Math là mặc định — agent chỉ kiểm tra/chỉnh template, không hand-roll.

**Delegation**: perf (LCP/INP/CLS) → `fullstack-developer`; a11y → `uiux-designer`; ADR đổi rendering mode → `solution-architect`.

File gốc: `.claude/agents/seo-specialist.md` (đầy đủ 21 section, rules, DoD).

---

## 4. Skills

Skills trigger qua slash command trong Cascade, nằm ở `.claude/skills/<name>/SKILL.md`. Boilerplate hiện có **5 skills**: 2 skill review + 3 skill workflow.

### 4.1 review-local-changes

**Slash**: `/review-local-changes [review-aspects] [--min-impact critical|high|medium|medium-low|low] [--json]`

**Mặc định**: `--min-impact high`, markdown.

**Quy trình (3 phase)**:

1. **Preparation**:
   - `git status --short`, `git diff --stat`, `git diff --cached --stat`.
   - Phân biệt staged vs unstaged, review cả hai.
   - Parse `$ARGUMENTS`.
   - Launch tối đa 6 Haiku agents song song: 1 quét guideline files (`CLAUDE.md`, `AGENTS.md`, `constitution.md`, `README.md`), 5 còn lại chia file theo LoC để tóm tắt thay đổi.

2. **Searching for Issues**: chạy song song các review agents phù hợp:
   - `security-auditor` (mọi thay đổi code/config)
   - `bug-hunter`
   - `code-quality-reviewer` (+ gợi ý cải thiện)
   - `contracts-reviewer` (khi đổi type/API/data model)
   - `test-coverage-reviewer` (khi có code/test thay đổi)
   - `historical-context-reviewer` (khi thay đổi phức tạp hoặc cần context)

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

   - Áp dụng `MIN_IMPACT_SCORE` trước (`critical=81, high=61, medium=41, medium-low=21, low=0`), rồi tới confidence threshold.

**Output**: Markdown report (hoặc JSON nếu `--json`) với **Quality Gate: PASS/FAIL**, Issues phân theo severity, Improvements từ `code-quality-reviewer`.

**Format inline comment**:

```
L<line>: <problem>. <fix>.
🔴 bug: / 🟡 risk: / 🔵 nit: / ❓ q:
```

Ví dụ:

```
app/Services/OrderService.php:L42: 🔴 bug: $user can be null after User::find($id). Guard or use findOrFail().
```

**Bỏ qua**: nitpick style linter/phpstan/phpcs đã bắt; pre-existing issue ở code không đổi; `spec/`, `reports/`.

### 4.2 review-pr

**Slash**: `/review-pr [review-aspects] [--min-impact ...]`

Giống `review-local-changes` về rules, scoring, filter — **khác ở output**:
- **Chỉ post inline comment**, không có overall report.
- Mỗi comment phải gắn với dòng cụ thể, mang giá trị rõ ràng.
- Bỏ comment khen tổng quát.

Áp dụng cho PR trên GitHub/GitLab: dùng `gh pr view`, `gh pr diff`, `gh pr review --comment`.

### 4.3 run-quality-gates

**Slash**: `/run-quality-gates [--fix] [--stage pre|post] [--json]`

Chạy tự động 4 cổng chất lượng bắt buộc theo CLAUDE.md §15.0.1. Với dự án PHP:

- **typecheck**: `vendor/bin/phpstan analyse --no-progress`
- **lint**: `vendor/bin/pint --test` (hoặc `php-cs-fixer fix --dry-run --diff`)
- **test**: `vendor/bin/pest` (hoặc `vendor/bin/phpunit`)
- **build**: không áp dụng, skip tự động

Chạy `--stage pre` trước khi bắt đầu feature (baseline phải xanh) và `--stage post` sau khi implement (zero-impact). Skill tự detect stack từ `composer.json` + `phpstan.neon`.

### 4.4 explore-codebase

**Slash**: `/explore-codebase [focus-area] [--depth quick|standard|deep]`

Thực thi Phase 0 của CLAUDE.md §15.1: đọc docs, map routes, tìm feature tương tự, nhận diện convention naming, validation library, error shape, test pattern. Luôn chạy trước khi implement feature mới để tránh trùng code và lệch pattern.

### 4.5 feature-cycle

**Slash**: `/feature-cycle <mô tả feature> [--stack php] [--min-score 9.5] [--max-iterations 5]`

Orchestrator gói trọn CLAUDE.md §15.3 steps 5–14 vào **1 lệnh**:

1. Baseline guard qua `/run-quality-gates --stage pre`
2. `qa-engineer` viết failing test (TDD RED)
3. `fullstack-developer` implement minimum code (TDD GREEN)
4. `fullstack-developer` refactor giữ test xanh
5. `/run-quality-gates --stage post`
6. `/review-local-changes --json` → fix loop nếu có issue critical/high
7. `principal-engineer` chấm điểm, phải ≥ 9.5 mới APPROVED

Thay cho việc gõ `@` 5 agent liên tiếp. Dùng khi feature có scope trung bình trở lên; tác vụ nhỏ (sửa typo, config) dùng flow tay.

---

## 5. Luồng làm việc đề xuất cho dự án PHP

```
[Yêu cầu mới]
      │
      ▼
 business-analyst ── user story + AC
      │
      ▼
 solution-architect ── ADR + data model + API spec
      │
      ▼
 fullstack-developer ── implement (Laravel/Symfony)
      │          ├── uiux-designer (nếu có UI)
      │          └── qa-engineer (TDD/test song song)
      ▼
 /review-local-changes ── chạy trước khi commit
      │   (bug-hunter, security-auditor, code-quality-reviewer,
      │    contracts-reviewer, test-coverage-reviewer,
      │    historical-context-reviewer)
      ▼
 principal-engineer ── review tổng + investigate nếu có sự cố
      │
      ▼
 git commit → push → PR
      │
      ▼
 /review-pr ── inline comments
      │
      ▼
 CI: composer audit · phpstan · pint · pest --coverage · infection
      │
      ▼
 Merge
```

**Gate bắt buộc trước merge**:
- `vendor/bin/phpstan analyse --level=8` xanh.
- `vendor/bin/pest --coverage --min=80` xanh.
- `composer audit` không có CVE critical/high.
- `security-auditor` không còn issue Critical/High.
- `contracts-reviewer` đã ghi nhận breaking change (nếu có) kèm migration path.

---

## 6. Bảng ánh xạ lệnh JS/Python → PHP

| Mục đích | JS/TS / Python | PHP |
|----------|---------------|-----|
| Install deps | `pnpm install` / `pip install -r` | `composer install` |
| Dev server | `pnpm dev` | `php artisan serve` / `symfony serve` |
| Typecheck | `pnpm typecheck` / `mypy` | `vendor/bin/phpstan analyse` |
| Lint/format | `pnpm lint` / `ruff` | `vendor/bin/pint` / `vendor/bin/php-cs-fixer fix` |
| Test | `pnpm test` / `pytest` | `vendor/bin/pest` / `vendor/bin/phpunit` |
| Coverage | `pnpm test --coverage` | `vendor/bin/pest --coverage` |
| Mutation | — | `vendor/bin/infection` |
| Audit deps | `pnpm audit` / `pip-audit` | `composer audit` |
| DB migrate | `prisma migrate` | `php artisan migrate` / `bin/console doctrine:migrations:migrate` |
| Profile | `node --inspect` / `cProfile` | Xdebug + Blackfire / Clockwork |
| E2E | Playwright / Cypress | Laravel Dusk / Codeception / Playwright-PHP |

---

## Ghi chú

- Toàn bộ agent mặc định **không sửa code khi chỉ review** — chúng xuất báo cáo và đề xuất. Riêng `fullstack-developer` và `qa-engineer` được phép tạo/sửa file.
- Khi làm việc với repo PHP, **luôn** đảm bảo `.env` không bị commit, secrets đi qua vault/CI secret store.
- `CLAUDE.md` ở gốc repo là single source of truth cho coding standards — mọi agent đọc trước khi hành động.

_Tham chiếu nguồn gốc:_ `.claude/agents/*.md`, `.claude/skills/review-local-changes/SKILL.md`, `.claude/skills/review-pr/SKILL.md`.
