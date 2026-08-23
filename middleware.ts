import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'icss-platform-jwt-secret-change-this-in-production-2024'
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedUser = pathname.startsWith('/dashboard')
  const isProtectedAdmin = pathname.startsWith('/admin')
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')

  const token = request.cookies.get('token')?.value

  // Protect /dashboard and /admin routes
  if (isProtectedUser || isProtectedAdmin) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const { payload } = await jwtVerify(token, secret)

      // Admin-only: redirect non-admins from /admin
      if (isProtectedAdmin && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      return NextResponse.next()
    } catch {
      // Invalid/expired token → go to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return response
    }
  }

  // Redirect already-logged-in users away from auth pages
  if (isAuthPage && token) {
    try {
      const { payload } = await jwtVerify(token, secret)
      if (payload.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
      // Token invalid — allow auth page access
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}
