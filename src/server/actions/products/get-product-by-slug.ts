'use server';

import { prismaDbClient } from "@/src/config/database/prisma-client";
import { Product } from "@/src/core/entities";
import { ProductRepository } from "../../repositories";

const productRepository = new ProductRepository(prismaDbClient);

export const getProductBySlug = async (slug: string) => {
  const result = await productRepository.productBySlug(slug);

  return result.data<Product>();
}
