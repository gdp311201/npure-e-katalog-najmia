'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Phone,
  Star,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  Inbox,
} from 'lucide-react'

type FeedbackType = 'kritik' | 'saran' | 'pertanyaan'

type FeedbackItem = {
  id: string
  type: FeedbackType
  name: string
  whatsapp: string | null
  message: string
  rating: number | null
  is_read: boolean
  created_at: string
}

const TYPE_META: Record<
  FeedbackType,
  { label: string; color: string; bg: string }
> = {
  kritik: { label: 'Kritik', color: 'text-rose-600', bg: 'bg-rose-50' },
  saran: { label: 'Saran', color: 'text-amber-600', bg: 'bg-amber-50' },
  pertanyaan: {
    label: 'Pertanyaan',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
}

export default function FeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterRead, setFilterRead] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.set('type', filterType)
      if (filterRead === 'unread') params.set('is_read', 'false')
      else if (filterRead === 'read') params.set('is_read', 'true')

      const res = await fetch(`/api/admin/feedback?${params.toString()}`)
      const data = await res.json()

      if (res.ok) {
        setItems(data.data || [])
        setCount(data.count || 0)
      }
    } catch (e) {
      console.error('Fetch feedback error:', e)
    } finally {
      setLoading(false)
    }
  }, [filterType, filterRead])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  const handleToggleRead = async (item: FeedbackItem) => {
    setActionLoading(item.id)
    try {
      await fetch(`/api/admin/feedback/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: !item.is_read }),
      })
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, is_read: !i.is_read } : i
        )
      )
    } catch (e) {
      console.error('Toggle read error:', e)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (item: FeedbackItem) => {
    if (!confirm(`Hapus feedback dari ${item.name}? Tidak bisa diundo.`))
      return
    setActionLoading(item.id)
    try {
      await fetch(`/api/admin/feedback/${item.id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      setCount((prev) => prev - 1)
    } catch (e) {
      console.error('Delete error:', e)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const buildWaLink = (wa: string, name: string) => {
    const cleaned = wa.replace(/\D/g, '')
    const msg = `Halo ${name}, terima kasih atas feedback Anda untuk NPURE E-Katalog. Elsa di sini, mau respon feedback Anda.`
    return `https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`
  }

  const typeOptions = [
    { value: 'all', label: 'Semua' },
    { value: 'kritik', label: 'Kritik' },
    { value: 'saran', label: 'Saran' },
    { value: 'pertanyaan', label: 'Pertanyaan' },
  ]

  const readOptions = [
    { value: 'all', label: 'Semua status' },
    { value: 'unread', label: 'Belum dibaca' },
    { value: 'read', label: 'Dibaca' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          Feedback Customer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {count} feedback total. Klik nomor WA buat balas customer langsung.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type filter */}
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                filterType === opt.value
                  ? 'text-white'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
              style={
                filterType === opt.value
                  ? { backgroundColor: 'var(--theme-primary)' }
                  : {}
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Read status filter */}
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
          {readOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterRead(opt.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                filterRead === opt.value
                  ? 'text-white'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
              style={
                filterRead === opt.value
                  ? { backgroundColor: 'var(--theme-primary)' }
                  : {}
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchFeedback}
          className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Belum ada feedback yang cocok dengan filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const meta = TYPE_META[item.type]
            return (
              <div
                key={item.id}
                className={`rounded-xl border bg-card p-4 transition ${
                  item.is_read
                    ? 'border-border/40 opacity-75'
                    : 'border-primary/30 ring-1 ring-primary/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Type badge + unread + rating */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.bg} ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                      {!item.is_read && (
                        <span className="text-[10px] font-semibold text-primary">
                          ● Baru
                        </span>
                      )}
                      {item.rating && (
                        <span className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= item.rating!
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </span>
                      )}
                    </div>

                    {/* Name + WA */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">
                        {item.name}
                      </p>
                      {item.whatsapp && (
                        <a
                          href={buildWaLink(item.whatsapp, item.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          {item.whatsapp}
                        </a>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                      {item.message}
                    </p>

                    {/* Timestamp */}
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(item.created_at)}
                    </p>
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleRead(item)}
                      disabled={actionLoading === item.id}
                      className="flex items-center gap-1 rounded-lg border border-border/60 px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:bg-secondary disabled:opacity-50"
                      title={
                        item.is_read
                          ? 'Tandai belum dibaca'
                          : 'Tandai dibaca'
                      }
                    >
                      {item.is_read ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span className="hidden sm:inline">Belum dibaca</span>
                        </>
                      ) : (
                        <>
                          <CheckCheck className="h-3 w-3" />
                          <span className="hidden sm:inline">Dibaca</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={actionLoading === item.id}
                      className="flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1.5 text-[11px] font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                      title="Hapus"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
