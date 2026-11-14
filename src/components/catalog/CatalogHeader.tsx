'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { CartButton } from '@/components/catalog/CartButton'
import { useUIStore } from '@/lib/ui-store'

interface CatalogHeaderProps {
  brandName: string
  tagline: string | null
  tiktokUrl: string | null
  logoUrl?: string
}

export function CatalogHeader({ logoUrl }: CatalogHeaderProps) {
  const openBurger = useUIStore((state) => state.openBurger)

  return (
    <header
      className="sticky top-0 z-40 border-b border-emerald-900/30 bg-primary text-primary-foreground shadow-md"
      style={{ backgroundColor: 'var(--theme-primary)' }}
    >
      <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Left side: Hamburger + Logo */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Hamburger button */}
            <button
              type="button"
              onClick={openBurger}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 active:scale-95"
              aria-label="Buka menu navigasi"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo + subtitle (clickable → home) */}
            <Link
              href="/"
              className="flex flex-col items-start justify-center gap-0.5 min-w-0 leading-none transition hover:opacity-90 active:scale-[0.98]"
              aria-label="NPURE E-Katalog by Elsa — kembali ke beranda"
            >
              {logoUrl ? (
                <div className="relative h-7 sm:h-8 w-auto shrink-0">
                  <Image
                    src={logoUrl}
                    alt="NPURE Logo"
                    width={120}
                    height={32}
                    className="h-7 sm:h-8 w-auto object-contain"
                    priority
                  />
                </div>
              ) : (
                <div
                  className="flex h-7 sm:h-8 items-center justify-center rounded bg-white/15 px-2 text-white font-bold text-xs"
                  aria-hidden="true"
                >
                  NPURE
                </div>
              )}
              <span className="text-[10px] leading-tight text-white/80 truncate sm:text-[11px]">
                E-Katalog by Elsa
              </span>
            </Link>
          </div>

          {/* Right side: Cart only */}
          <div className="flex items-center gap-2">
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  )
}
