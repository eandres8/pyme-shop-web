import { Product } from "@/src/core/entities";
import type { TPagination, TProductUpdate } from "@/src/core/types";
import { Result } from "@/src/core/utils";

export type TListProps = {
  page: number;
  take: number;
  category?: string;
};

export interface IProductRepository {
  listProducts(props: TListProps): Promise<Result<Product[]>>;
  countProducts(props: TListProps): Promise<Result<TPagination>>;
  createMultiple(products: Product[]): Promise<Result<Product[]>>;
  productBySlug(slug: string): Promise<Result<Product>>;
  listProductsByIds(productIdList: string[]): Promise<Result<Product[]>>;
  updateProductInfo(product: TProductUpdate, images: File[]): Promise<Result<Product>>;
}
