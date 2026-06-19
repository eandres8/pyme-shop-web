import { Result } from "@/src/core/utils";
import type { IUploadFilesRepository } from "@/src/server/interfaces";

type MockOverrides = {
  uploadImages?: (files: File[], tenant?: string) => ReturnType<IUploadFilesRepository["uploadImages"]>;
  deleteImage?: (imageUrl: string) => ReturnType<IUploadFilesRepository["deleteImage"]>;
};

export function MockUploadFilesRepository(overrides: MockOverrides = {}): IUploadFilesRepository {
  return {
    uploadImages: overrides.uploadImages ?? (async () => Result.success([])),
    deleteImage: overrides.deleteImage ?? (async () => Result.success("")),
  };
}
