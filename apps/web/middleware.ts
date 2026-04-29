// apps/web/middleware.ts
// FIX: MIDDLEWARE_INVOCATION_FAILED en Vercel
// next-intl v3.22+ requiere pathnames explícito o routing config actualizado
 
import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
const intlMiddleware = createMiddleware({
  locales:       ['es', 'en'],
  defaultLocale: 'es',
  localePrefix:  'as-needed',   // /es solo cuando no es el default
})
 
export default function middleware(request: NextRequest) {
  // Rutas de admin no necesitan i18n — pasarlas directo
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/catalog') ||
    pathname.startsWith('/orders')
  ) {
    return NextResponse.next()
  }
  return intlMiddleware(request)
}
 
export const config = {
  matcher: [
    // Excluir archivos estáticos, API routes y rutas de Next.js internas
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)).*)',
  ],
}