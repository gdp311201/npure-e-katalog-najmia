'use client'

import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'

export function CartButton() {
  const totalItems = useCartStore((state) => state.getTotalItems())
  const isHydrated = useCartStore((state) => state.isHydrated)
  const openCart = useCartStore((state) => state.openCart)

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white/15 px-3 text-xs font-medium ring-1 ring-white/30 transition hover:bg-white/25 active:scale-95"
      aria-label={`Keranjang belanja${isHydrated && totalItems > 0 ? ` (${totalItems} item)` : ''}`}
    >
      <ShoppingBag className="h-4 w-4 text-white" />
      <span className="hidden sm:inline text-white">Keranjang</span>

      {isHydrated && totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#25D366] px-1 text-[10px] font-bold text-white ring-2 ring-primary">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  )
}
