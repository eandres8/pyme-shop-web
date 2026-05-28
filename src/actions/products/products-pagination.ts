'use server';

import { prismaDbClient } from "@/src/config/database/prisma-client";
import { to } from "@/src/data/core";
import { ProductRepository } from "@/src/data/repositories";
// type Props = {};

const productRepository = new ProductRepository(prismaDbClient);

export const getPaginatedProductsWithImages = async () => {
  const [result, error] = await to(productRepository.listProducts());

  if (error) {
    console.error(error);
  }

  console.log({ result });

  return result;
} 
