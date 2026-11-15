import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-supabase'

// GET: list current new releases (new_release_until IS NOT NULL)
export async function GET() {
  try {
    const supabase = getAdminSupabase()

    const { data, error } = await supabase
      .from('v_catalog_products')
      .select(
        'slug, name, variant, image_url_1, current_price, compare_at_price, new_release_until'
      )
      .not('new_release_until', 'is', null)
      .order('new_release_until', { ascending: false })

    if (error) {
      console.error('New release list error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Calculate days remaining
    const now = new Date()
    const enriched = (data || []).map((p) => {
      const until = new Date(p.new_release_until)
      const diffMs = until.getTime() - now.getTime()
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      return {
        ...p,
        days_remaining: daysRemaining,
        is_expired: daysRemaining <= 0,
      }
    })

    return NextResponse.json({ data: enriched })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 })
  }
}

// POST: set or extend new release status
// Body: { slug, days: 30|60|90, extend?: boolean }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, days, extend } = body

    if (!slug) {
      return NextResponse.json({ error: 'slug wajib diisi' }, { status: 400 })
    }
    if (![30, 60, 90].includes(days)) {
      return NextResponse.json(
        { error: 'days harus 30, 60, atau 90' },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabase()

    // Check product exists
    const { data: product } = await supabase
      .from('catalog_products')
      .select('slug, new_release_until')
      .eq('slug', slug)
      .maybeSingle()

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    // Calculate new_release_until
    let newUntil: string
    if (extend && product.new_release_until) {
      // Extend from existing expiry (or now if already expired)
      const existing = new Date(product.new_release_until)
      const now = new Date()
      const base = existing > now ? existing : now
      base.setDate(base.getDate() + days)
      newUntil = base.toISOString()
    } else {
      // Set from now
      const now = new Date()
      now.setDate(now.getDate() + days)
      newUntil = now.toISOString()
    }

    const { error } = await supabase
      .from('catalog_products')
      .update({ new_release_until: newUntil })
      .eq('slug', slug)

    if (error) {
      console.error('New release set error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      new_release_until: newUntil,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 })
  }
}

// DELETE: clear new release status (set to NULL)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'slug wajib diisi' }, { status: 400 })
    }

    const supabase = getAdminSupabase()
    const { error } = await supabase
      .from('catalog_products')
      .update({ new_release_until: null })
      .eq('slug', slug)

    if (error) {
      console.error('New release clear error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 })
  }
}
