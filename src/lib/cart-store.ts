import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CatalogProduct } from '@/lib/supabase'

export interface CartItem {
  catalog_product_id: string
  slug: string
  name: string
  price: number
  quantity: number
  image_url: string | null
  variant: string | null
}

interface CartState {
  items: CartItem[]
  isCartOpen: boolean
  isHydrated: boolean

  // Actions
  addItem: (product: CatalogProduct, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

  openCart: () => void
  closeCart: () => void
  setHydrated: () => void

  // Computed getters
  getTotalItems: () => number
  getTotalPrice: () => number
}

// No-op storage: dipake kalau localStorage gak tersedia (SSR / sandbox /
// privacy mode). Cart tetap jalan in-memory, cuma gak persist antar session.
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

// Factory storage: cek dulu localStorage bisa diakses atau nggak sebelum dipake.
function safeStorage() {
  if (typeof window === 'undefined') return noopStorage
  try {
    const testKey = '__npure_storage_test__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return window.localStorage
  } catch {
    return noopStorage
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      isHydrated: false,

      addItem: (product, quantity) => {
        const existing = get().items.find(
          (item) => item.catalog_product_id === product.catalog_product_id
        )

        if (existing) {
          set({
            items: get().items.map((item) =>
              item.catalog_product_id === product.catalog_product_id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          })
        } else {
          set({
            items: [
              ...get().items,
              {
                catalog_product_id: product.catalog_product_id,
                slug: product.slug,
                name: product.name,
                price: product.current_price || 0,
                quantity,
                image_url: product.image_url_1,
                variant: product.variant,
              },
            ],
          })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.catalog_product_id !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((item) =>
            item.catalog_product_id === productId
              ? { ...item, quantity }
              : item
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      setHydrated: () => set({ isHydrated: true }),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'npure-cart',
      storage: createJSONStorage(safeStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
