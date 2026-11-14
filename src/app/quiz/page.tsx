'use client';

import { useState, useEffect } from 'react';
import { CatalogHeader } from '@/components/catalog/CatalogHeader';
import { FloatingActions } from '@/components/catalog/FloatingActions';
import { QuizFlow } from '@/components/quiz/QuizFlow';
import { QuizResults } from '@/components/quiz/QuizResults';
import { QuizAnswers } from '@/lib/quiz-config';
import {
  getQuizRecommendations,
  QuizRecommendation,
} from '@/lib/quiz-recommendation';
import {
  getCatalogSettings,
  type CatalogSettings,
} from '@/lib/supabase';

const NPURE_LOGO_URL =
  'https://foiteplkbfwwjshykpgj.supabase.co/storage/v1/object/public/npure-assets/NPURE-Logo-White-1.png';

const FALLBACK_SETTINGS: CatalogSettings = {
  id: 1,
  brand_name: 'NPURE E-Katalog by Elsa',
  tagline: 'Skincare sehat untuk kulit sehat',
  footer_text: 'Dikelola oleh BA NPURE (Elsa) di toko Najmia Unnes',
  whatsapp_number: '6281575859792',
  whatsapp_default_message:
    'Halo Elsa, saya mau tanya produk NPURE yang ada di katalog:',
  tiktok_url: 'https://www.tiktok.com/@slvqueengreentea',
  instagram_url: null,
  shipping_info: null,
  disclaimer_text:
    'Produk resmi NPURE. E-katalog ini dikelola oleh BA NPURE (Elsa) di toko Najmia Unnes.',
  is_active: true,
};

type QuizPageState = 'intro' | 'quiz' | 'loading' | 'results';

export default function QuizPage() {
  const [state, setState] = useState<QuizPageState>('intro');
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [recommendation, setRecommendation] =
    useState<QuizRecommendation | null>(null);
  const [settings, setSettings] = useState<CatalogSettings>(FALLBACK_SETTINGS);

  useEffect(() => {
    getCatalogSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/5 to-background">
      <CatalogHeader
        brandName={settings.brand_name}
        tagline={settings.tagline}
        tiktokUrl={settings.tiktok_url}
        logoUrl={NPURE_LOGO_URL}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:py-12">
        {state === 'intro' && (
          <div className="text-center space-y-6">
            <div className="text-6xl">🌿</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Skincare Quiz
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Temukan rangkaian skincare N&apos;PURE yang tepat untuk kulitmu
              dalam 4 pertanyaan singkat
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✨ Personalisasi berdasarkan jenis &amp; masalah kulit</p>
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
      </main>

      <FloatingActions
        waNumber={settings.whatsapp_number}
        defaultMsg={settings.whatsapp_default_message}
        tiktokUrl={settings.tiktok_url}
      />
    </div>
  );
}
