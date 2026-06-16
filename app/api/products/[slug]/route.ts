import { NextRequest, NextResponse } from "next/server";

import { prismaDbClient } from "@/src/config/database/prisma-client";
import { Product } from "@/src/core/entities";
import { ProductRepository } from "@/src/server/repositories";
import type { Success } from "@/src/core/utils";

const productRepository = new ProductRepository(prismaDbClient);

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> },) {
  const slug = (await params).slug;

  try {
    const result = await productRepository.productBySlug(slug);

    const inStock = (result as Success<Product>).data.inStock;
 
    return new NextResponse<{ inStock: number }>(JSON.stringify({ inStock }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: (error as Error)?.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}