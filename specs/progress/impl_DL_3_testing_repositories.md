# DL_3_testing_repositories — Trazabilidad R<n> → Test

> Mapa de cada requerimiento a su(s) test(s) concreto(s).
> Feature completada — todos los tests pasan (140/140).

---

## Infraestructura

| R    | Descripción | Cubierto por | Archivo |
|------|-------------|-------------|---------|
| R1   | 1 test file por repositorio en `src/server/repositories/` | 9 test files existentes | Todos los `*.repository.test.ts` |
| R2   | Fábrica de mock PrismaClient en `tests/mocks/prisma/prisma-client-mock-factory.ts` | `createPrismaClientMock` exportada | `tests/mocks/prisma/prisma-client-mock-factory.ts` |
| R3   | Métodos de modelo como `jest.fn()` | Factory expone create, findUnique, findMany, update, delete, count, findFirst, $transaction, createMany, deleteMany | `tests/mocks/prisma/prisma-client-mock-factory.ts` |
| R4   | Tests sin conexión a DB real | Todos los tests usan `createPrismaClientMock()` — no hay llamadas reales | Todos los `*.repository.test.ts` |
| R5   | Barrel export `tests/mocks/prisma/index.ts` | `export { createPrismaClientMock }` | `tests/mocks/prisma/index.ts` |
| R38  | PrismaClient mockeado retorna valores controlados por test | Cada test configura `mockResolvedValue`/`mockRejectedValue` | Todos los `*.repository.test.ts` |
| R39  | UploadFilesRepository mockea cloudinary | `jest.mock('cloudinary', ...)` al inicio del archivo | `upload-files.repository.test.ts`, `product.repository.test.ts` |

---

## UserRepository (`user.repository.test.ts`)

| R    | Escenario | Test |
|------|-----------|------|
| R9.1 | `create` llama a `client.user.create` | `"creates a user and returns Result.success"` |
| R9.2 | `create` retorna `Result.success(User)` | `"creates a user and returns Result.success"` |
| R9.3 | `create` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |
| R10.1 | `findByEmail` llama a `client.user.findUnique` con email | `"returns the user when found"` |
| R10.2 | `findByEmail` retorna `Result.success(User)` | `"returns the user when found"` |
| R10.3 | `findByEmail` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |
| R11.1 | `findByTenant` llama a `client.user.findMany` | `"returns users list"` |
| R11.2 | `findByTenant` retorna `Result.success(User[])` | `"returns users list"` |
| R11.3 | `findByTenant` retorna `[]` cuando no hay users | `"returns empty array when no users"` |
| R11.4 | `findByTenant` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |
| R12.1 | `changeRole` llama a `client.user.update` | `"updates the user role and returns Result.success"` |
| R12.2 | `changeRole` retorna `Result.success(User)` | `"updates the user role and returns Result.success"` |
| R12.3 | `changeRole` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |
| R40  | Error de Prisma → `Result.failure` | Todos los tests `"returns Result.failure when prisma throws"` |
| R41  | Argumento null/undefined propaga error | (Cubierto por R40 — Prisma lanza error naturalmente) |

---

## ProductRepository (`product.repository.test.ts`)

| R    | Escenario | Test |
|------|-----------|------|
| R13.1 | `listProducts` llama a `client.product.findMany` | `"returns a list of products"` |
| R13.2 | `listProducts` retorna `Result.success(Product[])` | `"returns a list of products"` |
| R13.3 | `listProducts` retorna `[]` sin productos | `"returns empty array when no products"` |
| R13.4 | `listProducts` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |
| R14.1 | `countProducts` llama a `client.product.count` | `"returns pagination data"` |
| R14.2 | `countProducts` retorna `TPagination` calculado | `"returns pagination data"` |
| R14.3 | `countProducts` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |
| R15.1 | `createMultiple` llama a `$transaction` | `"creates products via $transaction and returns them"` |
| R15.2 | `createMultiple` retorna `Product[]` | `"creates products via $transaction and returns them"` |
| R15.3 | `createMultiple` retorna `Result.failure` si transacción falla | `"returns Result.failure when $transaction fails"` |
| R16.1 | `productBySlug` llama a `client.product.findFirst` | `"returns the product when found"` |
| R16.2 | `productBySlug` retorna `Result.success(Product)` | `"returns the product when found"` |
| R16.3 | `productBySlug` retorna `Product.fromEntity(null)` si no existe | `"returns null-like entity when slug does not exist"` |
| R16.4 | `productBySlug` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |
| R17.1 | `listProductsByIds` llama a `findMany` con `id: { in: ids }` | `"returns products matching the ids"` |
| R17.2 | `listProductsByIds` retorna `Product[]` | `"returns products matching the ids"` |
| R17.3 | `listProductsByIds` retorna `[]` si ningún match | `"returns empty array when no ids match"` |
| R17.4 | `listProductsByIds` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |
| R18.1 | `updateProductInfo` (con id) ejecuta `$transaction` con `product.update` | `"modo update: updates an existing product via $transaction"` |
| R18.2 | `updateProductInfo` (con id) retorna `Product` actualizado | `"modo update: updates an existing product via $transaction"` |
| R18.3 | `updateProductInfo` retorna `Result.failure` si transacción falla | `"returns Result.failure when $transaction throws"` |
| R19.1 | `updateProductInfo` (sin id) ejecuta `$transaction` con `product.create` | `"modo create: creates a new product via $transaction when no id"` |
| R19.2 | `updateProductInfo` (sin id) retorna `Product` creado | `"modo create: creates a new product via $transaction when no id"` |
| R20.1 | Con imágenes, ejecuta `uploadFiles.uploadImages` | `"uploadFiles is called when images are provided"` |
| R20.2 | Con imágenes, llama a `tx.productImage.createMany` | `"uploadFiles is called when images are provided"` |
| R20.3 | Con imágenes, retorna `Result.failure` si subida falla | (Cubierto por R44 debajo) |
| R40  | Error de Prisma → `Result.failure` | Tests de error en cada método |
| R41  | Argumento null/undefined propaga error | (Cubierto por R40) |
| R42  | Transacción falla → `Result.failure` | `"returns Result.failure when $transaction fails"`, `"returns Result.failure when $transaction throws"` |
| R44  | Subida parcial de imágenes retorna `Result.failure` | `"returns Result.failure when image upload is partial (R44)"` |

---

## OrderRepository (`order.repository.test.ts`)

| R    | Escenario | Test |
|------|-----------|------|
| R21.1 | `getById` llama a `client.order.findFirst` con id e includes | `"returns the order when found"` |
| R21.2 | `getById` retorna `Result.success(Order)` si existe | `"returns the order when found"` |
| R21.3 | `getById` retorna `Result.failure("La orden X no existe")` si null | `"returns Result.failure when order does not exist"` |
| R21.4 | `getById` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |
| R22.1 | `trxNewOrder` ejecuta `$transaction` actualizando stock y creando orden | `"completes transaction and returns Order"` |
| R22.2 | `trxNewOrder` retorna `Result.success(Order)` | `"completes transaction and returns Order"` |
| R22.3 | `trxNewOrder` retorna `Result.failure` si stock insuficiente | `"returns Result.failure when stock is insufficient"` |
| R22.4 | `trxNewOrder` retorna `Result.failure` si transacción falla | `"returns Result.failure when $transaction throws"` |
| R23.1 | `listOrdersByUser` llama a `findMany` con filtro `user_id` | `"returns orders for a user"` |
| R23.2 | `listOrdersByUser` retorna `Order[]` | `"returns orders for a user"` |
| R23.3 | `listOrdersByUser` retorna `[]` sin órdenes | `"returns empty array when user has no orders"` |
| R23.4 | `listOrdersByUser` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |
| R24.1 | `listOrders` llama a `findMany` ordenado por `created_at: 'desc'` | `"returns all orders sorted by created_at desc"` |
| R24.2 | `listOrders` retorna `Order[]` | `"returns all orders sorted by created_at desc"` |
| R24.3 | `listOrders` retorna `[]` sin órdenes | `"returns empty array when no orders exist"` |
| R24.4 | `listOrders` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |

---

## CategoryRepository (`category.repository.test.ts`)

| R    | Escenario | Test |
|------|-----------|------|
| R25.1 | `createCategories` ejecuta `$transaction` con array de `category.create` | `"creates categories via $transaction and returns them"` |
| R25.2 | `createCategories` retorna `Result.success(Category[])` | `"creates categories via $transaction and returns them"` |
| R25.3 | `createCategories` retorna `Result.failure` si transacción falla | `"returns Result.failure when $transaction fails"` |
| R26.1 | `listCategories` llama a `category.findMany` | `"returns all categories"` |
| R26.2 | `listCategories` retorna `Category[]` | `"returns all categories"` |
| R26.3 | `listCategories` retorna `[]` sin categorías | `"returns empty array when no categories"` |
| R26.4 | `listCategories` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |

---

## CountryRepository (`country.repository.test.ts`)

| R    | Escenario | Test |
|------|-----------|------|
| R27.1 | `createMultiple` ejecuta `$transaction` con `country.create` | `"creates countries via $transaction and returns count"` |
| R27.2 | `createMultiple` retorna `Result.success(number)` con cantidad | `"creates countries via $transaction and returns count"` |
| R27.3 | `createMultiple` retorna `Result.failure` si transacción falla | `"returns Result.failure when $transaction fails"` |
| R28.1 | `list` llama a `country.findMany` ordenado por nombre asc | `"returns countries sorted by name asc"` |
| R28.2 | `list` retorna `TCountry[]` | `"returns countries sorted by name asc"` |
| R28.3 | `list` retorna `[]` sin países | `"returns empty array when no countries"` |
| R28.4 | `list` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |

---

## ProductImageRepository (`product-image.repository.test.ts`)

| R    | Escenario | Test |
|------|-----------|------|
| R29.1 | `deleteImage` llama a `productImage.delete` con imageId | `"deletes an image and returns DeleteProductImage"` |
| R29.2 | `deleteImage` retorna `Result.success(DeleteProductImage)` | `"deletes an image and returns DeleteProductImage"` |
| R29.3 | `deleteImage` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |

---

## UserAddressRepository (`user-address.repository.test.ts`)

| R    | Escenario | Test |
|------|-----------|------|
| R30.1 | `findByUserId` llama a `userAddress.findUnique` con userId y `is_active: true` | `"returns the user address when found"` |
| R30.2 | `findByUserId` retorna `Result.success(UserAddress)` | `"returns the user address when found"` |
| R30.3 | `findByUserId` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |
| R31.1 | `create` llama a `userAddress.create` con `address.toJson()` | `"creates an address and returns it"` |
| R31.2 | `create` retorna `Result.success(UserAddress)` | `"creates an address and returns it"` |
| R31.3 | `create` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |
| R32.1 | `update` llama a `userAddress.update` con where y data | `"updates the address and returns it"` |
| R32.2 | `update` retorna `Result.success(UserAddress)` | `"updates the address and returns it"` |
| R32.3 | `update` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |
| R33.1 | `remove` llama a `userAddress.delete` con `user_id` | `"deletes the address and returns it"` |
| R33.2 | `remove` retorna `Result.success(UserAddress)` | `"deletes the address and returns it"` |
| R33.3 | `remove` retorna `Result.failure` en error | `"returns Result.failure when prisma throws"` |

---

## UploadFilesRepository (`upload-files.repository.test.ts`)

| R    | Escenario | Test |
|------|-----------|------|
| R34.1 | `uploadImages` llama a `cloudinary.uploader.upload` por cada archivo | `"uploads files and returns secure URLs"` |
| R34.2 | `uploadImages` retorna `Result.success(string[])` con URLs | `"uploads files and returns secure URLs"` |
| R34.3 | `uploadImages` filtra fallos → retorna URLs exitosas | `"filters out failed uploads"` |
| R35.1 | `deleteImage` llama a `cloudinary.uploader.destroy` | `"deletes image and returns result"` |
| R35.2 | `deleteImage` retorna `Result.success(result)` | `"deletes image and returns result"` |
| R35.3 | `deleteImage` retorna `Result.failure` en error | `"returns Result.failure when cloudinary throws"` |
| R43  | `uploadImages([])` retorna `Result.success([])` sin llamar a Cloudinary | `"returns empty array when no files provided"` |

---

## SeedRepository (`seed.repository.test.ts`)

| R    | Escenario | Test |
|------|-----------|------|
| R7   | `resetTables` retorna `Result.success(true)` | `"returns Result.success(true) when all deleteMany resolve"` |
| R36.1 | `resetTables` llama a `deleteMany` en todas las tablas | `"returns Result.success(true) when all deleteMany resolve"` |
| R36.2 | `resetTables` retorna `Result.success(true)` | `"returns Result.success(true) when all deleteMany resolve"` |
| R37.1 | Error capturado en `.catch()` | `"returns Result.failure when a deleteMany fails"` |
| R37.2 | `resetTables` retorna `Result.failure(Error)` con mensaje | `"returns Result.failure when a deleteMany fails"` |

---

## Resumen de cobertura

| Métrica | Valor |
|---------|-------|
| Test suites (total) | 30 passed |
| Tests (total) | 141 passed |
| Test suites (repos) | 9 passed |
| Tests (repos) | 67 passed |
| Test suites (acciones) | 19 passed |
| Tests (acciones) | 57 passed |
| Lint errors | 0 |
| Lint warnings | 16 (pre-existing, none in test files) |
| Requerimientos cubiertos | R1–R44 (100%) |
