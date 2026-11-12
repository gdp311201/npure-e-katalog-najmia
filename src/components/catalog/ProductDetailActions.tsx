'use client'

import { useState } from 'react'
import { MessageCircle, ShoppingCart, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuantitySelector } from '@/components/catalog/QuantitySelector'
import { formatPrice, buildWhatsAppLink, type CatalogProduct, type CatalogSettings } from '@/lib/supabase'
import { useCartStore } from '@/lib/cart-store'

interface ProductDetailActionsProps {
  product: CatalogProduct
  settings: CatalogSettings
}

export function ProductDetailActions({
  product,
  settings,
}: ProductDetailActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('npure_session')
      if (stored) return stored
      const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      sessionStorage.setItem('npure_session', id)
      return id
    }
    return 'server_session'
  })

  const totalPrice = (product.current_price || 0) * quantity

  const handleOrderWA = () => {
    // Track analytics
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order_click',
        productId: product.catalog_product_id,
        sessionId,
      }),
    }).catch(() => {})

    const msg = `${settings.whatsapp_default_message}

Produk: ${product.name}
Harga: ${formatPrice(product.current_price)}
Jumlah: ${quantity}
Subtotal: ${formatPrice(totalPrice)}
Status stok: ${product.in_stock ? 'Tersedia' : 'Kosong (pre-order)'}

Mohon info selengkapnya ya. Terima kasih!`

    const url = buildWhatsAppLink(settings.whatsapp_number, msg)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleAddToCart = () => {
    addItem(product, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)

    // Track analytics
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'favorite_added',
        productId: product.catalog_product_id,
        sessionId,
      }),
    }).catch(() => {})
  }

  return (
    <div className="space-y-4">
      {/* Price + Stock */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-primary">
          {formatPrice(product.current_price)}
        </span>
        {quantity > 1 && (
          <span className="text-sm text-muted-foreground">
            ({formatPrice(totalPrice)} untuk {quantity} pcs)
          </span>
        )}
      </div>

      <div className="inline-flex items-center gap-1.5 text-sm">
        {product.in_stock ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <span className="font-medium text-emerald-700">Tersedia</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-rose-600" aria-hidden="true" />
            <span className="font-medium text-rose-700">Kosong (pre-order)</span>
          </>
        )}
      </div>

      {/* Quantity + Actions */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Jumlah:</span>
          <QuantitySelector
            quantity={quantity}
            onChange={setQuantity}
            max={99}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" aria-hidden="true" />
            {addedToCart ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
          </Button>

          <Button
            type="button"
            size="lg"
            className="flex-1 text-white"
            style={{ backgroundColor: 'var(--theme-wa)' }}
            onClick={handleOrderWA}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--theme-wa-hover)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--theme-wa)')
            }
          >
            <MessageCircle className="mr-2 h-5 w-5" aria-hidden="true" />
            Pesan via WhatsApp
          </Button>
        </div>
      </div>

      {/* COD info */}
      {settings.shipping_info && (
        <div className="rounded-lg border border-emerald-100 bg-secondary/60 p-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">Info Pengiriman:</span>{' '}
            {settings.shipping_info}
          </p>
        </div>
      )}
    </div>
  )
}
