# DL_8_active_inactive_product — Design

> Decisiones técnicas para implementar el sistema de status ACTIVE/INACTIVE en productos.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  Prisma Schema                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  model Product {                                              │   │
│  │    ...                                                        │   │
│  │    status  ProductStatus  @default(ACTIVE)                   │   │
│  │  }                                                            │   │
│  │  enum ProductStatus { ACTIVE  INACTIVE }                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Core Layer                                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  TProduct.status: ProductStatus                              │   │
│  │  TProductEntity.status: ProductStatus                        │   │
│  │  TProductData.status: ProductStatus                          │   │
│  │  TProductUpdate.status?: ProductStatus | undefined           │   │
│  │  Product { readonly status: ProductStatus }                  │   │
│  │    .fromJson() → status ?? 'ACTIVE'                          │   │
│  │    .fromEntity() → status ?? 'ACTIVE'                        │   │
│  │    .toJson() → { status }                                    │   │
│  │    .toPlain() → { status }                                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Server Layer                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Repository:                                                 │   │
│  │    listProducts({ ...filters, status? })                     │   │
│  │      → where: { status: status ?? 'ACTIVE' }                 │   │
│  │    countProducts({ ...filters, status? })                    │   │
│  │      → where: { status: status ?? 'ACTIVE' }                 │   │
│  │    updateProductInfo(product, images)                         │   │
│  │      → data: { status: product.status }                      │   │
│  │                                                              │   │
│  │  Actions:                                                    │   │
│  │    getPaginatedProductsWithImages → default status='ACTIVE'  │   │
│  │    updateProductInfo → Zod validates status field            │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Client/UI Layer                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ProductForm.tsx: toggle ACTIVE/INACTIVE                     │   │
│  │  admin/products: status column (green=ACTIVE, red=INACTIVE)  │   │
│  │  /, /category/[id]: only ACTIVE (filtered at repo level)    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Data Flow

### Flow A — Creación de producto (status por defecto ACTIVE)
1. Usuario navega a `/admin/product/new`
2. `ProductForm` renderiza con `product.status` = `undefined` (nuevo)
3. Toggle muestra `ACTIVE` por defecto
4. Al enviar, `FormData` incluye `status: 'ACTIVE'` (o el valor del toggle)
5. `updateProductInfo` valida con Zod → `status: 'ACTIVE'`
6. Repository `updateProductInfo` → Prisma `create({ data: { ...productData, status } })`
7. Prisma aplica `@default(ACTIVE)` si no se provee

### Flow B — Edición de producto existente
1. Usuario navega a `/admin/product/{slug}`
2. `page.tsx` llama `getProductBySlug(slug)` → retorna `Product` con `status`
3. `ProductForm` renderiza con `product.status` (ACTIVE o INACTIVE)
4. Toggle muestra el status actual
5. Usuario cambia toggle → estado local actualizado
6. Al enviar, `FormData` incluye `status: 'INACTIVE'` (o el valor del toggle)
7. `updateProductInfo` valida con Zod → `status: 'INACTIVE'`
8. Repository `updateProductInfo` → Prisma `update({ data: { status } })`

### Flow C — Listado público (solo activos)
1. Usuario visita `/` o `/category/[id]`
2. Server component llama `getPaginatedProductsWithImages({})`
3. Repository `listProducts` usa `where: { status: 'ACTIVE' }` por defecto
4. Repository `countProducts` usa `where: { status: 'ACTIVE' }` por defecto
5. Solo productos activos se renderizan

### Flow D — Listado admin (todos)
1. Admin visita `/admin/products`
2. Server component llama `getPaginatedProductsWithImages({})`
3. Se agrega parámetro `showAll: true` para admin → repository no filtra por status
4. Se muestran todos los productos con indicador de status

## 3. Files to Create

| Archivo | Propósito | Cubre R |
|---------|-----------|---------|
| No hay archivos nuevos que crear | — | — |

## 4. Files to Modify

| Archivo | Cambio | Cubre R |
|---------|--------|---------|
| `prisma/schema.prisma` | Agregar enum `ProductStatus { ACTIVE INACTIVE }` y campo `status` al modelo `Product` con `@default(ACTIVE)` | R1, R2 |
| `src/core/types/product.type.ts` | Agregar campo `status` a `TProduct`, `TProductEntity`, `TProductData`, `TProductUpdate` | R3, R4, R5, R6 |
| `src/core/entities/product.entity.ts` | Agregar `readonly status: ProductStatus` al constructor, modificar `fromJson`, `fromEntity`, `toJson`, `toPlain` | R7, R8, R9, R10, R11 |
| `src/server/interfaces/product.interface.ts` | Agregar `status?: ProductStatus` a `TListProps` | R15, R16, R17 |
| `src/server/repositories/product.repository.ts` | Modificar `listProducts` y `countProducts` para filtrar por `status` (default `ACTIVE`). Modificar `createMultiple` y `updateProductInfo` para incluir `status` | R12, R14, R15, R16, R17, R24 |
| `src/server/actions/products/products-pagination.ts` | Agregar parámetro `status` opcional y `showAll` al tipo `Props`. Default `status: 'ACTIVE'` para público | R15, R16, R17 |
| `src/server/actions/products/update-product-info.ts` | Agregar `status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE')` al `productSchema` | R14 |
| `app/(shop)/admin/product/[slug]/ui/product-form/ProductForm.tsx` | Agregar campo `status` al `FormInputs`, toggle visual con Tailwind, incluir `status` en `formData` al enviar | R13, R18, R20 |
| `app/(shop)/admin/products/page.tsx` | Agregar columna "Estado" a la tabla, pasar `showAll: true` a la paginación | R17, R19 |
| `app/(shop)/page.tsx` | Asegurar que se pase `status: 'ACTIVE'` (implícito por defecto en repository) | R24 |
| `app/(shop)/category/[id]/page.tsx` | Asegurar que se pase `status: 'ACTIVE'` (implícito por defecto en repository) | R24 |
| `tests/mocks/repositories/product.repository.mock.ts` | Actualizar `MockOverrides` y default de `listProducts`/`countProducts` para incluir `status` | R15, R16, R17 |

## 5. Firma de nuevos/modify métodos

### Tipos (`src/core/types/product.type.ts`)

```typescript
export type TProductStatus = 'ACTIVE' | 'INACTIVE';

export type TProduct = {
  // ... campos existentes ...
  readonly status: TProductStatus;
}

export type TProductEntity = {
  // ... campos existentes ...
  readonly status: TProductStatus;
}

export type TProductData = {
  // ... campos existentes ...
  readonly status: TProductStatus;
}

export type TProductUpdate = {
  // ... campos existentes ...
  readonly status?: TProductStatus;
};
```

### Entity (`src/core/entities/product.entity.ts`)

```typescript
export class Product {
  private constructor(
    readonly id: string,
    // ... campos existentes ...
    readonly status: TProductStatus,
    readonly tenant: TTenantInfo,
  ) {}

  static fromJson(data: Partial<TProduct>) {
    return new Product(
      data?.id || "",
      // ... campos existentes ...
      data?.status || 'ACTIVE',
      { ... tenant info ... },
    );
  }

  static fromEntity(data: Partial<TProductEntity>) {
    return new Product(
      data?.id || "",
      // ... campos existentes ...
      data?.status || 'ACTIVE',
      { ... tenant info ... },
    );
  }

  toJson(): Partial<TProduct> {
    return {
      // ... campos existentes ...
      status: this.status,
    };
  }

  toPlain(): Partial<TProductData> {
    return {
      // ... campos existentes ...
      status: this.status,
    };
  }
}
```

### Repository interface (`src/server/interfaces/product.interface.ts`)

```typescript
export type TListProps = {
  page: number;
  take: number;
  category?: string;
  tenantId?: string;
  status?: TProductStatus;  // Nuevo: default 'ACTIVE'
  showAll?: boolean;       // Nuevo: si true, ignora filtro de status
};
```

### Repository implementation (`src/server/repositories/product.repository.ts`)

```typescript
// Modificar listProducts
const listProducts = async ({ page, take, category, tenantId, status, showAll }: TListProps) => {
  const [result, error] = await to(
    client.product.findMany({
      take,
      skip: (page - 1) * take,
      include: { ... },
      where: {
        gender: category as any,
        ...(tenantId ? { tenant_id: tenantId } : {}),
        ...(!showAll ? { status: status ?? 'ACTIVE' } : {}),
      },
    }),
  );
  // ... resto sin cambios ...
}

// Modificar countProducts
const countProducts = async ({ page, take, category, tenantId, status, showAll }: TListProps) => {
  const [count, error] = await to(
    client.product.count({
      where: {
        gender: category as any,
        ...(tenantId ? { tenant_id: tenantId } : {}),
        ...(!showAll ? { status: status ?? 'ACTIVE' } : {}),
      },
    }),
  );
  // ... resto sin cambios ...
}

// Modificar createMultiple — incluir status
const createMultiple = async (products: Product[]) => {
  const operations = products.map((p) => {
    return client.product.create({
      data: {
        ...campos existentes...,
        status: p.status ?? 'ACTIVE',
      },
    });
  });
  // ... resto sin cambios ...
}
```

### Server action updateProductInfo (`src/server/actions/products/update-product-info.ts`)

```typescript
const productSchema = z.object({
  // ... campos existentes ...
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

// En la función updateProductInfo:
const product = {
  ...productParsed.data,
  slug: productParsed.data.slug.toLowerCase().replaceAll(/ /g, '_').trim(),
  tenantId: session?.user?.tenant,
} as TProductUpdate;

// El repository updateProductInfo debe incluir status en el update
```

### ProductForm.tsx — Toggle de status

```tsx
// Nuevo campo en FormInputs
type FormInputs = {
  // ... campos existentes ...
  status: 'ACTIVE' | 'INACTIVE';
};

// En defaultValues
defaultValues: {
  // ... campos existentes ...
  status: product.status || 'ACTIVE',
};

// Toggle visual (Tailwind)
<div className="flex flex-col mb-2">
  <span className="text-sm font-bold">Estado</span>
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => setValue('status', getValues('status') === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        {
          "bg-green-500": getValues('status') === 'ACTIVE',
          "bg-gray-400": getValues('status') === 'INACTIVE',
        }
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          {
            "translate-x-6": getValues('status') === 'ACTIVE',
            "translate-x-1": getValues('status') === 'INACTIVE',
          }
        )}
      />
    </button>
    <span className={clsx("text-sm font-medium", {
      "text-green-600": getValues('status') === 'ACTIVE',
      "text-gray-500": getValues('status') === 'INACTIVE',
    })}>
      {getValues('status') === 'ACTIVE' ? 'Activo' : 'Inactivo'}
    </span>
  </div>
</div>

// En onSubmit, agregar al FormData:
formData.append('status', productInfo.status);
```

### admin/products/page.tsx — Columna de estado

```tsx
// Nuevo th
<th scope="col" className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
  Estado
</th>

// Nuevo td
<td className="text-sm font-light px-6">
  <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", {
    "bg-green-100 text-green-800": p.status === 'ACTIVE',
    "bg-red-100 text-red-800": p.status === 'INACTIVE',
  })}>
    {p.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
  </span>
</td>

// Pasar showAll: true para admin
const { data: products, currentPage, totalPages } = await getPaginatedProductsWithImages({
  page: page ? Number(page) : undefined,
  showAll: true,
});
```

### Server action products-pagination — Soporte showAll

```typescript
type Props = {
  page?: number;
  take?: number;
  category?: string;
  status?: ProductStatus;
  showAll?: boolean;
};

export async function getPaginatedProductsWithImages(
  props: Props,
): Promise<TPaginateData<Product[]>> {
  const { page = 1, take = 10, category, status, showAll } = props;
  // ...
  const result = await Promise.all([
    productRepository.listProducts({
      page: pageNumber,
      take: takeNumber,
      category,
      status,
      showAll,
    }),
    productRepository.countProducts({
      page: pageNumber,
      take: takeNumber,
      category,
      status,
      showAll,
    }),
  ]);
  // ...
}
```

## 6. Migration strategy

Después de modificar `prisma/schema.prisma`, ejecutar:
```bash
pnpm dlx prisma generate
pnpm dlx prisma migrate dev --name add_product_status
```

La migración creará el enum `ProductStatus` y el campo `status` con default `ACTIVE` en registros existentes.

## 7. Error handling strategy

| Escenario | Dónde se captura | Respuesta |
|-----------|-------------------|-----------|
| Status inválido en FormData | Zod en `updateProductInfo` | `{ success: false, message: "Invalid enum value" }` |
| Status no presente en FormData | Zod `.default('ACTIVE')` | Se usa `ACTIVE` por defecto |
| Error de DB en repository | `to()` wrapper en repository | `Result.failure(Error)` → server action propaga error |
| Producto inactivo en listing público | Repository filtra `status: 'ACTIVE'` | No aparece en resultados |
| Toggle en UI sin estado | `defaultValue` en `useForm` | Muestra el status actual del producto |

## 8. Testing strategy

### Tests unitarios

| Test | Archivo | R cubierto |
|------|---------|------------|
| `listProducts` filtra por `status: 'ACTIVE'` por defecto | `product.repository.test.ts` | R15 |
| `listProducts` con `showAll: true` retorna todos | `product.repository.test.ts` | R17 |
| `listProducts` con `status: 'INACTIVE'` filtra correctamente | `product.repository.test.ts` | R16 |
| `countProducts` filtra por `status: 'ACTIVE'` por defecto | `product.repository.test.ts` | R15 |
| `countProducts` con `showAll: true` cuenta todos | `product.repository.test.ts` | R17 |
| `createMultiple` incluye `status` en la creación | `product.repository.test.ts` | R12 |
| `updateProductInfo` actualiza `status` | `product.repository.test.ts` | R14 |
| `updateProductInfo` server action valida `status` con Zod | `update-product-info.test.ts` | R14 |
| `updateProductInfo` usa default `ACTIVE` cuando no se provee `status` | `update-product-info.test.ts` | R14, R22 |
| `Product.fromJson` usa `ACTIVE` por defecto | entity tests | R8 |
| `Product.fromEntity` usa `ACTIVE` por defecto | entity tests | R9 |
| `Product.toJson` incluye `status` | entity tests | R10 |
| `Product.toPlain` incluye `status` | entity tests | R11 |
| Mock de `listProducts` con `status` | `product.repository.mock.ts` | R15 |

### Tests de integración / componente
Los tests de componente para `ProductForm.tsx` y la tabla de admin requieren un entorno de testing con React Testing Library. Dado que el proyecto actualmente no tiene RTL configurado, estos tests se documentan como deuda técnica (no requeridos en esta fase). La verificación se hace mediante:
- Tests unitarios de las funciones puras (entity, repository)
- Tests de las server actions
- Verificación manual del flujo completo

### Mocks necesarios

- Actualizar `tests/mocks/repositories/product.repository.mock.ts` para incluir `status` en `TListProps`

## 9. Alternativa descartada

### Alternativa descartada: Campo boolean `is_active` en lugar de enum `ProductStatus`
Se consideró usar un campo `is_active: Boolean @default(true)` en lugar de un enum. Se descartó porque:
- Un enum es más explícito y permite extender a futuros estados (ej. `DRAFT`, `ARCHIVED`) sin cambiar el tipo de dato
- El enum `ProductStatus` genera tipos TypeScript automáticos desde Prisma, evitando inconsistencias
- La semántica de `ACTIVE`/`INACTIVE` es más clara que `true`/`false` en el contexto de negocio

### Alternativa descartada: Filtrado de status solo a nivel de server action (sin cambio en repository)
Se consideró filtrar productos inactivos solo en las server actions (`getPaginatedProductsWithImages`) y no en el repository. Se descartó porque:
- La filtración a nivel de repository es más eficiente (se filtra en la query SQL, no en memoria)
- Cualquier consumidor del repository obtiene el comportamiento correcto por defecto
- Evita duplicar la lógica de filtrado en múltiples server actions

### Alternativa descartada: Toggle inline en tabla admin (sin usar `updateProductInfo`)
Se consideró crear una server action dedicada `toggleProductStatus(id)` para cambiar el status directamente desde la tabla admin sin pasar por el formulario completo. Se descartó porque:
- El acceptance criteria indica que el toggle debe estar en `ProductForm.tsx` (formulario de edición)
- Mantener un solo punto de actualización (`updateProductInfo`) simplifica la lógica y los tests
- El flujo de edición completa es más seguro para cambios de estado (el usuario confirma con "Guardar")

## 10. Compatibilidad hacia atrás

- Los productos existentes en la DB obtendrán `status: 'ACTIVE'` automáticamente gracias al `@default(ACTIVE)` de Prisma en la migración
- La interfaz `IProductRepository` se modifica (`TListProps` añade campos opcionales) — los mocks existentes funcionan sin cambios ya que los campos son opcionales
- `Product.fromJson` y `Product.fromEntity` usan `ACTIVE` como default cuando el dato no existe — backward compatible con datos pre-migración
- Las server actions existentes que llaman `listProducts` sin `status` ahora reciben `ACTIVE` por defecto — comportamiento esperado
- `getProductBySlug` no cambia: retorna un producto individual (puede ser ACTIVE o INACTIVE) para uso en admin
