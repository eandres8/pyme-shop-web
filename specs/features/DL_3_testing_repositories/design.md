# DL_3_testing_repositories — Design

> Decisiones técnicas para implementar los tests de repositorios.

---

## 1. Archivos a crear

| Archivo | Propósito | Cubre R |
|---------|-----------|---------|
| `tests/mocks/prisma/prisma-client-mock-factory.ts` | Fábrica que crea un objeto mock de PrismaClient con todos los métodos de modelo como `jest.fn()`. Cada modelo (user, product, order, category, country, productImage, userAddress, orderAddress, orderItem) expone: `create`, `findUnique`, `findMany`, `update`, `delete`, `count`, `findFirst`. También expone `$transaction` (dos sobrecargas: array de promesas y callback). | R2, R3, R38 |
| `tests/mocks/prisma/index.ts` | Barrel export que re-exporta `createPrismaClientMock` desde `prisma-client-mock-factory.ts`. | R5 |
| `src/server/repositories/user.repository.test.ts` | Tests para `UserRepository` (create, findByEmail, findByTenant, changeRole). | R9, R10, R11, R12, R40, R41 |
| `src/server/repositories/product.repository.test.ts` | Tests para `ProductRepository` (listProducts, countProducts, createMultiple, productBySlug, listProductsByIds, updateProductInfo). | R13–R20, R40, R42, R44 |
| `src/server/repositories/order.repository.test.ts` | Tests para `OrderRepository` (getById, trxNewOrder, listOrdersByUser, listOrders). | R21–R24, R40, R41, R42 |
| `src/server/repositories/category.repository.test.ts` | Tests para `CategoryRepository` (createCategories, listCategories). | R25, R26, R40, R42 |
| `src/server/repositories/country.repository.test.ts` | Tests para `CountryRepository` (createMultiple, list). | R27, R28, R40, R42 |
| `src/server/repositories/product-image.repository.test.ts` | Tests para `ProductImageRepository` (deleteImage). | R29, R40 |
| `src/server/repositories/user-address.repository.test.ts` | Tests para `UserAddressRepository` (findByUserId, create, update, remove). | R30–R33, R40 |
| `src/server/repositories/upload-files.repository.test.ts` | Tests para `UploadFilesRepository` (uploadImages, deleteImage) — mockea `cloudinary` directamente. | R34, R35, R39, R43 |
| `src/server/repositories/seed.repository.test.ts` | Tests para `SeedRepository` (resetTables). | R7, R36, R37, R40 |

## 2. Archivos a modificar

| Archivo | Cambio | Cubre R |
|---------|--------|---------|
| `tests/mocks/prisma-client-stub.ts` | Ninguno (se mantiene como stub para acciones existentes). Las nuevas pruebas de repositorio crean su propio mock vía la fábrica. | — |
| `src/server/providers/repository-injection.ts` | Ninguno (la inyección de dependencias ya existe desde DL_2). Las pruebas de repositorio no necesitan modificar la inyección porque llaman a la fábrica del repositorio directamente con un mock client. | — |

## 3. Estructura del PrismaClient mock

La fábrica `createPrismaClientMock` devuelve un objeto con esta forma:

```typescript
// tests/mocks/prisma/prisma-client-mock-factory.ts
import { jest } from '@jest/globals';

type DeepMockProxy<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? jest.Mock<(...args: A) => R>
    : DeepMockProxy<T[K]>;
};

export function createPrismaClientMock(overrides: Partial<ReturnType<typeof createPrismaClientMock>> = {}) {
  const mock = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    orderItem: {
      deleteMany: jest.fn(),
    },
    orderAddress: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    country: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    productImage: {
      create: jest.fn(),
      createMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    userAddress: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  // Merge overrides (deep merge for nested model overrides)
  Object.entries(overrides).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign((mock as Record<string, object>)[key], value);
    } else {
      (mock as Record<string, unknown>)[key] = value;
    }
  });

  return mock;
}
```

Los tests configuran el mock así:

```typescript
import { createPrismaClientMock } from '@/tests/mocks/prisma';
import { UserRepository } from './user.repository';

const mockClient = createPrismaClientMock();
const repo = UserRepository(mockClient as unknown as PrismaClient);

// Configurar resolución exitosa
mockClient.user.create.mockResolvedValue({ ... });

// Configurar error
mockClient.user.create.mockRejectedValue(new Error('DB error'));
```

## 4. Caso especial: UploadFilesRepository

`UploadFilesRepository()` **no recibe** `PrismaClient`. Usa `cloudinary` directamente.

- Los tests mockean el módulo `cloudinary` con `jest.mock('cloudinary', () => ({ v2: { uploader: { upload: jest.fn(), destroy: jest.fn() } } }))`.
- El test llama a `UploadFilesRepository()` sin argumentos y mockea `cloudinary.uploader.upload` y `cloudinary.uploader.destroy`.

```typescript
jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

import { UploadFilesRepository } from './upload-files.repository';
import { v2 as cloudinary } from 'cloudinary';

const mockedUpload = cloudinary.uploader.upload as jest.Mock;
```

## 5. Caso especial: ProductRepository.updateProductInfo (dependencia interna)

`ProductRepository` crea internamente `const uploadFiles = UploadFilesRepository()`. Para aislar el test de la subida de imágenes real:

- En los tests de `updateProductInfo` **sin imágenes**, pasar `images: []` — el código salta el bloque de subida.
- En los tests **con imágenes**, el `cloudinary` global está mockeado (ver sección 4), así que la instancia interna de `UploadFilesRepository` usará el mock.

## 6. Caso especial: SeedRepository

`SeedRepository(client)` **no implementa** ninguna interfaz del directorio `interfaces/`. Retorna directamente `{ resetTables }`.

- Los tests llaman a `SeedRepository(mockClient)` y verifican el comportamiento de `resetTables`.
- `resetTables` usa `.then().catch()` (no `await to()`) — el test debe mockear todas las llamadas `deleteMany` para que resuelvan exitosamente.

## 7. Alternativas descartadas

### Alternativa A: Usar `jest.mock` a nivel de módulo para PrismaClient en cada test file

Se descartó porque 9 archivos de test repetirían el mismo patrón de mock. La fábrica centralizada `createPrismaClientMock` en `tests/mocks/prisma/` es más mantenible: si un nuevo modelo se agrega a Prisma, se actualiza un solo archivo.

### Alternativa B: Ubicar los tests en `tests/repositories/` separados del source

Se descartó porque los tests de acciones ya están co-localizados (`src/server/actions/*.test.ts`), y la cobertura de Jest ya incluye `src/server/**/*.ts`. Mantener la misma conveniencia (co-localización) es menos sorpresivo para el implementer.

### Alternativa C: Mockear PrismaClient con `prisma-client-mock` (librería externa)

Se descartó para mantener el stack liviano. La fábrica manual con `jest.fn()` es suficiente para este proyecto; una librería externa agregaría complejidad y dependencia adicional.

## 8. Estrategia de pruebas por repositorio

Cada repositorio sigue la misma plantilla de test:

```
describe("<RepositoryName>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("method: success case", ...);   // cubre R<n>.1 y R<n>.2
  it("method: empty/null result", ...); // cubre R<n>.3 donde aplique
  it("method: prisma error", ...);     // cubre R<n>.4 y R40
  it("method: null argument propagates error", ...); // cubre R41
});
```

Los métodos que usan `$transaction` (createMultiple, trxNewOrder, updateProductInfo, createCategories, createMultiple de países) incluyen un test adicional para el caso de rollback/fallo de transacción (R42).

## 9. Consideración sobre los mocks existentes

Los mocks en `tests/mocks/repositories/` (creados en DL_2) mockean **los repositorios completos** y se usan para testear **acciones**. NO se usan para testear los repositorios mismos — los tests de repositorio llaman a las fábricas reales (ej. `UserRepository(mockClient)`) con un mock de PrismaClient.
