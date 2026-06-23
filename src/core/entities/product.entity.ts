import type { TTenantInfo } from "../types";
import type {
  TGenderTypes,
  TProduct,
  TProductData,
  TProductEntity,
  TProductImage,
  TSize,
  TValidTypes,
} from "../types/product.type";

export class Product {
  private constructor(
    readonly id: string,
    readonly description: string,
    readonly images: string[],
    readonly inStock: number,
    readonly price: number,
    readonly sizes: TSize[],
    readonly slug: string,
    readonly tags: string[],
    readonly title: string,
    readonly type: TValidTypes,
    readonly categoryId: string,
    readonly gender: TGenderTypes,
    readonly productImages: TProductImage[],
    readonly tenant: TTenantInfo,
  ) {}

  static fromJson(data: Partial<TProduct>) {
    return new Product(
      data?.id || "",
      data?.description || "",
      data?.images || [],
      data?.in_stock || 0,
      data?.price || 0,
      data?.sizes || [],
      data?.slug || "",
      data?.tags || [],
      data?.title || "",
      data?.type || ("" as TValidTypes),
      data?.category_id || "",
      data?.gender || ("" as TGenderTypes),
      [],
      {
        id: data?.tenant?.id || '',
        name: data?.tenant?.name || '',
        slug: data?.tenant?.slug || '',
        address: data?.tenant?.address || '',
        phone: data?.tenant?.phone || '',
      },
    );
  }

  static fromEntity(data: Partial<TProductEntity>) {
    return new Product(
      data?.id || "",
      data?.description || "",
      (data?.productImages || []).map((pi) => pi.url),
      data?.in_stock || 0,
      data?.price || 0,
      data?.sizes || [],
      data?.slug || "",
      data?.tags || [],
      data?.title || "",
      data?.type || ("" as TValidTypes),
      data?.category_id || "",
      data?.gender || ("" as TGenderTypes),
      data?.productImages || [],
      {
        id: data?.tenant?.id || '',
        name: data?.tenant?.name || '',
        slug: data?.tenant?.slug || '',
        address: data?.tenant?.address || '',
        phone: data?.tenant?.phone || '',
      },
    );
  }

  toJson(): Partial<TProduct> {
    return {
      ...(this.id ? { id: this.id } : {}),
      description: this.description,
      images: this.images,
      in_stock: this.inStock,
      price: this.price,
      sizes: this.sizes,
      slug: this.slug,
      tags: this.tags,
      title: this.title,
      type: this.type,
      category_id: this.categoryId,
      gender: this.gender,
      tenant: {
        ...this.tenant,
      },
    };
  }

  toPlain(): Partial<TProductData> {
    return {
      id: this.id,
      description: this.description,
      product_images: this.productImages,
      in_stock: this.inStock,
      price: this.price,
      sizes: this.sizes,
      slug: this.slug,
      tags: this.tags,
      title: this.title,
      type: this.type,
      category_id: this.categoryId,
      gender: this.gender,
      tenant: {
        ...this.tenant,
      },
    };
  }
}
