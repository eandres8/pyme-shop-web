import { Product } from "@/src/core/entities";
import type { TPagination, TProductUpdate, TProductStatus } from "@/src/core/types";
import { Result } from "@/src/core/utils";

export type TListProps = {
  page: number;
  take: number;
  category?: string;
  tenantId?: string;
  status?: TProductStatus;
  showAll?: boolean;
};

export interface IProductRepository {
  listProducts(props: TListProps): Promise<Result<Product[]>>;
  countProducts(props: TListProps): Promise<Result<TPagination>>;
  createMultiple(products: Product[]): Promise<Result<Product[]>>;
  productBySlug(slug: string, tenantId?: string): Promise<Result<Product>>;
  productExistsBySlug(slug: string, tenantId: string): Promise<Result<boolean>>;
  listProductsByIds(productIdList: string[]): Promise<Result<Product[]>>;
  updateProductInfo(product: TProductUpdate, images: File[]): Promise<Result<Product>>;
}
