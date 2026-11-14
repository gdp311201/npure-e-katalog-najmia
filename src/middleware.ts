import { NextRequest, NextResponse } from 'next/server'

// Paths yang gak butuh auth (bisa diakses tanpa login)
const PUBLIC_PATHS = ['/admin/login', '/api/admin/setup', '/api/admin/login']

const COOKIE_NAME = 'npure_admin_token'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Cuma protect /admin/* dan /api/admin/*
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  // Public paths: login, setup, login API
  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next()
  }

  // Check auth cookie
  const token = req.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return unauthorized(req)
  }

  // Quick decode (Edge-compatible, pake atob — gak import crypto)
  // Full signature verification di server component/API route
  try {
    const data = token.split('.')[0]
    // base64url → base64 → decode
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    const exp = payload.exp
    if (typeof exp !== 'number' || exp < Math.floor(Date.now() / 1000)) {
      return unauthorized(req)
    }
  } catch {
    return unauthorized(req)
  }

  return NextResponse.next()
}

function unauthorized(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl
  // API routes → 401 JSON
  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Pages → redirect ke login
  return NextResponse.redirect(new URL('/admin/login', req.url))
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
