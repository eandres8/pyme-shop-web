# DL_7_product_slug_validation — Tasks

> Pasos discretos en orden. Cada task referencia al menos un `R<n>`.

---

## Fase 1 — Repository: método tenant-scoped slug lookup

- [x] T01 — Modificar `src/server/interfaces/product.interface.ts`: agregar el método `productExistsBySlug(slug: string, tenantId: string): Promise<Result<boolean>>` a la interfaz `IProductRepository`. Modificar la firma de `productBySlug` para aceptar `tenantId?: string` como segundo parámetro opcional.
  Cubre: R1, R2

- [x] T02 — Modificar `src/server/repositories/product.repository.ts`: agregar el nuevo método `productExistsBySlug` que ejecuta `client.product.count({ where: { slug, tenant_id: tenantId } })` y retorna `Result.success(count > 0)`. El método debe usar `to()` para capturar errores y `logger` para logging.
  Cubre: R2, R15, R17

- [x] T03 — Modificar `productBySlug` en `product.repository.ts`: agregar `tenantId?: string` como segundo parámetro; cuando se provea, incluir `tenant_id: tenantId` en el `where` de `findFirst`.
  Cubre: R1, R17

- [x] T04 — Actualizar `tests/mocks/repositories/product.repository.mock.ts`: agregar el método `productExistsBySlug` con default `async () => Result.success(false)` a la interfaz mockeada y al tipo `MockOverrides`.
  Cubre: R2

---

## Fase 2 — Server action: validate-product-slug

- [x] T05 — Crear `src/server/actions/products/validate-product-slug.ts` con:
  - Directiva `'use server'`
  - Import de `auth` desde `@/src/auth.config`
  - Import de `productRepository` desde `../../providers`
  - Schema Zod `slugSchema = z.object({ slug: z.string().min(3).max(255) })`
  - Función `validateProductSlug(slug: string): Promise<TActionResponse<{ available: boolean }>>`
  - Lógica: obtener sesión → validar tenant → validar slug Zod → llamar `productRepository.productExistsBySlug` → retornar `{ available: !exists }`
  Cubre: R3, R12, R13, R14

- [x] T06 — En `validate-product-slug.ts`, agregar manejo de error cuando `session.user.tenant` es `undefined` o vacío, retornando `{ success: false, message: "Usuario sin tenant asignado" }`.
  Cubre: R18

- [x] T07 — En `validate-product-slug.ts`, agregar manejo de slug inválido (Zod fail) retornando `{ success: false, message: "Slug inválido" }`.
  Cubre: R19

- [x] T08 — En `validate-product-slug.ts`, agregar manejo de error del repositorio (cuando `result.isOk === false`) retornando `{ success: false, message: "Error al validar slug" }`.
  Cubre: R20

- [x] T09 — Actualizar `src/server/actions/index.ts`: agregar export `export * from './products/validate-product-slug';`.
  Cubre: R3

---

## Fase 3 — Reducer de validación de slug

- [x] T10 — Crear `app/(shop)/admin/product/[slug]/ui/product-form/product-form-slug.reducer.ts` con:
  - Tipo `SlugStatus = 'idle' | 'checking' | 'available' | 'taken'`
  - Tipo `SlugState = { status: SlugStatus; error: string | null }`
  - Tipo `SlugAction = CHECKING | AVAILABLE | TAKEN | ERROR | RESET`
  - Constante `initialSlugState: SlugState`
  - Función pura `slugReducer(state, action): SlugState`
  Cubre: R5, R6, R8

## Fase 4 — ProductForm.tsx: auto-slug y validación asíncrona con reducer

- [x] T11 — En `ProductForm.tsx`, importar `validateProductSlug` desde `@/src/server/actions`. Importar `slugReducer`, `initialSlugState` desde el nuevo reducer. Reemplazar los `useState` de `slugStatus`/`slugError` por `useReducer(slugReducer, initialSlugState)`. Agregar `useRef` para `originalSlug` y `debounceTimer`.
  Cubre: R5, R6, R8

- [x] T12 — Agregar `useEffect` que observe el campo `title` mediante `watch`. Cuando `product.id` está vacío (nuevo producto) y `title` cambia, auto-generar slug con `.toLowerCase().replaceAll(/ /g, '_').trim()` y actualizar el campo slug con `setValue('slug', generatedSlug, { shouldValidate: true })`.
  Cubre: R4, R7

- [x] T13 — Agregar `useEffect` que observe el campo `slug` mediante `watch`. Implementar debounce de 500ms. En cada cambio de slug:
  - Si es edición y slug === originalSlug → dispatch `AVAILABLE`
  - Sino → dispatch `CHECKING`, llamar `validateProductSlug(slug)`
  - Según respuesta: dispatch `AVAILABLE`, `TAKEN` o `ERROR`
  Cubre: R8, R9, R10, R11, R16, R22

- [x] T14 — Modificar el JSX del campo `slug` para leer desde `slugState`:
  - Borde rojo si `slugState.status === 'taken'`, verde si `available`
  - "Verificando…" en gris durante `checking`
  - `slugState.error` en rojo si existe
  - "Slug disponible" en verde si `available`
  Cubre: R5, R6, R10, R16, R23

- [x] T15 — Asegurar que el botón de submit no se bloquee por la validación asíncrona (el backend maneja duplicados). La validación es informativa, no bloqueante.
  Cubre: R10.3, R22

---

## Fase 5 — Tests

- [x] T16 — Crear `src/server/actions/products/validate-product-slug.test.ts` con tests para:
  - `validateProductSlug` retorna `available: true` cuando slug no existe (mock `productExistsBySlug` → `Result.success(false)`)
  - `validateProductSlug` retorna `available: false` cuando slug existe (mock `productExistsBySlug` → `Result.success(true)`)
  - `validateProductSlug` retorna error cuando no hay tenant en sesión
  - `validateProductSlug` retorna error cuando slug es inválido (< 3 chars)
  - `validateProductSlug` retorna error cuando el repositorio falla
  Cubre: R9, R10, R14, R18, R19, R20

- [x] T17 — Agregar tests en `src/server/repositories/product.repository.test.ts` para:
  - `productExistsBySlug` retorna `true` cuando slug+tenant existen
  - `productExistsBySlug` retorna `false` cuando slug+tenant NO existen
  - `productExistsBySlug` retorna `Result.failure` cuando Prisma lanza error
  - `productBySlug` con `tenantId` filtra correctamente
  - `productBySlug` sin `tenantId` funciona como antes (backward compat)
  Cubre: R1, R15

- [x] T18 — Crear `app/(shop)/admin/product/[slug]/ui/product-form/product-form-slug.reducer.test.ts` con tests para el reducer puro:
  - `CHECKING` → status `checking`, error null
  - `AVAILABLE` → status `available`, error null
  - `TAKEN` → status `taken`, error con mensaje
  - `ERROR` → status `idle`, error con mensaje
  - `RESET` → vuelve a estado inicial
  - estado desconocido retorna el mismo estado
  Cubre: R5, R6, R8

- [x] T19 — Actualizar tests existentes de server actions que usan `productBySlug` (ej. `get-product-by-slug.test.ts`) si es necesario para que funcionen con la firma modificada.
  Cubre: R1

- [x] T20 — Verificar que `tests/mocks/repositories/product.repository.mock.ts` tenga `productExistsBySlug` y que el tipo `MockOverrides` lo incluya. Verificar que los mocks existentes sigan funcionando.
  Cubre: R2

---

## Fase 6 — Verificación

- [x] T21 — Ejecutar `pnpm dlx jest --passWithNoTests` y verificar que todos los tests (existentes + nuevos) pasan en verde.
  Cubre: Verificación global

- [x] T22 — Ejecutar `pnpm lint` y verificar que no se introducen errores de lint.
  Cubre: Verificación de calidad

- [x] T23 — Ejecutar `pnpm build` y verificar que el build de Next.js completa sin errores.
  Cubre: Verificación de integración

---

## Fase 7 — Cierre

- [x] T24 — Verificar que cada `R<n>` de `requirements.md` tiene al menos un test concreto mapeado. Documentar el mapa en `specs/progress/impl_DL_7_product_slug_validation.md`.
  Cubre: C6 (CHECKPOINTS.md)
