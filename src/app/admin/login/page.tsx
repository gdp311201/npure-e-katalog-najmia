'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // If already logged in → redirect to /admin
  useEffect(() => {
    fetch('/api/admin/me')
      .then((res) => {
        if (res.ok) {
          router.replace('/admin')
        } else {
          setChecking(false)
        }
      })
      .catch(() => setChecking(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Username dan password wajib diisi')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login gagal')
        return
      }

      // Success → redirect to dashboard
      router.replace('/admin')
      router.refresh()
    } catch {
      setError('Network error: gagal connect ke server')
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-lg sm:p-8">
          <div className="mb-6 text-center">
            <div className="mb-2 text-3xl">🔐</div>
            <h1 className="text-xl font-bold text-foreground">Admin Login</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Masuk untuk kelola katalog NPURE
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs font-medium text-rose-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError('')
                }}
                placeholder="username"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="••••••••"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              {submitting ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          <a href="/" className="hover:underline">
            ← Kembali ke katalog
          </a>
        </p>
      </div>
    </div>
  )
}
