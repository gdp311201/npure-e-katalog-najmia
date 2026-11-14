'use client'

import Image from 'next/image'
import { buildWhatsAppLink } from '@/lib/supabase'

interface FloatingActionsProps {
  waNumber: string
  defaultMsg: string
  tiktokUrl?: string | null
}

const TIKTOK_LOGO_URL =
  'https://foiteplkbfwwjshykpgj.supabase.co/storage/v1/object/public/npure-assets/tiktok_logo.png'
const WA_LOGO_URL =
  'https://foiteplkbfwwjshykpgj.supabase.co/storage/v1/object/public/npure-assets/wa_logo.png'

export function FloatingActions({ waNumber, defaultMsg, tiktokUrl }: FloatingActionsProps) {
  const waHref = buildWhatsAppLink(waNumber, defaultMsg)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-center gap-3">
      {/* TikTok — atas (hanya jika tiktokUrl ada) */}
      {tiktokUrl && (
        <a
          href={tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok NPURE"
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-black shadow-xl ring-2 ring-white transition hover:scale-105 active:scale-95"
        >
          <Image
            src={TIKTOK_LOGO_URL}
            alt="TikTok"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
          <span className="sr-only">TikTok NPURE</span>
        </a>
      )}

      {/* WhatsApp — bawah */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp"
        className="fab-pulse inline-flex h-14 w-14 items-center justify-center rounded-full shadow-xl ring-2 ring-white transition hover:scale-105 active:scale-95"
        style={{ backgroundColor: 'var(--theme-wa)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--theme-wa-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--theme-wa)')}
      >
        <Image
          src={WA_LOGO_URL}
          alt="WhatsApp"
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
        />
        <span className="sr-only">Chat WhatsApp</span>
      </a>
    </div>
  )
}
