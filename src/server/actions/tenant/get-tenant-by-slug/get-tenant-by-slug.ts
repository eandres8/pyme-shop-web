import { cache } from "react";

import type { Tenant } from "@/src/core/entities";
import { tenantRepository } from "@/src/server/providers";

/**
 * Resolves a public store slug (URL segment) to its owning tenant.
 * Returns `null` when no tenant owns the slug so callers can `notFound()`.
 * Wrapped in React `cache` to dedupe the lookup between the `[storeSlug]`
 * layout guard and the pages that read the tenant.
 */
export const getTenantBySlug = cache(
  async (slug: string): Promise<Tenant | null> => {
    const result = await tenantRepository.findBySlug(slug);

    if (!result.isOk) {
      return null;
    }

    return result.data;
  },
);
