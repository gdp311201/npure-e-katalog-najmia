import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-supabase'

// GET: list visible products with pricing data
// Query v_catalog_products (sudah filter is_active + is_visible + has image)
// Jadi cuma produk yang tampil di homepage yang muncul di sini
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminSupabase()
    const { searchParams } = new URL(req.url)
    const variant = searchParams.get('variant')
    const withDiscount = searchParams.get('discount') === 'true'

    let query = supabase
      .from('v_catalog_products')
      .select(
        'slug, name, variant, netto, current_price, compare_at_price, image_url_1'
      )
      .order('variant', { ascending: true })
      .order('name', { ascending: true })

    if (variant && variant !== 'all') {
      query = query.eq('variant', variant)
    }
    if (withDiscount) {
      query = query.not('compare_at_price', 'is', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('Pricing list error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json(
      { error: `Server error: ${msg}` },
      { status: 500 }
    )
  }
}

// PATCH: batch update compare_at_price
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { updates } = body as {
      updates: { slug: string; compare_at_price: number | null }[]
    }

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'updates array wajib diisi' },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabase()
    const results: { slug: string; ok: boolean; error?: string }[] = []

    for (const u of updates) {
      if (!u.slug) continue

      const value =
        u.compare_at_price === null || u.compare_at_price === undefined
          ? null
          : Number(u.compare_at_price)

      if (value !== null && (isNaN(value) || value < 0)) {
        results.push({
          slug: u.slug,
          ok: false,
          error: 'compare_at_price harus angka ≥ 0 atau null',
        })
        continue
      }

      const { error } = await supabase
        .from('catalog_products')
        .update({ compare_at_price: value })
        .eq('slug', u.slug)

      results.push({
        slug: u.slug,
        ok: !error,
        error: error?.message,
      })
    }

    return NextResponse.json({ ok: true, results })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json(
      { error: `Server error: ${msg}` },
      { status: 500 }
    )
  }
}
