import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, name, whatsapp, message, rating } = body || {}

    if (!type || !['kritik', 'saran', 'pertanyaan'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400 }
      )
    }
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name required' },
        { status: 400 }
      )
    }
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message required' },
        { status: 400 }
      )
    }

    // Validate rating (1-5 or null)
    const ratingValue =
      rating && typeof rating === 'number'
        ? Math.max(1, Math.min(5, Math.round(rating)))
        : null

    const { error } = await supabase.from('catalog_feedback').insert({
      type,
      name: name.trim(),
      whatsapp: whatsapp?.trim() || null,
      message: message.trim(),
      rating: ratingValue,
    })

    if (error) {
      console.error('Feedback insert error:', error.message)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Feedback API error:', e)
    return NextResponse.json({ ok: true })
  }
}
