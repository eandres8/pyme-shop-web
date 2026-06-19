# DL_2_testing_actions — Design

## Files to create/modify

### New files — Mock repositories (`/tests/mocks/repositories/`)

| File | Purpose |
|------|---------|
| `tests/mocks/repositories/index.ts` | Barrel export for all mock repositories |
| `tests/mocks/repositories/user.repository.mock.ts` | Mock implementation of `IUserRepository` |
| `tests/mocks/repositories/order.repository.mock.ts` | Mock implementation of `IOrderRepository` |
| `tests/mocks/repositories/user-address.repository.mock.ts` | Mock implementation of `IUserAddressRepository` |
| `tests/mocks/repositories/product.repository.mock.ts` | Mock implementation of `IProductRepository` |
| `tests/mocks/repositories/category.repository.mock.ts` | Mock implementation of `ICategoryRepository` |
| `tests/mocks/repositories/country.repository.mock.ts` | Mock implementation of `ICountryRepository` |
| `tests/mocks/repositories/product-image.repository.mock.ts` | Mock implementation of `IProductImageRepository` |
| `tests/mocks/repositories/upload-files.repository.mock.ts` | Mock implementation of `IUploadFilesRepository` |

### New files — Tests (`src/server/actions/**/*.test.ts`)

| File | Action tested |
|------|--------------|
| `src/server/actions/auth/register.test.ts` | `registerUserAction` (R5, R6) |
| `src/server/actions/auth/login.test.ts` | `authenticate`, `login` (R22, R23) |
| `src/server/actions/users/change-user-role.test.ts` | `changeUserRoleAction` (R7, R8) |
| `src/server/actions/order/get-order-by-id.test.ts` | `getOrderByIdAction` (R9, R10, R11) |
| `src/server/actions/order/get-paginated-orders.test.ts` | `getPaginatedOrdersAction` (R15, R16) |
| `src/server/actions/order/get-order-list-by-user.test.ts` | `getOrderListByUserAction` (R17, R18) |
| `src/server/actions/order/place-order.test.ts` | `placeOrderAction` (R19, R20, R21) |
| `src/server/actions/address/set-user-address.test.ts` | `setUserAddressAction` (R12, R13, R14) |

### Modified files — Refactoring actions for testability

| File | Change |
|------|--------|
| `src/server/actions/auth/register.ts` | Export `registerUserAction` factory |
| `src/server/actions/users/change-user-role.ts` | Export `changeUserRoleAction` factory |
| `src/server/actions/order/get-order-by-id.ts` | Export `getOrderByIdAction` factory |
| `src/server/actions/order/get-paginated-orders.ts` | Export `getPaginatedOrdersAction` factory |
| `src/server/actions/order/get-order-list-by-user.ts` | Export `getOrderListByUserAction` factory |
| `src/server/actions/order/place-order.ts` | Export `placeOrderAction` factory |
| `src/server/actions/address/set-user-address.ts` | Export `setUserAddressAction` factory |

### Not modified
- `src/server/actions/auth/login.ts` — `authenticate` is already exported; `login` uses `signIn` directly (tested via `jest.mock`). Factory pattern not needed.
- `src/server/actions/products/*` — Skipped in this batch to limit scope. The pattern is identical; tests follow same approach once validated.
- `src/server/actions/address/delete-user-address.ts` — Skipped; minimal logic.
- `src/server/actions/address/get-user-address.ts` — Skipped; minimal logic.
- `src/server/actions/country/get-countries.ts` — Skipped; minimal logic.
- `src/server/actions/users/get-user-filtered.ts` — Skipped; follows same pattern as `change-user-role`.

## Mock repository design

Each mock repository is a factory function that returns an object implementing the same interface as the real repository. It maintains an internal record of calls and configurable return values.

### Pattern (example: user.repository.mock.ts)

```typescript
import type { IUserRepository } from "@/src/server/interfaces";
import { Result, User } from "@/src/core/entities";

type MockOverrides = {
  create?: (user: User) => ReturnType<IUserRepository["create"]>;
  findByEmail?: (email: string) => ReturnType<IUserRepository["findByEmail"]>;
  // ...
};

export function MockUserRepository(overrides: MockOverrides = {}): IUserRepository {
  return {
    create: overrides.create ?? (async (user) => Result.success(user)),
    findByEmail: overrides.findByEmail ?? (async () => Result.success(User.fromJson({}))),
    // ...
  };
}
```

### Session mocking

The `auth()` function from `@/src/auth.config` is imported directly in actions. For testing, it is mocked via `jest.mock('@/src/auth.config', () => ({ auth: jest.fn(), signIn: jest.fn() }))`.

### next/cache mocking

`revalidatePath` is mocked via `jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))`.

## Action factory export pattern

Each action file currently has:
```typescript
function xxxAction(repo: IRepo) { return async (...) => {...} }
export const xxx = xxxAction(inject("repo"));
```

Change to:
```typescript
export function xxxAction(repo: IRepo) { return async (...) => {...} }
export const xxx = xxxAction(inject("repo"));
```

Tests import the factory directly and inject mock repos:
```typescript
import { xxxAction } from "./xxx";
import { MockRepo } from "@/tests/mocks/repositories";

const mockRepo = MockRepo();
const action = xxxAction(mockRepo);
const result = await action(args);
```

## Alternative considered

- **Auto-mocking with jest-mock-extended**: Rejected to keep dependencies minimal (R25). Manual mocks give full control and are more explicit in tests.
- **Refactoring auth() into the factory**: The `auth()` call is always needed inside the action and isn't suitable for injection. Using `jest.mock()` is the standard Jest approach and keeps refactoring minimal.
- **Testing ALL 19 actions**: Rejected to keep scope manageable. The 8 chosen actions cover all patterns: simple CRUD, auth-gated, complex business logic (place-order), conditional branching (set-user-address), and error handling.

## Risks

- The `placeOrderAction` internal `_mapProducts` closure is hard to test in isolation — it will be tested indirectly through the main action.
- Mocking `auth()` with `jest.mock` at module level means tests can only configure one session per file; grouped tests sharing a mock setup will be in separate `describe` blocks with per-file `jest.mock` calls.
