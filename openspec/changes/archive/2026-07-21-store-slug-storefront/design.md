## Context

Multi-tenancy is partially wired: `Tenant.slug` and `tenant_id` (on products/categories/orders) exist, `tenantRepository.findBySlug` exists, and `createTenantClient` scopes Prisma by `tenant_id` for session-based flows. However, the **public** storefront applies no tenant filter — `getPaginatedProductsWithImages` and `getProductBySlug` never receive a tenant, so `/` shows a mixed catalog of all tenants. The original subdomain approach (`mapTenant(host)`) is commented out in `get-tenant-by-user-id.ts` and unusable on Vercel's free tier (no wildcard subdomains).

The storefront and the private area currently share `app/(shop)/`. Because `(shop)` is a route group (no URL segment), a `[storeSlug]` folder can live inside it and share the same chrome (`TopMenu`, `Sidebar`, `Footer`) as the unslugged `admin/`, `cart/`, etc.

Constraints: Vercel free tier (path-based, ISR-friendly), no DB schema change, keep session-scoped areas working unchanged.

## Goals / Non-Goals

**Goals:**
- Serve each store's public storefront at `/<store-slug>/*`, filtered to that tenant.
- Activate tenant filtering in the public product-listing / product-detail flows.
- Root `/` becomes the landing page; legacy storefront URLs redirect to slug-scoped ones.
- Per-store ISR via `generateStaticParams`.
- Session-scoped areas (`admin`, `profile`, `orders`, `checkout`) and global areas (`auth`, `api`) unchanged.

**Non-Goals:**
- Cart behavior across stores / mixed-tenant checkout (untouched).
- Custom domains per store, subdomain routing.
- Any database schema change.
- Reworking how the admin resolves its tenant (stays session-based).

## Decisions

### D1: Path segment via `app/(shop)/[storeSlug]/` (not middleware rewrite)
Move `page.tsx`, `category/`, `product/` from `app/(shop)/` into `app/(shop)/[storeSlug]/` with a `layout.tsx` that resolves the tenant once and 404s on unknown slugs.
- **Why:** real route segment gives native SSR/metadata per store, `generateStaticParams` + ISR, and idiomatic App Router data flow.
- **Alternative — middleware rewrite** (`/slug/x → /x` + tenant header): avoids moving files but fights caching/ISR, complicates per-store metadata, and needs Edge-side slug-vs-reserved disambiguation. Rejected as more fragile.

### D2: Tenant resolved in the `[storeSlug]` layout, passed down
The layout resolves `params.storeSlug` → tenant via `findBySlug`; pages read the tenant and pass its id into the existing repository parameter (`product.repository` already accepts `tenantId`). Storefront server actions (`getPaginatedProductsWithImages`, `getProductBySlug`, stock-by-slug) gain a `slug`/`tenantId` argument.
- **Why:** single resolution point, minimal changes downstream, reuses `Result`/repository patterns.

### D3: Reserved words reuse `BACKLIST_KEY_WORDS`
The same env list that guarded subdomains now guards path segments. Static routes (`/auth`, `/admin`, `/api`, `/cart`, `/checkout`) naturally win over a dynamic `[storeSlug]` in Next resolution; the guard's job is to reject **registering** a store slug that would be permanently shadowed.
- **Why:** the collision surface already exists; the guard belongs at store creation.

### D4: Legacy redirects resolve the owning tenant from the resource
`/product/<slug>` → look up the product, read its `tenant_id` → `Tenant.slug` → redirect to `/<store-slug>/product/<slug>`; 404 if the product does not exist. Root `/` renders the landing page (no redirect needed — different content).

### D5: "Category" is really `gender` — legacy `/category/<id>` handling
Storefront category links are `/category/men|women|kid`, and the route filters products by the **`gender`** enum, which is a global taxonomy, not a tenant-owned resource. Therefore `/category/<id>` cannot resolve an owning tenant on its own. Resolution: legacy `/category/<id>` (without a store context) redirects to the **landing** (or a store-picker), while the slug-scoped `/<store-slug>/category/<id>` is the supported form. The redirect-to-owning-store rule in the spec applies to tenant-owned resources (products); categories/genders fall back to the landing.

### D6: ISR configuration
`generateStaticParams` returns existing store slugs; keep a `revalidate` window on the `[storeSlug]` subtree so new stores generate on demand. The current global `revalidate = 86400` on the old home moves onto the per-store pages.

## Risks / Trade-offs

- **Route collision / shadowed slugs** → mitigate with the `BACKLIST_KEY_WORDS` guard at store registration (D3).
- **Broken internal links after the move** (TopMenu/Sidebar/Pagination use absolute paths) → make storefront links slug-relative; audit every `href` under `src/shared/components/ui`.
- **Legacy category has no owning tenant** (D5) → fall back to landing instead of a wrong redirect.
- **SEO/link rot from URL change** → 301-style redirects from legacy product URLs preserve existing inbound links.
- **ISR staleness for new stores** → on-demand generation + revalidation window keeps latency acceptable without paid infra.
- **Metadata resolution** (`generateMetadata` in product detail) now needs the tenant context → resolve from the same slug param.

## Migration Plan

1. Introduce `[storeSlug]` layout + move storefront pages; thread tenant into storefront actions.
2. Repoint root `/` to the landing page.
3. Add legacy redirects (`/product/<slug>`, `/category/<id>`).
4. Make storefront links slug-relative; add the reserved-word guard at registration.
5. Rollback: revert the route move and redirects; storefront returns to the mixed global catalog (no data migration involved).

## Open Questions

- Should legacy `/category/<id>` redirect to the landing or to a dedicated store-picker page? (D5 currently: landing.)
- Redirect status: permanent (308) vs temporary (307) for legacy product URLs — pick based on whether the old paths should be fully retired.
- Does the root landing reuse `app/landing/` as-is, or does `/` need its own composition?
