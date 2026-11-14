import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUBLIC endpoint: get current month's active focus products
// Used by homepage ProductFocusSection (no auth needed)
export async function GET() {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7)

    // Query focus products + join product details from view
    const { data: focusData, error: focusError } = await supabase
      .from('catalog_product_focus')
      .select('id, product_slug, period_month, display_label, display_order')
      .eq('period_month', currentMonth)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (focusError) {
      console.error('Public focus query error:', focusError.message)
      return NextResponse.json({ data: [] })
    }

    if (!focusData || focusData.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Fetch product details for each focus slug
    const slugs = focusData.map((f) => f.product_slug)
    const { data: products, error: prodError } = await supabase
      .from('v_catalog_products')
      .select('slug, name, image_url_1, current_price, compare_at_price, variant')
      .in('slug', slugs)

    if (prodError) {
      console.error('Public focus products query error:', prodError.message)
      return NextResponse.json({ data: [] })
    }

    // Merge focus data with product details
    const merged = focusData.map((f) => {
      const product = products?.find((p) => p.slug === f.product_slug)
      return {
        ...f,
        product: product || null,
      }
    })

    return NextResponse.json({ data: merged })
  } catch (e) {
    console.error('Public focus error:', e)
    return NextResponse.json({ data: [] })
  }
}
