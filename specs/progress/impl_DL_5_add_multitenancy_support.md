# DL_5_add_multitenancy_support — Implementation Traceability

## Summary

Multitenancy support added to backend:
- Prisma schema: `Tenant`, `TenantUser` models, `TenantUserRole` enum
- `tenant_id` optional fields on `Product`, `Category`, `Order`
- `TenantRepository` with full CRUD + `createWithAdmin` transaction
- `ITenantRepository` interface
- `createTenantClient` for automatic tenant filtering
- Existing repositories updated to accept optional `tenantId`
- 175 tests passing (32 suites), 0 lint errors

## Trazabilidad (R → Test mapping)

| Requirement | Test(s) |
|-------------|---------|
| R1 (Tenant model) | `tenant.repository.test.ts` — create, findById, findBySlug |
| R2 (Tenant @@map) | `prisma generate` succeeds (schema valid) |
| R3 (Tenant→TenantUser) | `tenant.repository.test.ts` — addUser, listUsers |
| R4 (Tenant→Product) | Schema valid; product.repository.test.ts — listProducts with tenantId |
| R5 (Tenant→Category) | Schema valid; category.repository.test.ts — listCategories with tenantId |
| R6 (Tenant→Order) | Schema valid; order.repository.test.ts — listOrders with tenantId |
| R7 (TenantUserRole enum) | Schema valid; tenant.repository.test.ts — addUser with role |
| R8 (TenantUser model) | `tenant.repository.test.ts` — addUser, listUsers |
| R9 (TenantUser @@map) | Schema valid |
| R10 (TenantUser→User) | `tenant.repository.test.ts` — listUsers (include user) |
| R11 (TenantUser→Tenant) | `tenant.repository.test.ts` — addUser, listUsers |
| R12 (Unique constraint) | `tenant.repository.test.ts` — addUser constraint violation |
| R13 (User→TenantUser) | Schema valid |
| R14 (Product tenant_id + index) | Schema valid; `product.repository.test.ts` — listProducts/countProducts with tenantId |
| R15 (Category tenant_id + index) | Schema valid; `category.repository.test.ts` — listCategories with tenantId |
| R16 (Order tenant_id + index) | Schema valid; `order.repository.test.ts` — listOrders with tenantId |
| R17 (TenantRepository.create) | `tenant.repository.test.ts` — create success + error |
| R18 (TenantRepository.findById) | `tenant.repository.test.ts` — findById found, not found, error |
| R19 (TenantRepository.findBySlug) | `tenant.repository.test.ts` — findBySlug found, not found, error |
| R20 (TenantRepository.addUser) | `tenant.repository.test.ts` — addUser success, error, constraint |
| R21 (TenantRepository.listUsers) | `tenant.repository.test.ts` — listUsers data, empty, error |
| R22 (TenantRepository.removeUser) | `tenant.repository.test.ts` — removeUser success, 0 count, error |
| R23 (TenantRepository.createWithAdmin) | `tenant.repository.test.ts` — createWithAdmin success, transaction error |
| R24 (ProductRepository.listProducts tenantId) | `product.repository.test.ts` — listProducts with tenantId |
| R25 (ProductRepository.countProducts tenantId) | `product.repository.test.ts` — countProducts with tenantId |
| R26 (CategoryRepository.listCategories tenantId) | `category.repository.test.ts` — listCategories with tenantId |
| R27 (OrderRepository.listOrders tenantId) | `order.repository.test.ts` — listOrders with tenantId |
| R28 (Tenant client extension) | `prisma-tenant-client.test.ts` — product/category/order findMany, findFirst, count, create |
| R29 ($transaction propagation) | `tenant.repository.test.ts` — createWithAdmin uses $transaction |
| R30 (Original client works without filter) | All existing tests pass unchanged |
| R31 (Models without tenant_id pass through) | `prisma-tenant-client.test.ts` — user/country queries unmodified |
| R32 (Unique constraint violation) | `tenant.repository.test.ts` — addUser constraint error |
| R33 (Transaction rollback) | `tenant.repository.test.ts` — createWithAdmin transaction error |
| R34 (Empty tenantId handling) | `prisma-tenant-client.test.ts` — no-args calls inject tenant_id |
| R35 (Backward compatibility) | All existing tests pass unchanged |

## Files Created
- `src/core/types/tenant.type.ts`
- `src/core/entities/tenant.entity.ts`
- `src/core/entities/tenant-user.entity.ts`
- `src/server/interfaces/tenant.interface.ts`
- `src/server/repositories/tenant.repository.ts`
- `src/server/repositories/tenant.repository.test.ts`
- `src/config/database/prisma-tenant-client.ts`
- `src/config/database/prisma-tenant-client.test.ts`

## Files Modified
- `prisma/schema.prisma` — Tenant, TenantUser, TenantUserRole; tenant_id on Product, Category, Order; tenantUsers on User
- `src/core/types/index.ts` — added tenant.type export
- `src/core/entities/index.ts` — added tenant.entity, tenant-user.entity exports
- `src/server/interfaces/index.ts` — added tenant.interface export
- `src/server/interfaces/product.interface.ts` — added tenantId to TListProps
- `src/server/interfaces/category.interface.ts` — added tenantId to listCategories
- `src/server/interfaces/order.interface.ts` — added tenantId to listOrders
- `src/server/repositories/index.ts` — added tenant.repository export
- `src/server/repositories/product.repository.ts` — tenantId filter in listProducts/countProducts
- `src/server/repositories/category.repository.ts` — tenantId filter in listCategories
- `src/server/repositories/order.repository.ts` — tenantId filter in listOrders, removed TODO comments
- `src/server/providers/repository-injection.ts` — added tenantRepository
- `src/config/database/prisma-client.ts` — re-export createTenantClient
- `tests/mocks/prisma/prisma-client-mock-factory.ts` — added tenant/tenantUser mocks

## Pending
- T09: `pnpm dlx prisma migrate dev --name add_multitenancy` (requires running Postgres)
- T42: `pnpm build` (requires running build environment)
