// Quiz configuration: types, options, and constants

export type QuizAnswers = {
  skinType: string;
  concerns: string[];
  budget: string;
  routineType: 'minimal' | 'basic' | 'complete';
};

export const SKIN_TYPE_OPTIONS = [
  { value: 'oily', label: 'Berminyak', emoji: '💧', desc: 'Wajah cepat berminyak terutama area T-zone' },
  { value: 'dry', label: 'Kering', emoji: '🏜️', desc: 'Kulit terasa kering, ketarik, atau bersisik' },
  { value: 'combination', label: 'Kombinasi', emoji: '⚡', desc: 'Area T-zone berminyak, pipi kering/normal' },
  { value: 'normal', label: 'Normal', emoji: '✨', desc: 'Kulit seimbang, tidak terlalu berminyak/kering' },
  { value: 'sensitive', label: 'Sensitif', emoji: '🌸', desc: 'Mudah iritasi, kemerahan, atau gatal' },
  { value: 'acne-prone', label: 'Berjerawat', emoji: '🎯', desc: 'Sering berjerawat, komedo, atau tekstur tidak rata' },
];

export const SKIN_CONCERN_OPTIONS = [
  { value: 'acne', label: 'Jerawat', emoji: '🎯' },
  { value: 'dullness', label: 'Kulit Kusam', emoji: '🌫️' },
  { value: 'dark-spots', label: 'Noda Hitam', emoji: '🖤' },
  { value: 'fine-lines', label: 'Garis Halus', emoji: '〰️' },
  { value: 'sensitivity', label: 'Kulit Sensitif', emoji: '🌸' },
  { value: 'excess-oil', label: 'Minyak Berlebih', emoji: '💧' },
  { value: 'large-pores', label: 'Pori Besar', emoji: '⭕' },
  { value: 'dehydrated-skin', label: 'Kulit Kering', emoji: '🌵' },
];

export const BUDGET_OPTIONS = [
  { value: 'under-50k', label: 'Di bawah Rp50.000', maxPrice: 50000 },
  { value: '50k-100k', label: 'Rp50.000 - Rp100.000', maxPrice: 100000 },
  { value: '100k-200k', label: 'Rp100.000 - Rp200.000', maxPrice: 200000 },
  { value: 'over-200k', label: 'Di atas Rp200.000', maxPrice: 999999 },
];

export const ROUTINE_TYPE_OPTIONS = [
  {
    value: 'minimal',
    label: 'Minimal (3 Langkah)',
    desc: 'Cleanser + Moisturizer + Sunscreen',
    steps: ['cleanser', 'moisturizer', 'sunscreen'],
  },
  {
    value: 'basic',
    label: 'Basic (4 Langkah)',
    desc: 'Cleanser + Toner + Moisturizer + Sunscreen',
    steps: ['cleanser', 'toner', 'moisturizer', 'sunscreen'],
  },
  {
    value: 'complete',
    label: 'Lengkap (5+ Langkah)',
    desc: 'Full routine dengan serum, eksfoliator & mask',
    steps: ['first-cleanser', 'cleanser', 'toner', 'exfoliator', 'serum', 'moisturizer', 'sunscreen', 'spot-treatment', 'mask'],
  },
];

export const ROUTINE_STEP_LABELS: Record<string, { label: string; emoji: string; order: number }> = {
  'first-cleanser': { label: 'Pembersih Pertama', emoji: '💧', order: 1 },
  'cleanser': { label: 'Pembersih Wajah', emoji: '🧼', order: 2 },
  'toner': { label: 'Toner', emoji: '💦', order: 3 },
  'exfoliator': { label: 'Eksfoliator', emoji: '✨', order: 4 },
  'serum': { label: 'Serum', emoji: '🔬', order: 5 },
  'moisturizer': { label: 'Pelembap', emoji: '🧴', order: 6 },
  'sunscreen': { label: 'Tabir Surya', emoji: '☀️', order: 7 },
  'spot-treatment': { label: 'Totol Jerawat', emoji: '🎯', order: 8 },
  'mask': { label: 'Masker', emoji: '🎭', order: 9 },
  'eye-care': { label: 'Perawatan Mata', emoji: '👁️', order: 10 },
  'body-treatment': { label: 'Perawatan Tubuh', emoji: '🧴', order: 11 },
  'lip-care': { label: 'Perawatan Bibir', emoji: '💋', order: 14 },
  'body-wash': { label: 'Sabun Tubuh', emoji: '🚿', order: 12 },
  'body-lotion': { label: 'Lotion Tubuh', emoji: '💆', order: 13 },
};
