'use client'

import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  quantity: number
  onChange: (qty: number) => void
  max?: number
  disabled?: boolean
}

export function QuantitySelector({
  quantity,
  onChange,
  max = 99,
  disabled = false,
}: QuantitySelectorProps) {
  const decrement = () => {
    if (quantity > 1 && !disabled) onChange(quantity - 1)
  }

  const increment = () => {
    if (quantity < max && !disabled) onChange(quantity + 1)
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-white">
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || quantity <= 1}
        className="flex h-10 w-10 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:opacity-30"
        aria-label="Kurangi jumlah"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="text"
        value={quantity}
        readOnly
        className="h-10 w-12 border-x border-border bg-transparent text-center text-sm font-semibold text-foreground focus:outline-none"
        aria-label="Jumlah produk"
      />
      <button
        type="button"
        onClick={increment}
        disabled={disabled || quantity >= max}
        className="flex h-10 w-10 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:opacity-30"
        aria-label="Tambah jumlah"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
