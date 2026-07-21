'use server';

import { Product } from "@/src/core/entities";
import { productRepository } from "../../providers";

export async function getProductBySlug(slug: string, tenantId?: string): Promise<Product> {
  const result = await productRepository.productBySlug(slug, tenantId);

  if (!result.isOk) {
    return Product.fromJson({});
  }

  return result.data;
}
