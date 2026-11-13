'use client';

import { QuizRecommendation } from '@/lib/quiz-recommendation';
import {
  QuizAnswers,
  SKIN_TYPE_OPTIONS,
  SKIN_CONCERN_OPTIONS,
  BUDGET_OPTIONS,
  ROUTINE_TYPE_OPTIONS,
} from '@/lib/quiz-config';
import { useCartStore } from '@/lib/cart-store';

type Props = {
  recommendation: QuizRecommendation;
  answers: QuizAnswers;
  onRestart: () => void;
};

export function QuizResults({ recommendation, answers, onRestart }: Props) {
  const addItem = useCartStore((s) => s.addItem);

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Routine Skincare untukmu!
        </h1>
        <p className="text-gray-500">Berdasarkan jawaban quiz kamu</p>
      </div>

      {/* Skin profile summary */}
      <div className="bg-green-50 rounded-2xl p-4 space-y-2">
        <div className="text-sm font-semibold text-green-800">
          Profil Kulitmu:
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Jenis:</span>{' '}
            <span className="font-medium">{skinTypeLabel}</span>
          </div>
          <div>
            <span className="text-gray-500">Budget:</span>{' '}
            <span className="font-medium">{budgetLabel}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Masalah:</span>{' '}
            <span className="font-medium">{concernLabels}</span>
          </div>
          <div>
            <span className="text-gray-500">Routine:</span>{' '}
            <span className="font-medium">{routineLabel}</span>
          </div>
          {answers.pregnant && (
            <div className="text-pink-600 font-medium">
              🤰 Mode ibu hamil aktif
            </div>
          )}
        </div>
      </div>

      {/* Product recommendations by step */}
      {recommendation.steps.length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <div className="text-4xl">🔍</div>
          <p className="text-gray-600 font-medium">
            Maaf, tidak ada produk yang cocok dengan kriteria kamu.
          </p>
          <p className="text-sm text-gray-400">
            Coba ubah jawaban quiz atau perbesar budget.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendation.steps.map((step) => (
            <div key={step.step} className="space-y-3">
              {/* Step header */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{step.emoji}</span>
                <h3 className="text-lg font-bold text-gray-900">
                  {step.label}
                </h3>
              </div>

              {/* Product cards */}
              <div className="space-y-3">
                {step.products.map((product) => (
                  <div
                    key={product.slug}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                  >
                    <div className="flex gap-3 p-3">
                      {/* Image */}
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

                      {/* Product info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <a href={`/produk/${product.slug}`}>
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-green-600">
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
                                    className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                                  >
                                    {benefit.replace(/-/g, ' ')}
                                  </span>
                                ))}
                            </div>
                          )}
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-bold text-green-600 text-sm">
                            {formatPrice(product.current_price)}
                          </span>
                          {!product.pregnancy_safe && (
                            <span className="text-xs text-orange-500">
                              ⚠️ Hindari jika hamil
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add to cart button */}
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
                      className="w-full py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
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
          className="flex-1 py-3 rounded-full border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
        >
          ↻ Ulangi Quiz
        </button>
        <a
          href="/"
          className="flex-1 py-3 rounded-full bg-green-600 text-white font-semibold text-center hover:bg-green-700 transition-colors"
        >
          Lihat Semua Produk
        </a>
      </div>
    </div>
  );
}
