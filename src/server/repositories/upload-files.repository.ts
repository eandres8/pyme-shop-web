import { envs } from "@/src/config/envs";
import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: envs.CLOUDINARY_CLOUD_NAME,
  api_key: envs.CLOUDINARY_API_KEY,
  api_secret: envs.CLOUDINARY_API_SECRET,
});

export async function uploadFiles(files: File[]): Promise<string[]> {
  console.log({ envs });
  console.log({ files });

  const uploadResults = await Promise.all(files.map(async (image) => {
    const buffer = await image.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    return cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Image}`, {
      folder: 'pyme-shop/tests',
    })
    .then((result) => result.secure_url)
    .catch((error) => {
      console.log(error);
      return null;
    });
  }));

  return uploadResults.filter((v): v is string => !!v);
}
