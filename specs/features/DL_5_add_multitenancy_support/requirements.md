# DL_5_add_multitenancy_support — Requirements

> Formato EARS estricto. Cada `R<n>` es verificable por al menos un test concreto.

---

## Ubiquitous

### R1
El sistema DEBE tener un modelo `Tenant` en el esquema Prisma con campos `id` (UUID), `name` (String), `slug` (String, unique), `created_at` (DateTime) y `updated_at` (DateTime).

### R2
El modelo `Tenant` DEBE mapearse a la tabla `tenants` en la base de datos usando `@@map("tenants")`.

### R3
El modelo `Tenant` DEBE tener una relación one-to-many con el modelo `TenantUser` mediante el campo `users`.

### R4
El modelo `Tenant` DEBE tener una relación one-to-many con el modelo `Product` mediante el campo `products`, donde `Product` tiene un campo `tenant_id` como foreign key.

### R5
El modelo `Tenant` DEBE tener una relación one-to-many con el modelo `Category` mediante el campo `categories`, donde `Category` tiene un campo `tenant_id` como foreign key.

### R6
El modelo `Tenant` DEBE tener una relación one-to-many con el modelo `Order` mediante el campo `orders`, donde `Order` tiene un campo `tenant_id` como foreign key.

### R7
El sistema DEBE tener un enum `TenantUserRole` con valores `owner` y `admin` para definir los roles de usuario dentro de un tenant.

### R8
El sistema DEBE tener un modelo `TenantUser` en el esquema Prisma con campos `id` (UUID), `user_id` (String, foreign key a `User`), `tenant_id` (String, foreign key a `Tenant`) y `role` (TenantUserRole, default `admin`).

### R9
El modelo `TenantUser` DEBE mapearse a la tabla `tenant_users` en la base de datos usando `@@map("tenant_users")`.

### R10
El modelo `TenantUser` DEBE tener una relación many-to-one con el modelo `User` mediante el campo `user`.

### R11
El modelo `TenantUser` DEBE tener una relación many-to-one con el modelo `Tenant` mediante el campo `tenant`.

### R12
El modelo `TenantUser` DEBE tener un constraint único compuesto en `(user_id, tenant_id)` para evitar duplicados.

### R13
El modelo `User` DEBE tener una relación one-to-many con el modelo `TenantUser` mediante el campo `tenantUsers`.

### R14
El modelo `Product` DEBE tener un campo `tenant_id` (String, foreign key a `Tenant`) con un índice compuesto `@@index([tenant_id])` para optimizar consultas por tenant.

### R15
El modelo `Category` DEBE tener un campo `tenant_id` (String, foreign key a `Tenant`) con un índice compuesto `@@index([tenant_id])` para optimizar consultas por tenant.

### R16
El modelo `Order` DEBE tener un campo `tenant_id` (String, foreign key a `Tenant`) con un índice compuesto `@@index([tenant_id])` para optimizar consultas por tenant.

---

## Event-driven (CUANDO … ENTONCES …)

### R17 — TenantRepository.create
CUANDO el sistema invoca `TenantRepository.create(tenant)` con un objeto `Tenant` válido ENTONCES el sistema DEBE:
- R17.1 — llamar a `client.tenant.create` con los datos del tenant.
- R17.2 — retornar `Result.success(Tenant)` si Prisma responde exitosamente.
- R17.3 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R18 — TenantRepository.findById
CUANDO el sistema invoca `TenantRepository.findById(id)` con un `id` válido ENTONCES el sistema DEBE:
- R18.1 — llamar a `client.tenant.findUnique` con el `id`.
- R18.2 — retornar `Result.success(Tenant)` si el tenant existe.
- R18.3 — retornar `Result.failure(Error)` si el tenant no existe o Prisma lanza un error.

### R19 — TenantRepository.findBySlug
CUANDO el sistema invoca `TenantRepository.findBySlug(slug)` con un `slug` válido ENTONCES el sistema DEBE:
- R19.1 — llamar a `client.tenant.findUnique` con el `slug`.
- R19.2 — retornar `Result.success(Tenant)` si el tenant existe.
- R19.3 — retornar `Result.failure(Error)` si el tenant no existe o Prisma lanza un error.

### R20 — TenantRepository.addUser
CUANDO el sistema invoca `TenantRepository.addUser(tenantId, userId, role)` con parámetros válidos ENTONCES el sistema DEBE:
- R20.1 — llamar a `client.tenantUser.create` con `tenant_id`, `user_id` y `role`.
- R20.2 — retornar `Result.success(TenantUser)` si la creación es exitosa.
- R20.3 — retornar `Result.failure(Error)` si Prisma lanza un error (incluyendo constraint unique violado).

### R21 — TenantRepository.listUsers
CUANDO el sistema invoca `TenantRepository.listUsers(tenantId)` con un `tenantId` válido ENTONCES el sistema DEBE:
- R21.1 — llamar a `client.tenantUser.findMany` con filtro `tenant_id` e include del modelo `User`.
- R21.2 — retornar `Result.success(TenantUser[])` con los usuarios del tenant.
- R21.3 — retornar `Result.success([])` si el tenant no tiene usuarios.
- R21.4 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R22 — TenantRepository.removeUser
CUANDO el sistema invoca `TenantRepository.removeUser(tenantId, userId)` con parámetros válidos ENTONCES el sistema DEBE:
- R22.1 — llamar a `client.tenantUser.deleteMany` con filtro compuesto `tenant_id` y `user_id`.
- R22.2 — retornar `Result.success(number)` con la cantidad de registros eliminados.
- R22.3 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R23 — Creación de tenant con admin (operación compuesta)
CUANDO el sistema invoca `TenantRepository.createWithAdmin(tenant, adminUserId)` con un `Tenant` y un `adminUserId` válidos ENTONCES el sistema DEBE:
- R23.1 — ejecutar una transacción `$transaction` que cree el tenant y luego asigne el usuario admin con rol `owner`.
- R23.2 — retornar `Result.success(Tenant)` si la transacción completa exitosamente.
- R23.3 — retornar `Result.failure(Error)` si la transacción falla.

### R24 — ProductRepository.listProducts con tenantId
CUANDO el sistema invoca `ProductRepository.listProducts({ page, take, category, tenantId })` con un `tenantId` válido ENTONCES el sistema DEBE:
- R24.1 — incluir el filtro `tenant_id` en la consulta `client.product.findMany`.
- R24.2 — retornar solo los productos que pertenezcan al tenant especificado.

### R25 — ProductRepository.countProducts con tenantId
CUANDO el sistema invoca `ProductRepository.countProducts({ page, take, category, tenantId })` con un `tenantId` válido ENTONCES el sistema DEBE:
- R25.1 — incluir el filtro `tenant_id` en la consulta `client.product.count`.
- R25.2 — retornar el conteo solo de los productos del tenant especificado.

### R26 — CategoryRepository.listCategories con tenantId
CUANDO el sistema invoca `CategoryRepository.listCategories(tenantId)` con un `tenantId` válido ENTONCES el sistema DEBE:
- R26.1 — incluir el filtro `tenant_id` en la consulta `client.category.findMany`.
- R26.2 — retornar solo las categorías del tenant especificado.

### R27 — OrderRepository.listOrders con tenantId
CUANDO el sistema invoca `OrderRepository.listOrders(tenantId)` con un `tenantId` válido ENTONCES el sistema DEBE:
- R27.1 — incluir el filtro `tenant_id` en la consulta `client.order.findMany`.
- R27.2 — retornar solo las órdenes del tenant especificado.

---

## State-driven (MIENTRAS …)

### R28
MIENTRAS el cliente Prisma con la extensión de multitenancy está activo, cada consulta `findMany`, `findFirst`, `findFirstOrThrow`, `findUnique`, `findUniqueOrThrow`, `count`, `update`, `updateMany`, `delete`, `deleteMany`, `create` y `createMany` DEBE incluir automáticamente el filtro `tenant_id` cuando el modelo afectado tenga el campo `tenant_id` definido.

### R29
MIENTRAS el cliente Prisma con la extensión de multitenancy está activo, la extensión DEBE interceptar el método `$transaction` y propagar el `tenant_id` a las consultas internas que operen sobre modelos con `tenant_id`.

### R30
MIENTRAS un repositorio utiliza el cliente Prisma original (sin extensión), las consultas DEBEN funcionar sin filtro de tenant para compatibilidad con operaciones que no requieren aislamiento (ej. seed, consultas globales de admin).

---

## Unwanted behavior (SI … ENTONCES …)

### R31
SI el cliente Prisma con extensión de multitenancy recibe una consulta sobre un modelo que NO tiene `tenant_id` (ej. `User`, `Country`, `UserAddress`) ENTONCES la extensión DEBE permitir la consulta pasar sin modificarla.

### R32
SI se intenta crear un `TenantUser` con un `(user_id, tenant_id)` que ya existe ENTONCES el sistema DEBE retornar `Result.failure(Error)` con un mensaje descriptivo de la violación de constraint unique.

### R33
SI el `TenantRepository.createWithAdmin` falla al crear el tenant pero ya se insertó el `TenantUser` ENTONCES la transacción DEBE hacer rollback automático (Propiedad ACID de `$transaction`).

### R34
SI se realiza una consulta con `tenantId` vacío o `undefined` sobre un modelo con `tenant_id` ENTONCES la extensión DEBE lanzar un error o ignorar el filtro (no retornar datos de todos los tenants).

### R35
SI un repositorio existente (OrderRepository, ProductRepository, CategoryRepository) es llamado sin `tenantId` ENTONCES el comportamiento DEBE mantenerse igual al actual (sin filtro de tenant) para no romper funcionalidad existente.
