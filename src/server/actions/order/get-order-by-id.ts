"use server";

import type { TActionResponse, TOrderDetail } from "@/src/core/types";
import { auth } from "@/src/auth.config";
import { orderRepository } from "../../providers";

export async function getOrderById(id: string): Promise<TActionResponse<TOrderDetail>> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: "Usuario no autenticado",
    };
  }

  const result = await orderRepository.getById(id);

  if (!result.isOk) {
    return {
      success: false,
      message: result.error.message,
    };
  }

  const data = result.data;

  if (session.user.role === 'user' && session.user.id !== data.userId) {
    throw new Error('No hay permisos para esta consulta');
  }

  return {
    success: true,
    data: data.toFormData(),
  };
}
