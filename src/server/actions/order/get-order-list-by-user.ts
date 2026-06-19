'use server';

import { auth } from "@/src/auth.config";
import type { TActionResponse, TOrderResume } from "@/src/core/types";
import { orderRepository } from "../../providers";

export async function getOrderListByUser(): Promise<TActionResponse<TOrderResume[]>> {
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
