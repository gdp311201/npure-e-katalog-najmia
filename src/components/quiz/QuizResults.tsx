'use client';

import { useEffect } from 'react';
import { QuizRecommendation } from '@/lib/quiz-recommendation';
import {
  QuizAnswers,
  SKIN_TYPE_OPTIONS,
  SKIN_CONCERN_OPTIONS,
  BUDGET_OPTIONS,
  ROUTINE_TYPE_OPTIONS,
} from '@/lib/quiz-config';
import { saveQuizProfile } from '@/lib/quiz-profile';
import { useCartStore } from '@/lib/cart-store';

type Props = {
  recommendation: QuizRecommendation;
  answers: QuizAnswers;
  onRestart: () => void;
};

export function QuizResults({ recommendation, answers, onRestart }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    saveQuizProfile(answers);
  }, [answers]);

  const skinTypeLabel =
    SKIN_TYPE_OPTIONS.find((t) => t.value === answers.skinType)?.label ||
    answers.skinType;
  const budgetLabel =
    BUDGET_OPTIONS.find((b) => b.value === answers.budget)?.label ||
    answers.budget;
  const routineLabel =
    ROUTINE_TYPE_OPTIONS.find((r) => r.value === answers.routineType)?.label ||
    answers.routineType;
  const concernLabels = answers.concerns
    .map((c) => SKIN_CONCERN_OPTIONS.find((o) => o.value === c)?.label || c)
    .join(', ');

  const formatPrice = (price: number) => {
    return 'Rp' + (price || 0).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-4xl">🎉</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Routine Skincare untukmu!
        </h1>
        <p className="text-muted-foreground">Berdasarkan jawaban quiz kamu</p>
      </div>

      {/* Skin profile summary */}
      <div className="bg-primary/5 rounded-2xl p-4 space-y-2 border border-primary/20">
        <div className="text-sm font-semibold text-primary">
          Profil Kulitmu:
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Jenis:</span>{' '}
            <span className="font-medium text-foreground">{skinTypeLabel}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Budget:</span>{' '}
            <span className="font-medium text-foreground">{budgetLabel}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Masalah:</span>{' '}
            <span className="font-medium text-foreground">{concernLabels}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Routine:</span>{' '}
            <span className="font-medium text-foreground">{routineLabel}</span>
          </div>
        </div>
      </div>

      {/* Product recommendations by step */}
      {recommendation.steps.length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <div className="text-4xl">🔍</div>
          <p className="text-muted-foreground font-medium">
            Maaf, tidak ada produk yang cocok dengan kriteria kamu.
          </p>
          <p className="text-sm text-muted-foreground/70">
            Coba ubah jawaban quiz atau perbesar budget.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendation.steps.map((step) => (
            <div key={step.step} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{step.emoji}</span>
                <h3 className="text-lg font-bold text-foreground">
                  {step.label}
                </h3>
              </div>

              <div className="space-y-3">
                {step.products.map((product) => (
                  <div
                    key={product.slug}
                    className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border/60"
                  >
                    <div className="flex gap-3 p-3">
                      {product.image_url_1 && (
                        <a
                          href={`/produk/${product.slug}`}
                          className="flex-shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.image_url_1}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </a>
                      )}

                      <div className="flex-1 min-w-0 space-y-1">
                        <a href={`/produk/${product.slug}`}>
                          <h4 className="font-semibold text-foreground text-sm line-clamp-2 hover:text-primary">
                            {product.name}
                          </h4>
                        </a>
                        {product.key_benefits &&
                          product.key_benefits.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {product.key_benefits
                                .slice(0, 3)
                                .map((benefit) => (
                                  <span
                                    key={benefit}
                                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                                  >
                                    {benefit.replace(/-/g, ' ')}
                                  </span>
                                ))}
                            </div>
                          )}
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-bold text-primary text-sm">
                            {formatPrice(product.current_price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        addItem({
                          slug: product.slug,
                          name: product.name,
                          price: product.current_price,
                          image: product.image_url_1,
                          quantity: 1,
                        })
                      }
                      className="w-full py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      + Keranjang
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-1">
        <div className="text-sm font-semibold text-yellow-800">
          ⚠️ Disclaimer
        </div>
        <p className="text-xs text-yellow-700 leading-relaxed">
          Rekomendasi produk berdasarkan informasi atribut produk dan jawaban
          quiz kamu, bukan konsultasi medis. Hasil dapat bervariasi tergantung
          kondisi kulit individual. Untuk masalah kulit yang serius,
          konsultasikan dengan dokter kulit. Selalu lakukan patch test sebelum
          menggunakan produk baru.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 py-3 rounded-full border-2 border-border text-muted-foreground font-medium hover:bg-secondary transition-colors"
        >
          ↻ Ulangi Quiz
        </button>
        <a
          href="/"
          className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-center hover:bg-primary/90 transition-colors"
        >
          Lihat Semua Produk
        </a>
      </div>
    </div>
  );
}
