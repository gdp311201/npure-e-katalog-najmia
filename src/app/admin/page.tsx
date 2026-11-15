import Link from 'next/link'
import {
  MessageSquare,
  Target,
  Tag,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { getAdminSupabase } from '@/lib/admin-supabase'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = getAdminSupabase()

  const currentMonth = new Date().toISOString().slice(0, 7)
  const nowIso = new Date().toISOString()

  // Fetch stats in parallel
  const [
    feedbackAll,
    feedbackUnread,
    focusThisMonth,
    newReleaseActive,
    pricingWithDiscount,
  ] = await Promise.all([
    supabase
      .from('catalog_feedback')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('catalog_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false),
    supabase
      .from('catalog_product_focus')
      .select('*', { count: 'exact', head: true })
      .eq('period_month', currentMonth)
      .eq('is_active', true),
    // New Release: active (new_release_until > NOW())
    supabase
      .from('v_catalog_products')
      .select('*', { count: 'exact', head: true })
      .not('new_release_until', 'is', null)
      .gt('new_release_until', nowIso),
    // Pricing: products with compare_at_price set (visible only)
    supabase
      .from('v_catalog_products')
      .select('compare_at_price', { count: 'exact', head: true })
      .not('compare_at_price', 'is', null),
  ])

  const stats = [
    {
      label: 'Feedback belum dibaca',
      value: feedbackUnread.count ?? 0,
      total: feedbackAll.count ?? 0,
      href: '/admin/feedback',
      icon: MessageSquare,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      label: 'Produk Fokus bulan ini',
      value: focusThisMonth.count ?? 0,
      total: null,
      href: '/admin/focus',
      icon: Target,
      color: 'text-primary',
      bg: 'bg-primary/5',
    },
    {
      label: 'New Release aktif',
      value: newReleaseActive.count ?? 0,
      total: null,
      href: '/admin/new-release',
      icon: Sparkles,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Produk dengan diskon',
      value: pricingWithDiscount.count ?? 0,
      total: null,
      href: '/admin/pricing',
      icon: Tag,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ]

  const monthName = new Date().toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola katalog, feedback, dan strategi penjualan — {monthName}.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl border border-border/60 bg-card p-4 transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {stat.value}
              {stat.total !== null && (
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}
                  / {stat.total}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link
            href="/admin/feedback"
            className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm transition hover:border-primary/30 hover:bg-secondary/30"
          >
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-foreground">Baca feedback customer</span>
          </Link>
          <Link
            href="/admin/focus"
            className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm transition hover:border-primary/30 hover:bg-secondary/30"
          >
            <Target className="h-4 w-4 text-primary" />
            <span className="text-foreground">Set produk fokus bulan ini</span>
          </Link>
          <Link
            href="/admin/new-release"
            className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm transition hover:border-primary/30 hover:bg-secondary/30"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-foreground">Flag produk baru (New Release)</span>
          </Link>
          <Link
            href="/admin/pricing"
            className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm transition hover:border-primary/30 hover:bg-secondary/30"
          >
            <Tag className="h-4 w-4 text-primary" />
            <span className="text-foreground">Atur harga diskon (compare-at)</span>
          </Link>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">
            💡 Status MVP:
          </span>{' '}
          Semua 4 panel admin udah aktif — Feedback, Produk Fokus, New Release,
          dan Harga &amp; Diskon. Elsa bisa self-manage tanpa SQL. Untuk
          perubahan produk (harga, stok, unhide), tetap lewat NPURE SO.
        </p>
      </div>
    </div>
  )
}
