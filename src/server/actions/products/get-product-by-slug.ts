'use server';

import { prismaDbClient } from "@/src/config/database/prisma-client";
import { ProductRepository } from "../../repositories";
import { Product } from "@/src/core/entities";

const productRepository = new ProductRepository(prismaDbClient);

export async function getProductBySlug(slug: string): Promise<Product> {
  const result = await productRepository.productBySlug(slug);

  if (!result.isOk) {
    return Product.fromJson({});
  }

  return result.data;
}
