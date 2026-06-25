"use server";

import { auth } from "@/src/auth.config";
import type { TStoreConfig } from "@/src/core/types";
import { productRepository, tenantRepository } from "@/src/server/providers";

export async function getTenantConfig() {
  const session = await auth();

  const user = session?.user;

  if (!user) {
    return {
      success: false,
      message: "El usuario no es válido",
    };
  }

  const tenantId = user.tenant || '';

  const [isProductSuccess, hasWhatsapp] = await Promise.all([
    productRepository.countProducts({
        page: 1,
        take: 1,
        tenantId: tenantId,
    }).then((result) => {
        return result.isOk && result.data.totalPages > 0;
    }),
    tenantRepository.findById(tenantId).then((resp) => {
        return resp.isOk && !!resp.data.phone;
    }),
  ]);

  const pendingItems: TStoreConfig[] = [
    {
      id: "1",
      url: isProductSuccess ? "/admin/profile" : "/admin/products?task_id=1",
      success: isProductSuccess,
      title: "Mi primer producto",
      description: `Crea un producto para mostrar en tu catálogo`,
    },
    {
      id: "2",
      url: "/admin/profile",
      success: hasWhatsapp,
      title: "Mi whatsapp",
      description: `Registra tu número de whatsapp para que el cliente pueda contactar y pedir tu producto`,
    },
  ];

  return {
    success: true,
    data: pendingItems,
  };
}
