## Context

The multi-tenant storefront resolves tenant two different ways:

- **Storefront (public)** — tenant comes from the URL (`[storeSlug]`) or is intentionally absent (global/wildcard catalog). This is by design and stays as-is.
- **Admin (session-scoped)** — tenant must come from the authenticated session (`session.user.tenant`, populated by the next-auth JWT callbacks in `src/auth.config.ts`).

Today the admin surface uses an "optional tenant argument" pattern: repositories accept an optional `tenantId` and only filter when it is passed, and the admin pages/actions simply never pass it. Result: `/admin/products` and `/admin/orders` return **all tenants'** data, and `getProductBySlug(slug)` can resolve a foreign tenant's product because slugs are unique only per tenant.

The repositories are already tenant-capable (`listProducts`, `countProducts`, `listOrders(tenantId?)`, `productBySlug(slug, tenantId?)`). The gap is entirely at the action/page boundary plus one persistence hole: `trxNewOrder` never writes `order.tenant_id`.

## Goals / Non-Goals

**Goals:**
- Admin product list/detail/create/update and admin order list are always constrained to the session tenant.
- Missing session tenant is a **server error** (fail-closed), resolved in one place, never a silent unfiltered/empty view.
- Placed orders are stamped with their owning tenant so admin order listing is meaningful.
- Make omission of the tenant filter structurally hard for future admin code (single guard, resolved server-side).

**Non-Goals:**
- No change to the public storefront's global/wildcard mode or slug-scoped mode (`storefront-global-catalog`, `storefront-tenant-routing`).
- No change to the admin **users** listing (`getUserFiltered`) — tracked separately.
- No schema change: `tenant_id` already exists (nullable) on `products` and `orders`. Making it non-nullable is a follow-up, not part of this change.
- No automatic data backfill of pre-existing `tenant_id = null` rows (called out as a risk).

## Decisions

### Decision 1: A single `requireSessionTenant()` guard, fail-closed by throwing

Add a server helper that calls `auth()`, reads `session.user.tenant`, and **throws** when it is falsy (empty string, `undefined`, or an unauthenticated/non-admin session). It returns a non-empty `tenantId: string` on success.

- **Why throw (not return empty / not a Result):** The user's mandate is that a tenant-less authenticated admin is an *impossible* state and must surface as a server error (Next.js `error.tsx` / 500), not a friendly empty state. Throwing routes straight to the error boundary and guarantees the value is a valid tenant wherever it is used. It also makes "forgot to pass the filter" impossible in admin actions because the id is obtained from the guard, not a parameter.
- **Alternatives considered:**
  - *Return `Result<string>` and let callers decide* — rejected: invites the same "forgot to fail closed" bug and contradicts the "server error" requirement.
  - *Return `''` and filter on it* — rejected: `where: { tenant_id: '' }` silently returns nothing (fails closed by accident) but hides a real invariant violation instead of erroring.
- **Note on `user.tenant || ''`:** existing code (`get-tenant-config.ts`) coerces a missing tenant to `''`; admin paths must not copy that pattern — they call the guard instead.

### Decision 2: Keep the shared product/order actions; scope at the admin boundary

`getPaginatedProductsWithImages` is shared with the public storefront, which legitimately queries arbitrary or no tenant. Rather than fork the repository, the **admin pages/actions** resolve the tenant via the guard and pass it explicitly into the existing tenant-aware repository methods.

- Admin products page → resolve guard → `getPaginatedProductsWithImages({ ..., tenantId })`.
- Admin product detail page → `getProductBySlug(slug, tenantId)`.
- `getPaginatedOrders()` → `listOrders(requireSessionTenant())`.
- **Alternative considered:** a dedicated `getAdminProducts()` action that internally calls the guard. Reasonable and slightly safer, but resolving in the page (server component) matches the existing `getPaginatedOrders`/`getUserFiltered` pattern of `await auth()` at the action boundary. We keep the storefront action untouched and add the guard call at each admin entry point; a dedicated admin action can be layered later without breaking the spec.

### Decision 3: `updateProductInfo` derives tenant from the session and guards cross-tenant writes

The action already sets `tenantId: session?.user?.tenant` — change it to `requireSessionTenant()` (fail-closed). Additionally, the **update branch** currently updates by `{ id }` only; add a tenant constraint so a product owned by another tenant cannot be mutated (scope the update `where` to `{ id, tenant_id }`, or pre-check ownership and reject). Create branch stamps `tenant_id` from the guard.

- **Why:** create-with-session-tenant alone still leaves a cross-tenant *write* hole on update (an attacker POSTs a foreign product id). Same class of bug; fixed here.

### Decision 4: Stamp `order.tenant_id` at creation from the ordered products' tenant

`placeOrder` already loads the ordered products (`_mapProducts` → `listProductsByIds`, which includes `tenant`). Derive the order's tenant from those products and pass it into `trxNewOrder`, which sets `tenant_id` on `order.create`.

- **Single-tenant cart assumption:** a cart is expected to contain products from one store/tenant. Validate this — if the ordered products span multiple tenants, reject the order rather than silently pick one. This keeps orders attributable to exactly one tenant as the spec requires.
- **Alternative considered:** derive order tenant from a `[storeSlug]` in the checkout URL. Rejected: checkout is a session/root area (unslugged per `storefront-tenant-routing`); the products themselves are the reliable source of truth.

## Risks / Trade-offs

- **Pre-existing `tenant_id = null` rows become invisible to all admins** → This is correct per fail-closed, but orphans real data. Mitigation: a one-off backfill script mapping existing products/orders to their tenant before rollout; document that unmigrated rows are intentionally hidden.
- **Orders placed before this change have no tenant** → They will never appear in any admin list. Mitigation: same backfill (derive order tenant from its order items' products).
- **Multi-tenant cart edge case** → If a cart legitimately mixes tenants today, order placement will start rejecting it. Mitigation: validate and surface a clear error; confirm the storefront cannot build cross-tenant carts (per-store model suggests it cannot).
- **Throwing in a server component** → must render through `app/(shop)/admin/error.tsx` (or a nearer boundary). Mitigation: verify an admin error boundary exists; add one if missing so the 500 is a controlled admin error page.
- **`getProductBySlug` returns an empty `Product` on failure today** → the detail page treats falsy as redirect. Ensure a foreign-tenant slug resolves to the not-found/redirect path, not a blank editable form.

## Migration Plan

1. Add `requireSessionTenant()` helper + unit tests.
2. Stamp `order.tenant_id` in `trxNewOrder` / `placeOrder` (+ single-tenant cart validation) with tests.
3. Scope admin products list, product detail, and `updateProductInfo` (create stamp + update guard) with tests.
4. Scope admin orders list with tests.
5. Ensure an admin error boundary renders the fail-closed server error.
6. (Ops, outside code) Backfill `tenant_id` for existing products/orders; verify no orphaned rows remain that should be visible.
7. Rollback: changes are additive filters + one persisted column value; revert the commits to restore prior behavior (data written with `tenant_id` remains valid).

## Open Questions

- Is a data backfill required now, or is existing product/order data disposable (dev/seed only)? Affects whether step 6 blocks rollout.
- Should `products.tenant_id` / `orders.tenant_id` be made **non-nullable** in a follow-up migration once backfilled, to enforce the invariant at the database level?
- Does an `app/(shop)/admin/error.tsx` boundary already exist, or must one be added for the fail-closed server error?
