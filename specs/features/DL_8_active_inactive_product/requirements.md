# DL_8_active_inactive_product — Requirements

> Formato EARS estricto. Cada `R<n>` es verificable por al menos un test concreto.

---

## Ubicuo

### R1
El sistema DEBE añadir un enum `ProductStatus` con valores `ACTIVE` e `INACTIVE` al schema de Prisma para el modelo `Product`.

### R2
El sistema DEBE añadir un campo `status` de tipo `ProductStatus` al modelo `Product` en Prisma, con valor por defecto `ACTIVE` (`@default(ACTIVE)`).

### R3
El sistema DEBE añadir el campo `status` al tipo `TProduct` en `src/core/types/product.type.ts` con tipo `ProductStatus`.

### R4
El sistema DEBE añadir el campo `status` al tipo `TProductEntity` en `src/core/types/product.type.ts` con tipo `ProductStatus`.

### R5
El sistema DEBE añadir el campo `status` al tipo `TProductData` en `src/core/types/product.type.ts` con tipo `ProductStatus`.

### R6
El sistema DEBE añadir el campo `status` al tipo `TProductUpdate` en `src/core/types/product.type.ts` como campo opcional con tipo `ProductStatus | undefined`.

### R7
El sistema DEBE modificar la clase `Product` en `src/core/entities/product.entity.ts` para incluir un campo `readonly status: ProductStatus` en el constructor.

### R8
El sistema DEBE modificar el método estático `Product.fromJson()` para leer `data?.status` y usar `ACTIVE` como valor por defecto cuando no se provea.

### R9
El sistema DEBE modificar el método estático `Product.fromEntity()` para leer `data?.status` y usar `ACTIVE` como valor por defecto cuando no se provea.

### R10
El sistema DEBE modificar el método `Product.toJson()` para incluir el campo `status` en el objeto retornado.

### R11
El sistema DEBE modificar el método `Product.toPlain()` para incluir el campo `status` en el objeto retornado.

---

## Event-driven (CUANDO … ENTONCES …)

### R12 — Creación de producto nuevo con status por defecto
CUANDO se crea un nuevo producto (sin `id`) y no se provee `status` en el formulario ENTONCES el sistema DEBE asignar el valor `ACTIVE` por defecto en la base de datos.

### R13 — Cambio de status vía formulario de edición
CUANDO el usuario cambia el toggle de status en `ProductForm.tsx` y envía el formulario ENTONCES el sistema DEBE enviar el nuevo valor de `status` (`ACTIVE` o `INACTIVE`) en el `FormData` hacia la server action `updateProductInfo`.

### R14 — Server action updateProductInfo: manejo del status
CUANDO `updateProductInfo` recibe un `FormData` con el campo `status` ENTONCES el sistema DEBE:
- R14.1 — validar el campo `status` con Zod como `z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE')`.
- R14.2 — incluir el campo `status` en la actualización de Prisma.

### R15 — Filtrado de productos activos en paginación pública
CUANDO `listProducts` o `countProducts` son invocados ENTONCES el sistema DEBE incluir `status: 'ACTIVE'` en el `where` de Prisma para que solo se retornen productos activos por defecto.

### R16 — Paginación pública con filtro explícito de status
CUANDO `listProducts` es invocado con `status: 'ACTIVE'` ENTONCES el sistema DEBE filtrar productos por `status: 'ACTIVE'` en la consulta de Prisma.

### R17 — Admin puede ver todos los productos (activos e inactivos)
CUANDO `listProducts` es invocado desde la vista de administración ENTONCES el sistema DEBE poder retornar productos independientemente de su status (activos e inactivos).

### R18 — Toggle visual en ProductForm.tsx
CUANDO el usuario está en el formulario de edición de producto ENTONCES el sistema DEBE mostrar un toggle visual (botón estilizado con Tailwind) que indique el status actual del producto (`ACTIVE` o `INACTIVE`) y permita cambiarlo.

### R19 — Indicador visual de status en admin/products
CUANDO la página de administración `/admin/products` renderiza la tabla de productos ENTONCES el sistema DEBE mostrar una columna "Estado" que indique visualmente si cada producto es `ACTIVE` (verde) o `INACTIVE` (rojo/gris).

---

## State-driven (MIENTRAS …)

### R20
MIENTRAS el usuario cambia el toggle de status en `ProductForm.tsx`, el estado del toggle DEBE actualizarse inmediatamente en la UI antes del envío del formulario.

---

## Unwanted behavior (SI … ENTONCES …)

### R21
SI se crea un nuevo producto y el campo `status` no está presente en el `FormData` ENTONCES el sistema DEBE usar `ACTIVE` como valor por defecto en la base de datos (gracias al `@default(ACTIVE)` de Prisma).

### R22
SI el valor de `status` en el `FormData` no es `ACTIVE` ni `INACTIVE` ENTONCES `updateProductInfo` DEBE retornar `{ success: false, message: "..." }` con error de validación Zod.

### R23
SI el repositorio `listProducts` falla al consultar la base de datos ENTONCES la server action `getPaginatedProductsWithImages` DEBE lanzar el error original para que la página maneje la excepción.

### R24
SI un producto existe en la base de datos con `status: 'INACTIVE'` ENTONCES la página pública `/` y `/category/[id]` NO DEBEN mostrar ese producto en los resultados.

### R25
SI el formulario de edición se envía sin el campo `status` ENTONCES el sistema DEBE preservar el `status` actual del producto en la base de datos (no cambiarlo a `undefined`).
