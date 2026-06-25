'use server';

import { z } from 'zod';
import { auth } from '@/src/auth.config';
import { productRepository } from '../../providers';
import type { TActionResponse } from '@/src/core/types';

const slugSchema = z.object({
  slug: z.string().min(3).max(255),
});

export async function validateProductSlug(
  slug: string,
): Promise<TActionResponse<{ available: boolean }>> {
  const session = await auth();

  if (!session?.user?.tenant) {
    return { success: false, message: 'Usuario sin tenant asignado' };
  }

  const parsed = slugSchema.safeParse({ slug });
  if (!parsed.success) {
    return { success: false, message: 'Slug inválido' };
  }

  const result = await productRepository.productExistsBySlug(
    parsed.data.slug,
    session.user.tenant,
  );

  if (!result.isOk) {
    return { success: false, message: 'Error al validar slug' };
  }

  return {
    success: true,
    data: { available: !result.data },
  };
}
