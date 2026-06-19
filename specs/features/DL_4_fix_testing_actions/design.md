# DL_4_fix_testing_actions — Design

## Problem

All action test files import factory functions (`xxxAction`) that accept mock repositories as parameters, but the actual action files export the final action directly (`registerUser`, `placeOrder`, etc.) using repository instances from `src/server/providers/`. This mismatch causes 17 test suites to fail.

## Decision: Keep action files unchanged, fix tests

**No production action files are modified.** The public API (`registerUser`, `placeOrder`, etc.) stays exactly as it is.

Tests are rewritten to use `jest.mock()` to mock the `../../providers` module that actions import repositories from. This is the standard Jest approach already used by `login.test.ts` and `logout.test.ts`.

## How it works

Each action file imports repositories from `../../providers` (which resolves to `src/server/providers/index.ts` → `repository-injection.ts`):

```typescript
import { userRepository } from "../../providers";
```

In tests, we mock that module path so the action receives mock implementations:

```typescript
jest.mock("../../providers", () => ({
  userRepository: {
    create: jest.fn(),
    findByEmail: jest.fn(),
  },
}));

import { registerUser } from "./register";

it("works", async () => {
  const mockRepo = require("../../providers").userRepository;
  (mockRepo.create as jest.Mock).mockResolvedValue(Result.success(user));
  const result = await registerUser(data);
  // ...
});
```

### Pattern for each action type

**Simple action (1 repo, no auth):**
```typescript
jest.mock("../../providers", () => ({
  userAddressRepository: {
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));
```

**Action with auth:**
```typescript
jest.mock("@/src/auth.config", () => ({ auth: jest.fn() }));
jest.mock("../../providers", () => ({
  userRepository: {
    changeRole: jest.fn(),
  },
}));
```

**Action with multiple repos:**
```typescript
jest.mock("../../providers", () => ({
  productRepository: {
    listProductsByIds: jest.fn(),
  },
  orderRepository: {
    trxNewOrder: jest.fn(),
  },
}));
```

## Files to modify (17 test files only)

| # | File | Imports factory? | What changes |
|---|------|-----------------|-------------|
| 1 | `src/server/actions/auth/register.test.ts` | `registerUserAction` | Rewrite: mock providers, call `registerUser` directly |
| 2 | `src/server/actions/users/change-user-role.test.ts` | `changeUserRoleAction` | Rewrite: mock providers + auth, call `changeUserRole` |
| 3 | `src/server/actions/users/get-user-filtered.test.ts` | `getUserFilteredAction` | Rewrite: mock providers + auth, call `getUserFiltered` |
| 4 | `src/server/actions/order/get-order-by-id.test.ts` | `getOrderByIdAction` | Rewrite: mock providers + auth, call `getOrderById` |
| 5 | `src/server/actions/order/get-order-list-by-user.test.ts` | `getOrderListByUserAction` | Rewrite: mock providers + auth, call `getOrderListByUser` |
| 6 | `src/server/actions/order/get-paginated-orders.test.ts` | `getPaginatedOrdersAction` | Rewrite: mock providers + auth, call `getPaginatedOrders` |
| 7 | `src/server/actions/order/place-order.test.ts` | `placeOrderAction` | Rewrite: mock providers + auth, call `placeOrder` |
| 8 | `src/server/actions/products/update-product-info.test.ts` | `updateProductInfoAction` | Rewrite: mock providers + next/cache, call `updateProductInfo` |
| 9 | `src/server/actions/products/products-pagination.test.ts` | `getPaginatedProductsWithImagesAction` | Rewrite: mock providers, call `getPaginatedProductsWithImages` |
| 10 | `src/server/actions/products/get-product-by-slug.test.ts` | `getProductBySlugAction` | Rewrite: mock providers, call `getProductBySlug` |
| 11 | `src/server/actions/products/get-category-list.test.ts` | `getCategoryListAction` | Rewrite: mock providers, call `getCategoryList` |
| 12 | `src/server/actions/products/delete-product-image.test.ts` | `deleteProductImageAction` | Rewrite: mock providers + next/cache, call `deleteProductImage` |
| 13 | `src/server/actions/products/get-product-stock-by-slug.test.ts` | `getProductStockBySlugAction` | Rewrite: mock providers, call `getProductStockBySlug` |
| 14 | `src/server/actions/country/get-countries.test.ts` | `getCountriesAction` | Rewrite: mock providers, call `getCountries` |
| 15 | `src/server/actions/address/set-user-address.test.ts` | `setUserAddress` (no Action suffix) | Rewrite: mock providers, call `setUserAddress(address, userId)` correctly |
| 16 | `src/server/actions/address/get-user-address.test.ts` | `getUserAddress` (no Action suffix) | Rewrite: mock providers, call `getUserAddress(userId)` correctly |
| 17 | `src/server/actions/address/delete-user-address.test.ts` | `deleteUserAddress` (no Action suffix) | Rewrite: mock providers, call `deleteUserAddress(userId)` correctly |

## Files NOT modified

| File | Reason |
|------|--------|
| All action source files (`*.ts` not `*.test.ts`) | Keep exact same exports |
| `src/server/actions/auth/login.test.ts` | Already works with `jest.mock` |
| `src/server/actions/auth/logout.test.ts` | Already works with `jest.mock` |
| `tests/mocks/repositories/*` | Already correct interfaces |
| `src/server/providers/*` | No changes needed |

## Detailed test examples

### Before (broken — register.test.ts):
```typescript
import { registerUserAction } from "./register";
import { MockUserRepository } from "@/tests/mocks/repositories";

it("works", async () => {
  const mockRepo = MockUserRepository({ create: async () => Result.success(user) });
  const action = registerUserAction(mockRepo);
  const result = await action(validUser);
});
```

### After (working — register.test.ts):
```typescript
jest.mock("../../providers", () => ({
  userRepository: {
    create: jest.fn(),
    findByEmail: jest.fn(),
  },
}));

import { registerUser } from "./register";
import { Result } from "@/src/core/utils";

const mockProviders = jest.requireMock("../../providers");

it("returns success when repository succeeds", async () => {
  const user = User.fromJson({ ...validUser, id: "uuid" }).cipherPass();
  mockProviders.userRepository.create.mockResolvedValue(Result.success(user));

  const result = await registerUser(validUser);

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.email).toBe("test@test.com");
  }
});

it("returns failure when repository returns an error", async () => {
  mockProviders.userRepository.create.mockResolvedValue(
    Result.failure(new Error("DB error"))
  );

  const result = await registerUser(validUser);

  expect(result).toEqual({
    success: false,
    message: "No se pudo crear el usuario",
  });
});
```

## Verification

| Command | Expected |
|---------|----------|
| `pnpm dlx jest --passWithNoTests src/server/actions/` | 19 suites pass |
| `pnpm dlx jest --passWithNoTests` | 30 suites pass |
| `pnpm lint` | 0 errors |
| `pnpm build` | Build succeeds |

## Mock repository factory reuse

The existing mock factories in `tests/mocks/repositories/` are NOT directly used by the rewritten tests (since we mock at the provider level, not inject). However, they serve as documentation of the expected interface and can be referenced for correct mock setup. They remain in the codebase for repository tests and as reference.
