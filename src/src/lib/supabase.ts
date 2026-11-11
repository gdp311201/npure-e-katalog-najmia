import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Copy .env.local.example to .env.local and fill in your Supabase credentials.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

export interface CatalogProduct {
  catalog_product_id: string
  product_id: string
  name: string
  slug: string
  description: string | null
  product_type: string | null
  variant: string | null
  bpom_number: string | null
  netto: string | null
  key_ingredients: string | null
  image_url_1: string | null
  image_url_2: string | null
  is_featured: boolean
  current_price: number | null
  in_stock: boolean
  so_created_at: string
  catalog_created_at: string
  catalog_updated_at: string
}

export interface CatalogSettings {
  id: number
  brand_name: string
  tagline: string | null
  footer_text: string | null
  whatsapp_number: string
  whatsapp_default_message: string
  tiktok_url: string | null
  instagram_url: string | null
  shipping_info: string | null
  disclaimer_text: string
  is_active: boolean
}

export interface CatalogPromo {
  id: string
  title: string
  description: string | null
  image_url: string | null
  cta_text: string | null
  cta_link: string | null
  display_order: number
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
}

export async function getCatalogSettings(): Promise<CatalogSettings | null> {
  const { data, error } = await supabase
    .from('catalog_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching catalog_settings:', error)
    return null
  }
  return data as CatalogSettings | null
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from('v_catalog_products')
    .select('*')
    .order('variant', { ascending: true })
    .order('product_type', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching v_catalog_products:', error)
    return []
  }
  return (data || []) as CatalogProduct[]
}

export async function getActivePromos(): Promise<CatalogPromo[]> {
  const { data, error } = await supabase
    .from('catalog_promos')
    .select('*')
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
    .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching catalog_promos:', error)
    return []
  }
  return (data || []) as CatalogPromo[]
}

export async function trackProductView(
  productId: string,
  sessionId: string,
  metadata?: { customer_id?: string; user_agent?: string; referrer?: string }
): Promise<void> {
  const { error } = await supabase.from('catalog_views').insert({
    product_id: productId,
    session_id: sessionId,
    customer_id: metadata?.customer_id,
    user_agent: metadata?.user_agent,
    referrer: metadata?.referrer,
  })
  if (error) console.error('Failed to track view:', error.message)
}

export async function trackInterest(
  productId: string,
  sessionId: string,
  interestType: 'order_click' | 'wa_chat' | 'favorite_added',
  customerId?: string
): Promise<void> {
  const { error } = await supabase.from('catalog_interests').insert({
    product_id: productId,
    session_id: sessionId,
    interest_type: interestType,
    customer_id: customerId,
  })
  if (error) console.error('Failed to track interest:', error.message)
}

export async function upsertCustomer(
  name: string,
  whatsapp: string,
  sessionId: string,
  source?: string
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('catalog_customers')
    .select('id')
    .eq('whatsapp_number', whatsapp)
    .maybeSingle()

  if (existing) {
    return existing.id
  }

  const { data, error } = await supabase
    .from('catalog_customers')
    .insert({
      name,
      whatsapp_number: whatsapp,
      source: source || 'catalog_order',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to upsert customer:', error.message)
    return null
  }
  return data.id
}

export function formatPrice(rupiah: number | null): string {
  if (rupiah === null || rupiah === undefined) return '—'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupiah)
}

export function buildWhatsAppLink(
  waNumber: string,
  message: string
): string {
  const cleaned = waNumber.replace(/\D/g, '')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}

export function buildProductOrderMessage(
  productName: string,
  price: string,
  inStock: boolean,
  defaultMsg: string
): string {
  const stockText = inStock ? 'Tersedia' : 'Kosong (pre-order)'
  return `${defaultMsg}

Produk: ${productName}
Harga: ${price}
Status stok: ${stockText}

Mohon info selengkapnya ya. Terima kasih!`
}
