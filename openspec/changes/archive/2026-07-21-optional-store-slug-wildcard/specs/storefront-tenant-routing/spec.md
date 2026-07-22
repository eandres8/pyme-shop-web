## MODIFIED Requirements

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
