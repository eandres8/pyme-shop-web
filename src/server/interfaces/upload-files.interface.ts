import { Result } from "@/src/core/utils";

export interface IUploadFilesRepository {
  uploadImages(files: File[], tenant?: string): Promise<Result<string[]>>;
  deleteImage(imageUrl: string): Promise<Result<string>>;
}
