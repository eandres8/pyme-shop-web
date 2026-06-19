'use server';

import { inject } from "../../providers";
import type { TCategory } from "@/src/core/types";
import type { ICategoryRepository } from "../../interfaces";

function getCategoryListAction(categoryRepository: ICategoryRepository) {
  return async (): Promise<TCategory[]> => {
    const result = await categoryRepository.listCategories();

    if (!result.isOk) {
      return [];
    }

    return result.data.map(({ id, name }) => ({ id, name }));
  };
}

export const getCategoryList = getCategoryListAction(inject("categoryRepository") as ICategoryRepository);
