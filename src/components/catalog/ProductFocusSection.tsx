'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type FocusProduct = {
  id: string
  product_slug: string
  period_month: string
  display_label: string | null
  display_order: number
  product: {
    slug: string
    name: string
    image_url_1: string | null
    current_price: number
    compare_at_price: number | null
    variant: string | null
  } | null
}

export function ProductFocusSection() {
  const [focusProducts, setFocusProducts] = useState<FocusProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/focus')
      .then((res) => res.json())
      .then((data) => {
        setFocusProducts(data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || focusProducts.length === 0) return null

  const monthName = new Date().toLocaleDateString('id-ID', { month: 'long' })
  const displayLabel = focusProducts[0]?.display_label || `Highlight ${monthName}`

  const formatRupiah = (n: number) =>
    'Rp' + Math.round(n || 0).toLocaleString('id-ID')

  return (
    <section className="mb-6 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-white shadow-sm">
      {/* Header — elegant editorial layout */}
      <div className="flex items-center justify-between gap-3 border-b border-primary/10 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            ✦
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
              {displayLabel}
            </h2>
            <p className="truncate text-[11px] text-muted-foreground">
              Pilihan spesial {monthName} — nilai terbaik untuk kulitmu
            </p>
          </div>
        </div>
        <span className="hidden shrink-0 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary sm:inline-block">
          {monthName}
        </span>
      </div>

      {/* Cards */}
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-3">
        {focusProducts.map((fp) => {
          const p = fp.product
          if (!p) return null

          const discountPct =
            p.compare_at_price && p.compare_at_price > p.current_price
              ? Math.round(
                  ((p.compare_at_price - p.current_price) /
                    p.compare_at_price) *
                    100
                )
              : 0

          return (
            <Link
              key={fp.id}
              href={`/produk/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-white transition hover:border-primary/40 hover:shadow-md"
            >
              {/* Image */}
              <div className="relative aspect-square w-full overflow-hidden bg-secondary">
                {p.image_url_1 && (
                  <Image
                    src={p.image_url_1}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                )}

                {/* Discount badge (kalau ada compare_at_price) */}
                {discountPct > 0 && (
                  <div className="absolute left-2 top-2">
                    <span className="inline-flex items-center rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      -{discountPct}%
                    </span>
                  </div>
                )}

                {/* Rank ribbon — elegant alternative to "🎯 Fokus" badge */}
                <div className="absolute right-2 top-2">
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-primary-foreground shadow-sm ring-2 ring-white"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    ★
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-1 p-3">
                {p.variant && (
                  <span className="text-[10px] font-medium uppercase tracking-wider text-primary/80">
                    {p.variant}
                  </span>
                )}
                <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground min-h-[2.5rem]">
                  {p.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 pt-0.5">
                  {p.compare_at_price &&
                  p.compare_at_price > p.current_price ? (
                    <>
                      <span className="text-base font-bold text-primary">
                        {formatRupiah(p.current_price)}
                      </span>
                      <span className="text-[11px] text-muted-foreground line-through">
                        {formatRupiah(p.compare_at_price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-base font-bold text-primary">
                      {formatRupiah(p.current_price)}
                    </span>
                  )}
                </div>

                <p className="pt-1 text-[11px] font-medium text-muted-foreground transition group-hover:text-primary">
                  Lihat detail →
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
