import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const mustChangePassword = request.cookies.get('must_change_password')?.value === '1'
  const { pathname } = request.nextUrl

  const isLoginPage = pathname === '/login'
  const isChangePasswordPage = pathname === '/change-password'

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  if (token && mustChangePassword && !isChangePasswordPage) {
    return NextResponse.redirect(new URL('/change-password', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
