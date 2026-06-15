import { PrismaClient } from "@/prisma/generated/prisma/client";
import { Order } from "@/src/core/entities";
import type { TFullOrder, TNewOrder, TOrderEntity } from "@/src/core/types";
import { Logger, Result, to } from "@/src/core/utils";

export function OrderRepository(client: PrismaClient) {
  const logger = Logger("OrderRepository");

  const getById = async (id: string): Promise<Result<Order>> => {
    const [data, error] = await to(client.order.findFirst({
      where: { id },
      include: {
        orderItems: {
          select: {
            id: true,
            order_id: true,
            price: true,
            product_id: true,
            quantity: true,
            size: true,
            product: {
              select: {
                title: true,
                slug: true,

                productImages: {
                  select: {
                    url: true,
                  },
                  take: 1
                }
              }
            }
          }
        },
        orderAddresses: true,
      }
    }));

    if (error) {
      return Result.failure(
        new Error(error?.message || `Error consultando la orden ${id}`),
      );
    }
    
    if (!data) {
      return Result.failure(
        new Error(`La orden ${id} no existe`),
      );
    }

    console.log(data);
    
    return Result.success(Order.fromEntity(data as TFullOrder));
  };

  const trxNewOrder = async (payload: TNewOrder) => {
    const [data, error] = await to(client.$transaction( async (tx) => {
      const updateProducts = payload.orderItems.map((p) => {
        const quantity = payload.mapStock[p.productId];
        if (quantity < 0) {
          throw new Error(`${p.productId} no tiene cantidad definida`);
        }

        return tx.product.update({
          where: { id: p.productId },
          data: {
            in_stock: {
              decrement: quantity,
            },
          }
        })
      });

      const resultUpdates = await Promise.all(updateProducts);

      resultUpdates.forEach((p) => {
        if (p.in_stock < 0) {
          logger.error(`${p.title}: no tiene inventario suficiente`);
          throw new Error(`${p.title}: no tiene inventario suficiente`);
        }
      });

      const order = await tx.order.create({
        data: {
          user_id: payload.userId,
          items_in_order: payload.itemsInOrder,
          subtotal: payload.subtotal,
          tax: payload.tax,
          total: payload.total,

          orderItems: {
            createMany: {
              data: payload.orderItems.map((p) => ({
                quantity: p.quantity,
                size: p.size,
                product_id: p.productId,
                price: p.price,
              })),
            }
          }
        }
      });

      const userAddress = payload.address;

      const address = await tx.orderAddress.create({
        data: {
          address: userAddress.address,
          first_name: userAddress.firstName,
          last_name: userAddress.lastName,
          city: userAddress.city,
          phone: userAddress.phone,
          postal_code: userAddress.postalCode,
          address_info: userAddress.addressInfo,
          order_id: order.id,
          country_id: userAddress.country,
        },
      })

      return {
        order,
        address,
        updatedProducts: resultUpdates,
      }
    }));

    if (error) {
      return Result.failure(
        new Error(error?.message || "Error generando la orden"),
      );
    }

    return Result.success(data.order as TOrderEntity);
  };

  return {
    trxNewOrder,
    getById,
  };
}