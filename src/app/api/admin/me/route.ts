import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, getCookieName, type TokenPayload } from '@/lib/admin-auth'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getCookieName())?.value

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const payload: TokenPayload | null = verifyToken(token)
  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    user: {
      id: payload.sub,
      username: payload.username,
      name: payload.name,
      role: payload.role,
    },
  })
}
