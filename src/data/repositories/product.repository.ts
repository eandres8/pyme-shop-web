import { PrismaClient } from "@/prisma/generated/prisma/client";
import { Product } from "@/src/core/entities";
import { Logger, Result, to } from "../core";
import { TPagination } from "@/src/core/types";

type TListProps = {
  page: number;
  take: number;
};

export function ProductRepository(client: PrismaClient) {
  const logger = Logger('ProductRepository');

  const listProducts = async ({ page, take }: TListProps) => {
    const [result, error] = await to(client.product.findMany({
      take,
      skip: ( page - 1 ) * take,
      include: {
        productImages: {
          take: 2,
          select: { url: true }
        },
      }
    }));

    if (error) {
      logger.log({ error });
      return Result.failure(new Error(error?.message || 'Error consultando productos'));
    }

    return Result.success(result.map((p) => Product.fromJson({
      ...p,
      images: p.productImages.map((pi) => pi.url),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)));
  }

  const countProducts = async ({ page, take }: TListProps) => {
    const [result, error] = await to(client.product.count({}));

    if (error) {
      logger.log({ error });
      return Result.failure(new Error(error?.message || 'Error consultando cantidad de productos'));
    }

    const resultData: TPagination = {
      currentPage: page,
      totalPages: Math.ceil(result / take),
    }; 

    return Result.success(resultData);
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
    countProducts,
  };
}
