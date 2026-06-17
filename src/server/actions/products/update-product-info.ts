'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { productRepository } from '../../providers';
import type { TActionResponse, TProductData, TProductUpdate } from '@/src/core/types';

const productSchema = z.object({
  id: z.uuid({ version: "v4" }).optional(),
  title: z.string().min(3).max(255),
  slug: z.string().min(3).max(255),
  description: z.string(),
  price: z.coerce.number().min(0).transform((val) => Number(val.toFixed(2))),
  inStock: z.coerce.number().min(0).transform((val) => Number(val.toFixed(0))),
  sizes: z.coerce.string().transform((val) => val.split(',').map((v) => v.trim())),
  tags: z.string(),
  categoryId: z.uuid({ version: "v4" }),
  gender: z.string(),
});

export async function updateProductInfo(formData: FormData): Promise<TActionResponse<TProductData>> {
  const data = Object.fromEntries(formData);
  const productParsed = productSchema.safeParse(data);
  
  console.log({ productParsed });

  if (!productParsed.success) {
    return {
      success: false,
      message: productParsed.error?.message,
    };
  }

  const product = {
    ...productParsed.data,
    slug: productParsed.data.slug.toLowerCase().replaceAll(/ /g, '_').trim(),
  } as TProductUpdate;

  const result = await productRepository.updateProductInfo(product);

  if (!result.isOk) {
    return {
      success: false,
      message: result.error.message,
    };
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/product/${result.data.slug}`);

  return {
    success: true,
    data: result.data.toPlain() as TProductData,
  }
}