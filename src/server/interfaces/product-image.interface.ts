import { DeleteProductImage } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

export interface IProductImageRepository {
  deleteImage(imageId: string): Promise<Result<DeleteProductImage>>;
}