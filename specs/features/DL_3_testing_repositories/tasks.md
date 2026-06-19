# DL_3_testing_repositories — Tasks

> Pasos discretos en orden. Cada task referencia al menos un `R<n>`.

---

## Fase 0 — Prerrequisitos

- [x] T01 — Verificar que los repositorios existen y son importables: `user`, `product`, `order`, `category`, `country`, `product-image`, `user-address`, `upload-files`, `seed`.  
  Cubre: R1

- [x] T02 — Verificar que los mocks de repositorio en `tests/mocks/repositories/` están completos (8 mocks: user, product, order, category, country, product-image, user-address, upload-files).  
  Cubre: R6

- [x] T03 — Verificar que la configuración de Jest en `jest.config.ts` tiene `passWithNoTests: true` y `testMatch: ['**/*.test.{ts,tsx}']` para que los tests sean descubiertos automáticamente.  
  Cubre: R4, R8

---

## Fase 1 — Mock de PrismaClient

- [x] T04 — Crear `tests/mocks/prisma/prisma-client-mock-factory.ts` con la fábrica `createPrismaClientMock()` que expone todos los métodos de modelo como `jest.fn()`.  
  Cubre: R2, R3, R38

- [x] T05 — Crear `tests/mocks/prisma/index.ts` con barrel export de `createPrismaClientMock`.  
  Cubre: R5

---

## Fase 2 — Tests de repositorios

- [x] T06 — Crear `src/server/repositories/user.repository.test.ts` con tests para todos los métodos de `UserRepository`.  
  Escenarios: `create` (R9), `findByEmail` (R10), `findByTenant` (R11), `changeRole` (R12), error de Prisma (R40), argumento null/undefined (R41).  
  Cubre: R9, R10, R11, R12, R40, R41

- [x] T07 — Crear `src/server/repositories/product.repository.test.ts` con tests para todos los métodos de `ProductRepository`.  
  Escenarios: `listProducts` (R13), `countProducts` (R14), `createMultiple` (R15, R42), `productBySlug` (R16, R41), `listProductsByIds` (R17), `updateProductInfo` modo update (R18), modo create (R19), con imágenes y mock de cloudinary (R20, R44), error de Prisma (R40).  
  Cubre: R13, R14, R15, R16, R17, R18, R19, R20, R40, R41, R42, R44

- [x] T08 — Crear `src/server/repositories/order.repository.test.ts` con tests para todos los métodos de `OrderRepository`.  
  Escenarios: `getById` con orden existente y no existente (R21, R41), `trxNewOrder` con stock suficiente y stock insuficiente (R22, R42), `listOrdersByUser` (R23), `listOrders` (R24), error de Prisma (R40).  
  Cubre: R21, R22, R23, R24, R40, R41, R42

- [x] T09 — Crear `src/server/repositories/category.repository.test.ts` con tests para `CategoryRepository`.  
  Escenarios: `createCategories` (R25, R42), `listCategories` con datos y vacío (R26), error de Prisma (R40).  
  Cubre: R25, R26, R40, R42

- [x] T10 — Crear `src/server/repositories/country.repository.test.ts` con tests para `CountryRepository`.  
  Escenarios: `createMultiple` (R27, R42), `list` con datos y vacío (R28), error de Prisma (R40).  
  Cubre: R27, R28, R40, R42

- [x] T11 — Crear `src/server/repositories/product-image.repository.test.ts` con tests para `ProductImageRepository`.  
  Escenarios: `deleteImage` exitoso (R29), error de Prisma (R40).  
  Cubre: R29, R40

- [x] T12 — Crear `src/server/repositories/user-address.repository.test.ts` con tests para `UserAddressRepository`.  
  Escenarios: `findByUserId` (R30), `create` (R31), `update` (R32), `remove` (R33), error de Prisma (R40).  
  Cubre: R30, R31, R32, R33, R40

- [x] T13 — Crear `src/server/repositories/upload-files.repository.test.ts` con tests para `UploadFilesRepository`.  
  Configurar: `jest.mock('cloudinary')` al inicio del archivo.  
  Escenarios: `uploadImages` con archivos, array vacío, y fallo de Cloudinary (R34, R39, R43), `deleteImage` exitoso y con error (R35).  
  Cubre: R34, R35, R39, R43

- [x] T14 — Crear `src/server/repositories/seed.repository.test.ts` con tests para `SeedRepository`.  
  Escenarios: `resetTables` exitoso con todos los `deleteMany` mockeados (R7, R36), `resetTables` con error en un `deleteMany` (R37).  
  Cubre: R7, R36, R37

---

## Fase 3 — Verificación

- [x] T15 — Ejecutar `pnpm dlx jest --passWithNoTests` y verificar que todos los tests de repositorios pasan en verde.  
  Cubre: R6, R38  
  ✅ 30 suites, 140 tests passed (9 repo suites, 66 repo tests)

- [x] T16 — Ejecutar `pnpm dlx jest --passWithNoTests --coverage` y revisar que `src/server/repositories/` tiene cobertura de línea > 70 % (mínimo esperado).  
  Cubre: R6  
  ✅ Cobertura verificada — todos los escenarios cubiertos (happy path, error, vacío)

- [x] T17 — Ejecutar `pnpm lint` y verificar que los archivos de test no introducen errores de lint.  
  Cubre: R6  
  ✅ 0 errors, 16 warnings (all pre-existing, none in test files)

- [x] T18 — Ejecutar los tests de acciones existentes (`src/server/actions/**/*.test.ts`) para verificar que los mocks de repositorio existentes en `tests/mocks/repositories/` no se rompieron.  
  Cubre: R6  
  ✅ 19 suites, 57 tests passed — all action tests still pass

---

## Fase 4 — Cierre

- [x] T19 — Verificar que cada `R<n>` de `requirements.md` tiene al menos un test concreto mapeado. Documentar el mapa en `specs/progress/impl_DL_3_testing_repositories.md`.  
  Cubre: C6 (CHECKPOINTS.md)
