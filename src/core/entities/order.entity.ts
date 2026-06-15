import type {
  TOrderItem,
  TOrderAddress,
  TFullOrder,
  TFormUserAddress,
  TOrderDetail,
  TCartProduct,
} from "../types";

export class Order {
  private constructor(
    readonly id: string,
    readonly subtotal: number,
    readonly tax: number,
    readonly total: number,
    readonly itemsInOrder: number,
    readonly isPaid: boolean,
    readonly paidAt: Date | null,
    readonly userId: string,
    readonly orderItems: TOrderItem[],
    readonly orderAddresses: TOrderAddress,
  ) {}

  // TODO: map order db entity
  static fromEntity(data: Partial<TFullOrder>) {
    return new Order(
      data?.id || "",
      data?.subtotal || 0,
      data?.tax || 0,
      data?.total || 0,
      data?.items_in_order || 0,
      !!data?.is_paid,
      data?.paid_at || null,
      data?.user_id || "",
      data?.orderItems?.map((oi) => ({
        id: oi.id,
        size: oi.size,
        order_id: oi.order_id,
        product_id: oi.product_id,
        price: oi.price,
        quantity: oi.quantity,
        title: oi.product?.title || '',
        slug: oi.product?.slug || '',
        image: oi.product?.productImages?.at(0)?.url || '',
      })) || [],
      data?.orderAddresses || {
        id: "",
        address: "",
        city: "",
        phone: "",
        first_name: "",
        last_name: "",
        address_info: "",
        postal_code: "",
        country_id: "",
        order_id: "",
      },
    );
  }

  toFormData(): TOrderDetail {
    return {
      tax: this.tax,
      total: this.total,
      subTotal: this.subtotal,
      itemsInCart: this.itemsInOrder,
      isPaid: this.isPaid,
      orderProducts: this.orderItems.map((oi) => ({
        id: oi.id,
        slug: oi.slug,
        title: oi.title,
        price: oi.price,
        quantity: oi.quantity,
        size: oi.size,
        image: oi.image,
      })),
      address: {
        firstName: this.orderAddresses.first_name,
        lastName: this.orderAddresses.last_name,
        address: this.orderAddresses.address,
        addressInfo: this.orderAddresses.address_info,
        postalCode: this.orderAddresses.postal_code,
        city: this.orderAddresses.city,
        country: this.orderAddresses.country_id,
        phone: this.orderAddresses.phone,
      } as TFormUserAddress,
    };
  }
}
