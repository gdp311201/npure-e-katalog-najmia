'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Target } from 'lucide-react'

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

  // Don't render anything if loading or no focus products
  if (loading || focusProducts.length === 0) return null

  const monthName = new Date().toLocaleDateString('id-ID', { month: 'long' })
  const displayLabel =
    focusProducts[0]?.display_label || `Produk Fokus ${monthName}`

  const formatRupiah = (n: number) =>
    'Rp' + Math.round(n || 0).toLocaleString('id-ID')

  return (
    <section className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-sm font-bold text-foreground sm:text-base">
            {displayLabel}
          </h2>
          <p className="text-xs text-muted-foreground">
            Bantu Elsa capai target penjualan bulan ini 🎯
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition hover:border-primary/40 hover:shadow-md"
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
                {/* Discount badge */}
                {discountPct > 0 && (
                  <div className="absolute left-1.5 top-1.5">
                    <span className="inline-flex items-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      -{discountPct}%
                    </span>
                  </div>
                )}
                {/* Focus badge */}
                <div className="absolute right-1.5 top-1.5">
                  <span className="inline-flex items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
                    🎯 Fokus
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-1 p-2.5">
                <h3 className="line-clamp-2 text-xs font-medium leading-snug text-foreground min-h-[2rem]">
                  {p.name}
                </h3>
                {/* Price */}
                <div className="flex items-baseline gap-1.5">
                  {p.compare_at_price &&
                  p.compare_at_price > p.current_price ? (
                    <>
                      <span className="text-sm font-bold text-primary">
                        {formatRupiah(p.current_price)}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-through">
                        {formatRupiah(p.compare_at_price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-primary">
                      {formatRupiah(p.current_price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
