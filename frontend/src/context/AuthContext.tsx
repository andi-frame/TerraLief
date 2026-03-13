import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { authService } from '../services/auth.service'
import { useAuthStore, type AuthUser } from '../store/authStore'
import axios from 'axios'

// ─── Public types (unchanged) ──────────────────────────────────────────────────
interface AuthContextType {
  user: AuthUser | null
  isLoggedIn: boolean
  isBootstrapping: boolean
  authError: string | null
  login: (input: LoginPayload) => Promise<void>
  register: (input: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  username: string
  email: string
  password: string
}

// ─── Auth bypass (dev convenience) ───────────────────────────────────────────
function isAuthBypassEnabled() {
  if (import.meta.env.VITE_BYPASS_AUTH === 'true') return true
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  if (params.get('bypassAuth') === '1') {
    window.localStorage.setItem('terralief-bypass-auth', 'true')
    return true
  }
  return window.localStorage.getItem('terralief-bypass-auth') === 'true'
}

const BYPASS_USER: AuthUser = {
  id: 'bypass-user',
  username: 'frontend_tester',
  email: 'frontend@test.local',
  createdAt: new Date(0).toISOString(),
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authBypassEnabled = isAuthBypassEnabled()

  // Derive all state from Zustand store
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping)
  const authError = useAuthStore((s) => s.authError)
  const { setUser, setTokens, setAuthError, setBootstrapping, clearAuth } = useAuthStore.getState()

  const isLoggedIn = Boolean(user)

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (input: LoginPayload) => {
      if (authBypassEnabled) {
        setAuthError(null)
        setUser(BYPASS_USER)
        return
      }

      try {
        setAuthError(null)
        const result = await authService.login(input)
        setTokens(result.accessToken, result.refreshToken)
        setUser(result.user)
      } catch (error) {
        const message = extractMessage(error, 'Login failed')
        setAuthError(message)
        throw new Error(message)
      }
    },
    [authBypassEnabled],
  )

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(
    async (input: RegisterPayload) => {
      if (authBypassEnabled) {
        setAuthError(null)
        setUser(BYPASS_USER)
        return
      }

      try {
        setAuthError(null)
        await authService.register(input)
        // Auto-login after successful registration
        await login({ email: input.email, password: input.password })
      } catch (error) {
        const message = extractMessage(error, 'Registration failed')
        setAuthError(message)
        throw new Error(message)
      }
    },
    [authBypassEnabled, login],
  )

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (authBypassEnabled) {
      setUser(BYPASS_USER)
      setAuthError(null)
      return
    }

    try {
      await authService.logout()
    } catch {
      // ignore — clear local state regardless
    } finally {
      clearAuth()
    }
  }, [authBypassEnabled])

  // ─── Bootstrap — restore session on page load ─────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      if (authBypassEnabled) {
        setUser(BYPASS_USER)
        setBootstrapping(false)
        return
      }

      if (!accessToken) {
        setBootstrapping(false)
        return
      }

      try {
        const profile = await authService.getMe()
        setUser(profile)
      } catch {
        // getMe failed — axios interceptor will have attempted refresh already;
        // if it still failed the interceptor calls clearAuth(); we just finish bootstrapping
        clearAuth()
      } finally {
        setBootstrapping(false)
      }
    }

    void bootstrap()
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({ user, isLoggedIn, isBootstrapping, authError, login, register, logout }),
    [user, isLoggedIn, isBootstrapping, authError, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    // Backend sends { success: false, error: string }
    const data = error.response?.data as { error?: string } | undefined
    return data?.error ?? error.message ?? fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}
