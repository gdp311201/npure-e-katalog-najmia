'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice, type CatalogProduct } from '@/lib/supabase'
import {
  getQuizProfile,
  getProductMatch,
  type ProductMatch,
} from '@/lib/quiz-profile'

interface ProductCardProps {
  product: CatalogProduct
  waNumber: string
  waDefaultMsg: string
}

const VARIANT_CHIP_CLASS: Record<string, string> = {
  Cica: 'chip-cica',
  Licorice: 'chip-licorice',
  Marigold: 'chip-marigold',
  Noni: 'chip-noni',
  Bundling: 'chip-bundling',
  'Non-Series': 'chip-non-series',
}

export function ProductCard({
  product,
  waNumber,
  waDefaultMsg,
}: ProductCardProps) {
  const router = useRouter()
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return 'server_session'
    try {
      const stored = sessionStorage.getItem('npure_session')
      if (stored) return stored
      const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      sessionStorage.setItem('npure_session', id)
      return id
    } catch {
      return `s_fallback_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    }
  })

  const [match, setMatch] = useState<ProductMatch | null>(null)

  useEffect(() => {
    const profile = getQuizProfile()
    if (!profile) return
    setMatch(getProductMatch(product, profile))
  }, [product])

  const variantClass =
    VARIANT_CHIP_CLASS[product.variant || ''] || 'chip-non-series'

  const handleCardClick = () => {
    router.push(`/produk/${product.slug}`)
  }

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order_click',
        productId: product.catalog_product_id,
        sessionId,
      }),
    }).catch(() => {})

    const msg = `${waDefaultMsg}

Produk: ${product.name}
Harga: ${formatPrice(product.current_price)}
Status stok: ${product.in_stock ? 'Tersedia' : 'Kosong (pre-order)'}

Mohon info selengkapnya ya. Terima kasih!`

    const url = `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Discount calculation
  const comparePrice = product.compare_at_price
  const hasDiscount =
    comparePrice !== null &&
    comparePrice !== undefined &&
    comparePrice > (product.current_price ?? 0)
  const discountPct = hasDiscount
    ? Math.round(
        ((comparePrice! - (product.current_price ?? 0)) / comparePrice!) * 100
      )
    : 0

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      className="card-lift group cursor-pointer overflow-hidden p-0 bg-white hover:shadow-lg hover:ring-1 hover:ring-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      aria-label={`Lihat detail ${product.name}`}
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
        {product.image_url_1 ? (
          <Image
            src={product.image_url_1}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-12 w-12" aria-hidden="true" />
          </div>
        )}

        {/* Top-left badges: stock + match */}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {product.in_stock ? (
            <span className="pill-in-stock inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold">
              Tersedia
            </span>
          ) : (
            <span className="pill-out-of-stock inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold">
              Kosong
            </span>
          )}

          {match?.tier === 'strong' && (
            <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
              ✓ Cocok untukmu
            </span>
          )}
        </div>

        {/* Top-right: discount badge (kalau ada) */}
        {hasDiscount && (
          <div className="absolute right-2 top-2">
            <span className="inline-flex items-center rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              -{discountPct}%
            </span>
          </div>
        )}

        {/* Featured badge (bottom-right, kalau ada & gak ada discount) */}
        {product.is_featured && !hasDiscount && (
          <div className="absolute bottom-2 right-2">
            <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              ★ Featured
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="space-y-1.5 p-3">
        {product.variant && (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${variantClass}`}
          >
            {product.variant}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price with struck compare price */}
        <div className="flex flex-col gap-0.5 pt-1">
          {hasDiscount && (
            <span className="text-[11px] text-muted-foreground line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-bold text-primary">
              {formatPrice(product.current_price)}
            </span>
            {product.product_type && (
              <span className="text-[10px] text-muted-foreground">
                {product.product_type}
              </span>
            )}
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          className="mt-2 w-full text-white"
          style={{ backgroundColor: 'var(--theme-wa)' }}
          onClick={handleOrderClick}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--theme-wa-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--theme-wa)')}
        >
          Order via WhatsApp
        </Button>
      </div>
    </Card>
  )
}
