import { NextRequest, NextResponse } from 'next/server';

import { PopulateProducts } from '@/src/api/config/populate-products';

export async function POST(_: NextRequest) {
    // Parse the request body
  // const body = await request.json();
  // console.log({ body });

  const productsRepository = new PopulateProducts();

  try {
    const listProducts = await productsRepository.populate();
 
    return new NextResponse(JSON.stringify(listProducts), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: (error as Error)?.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}