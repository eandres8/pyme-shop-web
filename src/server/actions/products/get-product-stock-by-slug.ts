'use server';

import { inject } from "../../providers";
import type { IProductRepository } from "../../interfaces";

function getProductStockBySlugAction(productRepository: IProductRepository) {
  return async (slug: string): Promise<number> => {
    const result = await productRepository.productBySlug(slug);

    if (!result.isOk) {
      return 0;
    }

    return result.data.inStock;
  };
}

export const getProductStockBySlug = getProductStockBySlugAction(inject("productRepository") as IProductRepository);
