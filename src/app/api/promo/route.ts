import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUBLIC: get products with active discount (compare_at_price > current_price)
// Top 6 by highest discount %
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('v_catalog_products')
      .select(
        'slug, name, image_url_1, current_price, compare_at_price, variant'
      )
      .not('compare_at_price', 'is', null)
      .order('compare_at_price', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Promo list error:', error.message)
      return NextResponse.json({ data: [] })
    }

    // Filter where compare_at_price > current_price (actual discount)
    // + calculate discount %
    const promoProducts = (data || [])
      .filter(
        (p) =>
          p.compare_at_price !== null &&
          p.compare_at_price > (p.current_price ?? 0)
      )
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        image_url_1: p.image_url_1,
        current_price: p.current_price,
        compare_at_price: p.compare_at_price,
        variant: p.variant,
        discount_pct: Math.round(
          ((p.compare_at_price! - (p.current_price ?? 0)) /
            p.compare_at_price!) *
            100
        ),
      }))
      .sort((a, b) => b.discount_pct - a.discount_pct)
      .slice(0, 6)

    return NextResponse.json({ data: promoProducts })
  } catch (e) {
    console.error('Promo error:', e)
    return NextResponse.json({ data: [] })
  }
}
