import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-supabase'

// PATCH: mark as read/unread
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { is_read } = body

    if (typeof is_read !== 'boolean') {
      return NextResponse.json(
        { error: 'is_read must be boolean' },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabase()
    const { data, error } = await supabase
      .from('catalog_feedback')
      .update({ is_read })
      .eq('id', id)
      .select('id, is_read')
      .single()

    if (error) {
      console.error('Feedback update error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('Admin feedback PATCH error:', msg)
    return NextResponse.json(
      { error: `Server error: ${msg}` },
      { status: 500 }
    )
  }
}

// DELETE: remove feedback
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = getAdminSupabase()
    const { error } = await supabase
      .from('catalog_feedback')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Feedback delete error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('Admin feedback DELETE error:', msg)
    return NextResponse.json(
      { error: `Server error: ${msg}` },
      { status: 500 }
    )
  }
}
