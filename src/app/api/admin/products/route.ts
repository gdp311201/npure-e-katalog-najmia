import { NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-supabase'

// GET: list visible catalog products (for admin dropdowns/selectors)
// Query v_catalog_products — sinergi dengan homepage (cuma produk yang tampil)
export async function GET() {
  try {
    const supabase = getAdminSupabase()

    const { data, error } = await supabase
      .from('v_catalog_products')
      .select('slug, name, variant, image_url_1')
      .order('variant', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Admin products list error:', error.message)
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
