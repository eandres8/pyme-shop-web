## 1. Session-tenant guard

- [x] 1.1 Add `requireSessionTenant()` server helper (e.g. `src/server/actions/auth/require-session-tenant.ts`) that calls `auth()`, reads `session.user.tenant`, and throws a server error when it is falsy; returns a non-empty `tenantId: string`
- [x] 1.2 Add unit tests: returns tenant when present; throws when session is missing, user is missing, or `tenant` is empty/undefined

## 2. Order tenant stamping

- [x] 2.1 Extend `trxNewOrder` (`src/server/repositories/order.repository.ts`) to persist `tenant_id` on `order.create`, accepting the tenant on its payload type (`TNewOrder`)
- [x] 2.2 In `placeOrder` (`src/server/actions/order/place-order.ts`), derive the tenant from the ordered products (already loaded via `_mapProducts`/`listProductsByIds`), validate all items share one tenant, and reject cross-tenant carts with a clear error
- [x] 2.3 Update `place-order.test.ts`: order is created with the products' `tenant_id`; a cart mixing two tenants is rejected

## 3. Admin orders listing scoped to session tenant

- [x] 3.1 In `getPaginatedOrders` (`src/server/actions/order/get-paginated-orders.ts`), replace the unscoped `listOrders()` call with `listOrders(requireSessionTenant())`
- [x] 3.2 Update tests: admin sees only own-tenant orders; missing session tenant raises a server error

## 4. Admin products listing scoped to session tenant

- [x] 4.1 In `app/(shop)/admin/products/page.tsx`, resolve the tenant via `requireSessionTenant()` and pass `tenantId` into `getPaginatedProductsWithImages({ ..., showAll: true, tenantId })`
- [x] 4.2 Confirm `listProducts`/`countProducts` apply the `tenant_id` filter for the admin path (no repo change expected); add/adjust `product.repository.test.ts` coverage for the tenant-filtered admin query including inactive products
- [x] 4.3 Verify pagination totals reflect only the session tenant's products

## 5. Admin product detail scoped to session tenant

- [x] 5.1 In `app/(shop)/admin/product/[slug]/page.tsx`, resolve the tenant via `requireSessionTenant()` and call `getProductBySlug(slug, tenantId)`
- [x] 5.2 Ensure a foreign-tenant slug resolves to the not-found/redirect path (not a blank editable form); add/adjust tests for own-tenant resolves vs foreign-tenant does not

## 6. Admin product create/update constrained to session tenant

- [x] 6.1 In `updateProductInfo` (`src/server/actions/products/update-product-info.ts`), replace `session?.user?.tenant` with `requireSessionTenant()` so create stamps `tenant_id` fail-closed
- [x] 6.2 Add a cross-tenant write guard on the update branch (scope the update `where` to `{ id, tenant_id }` or pre-check ownership) so a product owned by another tenant cannot be mutated
- [x] 6.3 Update `update-product-info.test.ts`: create stamps session tenant; own-tenant update succeeds; foreign-tenant update is rejected and leaves the product unchanged

## 7. Fail-closed error surface

- [x] 7.1 Ensure an admin error boundary (`app/(shop)/admin/error.tsx` or nearer) renders the server error thrown by `requireSessionTenant()`; add one if missing (none existed; added `app/(shop)/admin/error.tsx` + component test)
- [ ] 7.2 Manually verify `/admin/products` and `/admin/orders` render the error page (not an empty/unfiltered view) when the session has no tenant — NOT DONE: requires a seeded admin user with no tenant in a running environment; left for manual QA

## 8. Verification

- [x] 8.1 Run `pnpm test` and `pnpm lint`; ensure all new/updated tests pass and coverage covers each modified action/repository per the repo tests-coverage policy (265 tests, 261 pass — 4 pre-existing failures in unrelated repos (seed/user/tenant) confirmed present on unmodified `main`, not caused by this change; lint: 0 errors)
- [ ] 8.2 (Ops) Backfill `tenant_id` for existing products/orders, or confirm existing data is disposable; document that unmigrated `tenant_id = null` rows are intentionally hidden from admins — NOT DONE: ops/data decision, out of code-implementation scope
