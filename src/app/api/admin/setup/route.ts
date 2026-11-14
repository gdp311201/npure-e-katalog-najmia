import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-supabase'
import { hashPassword } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { setupKey, username, password, name } = body

    // Verify setup key
    const expectedKey = process.env.ADMIN_SETUP_KEY
    if (!expectedKey) {
      return NextResponse.json(
        { error: 'Setup not configured. Set ADMIN_SETUP_KEY env var.' },
        { status: 500 }
      )
    }
    if (setupKey !== expectedKey) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 })
    }

    // Validate input
    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Missing fields: username, password, name' },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimum 8 characters' },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabase()

    // Check if any admin already exists (one-time setup)
    const { count, error: countError } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Setup count error:', countError.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (count && count > 0) {
      return NextResponse.json(
        {
          error:
            'Admin user already exists. Setup is one-time only. Use /admin/login instead.',
        },
        { status: 403 }
      )
    }

    // Create first admin user (role: 'admin')
    const { error: insertError } = await supabase.from('admin_users').insert({
      username: username.trim().toLowerCase(),
      password_hash: hashPassword(password),
      name: name.trim(),
      role: 'admin',
    })

    if (insertError) {
      console.error('Setup insert error:', insertError.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: 'Admin user created successfully. You can now login at /admin/login',
    })
  } catch (e) {
    console.error('Setup error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
