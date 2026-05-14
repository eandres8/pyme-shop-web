'use server';

import { to } from "@/src/data/core";
import { ProductRepository } from "@/src/data/repositories";
import { initialData } from "@/src/data/seed/seed";

// type Props = {};f

const data = initialData.products;

const productRepository = new ProductRepository();

export const getPaginatedProductsWithImages = async () => {
  const [result, error] = await to(productRepository.listProducts());

  if (error) {
    console.error(error);
  }

  console.log('result');
  console.log(data);
  console.log(result);

  return result;
} 
