'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tag, Save, Search, RotateCcw, AlertCircle } from 'lucide-react'
import Image from 'next/image'

type PricingItem = {
  slug: string
  name: string
  variant: string | null
  netto: string | null
  image_url_1: string | null
  current_price: number
  compare_at_price: number | null
}

type VariantOption = { value: string; label: string }

export default function PricingPage() {
  const [items, setItems] = useState<PricingItem[]>([])
  const [variants, setVariants] = useState<VariantOption[]>([])
  const [loading, setLoading] = useState(true)
  const [filterVariant, setFilterVariant] = useState('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ ok: number; failed: number } | null>(null)
  const [error, setError] = useState('')

  const fetchPricing = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterVariant !== 'all') params.set('variant', filterVariant)
      const res = await fetch(`/api/admin/pricing?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setItems(data.data || [])
        // Extract variants from items
        const uniqueVariants = Array.from(
          new Set((data.data || []).map((p: PricingItem) => p.variant).filter(Boolean))
        ) as string[]
        setVariants(uniqueVariants.map((v) => ({ value: v, label: v })))
      }
    } catch (e) {
      console.error('Fetch pricing error:', e)
      setError('Gagal memuat data harga')
    } finally {
      setLoading(false)
    }
  }, [filterVariant])

  useEffect(() => {
    fetchPricing()
  }, [fetchPricing])

  const filteredItems = items.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.variant?.toLowerCase().includes(q) ?? false) ||
      (p.netto?.toLowerCase().includes(q) ?? false)
    )
  })

  const handleFieldChange = (slug: string, value: string) => {
    setEditing((prev) => ({ ...prev, [slug]: value }))
    setResult(null)
  }

  const dirtyCount = Object.keys(editing).filter((slug) => {
    const original = items.find((p) => p.slug === slug)
    if (!original) return false
    const editedVal = editing[slug]
    const originalStr =
      original.compare_at_price === null || original.compare_at_price === undefined
        ? ''
        : String(original.compare_at_price)
    return editedVal !== originalStr
  }).length

  const handleSave = async () => {
    const dirtySlugs = Object.keys(editing).filter((slug) => {
      const original = items.find((p) => p.slug === slug)
      if (!original) return false
      const editedVal = editing[slug]
      const originalStr =
        original.compare_at_price === null || original.compare_at_price === undefined
          ? ''
          : String(original.compare_at_price)
      return editedVal !== originalStr
    })

    if (dirtySlugs.length === 0) {
      setError('Tidak ada perubahan untuk disimpan')
      return
    }

    setSaving(true)
    setError('')

    const updates = dirtySlugs.map((slug) => {
      const val = editing[slug].trim()
      return {
        slug,
        compare_at_price:
          val === '' ? null : parseFloat(val.replace(/[^\d.-]/g, '')),
      }
    })

    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan')
        return
      }

      const okCount = data.results?.filter((r: any) => r.ok).length || 0
      const failedCount = data.results?.filter((r: any) => !r.ok).length || 0

      setResult({ ok: okCount, failed: failedCount })
      setEditing({}) // clear edits
      fetchPricing() // refresh
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setEditing({})
    setResult(null)
    setError('')
  }

  const formatRupiah = (n: number) =>
    'Rp' + Math.round(n || 0).toLocaleString('id-ID')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          Harga &amp; Diskon
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set harga acuan (HET/MSRP) untuk tampil diskon struck price.
          Kosongkan untuk produk tanpa diskon.
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">💡 Cara pakai:</span>{' '}
          Isi <strong>Compare Price</strong> dengan harga acuan resmi (mis. HET
          NPURE). Kalau lebih besar dari harga jual, katalog otomatis tampil{' '}
          <span className="line-through">struck</span> + badge diskon. Kosongkan
          field untuk produk tanpa diskon.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
          <button
            onClick={() => setFilterVariant('all')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              filterVariant === 'all'
                ? 'text-white'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
            style={
              filterVariant === 'all'
                ? { backgroundColor: 'var(--theme-primary)' }
                : {}
            }
          >
            Semua variant
          </button>
          {variants.map((v) => (
            <button
              key={v.value}
              onClick={() => setFilterVariant(v.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                filterVariant === v.value
                  ? 'text-white'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
              style={
                filterVariant === v.value
                  ? { backgroundColor: 'var(--theme-primary)' }
                  : {}
            }
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk…"
            className="h-9 w-full rounded-lg border border-border bg-white pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Save bar */}
      {dirtyCount > 0 && (
        <div className="sticky top-16 z-20 flex items-center justify-between gap-3 rounded-lg border border-primary/40 bg-card p-3 shadow-md">
          <p className="text-xs font-medium text-foreground">
            {dirtyCount} perubahan belum disimpan
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Menyimpan...' : `Simpan (${dirtyCount})`}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          <p className="text-xs text-rose-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
          <p className="text-xs text-emerald-700">
            ✓ Berhasil update {result.ok} produk
            {result.failed > 0 && ` • Gagal ${result.failed}`}
          </p>
        </div>
      )}

      {/* Product list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
          <Tag className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Tidak ada produk yang cocok.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const originalVal =
              item.compare_at_price === null || item.compare_at_price === undefined
                ? ''
                : String(item.compare_at_price)
            const editedVal = editing[item.slug] ?? originalVal
            const hasDiscount =
              item.compare_at_price !== null &&
              item.compare_at_price > item.current_price
            const discountPct = hasDiscount
              ? Math.round(
                  ((item.compare_at_price! - item.current_price) /
                    item.compare_at_price!) *
                    100
                )
              : 0

            return (
              <div
                key={item.slug}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3"
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
                    <Tag className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{formatRupiah(item.current_price)}</span>
                    {hasDiscount && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                        -{discountPct}%
                      </span>
                    )}
                    {item.netto && <span>• {item.netto}</span>}
                  </div>
                </div>

                {/* Compare price input */}
                <div className="shrink-0">
                  <label className="mb-0.5 block text-[10px] font-medium text-muted-foreground">
                    Compare Price
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editedVal}
                    onChange={(e) =>
                      handleFieldChange(item.slug, e.target.value)
                    }
                    placeholder="—"
                    className="h-9 w-24 rounded-lg border border-border bg-white px-2 text-right text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
