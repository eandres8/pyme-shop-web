import { NextRequest, NextResponse } from 'next/server';

import { populateProducts } from '@/src/server/api/config/populate-products';

export async function POST(_: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse(JSON.stringify({ message: 'Im a teapod' }), {
      status: 418,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const listProducts = await populateProducts.populate();
 
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