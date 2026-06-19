'use server';

import { auth } from "@/src/auth.config";
import type { TActionResponse, TOrderResume } from "@/src/core/types";
import type { IOrderRepository } from "../../interfaces";
import { inject } from "../../providers";

function getPaginatedOrdersAction(orderRepository: IOrderRepository) {
  return async (): Promise<TActionResponse<TOrderResume[]>> => {
    const session = await auth();
      
    if (session?.user?.role !== 'admin') {
      return {
        success: false,
        message: "No es un usuario válido",
      };
    }

    const result = await orderRepository.listOrders();
    
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

export const getPaginatedOrders = getPaginatedOrdersAction(inject("orderRepository") as IOrderRepository);