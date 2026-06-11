import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  dark: boolean
  toggleDark: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      dark: false,
      toggleDark: () => set((state) => ({ dark: !state.dark })),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    { name: 'theme-store' }
  )
)
