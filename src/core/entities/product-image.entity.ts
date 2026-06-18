import { TDeleteProductImage } from "../types/product-image.type";

export class DeleteProductImage {
  private constructor(
    readonly id: string,
    readonly url: string,
    readonly productId: string,
    readonly productSlug: string,
  ) {}

  static fromJson(data: Partial<TDeleteProductImage>) {
    return new DeleteProductImage(
      data?.id || "",
      data?.url || "",
      data?.product_id || "",
      data?.product?.slug || "",
    );
  }
}
