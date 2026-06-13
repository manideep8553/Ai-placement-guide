import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginApi, registerApi, logoutApi, type AuthUser } from '@/services/api'

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<'EMAIL_NOT_FOUND' | 'INVALID_CREDENTIALS' | 'NETWORK_ERROR' | 'SUCCESS'>
  register: (name: string, email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null })
        const result = await loginApi(email, password)
        if (result.error) {
          set({ loading: false })
          if (result.code === 'EMAIL_NOT_FOUND') return 'EMAIL_NOT_FOUND'
          if (result.code === 'INVALID_CREDENTIALS') return 'INVALID_CREDENTIALS'
          return 'NETWORK_ERROR'
        }
        if (result.data) {
          localStorage.setItem('token', result.data.token)
          set({ user: result.data.user, token: result.data.token, loading: false })
          return 'SUCCESS'
        }
        set({ loading: false })
        return 'NETWORK_ERROR'
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null })
        const result = await registerApi(name, email, password)
        if (result.error) {
          set({ loading: false })
          return result.error
        }
        if (result.data) {
          localStorage.setItem('token', result.data.token)
          set({ user: result.data.user, token: result.data.token, loading: false })
          return null
        }
        set({ loading: false })
        return 'Registration failed'
      },

      logout: async () => {
        await logoutApi()
        localStorage.removeItem('token')
        set({ user: null, token: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
