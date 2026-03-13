import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  username: string
  email: string
  createdAt: string
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isBootstrapping: boolean
  authError: string | null

  setUser: (user: AuthUser | null) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setAuthError: (message: string | null) => void
  setBootstrapping: (value: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isBootstrapping: true,
      authError: null,

      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setAuthError: (authError) => set({ authError }),
      setBootstrapping: (isBootstrapping) => set({ isBootstrapping }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, authError: null }),
    }),
    {
      name: 'terralief-auth',
      // Only persist tokens — not ephemeral state like isBootstrapping / authError
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
