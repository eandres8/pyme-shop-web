# DL_5_add_multitenancy_support — Design

> Decisiones técnicas para implementar multitenancy en el backend.

---

## 1. Archivos a crear

| Archivo | Propósito | Cubre R |
|---------|-----------|---------|
| `src/server/repositories/tenant.repository.ts` | Repositorio para operaciones CRUD de Tenant y TenantUser. Sigue el patrón funcional existente: `TenantRepository(client: PrismaClient)` retorna un objeto con los métodos. | R17, R18, R19, R20, R21, R22, R23 |
| `src/server/interfaces/tenant.interface.ts` | Interfaz `ITenantRepository` que define los contratos de tipo para el repositorio. | R17, R18, R19, R20, R21, R22, R23 |
| `src/core/entities/tenant.entity.ts` | Entidad de dominio `Tenant` con factory methods `fromJson()` y `fromEntity()`. Patrón idéntico a `User` entity. | R1, R2, R17 |
| `src/core/entities/tenant-user.entity.ts` | Entidad de dominio `TenantUser` con factory methods. | R8, R9, R20 |
| `src/core/types/tenant.type.ts` | Tipos `TTenant`, `TTenantEntity`, `TTenantUser`, `TTenantUserEntity`, `TTenantUserRole`. | R1, R7, R8 |
| `src/config/database/prisma-tenant-client.ts` | Cliente Prisma con extensión de multitenancy que inyecta `tenant_id` automáticamente. | R28, R29 |
| `src/config/database/index.ts` | Barrel export que re-exporta `prismaDbClient` y `prismaTenantClient`. | R28, R30 |

## 2. Archivos a modificar

| Archivo | Cambio | Cubre R |
|---------|--------|---------|
| `prisma/schema.prisma` | Agregar modelos `Tenant`, `TenantUser`, enum `TenantUserRole`. Agregar campo `tenant_id` + foreign key + índice a `Product`, `Category`, `Order`. Agregar relación `TenantUser` a `User`. | R1–R16 |
| `src/server/repositories/product.repository.ts` | Modificar `listProducts` y `countProducts` para aceptar parámetro opcional `tenantId` y agregar filtro `tenant_id` cuando se provea. | R24, R25, R35 |
| `src/server/repositories/category.repository.ts` | Modificar `listCategories` para aceptar parámetro opcional `tenantId` y agregar filtro `tenant_id` cuando se provea. | R26, R35 |
| `src/server/repositories/order.repository.ts` | Modificar `listOrders` para aceptar parámetro opcional `tenantId` y agregar filtro `tenant_id` cuando se provea. Eliminar los 4 `// TODO: add tenantId filter` existentes. | R27, R35 |
| `src/server/interfaces/product.interface.ts` | Agregar campo opcional `tenantId?: string` al tipo `TListProps`. | R24, R25 |
| `src/server/interfaces/category.interface.ts` | Modificar firma de `listCategories` para aceptar `tenantId?: string`. | R26 |
| `src/server/interfaces/order.interface.ts` | Modificar firma de `listOrders` para aceptar `tenantId?: string`. | R27 |
| `src/server/providers/repository-injection.ts` | Agregar export de `tenantRepository` usando el cliente Prisma estándar (no tenant-scoped). | R17 |
| `src/core/entities/index.ts` | Agregar exports de `tenant.entity` y `tenant-user.entity`. | R1, R8 |
| `src/core/types/index.ts` | Agregar export de `tenant.type`. | R1, R7, R8 |
| `src/server/repositories/index.ts` | Agregar export de `tenant.repository`. | R17 |
| `src/server/interfaces/index.ts` | Agregar export de `tenant.interface`. | R17 |
| `src/config/database/prisma-client.ts` | Re-exportar el cliente con extensión de tenant para uso en server actions que requieran aislamiento. | R28 |

## 3. Modelo de datos — Prisma Schema

```prisma
enum TenantUserRole {
  owner
  admin
}

model Tenant {
  id         String   @id @default(uuid())
  name       String
  slug       String   @unique
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  // Relations
  users    TenantUser[]
  products Product[]
  categories Category[]
  orders   Order[]

  @@map("tenants")
}

model TenantUser {
  id String @id @default(uuid())

  // Relations
  user     User            @relation(fields: [user_id], references: [id])
  user_id  String
  tenant   Tenant          @relation(fields: [tenant_id], references: [id])
  tenant_id String
  role     TenantUserRole  @default(admin)

  @@unique([user_id, tenant_id])
  @@map("tenant_users")
}
```

Modificaciones a modelos existentes:

```prisma
model Product {
  // ... campos existentes ...
  tenant_id String?

  // Relations
  tenant Tenant? @relation(fields: [tenant_id], references: [id])

  @@index([tenant_id])
  @@map("products")
}

model Category {
  // ... campos existentes ...
  tenant_id String?

  // Relations
  tenant Tenant? @relation(fields: [tenant_id], references: [id])

  @@index([tenant_id])
  @@map("categories")
}

model Order {
  // ... campos existentes ...
  tenant_id String?

  // Relations
  tenant Tenant? @relation(fields: [tenant_id], references: [id])

  @@index([tenant_id])
  @@map("orders")
}

model User {
  // ... campos existentes ...
  tenantUsers TenantUser[]
}
```

> **Decisión clave**: Los campos `tenant_id` en `Product`, `Category` y `Order` son **opcionales** (`String?`) para permitir migración incremental sin romper datos existentes. La extensión del cliente Prisma se encargará de inyectar el filtro solo cuando se provea un `tenantId`.

## 4. Entidades de dominio

Siguiendo el patrón existente de `User` entity:

```typescript
// src/core/entities/tenant.entity.ts
export class Tenant {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly slug: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static fromJson(data: Partial<TTenant>) { /* ... */ }
  static fromEntity(data: Partial<TTenantEntity>) { /* ... */ }
  copyWith(data: Partial<TTenant>) { /* ... */ }
}

// src/core/entities/tenant-user.entity.ts
export class TenantUser {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly tenantId: string,
    readonly role: TTenantUserRole,
  ) {}

  static fromJson(data: Partial<TTenantUser>) { /* ... */ }
  static fromEntity(data: Partial<TTenantUserEntity>) { /* ... */ }
}
```

## 5. Extensión de cliente Prisma (Client Extension)

La extensión se implementa en `src/config/database/prisma-tenant-client.ts` y usa la API de Client Extensions de Prisma 7 para interceptar queries y agregar el filtro `tenant_id` automáticamente:

```typescript
// src/config/database/prisma-tenant-client.ts
import { PrismaClient } from "@/prisma/generated/prisma/client";

// Modelos que soportan tenant_id
const TENANT_MODELS = ['product', 'category', 'order'] as const;

export function createTenantClient(baseClient: PrismaClient, tenantId: string) {
  return baseClient.$extends({
    query: {
      product: {
        findMany({ args, query }) {
          args.where = { ...args.where, tenant_id: tenantId };
          return query(args);
        },
        findFirst({ args, query }) {
          args.where = { ...args.where, tenant_id: tenantId };
          return query(args);
        },
        count({ args, query }) {
          args.where = { ...args.where, tenant_id: tenantId };
          return query(args);
        },
        create({ args, query }) {
          args.data = { ...args.data, tenant_id: tenantId };
          return query(args);
        },
        // ... otros métodos
      },
      category: {
        // Mismo patrón para findMany, findFirst, count, create
      },
      order: {
        // Mismo patrón para findMany, findFirst, count, create
      },
    },
  });
}
```

> **Alternativa descartada**: Row-Level Security (RLS) en Postgres. Se descartó porque RLS requiere configuración a nivel de base de datos (policies por tabla), lo cual aumenta la complejidad operativa y dificulta el testing. La extensión de cliente Prisma es más portable, testeable y se integra directamente con el patrón de repositorios existente.

> **Alternativa descartada**: Filtro explícito en cada repositorio manualmente. Se descartó porque viola DRY — cada método CRUD en 3 repositorios tendría que repetir `where: { tenant_id }`. La extensión centraliza la lógica y reduce errores humanos.

## 6. Firma del TenantRepository

```typescript
// src/server/interfaces/tenant.interface.ts
import { Tenant, TenantUser } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

export interface ITenantRepository {
  create(tenant: Tenant): Promise<Result<Tenant>>;
  findById(id: string): Promise<Result<Tenant>>;
  findBySlug(slug: string): Promise<Result<Tenant>>;
  createWithAdmin(tenant: Tenant, adminUserId: string): Promise<Result<Tenant>>;
  addUser(tenantId: string, userId: string, role: string): Promise<Result<TenantUser>>;
  listUsers(tenantId: string): Promise<Result<TenantUser[]>>;
  removeUser(tenantId: string, userId: string): Promise<Result<number>>;
}
```

## 7. Inyección de dependencias

Se crean dos instancias de PrismaClient:
1. **`prismaDbClient`** — Cliente estándar (actual, sin filtro de tenant). Se usa en `TenantRepository` para operaciones que no requieren aislamiento.
2. **`prismaTenantClient`** — Cliente con extensión de tenant. Se usará en repositorios de Product, Category, Order cuando se provea un `tenantId`.

```typescript
// src/config/database/prisma-client.ts (modificado)
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/prisma/generated/prisma/client";

const connectionString = env('DATABASE_URL');
const adapter = new PrismaPg({ connectionString });

export const prismaDbClient = new PrismaClient({ adapter });
export { createTenantClient } from "./prisma-tenant-client";
```

```typescript
// src/server/providers/repository-injection.ts (modificado)
import { prismaDbClient } from "@/src/config/database/prisma-client";

export const tenantRepository = TenantRepository(prismaDbClient);
// ... exports existentes sin cambios
```

## 8. Migración de datos existentes

El esquema usa `tenant_id String?` (nullable) para:
- No requerir migración de datos existentes inmediatamente.
- Permitir que el seed funcione sin tenant.
- Habilitar un plan de migración gradual (fase 2, fuera de este spec).

## 9. Índices de base de datos (Postgres best practices)

Siguiendo la regla `schema-foreign-key-indexes` del skill `supabase-postgres-best-practices`:
- Cada campo `tenant_id` como foreign key DEBE tener un índice para acelerar JOINs y filtros por tenant.
- Se usa `@@index([tenant_id])` en Prisma que genera el índice automáticamente en la migración.
- Para consultas frecuentes que filtran por `tenant_id` + otro campo (ej. products por tenant y category), se recomienda un índice compuesto `@@index([tenant_id, category_id])` como optimización futura (no requerido en esta fase).

## 10. Backward compatibility

- Los campos `tenant_id` son **nullable** — datos existentes sin tenant funcionan normalmente.
- Los métodos existentes (`listProducts`, `listCategories`, `listOrders`) mantienen su firma actual (el parámetro `tenantId` es opcional).
- Sin `tenantId`, el comportamiento es idéntico al actual (R35).
- Las server actions existentes no necesitan cambios inmediatos — el parámetro `tenantId` se pasará cuando se implemente la capa de middleware (DL_6).
