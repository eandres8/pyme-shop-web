'use server';

import { prismaDbClient } from "@/src/config/database/prisma-client";
import { Product } from "@/src/core/entities";
import { TPaginateData } from "@/src/core/types";
import { ProductRepository } from "@/src/data/repositories";

type Props = {
  page?: number;
  take?: number;
};

const productRepository = ProductRepository(prismaDbClient);

export const getPaginatedProductsWithImages = async (props: Props) => {
  const { page = 1, take = 10 } = props;

  const pageNumber = page < 1 ? 1 : Number(page);
  const takeNumber = take < 1 ? 1 : Number(take);

  const result = await Promise.all([
    productRepository.listProducts({
      page: pageNumber,
      take: takeNumber,
    }),
    productRepository.countProducts({
      page: pageNumber,
      take: takeNumber,
    })
  ]);

  const [products, countProducts] = result;

  if (!products.isOk || !countProducts.isOk) {
    console.error(products.getError() || countProducts.getError());
    return {
      currentPage: 1,
      totalPages: 0,
      data: [],
    } as TPaginateData<Product[]>;
  }

  return {
    ...countProducts.data(),
    data: products.data<Product[]>(),
  } as TPaginateData<Product[]>;
} 
