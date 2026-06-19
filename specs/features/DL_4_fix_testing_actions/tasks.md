# DL_4_fix_testing_actions — Tasks

## Rule

**No action source files are modified.** Only test files (`.test.ts`) are changed.

## Test rewrite phase — 17 test files

### Auth
- [ ] **T01** Rewrite `src/server/actions/auth/register.test.ts` — mock `../../providers` (`userRepository`), call `registerUser` directly. (R5, R6)

### User actions
- [ ] **T02** Rewrite `src/server/actions/users/change-user-role.test.ts` — mock `../../providers` (`userRepository`) + `@/src/auth.config`, call `changeUserRole`. (R9)
- [ ] **T03** Rewrite `src/server/actions/users/get-user-filtered.test.ts` — mock `../../providers` (`userRepository`) + `@/src/auth.config`, call `getUserFiltered`. (R8)

### Order actions
- [ ] **T04** Rewrite `src/server/actions/order/get-order-by-id.test.ts` — mock `../../providers` (`orderRepository`) + `@/src/auth.config`, call `getOrderById`. (R14)
- [ ] **T05** Rewrite `src/server/actions/order/get-order-list-by-user.test.ts` — mock `../../providers` (`orderRepository`) + `@/src/auth.config`, call `getOrderListByUser`. (R8)
- [ ] **T06** Rewrite `src/server/actions/order/get-paginated-orders.test.ts` — mock `../../providers` (`orderRepository`) + `@/src/auth.config`, call `getPaginatedOrders`. (R8)
- [ ] **T07** Rewrite `src/server/actions/order/place-order.test.ts` — mock `../../providers` (`productRepository`, `orderRepository`) + `@/src/auth.config`, call `placeOrder`. (R7, R10)

### Product actions
- [ ] **T08** Rewrite `src/server/actions/products/update-product-info.test.ts` — mock `../../providers` (`productRepository`) + `next/cache`, call `updateProductInfo`. (R8)
- [ ] **T09** Rewrite `src/server/actions/products/products-pagination.test.ts` — mock `../../providers` (`productRepository`), call `getPaginatedProductsWithImages`. (R11)
- [ ] **T10** Rewrite `src/server/actions/products/get-product-by-slug.test.ts` — mock `../../providers` (`productRepository`), call `getProductBySlug`. (R8)
- [ ] **T11** Rewrite `src/server/actions/products/get-category-list.test.ts` — mock `../../providers` (`categoryRepository`), call `getCategoryList`. (R8)
- [ ] **T12** Rewrite `src/server/actions/products/delete-product-image.test.ts` — mock `../../providers` (`productImageRepository`, `uploadFilesRepository`) + `next/cache`, call `deleteProductImage`. (R12)
- [ ] **T13** Rewrite `src/server/actions/products/get-product-stock-by-slug.test.ts` — mock `../../providers` (`productRepository`), call `getProductStockBySlug`. (R8)

### Country
- [ ] **T14** Rewrite `src/server/actions/country/get-countries.test.ts` — mock `../../providers` (`countryRepository`), call `getCountries`. (R8)

### Address actions
- [ ] **T15** Rewrite `src/server/actions/address/set-user-address.test.ts` — mock `../../providers` (`userAddressRepository`), call `setUserAddress(address, userId)`. (R13)
- [ ] **T16** Rewrite `src/server/actions/address/get-user-address.test.ts` — mock `../../providers` (`userAddressRepository`), call `getUserAddress(userId)`. (R8)
- [ ] **T17** Rewrite `src/server/actions/address/delete-user-address.test.ts` — mock `../../providers` (`userAddressRepository`), call `deleteUserAddress(userId)`. (R8)

## Verification phase

- [ ] **T18** Run `pnpm dlx jest --passWithNoTests src/server/actions/` — all 19 action test suites pass. (R15)
- [ ] **T19** Run `pnpm dlx jest --passWithNoTests` — all 30 test suites pass. (R15)
- [ ] **T20** Run `pnpm lint` — no new errors or warnings. (R16)
- [ ] **T21** Run `pnpm build` — build succeeds with no errors.
