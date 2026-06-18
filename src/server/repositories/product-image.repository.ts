import { PrismaClient } from "@/prisma/generated/prisma/client";
import { DeleteProductImage } from "@/src/core/entities";
import { Logger, Result, to } from "@/src/core/utils";

export function ProductImageRepository(client: PrismaClient) {
  const logger = Logger("ProductImageRepository");

  const deleteImage = async (imageId: string) => {
    const [data, error] = await to(client.productImage.delete({
      where: {
        id: imageId,
      },
      select: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        }
      }
    }));

    if (error) {
      logger.error('deleteImage::Failed to delete image from database', { error });
      return Result.failure(new Error(error.message || "Error eliminando la imagen del producto"));
    }

    return Result.success(DeleteProductImage.fromJson(data));
  }

  return {
    deleteImage,
  };
}