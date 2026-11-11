'use client'

interface CatalogFooterProps {
  footerText: string | null
  disclaimerText: string
  shippingInfo: string | null
  tiktokUrl: string | null
}

export function CatalogFooter({
  footerText,
  disclaimerText,
  shippingInfo,
  tiktokUrl,
}: CatalogFooterProps) {
  // shippingInfo is shown in the top banner (above product grid) — not duplicated here
  return (
    <footer
      className="mt-auto border-t border-emerald-100"
      style={{ backgroundColor: 'var(--secondary)' }}
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-4 text-xs sm:grid-cols-2 sm:text-[13px]">
          {/* Brand info */}
          <div className="space-y-2">
            {footerText && (
              <p className="font-medium text-foreground">{footerText}</p>
            )}
          </div>

          {/* Disclaimer */}
          <div className="space-y-2 sm:text-right">
            <p className="text-muted-foreground">{disclaimerText}</p>
            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current"
                  aria-hidden="true"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V9.18a8.27 8.27 0 0 0 4.83 1.54V7.27a4.85 4.85 0 0 1-1.1-.58z" />
                </svg>
                Ikuti TikTok kami
              </a>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-emerald-100 pt-3 text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()} NPURE E-Katalog. Dibuat untuk BA NPURE Elsa di toko Najmia Unnes.
        </div>
      </div>
    </footer>
  )
}
