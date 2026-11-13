'use client';

import { useState } from 'react';
import { QuizAnswers } from '@/lib/quiz-config';
import {
  getQuizRecommendations,
  QuizRecommendation,
} from '@/lib/quiz-recommendation';
import { QuizFlow } from '@/components/quiz/QuizFlow';
import { QuizResults } from '@/components/quiz/QuizResults';

type QuizPageState = 'intro' | 'quiz' | 'loading' | 'results';

export default function QuizPage() {
  const [state, setState] = useState<QuizPageState>('intro');
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [recommendation, setRecommendation] =
    useState<QuizRecommendation | null>(null);

  const handleStart = () => setState('quiz');

  const handleComplete = async (ans: QuizAnswers) => {
    setAnswers(ans);
    setState('loading');
    const result = await getQuizRecommendations(ans);
    setRecommendation(result);
    setState('results');
  };

  const handleRestart = () => {
    setAnswers(null);
    setRecommendation(null);
    setState('intro');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {state === 'intro' && (
          <div className="text-center space-y-6">
            <div className="text-6xl">🌿</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Skincare Quiz
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Temukan rangkaian skincare N&apos;PURE yang tepat untuk kulitmu
              dalam 5 pertanyaan singkat
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✨ Personalisasi berdasarkan jenis &amp; masalah kulit</p>
              <p>🛡️ Pertimbangan keamanan untuk ibu hamil</p>
              <p>💰 Sesuai budget kamu</p>
            </div>
            <button
              onClick={handleStart}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full transition-colors text-lg"
            >
              Mulai Quiz →
            </button>
          </div>
        )}

        {state === 'quiz' && <QuizFlow onComplete={handleComplete} />}

        {state === 'loading' && (
          <div className="text-center space-y-4 py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <p className="text-lg text-muted-foreground font-medium">
              Sedang menganalisis kulitmu...
            </p>
            <p className="text-sm text-muted-foreground/70">
              Mencari produk terbaik untukmu
            </p>
          </div>
        )}

        {state === 'results' && recommendation && answers && (
          <QuizResults
            recommendation={recommendation}
            answers={answers}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
