'use server';

import { productRepository } from "../../providers";

export async function getProductStockBySlug(slug: string, tenantId?: string): Promise<number> {
  const result = await productRepository.productBySlug(slug, tenantId);

  if (!result.isOk) {
    return 0;
  }

  return result.data.inStock;
}
