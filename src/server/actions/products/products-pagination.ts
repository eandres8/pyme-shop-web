"use server";

import { Product } from "@/src/core/entities";
import type { TPaginateData } from "@/src/core/types";
import { Logger, type Fail } from "@/src/core/utils";
import { productRepository } from "../../providers";

type Props = {
  page?: number;
  take?: number;
  category?: string;
};

export async function getPaginatedProductsWithImages(
  props: Props,
): Promise<TPaginateData<Product[]>> {
  const logger = Logger("getPaginatedProductsWithImages");

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
    }),
  ]);

  const [products, countProducts] = result;

  if (!products.isOk || !countProducts.isOk) {
    const err = (products as Fail).error || (countProducts as Fail).error;
    logger.error(err);

    throw err;
  }

  return {
    ...countProducts.data,
    data: products.data,
  } as TPaginateData<Product[]>;
}
