## 1. Landing relocation

- [x] 1.1 Create `/landing` route serving the current marketing/pricing content (move `app/(landing)/page.tsx`), keeping the landing layout/header for it
- [x] 1.2 Add a colocated test verifying `/landing` renders the marketing sections (pricing tiers present)

## 2. Client tenant store (header data)

- [x] 2.1 Add `useTenantStore` at `src/client/stores/tenant/tenant-store.ts` holding `{ name, slug }` with a setter and a reset, and export it from `src/client/stores/index.ts`
- [x] 2.2 Add a client hydrator component that sets the tenant store from a `{ name, slug }` prop and clears it on unmount
- [x] 2.3 Hydrate the tenant store from `app/(shop)/[storeSlug]/layout.tsx` using the already-resolved tenant
- [x] 2.4 Add colocated tests for `tenant-store.ts` (set/reset) and the hydrator (sets on mount, clears on unmount)

## 3. Header brand + link mode

- [x] 3.1 Update `TopMenu` brand to render `Pyme | {tenant_name}` when the tenant store has a name, else `Pyme | Shop`
- [x] 3.2 Confirm `storeBase` empty-string path produces slug-less category/pagination links in global mode; fix any hardcoded slug assumptions
- [x] 3.3 Add a colocated `TopMenu.test.tsx`: brand shows tenant name in store mode, `Pyme | Shop` in global mode and before hydration, and links are slug-relative vs slug-less per mode

## 4. Global category route

- [x] 4.1 Replace `app/category/[id]/page.tsx` redirect with a global category page calling `getPaginatedProductsWithImages({ page, category: id })` (no `tenantId`) — moved into `app/(shop)/category/[id]/` (route group) so it renders under storefront chrome; URL is unchanged
- [x] 4.2 Add colocated test: lists products across tenants for the category, no redirect, paginates

## 5. Global product-detail route

- [x] 5.1 Replace `app/product/[slug]/page.tsx` redirect with a global product-detail page using `getProductBySlug(slug)` (no tenant), rendering in place; unknown slug → 404 — moved into `app/(shop)/product/[slug]/` for storefront chrome; `AddToCart` relocated to `src/shared/components/product/` for reuse
- [x] 5.2 Add `generateMetadata` emitting a canonical `<link>` to the owning tenant's slugged URL `/<store-slug>/product/<slug>` (D6)
- [x] 5.3 Add colocated test: existing product renders at `/product/<slug>` (no redirect), missing product 404s, canonical points to owning tenant

## 6. Global root catalog

- [x] 6.1 Make `/` render the global catalog (all tenants) under storefront chrome (TopMenu/Footer), reusing `getPaginatedProductsWithImages({ page })` without `tenantId`
- [x] 6.2 Add colocated test: root lists products across tenants and paginates via `?page`

## 7. Guards, canonical, and consistency

- [x] 7.1 Add a test asserting `TopMenu` `NON_STORE_SEGMENTS` stays consistent — reworded during implementation: `BACKLIST_KEY_WORDS` (env, store-registration blocklist) and `NON_STORE_SEGMENTS` (hardcoded, actual top-level app routes) serve different purposes and don't literally overlap (e.g. `www`/`dashboard` are reserved for registration but aren't routes). The test instead asserts `NON_STORE_SEGMENTS` is a superset of every real top-level `app/` route segment, which is the invariant that actually prevents a store slug from being misread as global (or vice versa)
- [x] 7.2 Ensure slugged routes under `[storeSlug]/` are unchanged in behavior (regression check via existing/added tests) — added `[storeSlug]/layout.test.tsx` and `[storeSlug]/product/[slug]/page.test.tsx`; tenant-scoped query construction already covered by `product.repository.test.ts` / `get-tenant-by-slug.test.ts`

## 8. Verification

- [x] 8.1 Run `pnpm test:ci` and confirm every touched/new file is covered by unit tests (project test-coverage policy) — 235/239 tests pass; the 4 remaining failures (`update-product-info.test.ts`, `seed.repository.test.ts`, `tenant.repository.test.ts`, `user.repository.test.ts`) are pre-existing on this branch, unrelated to this change (verified via `git stash`), and untouched by it. Fixed 3 unrelated pre-existing Jest infra gaps needed to test the new/changed components: pnpm-aware `transformIgnorePatterns` for `next-auth`/`@auth/core`/`@panva/hkdf`, a `.[jt]sx?` transform (ts-jest preset only covered `.tsx?`), and a `next/font/google` mock. Also fixed `collectCoverageFrom` to include `app/**` and `src/client/**/*.tsx` (previously `.ts` only), which were silently excluding coverage for pages and providers.
- [x] 8.2 Run `pnpm lint` and `npx tsc --noEmit`; fix issues — lint: 0 errors (pre-existing warnings only). tsc: fixed 4 new errors in my test fixtures (`TTenantInfo` needs `address`/`phone`); cleared a stale `.next/` type-cache referencing the moved/removed routes (gitignored, regenerates); remaining ~28 errors are pre-existing, in untouched test files (verified via `git stash`)
- [x] 8.3 Run `openspec validate --change optional-store-slug-wildcard` and resolve any spec/artifact issues
