import { PrismaClient } from "@/prisma/generated/prisma/client";
import { Product } from "@/src/core/entities";

import type {
  TPagination,
  TProductEntity,
  TProductUpdate,
  TSize,
} from "@/src/core/types";
import { Result, Logger, to } from "@/src/core/utils";
import { uploadFiles } from "./upload-files.repository";

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
            select: { url: true, id: true, product_id: true },
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
  }

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
            select: { url: true, id: true, product_id: true },
          },
        },
      }),
    );

    if (error) {
      this.logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error insertando datos"),
      );
    }

    return Result.success(
      Product.fromEntity(data as unknown as TProductEntity),
    );
  }

  async listProductsByIds(productIdList: string[]) {
    const [data, error] = await to(
      this.client.product.findMany({
        where: {
          id: {
            in: productIdList,
          },
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
      data.map((p) => Product.fromEntity(p as TProductEntity)),
    );
  }

  async updateProductInfo(product: TProductUpdate, images: File[]) {
    const { id, tags, sizes, categoryId, inStock, ...rest } = product;
    const tagsList = tags.split(",").map((tag) => tag.trim().toLowerCase());

    const [data, error] = await to(
      this.client.$transaction(async (tx) => {
        let productData: Partial<TProductEntity>;

        if (id) {
          productData = (await this.client.product.update({
            where: { id },
            data: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(rest as any),
              in_stock: inStock,
              category_id: categoryId,
              sizes: {
                set: sizes as TSize[],
              },
              tags: {
                set: tagsList,
              },
            },
          })) as TProductEntity;
        } else {
          productData = (await this.client.product.create({
            data: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(rest as any),
              in_stock: inStock,
              category_id: categoryId,
              sizes: {
                set: sizes as TSize[],
              },
              tags: {
                set: tagsList,
              },
            },
          })) as TProductEntity;
        }

        if (images.length > 0) {
          const imagesUploaded = await uploadFiles(images);

          if (!imagesUploaded || imagesUploaded.length < images.length) {
            throw new Error("Error subiendo las imágenes");
          }

          await tx.productImage.createMany({
            data: imagesUploaded.map((url) => ({
              url,
              product_id: productData!.id as string,
            })),
          });
        }

        return productData;
      }),
    );

    if (error) {
      this.logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error consultando productos"),
      );
    }

    return Result.success(Product.fromEntity(data));
  }
}
