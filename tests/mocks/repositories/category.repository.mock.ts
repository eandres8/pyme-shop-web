import { Result } from "@/src/core/utils";
import type { ICategoryRepository } from "@/src/server/interfaces";

type MockOverrides = {
  createCategories?: (categories: string[]) => ReturnType<ICategoryRepository["createCategories"]>;
  createCategoriesForTenant?: () => ReturnType<ICategoryRepository["createCategoriesForTenant"]>;
  listCategories?: () => ReturnType<ICategoryRepository["listCategories"]>;
};

export function MockCategoryRepository(overrides: MockOverrides = {}): ICategoryRepository {
  return {
    createCategories: overrides.createCategories ?? (async () => Result.success([])),
    createCategoriesForTenant: overrides.createCategoriesForTenant ?? (async () => Result.success([])),
    listCategories: overrides.listCategories ?? (async () => Result.success([])),
  };
}
