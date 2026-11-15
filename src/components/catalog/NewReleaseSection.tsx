'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'

type NewReleaseProduct = {
  slug: string
  name: string
  image_url_1: string | null
  current_price: number
  compare_at_price: number | null
  variant: string | null
  new_release_until: string
}

export function NewReleaseSection() {
  const [products, setProducts] = useState<NewReleaseProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/new-releases')
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
      id="new-release"
      className="mb-6 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-primary/10 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-primary-foreground"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
              Produk Terbaru
            </h2>
            <p className="truncate text-[11px] text-muted-foreground">
              Baru bergabung di katalog kami
            </p>
          </div>
        </div>
        <span className="hidden shrink-0 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary sm:inline-block">
          {products.length} baru
        </span>
      </div>

      {/* Cards */}
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-4">
        {products.map((p) => {
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
              key={p.slug}
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
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                )}

                {/* Discount badge (kalau ada) */}
                {discountPct > 0 && (
                  <div className="absolute left-2 top-2">
                    <span className="inline-flex items-center rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      -{discountPct}%
                    </span>
                  </div>
                )}

                {/* BARU badge — top right */}
                <div className="absolute right-2 top-2">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    Baru
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-1 p-2.5">
                {p.variant && (
                  <span className="text-[10px] font-medium uppercase tracking-wider text-primary/80">
                    {p.variant}
                  </span>
                )}
                <h3 className="line-clamp-2 text-xs font-medium leading-snug text-foreground min-h-[2rem]">
                  {p.name}
                </h3>
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
