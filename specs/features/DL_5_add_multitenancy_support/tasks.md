# DL_5_add_multitenancy_support — Tasks

> Pasos discretos en orden. Cada task referencia al menos un `R<n>`.

---

## Fase 0 — Schema Prisma

- [x] T01 — Agregar enum `TenantUserRole` con valores `owner` y `admin` al archivo `prisma/schema.prisma`.  
  Cubre: R7

- [x] T02 — Agregar modelo `Tenant` al archivo `prisma/schema.prisma` con campos `id`, `name`, `slug` (unique), `created_at`, `updated_at` y relaciones one-to-many hacia `TenantUser`, `Product`, `Category`, `Order`. Mapear a tabla `tenants`.  
  Cubre: R1, R2, R3, R4, R5, R6

- [x] T03 — Agregar modelo `TenantUser` al archivo `prisma/schema.prisma` con campos `id`, `user_id`, `tenant_id`, `role`. Agregar constraint único `@@unique([user_id, tenant_id])`. Mapear a tabla `tenant_users`.  
  Cubre: R8, R9, R10, R11, R12

- [x] T04 — Modificar modelo `Product` en `prisma/schema.prisma`: agregar campo `tenant_id String?`, relación `Tenant?`, e índice `@@index([tenant_id])`.  
  Cubre: R4, R14

- [x] T05 — Modificar modelo `Category` en `prisma/schema.prisma`: agregar campo `tenant_id String?`, relación `Tenant?`, e índice `@@index([tenant_id])`.  
  Cubre: R5, R15

- [x] T06 — Modificar modelo `Order` en `prisma/schema.prisma`: agregar campo `tenant_id String?`, relación `Tenant?`, e índice `@@index([tenant_id])`.  
  Cubre: R6, R16

- [x] T07 — Modificar modelo `User` en `prisma/schema.prisma`: agregar relación `tenantUsers TenantUser[]`.  
  Cubre: R13

- [x] T08 — Ejecutar `pnpm dlx prisma generate` para regenerar el cliente Prisma con los nuevos modelos.  
  Cubre: R1

- [ ] T09 — Ejecutar `pnpm dlx prisma migrate dev --name add_multitenancy` para crear la migración de la base de datos.  
  Cubre: R1, R2

---

## Fase 1 — Tipos y Entidades

- [x] T10 — Crear `src/core/types/tenant.type.ts` con tipos `TTenantUserRole`, `TTenant`, `TTenantEntity`, `TTenantUser`, `TTenantUserEntity`.  
  Cubre: R1, R7, R8

- [x] T11 — Actualizar `src/core/types/index.ts` para exportar `tenant.type`.  
  Cubre: R1, R7, R8

- [x] T12 — Crear `src/core/entities/tenant.entity.ts` con clase `Tenant` y factory methods `fromJson()`, `fromEntity()`, `copyWith()`. Seguir patrón de `user.entity.ts`.  
  Cubre: R1, R17

- [x] T13 — Crear `src/core/entities/tenant-user.entity.ts` con clase `TenantUser` y factory methods `fromJson()`, `fromEntity()`.  
  Cubre: R8, R20

- [x] T14 — Actualizar `src/core/entities/index.ts` para exportar `tenant.entity` y `tenant-user.entity`.  
  Cubre: R1, R8

---

## Fase 2 — Repositorio e Interfaz

- [x] T15 — Crear `src/server/interfaces/tenant.interface.ts` con interfaz `ITenantRepository` que defina los métodos: `create`, `findById`, `findBySlug`, `createWithAdmin`, `addUser`, `listUsers`, `removeUser`.  
  Cubre: R17, R18, R19, R20, R21, R22, R23

- [x] T16 — Actualizar `src/server/interfaces/index.ts` para exportar `tenant.interface`.  
  Cubre: R17

- [x] T17 — Crear `src/server/repositories/tenant.repository.ts` con función `TenantRepository(client: PrismaClient)` que implemente `ITenantRepository`. Usar patrón funcional con `Logger`, `Result`, `to()` existentes. Implementar los métodos: `create`, `findById`, `findBySlug`.  
  Cubre: R17, R18, R19

- [x] T18 — Implementar en `tenant.repository.ts` los métodos `addUser`, `listUsers`, `removeUser`.  
  Cubre: R20, R21, R22

- [x] T19 — Implementar en `tenant.repository.ts` el método `createWithAdmin` usando `client.$transaction` que cree el tenant y asigne el usuario admin con rol `owner`.  
  Cubre: R23, R33

- [x] T20 — Actualizar `src/server/repositories/index.ts` para exportar `tenant.repository`.  
  Cubre: R17

- [x] T21 — Actualizar `src/server/providers/repository-injection.ts` para agregar `tenantRepository = TenantRepository(prismaDbClient)`.  
  Cubre: R17

---

## Fase 3 — Extensión de Cliente Prisma (Multitenancy)

- [x] T22 — Crear `src/config/database/prisma-tenant-client.ts` con función `createTenantClient(baseClient, tenantId)` que retorne un cliente Prisma extendido. La extensión debe interceptar `findMany`, `findFirst`, `count`, `create` en modelos `product`, `category` y `order` para inyectar `tenant_id`.  
  Cubre: R28, R29, R31

- [x] T23 — Verificar que `createTenantClient` NO modifica consultas en modelos sin `tenant_id` (User, Country, UserAddress).  
  Cubre: R31

- [x] T24 — Actualizar `src/config/database/prisma-client.ts` para re-exportar `createTenantClient`.  
  Cubre: R28

---

## Fase 4 — Adaptación de Repositorios Existentes

- [x] T25 — Modificar `src/server/interfaces/product.interface.ts`: agregar campo opcional `tenantId?: string` al tipo `TListProps`.  
  Cubre: R24, R25

- [x] T26 — Modificar `src/server/interfaces/order.interface.ts`: agregar parámetro opcional `tenantId?: string` a la firma de `listOrders`.  
  Cubre: R27

- [x] T27 — Modificar `src/server/interfaces/category.interface.ts`: agregar parámetro opcional `tenantId?: string` a la firma de `listCategories`.  
  Cubre: R26

- [x] T28 — Modificar `src/server/repositories/product.repository.ts`: en `listProducts`, agregar condición `where: { ...existingWhere, ...(tenantId ? { tenant_id: tenantId } : {}) }`. Hacer lo mismo en `countProducts`.  
  Cubre: R24, R25, R35

- [x] T29 — Modificar `src/server/repositories/category.repository.ts`: en `listCategories`, agregar condición de filtro `tenant_id` cuando se provea `tenantId`.  
  Cubre: R26, R35

- [x] T30 — Modificar `src/server/repositories/order.repository.ts`: en `listOrders`, agregar condición de filtro `tenant_id` cuando se provea `tenantId`. Eliminar los 4 comentarios `// TODO: add tenantId filter` existentes (líneas 10, 58, 139, 158).  
  Cubre: R27, R35

---

## Fase 5 — Tests

- [x] T31 — Crear `src/server/repositories/tenant.repository.test.ts` con tests para: `create` (R17.1–R17.3), `findById` con existente y no existente (R18.1–R18.3), `findBySlug` con existente y no existente (R19.1–R19.3). Usar mock de PrismaClient existente en `tests/mocks/prisma/`.  
  Cubre: R17, R18, R19, R40 (implícito)

- [x] T32 — Agregar tests en `tenant.repository.test.ts` para: `addUser` exitoso y constraint unique violado (R20.1–R20.3, R32), `listUsers` con datos y vacío (R21.1–R21.4), `removeUser` (R22.1–R22.3).  
  Cubre: R20, R21, R22, R32

- [x] T33 — Agregar test en `tenant.repository.test.ts` para: `createWithAdmin` con transacción exitosa y transacción fallida (R23.1–R23.3, R33).  
  Cubre: R23, R33

- [x] T34 — Crear `src/config/database/prisma-tenant-client.test.ts` con tests para: verificar que `createTenantClient` inyecta `tenant_id` en `product.findMany`, `category.findMany`, `order.findMany` (R28, R29). Verificar que no modifica consultas en modelos sin `tenant_id` (R31). Verificar que `tenantId` vacío/undefined no causa error (R34).  
  Cubre: R28, R29, R31, R34

- [x] T35 — Actualizar tests existentes de `product.repository.test.ts` para cubrir el escenario con `tenantId` en `listProducts` y `countProducts` (R24, R25).  
  Cubre: R24, R25

- [x] T36 — Actualizar tests existentes de `category.repository.test.ts` para cubrir el escenario con `tenantId` en `listCategories` (R26).  
  Cubre: R26

- [x] T37 — Actualizar tests existentes de `order.repository.test.ts` para cubrir el escenario con `tenantId` en `listOrders` (R27).  
  Cubre: R27

---

## Fase 6 — Verificación

- [x] T38 — Ejecutar `pnpm dlx prisma generate` y verificar que el cliente se genera sin errores.  
  Cubre: R1

- [ ] T39 — Ejecutar `pnpm dlx prisma migrate dev --name add_multitenancy` y verificar que la migración se aplica correctamente.  
  Cubre: R1, R2

- [x] T40 — Ejecutar `pnpm dlx jest --passWithNoTests` y verificar que todos los tests existentes + nuevos pasan en verde.  
  Cubre: Todos los R (verificación global)

- [x] T41 — Ejecutar `pnpm lint` y verificar que no se introducen errores de lint.  
  Cubre: Verificación de calidad

- [ ] T42 — Verificar que `pnpm build` completa sin errores (generación de tipos Prisma y build de Next.js).  
  Cubre: Verificación de integración

---

## Fase 7 — Cierre

- [x] T43 — Verificar que cada `R<n>` de `requirements.md` tiene al menos un test concreto mapeado. Documentar el mapa en `specs/progress/impl_DL_5_add_multitenancy_support.md`.  
  Cubre: C6 (CHECKPOINTS.md)
