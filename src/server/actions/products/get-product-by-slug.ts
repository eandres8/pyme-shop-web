'use server';

import { Product } from "@/src/core/entities";
import type { IProductRepository } from "../../interfaces";
import { inject } from "../../providers";

function getProductBySlugAction(productRepository: IProductRepository) {
  return async (slug: string): Promise<Product> => {
    const result = await productRepository.productBySlug(slug);

    if (!result.isOk) {
      return Product.fromJson({});
    }

    return result.data;
  };
}

export const getProductBySlug = getProductBySlugAction(inject("productRepository") as IProductRepository);
