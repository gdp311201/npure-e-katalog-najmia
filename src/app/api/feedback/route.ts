import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, name, whatsapp, message } = body || {}

    if (!type || !['kritik', 'saran', 'pertanyaan'].includes(type)) {
      return NextResponse.json({ ok: false, error: 'Invalid type' }, { status: 400 })
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ ok: false, error: 'Name required' }, { status: 400 })
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ ok: false, error: 'Message required' }, { status: 400 })
    }

    const { error } = await supabase.from('catalog_feedback').insert({
      type,
      name: name.trim(),
      whatsapp: whatsapp?.trim() || null,
      message: message.trim(),
    })

    if (error) {
      console.error('Feedback insert error:', error.message)
      return NextResponse.json({ ok: false, error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Feedback API error:', e)
    return NextResponse.json({ ok: true })
  }
}
