'use server';

import type { TCategory } from "@/src/core/types";
import { categoryRepository } from "../../providers";

export async function getCategoryList(): Promise<TCategory[]> {
  const result = await categoryRepository.listCategories();

  if (!result.isOk) {
    return [];
  }

  return result.data.map(({ id, name }) => ({ id, name }));
};
