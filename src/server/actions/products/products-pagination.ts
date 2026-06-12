'use server';

import { prismaDbClient } from "@/src/config/database/prisma-client";
import { Product } from "@/src/core/entities";
import { TPaginateData } from "@/src/core/types";
import { ProductRepository } from "../../repositories";
import type { Fail } from "@/src/core/utils";

type Props = {
  page?: number;
  take?: number;
  category?: string;
};

const productRepository = new ProductRepository(prismaDbClient);

export const getPaginatedProductsWithImages = async (props: Props) => {
  const { page = 1, take = 10, category } = props;

  const pageNumber = page < 1 ? 1 : Number(page);
  const takeNumber = take < 1 ? 1 : Number(take);

  const result = await Promise.all([
    productRepository.listProducts({
      page: pageNumber,
      take: takeNumber,
      category,
    }),
    productRepository.countProducts({
      page: pageNumber,
      take: takeNumber,
      category,
    })
  ]);

  const [products, countProducts] = result;

  if (!products.isOk || !countProducts.isOk) {
    const err = (products as Fail).error || (countProducts as Fail).error;
    console.error(err);
    
    throw err;
  }

  return {
    ...countProducts.data,
    data: products.data,
  } as TPaginateData<Product[]>;
} 
