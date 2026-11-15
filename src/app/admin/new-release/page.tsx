'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Sparkles,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react'
import Image from 'next/image'

type NewReleaseItem = {
  slug: string
  name: string
  variant: string | null
  image_url_1: string | null
  current_price: number
  compare_at_price: number | null
  new_release_until: string
  days_remaining: number
  is_expired: boolean
}

type CatalogProduct = {
  slug: string
  name: string
  image_url_1: string
  variant: string | null
}

export default function NewReleasePage() {
  const [items, setItems] = useState<NewReleaseItem[]>([])
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Search-as-you-type
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<CatalogProduct[]>([])
  const [highlight, setHighlight] = useState(0)
  const [selectedSlug, setSelectedSlug] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(
    null
  )

  const fetchNewReleases = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/new-release')
      const data = await res.json()
      if (res.ok) {
        setItems(data.data || [])
      }
    } catch (e) {
      console.error('Fetch new releases error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
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
    fetchNewReleases()
  }, [fetchNewReleases])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Compute search matches
  useEffect(() => {
    if (!query.trim()) {
      setMatches([])
      return
    }
    const q = query.trim().toLowerCase()
    // Exclude products already in new release list
    const filtered = products
      .filter((p) => !items.some((i) => i.slug === p.slug))
      .filter((p) => {
        const matchesName = p.name.toLowerCase().includes(q)
        const matchesVariant = p.variant?.toLowerCase().includes(q) ?? false
        return matchesName || matchesVariant
      })
      .slice(0, 8)
    setMatches(filtered)
    setHighlight(0)
  }, [query, products, items])

  const selectProduct = (p: CatalogProduct) => {
    setSelectedSlug(p.slug)
    setSelectedProduct(p)
    setQuery(p.name)
    setMatches([])
    setError('')
  }

  const clearSelection = () => {
    setQuery('')
    setSelectedSlug('')
    setSelectedProduct(null)
    setMatches([])
  }

  const handleSet = async (days: number) => {
    setError('')
    setSuccess('')

    if (!selectedSlug || !selectedProduct) {
      setError('Pilih produk dari saran yang muncul')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/new-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: selectedSlug, days }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal menambah new release')
        return
      }

      setSuccess(`${selectedProduct.name} di-set sebagai New Release (${days} hari)`)
      clearSelection()
      fetchNewReleases()
    } catch {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExtend = async (slug: string, name: string) => {
    try {
      const res = await fetch('/api/admin/new-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, days: 30, extend: true }),
      })

      if (res.ok) {
        setSuccess(`${name} diperpanjang 30 hari`)
        fetchNewReleases()
      }
    } catch (e) {
      console.error('Extend error:', e)
    }
  }

  const handleRemove = async (slug: string, name: string) => {
    if (!confirm(`Hapus status New Release untuk "${name}"?`)) return
    try {
      await fetch(`/api/admin/new-release?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      })
      setItems((prev) => prev.filter((i) => i.slug !== slug))
    } catch (e) {
      console.error('Remove error:', e)
    }
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          New Release
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Flag produk sebagai &quot;baru&quot; dengan periode tertentu.
          Otomatis expire setelah periode habis (no manual deactivation).
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">💡 Cara kerja:</span>{' '}
          Set produk → muncul badge &quot;BARU&quot; di homepage + product card.
          Setelah periode habis, otomatis hilang (date-based, no cron job).
        </p>
      </div>

      {/* Add form */}
      <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Tambah New Release
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

        {/* Search-as-you-type */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Produk (ketik nama untuk cari)
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedSlug('')
                setSelectedProduct(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setHighlight((h) => Math.min(h + 1, matches.length - 1))
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setHighlight((h) => Math.max(h - 1, 0))
                } else if (e.key === 'Enter' && matches[highlight]) {
                  e.preventDefault()
                  selectProduct(matches[highlight])
                } else if (e.key === 'Escape') {
                  setMatches([])
                }
              }}
              placeholder="Contoh: Cica Toner, Licorice Serum…"
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              autoComplete="off"
            />

            {query && (
              <button
                type="button"
                onClick={clearSelection}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {matches.length > 0 && !selectedProduct && (
              <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-white py-1 shadow-lg">
                {matches.map((p, idx) => (
                  <li key={p.slug}>
                    <button
                      type="button"
                      onClick={() => selectProduct(p)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs ${
                        idx === highlight
                          ? 'bg-secondary/60'
                          : 'hover:bg-secondary/40'
                      }`}
                    >
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-secondary">
                        <Image
                          src={p.image_url_1}
                          alt={p.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {p.name}
                        </p>
                        {p.variant && (
                          <p className="text-[10px] text-muted-foreground">
                            {p.variant}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedProduct && (
            <p className="mt-1.5 text-[11px] text-primary">
              ✓ Terpilih: <strong>{selectedProduct.name}</strong>
            </p>
          )}
        </div>

        {/* Periode selector */}
        {selectedProduct && (
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Pilih periode
            </label>
            <div className="flex gap-2">
              {[30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => handleSet(d)}
                  disabled={submitting}
                  className="flex-1 rounded-lg border border-border bg-white py-2.5 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-secondary/30 disabled:opacity-50"
                >
                  {d} hari
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Refresh button */}
      <div className="flex justify-end">
        <button
          onClick={fetchNewReleases}
          className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Current new releases list */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">
          Produk New Release ({items.length})
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Belum ada produk New Release.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.slug}
                className={`flex items-center gap-3 rounded-xl border bg-card p-3 ${
                  item.is_expired
                    ? 'border-rose-200 opacity-60'
                    : item.days_remaining <= 7
                    ? 'border-amber-200'
                    : 'border-border/60'
                }`}
              >
                {/* Image */}
                {item.image_url_1 ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    <Image
                      src={item.image_url_1}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Sparkles className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {item.is_expired ? (
                      <span className="font-medium text-rose-600">
                        Expired {formatDate(item.new_release_until)}
                      </span>
                    ) : item.days_remaining <= 7 ? (
                      <span className="font-medium text-amber-600">
                        {item.days_remaining} hari lagi ({formatDate(item.new_release_until)})
                      </span>
                    ) : (
                      <span>
                        Sampai {formatDate(item.new_release_until)} ({item.days_remaining} hari)
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 shrink-0">
                  {!item.is_expired && (
                    <button
                      onClick={() => handleExtend(item.slug, item.name)}
                      className="rounded-lg border border-border/60 px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:bg-secondary"
                      title="Perpanjang 30 hari"
                    >
                      +30 hari
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(item.slug, item.name)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                    title="Hapus status"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
