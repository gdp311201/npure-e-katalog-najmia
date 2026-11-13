'use client';

import { useState } from 'react';
import {
  QuizAnswers,
  SKIN_TYPE_OPTIONS,
  SKIN_CONCERN_OPTIONS,
  BUDGET_OPTIONS,
  ROUTINE_TYPE_OPTIONS,
} from '@/lib/quiz-config';

type Props = {
  onComplete: (answers: QuizAnswers) => void;
};

type QuestionOption = {
  value: string;
  label: string;
  emoji?: string;
  desc?: string;
};

type Question = {
  id: keyof QuizAnswers | 'pregnant';
  title: string;
  subtitle: string;
  type: 'single' | 'multi';
  options: QuestionOption[];
  maxSelect?: number;
};

const QUESTIONS: Question[] = [
  {
    id: 'skinType',
    title: 'Jenis kulit wajahmu apa?',
    subtitle: 'Pilih satu yang paling menggambarkan kondisi kulitmu',
    type: 'single',
    options: SKIN_TYPE_OPTIONS,
  },
  {
    id: 'concerns',
    title: 'Masalah kulit apa yang ingin kamu atasi?',
    subtitle: 'Pilih maksimal 3 yang paling mengganggu',
    type: 'multi',
    options: SKIN_CONCERN_OPTIONS,
    maxSelect: 3,
  },
  {
    id: 'budget',
    title: 'Berapa budget per produk skincare?',
    subtitle: 'Kami akan cari produk terbaik dalam rentang harga ini',
    type: 'single',
    options: BUDGET_OPTIONS,
  },
  {
    id: 'pregnant',
    title: 'Apakah kamu sedang hamil atau menyusui?',
    subtitle: 'Untuk memfilter produk yang aman untuk ibu hamil',
    type: 'single',
    options: [
      { value: 'no', label: 'Tidak', emoji: '🚫' },
      { value: 'yes', label: 'Ya, sedang hamil/menyusui', emoji: '🤰' },
    ],
  },
  {
    id: 'routineType',
    title: 'Routine skincare seperti apa yang kamu inginkan?',
    subtitle: 'Pilih sesuai waktu dan effort yang bisa kamu luangkan',
    type: 'single',
    options: ROUTINE_TYPE_OPTIONS,
  },
];

export function QuizFlow({ onComplete }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers> & { pregnant: boolean }>({
    concerns: [],
    pregnant: false,
  });

  const question = QUESTIONS[currentQ];
  const isLast = currentQ === QUESTIONS.length - 1;
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  const handleSingleSelect = (value: string) => {
    const newAnswers = { ...answers };
    if (question.id === 'pregnant') {
      newAnswers.pregnant = value === 'yes';
    } else {
      (newAnswers as any)[question.id] = value;
    }
    setAnswers(newAnswers);

    // Auto-advance after short delay for single-select
    setTimeout(() => {
      if (isLast) {
        onComplete(newAnswers as QuizAnswers);
      } else {
        setCurrentQ(currentQ + 1);
      }
    }, 250);
  };

  const handleMultiSelect = (value: string) => {
    const currentConcerns = answers.concerns || [];
    let newConcerns: string[];

    if (currentConcerns.includes(value)) {
      newConcerns = currentConcerns.filter((c) => c !== value);
    } else {
      if (currentConcerns.length >= (question.maxSelect || 3)) return;
      newConcerns = [...currentConcerns, value];
    }

    setAnswers({ ...answers, concerns: newConcerns });
  };

  const canProceed = () => {
    if (question.type === 'single') {
      if (question.id === 'pregnant') return true;
      return !!(answers as any)[question.id];
    }
    return (answers.concerns || []).length > 0;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (isLast) {
      onComplete(answers as QuizAnswers);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            Pertanyaan {currentQ + 1} dari {QUESTIONS.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {question.title}
        </h2>
        <p className="text-sm text-gray-500">{question.subtitle}</p>

        {/* Options */}
        <div className="space-y-2 pt-2">
          {question.type === 'single'
            ? question.options.map((option) => {
                const isSelected =
                  question.id === 'pregnant'
                    ? option.value === 'yes' === answers.pregnant
                    : (answers as any)[question.id] === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleSingleSelect(option.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {option.emoji && (
                        <span className="text-2xl">{option.emoji}</span>
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {option.label}
                        </div>
                        {option.desc && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {option.desc}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <span className="text-green-600 text-xl">✓</span>
                      )}
                    </div>
                  </button>
                );
              })
            : question.options.map((option) => {
                const isSelected = (answers.concerns || []).includes(
                  option.value
                );
                return (
                  <button
                    key={option.value}
                    onClick={() => handleMultiSelect(option.value)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {option.emoji && (
                        <span className="text-xl">{option.emoji}</span>
                      )}
                      <span className="flex-1 font-medium text-gray-900">
                        {option.label}
                      </span>
                      {isSelected && (
                        <span className="text-green-600 text-lg">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
        </div>

        {/* Multi-select counter */}
        {question.type === 'multi' && (
          <p className="text-xs text-gray-400 pt-1">
            Terpilih: {(answers.concerns || []).length}/{question.maxSelect || 3}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentQ > 0 && (
          <button
            onClick={handleBack}
            className="flex-1 py-3 rounded-full border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            ← Kembali
          </button>
        )}
        {question.type === 'multi' && (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 py-3 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLast ? 'Lihat Hasil →' : 'Lanjut →'}
          </button>
        )}
      </div>
    </div>
  );
}
