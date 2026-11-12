'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  X, Home, Sparkles, Tag, MapPin, MessageSquare,
  ArrowLeft, Send, Store,
} from 'lucide-react'
import { useUIStore } from '@/lib/ui-store'

export function BurgerMenu() {
  const { isBurgerOpen, closeBurger } = useUIStore()
  const [view, setView] = useState<'menu' | 'feedback'>('menu')
  const [prevIsOpen, setPrevIsOpen] = useState(isBurgerOpen)

  if (isBurgerOpen !== prevIsOpen) {
    setPrevIsOpen(isBurgerOpen)
    if (isBurgerOpen) {
      setView('menu')
    }
  }

  useEffect(() => {
    if (isBurgerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isBurgerOpen])

  const handleNavigate = () => {
    closeBurger()
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isBurgerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeBurger}
        aria-hidden="true"
      />

      <div
        className={`fixed left-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ${
          isBurgerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
      >
        <div
          className="flex items-center justify-between border-b border-border px-4 py-3 text-white"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        >
          <div className="flex items-center gap-2">
            {view === 'feedback' ? (
              <button
                type="button"
                onClick={() => setView('menu')}
                className="flex items-center gap-1 text-sm text-white/80 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </button>
            ) : (
              <h2 className="text-base font-semibold">Menu</h2>
            )}
          </div>
          <button
            type="button"
            onClick={closeBurger}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {view === 'menu' ? (
            <MenuView onNavigate={handleNavigate} onFeedback={() => setView('feedback')} />
          ) : (
            <FeedbackView onClose={closeBurger} />
          )}
        </div>
      </div>
    </>
  )
}

function MenuView({ onNavigate, onFeedback }: { onNavigate: () => void; onFeedback: () => void }) {
  const menuItems = [
    { icon: Home, label: 'Katalog Produk', href: '/', description: 'Lihat semua produk NPURE' },
    { icon: Sparkles, label: 'New Release', href: '/', description: 'Produk terbaru', badge: 'Segera hadir' },
    { icon: Tag, label: 'Promo & Diskon', href: '/', description: 'Penawaran spesial', badge: 'Segera hadir' },
  ]

  return (
    <div className="flex flex-col">
      <nav className="py-2">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 px-4 py-3 transition hover:bg-secondary/60"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-800">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </Link>
        ))}

        <button
          type="button"
          onClick={onFeedback}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-secondary/60"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground">Kritik & Saran</span>
            <p className="text-xs text-muted-foreground">Berikan feedback untuk Elsa</p>
          </div>
        </button>
      </nav>

      <div className="mx-4 border-t border-border" />

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Lokasi Outlet & Profil BA</h3>
        </div>

        <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Beauty Advisor</p>
            <p className="text-sm font-medium text-foreground">Elsa</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Outlet
            </p>
            <p className="text-sm font-medium text-foreground">Najmia Unnes, Semarang</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pengiriman</p>
            <p className="text-xs text-foreground">
              COD tersedia sepanjang rute Najmia Unnes - Sampangan
            </p>
          </div>
          <a
            href="https://www.tiktok.com/@slvqueengreentea"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V9.18a8.27 8.27 0 0 0 4.83 1.54V7.27a4.85 4.85 0 0 1-1.1-.58z" />
            </svg>
            @slvqueengreentea
          </a>
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Produk resmi NPURE. E-katalog ini dikelola oleh BA NPURE (Elsa) di toko Najmia Unnes untuk memfasilitasi pemesanan via WhatsApp. Bukan toko online resmi NPURE.
        </p>
      </div>
    </div>
  )
}

function FeedbackView({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'kritik' | 'saran' | 'pertanyaan'>('saran')
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!name.trim()) { setError('Nama wajib diisi'); return }
    if (!message.trim()) { setError('Pesan wajib diisi'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name, whatsapp, message }),
      })
      if (!res.ok) throw new Error('Gagal mengirim feedback')
      setSubmitted(true)
      setName(''); setWhatsapp(''); setMessage('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Send className="h-8 w-8" />
        </div>
        <div>
          <p className="text-base font-medium text-foreground">Terima kasih!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Feedback Anda telah terkirim. Elsa sangat menghargai masukan Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setSubmitted(false); onClose() }}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        >
          Tutup
        </button>
      </div>
    )
  }

  const typeOptions: { value: 'kritik' | 'saran' | 'pertanyaan'; label: string }[] = [
    { value: 'kritik', label: 'Kritik' },
    { value: 'saran', label: 'Saran' },
    { value: 'pertanyaan', label: 'Pertanyaan' },
  ]

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Kritik & Saran</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Bantu Elsa meningkatkan pelayanan. Sampaikan kritik, saran, atau pertanyaan Anda.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">Jenis Feedback</label>
        <div className="flex gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                type === opt.value
                  ? 'border-primary bg-secondary text-primary'
                  : 'border-border bg-white text-muted-foreground hover:border-primary/30'
              }`}
              style={type === opt.value ? { borderColor: 'var(--theme-primary)', backgroundColor: 'var(--accent)' } : {}}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="fb-name" className="mb-1 block text-xs font-medium text-muted-foreground">Nama *</label>
        <input
          id="fb-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          placeholder="Nama lengkap Anda"
          className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="fb-wa" className="mb-1 block text-xs font-medium text-muted-foreground">WhatsApp (opsional)</label>
        <input
          id="fb-wa"
          type="tel"
          value={whatsapp}
          onChange={(e) => { setWhatsapp(e.target.value); setError('') }}
          placeholder="08xxxxxxxxxx"
          className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="fb-msg" className="mb-1 block text-xs font-medium text-muted-foreground">Pesan *</label>
        <textarea
          id="fb-msg"
          value={message}
          onChange={(e) => { setMessage(e.target.value); setError('') }}
          placeholder="Tulis kritik, saran, atau pertanyaan Anda..."
          rows={4}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition disabled:opacity-50"
        style={{ backgroundColor: 'var(--theme-primary)' }}
      >
        <Send className="h-4 w-4" />
        {submitting ? 'Mengirim...' : 'Kirim Feedback'}
      </button>
    </div>
  )
}
