# DL_7_product_slug_validation — Requirements

> Formato EARS estricto. Cada `R<n>` es verificable por al menos un test concreto.

---

## Ubiquitous

### R1
El sistema DEBE modificar `ProductRepository.productBySlug(slug, tenantId?)` para aceptar un parámetro opcional `tenantId` y, cuando se provea, filtrar la consulta con `tenant_id` además de `slug`.

### R2
El sistema DEBE tener un nuevo método `ProductRepository.productExistsBySlug(slug, tenantId)` que retorne `Result<boolean>` indicando si existe un producto con ese `slug` para el `tenant_id` especificado.

### R3
El sistema DEBE tener una server action `validateProductSlug(slug)` en `src/server/actions/products/validate-product-slug.ts` marcada con `'use server'` que retorne `TActionResponse<{ available: boolean }>`.

### R4
El formulario `ProductForm.tsx` DEBE auto-generar un slug a partir del valor del campo `title` usando la misma sanitización que el backend: `.toLowerCase().replaceAll(/ /g, '_').trim()`.

### R5
El formulario `ProductForm.tsx` DEBE tener un estado visual de carga («Verificando…») mientras la validación asíncrona del slug está en curso.

### R6
El formulario `ProductForm.tsx` DEBE mostrar un mensaje de error debajo del campo slug cuando `validateProductSlug` retorne `available: false`.

---

## Event-driven (CUANDO … ENTONCES …)

### R7 — Auto-generación de slug desde título
CUANDO el usuario está creando un nuevo producto (`product.id` vacío) y escribe en el campo `title` ENTONCES el sistema DEBE actualizar el campo `slug` con el valor auto-generado a partir de `title` usando el formato sanitizado (lowercase, espacios → guion bajo, trim).

### R8 — Validación asíncrona al cambiar slug
CUANDO el usuario está creando un nuevo producto y el campo `slug` cambia ENTONCES el sistema DEBE:
- R8.1 — disparar una llamada a `validateProductSlug(slug)` con un debounce de 500ms.
- R8.2 — mostrar un indicador "Verificando…" durante la llamada.
- R8.3 — actualizar el estado de error del campo según la respuesta.

### R9 — Slug disponible
CUANDO `validateProductSlug` retorna `{ available: true }` ENTONCES el sistema DEBE limpiar el error de slug (si existía) y permitir el envío del formulario.

### R10 — Slug no disponible
CUANDO `validateProductSlug` retorna `{ available: false }` ENTONCES el sistema DEBE:
- R10.1 — mostrar el mensaje "Este slug ya está en uso" debajo del campo slug.
- R10.2 — marcar el campo slug como inválido en `react-hook-form`.
- R10.3 — NO bloquear el envío del formulario (el backend rechazará el duplicado igualmente).

### R11 — Edición de producto existente con slug propio
CUANDO el usuario está editando un producto existente (`product.id` tiene valor) y el slug es el mismo que el original ENTONCES el sistema DEBE retornar `available: true` (el propio producto no se considera conflicto).

### R12 — Server action: tenant from session
CUANDO `validateProductSlug` es invocada ENTONCES el sistema DEBE obtener `session.user.tenant` del usuario autenticado y pasarlo como `tenantId` a la consulta del repositorio.

### R13 — Server action: validación Zod
CUANDO `validateProductSlug` recibe un slug ENTONCES el sistema DEBE validar el slug con Zod: `z.string().min(3).max(255)`.

### R14 — Server action: respuesta exitosa
CUANDO `validateProductSlug` completa exitosamente ENTONCES el sistema DEBE retornar `{ success: true, data: { available: boolean } }`.

### R15 — Repository: productExistsBySlug con tenantId
CUANDO `ProductRepository.productExistsBySlug(slug, tenantId)` es invocado con un slug que existe para ese tenant ENTONCES el sistema DEBE retornar `Result.success(true)`.
CUANDO `ProductRepository.productExistsBySlug(slug, tenantId)` es invocado con un slug que NO existe para ese tenant ENTONCES el sistema DEBE retornar `Result.success(false)`.

---

## State-driven (MIENTRAS …)

### R16
MIENTRAS `validateProductSlug` está en ejecución, el campo slug en el formulario DEBE mostrar un spinner o texto "Verificando…" para indicar progreso.

### R17
MIENTRAS el repositorio `ProductRepository` utiliza el cliente Prisma estándar (sin extensión de tenant), las consultas `productBySlug` con `tenantId` DEBEN filtrar explícitamente por `tenant_id`.

---

## Unwanted behavior (SI … ENTONCES …)

### R18
SI `session.user.tenant` es `undefined` o vacío ENTONCES `validateProductSlug` DEBE retornar `{ success: false, message: "Usuario sin tenant asignado" }`.

### R19
SI el slug recibido por `validateProductSlug` no pasa la validación Zod (menos de 3 caracteres o más de 255) ENTONCES el sistema DEBE retornar `{ success: false, message: "Slug inválido" }`.

### R20
SI el repositorio `productExistsBySlug` lanza un error de base de datos ENTONCES `validateProductSlug` DEBE retornar `{ success: false, message: "Error al validar slug" }`.

### R21
SI el formulario está en modo edición (producto existente) y el usuario cambia manualmente el slug a uno que ya existe para otro producto del mismo tenant ENTONCES:
- R21.1 — la validación asíncrona DEBE detectar el conflicto y mostrar error.
- R21.2 — el envío del formulario con ese slug conflictivo DEBE ser rechazado por Prisma (constraint unique) y mostrar el toast de error actual.

### R22
SI el usuario intenta enviar el formulario mientras la validación asíncrona está en curso ENTONCES `react-hook-form` DEBE esperar a que la validación termine (la promesa de validación debe resolverse antes del `handleSubmit`).

### R23
SI la respuesta de `validateProductSlug` tiene un error de red o el servidor no responde ENTONCES el formulario DEBE mostrar un mensaje genérico "Error de conexión al validar slug" y permitir al usuario reintentar.
