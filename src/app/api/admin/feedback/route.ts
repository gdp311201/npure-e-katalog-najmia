import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminSupabase()
    const { searchParams } = new URL(req.url)

    const type = searchParams.get('type') // 'kritik' | 'saran' | 'pertanyaan' | null
    const isRead = searchParams.get('is_read') // 'true' | 'false' | null
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200)

    let query = supabase
      .from('catalog_feedback')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (type && ['kritik', 'saran', 'pertanyaan'].includes(type)) {
      query = query.eq('type', type)
    }
    if (isRead === 'true') {
      query = query.eq('is_read', true)
    } else if (isRead === 'false') {
      query = query.eq('is_read', false)
    }

    const { data, count, error } = await query

    if (error) {
      console.error('Feedback list error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ data: data || [], count: count || 0 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('Admin feedback GET error:', msg)
    return NextResponse.json(
      { error: `Server error: ${msg}` },
      { status: 500 }
    )
  }
}
