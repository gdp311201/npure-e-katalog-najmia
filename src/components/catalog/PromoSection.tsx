'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tag } from 'lucide-react'

type PromoProduct = {
  slug: string
  name: string
  image_url_1: string | null
  current_price: number
  compare_at_price: number | null
  variant: string | null
  discount_pct: number
}

export function PromoSection() {
  const [products, setProducts] = useState<PromoProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/promo')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || products.length === 0) return null

  const formatRupiah = (n: number) =>
    'Rp' + Math.round(n || 0).toLocaleString('id-ID')

  return (
    <section
      id="promo"
      className="mb-6 overflow-hidden rounded-xl border border-rose-200/40 bg-gradient-to-br from-rose-50/50 via-white to-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-rose-100 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white">
            <Tag className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
              Promo &amp; Diskon
            </h2>
            <p className="truncate text-[11px] text-muted-foreground">
              Hemat lebih banyak dengan harga spesial
            </p>
          </div>
        </div>
        <span className="hidden shrink-0 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-600 sm:inline-block">
          {products.length} promo
        </span>
      </div>

      {/* Cards */}
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-3">
        {products.map((p) => (
          <Link
            key={p.slug}
            href={`/produk/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-white transition hover:border-rose-300 hover:shadow-md"
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

              {/* Discount badge — large, prominent */}
              <div className="absolute left-2 top-2">
                <span className="inline-flex items-center rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                  -{p.discount_pct}%
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-1 p-3">
              {p.variant && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {p.variant}
                </span>
              )}
              <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground min-h-[2.5rem]">
                {p.name}
              </h3>

              {/* Price — struck + bold */}
              <div className="flex flex-col gap-0.5 pt-0.5">
                <span className="text-[11px] text-muted-foreground line-through">
                  {formatRupiah(p.compare_at_price!)}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-rose-600">
                    {formatRupiah(p.current_price)}
                  </span>
                  <span className="text-[10px] font-medium text-rose-500">
                    hemat{' '}
                    {formatRupiah(
                      p.compare_at_price! - p.current_price
                    )}
                  </span>
                </div>
              </div>

              <p className="pt-1 text-[11px] font-medium text-muted-foreground transition group-hover:text-rose-600">
                Lihat detail →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
