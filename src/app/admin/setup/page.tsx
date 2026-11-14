'use client'

import { useState } from 'react'

export default function AdminSetupPage() {
  const [setupKey, setSetupKey] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!setupKey || !username || !password || !name) {
      setError('Semua field wajib diisi')
      return
    }
    if (password.length < 8) {
      setError('Password minimum 8 karakter')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setupKey,
          username: username.trim().toLowerCase(),
          password,
          name: name.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal membuat admin')
        return
      }

      setSuccess(
        'Admin user berhasil dibuat! Lanjut login di /admin/login dengan username & password yang baru lu buat.'
      )
      setSetupKey('')
      setUsername('')
      setPassword('')
      setName('')
    } catch (e) {
      setError('Network error: gagal connect ke server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-lg sm:p-8">
          <div className="mb-6 text-center">
            <div className="mb-2 text-3xl">🔐</div>
            <h1 className="text-xl font-bold text-foreground">
              Setup Admin Pertama
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              One-time setup. Buat admin user pertama buat Elsa & tim.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs font-medium text-rose-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-medium text-emerald-700">{success}</p>
              <a
                href="/admin/login"
                className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
              >
                Lanjut ke Login →
              </a>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Setup Key
              </label>
              <input
                type="password"
                value={setupKey}
                onChange={(e) => {
                  setSetupKey(e.target.value)
                  setError('')
                }}
                placeholder="ADMIN_SETUP_KEY dari env var"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoComplete="off"
              />
            </div>

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
                placeholder="contoh: elsa"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Password (min. 8 karakter)
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
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                placeholder="contoh: Elsa"
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoComplete="name"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              {submitting ? 'Membuat admin...' : 'Buat Admin Pertama'}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-secondary/40 p-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Catatan keamanan:</strong>{' '}
              Halaman ini cuma bisa dipake sekali (one-time). Setelah admin
              pertama dibuat, halaman ini otomatis nolak pembuatan admin baru.
              Admin berikutnya dibuat lewat panel admin setelah login.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
