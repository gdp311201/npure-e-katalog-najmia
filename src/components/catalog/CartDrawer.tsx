'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  X, Trash2, ShoppingBag, MessageCircle, ArrowLeft, Minus, Plus,
} from 'lucide-react'
import { useCartStore, type CartItem } from '@/lib/cart-store'
import { formatPrice, buildWhatsAppLink } from '@/lib/supabase'

const WA_NUMBER = '6281575859792'
const WA_DEFAULT_MSG = 'Halo Elsa, saya mau pesan produk NPURE dari katalog:'

const VARIANT_CHIP_CLASS: Record<string, string> = {
  Cica: 'chip-cica',
  Licorice: 'chip-licorice',
  Marigold: 'chip-marigold',
  Noni: 'chip-noni',
  Bundling: 'chip-bundling',
  'Non-Series': 'chip-non-series',
}

export function CartDrawer() {
  const { items, isCartOpen, isHydrated, closeCart, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerWa, setCustomerWa] = useState('')
  const [formError, setFormError] = useState('')
  const [prevIsCartOpen, setPrevIsCartOpen] = useState(isCartOpen)

  if (isCartOpen !== prevIsCartOpen) {
    setPrevIsCartOpen(isCartOpen)
    if (isCartOpen) {
      setIsCheckingOut(false)
      setFormError('')
    }
  }

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = getTotalPrice()

  const handleCheckout = () => {
    if (!customerName.trim()) {
      setFormError('Nama wajib diisi')
      return
    }
    if (!customerWa.trim()) {
      setFormError('Nomor WhatsApp wajib diisi')
      return
    }

    let msg = `${WA_DEFAULT_MSG}\n\n`
    items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.name} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}\n`
    })
    msg += `\nTotal: ${formatPrice(totalPrice)}\n\n`
    msg += `Nama: ${customerName}\n`
    msg += `WhatsApp: ${customerWa}\n\n`
    msg += `Mohon konfirmasi pesanan ya. Terima kasih!`

    const url = buildWhatsAppLink(WA_NUMBER, msg)

    items.forEach((item) => {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order_click',
          productId: item.catalog_product_id,
          sessionId: sessionStorage.getItem('npure_session') || 'checkout',
          customerName,
          customerWa,
        }),
      }).catch(() => {})
    })

    window.open(url, '_blank', 'noopener,noreferrer')

    clearCart()
    setCustomerName('')
    setCustomerWa('')
    setIsCheckingOut(false)
    setFormError('')
    closeCart()
  }

  const handleClose = () => {
    closeCart()
    setIsCheckingOut(false)
    setFormError('')
  }

  if (!isHydrated && typeof window !== 'undefined') {
    return null
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang belanja"
      >
        <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground" style={{ backgroundColor: 'var(--theme-primary)' }}>
          <div className="flex items-center gap-2">
            {isCheckingOut ? (
              <button
                type="button"
                onClick={() => setIsCheckingOut(false)}
                className="flex items-center gap-1 text-sm text-white/80 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </button>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5 text-white" />
                <h2 className="text-base font-semibold text-white">
                  Keranjang {totalItems > 0 && `(${totalItems})`}
                </h2>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
            aria-label="Tutup keranjang"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">Keranjang kosong</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pilih produk dan klik "Tambah ke Keranjang" untuk mulai belanja.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                Lanjut Belanja
              </button>
            </div>
          ) : isCheckingOut ? (
            <div className="space-y-4 p-4">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Data Pemesan</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="customer-name" className="mb-1 block text-xs font-medium text-muted-foreground">
                      Nama *
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value)
                        setFormError('')
                      }}
                      placeholder="Nama lengkap Anda"
                      className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-wa" className="mb-1 block text-xs font-medium text-muted-foreground">
                      Nomor WhatsApp *
                    </label>
                    <input
                      id="customer-wa"
                      type="tel"
                      value={customerWa}
                      onChange={(e) => {
                        setCustomerWa(e.target.value)
                        setFormError('')
                      }}
                      placeholder="08xxxxxxxxxx"
                      className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Contoh: 08123456789. Elsa akan menghubungi via WA untuk konfirmasi.
                    </p>
                  </div>
                </div>

                {formError && (
                  <p className="mt-2 text-xs font-medium text-rose-600">{formError}</p>
                )}
              </div>

              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <h4 className="mb-2 text-xs font-semibold text-foreground">Ringkasan Pesanan</h4>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <div key={item.catalog_product_id} className="flex items-center justify-between text-xs">
                      <span className="truncate pr-2 text-muted-foreground">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="shrink-0 font-medium text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border-t border-border pt-2">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Dengan klik "Kirim via WhatsApp", pesanan akan dikirim ke BA NPURE Elsa untuk dikonfirmasi. Pembayaran dilakukan via COD atau transfer sesuai kesepakatan.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <CartLineItem
                  key={item.catalog_product_id}
                  item={item}
                  onRemove={() => removeItem(item.catalog_product_id)}
                  onUpdateQty={(qty) => updateQuantity(item.catalog_product_id, qty)}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && !isCheckingOut && (
          <div className="border-t border-border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total ({totalItems} item)
              </span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCheckingOut(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition"
              style={{ backgroundColor: 'var(--theme-wa)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--theme-wa-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--theme-wa)')}
            >
              <MessageCircle className="h-5 w-5" />
              Checkout via WhatsApp
            </button>
          </div>
        )}

        {items.length > 0 && isCheckingOut && (
          <div className="border-t border-border bg-white p-4">
            <button
              type="button"
              onClick={handleCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition"
              style={{ backgroundColor: 'var(--theme-wa)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--theme-wa-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--theme-wa)')}
            >
              <MessageCircle className="h-5 w-5" />
              Kirim Pesanan via WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function CartLineItem({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: CartItem
  onRemove: () => void
  onUpdateQty: (qty: number) => void
}) {
  const variantClass = VARIANT_CHIP_CLASS[item.variant || ''] || 'chip-non-series'

  return (
    <div className="flex gap-3 p-4">
      <Link
        href={`/produk/${item.slug}`}
        onClick={() => useCartStore.getState().closeCart()}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary"
      >
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {item.variant && (
              <span className={`mb-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium ${variantClass}`}>
                {item.variant}
              </span>
            )}
            <Link
              href={`/produk/${item.slug}`}
              onClick={() => useCartStore.getState().closeCart()}
              className="block truncate text-sm font-medium text-foreground hover:text-primary"
            >
              {item.name}
            </Link>
            <p className="text-xs text-muted-foreground">{formatPrice(item.price)} / pcs</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-muted-foreground transition hover:text-rose-600"
            aria-label={`Hapus ${item.name} dari keranjang`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="inline-flex items-center rounded-md border border-border bg-white">
            <button
              type="button"
              onClick={() => onUpdateQty(item.quantity - 1)}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground transition hover:text-foreground"
              aria-label="Kurangi jumlah"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-foreground">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQty(item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground transition hover:text-foreground"
              aria-label="Tambah jumlah"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-sm font-bold text-primary">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  )
}
