'use client'

import { useState, useEffect, useCallback } from 'react'
import { Target, Plus, Trash2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import Image from 'next/image'

type FocusItem = {
  id: string
  product_slug: string
  period_month: string
  display_label: string | null
  display_order: number
  is_active: boolean
}

type CatalogProduct = {
  slug: string
  name: string
  image_url_1: string | null
  current_price: number
  variant: string | null
}

export default function FocusPage() {
  const [focusItems, setFocusItems] = useState<FocusItem[]>([])
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Month navigation
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // Add form
  const [selectedSlug, setSelectedSlug] = useState('')
  const [displayLabel, setDisplayLabel] = useState('')

  const fetchFocus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/focus?month=${selectedMonth}`)
      const data = await res.json()
      if (res.ok) {
        setFocusItems(data.data || [])
      }
    } catch (e) {
      console.error('Fetch focus error:', e)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth])

  const fetchProducts = useCallback(async () => {
    try {
      // Fetch all visible catalog products for the dropdown
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      if (res.ok) {
        setProducts(data.data || [])
      }
    } catch (e) {
      console.error('Fetch products error:', e)
    }
  }, [])

  useEffect(() => {
    fetchFocus()
  }, [fetchFocus])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedSlug) {
      setError('Pilih produk dulu')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_slug: selectedSlug,
          period_month: selectedMonth,
          display_label: displayLabel || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal menambah produk fokus')
        return
      }

      setSuccess('Produk fokus ditambahkan!')
      setSelectedSlug('')
      setDisplayLabel('')
      fetchFocus()
    } catch {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (item: FocusItem) => {
    if (!confirm(`Hapus ${item.product_slug} dari produk fokus ${selectedMonth}?`)) return
    try {
      await fetch(`/api/admin/focus/${item.id}`, { method: 'DELETE' })
      setFocusItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch (e) {
      console.error('Delete error:', e)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const date = new Date(year, month - 1, 1)
    date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1))
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(newMonth)
  }

  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  const isCurrentMonth = selectedMonth === new Date().toISOString().slice(0, 7)

  // Filter out products already in focus
  const availableProducts = products.filter(
    (p) => !focusItems.some((f) => f.product_slug === p.slug)
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          Produk Fokus
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set produk highlight tiap bulan. Maksimal 3 produk. Muncul di atas grid katalog.
        </p>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3">
        <button
          onClick={() => navigateMonth('prev')}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">{monthLabel}</p>
          {isCurrentMonth && (
            <p className="text-[10px] font-medium text-primary">● Bulan ini</p>
          )}
        </div>
        <button
          onClick={() => navigateMonth('next')}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Add form */}
      {focusItems.length < 3 ? (
        <form
          onSubmit={handleAdd}
          className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
        >
          <h2 className="text-sm font-semibold text-foreground">
            Tambah Produk Fokus ({focusItems.length}/3)
          </h2>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <p className="text-xs text-rose-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
              <p className="text-xs text-emerald-700">{success}</p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Produk
            </label>
            <select
              value={selectedSlug}
              onChange={(e) => {
                setSelectedSlug(e.target.value)
                setError('')
              }}
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">— Pilih produk —</option>
              {availableProducts.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} ({p.variant})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Label kustom (opsional)
            </label>
            <input
              type="text"
              value={displayLabel}
              onChange={(e) => setDisplayLabel(e.target.value)}
              placeholder={`Default: "Produk Fokus ${monthLabel.split(' ')[0]}"`}
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedSlug}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <Plus className="h-4 w-4" />
            {submitting ? 'Menambah...' : 'Tambah Produk Fokus'}
          </button>
        </form>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-700">
            ⚠️ Sudah mencapai maksimal 3 produk fokus untuk {monthLabel}.
            Hapus salah satu untuk menambah produk lain.
          </p>
        </div>
      )}

      {/* Current focus list */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">
          Produk Fokus {monthLabel} ({focusItems.length})
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary"></div>
          </div>
        ) : focusItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
            <Target className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Belum ada produk fokus untuk {monthLabel}.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {focusItems.map((item, index) => {
              const product = products.find((p) => p.slug === item.product_slug)
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3"
                >
                  {/* Order number */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </div>

                  {/* Product image */}
                  {product?.image_url_1 && (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      <Image
                        src={product.image_url_1}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {product?.name || item.product_slug}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.display_label || `Urutan ${item.display_order}`}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                    title="Hapus dari fokus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
