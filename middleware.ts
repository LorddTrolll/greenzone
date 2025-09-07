import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Lista de caminhos que devem ser ignorados pelo middleware
  const ignorePaths = [
    '/_next',
    '/api',
    '/favicon.ico',
    '/__nextjs',
    '/static',
    '/.well-known'
  ]
  
  // Verificar se deve ignorar esta requisição
  if (ignorePaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Ignorar requisições de desenvolvimento e ferramentas
  const userAgent = request.headers.get('user-agent') || ''
  if (
    userAgent.includes('webpack') ||
    userAgent.includes('next-dev') ||
    request.headers.get('accept')?.includes('text/x-component') ||
    request.headers.get('purpose') === 'prefetch'
  ) {
    return NextResponse.next()
  }

  // Verificar apenas rotas VIP específicas
  const vipRoutes = ['/relatorios']
  const isVipRoute = vipRoutes.some(route => pathname.startsWith(route))
  
  if (isVipRoute) {
    // Verificar autenticação via cookie
    const authCookie = request.cookies.get('sb-ozudcvaeqwhrdkrhigzd-auth-token')
    
    if (!authCookie) {
      const loginUrl = new URL('/vip', request.url)
      loginUrl.searchParams.set('message', 'Esta funcionalidade é exclusiva para membros VIP')
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}