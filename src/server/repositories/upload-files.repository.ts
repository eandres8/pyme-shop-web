import { envs } from "@/src/config/envs";
import { Logger, Result, to } from "@/src/core/utils";
import { v2 as cloudinary } from "cloudinary";
import type { IUploadFilesRepository } from "../interfaces";

// Configuration
cloudinary.config({
  cloud_name: envs.CLOUDINARY_CLOUD_NAME,
  api_key: envs.CLOUDINARY_API_KEY,
  api_secret: envs.CLOUDINARY_API_SECRET,
});

export function UploadFilesRepository(): IUploadFilesRepository {
  const logger = Logger("UploadFilesRepository");
  
  const uploadImages = async (files: File[], tenant?: string): Promise<Result<string[]>> => {
    const uploadResults = await Promise.all(files.map(async (image) => {
      const buffer = await image.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString('base64');
  
      return cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Image}`, {
        folder: 'pyme-shop/tests',
      })
      .then((result) => result.secure_url)
      .catch((error) => {
        logger.log(error);
        return null;
      });
    }));
  
    return Result.success(uploadResults.filter((v): v is string => !!v));
  }

  const deleteImage = async (imageUrl: string) => {
    const [data, error] = await to(cloudinary.uploader.destroy(imageUrl));

    if (error) {
      return Result.failure(new Error(error.message || "Failed to delete image"));
    }

    return Result.success(data as string);
  }

  return {
    uploadImages,
    deleteImage,
  };
}
