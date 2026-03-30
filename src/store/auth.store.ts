import { create } from 'zustand'
import type { User } from '@/types/auth'

interface AuthState {
  user: User | null
  /** False until the initial /api/auth/me check resolves — prevents auth flash on load */
  isHydrated: boolean
  setUser: (user: User) => void
  clearUser: () => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setHydrated: () => set({ isHydrated: true }),
}))
