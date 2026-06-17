import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  dark: boolean
  toggleDark: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  emailNotifications: boolean
  setEmailNotifications: (v: boolean) => void
  pushNotifications: boolean
  setPushNotifications: (v: boolean) => void
  interviewReminders: boolean
  setInterviewReminders: (v: boolean) => void
  weeklyReport: boolean
  setWeeklyReport: (v: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      dark: false,
      toggleDark: () => set((state) => ({ dark: !state.dark })),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      emailNotifications: true,
      setEmailNotifications: (v) => set({ emailNotifications: v }),
      pushNotifications: true,
      setPushNotifications: (v) => set({ pushNotifications: v }),
      interviewReminders: true,
      setInterviewReminders: (v) => set({ interviewReminders: v }),
      weeklyReport: false,
      setWeeklyReport: (v) => set({ weeklyReport: v }),
    }),
    { name: 'theme-store' }
  )
)
