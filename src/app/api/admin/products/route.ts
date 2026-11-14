import { NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-supabase'

// GET: list visible catalog products (for admin dropdowns/selectors)
// Only includes products where is_visible_in_catalog = true
export async function GET() {
  try {
    const supabase = getAdminSupabase()

    const { data, error } = await supabase
      .from('catalog_products')
      .select(
        'slug, product_id, netto, variant, image_url_1, is_visible_in_catalog'
      )
      .eq('is_visible_in_catalog', true)
      .order('variant', { ascending: true })
      .order('slug', { ascending: true })

    if (error) {
      console.error('Admin products list error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const productIds = data?.map((cp) => cp.product_id) || []
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds)

    if (prodError) {
      console.error('Admin products names error:', prodError.message)
      return NextResponse.json({ error: 'Database error' }, { status: 22 })
    }

    // Merge catalog_products with product names
    const merged =
      data?.map((cp) => {
        const product = products?.find((p) => p.id === cp.product_id)
        return {
          slug: cp.slug,
          name: product?.name || cp.slug,
          variant: cp.variant,
          image_url_1: cp.image_url_1,
        }
      }) || []

    return NextResponse.json({ data: merged })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 })
  }
}
