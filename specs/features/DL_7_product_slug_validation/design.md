# DL_7_product_slug_validation — Design

> Decisiones técnicas para implementar validación dinámica de slug en el formulario de producto.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  ProductForm.tsx (Client Component)                                │
│                                                                     │
│  ┌──────────────┐    onChange(title)    ┌──────────────────────┐   │
│  │  title input  │ ──────────────────→  │ autoGenerateSlug()   │   │
│  └──────────────┘                      │ slug → campo slug    │   │
│                                         └──────────────────────┘   │
│                                                                     │
│  ┌──────────────┐    onChange(slug)     ┌──────────────────────┐   │
│  │  slug input   │ ──────────────────→  │ validateSlug (async) │   │
│  └──────────────┘                      │ debounce 500ms       │   │
│         ↑                               │ → validateProduct-  │   │
│         │ error msg                     │   Slug(slug)         │   │
│         │ loading spinner               └──────────┬───────────┘   │
│         │                                           │               │
│  ┌──────┴───────┐                                   ▼               │
│  │ setError()   │                          Server Action            │
│  │ setValue()   │                     ┌──────────────────────┐     │
│  └──────────────┘                     │ validateProductSlug  │     │
│                                        │ • auth() → session   │     │
│                                        │ • Zod validate slug  │     │
│                                        │ • repository         │     │
│                                        │   .productExists-    │     │
│                                        │    BySlug(slug,      │     │
│                                        │     tenantId)        │     │
│                                        │ • return available   │     │
│                                        └──────────┬───────────┘     │
│                                                   │                 │
│                                                   ▼                 │
│                                        ProductRepository            │
│                                        ┌──────────────────────┐     │
│                                        │ productExistsBySlug() │     │
│                                        │ productBySlug()       │     │
│                                        │ (with tenant filter)  │     │
│                                        └──────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Data Flow

### Flow A — Creación de producto nuevo (auto-slug)
1. User navigates to `/admin/product/new`
2. `page.tsx` calls `getProductBySlug('new')` → returns empty `Product.fromJson({})`
3. `ProductForm` renders with empty product
4. User types in `title` field
5. `useEffect` watches `title` → calls `autoGenerateSlug(title)`
6. Auto-generated slug set in `slug` field via `setValue('slug', generatedSlug)`
7. Slug change triggers validation

### Flow B — Validación asíncrona de slug
1. `slug` field changes (user typing OR auto-generated)
2. `useEffect` with debounce (500ms) triggers
3. Sets `isValidatingSlug = true` → shows "Verificando…" indicator
4. Calls `validateProductSlug(slug)` server action
5. Server action:
   a. Gets session → `tenantId = session.user.tenant`
   b. If no tenant → return error
   c. Zod validates slug (min 3, max 255)
   d. Calls `productRepository.productExistsBySlug(slug, tenantId)`
   e. Returns `{ available: boolean }`
6. On response:
   - `available: true` → clear error, allow submit
   - `available: false` → set error "Este slug ya está en uso"

### Flow C — Edición de producto existente
1. Product has `id` set (not empty)
2. Original slug stored in a ref for comparison
3. Auto-slug from title is DISABLED (no auto-generation)
4. Validation still runs on slug change
5. If slug equals original → skip check (return available)
6. If slug different → validate as usual

## 3. Files to Create

| Archivo | Propósito | Cubre R |
|---------|-----------|---------|
| `src/server/actions/products/validate-product-slug.ts` | Nueva server action para validar disponibilidad de slug por tenant | R3, R12, R13, R14, R18, R19, R20 |
| `app/(shop)/admin/product/[slug]/ui/product-form/product-form-slug.reducer.ts` | Reducer puro (`useReducer`) que gestiona el estado de validación del slug: `idle`, `checking`, `available`, `taken` | R5, R6, R8, R10, R16, R23 |

## 4. Files to Modify

| Archivo | Cambio | Cubre R |
|---------|--------|---------|
| `src/server/interfaces/product.interface.ts` | Agregar método `productExistsBySlug` a `IProductRepository` | R2, R15 |
| `src/server/repositories/product.repository.ts` | Agregar método `productExistsBySlug`. Modificar `productBySlug` para aceptar `tenantId` opcional. | R1, R2, R15, R17 |
| `app/(shop)/admin/product/[slug]/ui/product-form/ProductForm.tsx` | Agregar auto-slug desde título. Agregar validación asíncrona con debounce. Agregar estados de carga/error. | R4, R5, R6, R7, R8, R9, R10, R11, R16, R21, R22, R23 |
| `src/server/actions/index.ts` | Agregar export de `validate-product-slug` | R3 |
| `tests/mocks/repositories/product.repository.mock.ts` | Agregar mock de `productExistsBySlug` | R15 |

## 5. Firma de nuevos métodos

### Repository interface (`src/server/interfaces/product.interface.ts`)

```typescript
export interface IProductRepository {
  // … métodos existentes sin cambios …

  /** Busca producto por slug, opcionalmente filtrado por tenant */
  productBySlug(slug: string, tenantId?: string): Promise<Result<Product>>;

  /** Retorna true si existe un producto con ese slug para el tenant */
  productExistsBySlug(slug: string, tenantId: string): Promise<Result<boolean>>;
}
```

### Repository implementation (`src/server/repositories/product.repository.ts`)

```typescript
// Modificar productBySlug
const productBySlug = async (slug: string, tenantId?: string) => {
  const [data, error] = await to(
    client.product.findFirst({
      where: {
        slug,
        ...(tenantId ? { tenant_id: tenantId } : {}),
      },
      // … include existente …
    }),
  );
  // … resto sin cambios …
}

// Nuevo método
const productExistsBySlug = async (slug: string, tenantId: string) => {
  const [count, error] = await to(
    client.product.count({
      where: {
        slug,
        tenant_id: tenantId,
      },
    }),
  );

  if (error) {
    logger.log({ error });
    return Result.failure(new Error(error?.message || "Error verificando slug"));
  }

  return Result.success(count > 0);
}
```

### Server action (`src/server/actions/products/validate-product-slug.ts`)

```typescript
'use server';

import { z } from 'zod';
import { auth } from '@/src/auth.config';
import { productRepository } from '../../providers';
import type { TActionResponse } from '@/src/core/types';

const slugSchema = z.object({
  slug: z.string().min(3).max(255),
});

export async function validateProductSlug(
  slug: string,
): Promise<TActionResponse<{ available: boolean }>> {
  const session = await auth();

  // R18: Verificar tenant
  if (!session?.user?.tenant) {
    return { success: false, message: 'Usuario sin tenant asignado' };
  }

  // R13: Validar slug con Zod
  const parsed = slugSchema.safeParse({ slug });
  if (!parsed.success) {
    return { success: false, message: 'Slug inválido' };
  }

  // R1, R2: Consultar repositorio
  const result = await productRepository.productExistsBySlug(
    parsed.data.slug,
    session.user.tenant,
  );

  if (!result.isOk) {
    return { success: false, message: 'Error al validar slug' };
  }

  return {
    success: true,
    data: { available: !result.data },
  };
}
```

### Reducer file (`product-form-slug.reducer.ts`) — Estado de validación del slug

Se extrae la lógica de estado de validación a un reducer puro, facilitando testabilidad y mantenibilidad.

```typescript
export type SlugStatus = 'idle' | 'checking' | 'available' | 'taken';

export type SlugState = {
  status: SlugStatus;
  error: string | null;
};

export type SlugAction =
  | { type: 'CHECKING' }
  | { type: 'AVAILABLE' }
  | { type: 'TAKEN'; message: string }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' };

export const initialSlugState: SlugState = {
  status: 'idle',
  error: null,
};

export function slugReducer(state: SlugState, action: SlugAction): SlugState {
  switch (action.type) {
    case 'CHECKING':
      return { status: 'checking', error: null };
    case 'AVAILABLE':
      return { status: 'available', error: null };
    case 'TAKEN':
      return { status: 'taken', error: action.message };
    case 'ERROR':
      return { status: 'idle', error: action.message };
    case 'RESET':
      return { status: 'idle', error: null };
    default:
      return state;
  }
}
```

### ProductForm.tsx — Principales modificaciones

```typescript
// Nuevas importaciones
import { useEffect, useRef, useReducer } from 'react';
import { validateProductSlug } from '@/src/server/actions';
import {
  slugReducer,
  initialSlugState,
  type SlugStatus,
} from './product-form-slug.reducer';

// Nuevo estado vía useReducer (reemplaza useState individuales)
const [slugState, dispatch] = useReducer(slugReducer, initialSlugState);

const originalSlug = useRef(product.slug); // Para edición
const isNewProduct = !product.id;
const debounceTimer = useRef<NodeJS.Timeout | null>(null);

// Efecto para auto-generar slug desde título (solo nuevos productos)
useEffect(() => {
  if (!isNewProduct) return;
  
  const subscription = watch((value, { name }) => {
    if (name === 'title' && value.title) {
      const generatedSlug = value.title
        .toLowerCase()
        .replaceAll(/ /g, '_')
        .trim();
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  });
  return () => subscription.unsubscribe();
}, [watch, isNewProduct, setValue]);

// Efecto para validación asíncrona (debounced)
useEffect(() => {
  const subscription = watch((value, { name }) => {
    if (name !== 'slug') return;
    
    const currentSlug = value.slug as string;
    if (!currentSlug || currentSlug.length < 3) return;
    
    // En edición: si slug no cambió, no validar
    if (!isNewProduct && currentSlug === originalSlug.current) {
      dispatch({ type: 'AVAILABLE' });
      return;
    }
    
    // Debounce
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      dispatch({ type: 'CHECKING' });
      const result = await validateProductSlug(currentSlug);
      
      if (result.success) {
        if (result.data.available) {
          dispatch({ type: 'AVAILABLE' });
        } else {
          dispatch({ type: 'TAKEN', message: 'Este slug ya está en uso' });
        }
      } else {
        dispatch({ type: 'ERROR', message: result.message ?? 'Error al validar slug' });
      }
    }, 500);
  });
  
  return () => subscription.unsubscribe();
}, [watch, isNewProduct, setValue]);
```

El uso de `useReducer` en lugar de `useState`:
- Centraliza las transiciones de estado en un lugar único y testeable
- Elimina la duplicación de `setSlugStatus` + `setSlugError`
- Previene estados inconsistentes (ej. `status: 'taken'` sin `error`)
- Permite testear el reducer como función pura sin mocking de React

## 6. Slug input — UI changes

El campo slug actual:
```tsx
<input type="text" className="p-2 border rounded-md bg-gray-50" {...register('slug', { required: true })} />
```

Se modifica para incluir estado de validación:
```tsx
<div className="flex flex-col mb-2">
  <span className="text-sm font-bold">Slug</span>
  <input
    type="text"
    className={clsx("p-2 border rounded-md bg-gray-50", {
      "border-red-500": slugState.status === 'taken',
      "border-green-500": slugState.status === 'available',
    })}
    {...register('slug', { required: true })}
  />
  {slugState.status === 'checking' && (
    <span className="text-xs text-gray-500 mt-1">Verificando…</span>
  )}
  {slugState.error && (
    <span className="text-xs text-red-600 mt-1">{slugState.error}</span>
  )}
  {slugState.status === 'available' && (
    <span className="text-xs text-green-600 mt-1">Slug disponible</span>
  )}
</div>
```

## 7. Error handling strategy

| Escenario | Dónde se captura | Respuesta |
|-----------|-------------------|-----------|
| Sin tenant en sesión | Server action | `{ success: false, message: "Usuario sin tenant asignado" }` |
| Slug inválido (< 3 o > 255 chars) | Zod en server action | `{ success: false, message: "Slug inválido" }` |
| Error de DB en repositorio | `to()` wrapper en repository | `Result.failure(Error)` → server action retorna error |
| Red/timeout (cliente) | try/catch en el debounce handler del cliente | Mostrar "Error de conexión" en UI |
| Slug duplicado en submit | Prisma unique constraint → `updateProductInfo` error | toast.error existente |
| Edición: slug sin cambios | Componente (comparación con ref) | Skip validación, available=true |

## 8. Testing strategy

### Tests unitarios

| Test | Archivo | R cubierto |
|------|---------|------------|
| `productExistsBySlug` encuentra slug existente | `product.repository.test.ts` | R15 |
| `productExistsBySlug` slug no existe | `product.repository.test.ts` | R15 |
| `productExistsBySlug` error de DB | `product.repository.test.ts` | R15 |
| `productBySlug` con tenantId filtra correctamente | `product.repository.test.ts` | R1 |
| `productBySlug` sin tenantId funciona como antes | `product.repository.test.ts` | R1 |
| `validateProductSlug` retorna available=true | `validate-product-slug.test.ts` | R14, R9 |
| `validateProductSlug` retorna available=false | `validate-product-slug.test.ts` | R14, R10 |
| `validateProductSlug` sin tenant retorna error | `validate-product-slug.test.ts` | R18 |
| `validateProductSlug` slug inválido retorna error | `validate-product-slug.test.ts` | R19 |
| `validateProductSlug` error de repositorio | `validate-product-slug.test.ts` | R20 |
| `slugReducer`: CHECKING → status checking | `product-form-slug.reducer.test.ts` | R5, R8 |
| `slugReducer`: AVAILABLE → status available | `product-form-slug.reducer.test.ts` | R5 |
| `slugReducer`: TAKEN → status taken + error | `product-form-slug.reducer.test.ts` | R6, R10 |
| `slugReducer`: ERROR → status idle + error | `product-form-slug.reducer.test.ts` | R5, R8 |
| `slugReducer`: RESET → estado inicial | `product-form-slug.reducer.test.ts` | R5 |
| `slugReducer`: acción desconocida → mismo estado | `product-form-slug.reducer.test.ts` | R5 |
| Mock de productExistsBySlug en product.repository.mock.ts | `tests/mocks/repositories/` | R2 |

### Tests de integración / componente
Los tests de componente para `ProductForm.tsx` requieren un entorno de testing con React Testing Library. Dado que el proyecto actualmente no tiene RTL configurado, estos tests se documentan como deuda técnica (no requeridos en esta fase). La verificación se hace mediante:
- Tests unitarios de las funciones puras (auto-slug)
- Tests de la server action
- Verificación manual del flujo completo

### Mocks necesarios

- Agregar `productExistsBySlug` al mock existente en `tests/mocks/repositories/product.repository.mock.ts`
- Mock de `validateProductSlug` import no necesita mock nuevo (se usa el mismo patrón de `jest.mock`)

## 9. Alternativa descartada

### Alternativa descartada: Validación solo en el backend (sin async en frontend)
Se consideró mantener la validación solo en el servidor (cuando el usuario hace submit) y mostrar el error via toast. Se descartó porque:
- La experiencia de usuario es pobre — el usuario completa todo el formulario antes de saber que el slug está tomado
- El slug es un campo que el usuario debe corregir antes de poder enviar
- La validación asíncrona con feedback visual mejora significativamente la UX

### Alternativa descartada: useState en lugar de useReducer
Se consideró mantener el estado de validación con dos `useState` separados (`slugStatus` + `slugError`). Se descartó porque:
- Dos estados separados pueden derivar en estados inconsistentes (ej. `status: 'taken'` sin `error`).
- La lógica de transición está dispersa en múltiples `setSlugStatus`/`setSlugError` dentro del efecto.
- El reducer es una función pura exportable: testeable sin mocking de React, manteniendo el componente delgado.
- El patrón `useReducer` alinea con la recomendación de React para lógica de estado compleja con múltiples sub-valores.

### Alternativa descartada: Slug auto-generado y bloqueado (sin edición manual)
Se consideró generar el slug automáticamente y no permitir al usuario editarlo. Se descartó porque:
- Los usuarios avanzados (owners/admin) pueden querer slugs personalizados para SEO
- El campo slug ya existe y es editable en la UI actual
- La validación asíncrona permite mantener editable el campo mientras se verifica disponibilidad

## 10. Compatibilidad hacia atrás

- `productBySlug(slug)` sin `tenantId` funciona exactamente como antes (R1)
- La interfaz `IProductRepository` se extiende, no se modifica — los mocks existentes fallarán si no incluyen el nuevo método (se deben actualizar)
- El formulario de edición existente (`product.id !== ''`) conserva su comportamiento, solo añade validación visual
- `updateProductInfo` y `getProductBySlug` no requieren cambios — siguen funcionando igual
