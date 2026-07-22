# storefront-tenant-routing

## Purpose

Serve the public storefront under an optional `[storeSlug]` URL segment so every storefront view is scoped to the tenant that owns the slug when present, or runs in global (wildcard) mode when absent, while session-scoped and global areas remain at the application root.

## Requirements

### Requirement: Store slug segment scopes the public storefront

The public storefront MAY be served under an optional `[storeSlug]` URL segment (`/<store-slug>/...`). When a slug is present, all storefront product queries SHALL be constrained to the tenant that owns that slug, resolved via `tenantRepository.findBySlug`. When no slug is present, the storefront SHALL run in global (unfiltered) mode as defined by the `storefront-global-catalog` capability. The slugged form remains the shareable, tenant-scoped view.

#### Scenario: Home catalog scoped to store

- **WHEN** a visitor opens `/<store-slug>`
- **THEN** the catalog SHALL list only products whose `tenant_id` matches the tenant resolved from `<store-slug>`
- **AND** products belonging to other tenants SHALL NOT appear

#### Scenario: Category page scoped to store

- **WHEN** a visitor opens `/<store-slug>/category/<id>`
- **THEN** the category listing SHALL include only products of the resolved tenant

#### Scenario: Product detail scoped to store

- **WHEN** a visitor opens `/<store-slug>/product/<product-slug>`
- **THEN** the product SHALL be resolved within the tenant of `<store-slug>`
- **AND** a product slug that exists only under a different tenant SHALL NOT be shown

#### Scenario: No slug runs in global mode

- **WHEN** a visitor opens a slug-less storefront route (`/`, `/category/<id>`, `/product/<product-slug>`)
- **THEN** queries SHALL run without a `tenant_id` filter
- **AND** the request SHALL NOT be treated as an unknown store slug

### Requirement: Unknown store slug returns 404

The storefront SHALL return a 404 (not-found) response when the URL slug does not resolve to an existing tenant.

#### Scenario: Nonexistent store slug

- **WHEN** a visitor opens `/<unknown-slug>` and no tenant has that slug
- **THEN** the storefront SHALL respond with 404 and SHALL NOT render a store home

### Requirement: Reserved slugs cannot collide with top-level routes

A store slug SHALL NOT be a reserved keyword that collides with a top-level application route. The reserved-word list SHALL be sourced from the existing `BACKLIST_KEY_WORDS` configuration and applied as a path-segment guard.

#### Scenario: Reserved slug rejected at store registration

- **WHEN** a store is registered with a slug present in `BACKLIST_KEY_WORDS` (e.g. `admin`, `auth`, `api`, `cart`, `checkout`)
- **THEN** the registration SHALL be rejected so the slug cannot shadow or be shadowed by a top-level route

#### Scenario: Reserved path not treated as a store

- **WHEN** a visitor opens a reserved top-level route (e.g. `/admin`, `/auth/login`, `/api/health-check`)
- **THEN** the request SHALL be handled by that route and SHALL NOT be interpreted as a `[storeSlug]` storefront

### Requirement: Storefront pages render with per-store ISR

Storefront pages under `[storeSlug]` SHALL be rendered using Incremental Static Regeneration. Known store slugs SHALL be pre-rendered via `generateStaticParams`, and stores not yet generated SHALL be produced on demand and revalidated.

#### Scenario: Known store pre-rendered

- **WHEN** the build runs
- **THEN** `generateStaticParams` SHALL return the existing store slugs so their storefront pages are statically generated

#### Scenario: New store generated on demand

- **WHEN** a visitor opens the storefront of a store created after the last build
- **THEN** the page SHALL be generated on demand and cached for subsequent requests under the ISR revalidation window

### Requirement: Storefront internal links are slug-relative

Internal storefront navigation (top menu, sidebar catalog links, pagination) SHALL target paths relative to the current store slug when a slug is in context, and SHALL target slug-less paths when in global mode, so navigation stays within the current mode.

#### Scenario: Category link keeps the store context

- **WHEN** a visitor on `/<store-slug>` follows a category link in the top menu
- **THEN** the destination SHALL be `/<store-slug>/category/<id>` and remain scoped to the same store

#### Scenario: Pagination keeps the store context

- **WHEN** a visitor advances pages in the storefront catalog under a store slug
- **THEN** the pagination links SHALL preserve the `<store-slug>` segment

#### Scenario: Global navigation omits the slug

- **WHEN** a visitor in global (slug-less) mode follows a category or pagination link
- **THEN** the destination SHALL be slug-less (no `<store-slug>` segment)

### Requirement: Session-scoped and global areas stay unslugged

Session-scoped areas (`admin`, `profile`, `orders`, `checkout`) and global areas (`auth`, `api`) SHALL remain at the application root and SHALL resolve tenant from the authenticated session, not from a URL slug.

#### Scenario: Admin resolves tenant from session

- **WHEN** an authenticated store admin opens `/admin`
- **THEN** the tenant SHALL be resolved from the session (not from a URL slug) and the admin SHALL manage their own store
