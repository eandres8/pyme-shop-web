import { TProduct, ValidSizes, ValidTypes } from "../types/product.type";

export class Product {
  private constructor(
    // readonly id: string,
    readonly description: string,
    readonly images: string[],
    readonly inStock: number,
    readonly price: number,
    readonly sizes: ValidSizes[],
    readonly slug: string,
    readonly tags: string[],
    readonly title: string,
    readonly type: ValidTypes,
    readonly gender: "men" | "women" | "kid" | "unisex",
  ) {}

  static fromJson(data: TProduct) {
    return new Product(
      // data?.id || '',
      data?.description || '',
      data?.images || [],
      data?.in_stock || 0,
      data?.price || 0,
      data?.sizes || '',
      data?.slug || '',
      data?.tags || [],
      data?.title || '',
      data?.type || '',
      data?.gender || '',
    );
  }
}
