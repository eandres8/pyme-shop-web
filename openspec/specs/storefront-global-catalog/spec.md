# storefront-global-catalog

## Purpose

Serve slug-less storefront routes (root, category, product detail) as a global, wildcard view across all tenants instead of redirecting to a slug-scoped URL, and keep global-mode navigation slug-less.

## Requirements

### Requirement: Root path serves the global catalog

The application root `/` SHALL serve a global product catalog listing products across all tenants. Product queries at the root SHALL run without a tenant filter (wildcard). The marketing/landing page SHALL be reachable at a dedicated route (`/landing`).

#### Scenario: Visitor opens the root

- **WHEN** a visitor opens `/`
- **THEN** the catalog SHALL list products from all tenants
- **AND** no `tenant_id` filter SHALL be applied to the query

#### Scenario: Root catalog is paginated

- **WHEN** a visitor advances pages at `/?page=<n>`
- **THEN** the catalog SHALL return the corresponding page of the global (unfiltered) product set

#### Scenario: Landing remains reachable

- **WHEN** a visitor opens `/landing`
- **THEN** the marketing / pricing page SHALL be rendered

### Requirement: Unslugged category listing is global

A category URL without a store slug (`/category/<id>`) SHALL serve a global category listing across all tenants instead of redirecting.

#### Scenario: Global category listing

- **WHEN** a visitor opens `/category/<id>` (e.g. `/category/men`)
- **THEN** the listing SHALL include products of that `gender` taxonomy from all tenants
- **AND** the request SHALL NOT redirect to `/` or to a slug-scoped URL

### Requirement: Unslugged product detail is global

A product-detail URL without a store slug (`/product/<product-slug>`) SHALL serve the product detail without a tenant filter instead of redirecting to a slug-scoped URL.

#### Scenario: Global product detail

- **WHEN** a visitor opens `/product/<product-slug>` and the product exists
- **THEN** the product detail SHALL be rendered directly at `/product/<product-slug>`
- **AND** the request SHALL NOT redirect to `/<store-slug>/product/<product-slug>`

#### Scenario: Unknown product at global route

- **WHEN** a visitor opens `/product/<product-slug>` and no product has that slug
- **THEN** the response SHALL be 404

### Requirement: Global storefront navigation is slug-less

When no store slug is in context, storefront navigation (top menu category links, pagination, search) SHALL target slug-less paths so the visitor stays in global mode.

#### Scenario: Category link stays global

- **WHEN** a visitor in global mode follows a category link in the top menu
- **THEN** the destination SHALL be `/category/<id>` (no store-slug prefix)

#### Scenario: Pagination stays global

- **WHEN** a visitor advances pages in the global catalog
- **THEN** the pagination links SHALL NOT introduce a store-slug segment
