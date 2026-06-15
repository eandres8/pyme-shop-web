"use server";

import type { TOrderDetail } from "@/src/core/types";
import { orderRepository } from "../../providers/repository-injection";
import { auth } from "@/src/auth.config";

type TOrderById =
  | { success: false; message: string }
  | { success: true; data: TOrderDetail };

export async function getOrderById(id: string): Promise<TOrderById> {
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

  console.log({ formDto: data.toFormData() });

  return {
    success: true,
    data: data.toFormData(),
  };
}
