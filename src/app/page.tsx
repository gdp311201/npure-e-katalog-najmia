'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { CatalogHeader } from '@/components/catalog/CatalogHeader'
import { CatalogFooter } from '@/components/catalog/CatalogFooter'
import { FloatingActions } from '@/components/catalog/FloatingActions'
import { CatalogFilter } from '@/components/catalog/CatalogFilter'
import { ProductCard } from '@/components/catalog/ProductCard'
import { EmptyState } from '@/components/catalog/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getCatalogSettings,
  getCatalogProducts,
  type CatalogProduct,
  type CatalogSettings,
} from '@/lib/supabase'
import { getQuizProfile, type QuizProfile } from '@/lib/quiz-profile'
import { SKIN_TYPE_OPTIONS, SKIN_CONCERN_OPTIONS } from '@/lib/quiz-config'

const FALLBACK_SETTINGS: CatalogSettings = {
  id: 1,
  brand_name: 'NPURE E-Katalog by Elsa',
  tagline: 'Skincare sehat untuk kulit sehat',
  footer_text: 'Dikelola oleh BA NPURE (Elsa) di toko Najmia Unnes',
  whatsapp_number: '6281575859792',
  whatsapp_default_message:
    'Halo Elsa, saya mau tanya produk NPURE yang ada di katalog:',
  tiktok_url: 'https://www.tiktok.com/@slvqueengreentea',
  instagram_url: null,
  shipping_info:
    'COD (Cash on Delivery) tersedia untuk area Semarang sepanjang rute Najmia Unnes - Sampangan. Hubungi WhatsApp untuk cek ketersediaan COD ke alamat Anda.',
  disclaimer_text:
    'Produk resmi NPURE. E-katalog ini dikelola oleh BA NPURE (Elsa) di toko Najmia Unnes untuk memfasilitasi pemesanan via WhatsApp. Bukan toko online resmi NPURE.',
  is_active: true,
}

const NPURE_LOGO_URL = 'https://foiteplkbfwwjshykpgj.supabase.co/storage/v1/object/public/npure-assets/NPURE-Logo-White-1.png'

interface FilterStateLocal {
  search: string
  variant: string
  productType: string
  inStockOnly: boolean
}

const DEFAULT_FILTERS: FilterStateLocal = {
  search: '',
  variant: 'all',
  productType: 'all',
  inStockOnly: false,
}

export default function HomePage() {
  const [settings, setSettings] = useState<CatalogSettings | null>(null)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterStateLocal>(DEFAULT_FILTERS)

  // Quiz profile untuk personalisasi banner (client-only, null initial).
  const [profile, setProfile] = useState<QuizProfile | null>(null)

  useEffect(() => {
    setProfile(getQuizProfile())
  }, [])

  const profileSkinLabel = profile
    ? SKIN_TYPE_OPTIONS.find((t) => t.value === profile.skinType)?.label ||
      profile.skinType
    : ''
  const profileConcernLabels = profile
    ? profile.concerns
        .map(
          (c) => SKIN_CONCERN_OPTIONS.find((o) => o.value === c)?.label || c
        )
        .join(', ')
    : ''

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [settingsData, productsData] = await Promise.all([
        getCatalogSettings(),
        getCatalogProducts(),
      ])
      setSettings(settingsData)
      setProducts(productsData)
    } catch (e) {
      console.error(e)
      setError('Gagal memuat katalog. Cek koneksi atau konfigurasi Supabase.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const variants = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.variant).filter(Boolean) as string[])).sort()
  }, [products])

  const productTypes = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.product_type).filter(Boolean) as string[])
    ).sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matches =
          p.name.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false) ||
          (p.variant?.toLowerCase().includes(q) ?? false) ||
          (p.product_type?.toLowerCase().includes(q) ?? false) ||
          (p.key_ingredients?.toLowerCase().includes(q) ?? false)
        if (!matches) return false
      }
      if (filters.variant !== 'all' && p.variant !== filters.variant) return false
      if (filters.productType !== 'all' && p.productType !== filters.productType) return false
      if (filters.inStockOnly && !p.in_stock) return false
      return true
    })
  }, [products, filters])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="h-[60px] bg-primary" />
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          <div className="space-y-4">
            <Skeleton className="h-11 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-[140px]" />
              <Skeleton className="h-10 w-[160px]" />
              <Skeleton className="h-10 w-[120px]" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !settings) {
    const s = FALLBACK_SETTINGS
    return (
      <div className="flex min-h-screen flex-col">
        <CatalogHeader
          brandName={s.brand_name}
          tagline={s.tagline}
          tiktokUrl={s.tiktok_url}
          logoUrl={NPURE_LOGO_URL}
        />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          {s.shipping_info && (
            <div className="mb-5 rounded-xl border border-border/60 bg-secondary/60 p-3 sm:p-4">
              <p className="text-xs font-medium text-secondary-foreground sm:text-sm">
                <span className="font-semibold text-primary">Info Pengiriman:</span>{' '}
                {s.shipping_info}
              </p>
            </div>
          )}
          <EmptyState
            waNumber={s.whatsapp_number}
            waDefaultMsg={s.whatsapp_default_message}
            tiktokUrl={s.tiktok_url}
            logoUrl={NPURE_LOGO_URL}
          />
        </main>
        <CatalogFooter
          footerText={s.footer_text}
          disclaimerText={s.disclaimer_text}
          shippingInfo={s.shipping_info}
          tiktokUrl={s.tiktok_url}
        />
        <FloatingActions
          waNumber={s.whatsapp_number}
          defaultMsg={s.whatsapp_default_message}
          tiktokUrl={s.tiktok_url}
        />
      </div>
    )
  }

  const showEmptyState = products.length === 0

  return (
    <div className="flex min-h-screen flex-col">
      <CatalogHeader
        brandName={settings.brand_name}
        tagline={settings.tagline}
        tiktokUrl={settings.tiktok_url}
        logoUrl={NPURE_LOGO_URL}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {settings.shipping_info && (
          <div className="mb-5 rounded-xl border border-border/60 bg-secondary/60 p-3 sm:p-4">
            <p className="text-xs font-medium text-secondary-foreground sm:text-sm">
              <span className="font-semibold text-primary">Info Pengiriman:</span>{' '}
              {settings.shipping_info}
            </p>
          </div>
        )}

        {/* Quiz CTA banner — personalisasi kalau profile sudah ada */}
        {!showEmptyState && (
          profile ? (
            <Link
              href="/quiz"
              className="group mb-5 flex items-center gap-4 rounded-xl border border-primary/40 bg-primary/10 p-4 transition hover:border-primary/60 hover:bg-primary/15 sm:p-5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground">
                🎯
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground sm:text-base">
                  Skincare profile-mu sudah aktif
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Kulit {profileSkinLabel}
                  {profileConcernLabels && ` • ${profileConcernLabels}`}
                  . Cari produk berbadge <span className="font-semibold text-primary">✓ Cocok</span> di bawah.
                </p>
              </div>
              <span className="shrink-0 text-sm font-medium text-primary transition group-hover:translate-x-0.5">
                Perbarui →
              </span>
            </Link>
          ) : (
            <Link
              href="/quiz"
              className="group mb-5 flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 transition hover:border-primary/50 hover:bg-primary/10 sm:p-5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground">
                🌿
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground sm:text-base">
                  Bingung pilih skincare yang cocok?
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Jawab 4 pertanyaan singkat &amp; dapatkan rekomendasi rutinitas personal
                </p>
              </div>
              <span className="shrink-0 text-sm font-medium text-primary transition group-hover:translate-x-0.5">
                Mulai →
              </span>
            </Link>
          )
        )}

        {showEmptyState ? (
          <EmptyState
            waNumber={settings.whatsapp_number}
            waDefaultMsg={settings.whatsapp_default_message}
            tiktokUrl={settings.tiktok_url}
            logoUrl={NPURE_LOGO_URL}
          />
        ) : (
          <>
            <CatalogFilter
              filters={filters}
              onChange={setFilters}
              variants={variants}
              productTypes={productTypes}
              totalResults={filteredProducts.length}
            />

            <div className="mt-5">
              {filteredProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Tidak ada produk yang cocok dengan filter. Coba reset filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {filteredProducts.map((p) => (
                    <ProductCard
                      key={p.catalog_product_id}
                      product={p}
                      waNumber={settings.whatsapp_number}
                      waDefaultMsg={settings.whatsapp_default_message}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <CatalogFooter
        footerText={settings.footer_text}
        disclaimerText={settings.disclaimer_text}
        shippingInfo={settings.shipping_info}
        tiktokUrl={settings.tiktok_url}
      />

      <FloatingActions
        waNumber={settings.whatsapp_number}
        defaultMsg={settings.whatsapp_default_message}
        tiktokUrl={settings.tiktok_url}
      />
    </div>
  )
}
