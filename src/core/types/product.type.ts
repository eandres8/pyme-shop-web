export type ValidSizes = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL";
export type ValidTypes = "shirts" | "pants" | "hoodies" | "hats";

export type TProduct = {
  readonly description: string;
  readonly images: string[];
  readonly in_stock: number;
  readonly price: number;
  readonly sizes: ValidSizes[];
  readonly slug: string;
  readonly tags: string[];
  readonly title: string;
  readonly type: ValidTypes;
  readonly gender: "men" | "women" | "kid" | "unisex";
}

