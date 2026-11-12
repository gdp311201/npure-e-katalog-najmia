'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { formatPrice, type CatalogProduct } from '@/lib/supabase'

interface SimilarProductsProps {
  products: CatalogProduct[]
  variant: string | null
}

const VARIANT_CHIP_CLASS: Record<string, string> = {
  Cica: 'chip-cica',
  Licorice: 'chip-licorice',
  Marigold: 'chip-marigold',
  Noni: 'chip-noni',
  Bundling: 'chip-bundling',
  'Non-Series': 'chip-non-series',
}

export function SimilarProducts({ products, variant }: SimilarProductsProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="mt-12 border-t border-border/60 pt-8">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          Produk Serupa
        </h2>
        {variant && (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
              VARIANT_CHIP_CLASS[variant] || 'chip-non-series'
            }`}
          >
            {variant} Series
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <Link
            key={p.catalog_product_id}
            href={`/produk/${p.slug}`}
            className="card-lift group overflow-hidden rounded-xl border border-border/60 bg-white p-0 transition hover:shadow-md hover:ring-1 hover:ring-emerald-200"
          >
            {/* Image */}
            <div className="relative aspect-square w-full overflow-hidden bg-secondary">
              {p.image_url_1 ? (
                <Image
                  src={p.image_url_1}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Package className="h-10 w-10" />
                </div>
              )}
              <div className="absolute left-1.5 top-1.5">
                {p.in_stock ? (
                  <span className="pill-in-stock inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold">
                    Tersedia
                  </span>
                ) : (
                  <span className="pill-out-of-stock inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold">
                    Kosong
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-1 p-2.5">
              <h3 className="line-clamp-2 text-xs font-medium leading-snug text-foreground min-h-[2rem]">
                {p.name}
              </h3>
              <span className="text-sm font-bold text-primary">
                {formatPrice(p.current_price)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
