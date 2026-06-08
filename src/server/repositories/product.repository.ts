import { PrismaClient } from "@/prisma/generated/prisma/client";
import { Product } from "@/src/core/entities";

import { TPagination } from "@/src/core/types";
import { TProductEntity } from "@/src/core/types/product.type";
import { Result, Logger, to } from "@/src/core/utils";

type TListProps = {
  page: number;
  take: number;
  category?: string;
};

export class ProductRepository {
  private readonly logger = Logger("ProductRepository");

  constructor(private readonly client: PrismaClient) {}

  async listProducts({ page, take, category }: TListProps) {
    const [result, error] = await to(
      this.client.product.findMany({
        take,
        skip: (page - 1) * take,
        include: {
          productImages: {
            take: 2,
            select: { url: true },
          },
        },
        where: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          gender: category as any,
        },
      }),
    );

    if (error) {
      this.logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error consultando productos"),
      );
    }

    return Result.success(
      result.map((p) =>
        Product.fromJson({
          ...p,
          images: p.productImages.map((pi) => pi.url),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any),
      ),
    );
  };

  async countProducts({ page, take, category }: TListProps) {
    const [result, error] = await to(
      this.client.product.count({
        where: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          gender: category as any,
        },
      }),
    );

    if (error) {
      this.logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error consultando cantidad de productos"),
      );
    }

    const resultData: TPagination = {
      currentPage: page,
      totalPages: Math.ceil(result / take),
    };

    return Result.success(resultData);
  }

  async createMultiple(products: Product[]) {
    const operations = products.map((p) => {
      return this.client.product.create({
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

    const [data, error] = await to(this.client.$transaction(operations));

    if (error) {
      this.logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error insertando datos"),
      );
    }

    return Result.success(data);
  }

  async productBySlug(slug: string) {
    const [data, error] = await to(
      this.client.product.findFirst({
        where: {
          slug,
        },
        include: {
          productImages: {
            select: { url: true },
          },
        }
      }),
    );

    if (error) {
      this.logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error insertando datos"),
      );
    }

    return Result.success(Product.fromEntity(data as unknown as TProductEntity));
  }
}
