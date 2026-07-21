# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Additional notes for Claude Code

### Repository pattern in practice
Repositories are factory functions (not classes) that close over a `PrismaClient` and return an interface implementation, e.g. `src/server/repositories/category.repository.ts`:
```ts
export function CategoryRepository(client: PrismaClient): ICategoryRepository {
  const logger = Logger('CategoryRepository');
  const listCategories = async (tenantId?: string) => {
    const [data, error] = await to(client.category.findMany({ where: tenantId ? { tenant_id: tenantId } : undefined }));
    if (error) return Result.failure(new Error(error.message));
    return Result.success(data.map((c) => Category.fromJson(c)));
  };
  return { listCategories, /* ... */ };
}
```
- `to()` (`src/core/utils/to.ts`) wraps a promise into a `[data, error]` tuple — always check `error` before using `data`.
- Interfaces for each repository live in `src/server/interfaces/*.interface.ts`.
- Entities expose `fromJson()` (raw/API shape) vs `fromEntity()` (Prisma row shape) — pick the one matching the input's origin.

### Testing
- Tests are colocated `*.test.ts` files (not under `tests/`, that dir only holds jest setup + mocks).
- Prisma is never hit directly in tests: `tests/mocks/prisma-client-stub.ts` is mapped over both `@/prisma/generated/prisma/client` and `@/src/config/database/prisma-client` in `jest.config.ts`. Use `tests/mocks/repositories/*.mock.ts` for repository-level mocks.
- Coverage output goes to `reports/coverage`, junit XML to `reports/junit` — both gitignored, safe to regenerate.

### `docs/` vs actual code — don't trust `docs/architecture.md` paths literally
`docs/architecture.md` and `docs/conventions.md` are SDD planning docs (aspirational spec templates for the `.opencode` multi-agent harness), not a description of current code. Notably it references `src/data/core/result.ts` / `src/data/core/to.ts` — the real files are `src/core/utils/result.ts` and `src/core/utils/to.ts`. When in doubt, trust the actual source tree over `docs/`.

### SDD/spec directories
- `specs/feature-list.yml` tracks feature state; `specs/features/<name>/` holds the 3 spec files for `sdd: true` features (gitignored, per AGENTS.md).
- `CHECKPOINTS.md` (C1–C6) is what the `reviewer` agent checks before marking a feature `DONE` — read it before closing out SDD work.
