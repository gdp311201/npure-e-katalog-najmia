import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminSupabase } from '@/lib/admin-supabase'
import {
  verifyPassword,
  createToken,
  getCookieName,
  getTokenExpirySeconds,
} from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabase()

    // Find user by username (case-insensitive, stored lowercase)
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, username, password_hash, name, role, is_active')
      .eq('username', username.trim().toLowerCase())
      .maybeSingle()

    if (error) {
      console.error('Login query error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!user || !user.is_active) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Verify password (scrypt)
    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Create token (HMAC-SHA256, 7-day expiry)
    const token = createToken({
      sub: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    })

    // Update last_login_at
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)

    // Set HttpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: getTokenExpirySeconds(),
      path: '/',
    })

    return NextResponse.json({
      ok: true,
      user: {
        username: user.username,
        name: user.name,
        role: user.role,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('Login error:', msg)
    return NextResponse.json(
      { error: `Server error: ${msg}` },
      { status: 500 }
    )
  }
}
