# DL_8_active_inactive_product — Tasks

> Pasos discretos en orden. Cada task referencia al menos un `R<n>`.

---

## Fase 1 — Prisma Schema y Migración

- [x] T01 — Modificar `prisma/schema.prisma`: agregar enum `ProductStatus { ACTIVE INACTIVE }` antes del modelo `Product`. Agregar campo `status ProductStatus @default(ACTIVE)` al modelo `Product`.
  Cubre: R1, R2

- [x] T02 — Ejecutar `pnpm dlx prisma generate` para regenerar el cliente Prisma con el nuevo enum y campo.
  Cubre: R1, R2

- [ ] T03 — Ejecutar `pnpm dlx prisma migrate dev --name add_product_status` para crear la migración. Verificar que registros existentes obtienen `ACTIVE` por defecto.
  Cubre: R1, R2, R21

---

## Fase 2 — Core Types

- [x] T04 — Modificar `src/core/types/product.type.ts`: agregar tipo `ProductStatus = 'ACTIVE' | 'INACTIVE'`. Agregar campo `readonly status: ProductStatus` a `TProduct`, `TProductEntity`, `TProductData`. Agregar campo `readonly status?: ProductStatus` a `TProductUpdate`.
  Cubre: R3, R4, R5, R6

- [x] T05 — Exportar `ProductStatus` desde `src/core/types/index.ts`.
  Cubre: R3

---

## Fase 3 — Entity

- [x] T06 — Modificar `src/core/entities/product.entity.ts`: agregar `readonly status: ProductStatus` como último parámetro del constructor (antes de `tenant`).
  Cubre: R7

- [x] T07 — Modificar `Product.fromJson()`: agregar `data?.status || 'ACTIVE'` como argumento al constructor.
  Cubre: R8

- [x] T08 — Modificar `Product.fromEntity()`: agregar `data?.status || 'ACTIVE'` como argumento al constructor.
  Cubre: R9

- [x] T09 — Modificar `Product.toJson()`: agregar `status: this.status` al objeto retornado.
  Cubre: R10

- [x] T10 — Modificar `Product.toPlain()`: agregar `status: this.status` al objeto retornado.
  Cubre: R11

---

## Fase 4 — Repository Interface

- [x] T11 — Modificar `src/server/interfaces/product.interface.ts`: agregar `status?: ProductStatus` y `showAll?: boolean` al tipo `TListProps`.
  Cubre: R15, R16, R17

---

## Fase 5 — Repository Implementation

- [x] T12 — Modificar `listProducts` en `src/server/repositories/product.repository.ts`: destructurar `status` y `showAll` de props. Agregar `...(!showAll ? { status: status ?? 'ACTIVE' } : {})` al `where` de Prisma.
  Cubre: R15, R16, R17

- [x] T13 — Modificar `countProducts` en `product.repository.ts`: destructurar `status` y `showAll` de props. Agregar `...(!showAll ? { status: status ?? 'ACTIVE' } : {})` al `where` de Prisma.
  Cubre: R15, R16, R17

- [x] T14 — Modificar `createMultiple` en `product.repository.ts`: agregar `status: p.status ?? 'ACTIVE'` al `data` de Prisma `create`.
  Cubre: R12

- [x] T15 — Modificar `updateProductInfo` en `product.repository.ts`: desestructurar `status` de `product` y agregar `status` al `data` de Prisma `update`/`create`.
  Cubre: R14

---

## Fase 6 — Server Actions

- [x] T16 — Modificar `src/server/actions/products/products-pagination.ts`: agregar `status?: ProductStatus` y `showAll?: boolean` al tipo `Props`. Pasar estos valores a `productRepository.listProducts` y `productRepository.countProducts`.
  Cubre: R15, R16, R17

- [x] T17 — Modificar `src/server/actions/products/update-product-info.ts`: agregar `status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE')` al `productSchema`. Asegurar que `status` se incluya en el objeto `product` pasado al repository.
  Cubre: R14, R22

---

## Fase 7 — UI: ProductForm.tsx (Toggle de Status)

- [x] T18 — Modificar `app/(shop)/admin/product/[slug]/ui/product-form/ProductForm.tsx`: agregar `status: 'ACTIVE' | 'INACTIVE'` al tipo `FormInputs`. Agregar `status: product.status || 'ACTIVE'` a `defaultValues`.
  Cubre: R13, R18

- [x] T19 — En `ProductForm.tsx`, agregar el toggle visual de status usando Tailwind: un botón tipo switch con fondo verde (ACTIVE) o gris (INACTIVE), con texto "Activo"/"Inactivo" al lado. El toggle usa `setValue('status', ...)` para actualizar el valor del formulario.
  Cubre: R18, R20

- [x] T20 — En `ProductForm.tsx`, en la función `onSubmit`, agregar `formData.append('status', productInfo.status)` al FormData que se envía a `updateProductInfo`.
  Cubre: R13

---

## Fase 8 — UI: Admin Products Page (Columna Estado)

- [x] T21 — Modificar `app/(shop)/admin/products/page.tsx`: agregar columna "Estado" al `<thead>` de la tabla.
  Cubre: R19

- [x] T22 — En `admin/products/page.tsx`, agregar `<td>` con badge de status: fondo verde texto verde para `ACTIVE`, fondo rojo texto rojo para `INACTIVE`. Usar clsx para el estilo condicional.
  Cubre: R19

- [x] T23 — En `admin/products/page.tsx`, agregar `showAll: true` al llamado de `getPaginatedProductsWithImages` para que admin vea todos los productos (activos e inactivos).
  Cubre: R17, R19

---

## Fase 9 — Tests

- [x] T24 — Actualizar `tests/mocks/repositories/product.repository.mock.ts`: agregar `status?: ProductStatus` y `showAll?: boolean` a `MockOverrides` para `listProducts` y `countProducts`. Actualizar defaults para incluir status.
  Cubre: R15, R16, R17

- [x] T25 — Actualizar `src/server/repositories/product.repository.test.ts`: agregar tests para `listProducts` con filtro `status: 'ACTIVE'` por defecto, con `showAll: true`, y con `status: 'INACTIVE'`.
  Cubre: R15, R16, R17

- [x] T26 — Actualizar `src/server/repositories/product.repository.test.ts`: agregar tests para `countProducts` con filtro `status` y `showAll`.
  Cubre: R15, R17

- [x] T27 — Actualizar `src/server/repositories/product.repository.test.ts`: agregar test para `createMultiple` verificando que `status` se incluye en la creación.
  Cubre: R12

- [x] T28 — Actualizar `src/server/repositories/product.repository.test.ts`: agregar test para `updateProductInfo` verificando que `status` se actualiza correctamente.
  Cubre: R14

- [x] T29 — Actualizar `src/server/actions/products/update-product-info.test.ts`: agregar tests para la validación Zod del campo `status` (ACTIVE válido, INACTIVE válido, valor inválido, default ACTIVE).
  Cubre: R14, R22

- [x] T30 — Verificar que todos los tests existentes (`get-product-by-slug.test.ts`, `products-pagination.test.ts`, `validate-product-slug.test.ts`, `delete-product-image.test.ts`, `get-category-list.test.ts`) sigan pasando con los cambios realizados.
  Cubre: Verificación global

---

## Fase 10 — Verificación

- [x] T31 — Ejecutar `pnpm dlx prisma generate` y verificar que el cliente se genera sin errores.
  Cubre: Verificación de schema

- [x] T32 — Ejecutar `pnpm dlx jest --passWithNoTests` y verificar que todos los tests (existentes + nuevos) pasan en verde.
  Cubre: Verificación global

- [x] T33 — Ejecutar `pnpm lint` y verificar que no se introducen errores de lint.
  Cubre: Verificación de calidad

- [x] T34 — Ejecutar `pnpm build` y verificar que el build de Next.js completa sin errores.
  Cubre: Verificación de integración

---

## Fase 11 — Documentación de Trazabilidad

- [x] T35 — Crear `specs/progress/impl_DL_8_active_inactive_product.md` con el mapa de trazabilidad: cada `R<n>` → test(s) correspondiente(s).
  Cubre: C6 (CHECKPOINTS.md)
