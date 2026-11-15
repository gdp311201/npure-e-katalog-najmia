import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUBLIC: get current active new releases (new_release_until > NOW())
export async function GET() {
  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('v_catalog_products')
      .select(
        'slug, name, image_url_1, current_price, compare_at_price, variant, new_release_until'
      )
      .not('new_release_until', 'is', null)
      .gt('new_release_until', now)
      .order('new_release_until', { ascending: false })

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
