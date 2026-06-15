import type { TFormUserAddress } from "./address.type";
import type { TCartProduct, TSize } from "./product.type";

export type TProductToOrder = {
  readonly productId: string;
  readonly quantity: number;
  readonly size: TSize;
};

export type TNewProductToOrder = TProductToOrder & {
  readonly price: number;
};

export type TNewOrder = {
  readonly userId: string;
  readonly itemsInOrder: number;
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
  readonly orderItems: TNewProductToOrder[];
  readonly address: TFormUserAddress;
  readonly mapStock: Record<string, number>;
};

export type TOrderEntity = {
  readonly id: string;
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
  readonly items_in_order: number;
  readonly is_paid: boolean;
  readonly paid_at: Date | null;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly user_id: string;
}

export type TOrderItem = {
  readonly id: string;
  readonly size: TSize;
  readonly order_id: string;
  readonly price: number;
  readonly quantity: number;
  readonly product_id: string;
  readonly title: string;
  readonly slug: string;
  readonly image: string;
};

export type TOrderAddress = {
  readonly id: string;
  readonly address: string;
  readonly city: string;
  readonly phone: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly address_info: string | null;
  readonly postal_code: string;
  readonly country_id: string;
  readonly order_id: string;
}

export type TOrderItemFull = {
  id: string;
  order_id: string;
  price: number;
  product_id: string;
  quantity: number;
  size: TSize;
  product: {
    title: string;
    slug: string;
    productImages: {
      url: string;
    }[];
  }
};

export type TFullOrder = {
  orderItems: TOrderItemFull[] | null;
  orderAddresses: TOrderAddress | null;
} & TOrderEntity;

export type TOrderDetail = {
  tax: number;
  total: number;
  subTotal: number;
  itemsInCart: number;
  isPaid: boolean;
  orderProducts: TCartProduct[];
  address: TFormUserAddress;
};
