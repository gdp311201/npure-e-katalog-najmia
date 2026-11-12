import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, BadgeCheck, FlaskConical, Ruler } from 'lucide-react'
import { CatalogHeader } from '@/components/catalog/CatalogHeader'
import { CatalogFooter } from '@/components/catalog/CatalogFooter'
import { FloatingWhatsApp } from '@/components/catalog/FloatingWhatsApp'
import { ProductGallery } from '@/components/catalog/ProductGallery'
import { ProductDetailActions } from '@/components/catalog/ProductDetailActions'
import { SimilarProducts } from '@/components/catalog/SimilarProducts'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  getProductBySlug,
  getSimilarProducts,
  getCatalogSettings,
  type CatalogSettings,
} from '@/lib/supabase'

const NPURE_LOGO_URL =
  'https://foiteplkbfwwjshykpgj.supabase.co/storage/v1/object/public/npure-assets/logo.png'

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
    'COD (Cash on Delivery) tersedia untuk area Semarang sepanjang rute Najmia Unnes - Sampangan.',
  disclaimer_text:
    'Produk resmi NPURE. E-katalog ini dikelola oleh BA NPURE (Elsa) di toko Najmia Unnes untuk memfasilitasi pemesanan via WhatsApp. Bukan toko online resmi NPURE.',
  is_active: true,
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: 'Produk tidak ditemukan — NPURE E-Katalog by Elsa',
    }
  }

  const title = `${product.name} — NPURE E-Katalog by Elsa`
  const description = product.description
    ? product.description.substring(0, 160)
    : `${product.name} — ${product.variant || ''} Series. Pesan via WhatsApp.`

  const imageUrl = product.image_url_1 || NPURE_LOGO_URL

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'id_ID',
      images: [{ url: imageUrl, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  const [product, settingsData, similarProducts] = await Promise.all([
    getProductBySlug(slug),
    getCatalogSettings(),
    getSimilarProducts(null, slug, 6),
  ])

  if (!product) {
    notFound()
  }

  const settings = settingsData || FALLBACK_SETTINGS

  const similar =
    similarProducts.length > 0
      ? similarProducts
      : await getSimilarProducts(product.variant, slug, 6)

  return (
    <div className="flex min-h-screen flex-col">
      <CatalogHeader
        brandName={settings.brand_name}
        tagline={settings.tagline}
        tiktokUrl={settings.tiktok_url}
        logoUrl={NPURE_LOGO_URL}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {/* Breadcrumb / Back */}
        <div className="mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali ke Katalog
          </Link>
        </div>

        {/* Product Detail — 2 column layout */}
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          {/* Left: Gallery */}
          <div className="sm:w-1/2">
            <ProductGallery
              name={product.name}
              image_url_1={product.image_url_1}
              image_url_2={product.image_url_2}
              image_url_3={product.image_url_3}
              image_url_4={product.image_url_4}
            />
          </div>

          {/* Right: Info + Actions */}
          <div className="space-y-4 sm:w-1/2">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {product.variant && (
                <Badge variant="secondary" className="font-medium">
                  {product.variant}
                </Badge>
              )}
              {product.product_type && (
                <Badge variant="outline" className="font-medium">
                  {product.product_type}
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="bg-primary text-primary-foreground">
                  ★ Featured
                </Badge>
              )}
            </div>

            {/* Name */}
            <h1 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
              {product.name}
            </h1>

            {/* Price + Stock + Quantity + Actions */}
            <ProductDetailActions product={product} settings={settings} />
          </div>
        </div>

        {/* Description section */}
        <div className="mt-10 space-y-6">
          {product.description && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Deskripsi Produk
              </h2>
              <Separator className="mb-4" />
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </section>
          )}

          {product.key_ingredients && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <FlaskConical className="h-4 w-4 text-primary" />
                Key Ingredients
              </h2>
              <Separator className="mb-4" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.key_ingredients}
              </p>
            </section>
          )}

          {/* BPOM + Netto */}
          {(product.bpom_number || product.netto) && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Informasi Produk
              </h2>
              <Separator className="mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {product.bpom_number && (
                  <div>
                    <p className="text-xs text-muted-foreground">Nomor BPOM</p>
                    <p className="text-sm font-medium text-foreground">
                      {product.bpom_number}
                    </p>
                  </div>
                )}
                {product.netto && (
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      Isi / Netto
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {product.netto}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Disclaimer */}
          <section className="rounded-lg border border-border/60 bg-secondary/40 p-4">
            <p className="text-xs text-muted-foreground">
              {settings.disclaimer_text}
            </p>
          </section>
        </div>

        {/* Similar Products */}
        <SimilarProducts products={similar} variant={product.variant} />
      </main>

      <CatalogFooter
        footerText={settings.footer_text}
        disclaimerText={settings.disclaimer_text}
        shippingInfo={null}
        tiktokUrl={settings.tiktok_url}
      />

      <FloatingWhatsApp
        waNumber={settings.whatsapp_number}
        defaultMsg={settings.whatsapp_default_message}
      />
    </div>
  )
}
