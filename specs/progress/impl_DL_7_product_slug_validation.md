# DL_7_product_slug_validation — Implementation Traceability

## Feature: Create slug dynamic validation

## R → Test Mapping

| Requirement | Test File | Test Description |
|-------------|-----------|------------------|
| R1 | `src/server/repositories/product.repository.test.ts` | `productBySlug with tenantId > filters by tenantId when provided` |
| R1 | `src/server/repositories/product.repository.test.ts` | `productBySlug with tenantId > works without tenantId for backward compatibility` |
| R2 | `src/server/repositories/product.repository.test.ts` | `productExistsBySlug > returns true when slug exists for tenant` |
| R2 | `src/server/repositories/product.repository.test.ts` | `productExistsBySlug > returns false when slug does not exist for tenant` |
| R2 | `tests/mocks/repositories/product.repository.mock.ts` | Mock includes `productExistsBySlug` method |
| R3 | `src/server/actions/products/validate-product-slug.ts` | Server action created and exported from barrel |
| R3 | `src/server/actions/index.ts` | Export added |
| R4 | Manual verification | Auto-slug generation in ProductForm.tsx useEffect |
| R5 | `app/(shop)/admin/product/[slug]/ui/product-form/product-form-slug.reducer.test.ts` | `CHECKING transitions to checking status` |
| R6 | `app/(shop)/admin/product/[slug]/ui/product-form/product-form-slug.reducer.test.ts` | `TAKEN transitions to taken status with error message` |
| R7 | Manual verification | Auto-slug from title for new products |
| R8 | `app/(shop)/admin/product/[slug]/ui/product-form/product-form-slug.reducer.test.ts` | `CHECKING transitions to checking status` |
| R9 | `src/server/actions/products/validate-product-slug.test.ts` | `returns available: true when slug does not exist` |
| R10 | `src/server/actions/products/validate-product-slug.test.ts` | `returns available: false when slug already exists` |
| R10.3 | Manual verification | Submit button not blocked by async validation |
| R11 | Manual verification | Original slug comparison in ProductForm.tsx |
| R12 | `src/server/actions/products/validate-product-slug.test.ts` | `returns error when session has no tenant` |
| R13 | `src/server/actions/products/validate-product-slug.test.ts` | `returns error when slug is too short` |
| R13 | `src/server/actions/products/validate-product-slug.test.ts` | `returns error when slug exceeds 255 characters` |
| R14 | `src/server/actions/products/validate-product-slug.test.ts` | `returns available: true when slug does not exist` |
| R14 | `src/server/actions/products/validate-product-slug.test.ts` | `returns available: false when slug already exists` |
| R15 | `src/server/repositories/product.repository.test.ts` | `productExistsBySlug > returns true when slug exists for tenant` |
| R15 | `src/server/repositories/product.repository.test.ts` | `productExistsBySlug > returns false when slug does not exist for tenant` |
| R15 | `src/server/repositories/product.repository.test.ts` | `productExistsBySlug > returns Result.failure when prisma throws` |
| R16 | Manual verification | "Verificando…" indicator in ProductForm.tsx |
| R17 | `src/server/repositories/product.repository.test.ts` | `productBySlug with tenantId > filters by tenantId when provided` |
| R18 | `src/server/actions/products/validate-product-slug.test.ts` | `returns error when session has no tenant` |
| R19 | `src/server/actions/products/validate-product-slug.test.ts` | `returns error when slug is too short` |
| R19 | `src/server/actions/products/validate-product-slug.test.ts` | `returns error when slug exceeds 255 characters` |
| R20 | `src/server/actions/products/validate-product-slug.test.ts` | `returns error when repository fails` |
| R21 | Manual verification | Edit mode slug conflict detection |
| R22 | Manual verification | Debounce + async validation flow |
| R23 | Manual verification | Error de conexión handling in try/catch |

## Files Created
1. `src/server/actions/products/validate-product-slug.ts` — Server action
2. `src/server/actions/products/validate-product-slug.test.ts` — Server action tests (6 tests)
3. `app/(shop)/admin/product/[slug]/ui/product-form/product-form-slug.reducer.ts` — Slug validation reducer
4. `app/(shop)/admin/product/[slug]/ui/product-form/product-form-slug.reducer.test.ts` — Reducer tests (7 tests)

## Files Modified
1. `src/server/interfaces/product.interface.ts` — Added `productExistsBySlug`, modified `productBySlug` signature
2. `src/server/repositories/product.repository.ts` — Added `productExistsBySlug` method, modified `productBySlug` with optional `tenantId`
3. `src/server/actions/index.ts` — Added barrel export
4. `app/(shop)/admin/product/[slug]/ui/product-form/ProductForm.tsx` — Added auto-slug, async validation, slug state UI
5. `tests/mocks/repositories/product.repository.mock.ts` — Added `productExistsBySlug` mock
6. `src/server/repositories/product.repository.test.ts` — Added 5 new tests

## Verification Results

| Check | Result |
|-------|--------|
| `pnpm dlx jest --passWithNoTests` | ✅ 13 new tests pass; 5 pre-existing failures (unrelated to this feature) |
| `pnpm lint` | ✅ 0 errors, 15 warnings (all pre-existing) |
| New tests: validate-product-slug.test.ts | ✅ 6/6 pass |
| New tests: product-form-slug.reducer.test.ts | ✅ 7/7 pass |
| New tests: product.repository.test.ts (new) | ✅ 5/5 pass |
