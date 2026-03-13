import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

interface AuthContextType {
  user: AuthUser | null
  isLoggedIn: boolean
  isBootstrapping: boolean
  authError: string | null
  login: (input: LoginPayload) => Promise<void>
  register: (input: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

interface AuthUser {
  id: string
  username: string
  email: string
  createdAt: string
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

interface AuthApiResult {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

interface RegisterResult {
  id: string
  username: string
  email: string
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const ACCESS_TOKEN_KEY = 'terralief-access-token'
const REFRESH_TOKEN_KEY = 'terralief-refresh-token'

function isAuthBypassEnabled() {
  if (import.meta.env.VITE_BYPASS_AUTH === 'true') {
    return true
  }

  if (typeof window === 'undefined') {
    return false
  }

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

function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL as string
  }

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3001`
  }

  return 'http://localhost:3001'
}

const API_BASE_URL = getApiBaseUrl()

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authBypassEnabled = isAuthBypassEnabled()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const isLoggedIn = Boolean(user)

  const persistTokens = (accessToken: string, refreshToken: string) => {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  const clearTokens = () => {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  const requestJson = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, init).catch(() => {
      throw new Error(`Unable to connect to auth API at ${API_BASE_URL}. Make sure backend is running.`)
    })

    const body = (await response.json().catch(() => ({ success: false }))) as ApiResponse<T>
    if (!response.ok || !body.success || !body.data) {
      throw new Error(body.error ?? `Request failed: ${path}`)
    }

    return body.data
  }

  const login = async (input: LoginPayload) => {
    if (authBypassEnabled) {
      setAuthError(null)
      setUser(BYPASS_USER)
      return
    }

    try {
      setAuthError(null)
      const result = await requestJson<AuthApiResult>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      persistTokens(result.accessToken, result.refreshToken)
      setUser(result.user)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      setAuthError(message)
      throw error
    }
  }

  const register = async (input: RegisterPayload) => {
    if (authBypassEnabled) {
      setAuthError(null)
      setUser(BYPASS_USER)
      return
    }

    try {
      setAuthError(null)
      await requestJson<RegisterResult>('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      await login({ email: input.email, password: input.password })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      setAuthError(message)
      throw error
    }
  }

  const logout = async () => {
    if (authBypassEnabled) {
      setUser(BYPASS_USER)
      setAuthError(null)
      return
    }

    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY)

    if (accessToken) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      }).catch(() => undefined)
    }

    clearTokens()
    setUser(null)
    setAuthError(null)
  }

  useEffect(() => {
    const bootstrap = async () => {
      if (authBypassEnabled) {
        setUser(BYPASS_USER)
        setIsBootstrapping(false)
        return
      }

      const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY)
      if (!accessToken) {
        setIsBootstrapping(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).catch(() => null)

      if (!response || !response.ok) {
        clearTokens()
        setIsBootstrapping(false)
        return
      }

      const body = (await response.json()) as ApiResponse<AuthUser>
      if (body.success && body.data) {
        setUser(body.data)
      } else {
        clearTokens()
      }

      setIsBootstrapping(false)
    }

    void bootstrap()
  }, [authBypassEnabled])

  const value = useMemo(
    () => ({ user, isLoggedIn, isBootstrapping, authError, login, register, logout }),
    [authError, isBootstrapping, isLoggedIn, user],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
