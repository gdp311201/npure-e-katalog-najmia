'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LogOut,
  LayoutDashboard,
  MessageSquare,
  Target,
  Tag,
} from 'lucide-react'
import type { TokenPayload } from '@/lib/admin-auth'

interface AdminNavProps {
  user: TokenPayload
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/admin/feedback',
      label: 'Feedback',
      icon: MessageSquare,
    },
    {
      href: '/admin/focus',
      label: 'Produk Fokus',
      icon: Target,
    },
    {
      href: '/admin/pricing',
      label: 'Harga & Diskon',
      icon: Tag,
    },
  ]

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header
      className="sticky top-0 z-30 border-b border-emerald-900/30 text-white shadow-md"
      style={{ backgroundColor: 'var(--theme-primary)' }}
    >
      <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Brand + nav (desktop) */}
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/admin"
              className="text-sm font-bold text-white shrink-0"
            >
              NPURE Admin
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right: User + logout */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-white">{user.name}</p>
              <p className="text-[10px] text-white/60 capitalize">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile nav (horizontal scroll) */}
        <nav className="sm:hidden mt-2 flex items-center gap-1 overflow-x-auto pb-0.5">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
