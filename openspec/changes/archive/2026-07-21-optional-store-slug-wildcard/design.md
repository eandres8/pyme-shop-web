## Context

The storefront is a multi-tenant Next.js (App Router) app. Products belong to a tenant (`tenant_id`), and the public storefront is served under `app/(shop)/[storeSlug]/`. The `[storeSlug]` layout/page resolve the tenant via `getTenantBySlug` → `tenantRepository.findBySlug` and pass `tenant.id` into `getPaginatedProductsWithImages` / `getProductBySlug`.

The current design (specs `storefront-tenant-routing` + `storefront-legacy-redirects`) treats the slug as **required**: the root `/` serves a marketing landing (`app/(landing)/page.tsx`), and the unslugged routes are legacy stubs — `app/category/[id]/page.tsx` does `redirect("/")` and `app/product/[slug]/page.tsx` does `permanentRedirect("/<slug>/product/<slug>")`.

Key existing facts we build on:
- `productRepository.listProducts` / `countProducts` / `productBySlug` already apply `...(tenantId ? { tenant_id: tenantId } : {})` — **omitting `tenantId` already yields an unfiltered (wildcard) query**. No repository change is needed for wildcarding.
- `TopMenu` is `'use client'`, rendered in `app/(shop)/layout.tsx` (the parent of `[storeSlug]`), and derives the slug from `usePathname()` using a `NON_STORE_SEGMENTS` set. There is no tenant store on the client (`src/client/stores/` has only address, cart, ui).
- Reserved first segments are governed by `BACKLIST_KEY_WORDS` (per the tenant-routing spec) and mirrored in `TopMenu`'s `NON_STORE_SEGMENTS`.

The requested change inverts the default: no-slug = global/wildcard for everyone; slug = shareable tenant-scoped view. Plus the header brand must read `Pyme | {tenant_name}` in a store.

## Goals / Non-Goals

**Goals:**
- Root `/` renders the global catalog (all tenants, no `tenant_id` filter); landing moves to `/landing`.
- `/category/<id>` and `/product/<slug>` render global content in place instead of redirecting.
- Slugged routes under `[storeSlug]/` keep their current tenant-scoped behavior unchanged.
- Storefront navigation (menu, pagination, search) produces slug-relative links in store mode and slug-less links in global mode.
- Header brand: `Pyme | {tenant_name}` in store mode, `Pyme | Shop` in global mode.
- Every touched/new file ships with colocated unit tests (project policy `tests-coverage-policy`).

**Non-Goals:**
- No subdomain/middleware-based tenant resolution (despite the branch name); resolution stays path-based. Can be a follow-up.
- No change to admin/session-scoped areas or to how products are stored.
- No new filtering parameters on the repository — reuse the existing optional `tenantId`.
- No search backend changes; `/search` behavior beyond link-target mode is out of scope.

## Decisions

### D1: Reuse the optional `tenantId` rather than add a wildcard flag
The repository already treats missing `tenantId` as unfiltered. Global pages simply call the existing actions **without** `tenantId`. Rejected alternative: an explicit `showAll`/`*` flag — redundant and adds a second code path to test.

### D2: Two parallel route trees, not an optional catch-all
Keep the global routes at the application root (`app/category/[id]`, `app/product/[slug]`, and a new root catalog) and the tenant routes under `app/(shop)/[storeSlug]/`. Convert the existing legacy redirect stubs into real pages that mirror the `[storeSlug]` pages minus tenant resolution.
- Rejected: a single `[[...slug]]` optional catch-all. It would collapse both modes into one component but fights Next.js segment conventions, complicates `generateStaticParams`/ISR, and makes reserved-segment collisions harder to reason about.
- Consequence: some view logic is duplicated between global and slugged pages. Mitigate by extracting shared presentational pieces (grid + pagination + title) — they are already components (`ProductGrid`, `Pagination`, `Title`).

### D3: Root catalog vs. landing
Move `app/(landing)/page.tsx` content to a `/landing` route and make `/` a global catalog page. The catalog page reuses `getPaginatedProductsWithImages({ page })` (no `tenantId`). The global root must render inside a storefront chrome (TopMenu/Footer) — place it in the `(shop)` group (or a shared layout) so it gets the global header, not the landing header.

### D4: Header tenant name via a client tenant store (Zustand)
`TopMenu` sits above `[storeSlug]` in the tree and cannot receive the tenant as a prop. Introduce `useTenantStore` (`src/client/stores/tenant/tenant-store.ts`) holding `{ name, slug }`. The `[storeSlug]` layout (which already resolves the tenant) hydrates it via a tiny client hydrator component; `TopMenu` reads `name` and renders `Pyme | {name}`. When slug context is absent (global mode) or the store is empty, it falls back to `Pyme | Shop`.
- Rejected A: move `TopMenu` into `[storeSlug]/layout` — breaks the header for non-store routes (cart, checkout, admin, global).
- Rejected B: `TopMenu` fetches the tenant client-side by slug — duplicate lookup, flash of wrong name.
- The global-mode detection in `TopMenu` continues to use the existing `NON_STORE_SEGMENTS`/`BACKLIST_KEY_WORDS` logic; the tenant store is only populated on slugged routes, so `name` is naturally empty in global mode — the store doubles as the mode signal, with pathname as the fallback guard.

### D5: Link generation keyed on `storeBase`
`TopMenu` already computes `storeBase = storeSlug ? '/'+storeSlug : ''`. Global mode yields `storeBase = ''`, so category/pagination links become slug-less automatically. Audit `ProductGrid`/`Pagination`/product links to ensure they honor an empty base and never hardcode a slug. Search link stays `/search` (global) in both modes for now.

### D6: SEO canonical to avoid duplicate content
The same product is reachable at `/product/<slug>` and `/<store-slug>/product/<slug>`. Set a canonical URL in `generateMetadata`: the slug-scoped tenant URL is canonical (it is the unambiguous, owned location); the global route emits `<link rel="canonical">` pointing to the owning tenant's slugged URL. Global category/root are canonical to themselves. This keeps search engines from splitting rank while both URLs work for humans.

## Risks / Trade-offs

- **[Duplicate view logic between global and slugged pages]** → Extract shared presentational components; cover both page variants with unit tests so drift is caught.
- **[Header flashes `Pyme | Shop` before hydration on a store page]** → Acceptable per spec (fallback scenario); the store hydrates on first client render. If flash is objectionable later, pass an initial value through a server component boundary.
- **[Reserved-slug collision]** → A tenant slug equal to `category`, `product`, `cart`, `search`, etc. would shadow a global route. Already guarded by `BACKLIST_KEY_WORDS` at registration; keep `NON_STORE_SEGMENTS` in sync (single source of truth) and add a test asserting the two lists agree.
- **[ISR/`generateStaticParams` for new global routes]** → The global root/category/product are dynamic across all tenants; choose a revalidate window consistent with the existing store pages (24h home, 7d product) or render dynamically. Decide per route in tasks.
- **[SEO duplicate content]** → Mitigated by D6 canonical tags; verify with a unit/integration assertion on emitted metadata.
- **[Behavior inversion is BREAKING]** → Old `/product/<slug>` consumers previously got a 301; now a 200. Documented in the `storefront-legacy-redirects` REMOVED migration notes.

## Migration Plan

1. Add `/landing` route with the current landing content; keep `(landing)` layout/header for it.
2. Introduce `useTenantStore` + hydrator; wire hydration in `[storeSlug]/layout`; update `TopMenu` brand + confirm link base behavior. Tests first/with each.
3. Replace `app/category/[id]/page.tsx` redirect with a global category page (reuses store category view sans tenant).
4. Replace `app/product/[slug]/page.tsx` redirect with a global product-detail page (+ canonical to owning tenant).
5. Make `/` render the global catalog under storefront chrome.
6. Add canonical metadata (D6) and reserved-segment consistency test.
7. Run `pnpm test:ci`; ensure coverage on every touched file.

Rollback: revert the route changes; the `[storeSlug]/` tree is untouched, so tenant storefronts keep working regardless.

## Open Questions

- Should `/landing` be linked from the global header (e.g. a "Sobre Pyme" link), or only reachable directly? (Assume direct-only for now.)
- Does the global catalog need any cross-tenant ordering/ranking (e.g. newest first, randomized), or is default order acceptable? (Assume default repository order.)
- Subdomain-based resolution (`feature/000-subdomain-by-url`) — is this change expected to coexist with a future middleware that maps subdomain→slug, and should link generation anticipate that? (Assume path-based only for this change.)
