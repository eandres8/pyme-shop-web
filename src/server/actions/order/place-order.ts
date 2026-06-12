"use server";

import { auth } from "@/src/auth.config";
import type {
  TFormUserAddress,
  TNewProductToOrder,
  TProductToOrder,
} from "@/src/core/types";
import { orderRepository, productRepository } from "../../providers";
import { Result } from "@/src/core/utils";

export async function placeOrder(
  products: TProductToOrder[],
  address: TFormUserAddress,
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      success: false,
      message: "No hay una sesión válida",
    };
  }

  const productIdList = products.map((p) => p.productId);

  const productsMapResult = await _mapProducts(productIdList);

  if (productsMapResult.isOk === false) {
    return {
      success: false,
      message: productsMapResult.error.message,
    };
  }

  const productsMap = productsMapResult.data;

  const itemsInOrder = products.reduce((count, p) => count + p.quantity, 0);

  const { subtotal, tax, total, orderItems, mapStock } = products.reduce(
    (totals, item) => {
      const { productId: id } = item;
      const price = productsMap[id];
      const mapStockItem: Record<string, number> = {
        [id]:
          id in totals.mapStock
            ? totals.mapStock[id] + item.quantity
            : item.quantity
      };

      const subtotal = price * item.quantity;
      const tax = subtotal * 0.15;
      const total = subtotal * 1.15;

      return {
        subtotal: totals.subtotal + subtotal,
        tax: totals.tax + tax,
        total: totals.total + total,
        orderItems: [...totals.orderItems, { ...item, price }],
        mapStock: {
          ...totals.mapStock,
          ...mapStockItem,
        }
      };
    },
    {
      subtotal: 0,
      tax: 0,
      total: 0,
      orderItems: [] as TNewProductToOrder[],
      mapStock: {} as Record<string, number>,
    },
  );

  const result = await orderRepository.trxNewOrder({
    total,
    subtotal,
    tax,
    orderItems,
    userId,
    itemsInOrder,
    address,
    mapStock,
  });

  console.log('result', result);
  
  if (!result.isOk) {
    console.log('result::err', result.error.message);
    return {
      success: false,
      message: result.error.message,
    };
  }

  return {
    success: true,
    message: "Orden generada correctamente",
    data: result.data,
  };
}

const _mapProducts = async (
  productIds: string[],
): Promise<Result<Record<string, number>>> => {
  const productsResult = await productRepository.listProductsByIds(productIds);

  if (!productsResult.isOk) {
    return productsResult;
  }

  const productsMap: Record<string, number> = productsResult
    .data
    .reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr.price,
      }),
      {},
    );

  return Result.success(productsMap);
};
