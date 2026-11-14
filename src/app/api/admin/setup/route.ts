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
        { error: 'Setup not configured. Set ADMIN_SETUP_KEY env var in Vercel.' },
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

    // This throws if SUPABASE_SERVICE_ROLE_KEY missing — surface real error
    const supabase = getAdminSupabase()

    // Check if any admin already exists (one-time setup)
    const { count, error: countError } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Setup count error:', countError.message)
      return NextResponse.json(
        { error: `Database error: ${countError.message}` },
        { status: 500 }
      )
    }

    if (count && count > 0) {
      return NextResponse.json(
        {
          error:
            'Admin user already exists. Setup is one-time only. Login at /admin/login instead.',
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
      return NextResponse.json(
        { error: `Database error: ${insertError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'Admin user created successfully. Login at /admin/login',
    })
  } catch (e) {
    // FIXED: surface real error instead of fake ok:true
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('Setup error:', msg)
    return NextResponse.json(
      { error: `Server error: ${msg}` },
      { status: 500 }
    )
  }
}
