'use server';

import { tenantRepository } from "@/src/server/providers";

// Storefront tenant is resolved from the URL store slug (see get-tenant-by-slug).
// The admin/session flow below resolves the tenant from the authenticated user,
// which replaces the retired subdomain-based `mapTenant(host)` resolution.
export async function getTenantByUserId(userId: string) {
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
