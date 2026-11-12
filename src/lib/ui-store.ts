import { create } from 'zustand'

interface UIState {
  isBurgerOpen: boolean
  openBurger: () => void
  closeBurger: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isBurgerOpen: false,
  openBurger: () => set({ isBurgerOpen: true }),
  closeBurger: () => set({ isBurgerOpen: false }),
}))
