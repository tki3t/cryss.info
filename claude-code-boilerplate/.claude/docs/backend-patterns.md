# Backend Patterns — Language & Framework Reference

Referenced by `.claude/agents/fullstack-developer.md`. Load only the section matching your project's configured stack (see `.claude/tech-stack.md` or `CLAUDE.md` Project Configuration table).

> For Vite + React frontends, patterns live in `.claude/agents/vite-react-developer.md`. This document focuses on backend / BFF / server-rendered stacks.

---

## TypeScript — Hono / Elysia / Express / Fastify

```typescript
// Route definition
app.get('/api/{{resource}}', async (c) => {
  try {
    const result = await service.getAll();
    return c.json(result, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: error.message }, 500);
  }
});

// With Zod validation
app.post('/api/{{resource}}',
  zValidator('json', createSchema),
  async (c) => {
    const data = c.req.valid('json');
    const result = await service.create(data);
    return c.json(result, 201);
  }
);
```

### Drizzle ORM

```typescript
export const resources = sqliteTable('resources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

const all = await db.select().from(resources);
const one = await db.select().from(resources).where(eq(resources.id, id));
const created = await db.insert(resources).values(data).returning();
```

### Zod schemas

```typescript
const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});
type CreateData = z.infer<typeof createSchema>;
```

---

## Python — FastAPI / Litestar

```python
@router.get("/api/{{resource}}")
async def get_all(db: Session = Depends(get_db)):
    return service.get_all(db)

@router.post("/api/{{resource}}", status_code=201)
async def create(data: CreateSchema, db: Session = Depends(get_db)):
    return service.create(db, data)
```

### SQLAlchemy 2.0

```python
class Resource(Base):
    __tablename__ = "resources"
    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(default=func.now())

stmt = select(Resource).where(Resource.id == id)
result = await db.scalar(stmt)
```

### Pydantic v2

```python
class CreateData(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    age: PositiveInt | None = None
```

---

## Go — Gin / Echo

```go
func GetAll(c *gin.Context) {
    result, err := service.GetAll()
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, result)
}
```

### GORM

```go
type Resource struct {
    ID        string `gorm:"primaryKey"`
    Name      string `gorm:"not null"`
    CreatedAt time.Time
}

var resources []Resource
db.Find(&resources)
db.First(&resource, "id = ?", id)
db.Create(&resource)
```

### validator

```go
type CreateData struct {
    Name  string `validate:"required,min=1,max=100"`
    Email string `validate:"required,email"`
    Age   *int   `validate:"omitempty,gt=0"`
}
```

---

## Rust — Axum

```rust
async fn get_all(
    State(state): State<AppState>,
) -> Result<Json<Vec<Resource>>, AppError> {
    let result = service::get_all(&state.db).await?;
    Ok(Json(result))
}
```

### SeaORM

```rust
let resources: Vec<resource::Model> = Resource::find().all(db).await?;
let resource = Resource::find_by_id(id).one(db).await?;
let new_resource = resource::ActiveModel { /* ... */ };
new_resource.insert(db).await?;
```

---

## PHP — Laravel / Symfony

### Laravel — FormRequest + Controller + Service

```php
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
        return response()->json($this->service->create($dto), Response::HTTP_CREATED);
    }
}
```

### Symfony — DTO + Validator

```php
#[Route('/api/resources', methods: ['POST'])]
public function create(
    #[MapRequestPayload] CreateResourceDto $dto,
    ResourceService $service,
): JsonResponse {
    return $this->json($service->create($dto), Response::HTTP_CREATED);
}
```

### Eloquent / Doctrine

```php
// Eloquent — avoid N+1
$posts = Post::with('author')->paginate(20);

// Doctrine
#[ORM\Entity]
class Resource
{
    #[ORM\Id, ORM\Column(type: 'uuid')]
    private Uuid $id;

    #[ORM\Column(length: 100)]
    private string $name;
}
```

---

## Universal Checklist

**Backend**
- [ ] Input validation on all endpoints (schema, not hand-rolled)
- [ ] Parameterized queries / ORM — never string-concatenate user input into SQL
- [ ] Transactions for multi-step writes
- [ ] Correct HTTP status codes (200 / 201 / 204 / 400 / 401 / 403 / 404 / 409 / 422 / 429 / 500)
- [ ] Idempotency for PUT/DELETE; `Idempotency-Key` header for retryable POSTs
- [ ] Rate limit for auth, password reset, OTP
- [ ] Typed error responses (`{ code, message, details? }`) — never raw stack traces
- [ ] Structured logging with request id / user id context
- [ ] No hardcoded secrets — env vars only

**Security**
- [ ] All user input validated before use
- [ ] Parameterized DB access
- [ ] Escape / sanitize rendered output
- [ ] Auth middleware on protected routes
- [ ] Authorization checks (policy / voter / gate) before mutating shared resources
- [ ] CSRF token on state-changing form submissions (cookie-auth sessions)
- [ ] Cookies: `Secure; HttpOnly; SameSite=Lax|Strict`
- [ ] Regenerate session id after login, invalidate on logout

**Performance**
- [ ] No N+1 — use joins / eager loading / dataloader
- [ ] Indexes on WHERE / JOIN / ORDER BY columns
- [ ] Pagination (cursor preferred over offset for large sets)
- [ ] Batch writes for bulk operations
- [ ] Cache where appropriate (Redis / HTTP / edge)

---

## Verification Commands by Stack

| Stack | Type check | Lint | Test | Build |
|-------|-----------|------|------|-------|
| TS | `pnpm typecheck` | `pnpm lint` | `pnpm test` | `pnpm build` |
| Python | `mypy .` or `pyright` | `ruff check .` | `pytest` | — |
| Go | `go vet ./...` | `golangci-lint run` | `go test ./...` | `go build ./...` |
| Rust | `cargo check` | `cargo clippy` | `cargo test` | `cargo build --release` |
| PHP | `vendor/bin/phpstan analyse` | `vendor/bin/pint` | `vendor/bin/pest` | — |
