# DL_3_testing_repositories — Requirements

> Formato EARS estricto. Cada `R<n>` es verificable por al menos un test concreto.

---

## Ubiquitous

### R1
El sistema DEBE tener un archivo de test por cada repositorio ubicado en `src/server/repositories/`.

### R2
El sistema DEBE tener una fábrica de mock de PrismaClient en `tests/mocks/prisma/prisma-client-mock-factory.ts` que exponga como `jest.fn()` todos los métodos de modelo usados por los repositorios.

### R3
El sistema DEBE mockear los métodos de modelo de PrismaClient (create, findUnique, findMany, update, delete, count, $transaction, createMany) como `jest.fn()` para que cada test pueda controlar su resolución y rechazo.

### R4
El sistema DEBE ejecutar los tests de repositorios sin conexión a base de datos real (todo el tráfico a PrismaClient debe estar mockeado).

### R5
El sistema DEBE tener un barrel export (`index.ts`) que exponga la fábrica de mock de PrismaClient desde `tests/mocks/prisma/`.

### R6
Cada repositorio DEBE ser testeado con los siguientes escenarios:
- R6.1 — Camino feliz (datos retornados correctamente, entidad mapeada via `fromEntity`/`fromJson`).
- R6.2 — Error desde Prisma (Prisma rechaza la promesa, repositorio retorna `Result.failure`).
- R6.3 — Resultados vacíos (findMany retorna `[]`, findUnique retorna `null`, count retorna `0`).

### R7
El sistema DEBE verificar que el método `resetTables` de `SeedRepository` retorna `Result.success(true)` cuando todas las operaciones `deleteMany` se resuelven correctamente.

### R8
El sistema DEBE usar `jest.mock()` para sustituir `@/src/config/database/prisma-client` y el import directo de `@/prisma/generated/prisma/client` donde sea necesario.

---

## Event-driven (CUANDO … ENTONCES …)

### R9 — UserRepository.create
CUANDO el test invoca `UserRepository(client).create(user)` ENTONCES el sistema DEBE:
- R9.1 — llamar a `client.user.create` con los datos del usuario.
- R9.2 — retornar `Result.success(User)` si Prisma responde exitosamente.
- R9.3 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R10 — UserRepository.findByEmail
CUANDO el test invoca `UserRepository(client).findByEmail(email)` ENTONCES el sistema DEBE:
- R10.1 — llamar a `client.user.findUnique` con el email.
- R10.2 — retornar `Result.success(User)` si el usuario existe.
- R10.3 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R11 — UserRepository.findByTenant
CUANDO el test invoca `UserRepository(client).findByTenant(tenant)` ENTONCES el sistema DEBE:
- R11.1 — llamar a `client.user.findMany`.
- R11.2 — retornar `Result.success(User[])` con los usuarios encontrados.
- R11.3 — retornar `Result.success([])` si no hay usuarios.
- R11.4 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R12 — UserRepository.changeRole
CUANDO el test invoca `UserRepository(client).changeRole(userId, role)` ENTONCES el sistema DEBE:
- R12.1 — llamar a `client.user.update` con userId y el nuevo role.
- R12.2 — retornar `Result.success(User)` actualizado.
- R12.3 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R13 — ProductRepository.listProducts
CUANDO el test invoca `ProductRepository(client).listProducts({ page, take, category })` ENTONCES el sistema DEBE:
- R13.1 — llamar a `client.product.findMany` con los parámetros de paginación y filtro.
- R13.2 — retornar `Result.success(Product[])`.
- R13.3 — retornar `Result.success([])` si no hay productos.
- R13.4 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R14 — ProductRepository.countProducts
CUANDO el test invoca `ProductRepository(client).countProducts({ page, take, category })` ENTONCES el sistema DEBE:
- R14.1 — llamar a `client.product.count` con el filtro de categoría.
- R14.2 — retornar `Result.success(TPagination)` con `currentPage` y `totalPages` calculados.
- R14.3 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R15 — ProductRepository.createMultiple
CUANDO el test invoca `ProductRepository(client).createMultiple(products)` ENTONCES el sistema DEBE:
- R15.1 — llamar a `client.$transaction` con un array de operaciones `product.create`.
- R15.2 — retornar `Result.success(Product[])`.
- R15.3 — retornar `Result.failure(Error)` si la transacción falla.

### R16 — ProductRepository.productBySlug
CUANDO el test invoca `ProductRepository(client).productBySlug(slug)` ENTONCES el sistema DEBE:
- R16.1 — llamar a `client.product.findFirst` con el slug y la inclusión de `productImages`.
- R16.2 — retornar `Result.success(Product)` si el producto existe.
- R16.3 — retornar `Result.success(Product.fromEntity(null))` si el slug no existe.
- R16.4 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R17 — ProductRepository.listProductsByIds
CUANDO el test invoca `ProductRepository(client).listProductsByIds(ids)` ENTONCES el sistema DEBE:
- R17.1 — llamar a `client.product.findMany` con filtro `id: { in: ids }`.
- R17.2 — retornar `Result.success(Product[])`.
- R17.3 — retornar `Result.success([])` si ningún id coincide.
- R17.4 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R18 — ProductRepository.updateProductInfo (modo update con id)
CUANDO el test invoca `ProductRepository(client).updateProductInfo(productWithId, [])` ENTONCES el sistema DEBE:
- R18.1 — llamar a `client.$transaction` con un callback que ejecuta `client.product.update`.
- R18.2 — retornar `Result.success(Product)` actualizado.
- R18.3 — retornar `Result.failure(Error)` si la transacción falla.

### R19 — ProductRepository.updateProductInfo (modo create sin id)
CUANDO el test invoca `ProductRepository(client).updateProductInfo(productWithoutId, [])` ENTONCES el sistema DEBE:
- R19.1 — llamar a `client.$transaction` con un callback que ejecuta `client.product.create`.
- R19.2 — retornar `Result.success(Product)` creado.

### R20 — ProductRepository.updateProductInfo con imágenes
CUANDO el test invoca `ProductRepository(client).updateProductInfo(product, images)` con `images.length > 0` ENTONCES el sistema DEBE:
- R20.1 — ejecutar `uploadFiles.uploadImages(images)`.
- R20.2 — llamar a `tx.productImage.createMany` con las URLs retornadas.
- R20.3 — retornar `Result.failure(Error)` si la subida de imágenes falla.

### R21 — OrderRepository.getById
CUANDO el test invoca `OrderRepository(client).getById(id)` ENTONCES el sistema DEBE:
- R21.1 — llamar a `client.order.findFirst` con el id e includes.
- R21.2 — retornar `Result.success(Order)` si la orden existe.
- R21.3 — retornar `Result.failure(Error("La orden ${id} no existe"))` si `data` es null.
- R21.4 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R22 — OrderRepository.trxNewOrder
CUANDO el test invoca `OrderRepository(client).trxNewOrder(payload)` ENTONCES el sistema DEBE:
- R22.1 — ejecutar `client.$transaction` con un callback que actualiza stock y crea orden/dirección.
- R22.2 — retornar `Result.success(Order)` si la transacción completa.
- R22.3 — retornar `Result.failure(Error)` si algún producto tiene stock insuficiente (`in_stock < 0`).
- R22.4 — retornar `Result.failure(Error)` si la transacción lanza un error.

### R23 — OrderRepository.listOrdersByUser
CUANDO el test invoca `OrderRepository(client).listOrdersByUser(userId)` ENTONCES el sistema DEBE:
- R23.1 — llamar a `client.order.findMany` con filtro `user_id`.
- R23.2 — retornar `Result.success(Order[])`.
- R23.3 — retornar `Result.success([])` si el usuario no tiene órdenes.
- R23.4 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R24 — OrderRepository.listOrders
CUANDO el test invoca `OrderRepository(client).listOrders()` ENTONCES el sistema DEBE:
- R24.1 — llamar a `client.order.findMany` sin filtro, ordenado por `created_at: 'desc'`.
- R24.2 — retornar `Result.success(Order[])`.
- R24.3 — retornar `Result.success([])` si no hay órdenes.
- R24.4 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R25 — CategoryRepository.createCategories
CUANDO el test invoca `CategoryRepository(client).createCategories(names)` ENTONCES el sistema DEBE:
- R25.1 — ejecutar `client.$transaction` con un array de `category.create`.
- R25.2 — retornar `Result.success(Category[])`.
- R25.3 — retornar `Result.failure(Error)` si la transacción falla.

### R26 — CategoryRepository.listCategories
CUANDO el test invoca `CategoryRepository(client).listCategories()` ENTONCES el sistema DEBE:
- R26.1 — llamar a `client.category.findMany`.
- R26.2 — retornar `Result.success(Category[])`.
- R26.3 — retornar `Result.success([])` si no hay categorías.
- R26.4 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R27 — CountryRepository.createMultiple
CUANDO el test invoca `CountryRepository(client).createMultiple(countries)` ENTONCES el sistema DEBE:
- R27.1 — ejecutar `client.$transaction` con operaciones `country.create`.
- R27.2 — retornar `Result.success(number)` con la cantidad de países insertados.
- R27.3 — retornar `Result.failure(Error)` si la transacción falla.

### R28 — CountryRepository.list
CUANDO el test invoca `CountryRepository(client).list()` ENTONCES el sistema DEBE:
- R28.1 — llamar a `client.country.findMany` ordenado por nombre ascendente.
- R28.2 — retornar `Result.success(TCountry[])`.
- R28.3 — retornar `Result.success([])` si no hay países.
- R28.4 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R29 — ProductImageRepository.deleteImage
CUANDO el test invoca `ProductImageRepository(client).deleteImage(imageId)` ENTONCES el sistema DEBE:
- R29.1 — llamar a `client.productImage.delete` con el imageId.
- R29.2 — retornar `Result.success(DeleteProductImage)` si la eliminación es exitosa.
- R29.3 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R30 — UserAddressRepository.findByUserId
CUANDO el test invoca `UserAddressRepository(client).findByUserId(userId)` ENTONCES el sistema DEBE:
- R30.1 — llamar a `client.userAddress.findUnique` con userId y `is_active: true`.
- R30.2 — retornar `Result.success(UserAddress)` si la dirección existe.
- R30.3 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R31 — UserAddressRepository.create
CUANDO el test invoca `UserAddressRepository(client).create(address)` ENTONCES el sistema DEBE:
- R31.1 — llamar a `client.userAddress.create` con `address.toJson()`.
- R31.2 — retornar `Result.success(UserAddress)` creada.
- R31.3 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R32 — UserAddressRepository.update
CUANDO el test invoca `UserAddressRepository(client).update(address)` ENTONCES el sistema DEBE:
- R32.1 — llamar a `client.userAddress.update` con `user_id` como where y `address.toJson()` como data.
- R32.2 — retornar `Result.success(UserAddress)` actualizada.
- R32.3 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R33 — UserAddressRepository.remove
CUANDO el test invoca `UserAddressRepository(client).remove(userId)` ENTONCES el sistema DEBE:
- R33.1 — llamar a `client.userAddress.delete` con `user_id` como where.
- R33.2 — retornar `Result.success(UserAddress)` eliminada.
- R33.3 — retornar `Result.failure(Error)` si Prisma lanza un error.

### R34 — UploadFilesRepository.uploadImages
CUANDO el test invoca `UploadFilesRepository().uploadImages(files)` ENTONCES el sistema DEBE:
- R34.1 — llamar a `cloudinary.uploader.upload` por cada archivo.
- R34.2 — retornar `Result.success(string[])` con las URLs seguras.
- R34.3 — retornar `Result.success([])` si Cloudinary falla para todos los archivos (los rechazos se filtran).

### R35 — UploadFilesRepository.deleteImage
CUANDO el test invoca `UploadFilesRepository().deleteImage(imageUrl)` ENTONCES el sistema DEBE:
- R35.1 — llamar a `cloudinary.uploader.destroy` con la URL.
- R35.2 — retornar `Result.success(result)` si Cloudinary responde.
- R35.3 — retornar `Result.failure(Error)` si Cloudinary lanza un error.

### R36 — SeedRepository.resetTables (camino feliz)
CUANDO el test invoca `SeedRepository(client).resetTables()` ENTONCES el sistema DEBE:
- R36.1 — llamar a `deleteMany` en todas las tablas (orderAddress, orderItem, order, user, userAddress, country, category, product, productImage).
- R36.2 — retornar `Result.success(true)` cuando todas las operaciones se resuelven exitosamente.

### R37 — SeedRepository.resetTables (error)
CUANDO el test invoca `SeedRepository(client).resetTables()` y alguna operación `deleteMany` falla ENTONCES el sistema DEBE:
- R37.1 — capturar el error en el `.catch()`.
- R37.2 — retornar `Result.failure(Error)` con el mensaje del error.

---

## State-driven (MIENTRAS …)

### R38
MIENTRAS el test corre con un PrismaClient mockeado (creado con `createPrismaClientMock`), los métodos del modelo DEBEN retornar los valores controlados por el test y NO hacer llamadas reales a la base de datos.

### R39
MIENTRAS el test de `UploadFilesRepository` corre, el módulo `cloudinary` DEBE estar mockeado con `jest.mock('cloudinary', ...)` para evitar llamadas reales a la API de Cloudinary.

---

## Unwanted behavior (SI … ENTONCES …)

### R40
SI PrismaClient recibe una query que lanza una excepción no contemplada (ej. error de conexión, constraint violation) ENTONCES el repositorio DEBE retornar `Result.failure(Error)` con el mensaje del error original y el logger DEBE registrar el error.

### R41
SI un método de repositorio recibe un argumento `null` o `undefined` donde espera un string (ej. `findByEmail(null)`, `getById(null)`, `productBySlug(undefined)`) ENTONCES el sistema DEBE propagar el error desde Prisma y retornar `Result.failure(Error)`. No se requiere validación explícita de argumentos en el repositorio.

### R42
SI `$transaction` es llamada con múltiples operaciones y una de ellas falla ENTONCES Prisma cancela toda la transacción y el repositorio DEBE retornar `Result.failure(Error)`.

### R43
SI `UploadFilesRepository.uploadImages` recibe un array vacío `[]` ENTONCES el sistema DEBE retornar `Result.success([])` sin llamar a Cloudinary.

### R44
SI `ProductRepository.updateProductInfo` recibe `images` con archivos pero `uploadFiles.uploadImages` retorna menos URLs que archivos (subida parcial) ENTONCES el sistema DEBE retornar `Result.failure(Error)` indicando que falló la subida de imágenes.
