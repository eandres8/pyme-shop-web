## Why

Each store (tenant) needs its own public storefront URL, but the current public catalog shows products from **all** tenants mixed together and the storefront applies no tenant filtering at all. The original plan segmented stores via subdomain wildcards (`slug.domain`), which is not viable on Vercel's free tier. Moving the store segment into the URL path (`pymeshop-web.vercel.com/<store-slug>/*`) delivers per-store storefronts without paid infrastructure.

## What Changes

- Introduce a `[storeSlug]` URL segment that scopes the **public storefront** (home catalog, categories, product detail) to a single tenant resolved from the slug.
- Activate tenant filtering in the public product-listing and product-detail flows (currently `getPaginatedProductsWithImages` / `getProductBySlug` ignore tenant). The slug in the URL resolves to a tenant via `tenantRepository.findBySlug` and constrains all storefront queries.
- Render the store home / category / product pages under `[storeSlug]` using **ISR** with `generateStaticParams` (known slugs pre-rendered, new stores generated on-demand and revalidated).
- Return **404** when the slug does not resolve to an existing tenant.
- Make the **root `/` a landing / marketing page** instead of the mixed global catalog.
- **BREAKING**: Legacy storefront URLs (`/product/<slug>`, `/category/<id>`, and `/` as global catalog) change shape. Add **redirects** from the legacy paths to their slug-scoped equivalents, resolving the owning tenant from the resource's `tenant_id`.
- Make storefront internal links (top menu, sidebar, pagination) relative to the current store slug.
- Reuse the existing `BACKLIST_KEY_WORDS` reserved-word list to prevent registering a store whose slug collides with a top-level route (`admin`, `auth`, `api`, `cart`, `checkout`, …).
- Session-scoped areas (`admin`, `profile`, `orders`, `checkout`) and global areas (`auth`, `api`) stay at the root and keep resolving tenant from the session — **not** from the URL slug.

Out of scope: cart behavior across stores (multi-tenant cart / mixed-tenant checkout) is untouched in this change.

## Capabilities

### New Capabilities
- `storefront-tenant-routing`: Path-based `[storeSlug]` routing that resolves a slug to a tenant, scopes the public storefront (home, category, product) to that tenant, 404s on unknown slugs, and reserves slugs that collide with top-level routes.
- `storefront-legacy-redirects`: Redirects from legacy storefront URLs (`/`, `/product/<slug>`, `/category/<id>`) to their slug-scoped equivalents, resolving the owning tenant from the resource.

### Modified Capabilities
<!-- No existing specs in openspec/specs/; nothing to modify. -->

## Impact

- **Routing / `app/`**: move `page.tsx`, `category/`, `product/` from `app/(shop)/` into `app/(shop)/[storeSlug]/`; add a `[storeSlug]` layout that resolves the tenant; repurpose `/` as the landing page.
- **Server actions**: `getPaginatedProductsWithImages`, `getProductBySlug` (and stock-by-slug) gain a tenant/slug parameter; the underlying `product.repository` already accepts `tenantId`.
- **Tenant resolution**: use `tenantRepository.findBySlug`; retire or repoint the commented-out `mapTenant(host)` subdomain logic in `get-tenant-by-user-id.ts`.
- **UI components**: `TopMenu`, `Sidebar`, `Pagination` internal links become slug-relative for storefront routes.
- **Config**: `BACKLIST_KEY_WORDS` semantics extended from subdomain guard to path-segment guard.
- **Rendering / caching**: storefront pages move from a single globally-cached page to per-store ISR.
- No database schema change (`tenant_id` and `Tenant.slug` already exist).
