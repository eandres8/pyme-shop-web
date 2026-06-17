'use server';

import { prismaDbClient } from "@/src/config/database/prisma-client";
import { ProductRepository } from "../../repositories";

const productRepository = new ProductRepository(prismaDbClient);

export async function getProductStockBySlug(slug: string): Promise<number> {
  const result = await productRepository.productBySlug(slug);

  if (!result.isOk) {
    return 0;
  }

  return result.data.inStock;
}
