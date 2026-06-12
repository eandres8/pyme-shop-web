import type { TFormUserAddress } from "./address.type";
import type { TSize } from "./product.type";

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