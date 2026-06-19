"use server";

import { revalidatePath } from "next/cache";

import { Logger } from "@/src/core/utils";
import type {
  IProductImageRepository,
  IUploadFilesRepository,
} from "../../interfaces";
import { inject } from "../../providers";

function deleteProductImageAction(
  productImageRepository: IProductImageRepository,
  uploadFilesRepository: IUploadFilesRepository,
) {
  const logger = Logger("deleteProductImage");

  return async (imageId: string, imageUrl: string) => {
    if (!imageUrl.startsWith("https://")) {
      return {
        success: false,
        message: "Invalid image URL",
      };
    }

    const imageName = imageUrl.split("/").pop()?.split(".").at(0);

    await uploadFilesRepository.deleteImage(imageName!);
    const result = await productImageRepository.deleteImage(imageId);

    if (!result.isOk) {
      logger.error(result.error.message);
      return {
        success: false,
        message: result.error.message,
      };
    }

    revalidatePath(`/admin/products`);
    revalidatePath(`/admin/product/${result.data.productSlug}`);
    revalidatePath(`/product/${result.data.productSlug}`);

    return {
      success: true,
      data: "Imagen eliminada correctamente",
    };
  };
}

export const deleteProductImage = deleteProductImageAction(
  inject("productImageRepository") as IProductImageRepository,
  inject("uploadFilesRepository") as IUploadFilesRepository,
);
