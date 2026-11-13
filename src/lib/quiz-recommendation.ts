import { supabase } from './supabase';
import {
  QuizAnswers,
  BUDGET_OPTIONS,
  ROUTINE_TYPE_OPTIONS,
  ROUTINE_STEP_LABELS,
} from './quiz-config';

export type QuizProduct = {
  slug: string;
  name: string;
  description: string | null;
  key_ingredients: string | null;
  how_to_use: string | null;
  warnings: string | null;
  bpom_number: string | null;
  netto: string | null;
  skin_types: string[] | null;
  skin_concerns: string[] | null;
  key_benefits: string[] | null;
  routine_step: string | null;
  pregnancy_safe: boolean;
  age_recommendation: string | null;
  image_url_1: string | null;
  current_price: number;
  current_stock: number;
  in_stock: boolean;
};

export type RoutineStepRecommendation = {
  step: string;
  label: string;
  emoji: string;
  order: number;
  products: QuizProduct[];
};

export type QuizRecommendation = {
  answers: QuizAnswers;
  steps: RoutineStepRecommendation[];
  totalProducts: number;
};

export async function getQuizRecommendations(
  answers: QuizAnswers
): Promise<QuizRecommendation> {
  const budgetOption = BUDGET_OPTIONS.find((b) => b.value === answers.budget);
  const maxPrice = budgetOption?.maxPrice ?? 999999;

  const routineOption = ROUTINE_TYPE_OPTIONS.find(
    (r) => r.value === answers.routineType
  );
  const targetSteps = routineOption?.steps ?? [
    'cleanser',
    'moisturizer',
    'sunscreen',
  ];

  // Step 1: Query all in-stock products with pregnancy + budget filters
  let query = supabase
    .from('v_catalog_products')
    .select('*')
    .eq('in_stock', true);

  if (answers.pregnant) {
    query = query.eq('pregnancy_safe', true);
  }

  if (maxPrice < 999999) {
    query = query.lte('current_price', maxPrice);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Quiz recommendation error:', error);
    return { answers, steps: [], totalProducts: 0 };
  }

  // Step 2: Filter by skin type in JS (include 'all-skin-types' and 'all')
  const skinTypeMatch = (product: any) => {
    const types = product.skin_types || [];
    return (
      types.includes(answers.skinType) ||
      types.includes('all-skin-types') ||
      types.includes('all')
    );
  };

  let products = data.filter(skinTypeMatch);

  // Fallback: if too few matches, use all products
  if (products.length < 3) {
    products = data;
  }

  // Step 3: Calculate concern match score for ranking
  const scored = products.map((p: any) => {
    const productConcerns = p.skin_concerns || [];
    const matchCount = answers.concerns.filter((c) =>
      productConcerns.includes(c)
    ).length;
    return { ...p, _matchScore: matchCount };
  });

  // Sort by match score (desc), then price (asc)
  scored.sort((a, b) => {
    if (b._matchScore !== a._matchScore)
      return b._matchScore - a._matchScore;
    return (a.current_price || 0) - (b.current_price || 0);
  });

  // Step 4: Group by routine_step
  const byStep: Record<string, any[]> = {};
  for (const p of scored) {
    const step = p.routine_step;
    if (!step) continue;
    if (!byStep[step]) byStep[step] = [];
    byStep[step].push(p);
  }

  // Step 5: Build recommendations for target steps (top 2 per step)
  const steps: RoutineStepRecommendation[] = [];
  for (const step of targetSteps) {
    const stepProducts = byStep[step] || [];
    if (stepProducts.length === 0) continue;

    const labelInfo = ROUTINE_STEP_LABELS[step] || {
      label: step,
      emoji: '📦',
      order: 99,
    };

    const topProducts = stepProducts.slice(0, 2);

    steps.push({
      step,
      label: labelInfo.label,
      emoji: labelInfo.emoji,
      order: labelInfo.order,
      products: topProducts.map((p: any) => ({
        slug: p.slug,
        name: p.name,
        description: p.description,
        key_ingredients: p.key_ingredients,
        how_to_use: p.how_to_use,
        warnings: p.warnings,
        bpom_number: p.bpom_number,
        netto: p.netto,
        skin_types: p.skin_types,
        skin_concerns: p.skin_concerns,
        key_benefits: p.key_benefits,
        routine_step: p.routine_step,
        pregnancy_safe: p.pregnancy_safe,
        age_recommendation: p.age_recommendation,
        image_url_1: p.image_url_1,
        current_price: p.current_price || 0,
        current_stock: p.current_stock || 0,
        in_stock: p.in_stock,
      })),
    });
  }

  // Sort steps by routine order
  steps.sort((a, b) => a.order - b.order);

  const totalProducts = steps.reduce(
    (sum, s) => sum + s.products.length,
    0
  );

  return { answers, steps, totalProducts };
}
