'use client'

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

export function CatalogHeader({ brandName, tagline, tiktokUrl, logoUrl }: CatalogHeaderProps) {
  const openBurger = useUIStore((state) => state.openBurger)

  return (
    <header
      className="sticky top-0 z-40 border-b border-emerald-900/30 bg-primary text-primary-foreground shadow-md"
      style={{ backgroundColor: 'var(--theme-primary)' }}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={openBurger}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 active:scale-95"
              aria-label="Buka menu navigasi"
            >
              <Menu className="h-5 w-5" />
            </button>

            {logoUrl ? (
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-white/30">
                <Image
                  src={logoUrl}
                  alt="NPURE Logo"
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30 text-white font-bold text-sm"
                aria-hidden="true"
              >
                N
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-base font-semibold leading-tight truncate text-white sm:text-lg">
                {brandName}
              </h1>
              {tagline && (
                <p className="text-[11px] leading-tight text-white/80 truncate sm:text-xs">
                  {tagline}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CartButton />

            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/15 px-3 text-xs font-medium ring-1 ring-white/30 transition hover:bg-white/25 active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current text-white"
                  aria-hidden="true"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V9.18a8.27 8.27 0 0 0 4.83 1.54V7.27a4.85 4.85 0 0 1-1.1-.58z" />
                </svg>
                <span className="hidden sm:inline text-white">TikTok</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
