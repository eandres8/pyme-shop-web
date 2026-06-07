import { NextRequest, NextResponse } from "next/server";

import { prismaDbClient } from "@/src/config/database/prisma-client";
import { ProductRepository } from "@/src/data/repositories";
import { Product } from "@/src/core/entities";

const productRepository = new ProductRepository(prismaDbClient);

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> },) {
  const slug = (await params).slug;

  try {
    const result = await productRepository.productBySlug(slug);

    const inStock = result.data<Product>().inStock;
 
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