import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  verifyToken,
  getCookieName,
  type TokenPayload,
} from '@/lib/admin-auth'
import { AdminNav } from '@/app/admin/components/AdminNav'

export const metadata: Metadata = {
  title: 'Admin E-Katalog — NPURE',
  description: 'Admin panel NPURE E-Katalog by Elsa',
  manifest: '/manifest-admin.json',
  applicationName: 'Admin E-Katalog',
  appleMobileWebAppTitle: 'Admin E-Katalog',
  appleMobileWebAppCapable: true,
  appleMobileWebAppStatusBarStyle: 'default',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192' }],
    shortcut: '/favicon.ico',
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get(getCookieName())?.value

  // No token → user is on login/setup page (middleware allows these).
  // Render children WITHOUT admin chrome.
  if (!token) {
    return <>{children}</>
  }

  // Full HMAC verification (middleware only did quick decode)
  const payload: TokenPayload | null = verifyToken(token)

  // Invalid/forged/expired token → redirect to login
  if (!payload) {
    redirect('/admin/login')
  }

  // Valid token → render with admin chrome
  return (
    <div className="min-h-screen bg-secondary/20">
      <AdminNav user={payload} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
