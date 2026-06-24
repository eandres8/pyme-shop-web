import { PrismaClient } from "@/prisma/generated/prisma/client";
import { Category } from "@/src/core/entities";
import { Logger, Result, to } from "@/src/core/utils";
import type { ICategoryRepository } from "../interfaces";


export function CategoryRepository(client: PrismaClient): ICategoryRepository {
  const logger = Logger('CategoryRepository');
  const category = client.category;

  const createCategories = async (categories: string[]) => {
    const categoryList = categories.map((c) =>
      category.create({
        data: { name: c },
      }),
    );

    const [data, error] = await to(client.$transaction(categoryList));

    if (error) {
      logger.error({ error });
      return Result.failure(
        new Error(error?.message || "Error insertando categorías"),
      );
    }

    return Result.success(data.map((c) => Category.fromJson(c)));
  };

  const listCategories = async (tenantId?: string) => {
    const [data, error] = await to(category.findMany({
      where: tenantId ? { tenant_id: tenantId } : undefined,
    }));

    if (error) {
      logger.error({ error });
      return Result.failure(
        new Error(error?.message || "Error insertando categorías"),
      );
    }

    return Result.success(data.map((c) => Category.fromJson(c)));
  }

  const createCategoriesForTenant = async (tenantId: string, categories: string[]) => {
    const categoryList = categories.map((c) =>
      category.create({
        data: { name: c, tenant_id: tenantId },
      }),
    );

    const [data, error] = await to(client.$transaction(categoryList));

    if (error) {
      logger.error({ error });
      return Result.failure(
        new Error(error?.message || "Error insertando categorías para tenant"),
      );
    }

    return Result.success(data.map((c) => Category.fromJson(c)));
  };

  return {
    createCategories,
    createCategoriesForTenant,
    listCategories,
  };
}