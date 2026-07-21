## ADDED Requirements

### Requirement: Root path serves the landing page

The application root `/` SHALL serve the landing / marketing page instead of a global product catalog.

#### Scenario: Visitor opens the root

- **WHEN** a visitor opens `/`
- **THEN** the landing / marketing page SHALL be rendered
- **AND** a mixed catalog of products from all tenants SHALL NOT be shown

### Requirement: Legacy product URLs redirect to slug-scoped URLs

Legacy product-detail URLs of the form `/product/<product-slug>` SHALL redirect to the slug-scoped equivalent `/<store-slug>/product/<product-slug>`, where `<store-slug>` is the slug of the tenant that owns the product (resolved from the product's `tenant_id`).

#### Scenario: Legacy product URL resolves owning store

- **WHEN** a visitor opens `/product/<product-slug>` and the product exists
- **THEN** the response SHALL redirect to `/<store-slug>/product/<product-slug>` for the owning tenant

#### Scenario: Legacy product URL for a missing product

- **WHEN** a visitor opens `/product/<product-slug>` and no product has that slug
- **THEN** the response SHALL be 404 and SHALL NOT redirect

### Requirement: Legacy category URLs redirect to slug-scoped URLs

Legacy category URLs of the form `/category/<id>` SHALL redirect to the slug-scoped equivalent `/<store-slug>/category/<id>`, where `<store-slug>` is resolved from the owning tenant of the category resource.

#### Scenario: Legacy category URL resolves owning store

- **WHEN** a visitor opens `/category/<id>` and the category resolves to a tenant
- **THEN** the response SHALL redirect to `/<store-slug>/category/<id>` for that tenant
