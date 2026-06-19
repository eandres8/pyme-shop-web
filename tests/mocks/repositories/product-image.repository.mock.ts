import { DeleteProductImage } from "@/src/core/entities";
import { Result } from "@/src/core/utils";
import type { IProductImageRepository } from "@/src/server/interfaces";

type MockOverrides = {
  deleteImage?: (imageId: string) => ReturnType<IProductImageRepository["deleteImage"]>;
};

export function MockProductImageRepository(overrides: MockOverrides = {}): IProductImageRepository {
  return {
    deleteImage: overrides.deleteImage ?? (async () => Result.success(DeleteProductImage.fromJson({}))),
  };
}
