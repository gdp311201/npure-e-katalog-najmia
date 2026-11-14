import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-supabase'

// GET: list all visible products with pricing data
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminSupabase()
    const { searchParams } = new URL(req.url)
    const variant = searchParams.get('variant')
    const withDiscount = searchParams.get('discount') === 'true'

    let query = supabase
      .from('catalog_products')
      .select(
        'slug, product_id, variant, netto, compare_at_price, is_visible_in_catalog'
      )
      .eq('is_visible_in_catalog', true)
      .order('variant', { ascending: true })
      .order('slug', { ascending: true })

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

    // Fetch product names + current price (from view) + image
    const productIds = data?.map((cp) => cp.product_id) || []
    const [productsRes, viewRes] = await Promise.all([
      supabase.from('products').select('id, name').in('id', productIds),
      supabase
        .from('v_catalog_products')
        .select('slug, current_price, image_url_1')
        .in('slug', data?.map((cp) => cp.slug) || []),
    ])

    if (productsRes.error || viewRes.error) {
      console.error('Pricing join error:', productsRes.error?.message, viewRes.error?.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const merged =
      data?.map((cp) => {
        const product = productsRes.data?.find((p) => p.id === cp.product_id)
        const viewData = viewRes.data?.find((v) => v.slug === cp.slug)
        return {
          slug: cp.slug,
          name: product?.name || cp.slug,
          variant: cp.variant,
          netto: cp.netto,
          image_url_1: viewData?.image_url_1 || null,
          current_price: viewData?.current_price || 0,
          compare_at_price: cp.compare_at_price,
        }
      }) || []

    return NextResponse.json({ data: merged })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 })
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

      // Validate: compare_at_price null (clear) or positive number
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
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 })
  }
}
