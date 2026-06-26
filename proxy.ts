import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { envs } from './src/config/envs';
 
export function proxy(request: NextRequest) {
  const host = request.headers.get('host');
  console.log({ host, NEXT_PUBLIC_HOST: envs.NEXT_PUBLIC_HOST });

  if (host === envs.NEXT_PUBLIC_HOST) {
    return NextResponse.redirect(new URL('/landing', request.url))
  }
}
 
export const config = {
  matcher: '/',
}