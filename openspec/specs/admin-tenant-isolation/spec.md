# admin-tenant-isolation

## Purpose

Ensure every admin data path (products and orders) is scoped to the tenant resolved from the authenticated session, so store admins can never see or mutate another tenant's data. A missing session tenant is treated as an invalid/impossible state and fails closed with a server error rather than rendering an unfiltered or empty view.

## Requirements

### Requirement: Admin data paths resolve the tenant from the session

Every admin data path SHALL derive the tenant identifier from the authenticated session (`session.user.tenant`), never from a client-supplied argument or URL slug. A single shared guard SHALL perform this resolution for admin actions.

#### Scenario: Session tenant drives admin queries

- **WHEN** an authenticated store admin triggers any admin data path (list products, read a product, create/update a product, list orders)
- **THEN** the tenant SHALL be resolved from `session.user.tenant`
- **AND** any tenant value present in the request payload, form data, or URL SHALL be ignored for scoping

### Requirement: Missing session tenant fails closed as a server error

An authenticated admin whose session has no tenant is an invalid/impossible state. Admin data paths SHALL raise a server error (surfaced as a 500 / error boundary) and SHALL NOT fall back to an unfiltered query, an empty list, or any partial result.

#### Scenario: Admin without a tenant hits an admin view

- **WHEN** an authenticated admin with no `tenant` on the session opens an admin data view (products or orders)
- **THEN** the request SHALL raise a server error
- **AND** no products or orders from any tenant SHALL be returned or rendered

#### Scenario: Missing tenant never widens the query

- **WHEN** the session tenant is absent during an admin data path
- **THEN** the system SHALL NOT execute the underlying query without a `tenant_id` filter

### Requirement: Admin product listing is scoped to the session tenant

The admin products view (`/admin/products`) SHALL list only products whose `tenant_id` matches the session tenant, including inactive products of that tenant, and SHALL exclude products of every other tenant.

#### Scenario: Admin sees only own products

- **WHEN** an admin of tenant A opens `/admin/products`
- **THEN** the listing SHALL contain only products with `tenant_id = A`
- **AND** products belonging to any other tenant SHALL NOT appear

#### Scenario: Inactive products of the tenant remain visible

- **WHEN** an admin of tenant A opens `/admin/products` and tenant A has `INACTIVE` products
- **THEN** those inactive products SHALL be listed (admin view is not status-filtered)
- **AND** they SHALL still be constrained to `tenant_id = A`

#### Scenario: Pagination stays tenant-scoped

- **WHEN** an admin advances pages at `/admin/products?page=<n>`
- **THEN** the page count and returned rows SHALL reflect only the session tenant's products

### Requirement: Admin product detail is scoped to the session tenant

The admin product detail/edit view (`/admin/product/[slug]`) SHALL resolve the product within the session tenant. Because product slugs are unique only per tenant, a slug that exists under a different tenant SHALL NOT resolve.

#### Scenario: Slug shared across tenants resolves to own tenant

- **WHEN** an admin of tenant A opens `/admin/product/<slug>` and tenant A owns a product with that slug
- **THEN** tenant A's product SHALL be resolved and rendered

#### Scenario: Foreign-tenant slug is not shown

- **WHEN** an admin of tenant A opens `/admin/product/<slug>` and only a different tenant owns a product with that slug
- **THEN** tenant A's product SHALL NOT resolve (the admin is redirected away / treated as not found for that tenant)

### Requirement: Admin product create and update are constrained to the session tenant

Creating a product SHALL stamp `tenant_id` with the session tenant. Updating a product SHALL be permitted only when the target product belongs to the session tenant; an attempt to update a product owned by another tenant SHALL be rejected without mutating it.

#### Scenario: Create stamps the session tenant

- **WHEN** an admin of tenant A submits the new-product form
- **THEN** the created product SHALL have `tenant_id = A` regardless of any tenant value in the submitted data

#### Scenario: Update of own product succeeds

- **WHEN** an admin of tenant A submits an edit for a product whose `tenant_id = A`
- **THEN** the update SHALL be applied

#### Scenario: Cross-tenant update is rejected

- **WHEN** an admin of tenant A submits an edit referencing a product id whose `tenant_id != A`
- **THEN** the update SHALL be rejected
- **AND** the target product SHALL remain unchanged

### Requirement: Admin orders listing is scoped to the session tenant

The admin orders view (`/admin/orders`) SHALL list only orders whose `tenant_id` matches the session tenant, and SHALL exclude orders of every other tenant.

#### Scenario: Admin sees only own orders

- **WHEN** an admin of tenant A opens `/admin/orders`
- **THEN** the listing SHALL contain only orders with `tenant_id = A`
- **AND** orders belonging to any other tenant (customer names, payment status) SHALL NOT appear

### Requirement: Placed orders are stamped with the owning tenant

Order creation SHALL persist the order's `tenant_id`, derived from the tenant of the ordered products, so that every placed order is attributable to exactly one tenant and appears in that tenant's admin orders list.

#### Scenario: New order carries the product tenant

- **WHEN** a customer places an order for products belonging to tenant A
- **THEN** the created order SHALL have `tenant_id = A`
- **AND** the order SHALL subsequently appear in tenant A's `/admin/orders` list
