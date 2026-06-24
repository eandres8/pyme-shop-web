'use server';

// import { headers } from "next/headers";

import { tenantRepository } from "@/src/server/providers";
// import { mapTenant } from "@/src/core/utils";

export async function getTenantByUserId(userId: string) {
  // const headerMap = await headers();

  // const tenantSlug = await mapTenant(headerMap.get('host')!);

  // if (!tenantSlug) {
  //   return {
  //     success: false,
  //     data: null,
  //   };
  // }

  const result = await tenantRepository.findByAdminId(userId);

  if (!result.isOk) {
    return {
      success: false,
      data: null,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}