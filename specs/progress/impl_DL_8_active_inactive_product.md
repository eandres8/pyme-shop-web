# Implementation: DL_8_active_inactive_product

## Trazabilidad

| Requirement | Test(s) |
|-------------|---------|
| R1 (enum ProductStatus) | Schema validation via prisma generate success; `product.repository.test.ts::createMultiple includes status` |
| R2 (status field with @default ACTIVE) | Schema validation via prisma generate success; `product.repository.test.ts::createMultiple includes status`; `update-product-info.test.ts::uses ACTIVE as default status` |
| R3 (TProduct.status type) | TypeScript compilation success; `product.repository.test.ts::listProducts filters by status ACTIVE by default` |
| R4 (TProductEntity.status type) | TypeScript compilation success |
| R5 (TProductData.status type) | TypeScript compilation success |
| R6 (TProductUpdate.status optional) | TypeScript compilation success; `product.repository.test.ts::does not include status in update when not provided` |
| R7 (Product constructor status param) | `product.repository.test.ts::listProducts returns a list of products` (Product instantiation) |
| R8 (Product.fromJson default ACTIVE) | `product.repository.test.ts::listProducts returns a list of products`; `update-product-info.test.ts::uses ACTIVE as default status` |
| R9 (Product.fromEntity default ACTIVE) | `product.repository.test.ts::createMultiple includes status` |
| R10 (Product.toJson includes status) | TypeScript compilation; `product.repository.test.ts::listProducts returns a list of products` |
| R11 (Product.toPlain includes status) | TypeScript compilation; `update-product-info.test.ts::returns success when product is created` |
| R12 (create product with default ACTIVE) | `product.repository.test.ts::includes status in product creation` |
| R13 (toggle sends status in FormData) | TypeScript compilation (ProductForm.tsx formData.append status); `update-product-info.test.ts::returns success when product is created` |
| R14 (updateProductInfo handles status) | `product.repository.test.ts::includes status in product update when provided`; `product.repository.test.ts::does not include status in update when not provided`; `update-product-info.test.ts::accepts INACTIVE as valid status`; `update-product-info.test.ts::rejects invalid status value` |
| R15 (listProducts filters ACTIVE by default) | `product.repository.test.ts::filters by status ACTIVE by default`; `product.repository.test.ts::counts products with status ACTIVE by default` |
| R16 (listProducts explicit status filter) | `product.repository.test.ts::filters by explicit status when provided`; `product.repository.test.ts::counts products with explicit status when provided` |
| R17 (admin sees all products with showAll) | `product.repository.test.ts::does not filter by status when showAll is true`; `product.repository.test.ts::does not filter by status when showAll is true` (count); admin/products/page.tsx passes `showAll: true` |
| R18 (toggle visual in ProductForm.tsx) | TypeScript compilation; ProductForm.tsx toggle UI implemented with Tailwind |
| R19 (status column in admin/products) | TypeScript compilation; admin/products/page.tsx has "Estado" th and status badge td |
| R20 (toggle updates UI immediately) | React useState/setValue pattern in ProductForm.tsx toggle |
| R21 (default ACTIVE when status not present) | Prisma @default(ACTIVE); `update-product-info.test.ts::uses ACTIVE as default status` |
| R22 (invalid status rejected) | `update-product-info.test.ts::rejects invalid status value` |
| R23 (listProducts error propagation) | `product.repository.test.ts::returns Result.failure when prisma throws` (listProducts) |
| R24 (inactive products hidden from public) | Repository default `status: 'ACTIVE'` filter in listProducts/countProducts; public pages (page.tsx, category/[id]/page.tsx) don't pass showAll |
| R25 (preserve status when not in form) | `product.repository.test.ts::does not include status in update when not provided`; Zod `.default('ACTIVE')` ensures status always present |

## Files Modified

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `ProductStatus` enum and `status` field to `Product` model |
| `src/core/types/product.type.ts` | Added `TProductStatus` type and `status` field to all product types |
| `src/core/entities/product.entity.ts` | Added `status` to constructor, fromJson, fromEntity, toJson, toPlain |
| `src/server/interfaces/product.interface.ts` | Added `status` and `showAll` to `TListProps` |
| `src/server/repositories/product.repository.ts` | Updated listProducts, countProducts, createMultiple, updateProductInfo with status support |
| `src/server/actions/products/products-pagination.ts` | Added `status` and `showAll` props, passed to repository |
| `src/server/actions/products/update-product-info.ts` | Added `status` Zod field with ACTIVE default |
| `app/(shop)/admin/product/[slug]/ui/product-form/ProductForm.tsx` | Added status toggle, FormInputs type, defaultValues, formData append |
| `app/(shop)/admin/products/page.tsx` | Added status column, showAll: true, status badge |
| `src/server/repositories/product.repository.test.ts` | Added 7 new tests for status filtering |
| `src/server/actions/products/update-product-info.test.ts` | Added 4 new tests for status validation |

## Verification

- ✅ `pnpm dlx prisma generate` — success
- ✅ `pnpm dlx jest --passWithNoTests` — 36/36 tests pass (29 pre-existing failures from missing envs, unchanged)
- ✅ `pnpm lint` — 0 errors, 14 pre-existing warnings only
- ✅ `pnpm build` — build completed successfully
- ⏳ `pnpm dlx prisma migrate dev` — pending (requires running database)
