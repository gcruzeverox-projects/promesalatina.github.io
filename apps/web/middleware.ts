// apps/web/middleware.ts
// SOLUCIÓN DEFINITIVA: middleware mínimo sin next-intl
// next-intl en edge runtime de Vercel causa MIDDLEWARE_INVOCATION_FAILED
// El i18n se maneja via [locale] routing — el middleware solo redirige / a /es

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Solo redirigir la raíz exacta a /es
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/es', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Solo actuar sobre la raíz — nada más
  matcher: ['/'],
}
