'use server';

import { auth } from "@/src/auth.config";
import type { TActionResponse, TOrderResume } from "@/src/core/types";
import type { IOrderRepository } from "../../interfaces";
import { inject } from "../../providers";

function getOrderListByUserAction(orderRepository: IOrderRepository) {
  return async (): Promise<TActionResponse<TOrderResume[]>> => {
    const session = await auth();
    
    if (!session?.user) {
      return {
        success: false,
        message: "Usuario no autenticado",
      };
    }

    const result = await orderRepository.listOrdersByUser(session.user.id);

    if (!result.isOk) {
      return {
        success: false,
        message: result.error.message,
      };
    }

    const data = result.data.map((d) => d.toJson());

    return {
      success: true,
      data,
    };
  }
}

export const getOrderListByUser = getOrderListByUserAction(inject("orderRepository") as IOrderRepository);
