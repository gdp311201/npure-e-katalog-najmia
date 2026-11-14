import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-supabase'

// GET: list focus products for a given month (default: current month)
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminSupabase()
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    const { data, error } = await supabase
      .from('catalog_product_focus')
      .select('*')
      .eq('period_month', month)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Focus list error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ data: data || [], month })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 })
  }
}

// POST: add a product as focus for a given month
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { product_slug, period_month, display_label, display_order } = body

    if (!product_slug || !period_month) {
      return NextResponse.json(
        { error: 'product_slug dan period_month wajib diisi' },
        { status: 400 }
      )
    }

    // Validate period_month format YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(period_month)) {
      return NextResponse.json(
        { error: 'period_month format harus YYYY-MM (contoh: 2026-11)' },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabase()

    // Check max 3 focus products per month
    const { count } = await supabase
      .from('catalog_product_focus')
      .select('*', { count: 'exact', head: true })
      .eq('period_month', period_month)

    if (count && count >= 3) {
      return NextResponse.json(
        { error: 'Maksimal 3 produk fokus per bulan. Hapus salah satu dulu.' },
        { status: 400 }
      )
    }

    // Check product exists in catalog
    const { data: product } = await supabase
      .from('catalog_products')
      .select('slug')
      .eq('slug', product_slug)
      .maybeSingle()

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan di catalog_products' },
        { status: 404 }
      )
    }

    // Auto-assign display_order if not provided
    const order = display_order ?? (count ?? 0) + 1

    const { data, error } = await supabase
      .from('catalog_product_focus')
      .insert({
        product_slug,
        period_month,
        display_label: display_label || null,
        display_order: order,
        is_active: true,
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        // unique constraint violation — product already focus for this month
        return NextResponse.json(
          { error: 'Produk ini sudah jadi fokus bulan tersebut' },
          { status: 409 }
        )
      }
      console.error('Focus insert error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 })
  }
}
