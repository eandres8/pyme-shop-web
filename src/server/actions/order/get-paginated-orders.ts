'use server';

import { auth } from "@/src/auth.config";
import type { TActionResponse, TOrderResume } from "@/src/core/types";
import { orderRepository } from "../../providers";
import { requireSessionTenant } from "../auth/require-session-tenant";

export async function getPaginatedOrders(): Promise<TActionResponse<TOrderResume[]>> {
  const session = await auth();

  if (session?.user?.role !== 'admin') {
    return {
      success: false,
      message: "No es un usuario válido",
    };
  }

  const tenantId = await requireSessionTenant();

  const result = await orderRepository.listOrders(tenantId);

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