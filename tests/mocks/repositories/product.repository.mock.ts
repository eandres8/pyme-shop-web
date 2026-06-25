import { Result } from "@/src/core/utils";
import type { IProductRepository, TListProps } from "@/src/server/interfaces";

type MockOverrides = {
  listProducts?: (props: TListProps) => ReturnType<IProductRepository["listProducts"]>;
  countProducts?: (props: TListProps) => ReturnType<IProductRepository["countProducts"]>;
  createMultiple?: (products: unknown[]) => ReturnType<IProductRepository["createMultiple"]>;
  productBySlug?: (slug: string, tenantId?: string) => ReturnType<IProductRepository["productBySlug"]>;
  productExistsBySlug?: (slug: string, tenantId: string) => ReturnType<IProductRepository["productExistsBySlug"]>;
  listProductsByIds?: (ids: string[]) => ReturnType<IProductRepository["listProductsByIds"]>;
  updateProductInfo?: (product: Record<string, unknown>, images: File[]) => ReturnType<IProductRepository["updateProductInfo"]>;
};

export function MockProductRepository(overrides: MockOverrides = {}): IProductRepository {
  return {
    listProducts: overrides.listProducts ?? (async () => Result.success([])),
    countProducts: overrides.countProducts ?? (async () => Result.success({ currentPage: 1, totalPages: 1 })),
    createMultiple: overrides.createMultiple ?? (async () => Result.success([])),
    productBySlug: overrides.productBySlug ?? (async () => Result.success(null as unknown as never)),
    productExistsBySlug: overrides.productExistsBySlug ?? (async () => Result.success(false)),
    listProductsByIds: overrides.listProductsByIds ?? (async () => Result.success([])),
    updateProductInfo: overrides.updateProductInfo ?? (async () => Result.success(null as unknown as never)),
  };
}
