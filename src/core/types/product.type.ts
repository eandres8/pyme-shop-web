export type TSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL";
export type TValidTypes = "shirts" | "pants" | "hoodies" | "hats";
export type TGenderTypes = "men" | "women" | "kid" | "unisex";

export type TProduct = {
  readonly id: string;
  readonly description: string;
  readonly images: string[];
  readonly in_stock: number;
  readonly price: number;
  readonly sizes: TSize[];
  readonly slug: string;
  readonly tags: string[];
  readonly title: string;
  readonly type: TValidTypes;
  readonly category_id: string;
  readonly gender: TGenderTypes;
}

export type TProductImage = {
  readonly id: string;
  readonly url: string;
  readonly product_id: string;
}

export type TProductEntity = {
  readonly id: string;
  readonly description: string;
  readonly productImages: TProductImage[];
  readonly in_stock: number;
  readonly price: number;
  readonly sizes: TSize[];
  readonly slug: string;
  readonly tags: string[];
  readonly title: string;
  readonly type: TValidTypes;
  readonly category_id: string;
  readonly gender: TGenderTypes;
  readonly created_at: Date;
  readonly updated_at: Date;
}

export type TCartProduct = {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly price: number;
  readonly quantity: number;
  readonly size: TSize;
  readonly image: string;
};

export type TProductData = {
  readonly id: string;
  readonly description: string;
  readonly product_images: TProductImage[];
  readonly in_stock: number;
  readonly price: number;
  readonly sizes: TSize[];
  readonly slug: string;
  readonly tags: string[];
  readonly title: string;
  readonly type: TValidTypes;
  readonly category_id: string;
  readonly gender: TGenderTypes;
}

export type TProductUpdate = {
  readonly id?: string;
  readonly title: string;
  readonly slug: string;
  readonly description: string;
  readonly price: number;
  readonly inStock: number;
  readonly sizes: TSize[];
  readonly tags: string;
  readonly categoryId: string;
  readonly gender: TGenderTypes;
};