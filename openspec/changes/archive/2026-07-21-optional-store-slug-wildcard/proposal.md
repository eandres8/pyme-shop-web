## Why

Today the storefront requires a `[storeSlug]` segment: the root `/` serves marketing, and unslugged URLs (`/category/<id>`, `/product/<slug>`) are treated as legacy and redirect away. We want the opposite default — a URL **without** a slug should work for everyone who lands on it (a global, unfiltered catalog), while a URL **with** a slug stays as the shareable, tenant-scoped view. The data layer already behaves as a wildcard when no `tenantId` is supplied, so this is primarily a routing and presentation change. As part of this change we also make the header reflect the current store name.

## What Changes

- **BREAKING** The application root `/` SHALL serve the **global product catalog** (products across all tenants) instead of the marketing landing page. The marketing/landing content moves to a dedicated route (`/landing`).
- **BREAKING** Unslugged `/category/<id>` SHALL serve a **global category listing** (all tenants) instead of redirecting to `/`.
- **BREAKING** Unslugged `/product/<slug>` SHALL serve a **global product detail** view instead of permanently redirecting to `/<store-slug>/product/<slug>`.
- The slugged forms (`/<store-slug>`, `/<store-slug>/category/<id>`, `/<store-slug>/product/<slug>`) remain unchanged and stay tenant-scoped for sharing.
- The top menu / storefront navigation SHALL build slug-relative links when a store slug is present and slug-less (global) links when it is absent, so redirects, category filters, pagination and search all work in both modes.
- The header brand SHALL render `Pyme | {tenant_name}` when a store slug is in context and `Pyme | Shop` in global (no-slug) mode.
- Every modified or new source file SHALL ship with colocated unit tests covering the added behavior (project test-coverage policy).

## Capabilities

### New Capabilities
- `storefront-global-catalog`: Unslugged, wildcard storefront experience — root catalog, global category listing, and global product detail that query without a tenant filter and stay fully navigable (links, pagination, search).
- `storefront-store-branding`: Header brand text derives from the active store — `Pyme | {tenant_name}` inside a store, `Pyme | Shop` in global mode.

### Modified Capabilities
- `storefront-tenant-routing`: The store slug becomes **optional** rather than required. The slugged storefront still scopes queries to the owning tenant, but its coexistence with the global (unslugged) storefront is now a first-class supported behavior.
- `storefront-legacy-redirects`: Inverted. The root no longer serves the landing page, and unslugged product/category URLs no longer redirect to slug-scoped equivalents — they serve global content instead.

## Impact

- **Routes (`app/`)**: `app/(landing)/page.tsx` (moves to `/landing`), `app/category/[id]/page.tsx` and `app/product/[slug]/page.tsx` (replace redirects with real global pages), plus a new root global catalog page and its layout. Store-scoped routes under `app/(shop)/[storeSlug]/` are unaffected in behavior.
- **Components**: `src/shared/components/ui/top-menu/TopMenu.tsx` (brand text + slug-relative vs global links), and a new client tenant store (`src/client/stores/tenant/…`) hydrated by the store layout so the header can read the tenant name.
- **Server/actions/repositories**: No new filtering logic required — `productRepository.listProducts/countProducts/productBySlug` already treat a missing `tenantId` as unfiltered. Existing actions (`products-pagination`, `get-product-by-slug`, `get-tenant-by-slug`) are reused.
- **Config**: Reserved-word guard (`BACKLIST_KEY_WORDS`) still governs which first segments are NOT store slugs; the global routes must live under those reserved segments.
- **Tests**: New/updated colocated `*.test.ts` for every touched file (routes, TopMenu, tenant store, and any action whose contract is exercised for the wildcard path).
- **SEO**: The same product/category is now reachable slugged and unslugged; canonical handling is addressed in design.
