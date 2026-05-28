import { PrismaClient } from "@/prisma/generated/prisma/client";
import { Product } from "@/src/core/entities";
import { Logger, Result, to } from "../core";

export function ProductRepository(client: PrismaClient) {
  const logger = Logger('ProductRepository');

  const listProducts = async () => {
    return client.product.findMany({
      include: {
        productImages: {
          take: 2,
        },
      }
    });
  }

  const createMultiple = async (products: Product[]) => {
    const operations = products.map((p) => {
    return client.product.create({
      data: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        in_stock: p.inStock,
        price: p.price,
        sizes: p.sizes,
        tags: p.tags,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gender: p.gender as any,
        category_id: p.categoryId,
        productImages: {
          create: p.images.map((url: string) => ({ url })),
        },
      },
    });
  });

  const [data, error] = await to(client.$transaction(operations));

    if (error) {
      logger.log({ error });
      return Result.failure(new Error(error?.message || 'Error insertando datos'));
    }

    return Result.success(data);
  }

  return {
    createMultiple,
    listProducts,
  };
}
