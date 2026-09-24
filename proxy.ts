import { NextRequest, NextResponse } from 'next/server';

// Protect all routes under /products
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isProductsRoute = pathname.startsWith('/products');
  const isLoginRoute = pathname === '/login';

  if (isProductsRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoginRoute && token) {
    return NextResponse.redirect(new URL('/products', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/products/:path*', '/login'],
};
