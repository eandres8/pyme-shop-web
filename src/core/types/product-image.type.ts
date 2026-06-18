import type { TProductImage } from "./product.type";

export type TDeleteProductImage = TProductImage & {
  product: {
    id: string;
    title: string;
    slug: string;
  };
};
