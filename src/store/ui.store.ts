import { create } from 'zustand'

// UI state ONLY — zero API response data
// SWR handles all server state in hooks/

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void

  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void

  activeModal: string | null
  openModal: (id: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  theme: 'light',
  setTheme: (theme) => set({ theme }),

  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}))
