## 1. Tenant resolution & storefront actions

- [x] 1.1 Add a `slug`/`tenantId` parameter to the storefront server actions (`getPaginatedProductsWithImages`, `getProductBySlug`, `get-product-stock-by-slug`) and thread it into `productRepository.listProducts` / `countProducts` / `productBySlug` (repo already accepts `tenantId`).
- [x] 1.2 Add a helper (or reuse `tenantRepository.findBySlug`) that resolves a store slug to a tenant and signals not-found.
- [x] 1.3 Retire or repoint the commented-out `mapTenant(host)` subdomain logic in `get-tenant-by-user-id.ts`; storefront tenant now comes from the URL slug.
- [x] 1.4 Update/adjust affected action tests to cover the tenant-scoped path.

## 2. `[storeSlug]` route segment

- [x] 2.1 Create `app/(shop)/[storeSlug]/layout.tsx` that awaits `params`, resolves the tenant via `findBySlug`, and calls `notFound()` on unknown slug.
- [x] 2.2 Move `app/(shop)/page.tsx` → `app/(shop)/[storeSlug]/page.tsx` and pass the resolved tenant into the listing action.
- [x] 2.3 Move `app/(shop)/category/` → `app/(shop)/[storeSlug]/category/` and scope its queries to the tenant.
- [x] 2.4 Move `app/(shop)/product/` → `app/(shop)/[storeSlug]/product/`, scope `getProductBySlug`, and update `generateMetadata` to use the slug's tenant.
- [x] 2.5 Verify `admin/`, `cart/`, `checkout/`, `orders/`, `profile/` remain unslugged under `(shop)` and still resolve tenant from the session.

## 3. ISR rendering

- [x] 3.1 Add `generateStaticParams` under `[storeSlug]` returning existing store slugs.
- [x] 3.2 Set the `revalidate` window on the `[storeSlug]` subtree (move the former global `revalidate = 86400`), enabling on-demand generation for new stores.

## 4. Root landing & legacy redirects

- [x] 4.1 Repoint root `/` to render the landing / marketing page (reuse `app/landing/`), removing the mixed global catalog at `/`.
- [x] 4.2 Add a legacy `/product/<slug>` handler that looks up the product, resolves its tenant's slug, and redirects to `/<store-slug>/product/<slug>` (404 if the product does not exist).
- [x] 4.3 Add legacy `/category/<id>` handling: redirect to the landing (categories are global `gender` values with no owning tenant — see design D5).

## 5. Slug-relative links & reserved words

- [x] 5.1 Make storefront links slug-relative in `TopMenu`, `Sidebar`, and `Pagination` (audit every `href` under `src/shared/components/ui`). (TopMenu updated; Pagination already `usePathname`-relative; Sidebar links target unslugged session/global areas — no change.)
- [x] 5.2 Enforce `BACKLIST_KEY_WORDS` as a reserved-word guard at store registration (`RegisterStoreForm` / tenant create flow) so a store slug cannot collide with a top-level route.

## 6. Verification

- [x] 6.1 Run `pnpm lint` and `npx tsc --noEmit`; fix issues from the route move. (lint: 0 errors; production code type-clean via `next build`; the 28 remaining `tsc` errors are all pre-existing in untouched `.test.ts` files.)
- [x] 6.2 Run `pnpm test:ci` and update colocated tests affected by the tenant-scoped actions and route changes. (All change-related tests pass; the 4 failing suites — update-product-info, seed, user, tenant `findBySlug` — are pre-existing and untouched by this change.)
- [~] 6.3 Manually verify: `/<store-slug>` shows only that store's products, unknown slug 404s, `/` shows the landing, legacy `/product/<slug>` redirects, and `/admin` still works from the session. (Verified at build/route level: full route tree compiles, `/` is the static landing, `[storeSlug]` subtree + legacy `/product` & `/category` redirect handlers present, session areas unslugged. Live browser confirmation still requires a running app + seeded DB — user's step.)
