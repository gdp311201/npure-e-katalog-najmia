'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Package, ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGalleryProps {
  name: string
  image_url_1: string | null
  image_url_2: string | null
  image_url_3: string | null
  image_url_4: string | null
}

export function ProductGallery({
  name,
  image_url_1,
  image_url_2,
  image_url_3,
  image_url_4,
}: ProductGalleryProps) {
  const images = [image_url_1, image_url_2, image_url_3, image_url_4].filter(
    (img): img is string => Boolean(img)
  )

  const [activeIndex, setActiveIndex] = useState(0)

  const hasMultiple = images.length > 1

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!hasMultiple) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    },
    [hasMultiple, goPrev, goNext]
  )

  if (images.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <Package className="h-20 w-20" aria-hidden="true" />
        </div>
      </div>
    )
  }

  const activeImg = images[activeIndex]

  return (
    <div className="space-y-3">
      {/* Main image with arrow navigation */}
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border/60"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="group"
        aria-label="Galeri gambar produk"
      >
        <Image
          src={activeImg}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />

        {/* Arrow navigation */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground shadow-md ring-1 ring-black/10 backdrop-blur-sm transition hover:bg-white hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary opacity-0 group-hover:opacity-100 sm:opacity-100"
              aria-label="Gambar sebelumnya"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground shadow-md ring-1 ring-black/10 backdrop-blur-sm transition hover:bg-white hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary opacity-0 group-hover:opacity-100 sm:opacity-100"
              aria-label="Gambar berikutnya"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-2 right-2 z-10 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                activeIndex === idx
                  ? 'ring-primary'
                  : 'ring-transparent hover:ring-border'
              }`}
              aria-label={`Lihat gambar ${idx + 1}`}
              aria-pressed={activeIndex === idx}
            >
              <Image
                src={img}
                alt={`${name} - gambar ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
