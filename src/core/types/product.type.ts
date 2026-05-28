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

