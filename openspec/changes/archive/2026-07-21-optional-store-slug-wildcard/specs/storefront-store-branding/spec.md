## ADDED Requirements

### Requirement: Header brand reflects the active store

The storefront header brand SHALL render `Pyme | {tenant_name}` when a store slug is in context and the slug resolves to a tenant. When no store slug is in context (global mode) or the tenant name is unavailable, the header SHALL render the default `Pyme | Shop`.

#### Scenario: Header inside a store

- **WHEN** a visitor is on `/<store-slug>` (or any `/<store-slug>/...` route) and the slug resolves to a tenant named "Acme"
- **THEN** the header brand SHALL read `Pyme | Acme`

#### Scenario: Header in global mode

- **WHEN** a visitor is on a slug-less route (`/`, `/category/<id>`, `/product/<slug>`) or a global/session area (`cart`, `checkout`)
- **THEN** the header brand SHALL read `Pyme | Shop`

#### Scenario: Tenant name not yet available

- **WHEN** a store slug is in context but the tenant name has not been resolved/hydrated yet
- **THEN** the header SHALL fall back to `Pyme | Shop` rather than showing an empty or partial name

### Requirement: Tenant name is available to the header

The active tenant's name SHALL be made available to the client header from the store-scoped layout that already resolves the tenant, without the header performing its own tenant lookup.

#### Scenario: Store layout provides the tenant name

- **WHEN** the store-scoped layout resolves the tenant for `<store-slug>`
- **THEN** the tenant name SHALL be exposed to the client header (e.g. via a client tenant store) so the brand can render `Pyme | {tenant_name}`
