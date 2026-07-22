## Why

The admin panel leaks data across tenants: the products administration view queries products with no `tenant_id` filter, so every store admin sees (and can open/edit) every other tenant's catalog, and the orders list is equally unscoped. The repositories already support tenant filtering — the admin actions and pages simply never derive the session tenant and pass it — so authenticated admins are exposed to other tenants' sensitive data (catalog, customer names, payment status).

## What Changes

- Admin product listing (`/admin/products`) SHALL query only products whose `tenant_id` matches the session tenant.
- Admin product detail/edit (`/admin/product/[slug]`) SHALL resolve the product within the session tenant, so shared slugs across tenants cannot be opened or edited cross-tenant.
- Admin product create/update (`updateProductInfo`) SHALL stamp and constrain the product to the session tenant, and SHALL reject updating a product that belongs to a different tenant. **BREAKING** for any caller relying on client-supplied tenant.
- Admin orders listing (`/admin/orders`) SHALL query only orders whose `tenant_id` matches the session tenant.
- Order creation (`placeOrder` / `trxNewOrder`) SHALL stamp the order's `tenant_id` (derived from the ordered products' tenant) so placed orders are attributable to a tenant and appear in that tenant's admin list.
- A single session-tenant guard SHALL resolve the tenant from the authenticated session and **fail closed**: an authenticated admin with no tenant is an invalid/impossible state and SHALL raise a server error (500 / error boundary) rather than render an unfiltered or empty view.

## Capabilities

### New Capabilities
- `admin-tenant-isolation`: Every admin data path (list/create/read products, list orders) is scoped to the tenant resolved from the authenticated session; a missing session tenant is treated as a server error (fail-closed).

### Modified Capabilities
<!-- None: the storefront's intentional global/wildcard and slug-scoped modes (storefront-global-catalog, storefront-tenant-routing) are unchanged. -->

## Impact

- **Actions** (`src/server/actions/`): `products/products-pagination.ts` (admin path), `products/get-product-by-slug.ts`, `products/update-product-info.ts`, `order/get-paginated-orders.ts`, `order/place-order.ts`.
- **Repositories** (`src/server/repositories/`): `order.repository.ts` `trxNewOrder` must persist `tenant_id`; product/order list queries already accept `tenantId` (no query change). `updateProductInfo` gains a cross-tenant write guard.
- **Pages** (`app/(shop)/admin/`): `products/page.tsx`, `product/[slug]/page.tsx`, `orders/page.tsx` resolve/pass the session tenant.
- **New**: a `requireSessionTenant()` helper (throws when absent) shared by admin actions.
- **Data**: existing products/orders with `tenant_id = null` become invisible to every admin under this rule (correct per fail-closed); a backfill may be needed if real data exists.
- **Auth/session**: relies on `session.user.tenant` from the next-auth JWT (`src/auth.config.ts`, `nextauth.d.ts`).
- Out of scope: admin users listing (`getUserFiltered`) and the public storefront's global/slug-scoped modes.
