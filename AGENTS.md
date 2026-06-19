<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PymeShop Web

## Commands
| Command | What it does |
|---------|-------------|
| `pnpm start:dev` | `next dev` |
| `pnpm build` | `next build` |
| `pnpm lint` | `eslint` (no typecheck script) |
| `pnpm run:seed` | Seeds DB via Prisma |

No typecheck, test, or formatter scripts exist.

## Dev setup (always this order)
1. `docker compose -f docker-compose.dev.yml up --build` (starts Postgres 16)
2. `pnpm dlx prisma migrate dev` (run migrations)
3. `pnpm start:dev`

## Prisma 7 quirks
- Uses `@prisma/adapter-pg` — client import from `@/prisma/generated/prisma/client`, **not** `@prisma/client`
- Config via `prisma.config.ts` with Prisma 7's `defineConfig` API
- Repositories receive `PrismaClient` via constructor injection (see `src/config/database/prisma-client.ts`)
- **After any schema change:** `pnpm dlx prisma generate` then `pnpm dlx prisma migrate dev --name <name>`
- Generated client at `prisma/generated/prisma` (gitignored)
- pnpm-workspace must allow `@prisma/engines` and `prisma` as `onlyBuiltDependencies`

## Architecture
- **`src/core/`** — entities, types, utils (framework-agnostic)
- **`src/server/`** — actions (`'use server'`), repositories (Prisma queries), providers (DI wiring)
- **`src/client/`** — Zustand stores, AuthProvider, data fetchers
- **`src/shared/`** — UI components
- **`src/config/`** — envs (Zod-validated), Prisma client, fonts
- Repositories return `Result<T>` (success/failure wrapper from `src/core/utils/result.ts`)
- Server actions call repositories, instantiated via `src/server/providers/repository-injection.ts`

## Key conventions
- Path alias `@/*` → project root (e.g. `@/src/core/entities`, `@/prisma/generated/prisma/client`)
- `searchParams` is `Promise<{...}>` — must be awaited
- Auth: next-auth 5 beta with Credentials provider, JWT callbacks in `src/auth.config.ts`, `AuthProvider` wrapping root layout
- Entities have static factories (`Product.fromJson()`, `Product.fromEntity()`)
- DB tables use `@@map` to snake_case (`categories`, `products`, `product_images`, `users`, `cities`, etc.)
- Images hosted on Cloudinary (configured in `next.config.ts`)
- Tailwind CSS v4 with `@tailwindcss/postcss` (no `tailwind.config` file)
- No CI/CD, no test suite, no pre-commit hooks in this repo

## SDD workflow (Spec-Driven Development)

```
PENDING → [spec_author] → SPEC_READY → ⏸ HUMAN → IN_PROGRESS → [implementer → reviewer] → DONE
```

- Only one feature `IN_PROGRESS` at a time (`feature-list.yml`)
- `sdd: true` features require approved spec (3 files) before coding
- `specs/` directory is **gitignored** — specs NOT committed
- States: `PENDING | SPEC_READY | IN_PROGRESS | DONE | BLOCKED`
- Reviewer checks C1–C6 checkpoints (`CHECKPOINTS.md`) before closing

## Multi-agent harness

- `.opencode/agents/leader.md` — orchestrator, never writes code
- `.opencode/agents/spec_autor.md` — writes requirements/design/tasks
- `.opencode/agents/implementer.md` — writes code + tests per approved spec
- `.opencode/agents/reviewer.md` — approves/rejects via CHECKPOINTS.md
- Skill loaded: `next-best-practices` (from `.agents/skills/`)

## Important

Durante la ejecución SIEMPRE debes indicar los agentes y skills que han sido utilizados y cuales se usaran en la implementación de cada tarea o plan.