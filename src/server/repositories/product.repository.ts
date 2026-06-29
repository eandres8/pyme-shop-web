import { PrismaClient } from "@/prisma/generated/prisma/client";
import { Product } from "@/src/core/entities";

import type {
  TPagination,
  TProductEntity,
  TProductUpdate,
  TSize,
} from "@/src/core/types";
import { Result, Logger, to } from "@/src/core/utils";
import { UploadFilesRepository } from "./upload-files.repository";
import type { IProductRepository, TListProps } from "../interfaces";

const uploadFiles = UploadFilesRepository();

export function ProductRepository(client: PrismaClient): IProductRepository {
  const logger = Logger("ProductRepository");

  const listProducts = async ({ page, take, category, tenantId }: TListProps) => {
    const [result, error] = await to(
      client.product.findMany({
        take,
        skip: (page - 1) * take,
        include: {
          productImages: {
            take: 2,
            select: { url: true, id: true, product_id: true },
          },
          tenant: true,
        },
        where: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          gender: category as any,
          ...(tenantId ? { tenant_id: tenantId } : {}),
        },
      }),
    );

    if (error) {
      logger.log({ error });
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

  const countProducts = async ({ page, take, category, tenantId }: TListProps) => {
    const [result, error] = await to(
      client.product.count({
        where: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          gender: category as any,
          ...(tenantId ? { tenant_id: tenantId } : {}),
        },
      }),
    );

    if (error) {
      logger.log({ error });
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
      return Result.failure(
        new Error(error?.message || "Error insertando datos"),
      );
    }

    return Result.success(data.map((p) => Product.fromEntity(p as unknown as TProductEntity)));
  }

  const productBySlug = async (slug: string, tenantId?: string) => {
    const [data, error] = await to(
      client.product.findFirst({
        where: {
          slug,
          ...(tenantId ? { tenant_id: tenantId } : {}),
        },
        include: {
          productImages: {
            select: { url: true, id: true, product_id: true },
          },
          tenant: true,
        },
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error insertando datos"),
      );
    }

    return Result.success(
      Product.fromEntity(data as unknown as TProductEntity),
    );
  }

  const productExistsBySlug = async (slug: string, tenantId: string) => {
    const [count, error] = await to(
      client.product.count({
        where: {
          slug,
          tenant_id: tenantId,
        },
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(new Error(error?.message || "Error verificando slug"));
    }

    return Result.success(count > 0);
  }

  const listProductsByIds = async (productIdList: string[]) => {
    const [data, error] = await to(
      client.product.findMany({
        where: {
          id: {
            in: productIdList,
          },
        },
        include: {
          tenant: true,
        }
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error consultando productos"),
      );
    }

    return Result.success(
      data.map((p) => Product.fromEntity(p as unknown as TProductEntity)),
    );
  }

  const updateProductInfo = async (product: TProductUpdate, images: File[]) => {
    const { id, tags, sizes, categoryId, inStock, tenantId, ...rest } = product;
    const tagsList = tags.split(",").map((tag) => tag.trim().toLowerCase());

    const [data, error] = await to(
      client.$transaction(async (tx) => {
        let productData: Partial<TProductEntity>;

        if (id) {
          productData = (await client.product.update({
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
          })) as unknown as TProductEntity;
        } else {
          productData = (await client.product.create({
            data: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(rest as any),
              in_stock: inStock,
              category_id: categoryId,
              tenant_id: tenantId,
              sizes: {
                set: sizes as TSize[],
              },
              tags: {
                set: tagsList,
              },
            },
          })) as unknown as TProductEntity;
        }

        const tenant = await tx.tenant.findFirst({ where: { id: tenantId } });

        if (images.length > 0) {
          const imagesUploaded = await uploadFiles.uploadImages(images, tenant?.slug);

          if (!imagesUploaded.isOk) {
            throw new Error(imagesUploaded.error.message || "Error subiendo las imágenes");
          }

          if (!imagesUploaded.data || imagesUploaded.data.length < images.length) {
            throw new Error("Error subiendo las imágenes");
          }

          await tx.productImage.createMany({
            data: imagesUploaded.data.map((url) => ({
              url,
              product_id: productData!.id as string,
            })),
          });
        }

        return productData;
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error consultando productos"),
      );
    }

    return Result.success(Product.fromEntity(data));
  }

  return {
    listProducts,
    countProducts,
    createMultiple,
    productBySlug,
    productExistsBySlug,
    listProductsByIds,
    updateProductInfo,
  };
}
