## REMOVED Requirements

### Requirement: Root path serves the landing page

**Reason**: The root `/` now serves the global product catalog (wildcard across all tenants), not the marketing landing page. The landing content moves to `/landing`.
**Migration**: Update any link or bookmark that expected marketing content at `/` to point to `/landing`. See the `storefront-global-catalog` capability for the new root behavior.

### Requirement: Legacy product URLs redirect to slug-scoped URLs

**Reason**: Unslugged `/product/<product-slug>` now serves a global product-detail view directly instead of redirecting to `/<store-slug>/product/<product-slug>`. A URL without a slug is a first-class, shareable-for-everyone view.
**Migration**: No consumer action required — existing `/product/<product-slug>` links keep resolving, but now render in place (200) rather than issuing a permanent redirect. The slug-scoped `/<store-slug>/product/<product-slug>` form remains available for tenant-scoped sharing. See `storefront-global-catalog`.

### Requirement: Legacy category URLs redirect to slug-scoped URLs

**Reason**: Unslugged `/category/<id>` now serves a global category listing across all tenants instead of redirecting.
**Migration**: No consumer action required — `/category/<id>` links now render a global listing in place instead of redirecting. The slug-scoped `/<store-slug>/category/<id>` form remains available. See `storefront-global-catalog`.
