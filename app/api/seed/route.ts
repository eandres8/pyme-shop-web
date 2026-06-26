import { NextRequest, NextResponse } from 'next/server';

import { populateProducts } from '@/src/server/api/config/populate-products';
import { envs } from '@/src/config/envs';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('seed-api-key');

  if (envs.NODE_ENV === 'production' && apiKey !== envs.API_KEY_SEED) {
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