import type { CatalogProduct } from './supabase'
import type { QuizAnswers } from './quiz-config'

const STORAGE_KEY = 'npure_quiz_profile'
const STORAGE_VERSION = 1

export type QuizProfile = QuizAnswers & {
  savedAt: string
  version: number
}

export type MatchTier = 'strong' | 'weak' | 'none'

export type ProductMatch = {
  tier: MatchTier
}

export function saveQuizProfile(answers: QuizAnswers): void {
  if (typeof window === 'undefined') return
  const profile: QuizProfile = {
    ...answers,
    savedAt: new Date().toISOString(),
    version: STORAGE_VERSION,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch (e) {
    console.error('Failed to save quiz profile:', e)
  }
}

export function getQuizProfile(): QuizProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as QuizProfile
    if (parsed.version !== STORAGE_VERSION) return null
    if (!parsed.skinType || !parsed.budget) return null
    return parsed
  } catch {
    return null
  }
}

export function clearQuizProfile(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear quiz profile:', e)
  }
}

export function getProductMatch(
  product: Pick<
    CatalogProduct,
    'skin_types' | 'skin_concerns'
  >,
  profile: QuizProfile
): ProductMatch {
  const types = product.skin_types || []
  const skinTypeMatch =
    types.includes(profile.skinType) ||
    types.includes('all-skin-types') ||
    types.includes('all')

  const productConcerns = product.skin_concerns || []
  const concernMatch = profile.concerns.some((c) =>
    productConcerns.includes(c)
  )

  if (skinTypeMatch && concernMatch) {
    return { tier: 'strong' }
  }
  if (skinTypeMatch || concernMatch) {
    return { tier: 'weak' }
  }
  return { tier: 'none' }
}
