import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUBLIC: get current active new releases (new_release_until > NOW())
// EXCLUDE products that are already in Product Focus (current month, active)
// Priority: Highlight > New Release
export async function GET() {
  try {
    const now = new Date().toISOString()
    const currentMonth = now.slice(0, 7)

    // 1. Get focus slugs (current month, active) — to exclude
    const { data: focusData } = await supabase
      .from('catalog_product_focus')
      .select('product_slug')
      .eq('period_month', currentMonth)
      .eq('is_active', true)

    const focusSlugs = (focusData || []).map((f) => f.product_slug)

    // 2. Query new releases, exclude focus slugs
    let query = supabase
      .from('v_catalog_products')
      .select(
        'slug, name, image_url_1, current_price, compare_at_price, variant, new_release_until'
      )
      .not('new_release_until', 'is', null)
      .gt('new_release_until', now)
      .order('new_release_until', { ascending: false })

    if (focusSlugs.length > 0) {
      query = query.not('slug', 'in', `(${focusSlugs.map((s) => `"${s}"`).join(',')})`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Public new releases error:', error.message)
      return NextResponse.json({ data: [] })
    }

    return NextResponse.json({ data: data || [] })
  } catch (e) {
    console.error('Public new releases error:', e)
    return NextResponse.json({ data: [] })
  }
}
