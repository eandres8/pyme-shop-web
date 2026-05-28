import { PrismaClient } from "@/prisma/generated/prisma/client";
import { Logger, Result, to } from "../core";
import { Category } from "@/src/core/entities";

export function CategoryRepository(client: PrismaClient) {
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

  const listCategories = async () => {
    const [data, error] = await to(category.findMany());

    if (error) {
      logger.error({ error });
      return Result.failure(
        new Error(error?.message || "Error insertando categorías"),
      );
    }

    return Result.success(data.map((c) => Category.fromJson(c)));
  }

  return {
    createCategories,
    listCategories,
  };
}